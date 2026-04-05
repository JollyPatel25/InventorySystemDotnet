from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import numpy as np
from datetime import date, timedelta
import warnings

warnings.filterwarnings("ignore")

app = FastAPI(title="InventoryAI Prediction Service")


# ─── Request / Response Models ───────────────────────────────────────────────

class PredictionRequest(BaseModel):
    product_id: str
    sales: list[int]
    dates: Optional[list[str]] = None          # ISO date strings e.g. "2025-03-01"
    current_stock: Optional[int] = None
    reorder_point: Optional[int] = None
    lead_time_days: Optional[int] = 3


class DailyForecast(BaseModel):
    date: str
    predicted_quantity: float


class PredictionResponse(BaseModel):
    predicted_quantity: float
    confidence: float
    trend: str                        # "rising" | "falling" | "stable"
    trend_percent: float              # e.g. +12.5 means +12.5%
    forecast_7_days: list[DailyForecast]
    stockout_risk_days: Optional[int]
    recommended_reorder_qty: Optional[int]
    anomaly_detected: bool
    anomaly_description: Optional[str]
    insight_message: str
    model_used: str


# ─── Helpers ─────────────────────────────────────────────────────────────────

def detect_anomalies(sales: list[int]) -> tuple[bool, Optional[str], list[float]]:
    """IQR-based anomaly detection. Returns (has_anomaly, description, cleaned_sales)."""
    if len(sales) < 4:
        return False, None, [float(s) for s in sales]

    arr = np.array(sales, dtype=float)
    q1, q3 = np.percentile(arr, 25), np.percentile(arr, 75)
    iqr = q3 - q1
    lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr

    outlier_mask = (arr < lower) | (arr > upper)
    outlier_indices = np.where(outlier_mask)[0]

    if len(outlier_indices) == 0:
        return False, None, arr.tolist()

    # Replace outliers with median for clean forecast
    median = float(np.median(arr[~outlier_mask])) if np.sum(~outlier_mask) > 0 else float(np.mean(arr))
    cleaned = arr.copy()
    cleaned[outlier_mask] = median

    desc = (
        f"Unusual spike detected on {len(outlier_indices)} data point(s). "
        f"Values {arr[outlier_indices].astype(int).tolist()} replaced with median {int(median)} for forecasting."
    )
    return True, desc, cleaned.tolist()


def exponential_smoothing(series: list[float], alpha: float = 0.3) -> list[float]:
    """Simple exponential smoothing."""
    result = [series[0]]
    for val in series[1:]:
        result.append(alpha * val + (1 - alpha) * result[-1])
    return result


def holt_linear(series: list[float], alpha: float = 0.4, beta: float = 0.2) -> tuple[float, list[float]]:
    """
    Holt's double exponential smoothing (linear trend).
    Returns (next_value, smoothed_series).
    """
    if len(series) < 2:
        return series[-1], series

    level = series[0]
    trend = series[1] - series[0]
    smoothed = [level + trend]

    for val in series[1:]:
        prev_level = level
        level = alpha * val + (1 - alpha) * (level + trend)
        trend = beta * (level - prev_level) + (1 - beta) * trend
        smoothed.append(level + trend)

    return level + trend, smoothed


def linear_trend_forecast(series: list[float], steps: int = 1) -> list[float]:
    """OLS linear regression forecast."""
    n = len(series)
    X = np.arange(n)
    coeffs = np.polyfit(X, series, 1)
    future_X = np.arange(n, n + steps)
    return np.polyval(coeffs, future_X).tolist()


def compute_confidence(series: list[float], predictions: list[float]) -> float:
    """
    Composite confidence:
    - Data volume score (more history = higher)
    - Coefficient of variation (stability score)
    - Prediction interval width penalty
    """
    n = len(series)

    # Volume score: asymptote towards 1.0 as n grows
    volume_score = min(1.0, n / 30.0)

    # Stability score: low CV = stable = high confidence
    mean_val = np.mean(series) if np.mean(series) != 0 else 1.0
    cv = np.std(series) / abs(mean_val)
    stability_score = max(0.0, 1.0 - min(cv, 2.0) / 2.0)

    # Residual score based on how well Holt fits the data
    _, smoothed = holt_linear(series)
    residuals = np.array(series) - np.array(smoothed[:len(series)])
    rmse = np.sqrt(np.mean(residuals ** 2))
    rmse_score = max(0.0, 1.0 - min(rmse / (abs(mean_val) + 1e-9), 1.0))

    raw = 0.25 * volume_score + 0.35 * stability_score + 0.40 * rmse_score

    # Clamp to [0.30, 0.97] — never claim perfect confidence
    return round(float(np.clip(raw, 0.30, 0.97)), 4)


def ensemble_forecast(series: list[float], steps: int = 7) -> list[float]:
    """
    Ensemble: Holt linear trend (60%) + Linear regression (40%).
    Returns list of `steps` forecasted values.
    """
    results = []
    level = series[-1]
    _, smoothed = holt_linear(series)
    # Extend Holt trend
    last_level = smoothed[-1]
    last_trend = smoothed[-1] - smoothed[-2] if len(smoothed) >= 2 else 0.0
    holt_forecasts = [last_level + (i + 1) * last_trend for i in range(steps)]

    lin_forecasts = linear_trend_forecast(series, steps=steps)

    for i in range(steps):
        blended = 0.6 * holt_forecasts[i] + 0.4 * lin_forecasts[i]
        results.append(max(0.0, round(blended, 2)))

    return results


