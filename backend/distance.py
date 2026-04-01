"""
Eye Gem — Distance Calculation Module
"""


def calculate_distance(face_width_px: int, image_width_px: int, real_face_width_cm: float = 14.0) -> float:
    """
    D = (W × F) / P
    W = real face width (default 14cm)
    F = focal length in pixels
    P = measured face width in pixels
    """
    if face_width_px <= 0:
        return 0.0

    focal_length_px = image_width_px * 0.9
    distance = (real_face_width_cm * focal_length_px) / face_width_px
    return round(distance, 1)


def check_distance_status(distance_cm: float) -> dict:
    """Check if distance is suitable for eye test (35-50cm ideal)."""
    if 35 <= distance_cm <= 50:
        return {
            "status": "ok",
            "message": "Masofa mos! Testni boshlashingiz mumkin.",
            "distance_cm": distance_cm
        }
    elif distance_cm < 35:
        return {
            "status": "too_close",
            "message": f"Juda yaqin ({distance_cm} sm). Orqaga surilng.",
            "distance_cm": distance_cm
        }
    else:
        return {
            "status": "too_far",
            "message": f"Juda uzoq ({distance_cm} sm). Yaqinlashing.",
            "distance_cm": distance_cm
        }
