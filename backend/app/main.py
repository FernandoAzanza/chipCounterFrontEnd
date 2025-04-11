import os
import cv2
import numpy as np
from collections import defaultdict
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

# === Init FastAPI App ===
app = FastAPI()

# === CORS (Update the domains as needed) ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://chipcounter.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Create uploads folder if needed ===
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# === Load model once ===
MODEL_PATH = "../v5/my_model5yolov8.pt"
model = YOLO(MODEL_PATH)


# === Root endpoint ===
@app.get("/")
def root():
    return {"message": "YOLOv8 API is running 🧠🎯"}


# === Predict endpoint ===
@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    npimg = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    results = model.predict(source=img, conf=0.5, verbose=False)[0]

    chip_counts = defaultdict(int)
    detections = []

    for box, cls in zip(results.boxes.xyxy, results.boxes.cls):
        class_id = int(cls.item())
        class_name = results.names[class_id]
        chip_counts[class_name] += 1
        detections.append({"label": class_name, "box": box.tolist()})

    return {
        "chip_count": sum(chip_counts.values()),
        "counts_by_color": chip_counts,
        "detections": detections,
    }
