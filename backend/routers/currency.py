from fastapi import APIRouter, HTTPException
from models.currency import (
    CurrencyConversionRequest, 
    CurrencyConversionResponse,
    MoneyAdviceRequest,
    MoneyAdviceResponse
)
from services.currency_service import currency_service

router = APIRouter(prefix="/api/currency", tags=["Currency Assistant"])

@router.post("/convert", response_model=CurrencyConversionResponse)
async def convert_currency(request: CurrencyConversionRequest):
    """
    Convert currency with real-time exchange rates.
    Includes AI-powered advice about exchange and payment methods.
    """
    try:
        conversion = await currency_service.convert_currency(
            amount=request.amount,
            from_currency=request.from_currency,
            to_currency=request.to_currency
        )
        return conversion
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/advice", response_model=MoneyAdviceResponse)
async def get_money_advice(request: MoneyAdviceRequest):
    """
    Get comprehensive money advice for destination country.
    Includes cash vs card guidance, ATM info, exchange tips, and budget estimates.
    """
    try:
        advice = await currency_service.get_money_advice(
            destination_country=request.destination_country,
            duration_days=request.duration_days
        )
        return advice
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
