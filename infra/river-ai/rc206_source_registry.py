"""RC206: Source registry and trust scoring (metadata-only, offline)."""
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Optional

@dataclass
class Source:
    source_id: str
    label: str
    source_kind: str
    owner: str
    license_note: str
    permitted_use: str
    refresh_interval_seconds: int
    observed_at: Optional[str] = None
    provenance_note: str = ""
    enabled: bool = True

class SourceRegistry:
    def __init__(self):
        self._sources = {}

    def register(self, source: Source):
        if not source.source_id.strip() or source.source_id in self._sources:
            raise ValueError("source_id must be non-empty and unique")
        if source.refresh_interval_seconds < 0:
            raise ValueError("refresh interval cannot be negative")
        self._sources[source.source_id] = source
        return asdict(source)

    def get(self, source_id):
        source = self._sources.get(source_id)
        return asdict(source) if source else None

    def list_sources(self):
        return [asdict(s) for s in sorted(self._sources.values(), key=lambda x: x.source_id)]

    def assess(self, source_id, now=None):
        source = self._sources.get(source_id)
        if not source:
            raise KeyError(source_id)
        now = now or datetime.now(timezone.utc)
        warnings = []
        freshness = "unknown"
        age_seconds = None
        if source.observed_at:
            try:
                stamp = datetime.fromisoformat(source.observed_at.replace("Z", "+00:00"))
                if stamp.tzinfo is None: stamp = stamp.replace(tzinfo=timezone.utc)
                age_seconds = max(0, (now - stamp.astimezone(timezone.utc)).total_seconds())
                freshness = "fresh" if age_seconds <= source.refresh_interval_seconds else "stale"
                if freshness == "stale": warnings.append("data is older than declared refresh interval")
            except ValueError:
                freshness = "invalid_timestamp"
                warnings.append("observed_at timestamp is invalid")
        if not source.enabled: warnings.append("source disabled")
        if not source.license_note.strip(): warnings.append("license/rights note missing")
        if not source.permitted_use.strip(): warnings.append("permitted-use note missing")
        if not source.owner.strip(): warnings.append("source owner missing")
        # This is a metadata checklist, not a source-authenticity verification.
        score = 100
        score -= 25 if freshness in ("stale", "invalid_timestamp") else 0
        score -= 20 if not source.license_note.strip() else 0
        score -= 20 if not source.permitted_use.strip() else 0
        score -= 15 if not source.owner.strip() else 0
        score -= 10 if not source.enabled else 0
        return {"source_id": source_id, "freshness": freshness, "age_seconds": age_seconds,
                "metadata_score": max(0, score), "warnings": warnings,
                "assessment_scope": "metadata only; does not verify authenticity, accuracy, legality or security"}

    def export_catalog(self):
        return {"catalog": self.list_sources(), "catalog_count": len(self._sources)}
