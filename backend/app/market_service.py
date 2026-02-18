import yfinance as yf
from typing import Dict, List, Optional
from datetime import datetime
import logging
import time

logger = logging.getLogger(__name__)


def normalize_symbol(symbol: str) -> str:
    """
    Normalize symbol to Yahoo Finance format.
    .BSE → .BO  |  .NSE → .NS  |  bare symbols stay as-is
    """
    s = symbol.strip().upper()
    if s.endswith(".BSE"):
        return s[:-4] + ".BO"
    if s.endswith(".NSE"):
        return s[:-4] + ".NS"
    return s


def fetch_price_for_symbol(symbol: str) -> Optional[float]:
    """
    Try multiple methods to get a price for one symbol.
    1. fast_info.last_price  (fastest, no heavy API call)
    2. history(period="5d")  (reliable fallback)
    3. NSE suffix fallback   (if bare symbol fails)
    """
    norm = normalize_symbol(symbol)

    candidates = [norm]
    if "." not in norm:
        candidates.append(f"{norm}.NS")  # try NSE if bare symbol

    for sym in candidates:
        # ── Method 1: fast_info ──────────────────────────────────
        try:
            ticker = yf.Ticker(sym)
            price = ticker.fast_info.get("last_price") or ticker.fast_info.get("lastPrice")
            if price and float(price) > 0:
                logger.info(f"fast_info price for {sym}: {price}")
                return float(price)
        except Exception as e:
            logger.debug(f"fast_info failed for {sym}: {e}")

        # ── Method 2: history ────────────────────────────────────
        try:
            ticker = yf.Ticker(sym)
            hist = ticker.history(period="5d")
            if not hist.empty:
                closes = hist["Close"].dropna()
                if not closes.empty:
                    price = float(closes.iloc[-1])
                    if price > 0:
                        logger.info(f"history price for {sym}: {price}")
                        return price
        except Exception as e:
            logger.debug(f"history failed for {sym}: {e}")

        time.sleep(0.3)  # small pause between attempts

    logger.warning(f"All methods failed for symbol: {symbol}")
    return None


class MarketDataService:
    """Service for fetching market data from Yahoo Finance"""

    @staticmethod
    def get_current_price(symbol: str) -> Optional[float]:
        return fetch_price_for_symbol(symbol)

    @staticmethod
    def get_multiple_prices(symbols: List[str]) -> Dict[str, float]:
        """
        Fetch prices for a list of symbols one-by-one with
        fast_info → history fallback. Sequential is more reliable
        than bulk download on hosted environments.
        """
        prices = {}
        for symbol in symbols:
            try:
                price = fetch_price_for_symbol(symbol)
                if price is not None:
                    prices[symbol] = price
                    logger.info(f"✅ {symbol}: {price}")
                else:
                    logger.warning(f"❌ No price for {symbol}")
            except Exception as e:
                logger.error(f"Error fetching {symbol}: {e}")
            # Polite delay to avoid Yahoo rate limiting
            time.sleep(0.5)
        return prices

    @staticmethod
    def get_market_data(symbol: str) -> Optional[Dict]:
        try:
            norm = normalize_symbol(symbol)
            ticker = yf.Ticker(norm)
            history = ticker.history(period="5d")

            if history.empty and "." not in norm:
                norm = f"{norm}.NS"
                ticker = yf.Ticker(norm)
                history = ticker.history(period="5d")

            if history.empty:
                return None

            info = ticker.info
            closes = history["Close"].dropna()
            current_price = float(closes.iloc[-1])
            previous_close = float(closes.iloc[-2]) if len(closes) > 1 else current_price

            change = current_price - previous_close
            change_percent = (change / previous_close * 100) if previous_close != 0 else 0

            return {
                "symbol": norm,
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
        Update last_price and current_value for all investments.
        De-duplicates symbols so the same stock bought twice
        only makes one API call.
        """
        from app.models import Investment

        query = db.query(Investment)
        if user_id:
            query = query.filter(Investment.user_id == user_id)

        investments = query.all()
        if not investments:
            return 0

        # De-duplicate — fetch each unique symbol once
        unique_symbols = list(set(inv.symbol.strip().upper() for inv in investments))
        logger.info(f"Fetching prices for {len(unique_symbols)} unique symbol(s): {unique_symbols}")

        prices = MarketDataService.get_multiple_prices(unique_symbols)
        logger.info(f"Got prices for {len(prices)} symbol(s): {prices}")

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
                logger.warning(f"No price returned for: {investment.symbol}")

        if updated_count > 0:
            db.commit()

        logger.info(f"Updated {updated_count}/{len(investments)} investments")
        return updated_count
