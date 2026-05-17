from typing import Literal

from pydantic import BaseModel, Field

SimulationPeriod = Literal[7, 14, 30, 90, 120, 180]


class HabitInputCreate(BaseModel):
    calories: float = Field(ge=100, le=10000, description="Daily calorie intake (kcal)")
    maintenance_calories: float = Field(
        default=2000,
        ge=800,
        le=6000,
        description="Estimated daily calories needed to maintain current weight before logged exercise",
    )
    sleep_hours: float = Field(ge=0, le=24, description="Hours of sleep per night")
    exercise_minutes: float = Field(ge=0, le=1440, description="Minutes of exercise per day")
    water_liters: float = Field(ge=0, le=20, description="Liters of water per day")
    current_weight: float = Field(gt=30, le=500, description="Current weight in kg")


class HabitInputResponse(BaseModel):
    id: int
    message: str = "Input recorded"


class SimulateRequest(BaseModel):
    input_id: int = Field(gt=0, description="ID of a saved habit input")
    period_days: SimulationPeriod = Field(description="Simulation period: 7, 14, 30, 90, 120, or 180 days")


class CompareScenarioInput(BaseModel):
    label: str = Field(min_length=1, max_length=40, description="Scenario label")
    habits: HabitInputCreate


class CompareRequest(BaseModel):
    period_days: SimulationPeriod = Field(description="Simulation period: 7, 14, 30, 90, 120, or 180 days")
    scenarios: list[CompareScenarioInput] = Field(min_length=2, max_length=4)


class DayResult(BaseModel):
    day: int
    predicted_weight: float
    energy_score: float


class SimulationSummary(BaseModel):
    final_weight: float
    avg_energy: float
    weight_change: float


class ModelExplanation(BaseModel):
    maintenance_calories: float
    intake_calories: float
    exercise_kcal_per_min: float
    calories_per_kg: float
    daily_calorie_balance: float
    estimated_exercise_burn: float
    daily_weight_delta: float
    energy_factors: dict[str, float]
    insight: str
    limitations: str


class SimulationResponse(BaseModel):
    simulation_id: int
    input_id: int
    period_days: int
    results: list[DayResult]
    summary: SimulationSummary
    explanation: ModelExplanation | None = None


class CompareScenarioResponse(SimulationResponse):
    label: str


class CompareResponse(BaseModel):
    period_days: int
    scenarios: list[CompareScenarioResponse]
    insight: str
