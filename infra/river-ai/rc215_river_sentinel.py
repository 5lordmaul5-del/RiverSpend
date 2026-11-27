"""RC215: lawful public-source strategic intelligence processing. Offline-first; no crawling or auth bypass."""
from __future__ import annotations
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from hashlib import sha256
from typing import Any
import json

CATEGORIES = {"investment", "product", "technology", "partnership", "filing", "patent", "research", "hiring", "other"}
COMPANIES = {"Amazon", "Anthropic", "Groq", "OpenAI", "Microsoft", "Google", "NVIDIA", "Meta"}

@dataclass
class Signal:
    title: str
    company: str
    category: str
    summary: str
    source_name: str
    source_url: str
    published_at: str
    collected_at: str
    evidence_type: str = "public_source"
    confidence: str = "unassessed"
    tags: list[str] | None = None
    signal_id: str = ""

def normalize(raw: dict[str, Any], *, collected_at: str | None = None) -> Signal:
    required = ["title", "company", "category", "summary", "source_name", "source_url", "published_at"]
    missing = [k for k in required if not raw.get(k)]
    if missing: raise ValueError("missing fields: " + ", ".join(missing))
    if raw["category"] not in CATEGORIES: raise ValueError("invalid category")
    if not str(raw["source_url"]).startswith(("https://", "http://")): raise ValueError("source_url must be HTTP(S)")
    ts = raw["published_at"]
    datetime.fromisoformat(ts.replace("Z", "+00:00"))
    collected = collected_at or datetime.now(timezone.utc).isoformat()
    payload = {k: raw[k] for k in required}
    signal_id = sha256(json.dumps(payload, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:20]
    return Signal(title=str(raw["title"]), company=str(raw["company"]), category=raw["category"],
        summary=str(raw["summary"]), source_name=str(raw["source_name"]), source_url=str(raw["source_url"]),
        published_at=ts, collected_at=collected, confidence=str(raw.get("confidence", "unassessed")),
        tags=list(raw.get("tags", [])), signal_id=signal_id)

def analyze(signals: list[Signal]) -> dict:
    by_company: dict[str, list[dict]] = {}
    by_category: dict[str, int] = {}
    for s in signals:
        by_company.setdefault(s.company, []).append(asdict(s))
        by_category[s.category] = by_category.get(s.category, 0) + 1
    return {"count": len(signals), "companies": by_company, "category_counts": by_category,
        "limitations": ["Signals reflect only supplied public sources.", "Patterns are not verified predictions.",
                        "No investment advice or execution capability."]}

def render_markdown(signals: list[Signal]) -> str:
    lines = ["# River Sentinel — Public Intelligence Report", "",
             f"Signals reviewed: **{len(signals)}**", "",
             "## Signals", ""]
    if not signals: lines.append("No signals supplied.")
    for s in signals:
        lines.extend([f"### {s.company} — {s.title}", f"- Category: {s.category}",
          f"- Published: {s.published_at}", f"- Source: [{s.source_name}]({s.source_url})",
          f"- Confidence: {s.confidence}", f"- Summary: {s.summary}", f"- ID: {s.signal_id}", ""])
    lines += ["## Interpretation safeguards", "- Reported facts are distinct from analysis.",
      "- Do not treat this report as prediction, investment advice, or proof of intent.",
      "- Validate sources and context independently."]
    return "\n".join(lines)

def deduplicate(signals: list[Signal]) -> list[Signal]:
    seen=set(); result=[]
    for s in signals:
        if s.signal_id not in seen: seen.add(s.signal_id); result.append(s)
    return result

if __name__ == "__main__":
    import argparse
    p=argparse.ArgumentParser(description="Process supplied public-source intelligence signals.")
    p.add_argument("input", help="JSON file containing an array of signal objects")
    p.add_argument("--report", default="rc215-report.md")
    p.add_argument("--json-out", default="rc215-analysis.json")
    args=p.parse_args()
    with open(args.input, encoding="utf-8") as f: raw=json.load(f)
    signals=deduplicate([normalize(x) for x in raw])
    with open(args.report,"w",encoding="utf-8") as f: f.write(render_markdown(signals))
    with open(args.json_out,"w",encoding="utf-8") as f: json.dump(analyze(signals),f,ensure_ascii=False,indent=2)
    print(f"Processed {len(signals)} unique signals; outputs: {args.report}, {args.json_out}")
