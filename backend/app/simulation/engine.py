"""
Digital Twin Lite - Simulation Engine

Rule-based prediction engine for weight and energy trends.
All rules are deterministic and explainable — no ML.
"""

from dataclasses import dataclass

# Baseline metabolic rate assumption (kcal/day) for an average adult
BASELINE_CALORIES = 2000
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


@dataclass
class DayPrediction:
    day: int
    predicted_weight: float
    energy_score: float


def calculate_daily_calorie_balance(habits: HabitInput) -> float:
    """Net calories = intake - baseline expenditure - exercise burn."""
    exercise_burn = habits.exercise_minutes * EXERCISE_KCAL_PER_MIN
    return habits.calories - BASELINE_CALORIES - exercise_burn


def calculate_weight_change_kg(calorie_balance: float) -> float:
    """Convert daily calorie surplus/deficit to kg change."""
    return calorie_balance / CALORIES_PER_KG


def calculate_energy_score(habits: HabitInput, day: int) -> float:
    """
    Energy score (0-100) based on:
    - Sleep: primary driver
    - Water: hydration bonus
    - Exercise: moderate boost
    - Consistency bonus over time (simulated by day ramp)
    """
    score = 50.0  # baseline

    # Sleep factor: 7-9h is optimal, smooth curve
    if habits.sleep_hours >= 7:
        sleep_bonus = min((habits.sleep_hours - 7) * 8, 16)  # 7h=0, 8h=+8, 9h=+16 cap
    else:
        sleep_bonus = (habits.sleep_hours - 7) * 5  # 6h=-5, 5h=-10, 4h=-15

    # Hydration factor: 2-3L is optimal, smooth curve
    if habits.water_liters >= 2.0:
        water_bonus = min((habits.water_liters - 2.0) * 5, 10)  # 2L=0, 3L=+5, 4L=+10 cap
    else:
        water_bonus = (habits.water_liters - 2.0) * 8  # 1.5L=-4, 1L=-8, 0.5L=-12

    # Exercise factor: moderate exercise boosts energy
    exercise_bonus = min(habits.exercise_minutes * 0.15, 10)

    # Consistency ramp: habits compound over time (small daily gain, caps at +5)
    consistency_bonus = min(day * 0.1, 5)

    score += sleep_bonus + water_bonus + exercise_bonus + consistency_bonus

    return round(max(0, min(100, score)), 1)


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
