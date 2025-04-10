import os
import cv2
import numpy as np
from collections import defaultdict
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

# === Init FastAPI App ===
app = FastAPI()

# === CORS Configuration ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",           # for local frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Ensure upload folder exists ===
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# === Load YOLOv8 model once at startup ===
MODEL_PATH = "../v5/my_model5yolov8.pt"
print(f"📦 Loading model from {MODEL_PATH}")
model = YOLO(MODEL_PATH)
print("✅ YOLO model loaded.")

# === Root health check ===
@app.get("/")
def root():
    return {"message": "YOLOv8 API is running 🧠🎯"}


# === Chip Detection Endpoint ===
@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    print("📩 [INFO] Received image file:", file.filename)

    contents = await file.read()
    npimg = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    if img is None:
        print("❌ [ERROR] Failed to decode image.")
        bad_path = os.path.join(UPLOAD_DIR, "bad_image.jpg")
        with open(bad_path, "wb") as f:
            f.write(contents)
        return {"error": "Could not decode image"}

    print("✅ [INFO] Image successfully decoded:", img.shape)

    # Run inference
    results = model.predict(source=img, conf=0.5, verbose=False)[0]
    print("🧠 [INFO] YOLO prediction completed.")

    chip_counts = defaultdict(int)
    detections = []

    for box, cls in zip(results.boxes.xyxy, results.boxes.cls):
        class_id = int(cls.item())
        class_name = results.names[class_id]
        chip_counts[class_name] += 1
        detections.append({
            "label": class_name,
            "box": box.tolist(),
        })

    print("🔍 [INFO] Chip counts:", dict(chip_counts))
    print("📦 [INFO] Detections:", detections)

    return {
        "chip_count": sum(chip_counts.values()),
        "counts_by_color": dict(chip_counts),
        "detections": detections,
    }
