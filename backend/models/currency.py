from pydantic import BaseModel
from typing import Optional

class CurrencyConversionRequest(BaseModel):
    amount: float
    from_currency: str
    to_currency: str

class CurrencyConversionResponse(BaseModel):
    amount: float
    from_currency: str
    to_currency: str
    converted_amount: float
    exchange_rate: float
    advice: str

class MoneyAdviceRequest(BaseModel):
    destination_country: str
    duration_days: int

class MoneyAdviceResponse(BaseModel):
    country: str
    cash_vs_card_advice: str
    atm_availability: str
    exchange_tips: str
    local_money_habits: str
    estimated_daily_budget: str
