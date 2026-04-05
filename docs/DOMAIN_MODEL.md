# Domain Model - Digital Twin Lite

## Entities

### HabitInput
| Field           | Type    | Description              |
|-----------------|---------|--------------------------|
| id              | int     | Primary key              |
| calories        | float   | Daily calorie intake (kcal) |
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
| period_days     | int     | 7, 30, or 90             |
| created_at      | datetime| Timestamp                |

### PredictionResult
| Field           | Type    | Description              |
|-----------------|---------|--------------------------|
| id              | int     | Primary key              |
| simulation_id   | int     | FK to Simulation         |
| day             | int     | Day number in projection |
| predicted_weight| float   | Predicted weight (kg)    |
| energy_score    | float   | Energy score (0-100)     |
