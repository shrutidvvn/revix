from pathlib import Path
import os
import shutil

from pypdf import PdfReader


# =========================================================
# TESSERACT CONFIGURATION
# =========================================================

def get_tesseract_path():
    """
    Find the Tesseract OCR executable.

    Priority:
    1. TESSERACT_CMD environment variable
    2. Tesseract available on PATH
    3. Common Windows installation paths
    """

    # Render / Linux / custom deployment
    env_path = os.getenv("TESSERACT_CMD")

    if env_path and Path(env_path).exists():
        return env_path

    # If tesseract is available through PATH
    path_tesseract = shutil.which("tesseract")

    if path_tesseract:
        return path_tesseract

    # Common Windows installation locations
    windows_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    ]

    for path in windows_paths:
        if Path(path).exists():
            return path

    return None


# =========================================================
# TESSERACT INITIALIZATION
# =========================================================

def configure_tesseract():
    """
    Configure pytesseract to use the available Tesseract
    installation.
    """

    try:
        import pytesseract
    except ImportError as error:
        raise RuntimeError(
            "pytesseract is not installed."
        ) from error

    tesseract_path = get_tesseract_path()

    if not tesseract_path:
        raise RuntimeError(
            "Tesseract OCR could not be found. "
            "Please install Tesseract OCR or configure "
            "the TESSERACT_CMD environment variable."
        )

    pytesseract.pytesseract.tesseract_cmd = tesseract_path

    return pytesseract


# =========================================================
# IMAGE OCR
# =========================================================

def extract_text_from_image(
    file_path: Path
) -> str:
    """
    Extract text from PNG/JPG/JPEG/AVIF using Tesseract OCR.
    """

    try:
        pytesseract = configure_tesseract()

        from PIL import Image

        # Enable AVIF support
        try:
            import pillow_avif
        except ImportError as error:
            raise RuntimeError(
                "AVIF support is not installed. "
                "Run: pip install pillow-avif-plugin"
            ) from error

    except ImportError as error:
        raise RuntimeError(
            "Image OCR requires pytesseract, Pillow "
            "and pillow-avif-plugin."
        ) from error

    # =====================================================
    # OPEN IMAGE
    # =====================================================

    try:
        image = Image.open(file_path)

        # Convert all supported image types to RGB
        image = image.convert("RGB")

    except Exception as error:
        raise RuntimeError(
            f"Unable to read image file: {error}"
        ) from error

    # =====================================================
    # RUN OCR
    # =====================================================

    try:
        text = pytesseract.image_to_string(
            image,
            config="--psm 6"
        )

    except Exception as error:
        raise RuntimeError(
            f"OCR processing failed: {error}"
        ) from error

    return text.strip()


# =========================================================
# PDF TEXT EXTRACTION
# =========================================================

def extract_text_from_pdf(
    file_path: Path
) -> str:
    """
    Extract text from a PDF.

    First attempts normal PDF text extraction using pypdf.

    If the PDF appears to be scanned/image-based,
    automatically falls back to OCR.
    """

    try:
        reader = PdfReader(file_path)

    except Exception as error:
        raise RuntimeError(
            f"Unable to read PDF file: {error}"
        ) from error

    text_parts = []

    # =====================================================
    # FIRST PASS — NORMAL PDF TEXT
    # =====================================================

    for page in reader.pages:

        try:
            page_text = page.extract_text()

        except Exception:
            page_text = None

        if page_text:
            cleaned = page_text.strip()

            if cleaned:
                text_parts.append(cleaned)

    extracted_text = "\n\n".join(text_parts).strip()

    # =====================================================
    # DETERMINE WHETHER OCR IS NEEDED
    # =====================================================

    # If enough actual text was extracted, use it directly.
    #
    # This keeps normal text-based PDFs fast and avoids
    # unnecessary OCR processing.

    if len(extracted_text) >= 100:
        return extracted_text

    # =====================================================
    # SECOND PASS — OCR SCANNED PDF
    # =====================================================

    try:
        return extract_text_from_scanned_pdf(
            file_path
        )

    except Exception as ocr_error:

        # If normal extraction produced some text,
        # return that rather than completely failing.

        if extracted_text:
            return extracted_text

        raise RuntimeError(
            f"PDF text extraction failed and OCR could "
            f"not process the document: {ocr_error}"
        ) from ocr_error


# =========================================================
# OCR SCANNED PDF
# =========================================================

def extract_text_from_scanned_pdf(
    file_path: Path
) -> str:
    """
    Render scanned PDF pages as images and OCR them
    using Tesseract.
    """

    try:
        import pytesseract
        from pdf2image import convert_from_path

    except ImportError as error:
        raise RuntimeError(
            "Scanned PDF OCR requires pytesseract "
            "and pdf2image."
        ) from error

    # Configure Tesseract
    configure_tesseract()

    # =====================================================
    # OCR PDF PAGE BY PAGE
    # =====================================================

    page_texts = []

    try:

        reader = PdfReader(file_path)

        total_pages = len(reader.pages)

        for page_number in range(
            1,
            total_pages + 1
        ):

            try:

                images = convert_from_path(
                    str(file_path),
                    dpi=200,
                    first_page=page_number,
                    last_page=page_number,
                    fmt="png"
                )

                if not images:
                    continue

                image = images[0]

                # Convert to RGB
                image = image.convert("RGB")

                text = pytesseract.image_to_string(
                    image,
                    config="--psm 6"
                )

                text = text.strip()

                if text:
                    page_texts.append(
                        f"--- Page {page_number} ---\n{text}"
                    )

            except Exception as page_error:

                # Continue processing remaining pages
                page_texts.append(
                    f"--- Page {page_number} ---\n"
                    f"[OCR failed for this page: {page_error}]"
                )

    except Exception as error:
        raise RuntimeError(
            f"Failed to process scanned PDF: {error}"
        ) from error

    return "\n\n".join(
        page_texts
    ).strip()


# =========================================================
# GENERAL DOCUMENT EXTRACTION
# =========================================================

def extract_text(
    file_path: Path
) -> str:

    extension = (
        file_path
        .suffix
        .lower()
    )

    # =====================================================
    # PDF
    # =====================================================

    if extension == ".pdf":

        return extract_text_from_pdf(
            file_path
        )

    # =====================================================
    # IMAGE
    # =====================================================

    if extension in [
        ".png",
        ".jpg",
        ".jpeg",
        ".avif"
    ]:

        return extract_text_from_image(
            file_path
        )

    # =====================================================
    # UNSUPPORTED
    # =====================================================

    raise ValueError(
        f"Unsupported file type: {extension}"
    )