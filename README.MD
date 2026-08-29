# REVIX — Document Intelligence

REVIX is a document intelligence application designed to extract useful textual information from uploaded documents and present it in a clean, editable workspace.

The application supports document upload, text extraction, OCR-based processing for scanned documents, document management, and structured Excel export.

---

## Features

- Upload and manage multiple documents
- Support for PDF, PNG, JPG, JPEG, AVIF and TXT files
- PDF text extraction using PDF.js
- OCR processing for scanned PDFs and images using Tesseract.js
- Document preview
- Extracted information displayed in an editable workspace
- Manual correction of extracted information
- Export extracted information to a formatted Excel spreadsheet
- Custom Excel file naming
- Document search
- Document deletion
- Extraction status indicators
- Responsive document workspace
- Interactive animated background
- Backend API for document management

---

## Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript
- PDF.js
- Tesseract.js
- XLSX / xlsx-js-style

### Backend

- Python
- FastAPI
- Uvicorn

### API Documentation

FastAPI automatically provides interactive API documentation through:

- Swagger UI
- ReDoc

---

## How REVIX Works

The basic workflow is:

```text
Upload Document
       ↓
Document Detection
       ↓
Text Extraction
       ↓
OCR if required
       ↓
Extracted Information
       ↓
User Review & Editing
       ↓
Excel Export