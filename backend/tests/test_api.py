"""Integration tests for the API endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


VALID_INPUT = {
    "calories": 2000,
    "sleep_hours": 7,
    "exercise_minutes": 30,
    "water_liters": 2.5,
    "current_weight": 80,
}


def test_health_check():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_root_serves_frontend_or_api_status():
    res = client.get("/")
    assert res.status_code == 200
    assert "text/html" in res.headers["content-type"] or res.json()["message"] == "Digital Twin Lite API is running."


# --- POST /api/input ---

def test_create_input():
    res = client.post("/api/input", json=VALID_INPUT)
    assert res.status_code == 201
    data = res.json()
    assert "id" in data
    assert data["message"] == "Input recorded"

def test_create_input_invalid_calories():
    bad = {**VALID_INPUT, "calories": -100}
    res = client.post("/api/input", json=bad)
    assert res.status_code == 422

def test_create_input_missing_field():
    bad = {"calories": 2000}
    res = client.post("/api/input", json=bad)
    assert res.status_code == 422


# --- POST /api/simulate ---

def test_simulate():
    inp = client.post("/api/input", json=VALID_INPUT).json()
    res = client.post("/api/simulate", json={"input_id": inp["id"], "period_days": 30})
    assert res.status_code == 200
    data = res.json()
    assert data["period_days"] == 30
    assert len(data["results"]) == 30
    assert "summary" in data
    assert "final_weight" in data["summary"]

def test_simulate_invalid_period():
    inp = client.post("/api/input", json=VALID_INPUT).json()
    res = client.post("/api/simulate", json={"input_id": inp["id"], "period_days": 15})
    assert res.status_code == 422

def test_simulate_missing_input():
    res = client.post("/api/simulate", json={"input_id": 9999, "period_days": 30})
    assert res.status_code == 404


# --- GET /api/results ---

def test_get_results():
    inp = client.post("/api/input", json=VALID_INPUT).json()
    sim = client.post("/api/simulate", json={"input_id": inp["id"], "period_days": 7}).json()
    res = client.get(f"/api/results/{sim['simulation_id']}")
    assert res.status_code == 200
    data = res.json()
    assert len(data["results"]) == 7

def test_get_results_not_found():
    res = client.get("/api/results/9999")
    assert res.status_code == 404


# --- Edge cases ---

def test_all_simulation_periods():
    inp = client.post("/api/input", json=VALID_INPUT).json()
    for period in (7, 30, 90):
        res = client.post("/api/simulate", json={"input_id": inp["id"], "period_days": period})
        assert res.status_code == 200
        assert len(res.json()["results"]) == period
