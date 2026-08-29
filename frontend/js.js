/* =========================================================
   REVIX — DOCUMENT INTELLIGENCE JAVASCRIPT
   Interactive Stars + Glowy Waves Included
   ========================================================= */

"use strict";


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const splashScreen = document.getElementById("splash-screen");
const appScreen = document.getElementById("appScreen");

const enterWorkspace = document.getElementById("enterWorkspace");
const backToSplash = document.getElementById("backToSplash");

const waveCanvas = document.getElementById("waveCanvas");

const fileInput = document.getElementById("fileInput");
const selectFile = document.getElementById("selectFile");
const sidebarUpload = document.getElementById("sidebarUpload");
const uploadBox = document.getElementById("uploadBox");

const searchInput = document.getElementById("searchInput");
const documentsContainer =
    document.getElementById("documentsContainer");

const workspaceEmpty =
    document.getElementById("workspaceEmpty");

const documentViewer =
    document.getElementById("documentViewer");

const viewerFilename =
    document.getElementById("viewerFilename");

const viewerMeta =
    document.getElementById("viewerMeta");

const imagePreviewPanel =
    document.getElementById("imagePreviewPanel");

const imagePreview =
    document.getElementById("imagePreview");

const pdfPreview =
    document.getElementById("pdfPreview");

const textPreview =
    document.getElementById("textPreview");

const previewEmpty =
    document.getElementById("previewEmpty");

const previewLoading =
    document.getElementById("previewLoading");

const extractedText =
    document.getElementById("extractedText");

const extractionStatus =
    document.getElementById("extractionStatus");

const editButton =
    document.getElementById("editButton");

const saveButton =
    document.getElementById("saveButton");

const chatButton =
    document.getElementById("chatButton");


/* =========================================================
   APPLICATION STATE
   ========================================================= */

const documents = [];

let selectedDocumentId = null;

let pdfjsLib = null;

let isProcessing = false;

let editingDocument = false;


/* =========================================================
   FILE TYPES
   ========================================================= */

const SUPPORTED_EXTENSIONS = [
    "pdf",
    "png",
    "jpg",
    "jpeg",
    "avif",
    "txt"
];

const SUPPORTED_MIME_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/avif",
    "text/plain"
];


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        initializeSplash();

        initializeUpload();

        initializeSearch();

        initializeWorkspaceActions();

        initializeChatButton();

        initializeWaveAnimation();

        await initializePDFJS();

    }
);


/* =========================================================
   SPLASH SCREEN
   ========================================================= */

function initializeSplash() {

    if (enterWorkspace) {

        enterWorkspace.addEventListener(
            "click",
            () => {

                splashScreen.classList.add(
                    "is-leaving"
                );

                setTimeout(
                    () => {

                        appScreen.classList.add(
                            "is-active"
                        );

                    },
                    250
                );

            }
        );

    }


    if (backToSplash) {

        backToSplash.addEventListener(
            "click",
            () => {

                appScreen.classList.remove(
                    "is-active"
                );

                setTimeout(
                    () => {

                        splashScreen.classList.remove(
                            "is-leaving"
                        );

                    },
                    200
                );

            }
        );

    }

}


/* =========================================================
   UPLOAD INITIALIZATION
   ========================================================= */

function initializeUpload() {

    if (selectFile) {

        selectFile.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                if (fileInput) {
                    fileInput.click();
                }

            }
        );

    }


    if (sidebarUpload) {

        sidebarUpload.addEventListener(
            "click",
            () => {

                if (fileInput) {
                    fileInput.click();
                }

            }
        );

    }


    if (uploadBox) {

        uploadBox.addEventListener(
            "click",
            (event) => {

                if (
                    event.target === selectFile ||
                    event.target.closest("#selectFile")
                ) {
                    return;
                }

                if (fileInput) {
                    fileInput.click();
                }

            }
        );


        uploadBox.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    if (fileInput) {
                        fileInput.click();
                    }

                }

            }
        );


        uploadBox.addEventListener(
            "dragover",
            (event) => {

                event.preventDefault();

                uploadBox.classList.add(
                    "drag-active"
                );

            }
        );


        uploadBox.addEventListener(
            "dragenter",
            (event) => {

                event.preventDefault();

                uploadBox.classList.add(
                    "drag-active"
                );

            }
        );


        uploadBox.addEventListener(
            "dragleave",
            (event) => {

                event.preventDefault();

                uploadBox.classList.remove(
                    "drag-active"
                );

            }
        );


        uploadBox.addEventListener(
            "drop",
            (event) => {

                event.preventDefault();

                uploadBox.classList.remove(
                    "drag-active"
                );

                const droppedFiles =
                    Array.from(
                        event.dataTransfer.files || []
                    );

                processFiles(droppedFiles);

            }
        );

    }


    if (fileInput) {

        fileInput.addEventListener(
            "change",
            (event) => {

                const selectedFiles =
                    Array.from(
                        event.target.files || []
                    );

                processFiles(selectedFiles);

                fileInput.value = "";

            }
        );

    }

}


/* =========================================================
   SEARCH
   ========================================================= */

function initializeSearch() {

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener(
        "input",
        () => {

            renderDocumentList();

        }
    );

}


/* =========================================================
   WORKSPACE ACTIONS
   ========================================================= */

function initializeWorkspaceActions() {

    if (editButton) {

        editButton.addEventListener(
            "click",
            () => {

                if (!selectedDocumentId) {
                    return;
                }

                editingDocument =
                    !editingDocument;

                if (extractedText) {

                    extractedText.readOnly =
                        !editingDocument;

                }


                if (editingDocument) {

                    editButton.textContent =
                        "LOCK";

                    if (extractedText) {
                        extractedText.focus();
                    }

                    setStatus(
                        "EDITING EXTRACTION",
                        "processing"
                    );

                } else {

                    editButton.textContent =
                        "EDIT";

                    setStatus(
                        "EDITING LOCKED",
                        "success"
                    );

                }

            }
        );

    }


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            () => {

                saveCurrentDocument();

            }
        );

    }

}


/* =========================================================
   CHAT BUTTON
   ========================================================= */

function initializeChatButton() {

    if (!chatButton) {
        return;
    }

    chatButton.addEventListener(
        "click",
        () => {

            setStatus(
                "REVIX AI MODULE READY",
                "success"
            );

        }
    );

}


/* =========================================================
   PDF.JS INITIALIZATION
   ========================================================= */

async function initializePDFJS() {

    try {

        pdfjsLib = await import(
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs"
        );


        if (
            pdfjsLib &&
            pdfjsLib.GlobalWorkerOptions
        ) {

            pdfjsLib.GlobalWorkerOptions.workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

        }

    } catch (error) {

        console.warn(
            "PDF.js could not be initialized.",
            error
        );

        pdfjsLib = null;

    }

}


