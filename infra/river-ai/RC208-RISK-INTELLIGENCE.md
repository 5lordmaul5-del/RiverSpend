# RC208 — Risk Intelligence Engine
Transparent offline risk matrix prototype using 1–5 probability and impact scores.

- Product score = probability x impact (range 1–25).
- Levels: low (1–4), moderate (5–9), high (10–16), critical (17–25).
- Portfolio aggregation, deterministic sorting, rationale.
- Tests included.

This is a prioritization aid, not predictive certainty or automated decision-making. Ratings require human validation and context. No external data, network calls, enforcement, merge or deployment.

Run: `python -m unittest infra/river-ai/test_rc208_risk_intelligence.py`
