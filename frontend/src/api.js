const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const BASE = RAW_API_BASE.endsWith("/") ? RAW_API_BASE.slice(0, -1) : RAW_API_BASE;
const REQUEST_TIMEOUT_MS = 30000;

async function request(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) {
      let message;
      try {
        const body = await res.json();
        message = body.detail || JSON.stringify(body);
      } catch {
        message = `Request failed (${res.status})`;
      }
      throw new Error(message);
    }
    return res.json();
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function submitInput(data) {
  return request(`${BASE}/input`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function runSimulation(inputId, periodDays) {
  return request(`${BASE}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input_id: inputId, period_days: periodDays }),
  });
}

export async function getResults(simulationId) {
  return request(`${BASE}/results/${simulationId}`);
}
