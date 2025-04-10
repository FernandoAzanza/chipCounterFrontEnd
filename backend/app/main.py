import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.yolo_model import predict_image

app = FastAPI()

# Enable CORS (you can restrict origins in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <-- Change to your frontend domain later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload folder for temporary images
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def root():
    return {"message": "YOLOv8 API is running 🧠🎯"}


@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    # Save the uploaded file to disk
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Run prediction
    result = predict_image(file_path)

    # Remove image after prediction
    os.remove(file_path)

    return result
