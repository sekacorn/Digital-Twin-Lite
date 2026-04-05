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
  ]
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
