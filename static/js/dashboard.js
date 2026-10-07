/* =========================================================
   BrainAI - Brain Tumor MRI Classification
   Complete Frontend JavaScript
   ========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
   ========================================================= */

const BrainAI = {

    API_ENDPOINT: "/api/predict",

    MAX_FILE_SIZE: 16 * 1024 * 1024,

    ALLOWED_TYPES: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ],

    ALLOWED_EXTENSIONS: [
        "jpg",
        "jpeg",
        "png",
        "webp"
    ],

    CLASS_NAMES: [
        "Glioma",
        "Meningioma",
        "No Tumor",
        "Pituitary"
    ]

};


/* =========================================================
   GLOBAL STATE
   ========================================================= */

const BrainAIState = {

    selectedFile: null,

    isAnalyzing: false,

    lastPrediction: null

};


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "BrainAI: DOM ready"
        );

        initializeNavigation();

        initializeMobileMenu();

        initializePage();

        initializeGlobalInteractions();

    }
);


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

function initializePage() {

    const path =
        window.location.pathname;

    console.log(
        "BrainAI page:",
        path
    );


    /* -----------------------------------------------------
       ANALYZER
       ----------------------------------------------------- */

    if (
        path === "/analyzer" ||
        document.querySelector("#mriAnalyzer")
    ) {

        initializeAnalyzer();

    }


    /* -----------------------------------------------------
       PREDICTION
       ----------------------------------------------------- */

    if (
        path === "/predict" ||
        document.querySelector("#predictionPage")
    ) {

        initializePredictionPage();

    }


    /* -----------------------------------------------------
       INSIGHTS
       ----------------------------------------------------- */

    if (
        path === "/insights" ||
        document.querySelector("#insightsPage")
    ) {

        initializeInsightsPage();

    }


    /* -----------------------------------------------------
       ABOUT
       ----------------------------------------------------- */

    if (
        path === "/about" ||
        document.querySelector("#aboutPage")
    ) {

        initializeAboutPage();

    }


    /* -----------------------------------------------------
       DASHBOARD
       ----------------------------------------------------- */

    if (
        path === "/" ||
        document.querySelector("#dashboardPage")
    ) {

        initializeDashboard();

    }

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function initializeNavigation() {

    const links =
        document.querySelectorAll(
            ".sidebar-link"
        );

    if (!links.length) {
        return;
    }


    const currentPath =
        window.location.pathname;


    links.forEach(
        link => {

            const href =
                link.getAttribute(
                    "href"
                );

            if (!href) {
                return;
            }


            link.classList.remove(
                "active"
            );


            /* Dashboard */

            if (
                href === "/" &&
                currentPath === "/"
            ) {

                link.classList.add(
                    "active"
                );

            }


            /* Other pages */

            else if (
                href !== "/" &&
                currentPath.startsWith(
                    href
                )
            ) {

                link.classList.add(
                    "active"
                );

            }


            /* Click */

            link.addEventListener(
                "click",
                () => {

                    links.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    link.classList.add(
                        "active"
                    );

                }
            );

        }
    );

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function initializeMobileMenu() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );

    const menuButton =
        document.querySelector(
            ".mobile-menu-button"
        );

    const overlay =
        document.querySelector(
            ".sidebar-overlay"
        );


    if (
        !sidebar ||
        !menuButton
    ) {

        return;

    }


    menuButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            sidebar.classList.toggle(
                "mobile-open"
            );


            if (overlay) {

                overlay.classList.toggle(
                    "visible"
                );

            }

        }
    );


    if (overlay) {

        overlay.addEventListener(
            "click",
            () => {

                sidebar.classList.remove(
                    "mobile-open"
                );

                overlay.classList.remove(
                    "visible"
                );

            }
        );

    }

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function initializeDashboard() {

    console.log(
        "BrainAI Dashboard initialized"
    );


    initializeCounters();

    initializeRevealAnimations();


    const analyzerButtons =
        document.querySelectorAll(
            "[data-go-analyzer]"
        );


    analyzerButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "/analyzer";

                }
            );

        }
    );

}


/* =========================================================
   COUNTERS
   ========================================================= */

function initializeCounters() {

    const counters =
        document.querySelectorAll(
            "[data-counter]"
        );


    if (!counters.length) {
        return;
    }


    counters.forEach(
        counter => {

            const target =
                parseFloat(
                    counter.dataset.counter
                );


            if (
                Number.isNaN(
                    target
                )
            ) {

                return;

            }


            const duration = 1000;

            const startTime =
                performance.now();


            function update(
                currentTime
            ) {

                const elapsed =
                    currentTime -
                    startTime;


                const progress =
                    Math.min(
                        elapsed /
                        duration,
                        1
                    );


                const eased =
                    1 -
                    Math.pow(
                        1 - progress,
                        3
                    );


                const value =
                    target *
                    eased;


                counter.textContent =
                    formatCounterValue(
                        value,
                        target
                    );


                if (
                    progress < 1
                ) {

                    requestAnimationFrame(
                        update
                    );

                }

            }


            requestAnimationFrame(
                update
            );

        }
    );

}


