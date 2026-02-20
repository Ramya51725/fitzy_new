def calculate_bmi(weight: float, height_cm: float) -> float:
    height_m = height_cm / 100
    bmi = weight / (height_m ** 2)
    return round(bmi, 2)