/* =========================================================
   PROCESS FILES
   ========================================================= */

async function processFiles(files) {

    if (!files || files.length === 0) {
        return;
    }


    for (const file of files) {

        if (!isSupportedFile(file)) {

            alert(
                `"${file.name}" is not a supported file type.\n\n` +
                "Supported formats: PDF, PNG, JPG, JPEG, AVIF, TXT."
            );

            continue;

        }


        try {

            if (uploadBox) {
                uploadBox.classList.add(
                    "uploading"
                );
            }


            const documentObject =
                createDocumentObject(file);


            documents.push(
                documentObject
            );


            renderDocumentList();


            await selectDocument(
                documentObject.id
            );


        } catch (error) {

            console.error(
                "Error processing file:",
                error
            );

            setStatus(
                "DOCUMENT PROCESSING FAILED",
                "error"
            );

        }

    }


    if (uploadBox) {
        uploadBox.classList.remove(
            "uploading"
        );
    }

}


/* =========================================================
   FILE VALIDATION
   ========================================================= */

function isSupportedFile(file) {

    if (!file) {
        return false;
    }


    const extension =
        getExtension(file.name);


    const mimeType =
        file.type
            ? file.type.toLowerCase()
            : "";


    return (
        SUPPORTED_EXTENSIONS.includes(
            extension
        ) ||
        SUPPORTED_MIME_TYPES.includes(
            mimeType
        )
    );

}


/* =========================================================
   CREATE DOCUMENT OBJECT
   ========================================================= */

function createDocumentObject(file) {

    return {

        id:
            `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 9)}`,

        file,

        name: file.name,

        size: file.size,

        type: getFileType(file),

        extension: getExtension(
            file.name
        ),

        url: URL.createObjectURL(file),

        extractedText: "",

        status: "READY",

        processed: false,

        createdAt: new Date()

    };

}


/* =========================================================
   SELECT DOCUMENT
   ========================================================= */

async function selectDocument(documentId) {

    const documentObject =
        documents.find(
            documentItem =>
                documentItem.id ===
                documentId
        );


    if (!documentObject) {
        return;
    }


    selectedDocumentId =
        documentId;


    editingDocument = false;


    if (extractedText) {
        extractedText.readOnly = true;
    }


    if (editButton) {
        editButton.textContent = "EDIT";
    }


    if (workspaceEmpty) {
        workspaceEmpty.classList.add(
            "hidden"
        );
    }


    if (documentViewer) {
        documentViewer.classList.remove(
            "hidden"
        );
    }


    renderDocumentList();


    updateViewerHeader(
        documentObject
    );


    resetPreview();


    if (extractedText) {

        extractedText.value =
            documentObject.extractedText ||
            "";

    }


    if (documentObject.processed) {

        setStatus(
            documentObject.status ||
            "EXTRACTION COMPLETE",
            "success"
        );

    } else {

        setStatus(
            "PROCESSING DOCUMENT",
            "processing"
        );

    }


    await displayPreview(
        documentObject
    );


    if (!documentObject.processed) {

        await extractDocument(
            documentObject
        );

    }

}


/* =========================================================
   UPDATE VIEWER HEADER
   ========================================================= */

function updateViewerHeader(
    documentObject
) {

    if (viewerFilename) {

        viewerFilename.textContent =
            documentObject.name;

    }


    if (viewerMeta) {

        viewerMeta.textContent =
            `${documentObject.type} · ${formatFileSize(
                documentObject.size
            )}`;

    }

}


/* =========================================================
   RESET PREVIEW
   ========================================================= */

function resetPreview() {

    if (imagePreview) {
        imagePreview.classList.add(
            "hidden"
        );

        imagePreview.src = "";
    }


    if (pdfPreview) {
        pdfPreview.classList.add(
            "hidden"
        );

        pdfPreview.src = "";
    }


    if (textPreview) {
        textPreview.classList.add(
            "hidden"
        );

        textPreview.textContent = "";
    }


    if (previewEmpty) {
        previewEmpty.classList.add(
            "hidden"
        );
    }


    if (previewLoading) {
        previewLoading.classList.add(
            "hidden"
        );
    }

}


/* =========================================================
   DISPLAY PREVIEW
   ========================================================= */

async function displayPreview(
    documentObject
) {

    resetPreview();


    if (previewLoading) {

        previewLoading.classList.remove(
            "hidden"
        );

    }


    try {

        const type =
            documentObject.type;


        if (type === "IMAGE") {

            await displayImagePreview(
                documentObject
            );

        } else if (type === "PDF") {

            displayPDFPreview(
                documentObject
            );

        } else if (type === "TEXT") {

            await displayTextPreview(
                documentObject
            );

        } else {

            if (previewEmpty) {

                previewEmpty.classList.remove(
                    "hidden"
                );

            }

        }

    } catch (error) {

        console.error(
            "Preview error:",
            error
        );

        if (previewEmpty) {

            previewEmpty.classList.remove(
                "hidden"
            );

        }

    } finally {

        if (previewLoading) {

            previewLoading.classList.add(
                "hidden"
            );

        }

    }

}


/* =========================================================
   IMAGE PREVIEW
   ========================================================= */

async function displayImagePreview(
    documentObject
) {

    if (!imagePreview) {
        return;
    }


    imagePreview.src =
        documentObject.url;


    imagePreview.alt =
        `Preview of ${documentObject.name}`;


    imagePreview.classList.remove(
        "hidden"
    );


    await new Promise(
        resolve => {

            if (imagePreview.complete) {

                resolve();

                return;

            }


            imagePreview.onload =
                resolve;

            imagePreview.onerror =
                resolve;

        }
    );

}


/* =========================================================
   PDF PREVIEW
   ========================================================= */

function displayPDFPreview(
    documentObject
) {

    if (!pdfPreview) {
        return;
    }


    pdfPreview.src =
        `${documentObject.url}#toolbar=1&navpanes=0&scrollbar=1`;


    pdfPreview.classList.remove(
        "hidden"
    );

}


/* =========================================================
   TEXT PREVIEW
   ========================================================= */

async function displayTextPreview(
    documentObject
) {

    if (!textPreview) {
        return;
    }


    const text =
        await documentObject.file.text();


    textPreview.textContent =
        text ||
        "EMPTY TEXT DOCUMENT";


    textPreview.classList.remove(
        "hidden"
    );

}


/* =========================================================
   DOCUMENT EXTRACTION
   ========================================================= */