/* =========================================================
   COUNTER FORMAT
   ========================================================= */

function formatCounterValue(
    value,
    target
) {

    if (
        Number.isInteger(
            target
        )
    ) {

        return Math.round(
            value
        );

    }


    return value.toFixed(
        2
    );

}


/* =========================================================
   ANALYZER
   ========================================================= */

function initializeAnalyzer() {

    console.log(
        "BrainAI MRI Analyzer initialized"
    );


    const uploadArea =
        document.querySelector(
            "#uploadArea"
        );

    const fileInput =
        document.querySelector(
            "#mriFile"
        );

    const browseButton =
        document.querySelector(
            "#browseButton"
        );

    const analyzeButton =
        document.querySelector(
            "#analyzeButton"
        );

    const resetButton =
        document.querySelector(
            "#resetButton"
        );


    /*
     * Debug information
     */

    console.log(
        "Analyzer uploadArea:",
        uploadArea
    );

    console.log(
        "Analyzer fileInput:",
        fileInput
    );

    console.log(
        "Analyzer browseButton:",
        browseButton
    );


    /*
     * Required elements
     */

    if (!fileInput) {

        console.error(
            "BrainAI ERROR: #mriFile was not found."
        );

        return;

    }


/* =====================================================
   BROWSE BUTTON
   ===================================================== */

if (browseButton) {

    browseButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            console.log(
                "BrainAI: Select MRI clicked"
            );

            /*
             * Reset input so the same image
             * can be selected again.
             */

            fileInput.value = "";

            /*
             * Open Windows File Picker
             */

            fileInput.click();

        }
    );

}

    /* =====================================================
       UPLOAD AREA CLICK
       ===================================================== */

    if (uploadArea) {

        uploadArea.addEventListener(
            "click",
            event => {

                /*
                 * If the actual Browse button
                 * was clicked, do nothing here.
                 */

                if (
                    event.target.closest(
                        "#browseButton"
                    )
                ) {

                    return;

                }


                /*
                 * If the click came from
                 * the file input itself,
                 * ignore it.
                 */

                if (
                    event.target === fileInput
                ) {

                    return;

                }


                console.log(
                    "BrainAI: Upload area clicked"
                );


                fileInput.value = "";

                fileInput.click();

            }
        );

    }


    /* =====================================================
       FILE INPUT CHANGE
       ===================================================== */

    fileInput.addEventListener(
        "change",
        event => {

            console.log(
                "BrainAI: File input changed"
            );


            const files =
                event.target.files;


            if (
                !files ||
                !files.length
            ) {

                console.log(
                    "BrainAI: No file selected"
                );

                return;

            }


            const file =
                files[0];


            handleSelectedMRI(
                file
            );

        }
    );


    /* =====================================================
       DRAG OVER
       ===================================================== */

    if (uploadArea) {

        uploadArea.addEventListener(
            "dragover",
            event => {

                event.preventDefault();

                event.stopPropagation();


                uploadArea.classList.add(
                    "drag-over"
                );

            }
        );


        /* =================================================
           DRAG ENTER
           ================================================= */

        uploadArea.addEventListener(
            "dragenter",
            event => {

                event.preventDefault();

                event.stopPropagation();


                uploadArea.classList.add(
                    "drag-over"
                );

            }
        );


        /* =================================================
           DRAG LEAVE
           ================================================= */

        uploadArea.addEventListener(
            "dragleave",
            event => {

                event.preventDefault();

                event.stopPropagation();


                /*
                 * Only remove when leaving
                 * the complete upload area.
                 */

                if (
                    event.target ===
                    uploadArea
                ) {

                    uploadArea.classList.remove(
                        "drag-over"
                    );

                }

            }
        );


        /* =================================================
           DROP
           ================================================= */

        uploadArea.addEventListener(
            "drop",
            event => {

                event.preventDefault();

                event.stopPropagation();


                uploadArea.classList.remove(
                    "drag-over"
                );


                const files =
                    event.dataTransfer.files;


                if (
                    !files ||
                    !files.length
                ) {

                    return;

                }


                const file =
                    files[0];


                handleSelectedMRI(
                    file
                );

            }
        );

    }


    /* =====================================================
       ANALYZE BUTTON
       ===================================================== */

    if (analyzeButton) {

        analyzeButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                analyzeMRI();

            }
        );

    }


    /* =====================================================
       RESET BUTTON
       ===================================================== */

    if (resetButton) {

        resetButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                resetAnalyzer();

            }
        );

    }


    /* =====================================================
       INITIAL STATE
       ===================================================== */

    setAnalyzerState(
        "idle"
    );

}


