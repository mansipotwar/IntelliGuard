from fastapi import APIRouter, Query
from app.services.safety_service import get_safety_recommendation
from app.services.forecast_service import get_flood_prediction_by_index

router = APIRouter()

@router.get("/safety")
def safety_recommendation(row_index: int = Query(..., description="Row index from the flood dataset")):
    flood_result = get_flood_prediction_by_index(row_index)
    params = flood_result.get("parameters", {})
    risk = flood_result.get("flood_occurred", 0)
    recom = get_safety_recommendation(params, risk)
    return {"parameters": params, "flood_occurred": risk, **recom}