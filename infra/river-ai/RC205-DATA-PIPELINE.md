# RC-205 — Intelligence Data Pipeline

Prototype for common, deterministic record normalization, schema checks, batch rejection reporting, record hashes and basic series quality flags.

## Input contract
Each record requires source, observed_at (ISO-8601 with timezone), metric, numeric value and unit. Optional metadata is retained.

## Output
Normalized UTC timestamp, lowercased metric, numeric value, source/unit/metadata, deterministic record hash and quality flags. Batch mode reports accepted and rejected records without silently dropping errors.

## Quality checks
- Required fields and types
- Timezone-aware timestamps
- Stable record hashes
- Basic duplicate detection
- Timestamp monotonicity check
- Metric mismatch check and multiple-source warning

## Limits
Structural checks are not source authentication or accuracy verification. No network feeds, external integrations, persistent storage, automated investment decisions or live actions. Hashes do not constitute a signed provenance chain. Tests authored but not run here.