/* =========================================================
   HANDLE SELECTED MRI
   ========================================================= */

function handleSelectedMRI(
    file
) {

    clearAnalyzerError();


    /*
     * Validate
     */

    const validation =
        validateMRIFile(
            file
        );


    if (
        !validation.valid
    ) {

        showAnalyzerError(
            validation.message
        );


        BrainAIState.selectedFile =
            null;


        const fileInput =
            document.querySelector(
                "#mriFile"
            );


        if (fileInput) {

            fileInput.value = "";

        }


        return;

    }


    /*
     * Save selected file
     */

    BrainAIState.selectedFile =
        file;


    window.selectedMRIFile =
        file;


    /*
     * Display preview
     */

    displayMRIPreview(
        file
    );


    /*
     * Enable analyze button
     */

    const analyzeButton =
        document.querySelector(
            "#analyzeButton"
        );


    if (analyzeButton) {

        analyzeButton.disabled =
            false;


        analyzeButton.classList.add(
            "ready"
        );

    }


    /*
     * State
     */

    setAnalyzerState(
        "selected"
    );


    console.log(
        "BrainAI MRI selected:",
        file.name,
        file.size,
        file.type
    );

}


/* =========================================================
   VALIDATE MRI FILE
   ========================================================= */

function validateMRIFile(
    file
) {

    if (!file) {

        return {

            valid: false,

            message:
                "Please select an MRI image."

        };

    }


    /*
     * Size
     */

    if (
        file.size >
        BrainAI.MAX_FILE_SIZE
    ) {

        return {

            valid: false,

            message:
                "File is too large. Maximum size is 16 MB."

        };

    }


    /*
     * MIME type
     */

    const typeValid =
        BrainAI.ALLOWED_TYPES.includes(
            file.type
        );


    /*
     * Extension fallback
     *
     * Some browsers may return
     * an empty MIME type.
     */

    const extension =
        getFileExtension(
            file.name
        );


    const extensionValid =
        BrainAI.ALLOWED_EXTENSIONS.includes(
            extension
        );


    if (
        !typeValid &&
        !extensionValid
    ) {

        return {

            valid: false,

            message:
                "Invalid image format. Please use JPG, JPEG, PNG or WEBP."

        };

    }


    return {

        valid: true,

        message: ""

    };

}


/* =========================================================
   FILE EXTENSION
   ========================================================= */

function getFileExtension(
    filename
) {

    if (!filename) {
        return "";
    }


    const parts =
        filename
            .toLowerCase()
            .split(".");


    if (
        parts.length < 2
    ) {

        return "";

    }


    return parts.pop();

}


/* =========================================================
   DISPLAY MRI PREVIEW
   ========================================================= */

function displayMRIPreview(
    file
) {

    const preview =
        document.querySelector(
            "#mriPreview"
        );

    const previewContainer =
        document.querySelector(
            "#previewContainer"
        );

    const fileName =
        document.querySelector(
            "#fileName"
        );

    const fileSize =
        document.querySelector(
            "#fileSize"
        );


    if (!preview) {

        console.warn(
            "BrainAI: #mriPreview not found."
        );

        return;

    }


    /*
     * FileReader
     */

    const reader =
        new FileReader();


    reader.onload =
        event => {

            preview.src =
                event.target.result;


            preview.style.display =
                "block";


            if (previewContainer) {

                previewContainer.classList.add(
                    "has-image"
                );

            }

        };


    reader.onerror =
        () => {

            showAnalyzerError(
                "Unable to preview the selected image."
            );

        };


    reader.readAsDataURL(
        file
    );


    /*
     * File name
     */

    if (fileName) {

        fileName.textContent =
            file.name;

    }


    /*
     * File size
     */

    if (fileSize) {

        fileSize.textContent =
            formatFileSize(
                file.size
            );

    }

}


/* =========================================================
   FILE SIZE
   ========================================================= */

function formatFileSize(
    bytes
) {

    if (
        bytes < 1024
    ) {

        return (
            bytes +
            " B"
        );

    }


    if (
        bytes <
        1024 * 1024
    ) {

        return (
            (bytes / 1024)
                .toFixed(2) +
            " KB"
        );

    }


    return (
        (bytes /
            (1024 * 1024))
            .toFixed(2) +
        " MB"
    );

}


/* =========================================================
   ANALYZE MRI
   ========================================================= */