def compute_trend(series: list[float]) -> tuple[str, float]:
    """Compare last 3 vs first 3 of series to determine trend direction and magnitude."""
    if len(series) < 6:
        delta = series[-1] - series[0]
        base = abs(series[0]) or 1
        pct = round((delta / base) * 100, 1)
        direction = "rising" if pct > 3 else ("falling" if pct < -3 else "stable")
        return direction, pct

    first_half = np.mean(series[:len(series) // 2])
    second_half = np.mean(series[len(series) // 2:])
    base = abs(first_half) or 1
    pct = round(((second_half - first_half) / base) * 100, 1)
    direction = "rising" if pct > 3 else ("falling" if pct < -3 else "stable")
    return direction, pct


def compute_stockout_risk(current_stock: Optional[int], daily_forecast: list[float]) -> Optional[int]:
    """Days until stock hits zero given forecast consumption."""
    if current_stock is None:
        return None
    stock = current_stock
    for i, demand in enumerate(daily_forecast):
        stock -= demand
        if stock <= 0:
            return i + 1
    return None  # Won't stock out within forecast window


def compute_reorder_qty(
    forecast_7: list[float],
    lead_time_days: int,
    reorder_point: Optional[int]
) -> Optional[int]:
    """Safety stock + lead time demand reorder formula."""
    avg_daily = np.mean(forecast_7)
    std_daily = np.std(forecast_7) if len(forecast_7) > 1 else 0.0
    z = 1.65  # 95% service level
    safety_stock = z * std_daily * np.sqrt(lead_time_days)
    lead_time_demand = avg_daily * lead_time_days
    reorder = int(np.ceil(lead_time_demand + safety_stock + (reorder_point or 0)))
    return max(1, reorder)


def build_insight_message(
    trend: str,
    trend_pct: float,
    stockout_days: Optional[int],
    anomaly: bool,
    confidence: float,
    lead_time: int
) -> str:
    parts = []

    if stockout_days is not None and stockout_days <= lead_time + 1:
        parts.append(f"⚠️ Critical: Stockout expected in {stockout_days} day(s) — reorder immediately.")
    elif stockout_days is not None and stockout_days <= 7:
        parts.append(f"⚠️ Stockout risk in {stockout_days} days — consider reordering soon.")

    if trend == "rising":
        parts.append(f"📈 Demand is trending up {abs(trend_pct):.1f}% — ensure sufficient stock.")
    elif trend == "falling":
        parts.append(f"📉 Demand declining {abs(trend_pct):.1f}% — review reorder quantities.")
    else:
        parts.append("📊 Demand is stable — standard replenishment applies.")

    if anomaly:
        parts.append("🔍 Anomalous sales detected and excluded from forecast for accuracy.")

    if confidence < 0.5:
        parts.append("ℹ️ Low confidence — more sales history will improve accuracy.")

    return " ".join(parts) if parts else "Forecast generated successfully."


# ─── Endpoint ─────────────────────────────────────────────────────────────────

@app.post("/predict", response_model=PredictionResponse)
def predict(data: PredictionRequest):
    sales_raw = data.sales

    if len(sales_raw) < 3:
        raise HTTPException(
            status_code=422,
            detail=f"Insufficient data: need at least 3 data points, got {len(sales_raw)}."
        )

    # 1. Anomaly detection & cleaning
    anomaly_detected, anomaly_desc, sales_clean = detect_anomalies(sales_raw)

    # 2. Ensemble forecast (7 steps ahead)
    forecast_values = ensemble_forecast(sales_clean, steps=7)

    # 3. Next-day prediction (step 1)
    predicted_qty = forecast_values[0]

    # 4. Confidence
    confidence = compute_confidence(sales_clean, forecast_values)

    # 5. Trend analysis
    trend, trend_pct = compute_trend(sales_clean)

    # 6. 7-day forecast with dates
    today = date.today()
    forecast_7_days = [
        DailyForecast(
            date=(today + timedelta(days=i + 1)).isoformat(),
            predicted_quantity=forecast_values[i]
        )
        for i in range(7)
    ]

    # 7. Stockout risk
    stockout_risk = compute_stockout_risk(data.current_stock, forecast_values)

    # 8. Reorder quantity
    reorder_qty = compute_reorder_qty(
        forecast_values,
        data.lead_time_days or 3,
        data.reorder_point
    )

    # 9. Insight message
    insight = build_insight_message(
        trend, trend_pct, stockout_risk, anomaly_detected, confidence, data.lead_time_days or 3
    )

    return PredictionResponse(
        predicted_quantity=round(predicted_qty, 2),
        confidence=confidence,
        trend=trend,
        trend_percent=trend_pct,
        forecast_7_days=forecast_7_days,
        stockout_risk_days=stockout_risk,
        recommended_reorder_qty=reorder_qty,
        anomaly_detected=anomaly_detected,
        anomaly_description=anomaly_desc,
        insight_message=insight,
        model_used="Holt Linear Trend + OLS Ensemble (60/40)"
    )