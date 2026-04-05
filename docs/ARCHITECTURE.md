# Architecture - Digital Twin Lite

## Stack

| Layer      | Technology        |
|------------|-------------------|
| Frontend   | React + Recharts  |
| Backend    | Python + FastAPI   |
| Database   | SQLite (MVP)      |
| Engine     | Python (rule-based)|

## System Flow

```
User → React UI → FastAPI Backend → Simulation Engine → SQLite DB
                                                      ↓
                              React UI ← JSON Response ←
```

## Component Overview

### Frontend (React)
- `InputForm` — captures habit data
- `SimulationControls` — period selector + run button
- `ResultsChart` — line charts for weight & energy
- `SummaryCards` — key metric cards
- `Disclaimer` — legal notice banner

### Backend (FastAPI)
- `POST /api/input` — receive and validate habit input
- `POST /api/simulate` — run simulation for given period
- `GET /api/results/{id}` — retrieve simulation results

### Simulation Engine
- Pure Python module
- Rule-based calculations
- No external ML dependencies
- Deterministic and explainable

### Database
- SQLite with SQLAlchemy ORM
- Tables: habit_inputs, simulations, prediction_results
