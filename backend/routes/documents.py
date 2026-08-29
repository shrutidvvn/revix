from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil
import json
import uuid

from backend.services.document_service import extract_text


# --------------------------------------------------
# ROUTER
# --------------------------------------------------

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


# --------------------------------------------------
# DIRECTORIES AND DATA FILE
# --------------------------------------------------

UPLOAD_DIR = Path("backend/uploads")
DATA_DIR = Path("backend/data")
DOCUMENTS_FILE = DATA_DIR / "documents.json"


UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)

DATA_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# --------------------------------------------------
# SUPPORTED FILE TYPES
# --------------------------------------------------

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".avif"
}


# --------------------------------------------------
# LOAD DOCUMENTS
# --------------------------------------------------

def load_documents():

    if not DOCUMENTS_FILE.exists():
        return []

    try:

        with DOCUMENTS_FILE.open(
            "r",
            encoding="utf-8"
        ) as file:

            return json.load(file)

    except (json.JSONDecodeError, OSError):

        return []


# --------------------------------------------------
# SAVE DOCUMENTS
# --------------------------------------------------

def save_documents(documents):

    with DOCUMENTS_FILE.open(
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            documents,
            file,
            indent=4,
            ensure_ascii=False
        )


# --------------------------------------------------
# UPLOAD DOCUMENT
# --------------------------------------------------

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...)
):

    # --------------------------------------------------
    # CHECK FILE NAME
    # --------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file was selected."
        )


    # --------------------------------------------------
    # CHECK FILE EXTENSION
    # --------------------------------------------------

    extension = (
        Path(file.filename)
        .suffix
        .lower()
    )


    if extension not in ALLOWED_EXTENSIONS:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Please upload a PDF, PNG, JPG, JPEG or AVIF."
            )
        )


    # --------------------------------------------------
    # GENERATE UNIQUE DOCUMENT ID
    # --------------------------------------------------

    document_id = str(
        uuid.uuid4()
    )


    # --------------------------------------------------
    # CREATE UNIQUE FILE PATH
    # --------------------------------------------------

    file_path = (
        UPLOAD_DIR /
        f"{document_id}_{file.filename}"
    )


    # --------------------------------------------------
    # SAVE FILE
    # --------------------------------------------------

    try:

        with file_path.open("wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to save uploaded file: {error}"
        )


    # --------------------------------------------------
    # EXTRACT INFORMATION
    # --------------------------------------------------

    try:

        extracted_text = extract_text(
            file_path
        )

    except Exception as error:

        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to extract information: {error}"
        )


    # --------------------------------------------------
    # LOAD EXISTING DOCUMENTS
    # --------------------------------------------------

    documents = load_documents()


    # --------------------------------------------------
    # CREATE DOCUMENT RECORD
    # --------------------------------------------------

    document = {

        "id": document_id,

        "filename": file.filename,

        "file_path": str(file_path),

        "file_type": extension,

        "characters": len(extracted_text),

        "text": extracted_text

    }


    # --------------------------------------------------
    # ADD DOCUMENT
    # --------------------------------------------------

    documents.append(
        document
    )


    # --------------------------------------------------
    # SAVE UPDATED DOCUMENT LIST
    # --------------------------------------------------

    save_documents(
        documents
    )


    # --------------------------------------------------
    # RESPONSE
    # --------------------------------------------------

    return {

        "message":
            "Document uploaded and processed successfully",

        "id":
            document_id,

        "filename":
            file.filename,

        "file_type":
            extension,

        "characters":
            len(extracted_text),

        "text_preview":
            extracted_text[:500]

    }


# --------------------------------------------------
# GET ALL DOCUMENTS
# --------------------------------------------------

@router.get("/")
async def get_documents():

    documents = load_documents()

    return {
        "documents": documents
    }


# --------------------------------------------------
# GET SINGLE DOCUMENT
# --------------------------------------------------

@router.get("/{document_id}")
async def get_document(
    document_id: str
):

    documents = load_documents()


    for document in documents:

        if document.get("id") == document_id:

            return document


    raise HTTPException(
        status_code=404,
        detail="Document not found."
    )


# --------------------------------------------------
# DELETE DOCUMENT
# --------------------------------------------------

@router.delete("/{document_id}")
async def delete_document(
    document_id: str
):

    documents = load_documents()

    document_to_delete = None

    for document in documents:

        if str(document.get("id")) == str(document_id):

            document_to_delete = document
            break


    # --------------------------------------------------
    # DOCUMENT NOT FOUND
    # --------------------------------------------------

    if document_to_delete is None:

        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    # --------------------------------------------------
# DELETE DOCUMENT
# --------------------------------------------------

@router.delete("/{document_id}")
async def delete_document(
    document_id: str
):

    documents = load_documents()

    document_to_delete = None

    for document in documents:

        if document.get("id") == document_id:
            document_to_delete = document
            break

    if document_to_delete is None:

        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    # ----------------------------------------------
    # DELETE ACTUAL FILE
    # ----------------------------------------------

    file_path = Path(
        document_to_delete.get("file_path", "")
    )

    if file_path.exists():

        try:
            file_path.unlink()

        except Exception as error:

            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete file: {error}"
            )

    # ----------------------------------------------
    # REMOVE FROM JSON
    # ----------------------------------------------

    documents = [
        document
        for document in documents
        if document.get("id") != document_id
    ]

    save_documents(documents)

    return {
        "message": "Document deleted successfully",
        "id": document_id
    }


    # --------------------------------------------------
    # DELETE PHYSICAL FILE
    # --------------------------------------------------

    file_path_value = document_to_delete.get(
        "file_path"
    )

    if file_path_value:

        file_path = Path(
            file_path_value
        )

        try:

            if file_path.exists():

                file_path.unlink()

        except OSError as error:

            raise HTTPException(
                status_code=500,
                detail=(
                    f"Could not delete document file: {error}"
                )
            )


    # --------------------------------------------------
    # REMOVE FROM DOCUMENT LIST
    # --------------------------------------------------

    documents = [
        document
        for document in documents
        if str(document.get("id")) != str(document_id)
    ]


    # --------------------------------------------------
    # SAVE UPDATED LIST
    # --------------------------------------------------

    save_documents(
        documents
    )


    # --------------------------------------------------
    # RESPONSE
    # --------------------------------------------------

    return {

        "message":
            "Document deleted successfully",

        "id":
            document_id

    }