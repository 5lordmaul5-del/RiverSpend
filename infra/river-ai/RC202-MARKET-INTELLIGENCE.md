# RC-202 Market Intelligence Prototype

## Scope
An explainable market-analysis module for RiverSSAI using supplied OHLC data. It computes EMA20/EMA50 (when enough history exists), RSI14, 20-period momentum, a volatility estimate, and a rule-based bias/risk summary.

## Output
- Indicator values and a compact rule-based score/bias.
- Human-readable reasons.
- Explicit limitations.

## Not included
No live market feeds, news, fundamentals, portfolio suitability, broker integrations, trading, forecasts, or guaranteed returns. This is research assistance, not financial advice. Indicators can fail and historic data does not guarantee future performance.

## Next integration steps
1. Add approved market data sources and source timestamps.
2. Include macro/news/fundamental context and source-quality checks.
3. Backtest out of sample and evaluate against naive baselines; account for fees, slippage, liquidity and survivorship bias.
4. Risk layer: position sizing, drawdown, concentration and downside scenarios.
5. Human review, permissions, logging and monitoring before any live use.