async function extractDocument(
    documentObject
) {

    isProcessing = true;


    setStatus(
        "EXTRACTING CONTENT",
        "processing"
    );


    try {

        let extracted = "";


        /* =================================================
           TEXT
           ================================================= */

        if (
            documentObject.type === "TEXT"
        ) {

            extracted =
                await documentObject.file.text();

        }


        /* =================================================
           IMAGE
           ================================================= */

        else if (
            documentObject.type === "IMAGE"
        ) {

            extracted =
                await extractTextFromImage(
                    documentObject.file
                );

        }


        /* =================================================
           PDF
           ================================================= */

        else if (
            documentObject.type === "PDF"
        ) {

            extracted =
                await extractTextFromPDF(
                    documentObject.file
                );

        }


        extracted =
            cleanExtractedText(
                extracted
            );


        documentObject.extractedText =
            extracted;


        documentObject.processed =
            true;


        if (extracted.trim()) {

            documentObject.status =
                "EXTRACTION COMPLETE";

        } else {

            documentObject.status =
                "NO TEXT FOUND";

        }


        if (
            selectedDocumentId ===
            documentObject.id
        ) {

            if (extractedText) {

                extractedText.value =
                    extracted;

            }


            setStatus(
                documentObject.status,
                extracted.trim()
                    ? "success"
                    : "processing"
            );

        }

    } catch (error) {

        console.error(
            "Extraction failed:",
            error
        );


        documentObject.processed =
            true;


        documentObject.status =
            "EXTRACTION FAILED";


        documentObject.extractedText =
            "";


        if (
            selectedDocumentId ===
            documentObject.id
        ) {

            if (extractedText) {
                extractedText.value = "";
            }


            setStatus(
                "EXTRACTION FAILED",
                "error"
            );

        }

    } finally {

        isProcessing = false;

        renderDocumentList();

    }

}


/* =========================================================
   IMAGE OCR
   ========================================================= */

/* =========================================================
   IMAGE OCR — ENHANCED
   Browser decoding + image preprocessing + multilingual OCR
========================================================= */

async function extractTextFromImage(file) {

    if (typeof Tesseract === "undefined") {

        throw new Error(
            "Tesseract.js is not available."
        );

    }

    setStatus(
        "OCR INITIALIZING",
        "processing"
    );

    try {

        /* -------------------------------------------------
           1. Decode the image through the browser
        ------------------------------------------------- */

        const imageBitmap =
            await createImageBitmap(file);


        /* -------------------------------------------------
           2. Upscale image for better OCR
        ------------------------------------------------- */

        const scale = 3;

        const canvas =
            document.createElement("canvas");

        canvas.width =
            Math.round(imageBitmap.width * scale);

        canvas.height =
            Math.round(imageBitmap.height * scale);


        const context =
            canvas.getContext("2d", {
                willReadFrequently: true
            });


        if (!context) {

            imageBitmap.close();

            throw new Error(
                "Could not create OCR canvas."
            );

        }


        context.imageSmoothingEnabled = true;

        context.imageSmoothingQuality = "high";


        context.drawImage(
            imageBitmap,
            0,
            0,
            canvas.width,
            canvas.height
        );


        imageBitmap.close();


        /* -------------------------------------------------
           3. Image preprocessing
        ------------------------------------------------- */

        setStatus(
            "PREPARING IMAGE FOR OCR",
            "processing"
        );


        const imageData =
            context.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );


        const pixels =
            imageData.data;


        for (
            let i = 0;
            i < pixels.length;
            i += 4
        ) {

            const red =
                pixels[i];

            const green =
                pixels[i + 1];

            const blue =
                pixels[i + 2];


            /* ---------------------------------------------
               Convert RGB → grayscale
            --------------------------------------------- */

            let gray =
                0.299 * red +
                0.587 * green +
                0.114 * blue;


            /* ---------------------------------------------
               Increase contrast
            --------------------------------------------- */

            gray =
                ((gray - 128) * 1.35) + 128;


            gray =
                Math.max(
                    0,
                    Math.min(
                        255,
                        gray
                    )
                );


            pixels[i] =
                gray;

            pixels[i + 1] =
                gray;

            pixels[i + 2] =
                gray;

        }


        context.putImageData(
            imageData,
            0,
            0
        );


        /* -------------------------------------------------
           4. OCR
        ------------------------------------------------- */

        setStatus(
            "OCR PROCESSING 0%",
            "processing"
        );


        /*
         * English + Hindi:
         *
         * This is useful for Indian documents containing
         * both English and Devanagari text.
         */

        const language =
            "eng+hin";


        const result =
            await Tesseract.recognize(
                canvas,
                language,
                {

                    logger: (message) => {

                        if (
                            message &&
                            typeof message.progress ===
                            "number"
                        ) {

                            const percent =
                                Math.round(
                                    message.progress * 100
                                );


                            setStatus(
                                `OCR PROCESSING ${percent}%`,
                                "processing"
                            );

                        }

                    },

                    /*
                     * PSM 11 =
                     * Sparse text.
                     *
                     * Better for:
                     * - ID cards
                     * - forms
                     * - certificates
                     * - receipts
                     * - documents with separated fields
                     */

                    tessedit_pageseg_mode: "11",

                    /*
                     * Preserve spaces between words.
                     */

                    preserve_interword_spaces: "1",

                    /*
                     * Tell Tesseract the image has
                     * approximately 300 DPI.
                     */

                    user_defined_dpi: "300"

                }
            );


        /* -------------------------------------------------
           5. Return OCR result
        ------------------------------------------------- */

        return (
            result?.data?.text || ""
        );


    } catch (error) {

        console.error(
            "Enhanced image OCR failed:",
            error
        );

        throw error;

    }

}


/* =========================================================
   PDF EXTRACTION
   ========================================================= */

/* =========================================================
   PDF EXTRACTION — HYBRID TEXT + OCR
   ========================================================= */

