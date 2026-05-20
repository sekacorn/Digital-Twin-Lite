# API Specification - Digital Twin Lite

## Base URL
`http://localhost:8000/api`

---

## POST /api/input

Submit daily habit data.

**Request Body:**
```json
{
  "calories": 2000,
  "maintenance_calories": 2200,
  "sleep_hours": 7.5,
  "exercise_minutes": 30,
  "water_liters": 2.5,
  "current_weight": 80.0
}
```

**Response (201):**
```json
{
  "id": 1,
  "message": "Input recorded"
}
```

---

## POST /api/simulate

Run a simulation on a saved input.

Supported `period_days` values: `7`, `14`, `30`, `90`, `120`, and `180`.

**Request Body:**
```json
{
  "input_id": 1,
  "period_days": 30
}
```

**Response (200):**
```json
{
  "simulation_id": 1,
  "input_id": 1,
  "period_days": 30,
  "results": [
    { "day": 1, "predicted_weight": 79.9, "energy_score": 72 },
    { "day": 2, "predicted_weight": 79.8, "energy_score": 73 }
  ],
  "summary": {
    "final_weight": 78.5,
    "avg_energy": 74,
    "weight_change": -1.5
  },
  "explanation": {
    "maintenance_calories": 2200,
    "intake_calories": 2000,
    "exercise_kcal_per_min": 5,
    "calories_per_kg": 7700,
    "daily_calorie_balance": -350,
    "estimated_exercise_burn": 150,
    "daily_weight_delta": -0.0455,
    "energy_factors": {
      "baseline": 50,
      "sleep": 0,
      "hydration": 2.5,
      "exercise": 4.5,
      "consistency": 3
    },
    "insight": "Estimated intake is below maintenance after exercise, so weight trends downward.",
    "limitations": "Directional wellness projection only; not medical advice or a clinical prediction."
  }
}
```

---

## POST /api/scenarios/compare

Run multiple labeled scenarios for the same projection period.

Supported `period_days` values: `7`, `14`, `30`, `90`, `120`, and `180`.

The request accepts 2-5 scenarios, which allows the frontend to compare the four preset paths plus one custom scenario.

**Request Body:**
```json
{
  "period_days": 30,
  "scenarios": [
    {
      "label": "Current",
      "habits": {
        "calories": 2000,
        "maintenance_calories": 2200,
        "sleep_hours": 7,
        "exercise_minutes": 30,
        "water_liters": 2.5,
        "current_weight": 80
      }
    },
    {
      "label": "More Exercise",
      "habits": {
        "calories": 2000,
        "maintenance_calories": 2200,
        "sleep_hours": 7,
        "exercise_minutes": 60,
        "water_liters": 2.5,
        "current_weight": 80
      }
    }
  ]
}
```

**Response (200):**
```json
{
  "period_days": 30,
  "scenarios": [
    {
      "label": "Current",
      "simulation_id": 1,
      "input_id": 1,
      "period_days": 30,
      "results": [
        { "day": 1, "predicted_weight": 79.98, "energy_score": 57.7 }
      ],
      "summary": {
        "final_weight": 79.4,
        "avg_energy": 58.5,
        "weight_change": -0.6
      },
      "explanation": {
        "maintenance_calories": 2200,
        "intake_calories": 2000,
        "exercise_kcal_per_min": 5,
        "calories_per_kg": 7700,
        "daily_calorie_balance": -350,
        "estimated_exercise_burn": 150,
        "daily_weight_delta": -0.0455,
        "energy_factors": {
          "baseline": 50,
          "sleep": 0,
          "hydration": 2.5,
          "exercise": 4.5,
          "consistency": 3
        },
        "insight": "Estimated intake is below maintenance after exercise, so weight trends downward.",
        "limitations": "Directional wellness projection only; not medical advice or a clinical prediction."
      }
    }
  ],
  "insight": "More Exercise has the strongest average energy score. More Exercise creates the largest downward weight trend."
}
```

---

## GET /api/results/{simulation_id}

Retrieve results for a completed simulation.

**Response (200):**
```json
{
  "simulation_id": 1,
  "period_days": 30,
  "results": [
    { "day": 1, "predicted_weight": 79.9, "energy_score": 72 }
  ],
  "summary": {
    "final_weight": 78.5,
    "avg_energy": 74,
    "weight_change": -1.5
  }
}
```
