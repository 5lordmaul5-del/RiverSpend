"""River Market Intelligence: explainable, risk-aware market analysis prototype.

Consumes supplied OHLCV data; does not fetch market data or place trades.
Signals are descriptive research indicators, not investment recommendations.
"""
from math import sqrt
from statistics import mean

def _validate(rows):
    if not isinstance(rows, list) or len(rows) < 20:
        raise ValueError("At least 20 OHLCV rows are required")
    for row in rows:
        for k in ("close", "high", "low"):
            if k not in row or not isinstance(row[k], (int, float)) or row[k] <= 0:
                raise ValueError(f"Each row requires positive numeric {k}")
        if row["high"] < row["low"]:
            raise ValueError("high must be >= low")
    return [float(r["close"]) for r in rows]

def _ema(values, period):
    if len(values) < period: return None
    alpha=2/(period+1)
    result=sum(values[:period])/period
    for v in values[period:]: result=alpha*v+(1-alpha)*result
    return result

def _rsi(values, period=14):
    if len(values) <= period: return None
    gains=[]; losses=[]
    for i in range(1,len(values)):
        d=values[i]-values[i-1]; gains.append(max(d,0)); losses.append(max(-d,0))
    avg_g=sum(gains[:period])/period; avg_l=sum(losses[:period])/period
    for g,l in zip(gains[period:],losses[period:]):
        avg_g=(avg_g*(period-1)+g)/period; avg_l=(avg_l*(period-1)+l)/period
    if avg_l==0: return 100.0 if avg_g>0 else 50.0
    rs=avg_g/avg_l
    return 100-(100/(1+rs))

def analyze_market(rows):
    closes=_validate(rows)
    last=closes[-1]
    ema20=_ema(closes,20)
    ema50=_ema(closes,50) if len(closes)>=50 else None
    rsi=_rsi(closes)
    ret=[(closes[i]/closes[i-1])-1 for i in range(1,len(closes))]
    vol=(sqrt(mean([x*x for x in ret[-20:]]))*sqrt(252)) if len(ret)>=20 else None
    momentum=(last/closes[-20]-1) if len(closes)>=20 else None
    score=0; reasons=[]
    if ema20 is not None:
        if last>ema20: score+=1; reasons.append("Prezzo sopra EMA20")
        else: score-=1; reasons.append("Prezzo sotto EMA20")
    if ema50 is not None and ema20 is not None:
        if ema20>ema50: score+=1; reasons.append("EMA20 sopra EMA50")
        else: score-=1; reasons.append("EMA20 sotto EMA50")
    if rsi is not None:
        if rsi>=70: score-=1; reasons.append("RSI in zona alta (possibile eccesso)")
        elif rsi<=30: score+=1; reasons.append("RSI in zona bassa (possibile eccesso)")
        else: reasons.append("RSI in fascia neutrale")
    if momentum is not None:
        if momentum>0: score+=1; reasons.append("Momentum 20-periodi positivo")
        elif momentum<0: score-=1; reasons.append("Momentum 20-periodi negativo")
    label=("Bias positivo" if score>=2 else "Bias negativo" if score<=-2 else "Neutrale/misto")
    risk="Elevato" if vol is not None and vol>0.45 else "Moderato" if vol is not None and vol>0.20 else "Contenuto (stima)"
    return {
        "price":last,"ema20":ema20,"ema50":ema50,"rsi14":rsi,
        "momentum20_pct":momentum*100 if momentum is not None else None,
        "annualized_volatility_estimate":vol,
        "signal_score":score,"market_bias":label,"risk_level":risk,
        "explanation":reasons,
        "limitations":["Indicatori basati solo sui dati forniti.","Non usa news, fondamentali, macroeconomia, liquidità o dati live.",
                      "Non è una previsione garantita né un consiglio finanziario."]
    }