async function analyzeMRI() {

    const file =
        BrainAIState.selectedFile ||
        window.selectedMRIFile;


    if (!file) {

        showAnalyzerError(
            "Please select an MRI image first."
        );

        return;

    }


    if (
        BrainAIState.isAnalyzing
    ) {

        return;

    }


    BrainAIState.isAnalyzing =
        true;


    clearAnalyzerError();


    setAnalyzerState(
        "loading"
    );


    const analyzeButton =
        document.querySelector(
            "#analyzeButton"
        );


    if (analyzeButton) {

        analyzeButton.disabled =
            true;


        analyzeButton.innerHTML =
            `
            <span class="button-spinner"></span>
            Analyzing MRI...
            `;

    }


    /*
     * FormData
     */

    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    try {

        console.log(
            "BrainAI: Sending MRI to",
            BrainAI.API_ENDPOINT
        );


        const response =
            await fetch(
                BrainAI.API_ENDPOINT,
                {

                    method: "POST",

                    body: formData

                }
            );


        /*
         * Try JSON
         */

        let data;


        try {

            data =
                await response.json();

        }

        catch (jsonError) {

            throw new Error(
                "Server returned an invalid response."
            );

        }


        console.log(
            "BrainAI API response:",
            data
        );


        /*
         * HTTP error
         */

        if (
            !response.ok
        ) {

            throw new Error(
                data.error ||
                data.message ||
                "Server error occurred."
            );

        }


        /*
         * Backend error
         */

        if (
            data.success === false
        ) {

            throw new Error(
                data.error ||
                data.message ||
                "Prediction failed."
            );

        }


        /*
         * Display
         */

        displayPrediction(
            data
        );


        /*
         * Save result
         */

        savePrediction(
            data
        );


        /*
         * Optional redirect
         */

        if (
            data.redirect
        ) {

            window.location.href =
                data.redirect;

        }

    }

    catch (error) {

        console.error(
            "BrainAI prediction error:",
            error
        );


        showAnalyzerError(
            error.message ||
            "Unable to analyze MRI."
        );


        setAnalyzerState(
            "error"
        );

    }

    finally {

        BrainAIState.isAnalyzing =
            false;


        if (analyzeButton) {

            /*
             * Only enable if
             * file still exists.
             */

            analyzeButton.disabled =
                !BrainAIState.selectedFile;


            analyzeButton.innerHTML =
                `
                Analyze MRI
                <span>→</span>
                `;

        }

    }

}


function displayPrediction(data) {

    console.log(
        "BrainAI: Displaying prediction",
        data
    );

    if (!data) {
        return;
    }

    BrainAIState.lastPrediction = data;

    /*
     * Prediction
     */
    const prediction =
        data.prediction ||
        data.prediction_raw ||
        "Unknown";

    /*
     * Probabilities
     */
    const probabilities =
        getProbabilities(data);

    /*
     * Confidence should match
     * predicted class probability.
     */
    let confidence = 0;

    const predictedClass =
        formatClassName(prediction);

    const predictedProbability =
        probabilities.find(
            item =>
                item.name.toLowerCase() ===
                predictedClass.toLowerCase()
        );

    if (predictedProbability) {
        confidence =
            predictedProbability.value;
    } else {
        confidence =
            normalizeConfidence(
                data.confidence
            );
    }

    /*
     * Prediction class
     */
    setText(
        "#predictionClass",
        predictedClass
    );

    /*
     * Confidence
     */
    setText(
        "#predictionConfidence",
        confidence.toFixed(2) + "%"
    );

    /*
     * Hide empty result section
     */
    const emptyResult =
        document.querySelector(
            "#predictionResult"
        );

    if (emptyResult) {
        emptyResult.style.display =
            "none";

        emptyResult.classList.remove(
            "visible"
        );
    }

    /*
     * SHOW ACTUAL RESULT
     */
    const resultContent =
        document.querySelector(
            "#resultContent"
        );

    if (resultContent) {
        resultContent.style.display =
            "block";

        resultContent.classList.add(
            "visible"
        );
    }

    /*
     * Analyzer status
     */
    const status =
        document.querySelector(
            "#analyzerStatus"
        );

    if (status) {
        status.textContent =
            "ANALYSIS COMPLETE";

        status.classList.add(
            "complete"
        );
    }

    /*
     * Render probabilities
     */
    renderProbabilities(
        probabilities
    );

    /*
     * Grad-CAM
     */
    displayGradCAM(
        data
    );

    /*
     * Model information
     */
    setText(
        "#modelName",
        data.model ||
        "MobileNetV2"
    );

    const accuracy =
        data.model_accuracy;

    setText(
        "#modelAccuracy",
        accuracy !== undefined &&
        accuracy !== null
            ? accuracy + "%"
            : "83.13%"
    );

    /*
     * Analyzer state
     */
    const analyzer =
        document.querySelector(
            "#mriAnalyzer"
        );

    if (analyzer) {
        setAnalyzerState(
            "complete"
        );
    }

    /*
     * Scroll to result
     */
    setTimeout(
        () => {

            if (resultContent) {

                resultContent.scrollIntoView(
                    {
                        behavior: "smooth",
                        block: "start"
                    }
                );
            }

        },
        200
    );

    /*
     * Custom event
     */
    document.dispatchEvent(
        new CustomEvent(
            "brainai:prediction",
            {
                detail: data
            }
        )
    );

    console.log(
        "BrainAI: Prediction displayed successfully."
    );
}

