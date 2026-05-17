from contextlib import asynccontextmanager
import os
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import HabitInputRow, PredictionResultRow, SimulationRow
from app.schemas import (
    CompareRequest,
    CompareResponse,
    CompareScenarioResponse,
    DayResult,
    HabitInputCreate,
    HabitInputResponse,
    ModelExplanation,
    SimulateRequest,
    SimulationResponse,
    SimulationSummary,
)
from app.simulation.engine import HabitInput, build_model_explanation, run_simulation

ROOT_DIR = Path(__file__).resolve().parents[2]
FRONTEND_DIST_DIR = ROOT_DIR / "frontend" / "dist"
FRONTEND_ASSETS_DIR = FRONTEND_DIST_DIR / "assets"


def _get_allowed_origins() -> list[str]:
    raw_origins = os.environ.get("ALLOWED_ORIGINS", "")
    origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    if origins:
        return origins
    return ["http://localhost:5173", "http://localhost:3000"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _ensure_maintenance_calories_column()
    yield


app = FastAPI(
    title="Digital Twin Lite",
    description="Wellness prediction tool for educational purposes only. Not medical advice.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_allowed_origins(),
    allow_methods=["*"],
    allow_headers=["*"],
)

if FRONTEND_ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_ASSETS_DIR), name="assets")


def _build_summary(results: list[DayResult], start_weight: float) -> SimulationSummary:
    """Build a summary from a results list. Caller must ensure results is non-empty."""
    return SimulationSummary(
        final_weight=results[-1].predicted_weight,
        avg_energy=round(sum(r.energy_score for r in results) / len(results), 1),
        weight_change=round(results[-1].predicted_weight - start_weight, 2),
    )


def _ensure_maintenance_calories_column() -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    with engine.begin() as connection:
        columns = connection.execute(text("PRAGMA table_info(habit_inputs)")).fetchall()
        column_names = {column[1] for column in columns}
        if "maintenance_calories" not in column_names:
            connection.execute(
                text(
                    "ALTER TABLE habit_inputs "
                    "ADD COLUMN maintenance_calories FLOAT NOT NULL DEFAULT 2000"
                )
            )


def _habits_from_schema(data: HabitInputCreate) -> HabitInput:
    return HabitInput(
        calories=data.calories,
        maintenance_calories=data.maintenance_calories,
        sleep_hours=data.sleep_hours,
        exercise_minutes=data.exercise_minutes,
        water_liters=data.water_liters,
        current_weight=data.current_weight,
    )


def _habits_from_row(row: HabitInputRow) -> HabitInput:
    return HabitInput(
        calories=row.calories,
        maintenance_calories=getattr(row, "maintenance_calories", 2000),
        sleep_hours=row.sleep_hours,
        exercise_minutes=row.exercise_minutes,
        water_liters=row.water_liters,
        current_weight=row.current_weight,
    )


def _persist_input(data: HabitInputCreate, db: Session) -> HabitInputRow:
    row = HabitInputRow(
        calories=data.calories,
        maintenance_calories=data.maintenance_calories,
        sleep_hours=data.sleep_hours,
        exercise_minutes=data.exercise_minutes,
        water_liters=data.water_liters,
        current_weight=data.current_weight,
    )
    db.add(row)
    db.flush()
    return row


def _persist_simulation(
    input_id: int,
    period_days: int,
    results: list[DayResult],
    db: Session,
) -> SimulationRow:
    sim_row = SimulationRow(input_id=input_id, period_days=period_days)
    db.add(sim_row)
    db.flush()

    db.add_all([
        PredictionResultRow(
            simulation_id=sim_row.id,
            day=result.day,
            predicted_weight=result.predicted_weight,
            energy_score=result.energy_score,
        )
        for result in results
    ])
    return sim_row


def _build_response(
    sim_row: SimulationRow,
    input_id: int,
    period_days: int,
    habits: HabitInput,
    results: list[DayResult],
) -> SimulationResponse:
    return SimulationResponse(
        simulation_id=sim_row.id,
        input_id=input_id,
        period_days=period_days,
        results=results,
        summary=_build_summary(results, habits.current_weight),
        explanation=ModelExplanation(**build_model_explanation(habits, period_days)),
    )


