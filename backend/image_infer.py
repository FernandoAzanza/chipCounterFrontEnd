from ultralytics import YOLO
import cv2
from collections import defaultdict
import os

# 🔁 Load model
model = YOLO("v5/my_model5yolov8.pt")  # Change path if needed

# 📂 Image path — change this to the actual image filename
image_path = "test_images/IMG_9054.jpg"  # Put your photo here

# ✅ Load image
img = cv2.imread(image_path)

if img is None:
    raise FileNotFoundError(f"Couldn't find image at {image_path}")

# 🔍 Run inference
results = model.predict(source=img, conf=0.5, verbose=False)[0]

# 🎯 Analyze results
chip_counts = defaultdict(int)

for box, cls in zip(results.boxes.xyxy, results.boxes.cls):
    x1, y1, x2, y2 = map(int, box.tolist())
    class_id = int(cls.item())
    class_name = results.names[class_id]
    chip_counts[class_name] += 1
    # 🎨 Draw bounding box
    cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
    cv2.putText(img, class_name, (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

# 🧾 Print chip counts
print("\n🟢 Chip count by color:")
for color, count in chip_counts.items():
    print(f"  - {color}: {count}")

# 🖼️ Display image with boxes
cv2.imshow("Detected Chips", img)
cv2.waitKey(0)
cv2.destroyAllWindows()
