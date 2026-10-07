# 🧠 Brain Tumor MRI Classification

A deep learning-based web application for classifying brain MRI images into four categories: **Glioma, Meningioma, No Tumor, and Pituitary Tumor**.

The application uses **TensorFlow/Keras and MobileNetV2** for image classification and provides prediction confidence through a user-friendly **Flask web interface**. Analysis records are stored in **MySQL** for historical tracking and insights.

> **Disclaimer:** This project is developed for educational, research, and portfolio purposes only. It is not intended to provide medical diagnosis or replace professional medical advice.
> ## 🚀 Key Features

- 🧠 **Brain MRI Classification** — Classifies MRI images into four categories:
  - Glioma
  - Meningioma
  - No Tumor
  - Pituitary Tumor

- 🤖 **MobileNetV2 Transfer Learning** — Uses a pretrained MobileNetV2 architecture for efficient image classification.

- 📊 **Prediction Confidence** — Displays the predicted class along with the model's confidence score.

- 🔬 **Grad-CAM Explainability** — Generates visual explanations to highlight image regions that contribute to the model's prediction.

- 🌐 **Flask Web Application** — Provides a clean web interface for uploading and analyzing MRI images.

- 🗄️ **MySQL Database** — Stores MRI analysis records, predictions, confidence scores, model version, and analysis timestamps.

- 📈 **Analytics Dashboard** — Displays model and dataset information along with historical MRI analysis records.

- 📄 **Paginated Analysis History** — Shows analysis records in an organized 14-record-per-page format.

- 🩻 **Image Preprocessing** — Resizes and preprocesses uploaded MRI images before sending them to the deep learning model.

- ❤️ **Healthcare AI Portfolio Project** — Demonstrates practical implementation of Deep Learning, Computer Vision, Explainable AI, Flask, and Database integration.
- ## 🛠️ Technology Stack

### Programming Language
- **Python 3.12**

### Machine Learning & Deep Learning
- **TensorFlow / Keras**
- **MobileNetV2**
- **Transfer Learning**
- **Scikit-learn**

### Data Processing
- **NumPy**
- **Pandas**
- **Pillow**

### Web Development
- **Flask**
- **HTML5**
- **CSS3**
- **JavaScript**

### Database
- **MySQL / MariaDB**

### Explainable AI
- **Grad-CAM (Gradient-weighted Class Activation Mapping)**

### Development Environment
- **Windows**
- **Google Colab** for model development and experimentation
- **Git & GitHub** for version control
- ## 📊 Dataset

The project uses a brain MRI image dataset containing **7,200 images** across four classes.

| Class | Training | Testing | Total |
|---|---:|---:|---:|
| Glioma | 1,400 | 400 | 1,800 |
| Meningioma | 1,400 | 400 | 1,800 |
| No Tumor | 1,400 | 400 | 1,800 |
| Pituitary | 1,400 | 400 | 1,800 |
| **Total** | **5,600** | **1,600** | **7,200** |

### Dataset Split

- **Training:** 5,600 images
- **Validation:** 1,120 images
- **Testing:** 1,600 images
- **Number of classes:** 4
- **Input image size:** 224 × 224 pixels

## 📈 Model Performance

The trained **MobileNetV2** classification model achieved:

| Metric | Result |
|---|---:|
| Test Accuracy | **83.13%** |

### Classification Performance

| Class | Precision | Recall | F1-Score |
|---|---:|---:|---:|
| Glioma | 93.55% | 65.25% | 76.88% |
| Meningioma | 75.00% | 71.25% | 73.08% |
| No Tumor | 86.53% | 98.00% | 91.91% |
| Pituitary | 80.33% | 98.00% | 88.29% |

> **Note:** These metrics represent the performance of this specific trained model on the project's test dataset and should not be interpreted as clinical performance.
>
> ## 🔄 System Workflow

The application follows this workflow:

```text
MRI Image Upload
       ↓
Image Validation
       ↓
Image Preprocessing
       ↓
MobileNetV2 Model
       ↓
4-Class Classification
       ↓
Prediction + Confidence Score
       ↓
Grad-CAM Explanation
       ↓
Save Analysis to MySQL
       ↓
Display Result on Flask Dashboard
```

### Prediction Pipeline

1. **Upload MRI Image**  
   The user uploads an MRI image through the Flask web interface.

2. **Image Validation**  
   The application validates the uploaded file and supported image format.

3. **Image Preprocessing**  
   The image is resized to **224 × 224 pixels** and preprocessed according to the MobileNetV2 input requirements.

4. **Deep Learning Prediction**  
   The processed image is passed to the trained MobileNetV2 model.

5. **Classification**  
   The model predicts one of four classes:
   - Glioma
   - Meningioma
   - No Tumor
   - Pituitary Tumor

6. **Confidence Score**  
   The application calculates and displays the prediction confidence.

7. **Explainability**  
   Grad-CAM is used to generate a visual explanation of the model's prediction when available.

8. **Database Storage**  
   The prediction, confidence score, image name, model version, and analysis timestamp are stored in MySQL.

9. **Analytics & History**  
   Stored analysis records are displayed on the Insights page for historical tracking and analysis.
## 📁 Project Structure

```text
brain-tumor-mri-classification/
│
├── app.py
├── README.md
├── .gitignore
│
├── static/
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   └── dashboard.js
│   │
│   └── images/
│       └── brain.png
│
└── templates/
    ├── dashboard.html
    ├── analyzer.html
    ├── insights.html
    └── about.html
```

### Main Components

| Component | Description |
|---|---|
| `app.py` | Flask application, model prediction, Grad-CAM, API routes, and MySQL integration |
| `templates/` | HTML pages for the web application |
| `static/css/` | Application styling |
| `static/js/` | JavaScript functionality for the web interface |
| `static/images/` | Static images used by the application |
| `README.md` | Project documentation |
| `.gitignore` | Prevents datasets, models, environments, uploads, and other unnecessary files from being committed |

### Application Pages

- **Dashboard** — Project overview and system information
- **MRI Analysis** — Upload and analyze MRI images
- **Insights** — View model information and stored analysis records
- **About** — Project and technology information   
