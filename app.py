import os
import uuid
import traceback

import numpy as np
import tensorflow as tf
import mysql.connector

from flask import (
    Flask,
    render_template,
    request,
    jsonify,
    send_from_directory,
    url_for
)

from werkzeug.utils import secure_filename

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input


# ============================================================
# PROJECT PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

TEMPLATE_DIR = os.path.join(
    BASE_DIR,
    "templates"
)

STATIC_DIR = os.path.join(
    BASE_DIR,
    "static"
)

UPLOAD_DIR = os.path.join(
    BASE_DIR,
    "uploads"
)

RESULT_DIR = os.path.join(
    STATIC_DIR,
    "results"
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "brain_tumor_mri_classifier.keras"
)


# ============================================================
# CREATE REQUIRED DIRECTORIES
# ============================================================

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)

os.makedirs(
    RESULT_DIR,
    exist_ok=True
)


# ============================================================
# FLASK APP
# ============================================================

app = Flask(
    __name__,
    template_folder=TEMPLATE_DIR,
    static_folder=STATIC_DIR
)


# ============================================================
# UPLOAD SETTINGS
# ============================================================

ALLOWED_EXTENSIONS = {
    "png",
    "jpg",
    "jpeg",
    "webp"
}

app.config["MAX_CONTENT_LENGTH"] = (
    16 * 1024 * 1024
)


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "",
    "database": "brain_tumor_db"
}


# ============================================================
# DATABASE SAVE FUNCTION
# ============================================================

def save_analysis_record(
    image_name,
    prediction,
    confidence,
    image_path
):

    connection = None
    cursor = None

    try:

        connection = mysql.connector.connect(
            host=DB_CONFIG["host"],
            port=DB_CONFIG["port"],
            user=DB_CONFIG["user"],
            password=DB_CONFIG["password"],
            database=DB_CONFIG["database"]
        )

        cursor = connection.cursor()

        query = """
            INSERT INTO mri_analysis
            (
                image_name,
                prediction,
                confidence,
                model_version,
                image_path
            )
            VALUES (%s, %s, %s, %s, %s)
        """

        values = (
            image_name,
            prediction,
            confidence,
            "MobileNetV2-v1",
            image_path
        )

        cursor.execute(
            query,
            values
        )

        connection.commit()

        record_id = cursor.lastrowid

        print()
        print(
            "MRI analysis saved to database."
        )
        print(
            "Record ID:",
            record_id
        )
        print()

        return record_id

    except Exception as e:

        print()
        print(
            "DATABASE ERROR:"
        )
        print(e)

        traceback.print_exc()

        print()

        return None

    finally:

        if cursor is not None:
            cursor.close()

        if connection is not None:
            connection.close()


# ============================================================
# MODEL CONFIGURATION
# ============================================================

CLASS_NAMES = [
    "glioma",
    "meningioma",
    "notumor",
    "pituitary"
]

IMAGE_SIZE = (
    224,
    224
)

MODEL_ACCURACY = 83.13


# ============================================================
# DATASET INFORMATION
# ============================================================

DATASET_TOTAL = 7200
TRAINING_IMAGES = 5600
VALIDATION_IMAGES = 1120
TESTING_IMAGES = 1600


# ============================================================
# LOAD MODEL
# ============================================================

print()
print(
    "Loading brain tumor classification model..."
)

model = load_model(
    MODEL_PATH
)

print(
    "Model loaded successfully."
)

print()


# ============================================================
# FILE VALIDATION
# ============================================================

def allowed_file(filename):

    return (
        "." in filename
        and
        filename.rsplit(
            ".",
            1
        )[1].lower()
        in ALLOWED_EXTENSIONS
    )


# ============================================================
# CLASS NAME FORMATTER
# ============================================================

def format_class_name(class_name):

    class_map = {

        "glioma": "Glioma",

        "meningioma": "Meningioma",

        "notumor": "No Tumor",

        "pituitary": "Pituitary"
    }

    return class_map.get(
        class_name,
        class_name.title()
    )


# ============================================================
# IMAGE PREPROCESSING
# ============================================================

