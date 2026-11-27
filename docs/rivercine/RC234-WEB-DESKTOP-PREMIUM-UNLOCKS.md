# RC234 — RiverCine Web + Desktop & Premium Unlocks

## Decision
Build RiverCine as one product with two planned delivery formats: a browser-first responsive Web App/PWA and a separately packaged desktop client (Windows first, macOS later). Avoid divergent product implementations: shared project format, entitlement catalog, module interfaces and APIs.

## Web-first implementation
- Responsive studio portal and module navigation.
- PWA installability to be added after manifest, service worker, icons and offline strategy are validated.
- Centralized updates and account-based access.

## Desktop direction
- A packaged desktop shell (candidate: Tauri or Electron; evaluate later) using shared UI and API contracts.
- Desktop-only capabilities planned: local file/media access with explicit permissions, local cache, background exports and optional offline mode.
- No desktop binaries are produced in this prototype.

## Paid products / unlock model
- Free starter experience, paid bundles and individual add-ons.
- Entitlements—not UI visibility—must enforce access on server-side APIs.
- Catalog items have stable IDs, versioning, platform scope and dependency declarations.
- Billing integration, checkout, tax/consumer compliance, refunds, receipt handling and license lifecycle remain separate implementation tasks.
- No payment credentials stored by RiverCine. Use a reputable payment processor and provider-hosted checkout/tokenized flow.
- No real purchase, license or unlock is simulated as completed in RC234.

## Suggested catalog (prices TBD)
1. RiverCine Starter (free)
2. Creator Pack: templates, storyboard extras, preset/asset packs
3. Studio Pack: collaboration, advanced pipeline and expanded module access
4. Individual Pro Tools: RiverVFX, RiverColor, RiverEdit, RiverRender, River ISSA Studio, advanced animation and Virtual Production assets
5. Optional future subscriptions only if clearly disclosed and cancellable.

## UX rules
- Clearly distinguish free, preview, locked, purchased and unavailable items.
- Show exactly what a bundle contains, platform availability, price, taxes, renewal terms and cancellation before checkout.
- Never present placeholder buttons as functional payment or purchase.
- Prefer one-time purchase for individual tools where feasible; subscriptions are optional and not required for the free starter.
- Accessibility, language support and mobile layout.

## Prototype files
- apps/rivercine-studios/rivercine-premium-hub.html — catalog/hub prototype.
- infra/rivercine/entitlement-catalog-schema.json — basic catalog structure.

## Acceptance / validation
- [ ] Catalog preview is usable on narrow screens and desktop.
- [ ] Buttons clearly state demo/roadmap state; no misleading checkout affordances.
- [ ] Entitlement design reviewed for server-side enforcement before real commerce.
- [ ] PWA install flow, service worker, persistence and offline behavior are implemented and tested in later PR.
- [ ] Desktop packaging, sandboxed local-file permissions, signing and update strategy evaluated in later PR.
- [ ] Checkout and legal/compliance review completed before launch.

Prototype only; no tests, payment flows, desktop installer, license service or production entitlement enforcement included.