def _compare_insight(scenarios: list[CompareScenarioResponse]) -> str:
    best_energy = max(scenarios, key=lambda scenario: scenario.summary.avg_energy)
    best_weight = min(scenarios, key=lambda scenario: scenario.summary.weight_change)
    return (
        f"{best_energy.label} has the strongest average energy score. "
        f"{best_weight.label} creates the largest downward weight trend."
    )


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/input", response_model=HabitInputResponse, status_code=201)
def create_input(data: HabitInputCreate, db: Session = Depends(get_db)):
    row = _persist_input(data, db)
    db.commit()
    db.refresh(row)
    return HabitInputResponse(id=row.id)


@app.post("/api/simulate", response_model=SimulationResponse)
def simulate(req: SimulateRequest, db: Session = Depends(get_db)):
    habit_row = db.get(HabitInputRow, req.input_id)
    if not habit_row:
        raise HTTPException(status_code=404, detail="Input not found")

    habits = _habits_from_row(habit_row)
    predictions = run_simulation(habits, req.period_days)
    results = [DayResult(day=p.day, predicted_weight=p.predicted_weight, energy_score=p.energy_score) for p in predictions]

    sim_row = _persist_simulation(req.input_id, req.period_days, results, db)
    db.commit()
    return _build_response(sim_row, req.input_id, req.period_days, habits, results)


@app.post("/api/scenarios/compare", response_model=CompareResponse)
def compare_scenarios(req: CompareRequest, db: Session = Depends(get_db)):
    scenario_responses: list[CompareScenarioResponse] = []

    for scenario in req.scenarios:
        input_row = _persist_input(scenario.habits, db)
        habits = _habits_from_schema(scenario.habits)
        predictions = run_simulation(habits, req.period_days)
        results = [
            DayResult(day=p.day, predicted_weight=p.predicted_weight, energy_score=p.energy_score)
            for p in predictions
        ]
        sim_row = _persist_simulation(input_row.id, req.period_days, results, db)
        base_response = _build_response(sim_row, input_row.id, req.period_days, habits, results)
        scenario_responses.append(
            CompareScenarioResponse(label=scenario.label, **base_response.model_dump())
        )

    db.commit()

    return CompareResponse(
        period_days=req.period_days,
        scenarios=scenario_responses,
        insight=_compare_insight(scenario_responses),
    )


@app.get("/api/results/{simulation_id}", response_model=SimulationResponse)
def get_results(simulation_id: int, db: Session = Depends(get_db)):
    sim = db.get(SimulationRow, simulation_id)
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")

    habit_row = db.get(HabitInputRow, sim.input_id)
    if not habit_row:
        raise HTTPException(status_code=404, detail="Associated input data not found")

    result_rows = (
        db.query(PredictionResultRow)
        .filter(PredictionResultRow.simulation_id == simulation_id)
        .order_by(PredictionResultRow.day)
        .all()
    )

    results = [DayResult(day=r.day, predicted_weight=r.predicted_weight, energy_score=r.energy_score) for r in result_rows]

    if results:
        summary = _build_summary(results, habit_row.current_weight)
        explanation = ModelExplanation(**build_model_explanation(_habits_from_row(habit_row), sim.period_days))
    else:
        summary = SimulationSummary(final_weight=0, avg_energy=0, weight_change=0)
        explanation = None

    return SimulationResponse(
        simulation_id=sim.id,
        input_id=sim.input_id,
        period_days=sim.period_days,
        results=results,
        summary=summary,
        explanation=explanation,
    )


@app.get("/")
def serve_frontend():
    index_file = FRONTEND_DIST_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return JSONResponse(
        {
            "message": "Digital Twin Lite API is running.",
            "frontend_built": False,
            "docs": "/docs",
            "health": "/health",
        }
    )


@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    if full_path.startswith("api/") or full_path in {"docs", "redoc", "openapi.json", "health"}:
        raise HTTPException(status_code=404, detail="Not found")

    asset_path = FRONTEND_DIST_DIR / full_path
    if asset_path.exists() and asset_path.is_file():
        return FileResponse(asset_path)

    index_file = FRONTEND_DIST_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)

    raise HTTPException(status_code=404, detail="Not found")