async function extractTextFromPDF(file) {

    if (!pdfjsLib) {

        throw new Error(
            "PDF.js is not available."
        );

    }


    const arrayBuffer =
        await file.arrayBuffer();


    const pdf =
        await pdfjsLib.getDocument({
            data: arrayBuffer
        }).promise;


    let finalText = "";


    /* =====================================================
       PROCESS EACH PAGE
       ===================================================== */

    for (
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber++
    ) {

        setStatus(
            `ANALYZING PDF PAGE ${pageNumber}/${pdf.numPages}`,
            "processing"
        );


        const page =
            await pdf.getPage(
                pageNumber
            );


        /* =================================================
           FIRST: TRY PDF TEXT LAYER
           ================================================= */

        const textContent =
            await page.getTextContent();


        const textItems =
            textContent.items || [];


        const pageText =
            textItems
                .map(item => {

                    if (
                        typeof item.str !==
                        "string"
                    ) {

                        return "";

                    }

                    return item.str.trim();

                })
                .filter(Boolean)
                .join(" ");


        /*
         * Determine whether the PDF text layer
         * looks useful.
         *
         * We don't simply check whether text exists.
         * A few characters can exist in a PDF while
         * the actual page is still scanned/image-based.
         */

        const meaningfulCharacters =
            (
                pageText.match(
                    /[A-Za-z0-9]/g
                ) || []
            ).length;


        const textLength =
            pageText
                .replace(/\s/g, "")
                .length;


        /*
         * A page is considered to have a usable
         * text layer when it contains enough
         * meaningful characters.
         */

        const hasUsableText =
            meaningfulCharacters >= 15 &&
            textLength >= 20;


        /* =================================================
           IF TEXT LAYER IS GOOD — USE IT
           ================================================= */

        if (hasUsableText) {

            finalText +=
                `\n\n--- PAGE ${pageNumber} ---\n\n`;


            /*
             * Try to preserve line structure using
             * the Y coordinate of PDF text items.
             *
             * This is much better than simply joining
             * every text item with spaces.
             */

            const lines =
                buildPDFTextLines(
                    textItems
                );


            if (lines.trim()) {

                finalText +=
                    lines;

            } else {

                finalText +=
                    pageText;

            }


            continue;

        }


        /* =================================================
           SECOND: OCR THIS PAGE
           ================================================= */

        setStatus(
            `SCANNED CONTENT DETECTED · OCR PAGE ${pageNumber}/${pdf.numPages}`,
            "processing"
        );


        const viewport =
            page.getViewport({
                scale: 2
            });


        const canvas =
            document.createElement(
                "canvas"
            );


        const context =
            canvas.getContext(
                "2d",
                {
                    willReadFrequently: true
                }
            );


        canvas.width =
            Math.ceil(
                viewport.width
            );


        canvas.height =
            Math.ceil(
                viewport.height
            );


        /*
         * White background helps OCR with
         * transparent/odd PDF rendering.
         */

        context.fillStyle =
            "#ffffff";


        context.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        await page.render({
            canvasContext: context,
            viewport
        }).promise;


        if (
            typeof Tesseract ===
            "undefined"
        ) {

            throw new Error(
                "Tesseract.js is not available for scanned PDF OCR."
            );

        }


        const result =
            await Tesseract.recognize(
                canvas,
                "eng",
                {

                    logger: (message) => {

                        if (
                            message &&
                            typeof message.progress ===
                            "number"
                        ) {

                            const percent =
                                Math.round(
                                    message.progress *
                                    100
                                );


                            setStatus(
                                `OCR PAGE ${pageNumber}/${pdf.numPages} · ${percent}%`,
                                "processing"
                            );

                        }

                    }

                }
            );


        const ocrPageText =
            result?.data?.text || "";


        if (
            ocrPageText.trim()
        ) {

            finalText +=
                `\n\n--- PAGE ${pageNumber} ---\n\n`;


            finalText +=
                ocrPageText.trim();

        }

    }


    /* =====================================================
       FINAL CLEANUP
       ===================================================== */

    return cleanExtractedText(
        finalText
    );

}


/* =========================================================
   BUILD PDF TEXT LINES
   ========================================================= */

function buildPDFTextLines(
    textItems
) {

    if (
        !textItems ||
        textItems.length === 0
    ) {

        return "";

    }


    /*
     * PDF.js gives each text item a transform.
     *
     * transform[5] represents the vertical
     * position of the text on the page.
     *
     * Items with similar Y positions belong
     * to the same visual line.
     */

    const items =
        textItems
            .filter(item =>
                typeof item.str ===
                "string" &&
                item.str.trim()
            )
            .map(item => {

                return {

                    text:
                        item.str.trim(),

                    x:
                        item.transform
                            ? item.transform[4]
                            : 0,

                    y:
                        item.transform
                            ? item.transform[5]
                            : 0

                };

            });


    if (
        items.length === 0
    ) {

        return "";

    }


    /*
     * Sort from top to bottom,
     * then left to right.
     */

    items.sort(
        (a, b) => {

            const yDifference =
                Math.abs(
                    b.y - a.y
                );


            if (
                yDifference > 3
            ) {

                return b.y - a.y;

            }


            return a.x - b.x;

        }
    );


    const lines = [];


    /*
     * Vertical tolerance.
     *
     * PDF documents don't always give exactly
     * the same Y coordinate to characters
     * on the same visual line.
     */

    const LINE_TOLERANCE = 4;


    for (
        const item of items
    ) {

        let matchingLine =
            null;


        for (
            const line of lines
        ) {

            if (
                Math.abs(
                    line.y - item.y
                ) <= LINE_TOLERANCE
            ) {

                matchingLine =
                    line;

                break;

            }

        }


        if (
            matchingLine
        ) {

            matchingLine.items.push(
                item
            );

        } else {

            lines.push({

                y:
                    item.y,

                items: [
                    item
                ]

            });

        }

    }


    /*
     * Sort lines again from top to bottom.
     */

    lines.sort(
        (a, b) =>
            b.y - a.y
    );


    /*
     * Build readable lines.
     */

    const output =
        lines
            .map(line => {

                line.items.sort(
                    (a, b) =>
                        a.x - b.x
                );


                return line.items
                    .map(item =>
                        item.text
                    )
                    .join(" ")
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim();

            })
            .filter(Boolean)
            .join("\n");


    return output;

}


/* =========================================================
   CLEAN EXTRACTED TEXT
   ========================================================= */

function cleanExtractedText(text) {

    if (!text) {
        return "";
    }


    return text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{4,}/g, "\n\n")
        .trim();

}


/* =========================================================
   SAVE CURRENT DOCUMENT
   ========================================================= */

/* =========================================================
   REVIX — SAVE CURRENT DOCUMENT AS STYLED EXCEL
   ========================================================= */

