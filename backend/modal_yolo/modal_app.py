import modal
import numpy as np
import cv2
from fastapi import File, UploadFile
from ultralytics import YOLO

# Initialize Modal app
app = modal.App("yolo-chip-detector")

# Define the Docker image with dependencies
image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install(
        "libgl1-mesa-glx",
        "libglib2.0-0",
    )
    .pip_install_from_requirements("requirements.txt")
    .pip_install("fastapi[standard]")  # ✅ Add this line
    .add_local_dir(".", remote_path="/root")
)


# Inference function for testing with local files (CLI only)
@app.function(image=image)
def run_inference(image_path: str):
    print(f"Running inference on: {image_path}")
    model = YOLO("/root/my_model5yolov8.pt")
    results = model(image_path)
    return [len(r.boxes) for r in results]


# Web endpoint: Accepts file upload, runs inference, returns chip counts
@app.function(image=image)
@modal.fastapi_endpoint(method="POST")
async def run_inference_from_upload(file: UploadFile = File(...)):
    contents = await file.read()

    # Decode image
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Run YOLO model
    model = YOLO("/root/my_model5yolov8.pt")
    results = model(img)

    # Count each chip class
    counts = {}
    for box in results[0].boxes:
        cls = int(box.cls[0])
        cls_name = model.names[cls]
        counts[cls_name] = counts.get(cls_name, 0) + 1

    return {"chip_counts": counts}
