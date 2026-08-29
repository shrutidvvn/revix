from pathlib import Path

from pypdf import PdfReader


# =========================================================
# TESSERACT CONFIGURATION
# =========================================================

TESSERACT_PATH = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


# =========================================================
# PDF TEXT EXTRACTION
# =========================================================

def extract_text_from_pdf(
    file_path: Path
) -> str:

    """
    Extract text from all pages of a PDF file.
    """

    reader = PdfReader(
        file_path
    )

    text_parts = []

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:
            text_parts.append(
                page_text
            )

    return "\n".join(
        text_parts
    ).strip()


# =========================================================
# IMAGE OCR
# =========================================================

def extract_text_from_image(
    file_path: Path
) -> str:

    """
    Extract text from PNG/JPG/JPEG/AVIF
    using Tesseract OCR.
    """

    try:

        import pytesseract
        from PIL import Image

        # Enable AVIF support
        try:
            import pillow_avif
        except ImportError:

            raise RuntimeError(
                "AVIF support is not installed. "
                "Run: pip install pillow-avif-plugin"
            )

    except ImportError as error:

        raise RuntimeError(
            "Image OCR requires "
            "pytesseract, Pillow and "
            "pillow-avif-plugin."
        ) from error


    # =====================================================
    # CONNECT PYTESSERACT TO TESSERACT
    # =====================================================

    if not Path(
        TESSERACT_PATH
    ).exists():

        raise RuntimeError(
            "Tesseract OCR was not found at: "
            + TESSERACT_PATH
        )


    pytesseract.pytesseract.tesseract_cmd = (
        TESSERACT_PATH
    )


    # =====================================================
    # OPEN IMAGE
    # =====================================================

    try:

        image = Image.open(
            file_path
        )

        # Convert everything to RGB
        # before sending to OCR.

        image = image.convert(
            "RGB"
        )

    except Exception as error:

        raise RuntimeError(
            f"Unable to read image file: {error}"
        )


    # =====================================================
    # RUN OCR
    # =====================================================

    try:

        text = pytesseract.image_to_string(
            image
        )

    except Exception as error:

        raise RuntimeError(
            f"OCR processing failed: {error}"
        )


    return text.strip()


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