"""Unit tests for the simulation engine."""

import pytest
from app.simulation.engine import (
    HabitInput,
    calculate_daily_calorie_balance,
    calculate_energy_score,
    calculate_weight_change_kg,
    run_simulation,
)


def make_habits(**overrides):
    defaults = dict(
        calories=2000, sleep_hours=7, exercise_minutes=30,
        water_liters=2.5, current_weight=80,
    )
    defaults.update(overrides)
    return HabitInput(**defaults)


# --- Calorie balance ---

def test_calorie_balance_deficit():
    h = make_habits(calories=1500, exercise_minutes=60)
    assert calculate_daily_calorie_balance(h) < 0

def test_calorie_balance_surplus():
    h = make_habits(calories=3000, exercise_minutes=0)
    assert calculate_daily_calorie_balance(h) > 0

def test_calorie_balance_maintenance():
    # 2000 cal intake, 0 exercise → net 0
    h = make_habits(calories=2000, exercise_minutes=0)
    assert calculate_daily_calorie_balance(h) == 0


# --- Weight change ---

def test_weight_loss_on_deficit():
    h = make_habits(calories=1500, exercise_minutes=60)
    results = run_simulation(h, 30)
    assert results[-1].predicted_weight < 80

def test_weight_gain_on_surplus():
    h = make_habits(calories=3500, exercise_minutes=0)
    results = run_simulation(h, 30)
    assert results[-1].predicted_weight > 80

def test_weight_floor():
    # Extreme deficit shouldn't go below 30 kg
    h = make_habits(calories=100, exercise_minutes=300, current_weight=35)
    results = run_simulation(h, 90)
    assert all(r.predicted_weight >= 30 for r in results)


# --- Energy score ---

def test_good_sleep_high_energy():
    h = make_habits(sleep_hours=8)
    score = calculate_energy_score(h, 30)
    assert score > 60

def test_poor_sleep_low_energy():
    h = make_habits(sleep_hours=4, water_liters=0.5, exercise_minutes=0)
    score = calculate_energy_score(h, 1)
    assert score < 40

def test_energy_bounded():
    h1 = make_habits(sleep_hours=12, exercise_minutes=300, water_liters=10)
    h2 = make_habits(sleep_hours=0, exercise_minutes=0, water_liters=0)
    assert 0 <= calculate_energy_score(h1, 90) <= 100
    assert 0 <= calculate_energy_score(h2, 1) <= 100


# --- Simulation ---

def test_simulation_length():
    h = make_habits()
    for period in (7, 30, 90):
        results = run_simulation(h, period)
        assert len(results) == period

def test_simulation_days_sequential():
    h = make_habits()
    results = run_simulation(h, 30)
    assert [r.day for r in results] == list(range(1, 31))

def test_simulation_consistency():
    # Same input → same output (deterministic)
    h = make_habits()
    r1 = run_simulation(h, 7)
    r2 = run_simulation(h, 7)
    assert [(r.predicted_weight, r.energy_score) for r in r1] == \
           [(r.predicted_weight, r.energy_score) for r in r2]
