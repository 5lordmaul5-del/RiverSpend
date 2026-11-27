# RC215 — River Sentinel Public Intelligence Network

## Purpose
A legal, transparent, public-source intelligence workflow to help RiverSSAI track publicly released developments and produce traceable reports.

## Agent/workflow concept
- **River Sentinel:** organizes user-supplied/public signals.
- **River Investment Radar:** tags public financing, acquisitions, investment announcements and filings.
- **River Tech Tracker:** tracks public product, API, research and patent announcements.
- **River Corporate Watch:** tags public partnerships, company announcements and hiring.
- **River Pattern Analyzer:** groups signals and counts activity; does not claim causality.
- **River Strategic Scenarios:** assists with scenario planning, explicitly labeling inference and uncertainty.

## Companies to watch (editable)
Amazon, Anthropic, Groq, OpenAI, Microsoft, Google, NVIDIA, Meta and additional companies chosen by the user.

## Prototype
The offline Python utility accepts JSON records provided by the user or gathered via authorized public feeds/APIs. It validates fields and timestamps, creates deterministic IDs, deduplicates, groups by company/category, and writes Markdown and JSON outputs.

Example input fields: title, company, category, summary, source_name, source_url, published_at; optional confidence and tags.

Run from this directory:
```sh
python rc215_river_sentinel.py signals.json --report report.md --json-out analysis.json
python -m unittest test_rc215_river_sentinel.py
```

## Safety, legality and limits
- No infiltration, malware, covert tracking, credential collection, private systems, access-control bypass, or scraping restrictions.
- Collection must follow source terms, copyright, privacy, robots/technical restrictions where applicable, and applicable law.
- Prefer official announcements, public filings, RSS/Atom feeds, authorized APIs, public patent databases and public research repositories.
- This module does not autonomously access the internet yet; it processes records supplied to it.
- Distinguish **fact**, **analysis**, **hypothesis**, and **speculation** in future dashboards.
- Not financial advice; no trading or investment execution.
- No merge or deployment is included.