/* =========================================================
   GET PROBABILITIES
   ========================================================= */

function getProbabilities(
    data
) {

    let probabilities =
        data.probabilities ||
        data.class_probabilities ||
        data.distribution ||
        {};


    /*
     * Array
     */

    if (
        Array.isArray(
            probabilities
        )
    ) {

        const converted = {};


        probabilities.forEach(
            (value, index) => {

                const className =
                    BrainAI.CLASS_NAMES[
                        index
                    ];


                if (className) {

                    converted[
                        className
                    ] = value;

                }

            }
        );


        probabilities =
            converted;

    }


    /*
     * Object
     */

    const entries =
        Object.entries(
            probabilities
        );


    let result =
        entries.map(
            ([name, value]) => {

                return {

                    name:
                        formatClassName(
                            name
                        ),

                    value:
                        normalizeConfidence(
                            value
                        )

                };

            }
        );


    /*
     * If backend returned nothing,
     * create zero values.
     */

    if (!result.length) {

        result =
            BrainAI.CLASS_NAMES.map(
                name => {

                    return {

                        name: name,

                        value: 0

                    };

                }
            );

    }


    /*
     * Normalize total to 100.
     */

    const total =
        result.reduce(
            (
                sum,
                item
            ) => {

                return (
                    sum +
                    item.value
                );

            },
            0
        );


    if (
        total > 0
    ) {

        result =
            result.map(
                item => {

                    return {

                        name:
                            item.name,

                        value:
                            (
                                item.value /
                                total
                            ) *
                            100

                    };

                }
            );

    }


    /*
     * Sort highest first
     */

    result.sort(
        (a, b) =>
            b.value -
            a.value
    );


    return result;

}


/* =========================================================
   RENDER PROBABILITIES — PREMIUM
   ========================================================= */

