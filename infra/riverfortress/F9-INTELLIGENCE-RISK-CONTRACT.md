# F9 — RiverFortress Intelligence & Risk Engine Contract

**Status:** design contract only  
**Parent:** F8 Defense & Response  
**Purpose:** provide explainable, evidence-based risk assessment and correlation to support decision-making and prevention, without autonomous uncontrolled action.

## 1. Principles and boundaries
- Defensive, privacy-preserving, explainable analysis.
- Risk scores are advisory; they do not establish certainty or guilt.
- No retaliation, offensive activity, intrusive profiling, or unauthorized data collection.
- F9 may recommend but cannot bypass F1 authorization, F2 secret controls, F7 coordination or F8 response safeguards.
- Human review is required for material decisions or consequential containment.

## 2. Inputs and provenance
Possible sources: verified events and sanitized metadata from F3 Sentinel, F4 ShieldWall, F5 Recovery, F6 IntegrityGuard, F7 CommandCore, and approved operational telemetry. Each input must include source, timestamps, provenance, scope, integrity status, confidence and retention classification. Reject or quarantine malformed, unauthenticated, stale or unverifiable inputs. Do not ingest secret values or unnecessary personal content.

## 3. Risk domains
- Identity and session anomalies
- Policy and authorization violations
- Artifact, configuration and asset integrity
- Dependency and supply-chain signals
- Perimeter and abuse patterns
- Service availability and resource pressure
- Backup and recovery integrity
- Audit, monitoring and event-pipeline health
- Dependency concentration and cascading-risk analysis

## 4. Risk model
Each assessment should present:
- Risk category and affected scope
- Severity and likelihood estimates with explicit uncertainty
- Confidence and freshness
- Impact and blast-radius estimate
- Evidence references and signal provenance
- Known limitations, competing explanations and missing data
- Recommended next steps and approval requirements

Scores must be versioned and documented. Avoid opaque single-number decisions. The interface should expose contributing factors, weights or rationale where practical, and should permit authorized review and correction. Do not use protected or sensitive personal characteristics.

## 5. Correlation and anomaly detection
- Correlate events by time, source, scope and stable non-sensitive identifiers.
- Detect inconsistent, missing, stale or unusual operational signals.
- Use bounded lookback windows and bounded correlation fan-out.
- Deduplicate cautiously; preserve source events.
- Do not equate correlation with causation.
- Track false positives and false negatives through documented review.
- Provide an explanation for each alert or risk change.

## 6. Risk thresholds and workflow
Thresholds may trigger:
- Informational observation and reporting.
- Analyst review and additional evidence requests.
- A response proposal to F8, with scope, rationale, risks and rollback.
- Escalation to designated human responders.

Threshold crossing alone must not authorize destructive, irreversible, broad or high-impact actions. F8 and F1 controls remain authoritative.

## 7. Data governance and privacy
- Minimize data collection and retention.
- Prefer aggregate, sanitized and pseudonymous operational telemetry.
- Redact secrets, tokens, credentials and sensitive payloads.
- Enforce access roles and scoped queries.
- Record access and model/rule version for assessments.
- Document retention, deletion, export and review policies.
- Avoid cross-user profiling and inference of sensitive attributes.

## 8. Resilience and integrity
- Fail closed for privileged recommendations that require unverifiable inputs.
- Mark partial or stale analysis clearly.
- Risk engine outage must not disable baseline security controls.
- Protect rule/model versions and assessment records against tampering.
- Bound query, computation, memory, event fan-out, output size and processing time.
- Prevent prompt-injection or untrusted event content from acting as instructions; treat event payloads as data.

## 9. Human oversight
Provide authorized reviewers with evidence, rationale, uncertainty, alternatives, impact, and appeal/correction mechanisms. High-impact decisions require meaningful human review, not merely click-through approval. Record reviewer decisions and rationale without unnecessary sensitive information.

## 10. Acceptance test matrix
- [ ] Input authentication, provenance, schema and freshness checks.
- [ ] Untrusted event content treated as data, not instructions.
- [ ] Scores include rationale, confidence, version and uncertainty.
- [ ] Missing/partial/stale inputs visibly affect assessment.
- [ ] Correlation does not imply causation or certainty.
- [ ] Sensitive and protected characteristics are not used.
- [ ] Queries, computation, memory, fan-out and outputs are bounded.
- [ ] False-positive review and correction workflows are documented.
- [ ] Privileged actions cannot be triggered directly from score/threshold.
- [ ] Recommendations route through F1/F7/F8 policy and approval controls.
- [ ] Secret and sensitive payload redaction verified.
- [ ] Engine outage does not weaken independent controls.
- [ ] Integrity of rules/models and assessment evidence verified.
- [ ] Human oversight, audit and retention controls reviewed.

## 11. Readiness gates
- **IR0:** contract and risk taxonomy approved.
- **IR1:** provenance and data minimization verified.
- **IR2:** explainable, versioned risk model/rules implemented and reviewed.
- **IR3:** correlation, bounds, privacy and integrity tests passed.
- **IR4:** oversight, correction, audit and retention workflows implemented.
- **IR5:** F7/F8 integration and action-boundary tests passed.
- **IR6:** false-positive/negative evaluation and independent review completed.
- **IR7:** operational ownership and runbooks established.

A gate is not passed without evidence. This contract itself passes no operational readiness gate.

## 12. Current limitations
This PR is documentation-only. It does not implement an intelligence engine, anomaly detector, risk scoring service, telemetry pipeline, or production enforcement.