function saveCurrentDocument() {

    /* =====================================================
       CHECK DOCUMENT SELECTION
       ===================================================== */

    if (!selectedDocumentId) {

        setStatus(
            "NO DOCUMENT SELECTED",
            "error"
        );

        return;

    }


    /* =====================================================
       FIND CURRENT DOCUMENT
       ===================================================== */

    const documentObject =
        documents.find(
            documentItem =>
                documentItem.id ===
                selectedDocumentId
        );


    if (!documentObject) {

        setStatus(
            "DOCUMENT NOT FOUND",
            "error"
        );

        return;

    }


    /* =====================================================
       GET EXTRACTED INFORMATION
       ===================================================== */

    const extractedContent =
        extractedText
            ? extractedText.value.trim()
            : "";


    if (!extractedContent) {

        setStatus(
            "NO EXTRACTED INFORMATION TO SAVE",
            "error"
        );

        return;

    }


    /* =====================================================
       CHECK XLSX LIBRARY
       ===================================================== */

    if (
        typeof XLSX === "undefined"
    ) {

        console.error(
            "XLSX library is not available."
        );

        setStatus(
            "EXCEL MODULE NOT AVAILABLE",
            "error"
        );

        alert(
            "Excel export could not start.\n\n" +
            "The Excel module was not loaded. " +
            "Please refresh the page and try again."
        );

        return;

    }


    try {

        setStatus(
            "BUILDING EXCEL REPORT",
            "processing"
        );


        /* =================================================
           SAVE CURRENT EDITED TEXT
           ================================================= */

        documentObject.extractedText =
            extractedContent;

        documentObject.processed =
            true;


        /* =================================================
           PREPARE EXTRACTED LINES
           ================================================= */

        const lines =
            extractedContent
                .split(/\n/)
                .map(
                    line =>
                        line.trim()
                )
                .filter(
                    line =>
                        line.length > 0
                );


        /* =================================================
           CREATE WORKSHEET DATA
           ================================================= */

        const rows = [];


        /* -------------------------------------------------
           TITLE
           ------------------------------------------------- */

        rows.push([
            "REVIX",
            "DOCUMENT INTELLIGENCE REPORT"
        ]);


        rows.push([
            ""
        ]);


        /* -------------------------------------------------
           DOCUMENT INFORMATION
           ------------------------------------------------- */

        rows.push([
            "DOCUMENT INFORMATION"
        ]);


        rows.push([
            "Document Name",
            documentObject.name
        ]);


        rows.push([
            "File Type",
            documentObject.type
        ]);


        rows.push([
            "File Size",
            formatFileSize(
                documentObject.size
            )
        ]);


        rows.push([
            "Extraction Status",
            "COMPLETED"
        ]);


        rows.push([
            ""
        ]);


        /* -------------------------------------------------
           EXTRACTION SECTION
           ------------------------------------------------- */

        rows.push([
            "EXTRACTED INFORMATION"
        ]);


        rows.push([
            "No.",
            "Extracted Text"
        ]);


        /* -------------------------------------------------
           ADD EXTRACTED INFORMATION
           ------------------------------------------------- */

        lines.forEach(
            (line, index) => {

                rows.push([
                    index + 1,
                    line
                ]);

            }
        );


        /* =================================================
           CREATE WORKSHEET
           ================================================= */

        const worksheet =
            XLSX.utils.aoa_to_sheet(
                rows
            );


        /* =================================================
           MERGE TITLE
           ================================================= */

        worksheet["!merges"] = [

            {
                s: {
                    r: 0,
                    c: 0
                },

                e: {
                    r: 0,
                    c: 1
                }
            },

            {
                s: {
                    r: 2,
                    c: 0
                },

                e: {
                    r: 2,
                    c: 1
                }
            },

            {
                s: {
                    r: 8,
                    c: 0
                },

                e: {
                    r: 8,
                    c: 1
                }

            }

        ];


        /* =================================================
           COLUMN WIDTHS
           ================================================= */

        worksheet["!cols"] = [

            {
                wch: 8
            },

            {
                wch: 95
            }

        ];


        /* =================================================
           ROW HEIGHTS
           ================================================= */

        worksheet["!rows"] = [

            {
                hpt: 32
            },

            {
                hpt: 10
            },

            {
                hpt: 24
            },

            {
                hpt: 22
            },

            {
                hpt: 22
            },

            {
                hpt: 22
            },

            {
                hpt: 22
            },

            {
                hpt: 10
            },

            {
                hpt: 24
            },

            {
                hpt: 25
            }

        ];


        /* =================================================
           REVIX COLOR PALETTE
           ================================================= */

        const DARK_GREEN =
            "071B16";

        const DEEP_GREEN =
            "0B2921";

        const ACCENT_GREEN =
            "4AEBAB";

        const LIGHT_GREEN =
            "DFF8EF";

        const SOFT_GREEN =
            "EEF9F5";

        const WHITE =
            "FFFFFF";

        const TEXT_DARK =
            "17352C";

        const BORDER =
            "B8DCD0";

        const MUTED =
            "5C756D";


        /* =================================================
           COMMON BORDER
           ================================================= */

        const thinBorder = {

            top: {
                style: "thin",
                color: {
                    rgb: BORDER
                }
            },

            bottom: {
                style: "thin",
                color: {
                    rgb: BORDER
                }
            },

            left: {
                style: "thin",
                color: {
                    rgb: BORDER
                }
            },

            right: {
                style: "thin",
                color: {
                    rgb: BORDER
                }
            }

        };


        /* =================================================
           TITLE STYLE
           ================================================= */

        if (worksheet["A1"]) {

            worksheet["A1"].s = {

                font: {

                    name: "Aptos Display",

                    sz: 18,

                    bold: true,

                    color: {
                        rgb: WHITE
                    }

                },

                fill: {

                    fgColor: {
                        rgb: DARK_GREEN
                    }

                },

                alignment: {

                    horizontal: "left",

                    vertical: "center"

                }

            };

        }


        /* -------------------------------------------------
           TITLE SECOND CELL
           ------------------------------------------------- */

        if (worksheet["B1"]) {

            worksheet["B1"].s = {

                font: {

                    name: "Aptos",

                    sz: 11,

                    bold: true,

                    color: {
                        rgb: ACCENT_GREEN
                    }

                },

                fill: {

                    fgColor: {
                        rgb: DARK_GREEN
                    }

                },

                alignment: {

                    horizontal: "right",

                    vertical: "center"

                }

            };

        }


        /* =================================================
           DOCUMENT INFORMATION HEADER
           ================================================= */

        if (worksheet["A3"]) {

            worksheet["A3"].s = {

                font: {

                    name: "Aptos",

                    sz: 11,

                    bold: true,

                    color: {
                        rgb: WHITE
                    }

                },

                fill: {

                    fgColor: {
                        rgb: DEEP_GREEN
                    }

                },

                alignment: {

                    horizontal: "left",

                    vertical: "center"

                }

            };

        }


        /* =================================================
           DOCUMENT INFORMATION CELLS
           ================================================= */

        for (
            let row = 3;
            row <= 6;
            row++
        ) {

            const fieldCell =
                worksheet[
                    `A${row + 1}`
                ];

            const valueCell =
                worksheet[
                    `B${row + 1}`
                ];


            if (fieldCell) {

                fieldCell.s = {

                    font: {

                        name: "Aptos",

                        sz: 10,

                        bold: true,

                        color: {
                            rgb: TEXT_DARK
                        }

                    },

                    fill: {

                        fgColor: {
                            rgb: SOFT_GREEN
                        }

                    },

                    border:
                        thinBorder,

                    alignment: {

                        vertical: "center"

                    }

                };

            }


            if (valueCell) {

                valueCell.s = {

                    font: {

                        name: "Aptos",

                        sz: 10,

                        color: {
                            rgb: TEXT_DARK
                        }

                    },

                    border:
                        thinBorder,

                    alignment: {

                        vertical: "center",

                        wrapText: true

                    }

                };

            }

        }


        /* =================================================
           EXTRACTION SECTION HEADER
           ================================================= */

        if (worksheet["A9"]) {

            worksheet["A9"].s = {

                font: {

                    name: "Aptos",

                    sz: 11,

                    bold: true,

                    color: {
                        rgb: WHITE
                    }

                },

                fill: {

                    fgColor: {
                        rgb: DEEP_GREEN
                    }

                },

                alignment: {

                    horizontal: "left",

                    vertical: "center"

                }

            };

        }


        /* =================================================
           TABLE HEADER
           ================================================= */

        if (worksheet["A10"]) {

            worksheet["A10"].s = {

                font: {

                    name: "Aptos",

                    sz: 10,

                    bold: true,

                    color: {
                        rgb: WHITE
                    }

                },

                fill: {

                    fgColor: {
                        rgb: DARK_GREEN
                    }

                },

                border:
                    thinBorder,

                alignment: {

                    horizontal: "center",

                    vertical: "center"

                }

            };

        }


        if (worksheet["B10"]) {

            worksheet["B10"].s = {

                font: {

                    name: "Aptos",

                    sz: 10,

                    bold: true,

                    color: {
                        rgb: WHITE
                    }

                },

                fill: {

                    fgColor: {
                        rgb: DARK_GREEN
                    }

                },

                border:
                    thinBorder,

                alignment: {

                    horizontal: "left",

                    vertical: "center"

                }

            };

        }


        /* =================================================
           STYLE EXTRACTED DATA
           ================================================= */

        const firstDataRow = 11;

        const lastDataRow =
            10 + lines.length;


        for (
            let row = firstDataRow;
            row <= lastDataRow;
            row++
        ) {

            const numberCell =
                worksheet[
                    `A${row}`
                ];

            const textCell =
                worksheet[
                    `B${row}`
                ];


            /* ------------------------------------------------
               ALTERNATING ROW BACKGROUND
               ------------------------------------------------ */

            const isEvenRow =
                (row - firstDataRow) % 2 === 0;


            const rowFill =
                isEvenRow
                    ? WHITE
                    : SOFT_GREEN;


            /* ------------------------------------------------
               NUMBER CELL
               ------------------------------------------------ */

            if (numberCell) {

                numberCell.s = {

                    font: {

                        name: "Aptos",

                        sz: 10,

                        color: {
                            rgb: MUTED
                        }

                    },

                    fill: {

                        fgColor: {
                            rgb: rowFill
                        }

                    },

                    border:
                        thinBorder,

                    alignment: {

                        horizontal: "center",

                        vertical: "top"

                    }

                };

            }


            /* ------------------------------------------------
               TEXT CELL
               ------------------------------------------------ */

            if (textCell) {

                textCell.s = {

                    font: {

                        name: "Aptos",

                        sz: 10,

                        color: {
                            rgb: TEXT_DARK
                        }

                    },

                    fill: {

                        fgColor: {
                            rgb: rowFill
                        }

                    },

                    border:
                        thinBorder,

                    alignment: {

                        horizontal: "left",

                        vertical: "top",

                        wrapText: true

                    }

                };

            }


            /* ------------------------------------------------
               GIVE LONG TEXT MORE HEIGHT
               ------------------------------------------------ */

            if (textCell) {

                const text =
                    String(
                        textCell.v || ""
                    );


                const estimatedLines =
                    Math.max(
                        1,
                        Math.ceil(
                            text.length / 100
                        )
                    );


                worksheet["!rows"][
                    row - 1
                ] = {

                    hpt:
                        Math.min(
                            18 +
                            estimatedLines *
                            12,
                            90
                        )

                };

            }

        }


        /* =================================================
           AUTO FILTER
           ================================================= */

        worksheet["!autofilter"] = {

            ref:
                `A10:B${Math.max(
                    10,
                    lastDataRow
                )}`

        };


        /* =================================================
           FREEZE HEADER ROW
           ================================================= */

        worksheet["!freeze"] = {

            xSplit: 0,

            ySplit: 10

        };


        /* =================================================
           CREATE WORKBOOK
           ================================================= */

        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Extracted Data"
        );


        /* =================================================
           WORKBOOK PROPERTIES
           ================================================= */

        workbook.Props = {

            Title:
                "REVIX Document Intelligence Report",

            Subject:
                "Extracted Document Information",

            Author:
                "REVIX",

            Company:
                "REVIX",

            CreatedDate:
                new Date()

        };


        /* =================================================
           ASK USER FOR FILE NAME
           ================================================= */

        let defaultName =
            documentObject.name
                .replace(
                    /\.[^/.]+$/,
                    ""
                )
                .trim();


        if (!defaultName) {

            defaultName =
                "REVIX_Document";

        }


        const requestedName =
            window.prompt(
                "Enter a name for the Excel file:",
                `${defaultName}_REVIX`
            );


        /* =================================================
           USER CANCELLED
           ================================================= */

        if (
            requestedName === null
        ) {

            setStatus(
                "EXCEL EXPORT CANCELLED",
                ""
            );

            return;

        }


        /* =================================================
           CLEAN FILE NAME
           ================================================= */

        let fileName =
            requestedName.trim();


        if (!fileName) {

            fileName =
                "REVIX_Document";

        }


        fileName =
            fileName.replace(
                /\.xlsx$/i,
                ""
            );


        fileName =
            fileName.replace(
                /[<>:"/\\|?*]/g,
                "_"
            );


        fileName =
            `${fileName}.xlsx`;


        /* =================================================
           WRITE EXCEL FILE
           ================================================= */

        XLSX.writeFile(
            workbook,
            fileName
        );


        /* =================================================
           UPDATE DOCUMENT STATE
           ================================================= */

        documentObject.status =
            "EXCEL EXPORTED";


        documentObject.extractedText =
            extractedContent;


        documentObject.processed =
            true;


        /* =================================================
           LOCK EDITING
           ================================================= */

        if (extractedText) {

            extractedText.readOnly =
                true;

        }


        editingDocument =
            false;


        if (editButton) {

            editButton.textContent =
                "EDIT";

        }


        /* =================================================
           SUCCESS
           ================================================= */

        setStatus(
            "EXCEL FILE SAVED",
            "success"
        );


        renderDocumentList();


    } catch (error) {

        console.error(
            "Excel export failed:",
            error
        );


        setStatus(
            "EXCEL EXPORT FAILED",
            "error"
        );


        alert(
            "Excel export failed.\n\n" +
            "Technical error:\n" +
            error.message
        );

    }

}