function renderProbabilities(
    probabilities
) {

    const container =
        document.querySelector(
            "#probabilityList"
        );


    if (!container) {

        console.warn(
            "BrainAI: #probabilityList not found."
        );

        return;

    }


    container.innerHTML =
        "";


    if (
        !Array.isArray(probabilities) ||
        probabilities.length === 0
    ) {

        container.innerHTML =
            `
            <div class="probability-empty">
                Probability data unavailable.
            </div>
            `;

        return;

    }


    probabilities.forEach(
        (item, index) => {

            const value =
                Math.min(
                    Math.max(
                        Number(item.value) || 0,
                        0
                    ),
                    100
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "probability-row";


            /*
             * Highlight the highest
             * probability class.
             */
            if (index === 0) {

                row.classList.add(
                    "probability-primary"
                );

            }


            row.innerHTML =
                `
                <div class="probability-header">

                    <div class="probability-name-wrap">

                        <span class="probability-name">
                            ${escapeHTML(
                                item.name
                            )}
                        </span>

                        ${
                            index === 0
                                ? `
                                <span class="probability-badge">
                                    TOP
                                </span>
                                `
                                : ""
                        }

                    </div>


                    <span class="probability-value">
                        ${value.toFixed(2)}%
                    </span>

                </div>


                <div class="probability-track">

                    <div
                        class="probability-bar"
                        style="width: 0%"
                        data-width="${value}%"
                    ></div>

                </div>
                `;


            container.appendChild(
                row
            );


            /*
             * Animate bar after
             * the element enters DOM.
             */
            requestAnimationFrame(
                () => {

                    const bar =
                        row.querySelector(
                            ".probability-bar"
                        );


                    if (bar) {

                        setTimeout(
                            () => {

                                bar.style.width =
                                    `${value}%`;

                            },
                            index * 100
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   GRAD-CAM
   ========================================================= */

function displayGradCAM(
    data
) {

    const gradcamImage =
        document.querySelector(
            "#gradcamImage"
        );

    const placeholder =
        document.querySelector(
            "#gradcamPlaceholder"
        );

    const loading =
        document.querySelector(
            "#gradcamLoading"
        );


    if (!gradcamImage) {

        console.warn(
            "BrainAI: #gradcamImage not found."
        );

        return;

    }


    /*
     * Get backend URL
     */

    let gradcamURL =
        data.gradcam_url ||
        data.gradcam ||
        data.grad_cam ||
        data.visualization ||
        null;


    console.log(
        "BrainAI Grad-CAM URL:",
        gradcamURL
    );


    /*
     * No URL
     */

    if (!gradcamURL) {

        console.warn(
            "BrainAI: Grad-CAM URL missing."
        );


        if (loading) {

            loading.style.display =
                "none";

        }


        gradcamImage.style.display =
            "none";


        if (placeholder) {

            placeholder.style.display =
                "flex";


            placeholder.innerHTML =
                `
                <div class="gradcam-placeholder-content">

                    <strong>
                        Attention visualization unavailable
                    </strong>

                    <span>
                        Grad-CAM could not be generated
                        for this image.
                    </span>

                </div>
                `;

        }


        return;

    }


    /*
     * Resolve URL
     */

    const resolvedURL =
        resolveURL(
            gradcamURL
        );


    /*
     * Cache bust
     */

    const finalURL =
        resolvedURL +
        (
            resolvedURL.includes("?")
                ? "&"
                : "?"
        ) +
        "t=" +
        Date.now();


    console.log(
        "BrainAI Grad-CAM resolved URL:",
        finalURL
    );


    /*
     * Loading
     */

    if (loading) {

        loading.style.display =
            "flex";

    }


    gradcamImage.style.display =
        "none";


    if (placeholder) {

        placeholder.style.display =
            "none";

    }


    /*
     * Remove previous handlers
     */

    gradcamImage.onload =
        null;

    gradcamImage.onerror =
        null;


    /*
     * Success
     */

    gradcamImage.onload =
        () => {

            console.log(
                "BrainAI Grad-CAM loaded successfully."
            );


            if (loading) {

                loading.style.display =
                    "none";

            }


            gradcamImage.style.display =
                "block";


            gradcamImage.classList.add(
                "loaded"
            );

        };


    /*
     * Error
     */

    gradcamImage.onerror =
        () => {

            console.error(
                "BrainAI Grad-CAM image failed:",
                finalURL
            );


            if (loading) {

                loading.style.display =
                    "none";

            }


            gradcamImage.style.display =
                "none";


            if (placeholder) {

                placeholder.style.display =
                    "flex";


                placeholder.innerHTML =
                    `
                    <div class="gradcam-placeholder-content">

                        <strong>
                            Attention visualization unavailable
                        </strong>

                        <span>
                            The Grad-CAM image could not
                            be loaded.
                        </span>

                    </div>
                    `;

            }

        };


    /*
     * Set image source
     */

    gradcamImage.src =
        finalURL;

}


/* =========================================================
   URL RESOLVER
   ========================================================= */

function resolveURL(
    url
) {

    if (!url) {

        return "";

    }


    url =
        String(url).trim();


    /*
     * Absolute
     */

    if (
        url.startsWith(
            "http://"
        ) ||
        url.startsWith(
            "https://"
        ) ||
        url.startsWith(
            "data:"
        ) ||
        url.startsWith(
            "blob:"
        )
    ) {

        return url;

    }


    /*
     * Flask static
     */

    if (
        url.startsWith(
            "/static/"
        )
    ) {

        return url;

    }


    /*
     * Flask uploads
     */

    if (
        url.startsWith(
            "/uploads/"
        )
    ) {

        return url;

    }


    /*
     * Relative
     */

    return "/" +
        url.replace(
            /^\/+/,
            ""
        );

}


/* =========================================================
   RESET ANALYZER
   ========================================================= */

function resetAnalyzer() {

    console.log(
        "BrainAI: Reset analyzer"
    );


    BrainAIState.selectedFile =
        null;


    BrainAIState.lastPrediction =
        null;


    BrainAIState.isAnalyzing =
        false;


    window.selectedMRIFile =
        null;


    /*
     * File input
     */

    const fileInput =
        document.querySelector(
            "#mriFile"
        );


    if (fileInput) {

        fileInput.value =
            "";

    }


    /*
     * Preview
     */

    const preview =
        document.querySelector(
            "#mriPreview"
        );


    if (preview) {

        preview.src =
            "";

        preview.style.display =
            "none";

    }


    /*
     * Preview container
     */

    const previewContainer =
        document.querySelector(
            "#previewContainer"
        );


    if (previewContainer) {

        previewContainer.classList.remove(
            "has-image"
        );

    }


    /*
     * Result
     */

    const resultSection =
        document.querySelector(
            "#predictionResult"
        );


    if (resultSection) {

        resultSection.classList.remove(
            "visible"
        );

    }


    /*
     * Grad-CAM
     */

    const gradcamImage =
        document.querySelector(
            "#gradcamImage"
        );


    if (gradcamImage) {

        gradcamImage.src =
            "";

        gradcamImage.style.display =
            "none";

    }


    /*
     * Loading
     */

    const gradcamLoading =
        document.querySelector(
            "#gradcamLoading"
        );


    if (gradcamLoading) {

        gradcamLoading.style.display =
            "none";

    }


    /*
     * Placeholder
     */

    const placeholder =
        document.querySelector(
            "#gradcamPlaceholder"
        );


    if (placeholder) {

        placeholder.style.display =
            "flex";

    }


    /*
     * Probabilities
     */

    const probabilityList =
        document.querySelector(
            "#probabilityList"
        );


    if (probabilityList) {

        probabilityList.innerHTML =
            "";

    }


    /*
     * File information
     */

    setText(
        "#fileName",
        "No MRI selected"
    );


    setText(
        "#fileSize",
        ""
    );


    /*
     * Analyze button
     */

    const analyzeButton =
        document.querySelector(
            "#analyzeButton"
        );


    if (analyzeButton) {

        analyzeButton.disabled =
            true;


        analyzeButton.classList.remove(
            "ready"
        );


        analyzeButton.innerHTML =
            `
            Analyze MRI
            <span>→</span>
            `;

    }


    /*
     * Upload area
     */

    const uploadArea =
        document.querySelector(
            "#uploadArea"
        );


    if (uploadArea) {

        uploadArea.classList.remove(
            "drag-over"
        );

    }


    clearAnalyzerError();


    setAnalyzerState(
        "idle"
    );

}


/* =========================================================
   ANALYZER STATE
   ========================================================= */

function setAnalyzerState(
    state
) {

    const analyzer =
        document.querySelector(
            "#mriAnalyzer"
        );


    if (!analyzer) {
        return;
    }


    analyzer.dataset.state =
        state;


    /*
     * Remove previous states
     */

    analyzer.classList.remove(

        "state-idle",

        "state-selected",

        "state-loading",

        "state-complete",

        "state-error"

    );


    /*
     * Add current state
     */

    analyzer.classList.add(
        "state-" +
        state
    );


    /*
     * Status text
     */

    const status =
        document.querySelector(
            "#analyzerStatus"
        );


    if (!status) {
        return;
    }


    const labels = {

        idle:
            "Waiting for MRI",

        selected:
            "MRI Ready",

        loading:
            "Analyzing...",

        complete:
            "Analysis Complete",

        error:
            "Analysis Failed"

    };


    status.textContent =
        labels[state] ||
        "Ready";

}


/* =========================================================
   ANALYZER ERROR
   ========================================================= */

function showAnalyzerError(
    message
) {

    const error =
        document.querySelector(
            "#analyzerError"
        );


    if (!error) {

        alert(
            message
        );

        return;

    }


    error.textContent =
        message;


    error.style.display =
        "block";


    error.classList.add(
        "visible"
    );

}


/* =========================================================
   CLEAR ANALYZER ERROR
   ========================================================= */

function clearAnalyzerError() {

    const error =
        document.querySelector(
            "#analyzerError"
        );


    if (!error) {
        return;
    }


    error.textContent =
        "";


    error.style.display =
        "none";


    error.classList.remove(
        "visible"
    );

}


/* =========================================================
   PREDICTION PAGE
   ========================================================= */

function initializePredictionPage() {

    console.log(
        "BrainAI Prediction page initialized"
    );


    const stored =
        sessionStorage.getItem(
            "brainai_prediction"
        );


    if (!stored) {

        console.log(
            "BrainAI: No stored prediction."
        );

        return;

    }


    try {

        const data =
            JSON.parse(
                stored
            );


        BrainAIState.lastPrediction =
            data;


        displayPrediction(
            data
        );

    }

    catch (error) {

        console.error(
            "BrainAI: Unable to restore prediction:",
            error
        );

    }

}


/* =========================================================
   SAVE PREDICTION
   ========================================================= */

function savePrediction(
    data
) {

    if (!data) {
        return;
    }


    try {

        sessionStorage.setItem(
            "brainai_prediction",
            JSON.stringify(
                data
            )
        );


        BrainAIState.lastPrediction =
            data;


        console.log(
            "BrainAI: Prediction saved."
        );

    }

    catch (error) {

        console.warn(
            "BrainAI: Could not save prediction:",
            error
        );

    }

}


/* =========================================================
   CLEAR SAVED PREDICTION
   ========================================================= */

function clearSavedPrediction() {

    try {

        sessionStorage.removeItem(
            "brainai_prediction"
        );

    }

    catch (error) {

        console.warn(
            "BrainAI: Could not clear prediction.",
            error
        );

    }

}


/* =========================================================
   INSIGHTS PAGE
   ========================================================= */

function initializeInsightsPage() {

    console.log(
        "BrainAI Insights page initialized"
    );


    const bars =
        document.querySelectorAll(
            "[data-progress]"
        );


    bars.forEach(
        bar => {

            const value =
                parseFloat(
                    bar.dataset.progress
                );


            if (
                Number.isNaN(
                    value
                )
            ) {

                return;

            }


            bar.style.width =
                "0%";


            requestAnimationFrame(
                () => {

                    setTimeout(
                        () => {

                            bar.style.width =
                                Math.min(
                                    value,
                                    100
                                ) +
                                "%";

                        },
                        150
                    );

                }
            );

        }
    );


    initializeRevealAnimations();

}


/* =========================================================
   ABOUT PAGE
   ========================================================= */

function initializeAboutPage() {

    console.log(
        "BrainAI About page initialized"
    );


    initializeRevealAnimations();


    const cards =
        document.querySelectorAll(
            ".explainability-card"
        );


    cards.forEach(
        card => {

            card.addEventListener(
                "click",
                () => {

                    card.classList.toggle(
                        "expanded"
                    );

                }
            );

        }
    );

}


/* =========================================================
   REVEAL ANIMATIONS
   ========================================================= */

function initializeRevealAnimations() {

    const elements =
        document.querySelectorAll(
            ".reveal"
        );


    if (!elements.length) {
        return;
    }


    /*
     * Browser doesn't support
     * IntersectionObserver
     */

    if (
        !(
            "IntersectionObserver"
            in window
        )
    ) {

        elements.forEach(
            element => {

                element.classList.add(
                    "visible"
                );

            }
        );


        return;

    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );


                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.12
            }
        );


    elements.forEach(
        element => {

            observer.observe(
                element
            );

        }
    );

}


/* =========================================================
   GLOBAL INTERACTIONS
   ========================================================= */

function initializeGlobalInteractions() {


    /*
     * Form double-submit protection
     */

    document.addEventListener(
        "submit",
        event => {

            const form =
                event.target;


            if (
                form.dataset.loading ===
                "true"
            ) {

                event.preventDefault();

                return;

            }


            form.dataset.loading =
                "true";

        }
    );


    /*
     * Keyboard shortcut
     *
     * CTRL + U
     *
     * Opens analyzer.
     */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.ctrlKey &&
                event.key.toLowerCase() ===
                "u"
            ) {

                event.preventDefault();


                window.location.href =
                    "/analyzer";

            }

        }
    );

}


/* =========================================================
   NORMALIZE CONFIDENCE
   ========================================================= */

function normalizeConfidence(
    value
) {

    let number =
        parseFloat(
            value
        );


    if (
        Number.isNaN(
            number
        )
    ) {

        return 0;

    }


    /*
     * Backend might return:
     *
     * 0.83
     *
     * or
     *
     * 83.13
     */

    if (
        number >= 0 &&
        number <= 1
    ) {

        number *= 100;

    }


    /*
     * Clamp 0-100
     */

    number =
        Math.max(
            0,
            Math.min(
                number,
                100
            )
        );


    return number;

}


/* =========================================================
   FORMAT CLASS NAME
   ========================================================= */

function formatClassName(
    name
) {

    if (!name) {

        return "Unknown";

    }


    const normalized =
        String(name)
            .trim()
            .toLowerCase();


    const mapping = {

        "glioma":
            "Glioma",

        "meningioma":
            "Meningioma",

        "notumor":
            "No Tumor",

        "no tumor":
            "No Tumor",

        "no_tumor":
            "No Tumor",

        "no-tumor":
            "No Tumor",

        "pituitary":
            "Pituitary"

    };


    if (
        mapping[normalized]
    ) {

        return mapping[
            normalized
        ];

    }


    return String(name)
        .replace(
            /[_-]/g,
            " "
        )
        .replace(
            /\b\w/g,
            char =>
                char.toUpperCase()
        );

}


/* =========================================================
   SET TEXT SAFELY
   ========================================================= */

function setText(
    selector,
    value
) {

    const element =
        document.querySelector(
            selector
        );


    if (!element) {
        return;
    }


    element.textContent =
        value;

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   DEBUG HELPER
   ========================================================= */

function debugAnalyzerElements() {

    console.log(
        "========== BrainAI Analyzer Debug =========="
    );


    console.log(
        "#mriAnalyzer:",
        document.querySelector(
            "#mriAnalyzer"
        )
    );


    console.log(
        "#uploadArea:",
        document.querySelector(
            "#uploadArea"
        )
    );


    console.log(
        "#mriFile:",
        document.querySelector(
            "#mriFile"
        )
    );


    console.log(
        "#browseButton:",
        document.querySelector(
            "#browseButton"
        )
    );


    console.log(
        "#analyzeButton:",
        document.querySelector(
            "#analyzeButton"
        )
    );


    console.log(
        "#resetButton:",
        document.querySelector(
            "#resetButton"
        )
    );


    console.log(
        "============================================="
    );

}


/* =========================================================
   GLOBAL API
   ========================================================= */

window.BrainAI = {

    analyzeMRI,

    resetAnalyzer,

    displayPrediction,

    displayGradCAM,

    normalizeConfidence,

    formatClassName,

    resolveURL,

    savePrediction,

    clearSavedPrediction,

    validateMRIFile,

    handleSelectedMRI,

    debugAnalyzerElements

};


/* =========================================================
   FINAL LOG
   ========================================================= */

console.log(
    "BrainAI JavaScript loaded successfully."
);