def preprocess_image(
    image_path
):

    img = image.load_img(
        image_path,
        target_size=IMAGE_SIZE,
        color_mode="rgb"
    )

    img_array = image.img_to_array(
        img
    )

    img_array = np.expand_dims(
        img_array,
        axis=0
    )

    img_array = preprocess_input(
        img_array
    )

    return img_array


# ============================================================
# MODEL PREDICTION
# ============================================================

def predict_mri(
    image_path
):

    processed_image = preprocess_image(
        image_path
    )

    predictions = model.predict(
        processed_image,
        verbose=0
    )

    probabilities = predictions[0]

    predicted_index = int(
        np.argmax(
            probabilities
        )
    )

    predicted_class = CLASS_NAMES[
        predicted_index
    ]

    confidence = float(
        probabilities[
            predicted_index
        ] * 100
    )

    probability_dict = {}

    for index, class_name in enumerate(
        CLASS_NAMES
    ):

        probability_dict[
            format_class_name(
                class_name
            )
        ] = round(
            float(
                probabilities[index] * 100
            ),
            2
        )

    return (
        predicted_class,
        confidence,
        probability_dict
    )


# ============================================================
# GRAD-CAM
# ============================================================

def make_gradcam_heatmap(
    img_array,
    grad_model,
    pred_index=None
):

    with tf.GradientTape() as tape:

        last_conv_layer_output, predictions = (
            grad_model(img_array)
        )

        if pred_index is None:

            pred_index = tf.argmax(
                predictions[0]
            )

        class_channel = predictions[
            :,
            pred_index
        ]

    grads = tape.gradient(
        class_channel,
        last_conv_layer_output
    )

    pooled_grads = tf.reduce_mean(
        grads,
        axis=(0, 1, 2)
    )

    last_conv_layer_output = (
        last_conv_layer_output[0]
    )

    heatmap = (
        last_conv_layer_output
        @ pooled_grads[..., tf.newaxis]
    )

    heatmap = tf.squeeze(
        heatmap
    )

    heatmap = tf.maximum(
        heatmap,
        0
    )

    max_value = tf.reduce_max(
        heatmap
    )

    if max_value != 0:

        heatmap /= max_value

    return heatmap.numpy()


# ============================================================
# FIND MOBILE NET V2 BASE MODEL
# ============================================================

def find_mobilenet_base(
    keras_model
):

    for layer in keras_model.layers:

        if (
            isinstance(
                layer,
                tf.keras.Model
            )
            and
            "mobilenet" in layer.name.lower()
        ):

            return layer

    return None


# ============================================================
# GENERATE GRAD-CAM
# ============================================================

def generate_gradcam(
    image_path,
    predicted_index
):

    try:

        img_array = preprocess_image(
            image_path
        )

        base_model = find_mobilenet_base(
            model
        )

        if base_model is None:

            print(
                "MobileNetV2 base model not found."
            )

            return None


        grad_model = tf.keras.models.Model(
            inputs=base_model.input,
            outputs=[
                base_model.get_layer(
                    "Conv_1"
                ).output,
                model.output
            ]
        )


        heatmap = make_gradcam_heatmap(
            img_array,
            grad_model,
            predicted_index
        )

        return heatmap

    except Exception as e:

        print()
        print(
            "GRAD-CAM ERROR:"
        )
        print(e)

        traceback.print_exc()

        print()

        return None


# ============================================================
# HOME / DASHBOARD
# ============================================================

@app.route("/")
def dashboard():

    return render_template(
        "dashboard.html"
    )


# ============================================================
# MRI ANALYZER
# ============================================================

@app.route("/analyzer")
def analyzer():

    return render_template(
        "analyzer.html"
    )


# ============================================================
# INSIGHTS DASHBOARD
# ============================================================

