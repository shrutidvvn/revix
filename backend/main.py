from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.documents import router as documents_router


app = FastAPI(
    title="Revix API",
    description="Backend API for the Revix document management system",
    version="1.0.0"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# DOCUMENT ROUTES
# --------------------------------------------------

app.include_router(
    documents_router,
    prefix="/api"
)


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Revix backend is working!"
    }