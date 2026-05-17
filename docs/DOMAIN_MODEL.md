# Domain Model - Digital Twin Lite

## Entities

### HabitInput
| Field           | Type    | Description              |
|-----------------|---------|--------------------------|
| id              | int     | Primary key              |
| calories        | float   | Daily calorie intake (kcal) |
| maintenance_calories | float | Estimated calories needed to maintain current weight before logged exercise |
| sleep_hours     | float   | Hours of sleep per night |
| exercise_minutes| float   | Minutes of exercise/day  |
| water_liters    | float   | Liters of water/day      |
| current_weight  | float   | Starting weight (kg)     |
| created_at      | datetime| Timestamp                |

### Simulation
| Field           | Type    | Description              |
|-----------------|---------|--------------------------|
| id              | int     | Primary key              |
| input_id        | int     | FK to HabitInput         |
| period_days     | int     | 7, 14, 30, 90, 120, or 180 |
| created_at      | datetime| Timestamp                |

### PredictionResult
| Field           | Type    | Description              |
|-----------------|---------|--------------------------|
| id              | int     | Primary key              |
| simulation_id   | int     | FK to Simulation         |
| day             | int     | Day number in projection |
| predicted_weight| float   | Predicted weight (kg)    |
| energy_score    | float   | Energy score (0-100)     |

## Weight Projection Formula

```text
daily calorie balance = calories - maintenance_calories - exercise_burn
exercise_burn = exercise_minutes * 5 kcal/min
daily weight delta = daily calorie balance / 7700
```

If `maintenance_calories` is not supplied, the API defaults to `2000` kcal/day for backward compatibility.
