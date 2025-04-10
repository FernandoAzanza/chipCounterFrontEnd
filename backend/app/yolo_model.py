# backend/app/yolo_model.py

from ultralytics import YOLO

# 👇 Make sure this path is relative to the backend/ directory where you run uvicorn
# model = YOLO("v3/my_model3.pt")
model = YOLO("v2/my_model2.pt")

def predict_image(file_path: str):
    results = model(file_path)
    detections = results[0].boxes

    # Count chips
    chip_count = len(detections) if detections is not None else 0

    # Get bounding boxes as lists
    bbox_list = [box.xyxy.tolist() for box in detections] if detections else []

    return {"chip_count": chip_count, "detections": bbox_list}