/* =========================================================
   RENDER DOCUMENT LIST
   ========================================================= */

function renderDocumentList() {

    if (!documentsContainer) {
        return;
    }


    const query =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const filteredDocuments =
        documents.filter(
            documentObject =>
                documentObject.name
                    .toLowerCase()
                    .includes(query)
        );


    documentsContainer.innerHTML = "";


    if (documents.length === 0) {

        documentsContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    R
                </div>

                <div class="empty-state-title">
                    NO DOCUMENTS
                </div>

                <div class="empty-state-text">
                    Upload a document to begin.
                </div>

            </div>

        `;

        return;

    }


    if (filteredDocuments.length === 0) {

        documentsContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    ⌕
                </div>

                <div class="empty-state-title">
                    NO MATCHES
                </div>

                <div class="empty-state-text">
                    No documents match your search.
                </div>

            </div>

        `;

        return;

    }


    filteredDocuments.forEach(
        documentObject => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "document-card";


            if (
                documentObject.id ===
                selectedDocumentId
            ) {

                card.classList.add(
                    "selected"
                );

            }


            const infoButton =
                document.createElement(
                    "button"
                );


            infoButton.type =
                "button";


            infoButton.className =
                "document-card-info";


            const title =
                document.createElement(
                    "div"
                );


            title.className =
                "document-card-title";


            title.textContent =
                documentObject.name;


            const meta =
                document.createElement(
                    "div"
                );


            meta.className =
                "document-card-meta";


            const statusText =
                documentObject.status ||
                "READY";


            meta.textContent =
                `${documentObject.type} · ${statusText}`;


            infoButton.appendChild(
                title
            );


            infoButton.appendChild(
                meta
            );


            infoButton.addEventListener(
                "click",
                () => {

                    selectDocument(
                        documentObject.id
                    );

                }
            );


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";


            deleteButton.className =
                "document-delete-button";


            deleteButton.textContent =
                "DELETE";


            deleteButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    deleteDocument(
                        documentObject.id
                    );

                }
            );


            card.appendChild(
                infoButton
            );


            card.appendChild(
                deleteButton
            );


            documentsContainer.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   DELETE DOCUMENT
   ========================================================= */

