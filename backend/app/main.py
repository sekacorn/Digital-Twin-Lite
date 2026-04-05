from contextlib import asynccontextmanager
import os
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import HabitInputRow, PredictionResultRow, SimulationRow
from app.schemas import (
    DayResult,
    HabitInputCreate,
    HabitInputResponse,
    SimulateRequest,
    SimulationResponse,
    SimulationSummary,
)
from app.simulation.engine import HabitInput, run_simulation

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


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/input", response_model=HabitInputResponse, status_code=201)
def create_input(data: HabitInputCreate, db: Session = Depends(get_db)):
    row = HabitInputRow(
        calories=data.calories,
        sleep_hours=data.sleep_hours,
        exercise_minutes=data.exercise_minutes,
        water_liters=data.water_liters,
        current_weight=data.current_weight,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return HabitInputResponse(id=row.id)


@app.post("/api/simulate", response_model=SimulationResponse)
def simulate(req: SimulateRequest, db: Session = Depends(get_db)):
    habit_row = db.get(HabitInputRow, req.input_id)
    if not habit_row:
        raise HTTPException(status_code=404, detail="Input not found")

    habits = HabitInput(
        calories=habit_row.calories,
        sleep_hours=habit_row.sleep_hours,
        exercise_minutes=habit_row.exercise_minutes,
        water_liters=habit_row.water_liters,
        current_weight=habit_row.current_weight,
    )

    predictions = run_simulation(habits, req.period_days)

    # Single atomic transaction for simulation + all prediction rows
    sim_row = SimulationRow(input_id=req.input_id, period_days=req.period_days)
    db.add(sim_row)
    db.flush()  # get sim_row.id without committing

    db.add_all([
        PredictionResultRow(
            simulation_id=sim_row.id,
            day=p.day,
            predicted_weight=p.predicted_weight,
            energy_score=p.energy_score,
        )
        for p in predictions
    ])
    db.commit()

    results = [DayResult(day=p.day, predicted_weight=p.predicted_weight, energy_score=p.energy_score) for p in predictions]
    summary = _build_summary(results, habits.current_weight)

    return SimulationResponse(
        simulation_id=sim_row.id,
        input_id=req.input_id,
        period_days=req.period_days,
        results=results,
        summary=summary,
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
    else:
        summary = SimulationSummary(final_weight=0, avg_energy=0, weight_change=0)

    return SimulationResponse(
        simulation_id=sim.id,
        input_id=sim.input_id,
        period_days=sim.period_days,
        results=results,
        summary=summary,
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
