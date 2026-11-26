# RC-176 RiverSSAI Division Coordination Integration

Proposed integration spec. This is not a running feature and does not grant RiverSSAI external execution permissions.

## Shared registry
Load the RC-176 division catalog as planning metadata. Keep registry versioned, schema-validated, and independent from execution permissions.

## Routing proposal
1. Parse request and identify purpose/context.
2. Propose one or more division tags from the registry.
3. Ask for missing scope, constraints, risk, budget, and deliverable details where essential.
4. Generate a project brief and task decomposition.
5. Apply risk-tier classification and restricted-domain rules.
6. For consequential actions, require explicit human approval and qualified review.
7. Record results, sources, confidence, unresolved issues and follow-up tasks.

## Suggested interfaces (design only)
- `divisionRegistry.list()`: read catalog metadata.
- `projectIntake.classify(request)`: produce a draft category/risk assessment.
- `projectIntake.createBrief(request)`: produce a draft project charter.
- `projectCoordinator.proposeTasks(brief)`: draft dependency-aware work breakdown.
- `reviewGates.check(brief)`: checklist only, not a certification or approval.
- `knowledgeIndex.record(result)`: append reviewed knowledge metadata.

No interface may bypass existing RiverSSAI policy gates, supervisor limits, human approval requirements, or sandbox controls. Do not introduce arbitrary command execution, automatic deployment, weapon/targeting workflows, destructive cyber tasks, or unrestricted financial actions.

## Acceptance criteria for future implementation
- Registry JSON validates against a documented schema.
- Unknown divisions are handled safely and do not cause permission escalation.
- Routing results are explicitly marked as suggestions.
- Risk tier and human review requirements appear in generated briefs.
- Restricted requests are refused or redirected to safe high-level alternatives.
- Unit tests cover malformed inputs, unknown tags, high-risk classification, approval gates and audit metadata.
- No secrets, personal data or external integrations are enabled by this registry alone.