@app.route("/insights")
def insights():

    connection = None
    cursor = None


    # ========================================================
    # PAGINATION
    # ========================================================

    per_page = 14

    try:

        page = int(
            request.args.get(
                "page",
                1
            )
        )

    except (
        TypeError,
        ValueError
    ):

        page = 1


    if page < 1:

        page = 1


    # ========================================================
    # DEFAULT STATISTICS
    # ========================================================

    stats = {

        "total": 0,

        "glioma": 0,

        "meningioma": 0,

        "notumor": 0,

        "pituitary": 0,

        "avg_confidence": 0
    }


    recent_analyses = []


    # ========================================================
    # PREDICTION DISTRIBUTION
    # ========================================================

    prediction_distribution = {

        "Glioma": 0,

        "Meningioma": 0,

        "No Tumor": 0,

        "Pituitary": 0
    }


    total_pages = 1


    try:

        connection = mysql.connector.connect(

            host=DB_CONFIG["host"],

            port=DB_CONFIG["port"],

            user=DB_CONFIG["user"],

            password=DB_CONFIG["password"],

            database=DB_CONFIG["database"]
        )


        cursor = connection.cursor(
            dictionary=True
        )


        # ====================================================
        # TOTAL ANALYSES
        # ====================================================

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM mri_analysis
        """)

        total_result = cursor.fetchone()

        stats["total"] = (
            total_result["total"]
            or 0
        )


        # ====================================================
        # PREDICTION COUNTS
        # ====================================================

        cursor.execute("""
            SELECT
                LOWER(prediction) AS prediction,
                COUNT(*) AS count
            FROM mri_analysis
            GROUP BY LOWER(prediction)
        """)

        prediction_rows = cursor.fetchall()


        for row in prediction_rows:

            prediction = row[
                "prediction"
            ]

            count = row[
                "count"
            ]


            if prediction == "glioma":

                stats["glioma"] = count

                prediction_distribution[
                    "Glioma"
                ] = count


            elif prediction == "meningioma":

                stats["meningioma"] = count

                prediction_distribution[
                    "Meningioma"
                ] = count


            elif prediction == "notumor":

                stats["notumor"] = count

                prediction_distribution[
                    "No Tumor"
                ] = count


            elif prediction == "pituitary":

                stats["pituitary"] = count

                prediction_distribution[
                    "Pituitary"
                ] = count


        # ====================================================
        # AVERAGE CONFIDENCE
        # ====================================================

        cursor.execute("""
            SELECT
                AVG(confidence) AS avg_confidence
            FROM mri_analysis
        """)

        confidence_result = (
            cursor.fetchone()
        )


        if (
            confidence_result[
                "avg_confidence"
            ]
            is not None
        ):

            stats["avg_confidence"] = round(

                float(
                    confidence_result[
                        "avg_confidence"
                    ]
                ),

                2
            )


        # ====================================================
        # CALCULATE TOTAL PAGES
        # ====================================================

        total_records = stats[
            "total"
        ]

        total_pages = max(

            1,

            (
                total_records
                + per_page
                - 1
            )
            // per_page
        )


        # ====================================================
        # PROTECT INVALID PAGE NUMBER
        # ====================================================

        if page > total_pages:

            page = total_pages


        # ====================================================
        # CALCULATE OFFSET
        # ====================================================

        offset = (
            page - 1
        ) * per_page


        # ====================================================
        # FETCH 14 RECORDS
        # ASCENDING ID ORDER
        # ====================================================

        cursor.execute("""
            SELECT
                id,
                image_name,
                prediction,
                confidence,
                model_version,
                analyzed_at
            FROM mri_analysis
            ORDER BY id ASC
            LIMIT %s OFFSET %s
        """, (
            per_page,
            offset
        ))


        recent_analyses = (
            cursor.fetchall()
        )


    except Exception as e:

        print()
        print(
            "INSIGHTS DATABASE ERROR:"
        )

        print(e)

        traceback.print_exc()

        print()


    finally:

        if cursor is not None:

            cursor.close()


        if connection is not None:

            connection.close()


    # ========================================================
    # SEND DATA TO INSIGHTS.HTML
    # ========================================================

    return render_template(

        "insights.html",

        stats=stats,

        recent_analyses=recent_analyses,

        page=page,

        per_page=per_page,

        total_pages=total_pages,

        prediction_distribution=(
            prediction_distribution
        )
    )


# ============================================================
# ABOUT / EXPLAINABILITY
# ============================================================

@app.route("/about")
def about():

    return render_template(
        "about.html"
    )


# ============================================================
# MRI PREDICTION API
# ============================================================

@app.route(
    "/api/predict",
    methods=["POST"]
)
def api_predict():

    try:

        # ----------------------------------------------------
        # CHECK FILE
        # ----------------------------------------------------

        if "file" not in request.files:

            return jsonify({
                "success": False,
                "error": "No file uploaded."
            }), 400


        uploaded_file = request.files[
            "file"
        ]


        if uploaded_file.filename == "":

            return jsonify({
                "success": False,
                "error": "No file selected."
            }), 400


        # ----------------------------------------------------
        # VALIDATE EXTENSION
        # ----------------------------------------------------

        if not allowed_file(
            uploaded_file.filename
        ):

            return jsonify({
                "success": False,
                "error": (
                    "Invalid file type. "
                    "Please upload PNG, JPG, "
                    "JPEG or WEBP."
                )
            }), 400


        # ----------------------------------------------------
        # SECURE ORIGINAL NAME
        # ----------------------------------------------------

        original_name = secure_filename(
            uploaded_file.filename
        )


        if not original_name:

            return jsonify({
                "success": False,
                "error": "Invalid filename."
            }), 400


        # ----------------------------------------------------
        # CREATE UNIQUE FILE NAME
        # ----------------------------------------------------

        extension = os.path.splitext(
            original_name
        )[1].lower()


        unique_name = (
            uuid.uuid4().hex
            + extension
        )


        upload_path = os.path.join(
            UPLOAD_DIR,
            unique_name
        )


        # ----------------------------------------------------
        # SAVE IMAGE
        # ----------------------------------------------------

        uploaded_file.save(
            upload_path
        )


        # ----------------------------------------------------
        # PREDICTION
        # ----------------------------------------------------

        (
            predicted_class,
            confidence,
            probabilities
        ) = predict_mri(
            upload_path
        )


        predicted_index = (
            CLASS_NAMES.index(
                predicted_class
            )
        )


        # ----------------------------------------------------
        # GRAD-CAM
        # ----------------------------------------------------

        heatmap = generate_gradcam(
            upload_path,
            predicted_index
        )


        # ----------------------------------------------------
        # DATABASE IMAGE PATH
        # ----------------------------------------------------

        database_image_path = os.path.join(
            "uploads",
            unique_name
        ).replace(
            "\\",
            "/"
        )


        # ----------------------------------------------------
        # SAVE DATABASE RECORD
        # ----------------------------------------------------

        record_id = save_analysis_record(

            image_name=original_name,

            prediction=predicted_class,

            confidence=round(
                confidence,
                2
            ),

            image_path=database_image_path
        )


        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return jsonify({

            "success": True,

            "record_id": record_id,

            "prediction": (
                format_class_name(
                    predicted_class
                )
            ),

            "confidence": round(
                confidence,
                2
            ),

            "probabilities": probabilities,

            "image_url": url_for(
                "uploaded_file",
                filename=unique_name
            ),

            "gradcam_available": (
                heatmap is not None
            ),

            "model_name": "MobileNetV2",

            "model_accuracy": (
                MODEL_ACCURACY
            )
        })


    except Exception as e:

        print()
        print(
            "PREDICTION ERROR:"
        )

        print(e)

        traceback.print_exc()

        print()


        return jsonify({

            "success": False,

            "error": (
                "An error occurred "
                "during MRI analysis."
            )

        }), 500


# ============================================================
# SERVE UPLOADED FILES
# ============================================================

@app.route(
    "/uploads/<filename>"
)
def uploaded_file(
    filename
):

    return send_from_directory(
        UPLOAD_DIR,
        filename
    )


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/health")
def health():

    return jsonify({
        "status": "ok"
    })


# ============================================================
# RUN APPLICATION
# ============================================================

if __name__ == "__main__":

    app.run(

        host="127.0.0.1",

        port=5000,

        debug=True
    )