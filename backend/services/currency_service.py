from services.gemini_service import gemini_service
from models.currency import CurrencyConversionResponse, MoneyAdviceResponse
import requests
from config import settings

class CurrencyService:
    
    async def convert_currency(
        self, 
        amount: float, 
        from_currency: str, 
        to_currency: str
    ) -> CurrencyConversionResponse:
        """Convert currency using free exchange rate API"""
        
        try:
            # Use free exchange rate API
            url = f"https://api.exchangerate-api.com/v4/latest/{from_currency.upper()}"
            response = requests.get(url, timeout=5)
            data = response.json()
            
            if to_currency.upper() in data.get('rates', {}):
                rate = data['rates'][to_currency.upper()]
                converted = amount * rate
                
                # Get AI advice
                advice = await self._get_conversion_advice(amount, from_currency, to_currency, converted)
                
                return CurrencyConversionResponse(
                    amount=amount,
                    from_currency=from_currency.upper(),
                    to_currency=to_currency.upper(),
                    converted_amount=round(converted, 2),
                    exchange_rate=round(rate, 4),
                    advice=advice
                )
            else:
                raise ValueError(f"Currency {to_currency} not found")
                
        except Exception as e:
            print(f"Error converting currency: {e}")
            # Fallback response
            return CurrencyConversionResponse(
                amount=amount,
                from_currency=from_currency,
                to_currency=to_currency,
                converted_amount=0.0,
                exchange_rate=0.0,
                advice="Unable to fetch current exchange rates. Please try again later."
            )
    
    async def _get_conversion_advice(
        self, 
        amount: float, 
        from_curr: str, 
        to_curr: str, 
        converted: float
    ) -> str:
        """Get AI-powered money advice"""
        
        prompt = f"""Provide brief financial advice (2-3 sentences) for someone converting {amount} {from_curr} to {to_curr} (≈{converted:.2f} {to_curr}).

Include tips about:
- Best places to exchange
- Whether to use cash or card
- Any fees to watch out for"""

        try:
            advice = await gemini_service.generate_response(prompt)
            return advice.strip()
        except:
            return "Consider using official exchange services or ATMs for better rates."
    
    async def get_money_advice(
        self, 
        destination_country: str, 
        duration_days: int
    ) -> MoneyAdviceResponse:
        """Get comprehensive money advice for destination country"""
        
        prompt = f"""Provide financial advice for someone traveling to {destination_country} for {duration_days} days.

Include:
1. Cash vs Card usage (which is preferred, acceptance rates)
2. ATM availability and fees
3. Currency exchange tips (best places, what to avoid)
4. Local money habits and payment culture
5. Estimated daily budget for basic expenses (food, transport, misc)

Be specific and practical. Keep each section to 2-3 sentences."""

        try:
            response = await gemini_service.generate_response(prompt)
            
            # Parse response into sections (simple split for now)
            lines = response.strip().split('\n')
            
            return MoneyAdviceResponse(
                country=destination_country,
                cash_vs_card_advice=self._extract_section(lines, "cash", "card"),
                atm_availability=self._extract_section(lines, "atm"),
                exchange_tips=self._extract_section(lines, "exchange", "currency"),
                local_money_habits=self._extract_section(lines, "local", "habit", "payment"),
                estimated_daily_budget=self._extract_section(lines, "budget", "cost", "expense")
            )
            
        except Exception as e:
            print(f"Error getting money advice: {e}")
            return MoneyAdviceResponse(
                country=destination_country,
                cash_vs_card_advice="Research local payment preferences before arrival.",
                atm_availability="ATMs are generally available in urban areas.",
                exchange_tips="Exchange at official banks or authorized dealers.",
                local_money_habits="Observe local payment customs and follow local practices.",
                estimated_daily_budget=f"Budget varies by lifestyle; research typical costs for {destination_country}."
            )
    
    def _extract_section(self, lines: list, *keywords) -> str:
        """Extract section from response based on keywords"""
        for line in lines:
            if any(kw.lower() in line.lower() for kw in keywords):
                # Get this line and next few lines
                idx = lines.index(line)
                section = ' '.join(lines[idx:idx+3])
                return section[:200]  # Limit length
        return "Information not available"

currency_service = CurrencyService()
