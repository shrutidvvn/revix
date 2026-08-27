from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Revix backend is working!"}