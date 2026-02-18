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
    """Bulk download to avoid per-symbol rate limiting."""
    import yfinance as yf
    prices = {}
    if not symbols:
        return prices

    # Step 1: Bulk download
    try:
        df = yf.download(" ".join(symbols), period="5d", progress=False, auto_adjust=True, threads=True)
        if not df.empty:
            import pandas as pd
            close = df["Close"] if not isinstance(df.columns, pd.MultiIndex) else df["Close"]
            if isinstance(close, pd.Series):
                # single symbol
                val = close.dropna()
                if not val.empty:
                    prices[symbols[0]] = float(val.iloc[-1])
            else:
                for sym in symbols:
                    if sym in close.columns:
                        val = close[sym].dropna()
                        if not val.empty:
                            prices[sym] = float(val.iloc[-1])
    except Exception as e:
        logger.warning(f"Bulk download failed: {e}")

    # Step 2: Individual fallback for any missing
    for sym in [s for s in symbols if s not in prices]:
        price = MarketDataService.get_current_price(sym)
        if price:
            prices[sym] = price

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
    """
    Bulk-fetch prices so duplicate symbols (same stock, different avg prices)
    are all updated in one API call instead of failing on rate limits.
    """
    from app.models import Investment

    query = db.query(Investment)
    if user_id:
        query = query.filter(Investment.user_id == user_id)

    investments = query.all()
    if not investments:
        return 0

    # De-duplicate symbols for API call efficiency
    unique_symbols = list(set(inv.symbol.strip().upper() for inv in investments))
    prices = MarketDataService.get_multiple_prices(unique_symbols)

    updated_count = 0
    now = datetime.utcnow()
    for investment in investments:
        key = investment.symbol.strip().upper()
        if key in prices:
            investment.last_price = prices[key]
            investment.current_value = investment.units * prices[key]
            investment.last_price_at = now
            updated_count += 1
        else:
            logger.warning(f"No price found for: {investment.symbol}")

    if updated_count > 0:
        db.commit()

    return updated_count
