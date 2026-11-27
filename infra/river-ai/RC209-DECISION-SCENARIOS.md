# RC209 — Decision Intelligence & Scenario Engine
Offline comparison of scenarios with user-entered estimates.

- Cost and benefit validation.
- Net estimate and optional benefit/cost ratio (ratio omitted for zero cost).
- Risk band from user-supplied 0–25 score.
- Ranking: net estimate descending, risk ascending, stable ID tie-break.
- Tests included.

Outputs are illustrative calculations, not forecasts, advice or autonomous decisions. Values require human review and uncertainty analysis. No integrations or network calls.

Run: `python -m unittest infra/river-ai/test_rc209_decision_scenarios.py`
