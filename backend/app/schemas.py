from typing import Literal

from pydantic import BaseModel, Field


class HabitInputCreate(BaseModel):
    calories: float = Field(ge=100, le=10000, description="Daily calorie intake (kcal)")
    sleep_hours: float = Field(ge=0, le=24, description="Hours of sleep per night")
    exercise_minutes: float = Field(ge=0, le=1440, description="Minutes of exercise per day")
    water_liters: float = Field(ge=0, le=20, description="Liters of water per day")
    current_weight: float = Field(gt=30, le=500, description="Current weight in kg")


class HabitInputResponse(BaseModel):
    id: int
    message: str = "Input recorded"


class SimulateRequest(BaseModel):
    input_id: int = Field(gt=0, description="ID of a saved habit input")
    period_days: Literal[7, 30, 90] = Field(description="Simulation period: 7, 30, or 90 days")


class DayResult(BaseModel):
    day: int
    predicted_weight: float
    energy_score: float


class SimulationSummary(BaseModel):
    final_weight: float
    avg_energy: float
    weight_change: float


class SimulationResponse(BaseModel):
    simulation_id: int
    input_id: int
    period_days: int
    results: list[DayResult]
    summary: SimulationSummary
