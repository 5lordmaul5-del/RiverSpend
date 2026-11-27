# RC207 — Data Quality & Anomaly Detection Engine

Offline, heuristic checks for batches of records with an ID field and numeric metric.

- Flags missing IDs/metrics, duplicate IDs, non-numeric values and robust outliers (median/MAD).
- Detects large adjacent-value changes using configurable relative threshold.
- Produces a compact quality summary and explicit scope warning.

## Limitations
Checks are exploratory signals only: not proof of fraud, error or manipulation. Small samples, distributions, zero values and domain-specific context affect interpretation. No network access, source verification, automated rejection, or enforcement.

## Test
`python -m unittest infra/river-ai/test_rc207_data_quality.py`
