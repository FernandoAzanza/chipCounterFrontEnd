import cv2
from ultralytics import YOLO
from collections import Counter

# Load the model
model = YOLO("v4/my_model4.pt")  # Make sure this path is correct!

# Map class names to colors for drawing
LABEL_COLORS = {
    "Black Chip": (0, 0, 0),
    "Blue Chip": (255, 0, 0),
    "Green Chip": (0, 255, 0),
    "Red Chip": (0, 0, 255),
    "White Chip": (255, 255, 255),
}

# Start webcam
cap = cv2.VideoCapture(0)
print("📸 Press SPACE to take a photo, ESC to exit.")

captured_frame = None

while True:
    ret, frame = cap.read()
    if not ret:
        print("❌ Failed to read from webcam")
        break

    cv2.imshow("Live Feed - Press SPACE to Capture", frame)
    key = cv2.waitKey(1)

    if key == 27:  # ESC to quit
        break
    elif key == 32:  # SPACE to capture
        captured_frame = frame.copy()
        break

cap.release()
cv2.destroyAllWindows()

if captured_frame is not None:
    print("🧠 Running inference...")
    results = model(captured_frame)[0]
    boxes = results.boxes
    names = results.names
    chip_counts = Counter()

    for box in boxes:
        cls_id = int(box.cls[0])
        name = names[cls_id]
        chip_counts[name] += 1

        x1, y1, x2, y2 = map(int, box.xyxy[0])
        color = LABEL_COLORS.get(name, (0, 255, 255))  # Default to yellow
        cv2.rectangle(captured_frame, (x1, y1), (x2, y2), color, 2)
        cv2.putText(captured_frame, name, (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    y_offset = 30
    for chip, count in chip_counts.items():
        cv2.putText(captured_frame, f"{chip}: {count}", (10, y_offset),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        y_offset += 30

    print("✅ Detection complete. Results:")
    for chip, count in chip_counts.items():
        print(f"  • {chip}: {count}")

    cv2.imshow("🧠 Chip Detection", captured_frame)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
else:
    print("⚠️ No image was captured.")
