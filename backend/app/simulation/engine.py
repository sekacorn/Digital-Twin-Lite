"""
Digital Twin Lite - Simulation Engine

Rule-based prediction engine for weight and energy trends.
All rules are deterministic and explainable - no ML.
"""

from dataclasses import dataclass

# Default maintenance calorie estimate (kcal/day) for an average adult
DEFAULT_MAINTENANCE_CALORIES = 2000
# Calories per kg of body weight (simplified)
CALORIES_PER_KG = 7700
# Exercise calories burned per minute (moderate intensity average)
EXERCISE_KCAL_PER_MIN = 5


@dataclass
class HabitInput:
    calories: float
    sleep_hours: float
    exercise_minutes: float
    water_liters: float
    current_weight: float
    maintenance_calories: float = DEFAULT_MAINTENANCE_CALORIES


@dataclass
class DayPrediction:
    day: int
    predicted_weight: float
    energy_score: float


def calculate_daily_calorie_balance(habits: HabitInput) -> float:
    """Net calories = intake - baseline expenditure - exercise burn."""
    exercise_burn = habits.exercise_minutes * EXERCISE_KCAL_PER_MIN
    return habits.calories - habits.maintenance_calories - exercise_burn


def calculate_weight_change_kg(calorie_balance: float) -> float:
    """Convert daily calorie surplus/deficit to kg change."""
    return calorie_balance / CALORIES_PER_KG


def calculate_energy_factors(habits: HabitInput, day: int) -> dict[str, float]:
    """Return the individual factors that make up the energy score."""
    if habits.sleep_hours >= 7:
        sleep_bonus = min((habits.sleep_hours - 7) * 8, 16)
    else:
        sleep_bonus = (habits.sleep_hours - 7) * 5

    if habits.water_liters >= 2.0:
        water_bonus = min((habits.water_liters - 2.0) * 5, 10)
    else:
        water_bonus = (habits.water_liters - 2.0) * 8

    exercise_bonus = min(habits.exercise_minutes * 0.15, 10)
    consistency_bonus = min(day * 0.1, 5)

    return {
        "baseline": 50.0,
        "sleep": round(sleep_bonus, 1),
        "hydration": round(water_bonus, 1),
        "exercise": round(exercise_bonus, 1),
        "consistency": round(consistency_bonus, 1),
    }


def calculate_energy_score(habits: HabitInput, day: int) -> float:
    """
    Energy score (0-100) based on:
    - Sleep: primary driver
    - Water: hydration bonus
    - Exercise: moderate boost
    - Consistency bonus over time (simulated by day ramp)
    """
    score = sum(calculate_energy_factors(habits, day).values())
    return round(max(0, min(100, score)), 1)


def build_model_explanation(habits: HabitInput, period_days: int) -> dict:
    """Explain the assumptions and drivers used for a simulation."""
    calorie_balance = calculate_daily_calorie_balance(habits)
    daily_weight_delta = calculate_weight_change_kg(calorie_balance)
    exercise_burn = habits.exercise_minutes * EXERCISE_KCAL_PER_MIN
    energy_factors = calculate_energy_factors(habits, min(period_days, 30))

    if calorie_balance < 0:
        insight = "Estimated intake is below maintenance after exercise, so weight trends downward."
    elif calorie_balance > 0:
        insight = "Estimated intake is above maintenance after exercise, so weight trends upward."
    else:
        insight = "Estimated intake is close to maintenance after exercise, so weight stays near baseline."

    return {
        "maintenance_calories": habits.maintenance_calories,
        "intake_calories": habits.calories,
        "exercise_kcal_per_min": EXERCISE_KCAL_PER_MIN,
        "calories_per_kg": CALORIES_PER_KG,
        "daily_calorie_balance": round(calorie_balance, 1),
        "estimated_exercise_burn": round(exercise_burn, 1),
        "daily_weight_delta": round(daily_weight_delta, 4),
        "energy_factors": energy_factors,
        "insight": insight,
        "limitations": "Directional wellness projection only; not medical advice or a clinical prediction.",
    }


def run_simulation(habits: HabitInput, period_days: int) -> list[DayPrediction]:
    """Run the full simulation for the given period. Returns one prediction per day."""
    daily_cal_balance = calculate_daily_calorie_balance(habits)
    daily_weight_delta = calculate_weight_change_kg(daily_cal_balance)

    results = []
    current_weight = habits.current_weight

    for day in range(1, period_days + 1):
        current_weight += daily_weight_delta
        current_weight = round(max(current_weight, 30), 2)  # floor at 30kg safety

        energy = calculate_energy_score(habits, day)

        results.append(DayPrediction(
            day=day,
            predicted_weight=current_weight,
            energy_score=energy,
        ))

    return results
