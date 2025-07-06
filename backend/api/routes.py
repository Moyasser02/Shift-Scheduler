from fastapi import APIRouter
from fastapi import Request
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/api/health")
def health_check():
    return {"status": "ok"}
from fastapi import APIRouter, Request
from backend.optimizer import run_ilp

router = APIRouter()

@router.post("/api/schedule/optimize")
async def optimize_schedule(request: Request):
    body = await request.json()
    result = run_ilp(
        employees=body["employees"],
        shifts=body["shifts"]
    )
    return result
