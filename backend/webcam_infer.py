import cv2
from ultralytics import YOLO
from collections import defaultdict

# Load your trained model
model = YOLO("v5/my_model5yolov8.pt")  # Adjust path if needed

# Open webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("❌ Error: Could not open webcam.")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Run YOLO prediction
    results = model.predict(source=frame, conf=0.5, stream=False, verbose=False)
    result = results[0]

    # Count chip colors
    names = result.names
    boxes = result.boxes
    color_counts = defaultdict(int)

    if boxes is not None:
        for box in boxes:
            cls_id = int(box.cls[0])
            label = names[cls_id]
            color_counts[label] += 1

            # Get box coordinates
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = box.conf[0].item()
            label_text = f"{label}: {int(conf * 100)}%"

            # Draw bounding box
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(
                frame,
                label_text,
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 255, 0),
                2,
            )

    # Overlay chip count summary
    y_offset = 30
    cv2.putText(
        frame,
        f"🧠 Chips Detected: {sum(color_counts.values())}",
        (10, y_offset),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 255),
        2,
    )
    y_offset += 30

    for color, count in color_counts.items():
        cv2.putText(
            frame,
            f"{color.capitalize()}: {count}",
            (10, y_offset),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 255),
            2,
        )
        y_offset += 30

    # Show result
    cv2.imshow("♠️ Chip Detection", frame)

    # Quit on 'q'
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
