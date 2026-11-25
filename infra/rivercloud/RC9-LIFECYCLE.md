# RC-9 lifecycle prototype
Bounded lifecycle persistence and audit-chain integration.

States: pending -> approved/rejected/cancelled; approved -> prepared; prepared -> running/failed/cancelled; running -> completed/failed; failed -> prepared (retry); terminal states reject further transitions.

The module is a prototype API, not a connected worker or approval identity system. Actors and notes are recorded but not authenticated. Transitioning to running/completed does not run or assert any build/deployment. The lifecycle and audit writes are not transactional; crash-consistency and protected external audit storage remain future work. Do not expose or use in production.
