import yfinance as yf
from typing import Dict, List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class MarketDataService:
    """Service for fetching market data from Yahoo Finance"""

    @staticmethod
    def get_current_price(symbol: str) -> Optional[float]:
        try:
            symbol = symbol.strip().upper()

            # Try symbol as-is first
            data = yf.Ticker(symbol).history(period="5d")

            # If empty and no suffix, fallback to NSE
            if data.empty and "." not in symbol:
                symbol = f"{symbol}.NS"
                data = yf.Ticker(symbol).history(period="5d")

            if data.empty:
                logger.error(f"Yahoo returned empty data for {symbol}")
                return None

            close_prices = data["Close"].dropna()
            if close_prices.empty:
                logger.error(f"No close prices for {symbol}")
                return None

            return float(close_prices.iloc[-1])

        except Exception as e:
            logger.error(f"Error fetching price for {symbol}: {e}")
            return None

    @staticmethod
    def get_multiple_prices(symbols: List[str]) -> Dict[str, float]:
        prices = {}
        for symbol in symbols:
            normalized = symbol.strip().upper()
            price = MarketDataService.get_current_price(normalized)
            if price is not None:
                prices[normalized] = price  # key matches what DB stores
        return prices

    @staticmethod
    def get_market_data(symbol: str) -> Optional[Dict]:
        try:
            symbol = symbol.strip().upper()

            ticker = yf.Ticker(symbol)
            history = ticker.history(period="5d")

            # Fallback to NSE if empty
            if history.empty and "." not in symbol:
                symbol = f"{symbol}.NS"
                ticker = yf.Ticker(symbol)
                history = ticker.history(period="5d")

            if history.empty:
                return None

            info = ticker.info

            current_price = float(history["Close"].dropna().iloc[-1])
            previous_close = (
                float(history["Close"].dropna().iloc[-2])
                if len(history["Close"].dropna()) > 1
                else current_price
            )

            change = current_price - previous_close
            change_percent = (
                (change / previous_close) * 100 if previous_close != 0 else 0
            )

            return {
                "symbol": symbol,
                "current_price": current_price,
                "change": change,
                "change_percent": change_percent,
                "last_updated": datetime.utcnow(),
                "volume": int(history["Volume"].iloc[-1]) if "Volume" in history else 0,
                "market_cap": info.get("marketCap", 0),
                "pe_ratio": info.get("trailingPE", 0),
            }

        except Exception as e:
            logger.error(f"Error fetching market data for {symbol}: {e}")
            return None

    @staticmethod
    def update_investment_prices(db, user_id: int = None):
        from app.models import Investment

        query = db.query(Investment)
        if user_id:
            query = query.filter(Investment.user_id == user_id)

        investments = query.all()

        # Normalize all symbols before fetching
        symbols = list(set([inv.symbol.strip().upper() for inv in investments]))
        prices = MarketDataService.get_multiple_prices(symbols)

        updated_count = 0
        for investment in investments:
            key = investment.symbol.strip().upper()  # normalize to match prices dict
            if key in prices:
                new_price = prices[key]
                investment.last_price = new_price
                investment.current_value = investment.units * new_price
                investment.last_price_at = datetime.utcnow()
                updated_count += 1
            else:
                logger.warning(f"No price found for symbol: {investment.symbol}")

        db.commit()
        return updated_count