function deleteDocument(documentId) {

    const index =
        documents.findIndex(
            documentObject =>
                documentObject.id ===
                documentId
        );


    if (index === -1) {
        return;
    }


    const documentObject =
        documents[index];


    const confirmed =
        window.confirm(
            `Delete "${documentObject.name}"?`
        );


    if (!confirmed) {
        return;
    }


    if (documentObject.url) {

        URL.revokeObjectURL(
            documentObject.url
        );

    }


    documents.splice(
        index,
        1
    );


    if (
        selectedDocumentId ===
        documentId
    ) {

        selectedDocumentId =
            null;


        if (workspaceEmpty) {

            workspaceEmpty.classList.remove(
                "hidden"
            );

        }


        if (documentViewer) {

            documentViewer.classList.add(
                "hidden"
            );

        }


        resetPreview();


        if (extractedText) {
            extractedText.value = "";
        }


        setStatus(
            "READY",
            ""
        );

    }


    renderDocumentList();

}


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(
    message,
    state = ""
) {

    if (!extractionStatus) {
        return;
    }


    extractionStatus.textContent =
        message;


    extractionStatus.classList.remove(
        "success",
        "processing",
        "error"
    );


    if (state) {

        extractionStatus.classList.add(
            state
        );

    }

}


/* =========================================================
   FILE TYPE
   ========================================================= */

function getFileType(file) {

    const extension =
        getExtension(
            file.name
        );


    if (
        extension === "pdf" ||
        file.type === "application/pdf"
    ) {

        return "PDF";

    }


    if (
        [
            "png",
            "jpg",
            "jpeg",
            "avif"
        ].includes(extension) ||
        file.type.startsWith("image/")
    ) {

        return "IMAGE";

    }


    if (
        extension === "txt" ||
        file.type === "text/plain"
    ) {

        return "TEXT";

    }


    return "DOCUMENT";

}


/* =========================================================
   FILE EXTENSION
   ========================================================= */

function getExtension(filename) {

    if (!filename) {
        return "";
    }


    const parts =
        filename
            .toLowerCase()
            .split(".");


    return parts.length > 1
        ? parts.pop()
        : "";

}


/* =========================================================
   FILE SIZE
   ========================================================= */

function formatFileSize(bytes) {

    if (
        !bytes ||
        bytes === 0
    ) {

        return "0 KB";

    }


    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    const size =
        bytes /
        Math.pow(
            1024,
            index
        );


    return `${size.toFixed(
        index === 0 ? 0 : 1
    )} ${units[index]}`;

}


/* =========================================================
   REVIX — INTERACTIVE STARS + GLOWY WAVES
   ========================================================= */

