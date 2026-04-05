from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class HabitInputRow(Base):
    __tablename__ = "habit_inputs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    calories: Mapped[float] = mapped_column(Float, nullable=False)
    sleep_hours: Mapped[float] = mapped_column(Float, nullable=False)
    exercise_minutes: Mapped[float] = mapped_column(Float, nullable=False)
    water_liters: Mapped[float] = mapped_column(Float, nullable=False)
    current_weight: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    simulations: Mapped[list["SimulationRow"]] = relationship(
        back_populates="habit_input", cascade="all, delete-orphan"
    )


class SimulationRow(Base):
    __tablename__ = "simulations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    input_id: Mapped[int] = mapped_column(ForeignKey("habit_inputs.id"), nullable=False)
    period_days: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    habit_input: Mapped["HabitInputRow"] = relationship(back_populates="simulations")
    results: Mapped[list["PredictionResultRow"]] = relationship(
        back_populates="simulation", cascade="all, delete-orphan"
    )


class PredictionResultRow(Base):
    __tablename__ = "prediction_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    simulation_id: Mapped[int] = mapped_column(
        ForeignKey("simulations.id"), nullable=False, index=True
    )
    day: Mapped[int] = mapped_column(Integer, nullable=False)
    predicted_weight: Mapped[float] = mapped_column(Float, nullable=False)
    energy_score: Mapped[float] = mapped_column(Float, nullable=False)

    simulation: Mapped["SimulationRow"] = relationship(back_populates="results")
