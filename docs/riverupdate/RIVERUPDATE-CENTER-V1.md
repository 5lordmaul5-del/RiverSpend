# RiverUpdate Center V1

RiverUpdate is the proposed centralized release metadata and channel system for the RiverSpend app ecosystem.

### Channels
Stable, Beta and Alpha are represented by release pointers in the registry. Emergency security announcements are a planned channel/type.

### Current V1 implementation
- Public static registry JSON.
- Minimal browser dashboard for selecting Stable/Beta/Alpha.
- Documentation of release workflow and safety constraints.

### Not implemented yet
- User accounts/preferences and beta enrollment persistence.
- Automatic updater SDK or shared client library.
- Native APK/Android package updates and signing.
- CI/CD release workflow, signature verification, rollout percentages, telemetry, push alerts, rollback automation.
- Integration into every existing app.

### PWA update model
PWA updates use deployment and service-worker mechanisms. The app can notify users when a new service worker is installed and offer a safe reload. This registry is not itself the updater.

### Release governance
Test, review, publish versioned assets, verify compatibility, then update the channel registry. Preserve previous release metadata for rollback.