function initializeWaveAnimation() {

    if (!waveCanvas) {
        return;
    }


    const ctx =
        waveCanvas.getContext("2d");


    if (!ctx) {
        return;
    }


    let canvasWidth = 0;
    let canvasHeight = 0;
    let animationFrame;


    const stars = [];

    const STAR_COUNT = 95;


    const mouse = {

        x: window.innerWidth / 2,

        y: window.innerHeight / 2,

        targetX: window.innerWidth / 2,

        targetY: window.innerHeight / 2

    };


    /* =====================================================
       CANVAS RESIZE
       ===================================================== */

    function resizeCanvas() {

        const dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        canvasWidth =
            window.innerWidth;


        canvasHeight =
            window.innerHeight;


        waveCanvas.width =
            canvasWidth * dpr;


        waveCanvas.height =
            canvasHeight * dpr;


        waveCanvas.style.width =
            `${canvasWidth}px`;


        waveCanvas.style.height =
            `${canvasHeight}px`;


        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

    }


    /* =====================================================
       MOUSE INTERACTION
       ===================================================== */

    window.addEventListener(
        "pointermove",
        event => {

            mouse.targetX =
                event.clientX;


            mouse.targetY =
                event.clientY;

        }
    );


    window.addEventListener(
        "pointerleave",
        () => {

            mouse.targetX =
                canvasWidth / 2;


            mouse.targetY =
                canvasHeight / 2;

        }
    );


    /* =====================================================
       CREATE STARS
       ===================================================== */

    function createStars() {

        stars.length = 0;


        for (
            let i = 0;
            i < STAR_COUNT;
            i++
        ) {

            stars.push({

                x:
                    Math.random() *
                    canvasWidth,

                y:
                    Math.random() *
                    canvasHeight,

                radius:
                    Math.random() *
                    1.35 +
                    0.25,

                opacity:
                    Math.random() *
                    0.65 +
                    0.15,

                baseOpacity:
                    Math.random() *
                    0.65 +
                    0.15,

                twinkleSpeed:
                    Math.random() *
                    0.025 +
                    0.008,

                twinkleOffset:
                    Math.random() *
                    Math.PI *
                    2,

                drift:
                    Math.random() *
                    0.15 +
                    0.02

            });

        }

    }


    /* =====================================================
       DRAW STAR
       ===================================================== */

    function drawStar(
        star,
        time
    ) {

        const twinkle =
            Math.sin(
                time *
                star.twinkleSpeed +
                star.twinkleOffset
            ) *
            0.5 +
            0.5;


        star.opacity =
            star.baseOpacity +
            twinkle * 0.25;


        const dx =
            mouse.x -
            star.x;


        const dy =
            mouse.y -
            star.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        let interaction = 0;


        if (distance < 220) {

            interaction =
                1 -
                distance / 220;

        }


        ctx.beginPath();


        ctx.arc(
            star.x,
            star.y,
            star.radius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            `rgba(160, 255, 218, ${Math.min(
                star.opacity +
                interaction * 0.45,
                1
            )})`;


        ctx.shadowBlur =
            2 +
            interaction * 5;


        ctx.shadowColor =
            "rgba(80, 255, 190, 0.8)";


        ctx.fill();


        ctx.shadowBlur = 0;

    }


    /* =====================================================
       DRAW GLOWY WAVE
       ===================================================== */

    function drawWave(
        time,
        amplitude,
        frequency,
        speed,
        verticalPosition,
        opacity,
        thickness
    ) {

        ctx.beginPath();


        for (
            let x = -20;
            x <= canvasWidth + 20;
            x += 10
        ) {

            const normalizedX =
                x / canvasWidth;


            const wave =
                Math.sin(
                    normalizedX *
                    Math.PI *
                    frequency +
                    time * speed
                ) *
                amplitude;


            const secondaryWave =
                Math.sin(
                    normalizedX *
                    Math.PI *
                    (frequency * 0.47) -
                    time *
                    speed *
                    0.65
                ) *
                amplitude *
                0.38;


            const mouseInfluence =
                Math.exp(
                    -Math.pow(
                        (x - mouse.x) / 260,
                        2
                    )
                );


            const interactiveWave =
                mouseInfluence *
                Math.sin(
                    normalizedX *
                    Math.PI *
                    3 +
                    time * 0.8
                ) *
                16;


            const y =
                verticalPosition +
                wave +
                secondaryWave +
                interactiveWave;


            if (x === -20) {

                ctx.moveTo(
                    x,
                    y
                );

            } else {

                ctx.lineTo(
                    x,
                    y
                );

            }

        }


        ctx.lineWidth =
            thickness;


        ctx.strokeStyle =
            `rgba(74, 235, 170, ${opacity})`;


        ctx.shadowBlur = 22;


        ctx.shadowColor =
            "rgba(42, 226, 151, 0.35)";


        ctx.stroke();


        ctx.shadowBlur = 0;

    }


    /* =====================================================
       WAVE PARTICLES
       ===================================================== */

    function drawWaveParticles(time) {

        const count = 32;


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const progress =
                (
                    i / count +
                    time * 0.000025
                ) % 1;


            const x =
                progress *
                canvasWidth;


            const wave =
                Math.sin(
                    progress *
                    Math.PI *
                    4 +
                    time *
                    0.0015
                ) *
                65;


            const y =
                canvasHeight *
                0.60 +
                wave;


            const pulse =
                Math.sin(
                    time *
                    0.002 +
                    i
                ) *
                0.5 +
                0.5;


            ctx.beginPath();


            ctx.arc(
                x,
                y,
                0.8 +
                pulse * 1.2,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                `rgba(113, 255, 202, ${
                    0.12 +
                    pulse * 0.30
                })`;


            ctx.shadowBlur = 10;


            ctx.shadowColor =
                "rgba(73, 244, 175, 0.7)";


            ctx.fill();


            ctx.shadowBlur = 0;

        }

    }


    /* =====================================================
       ANIMATION LOOP
       ===================================================== */

    function animate(time) {

        ctx.clearRect(
            0,
            0,
            canvasWidth,
            canvasHeight
        );


        mouse.x +=
            (
                mouse.targetX -
                mouse.x
            ) *
            0.045;


        mouse.y +=
            (
                mouse.targetY -
                mouse.y
            ) *
            0.045;


        /* -------------------------------------------------
           STARS
           ------------------------------------------------- */

        for (const star of stars) {

            star.y -=
                star.drift *
                0.08;


            if (star.y < -5) {

                star.y =
                    canvasHeight + 5;


                star.x =
                    Math.random() *
                    canvasWidth;

            }


            drawStar(
                star,
                time
            );

        }


        /* -------------------------------------------------
           GLOWY WAVES
           ------------------------------------------------- */

        drawWave(
            time * 0.001,
            42,
            3.2,
            1.0,
            canvasHeight * 0.59,
            0.12,
            1
        );


        drawWave(
            time * 0.001,
            28,
            4.5,
            -0.75,
            canvasHeight * 0.63,
            0.09,
            1
        );


        drawWave(
            time * 0.001,
            20,
            6,
            0.55,
            canvasHeight * 0.67,
            0.055,
            1
        );


        drawWaveParticles(
            time
        );


        animationFrame =
            requestAnimationFrame(
                animate
            );

    }


    /* =====================================================
       START ANIMATION
       ===================================================== */

    resizeCanvas();

    createStars();


    window.addEventListener(
        "resize",
        () => {

            resizeCanvas();

            createStars();

        }
    );


    animationFrame =
        requestAnimationFrame(
            animate
        );


    /* =====================================================
       CLEANUP
       ===================================================== */

    window.addEventListener(
        "beforeunload",
        () => {

            if (animationFrame) {

                cancelAnimationFrame(
                    animationFrame
                );

            }

        }
    );

}


/* =========================================================
   PAGE CLEANUP
   ========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        documents.forEach(
            documentObject => {

                if (documentObject.url) {

                    URL.revokeObjectURL(
                        documentObject.url
                    );

                }

            }
        );

    }
);