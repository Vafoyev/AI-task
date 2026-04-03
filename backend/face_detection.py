"""
Eye Gem — Face Detection Module (OpenCV)
"""
import cv2
import numpy as np
import os

# Load Haar cascade for face detection
CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
face_cascade = cv2.CascadeClassifier(CASCADE_PATH)


def detect_faces(image_bytes: bytes) -> dict:
    """Detect faces in image and return face coordinates."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return {"face_detected": False, "error": "Tasvir o'qib bo'lmadi"}

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _shape = gray.shape
    h, w = int(_shape[0]), int(_shape[1])

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30)
    )

    if len(faces) == 0:
        return {"face_detected": False, "message": "Yuz topilmadi"}

    # Take the largest face
    largest_face = max(faces, key=lambda f: f[2] * f[3])
    x, y, fw, fh = int(largest_face[0]), int(largest_face[1]), int(largest_face[2]), int(largest_face[3])

    # Calculate distance based on face width in pixels
    distance_cm = calculate_distance(fw, w)

    # Convert to percentage for frontend overlay
    face_box = {
        "x": float(f"{(x / w) * 100.0:.1f}"),
        "y": float(f"{(y / h) * 100.0:.1f}"),
        "w": float(f"{(fw / w) * 100.0:.1f}"),
        "h": float(f"{(fh / h) * 100.0:.1f}")
    }

    return {
        "face_detected": True,
        "face_box": face_box,
        "face_width_px": fw,
        "image_width_px": w,
        "distance_cm": float(f"{distance_cm:.1f}")
    }


def calculate_distance(face_width_px: int, image_width_px: int) -> float:
    """
    Calculate distance using pinhole camera model.
    D = (W * F) / P
    W = average human face width (~14 cm)
    F = focal length in pixels (estimated from image width)
    P = face width in pixels
    """
    REAL_FACE_WIDTH_CM = 14.0
    # Estimated focal length (typical webcam ~640px width, ~60° FOV)
    FOCAL_LENGTH_PX = image_width_px * 0.9

    if face_width_px <= 0:
        return 0.0

    distance = (REAL_FACE_WIDTH_CM * FOCAL_LENGTH_PX) / face_width_px
    return distance
