# RiverSignals Universe — Product Blueprint

## Product promise
RiverSignals is planned as a unified communication environment combining messaging, privacy controls, protected identity, AI assistance, translation, payments, live experiences and communities.

This blueprint is a product scope and implementation order. A feature is not considered available merely because it appears in the UI. Each capability must pass code review, backend/security review, CI, preview checks and real-device tests before being labelled live.

## Commercial direction
- Proposed RiverSignals Lifetime: one payment of €1 per account, no automatic renewal.
- Local currency prices must be mapped transparently to a fair EUR-equivalent price; exactly 1 unit of every currency is not equivalent.
- Entitlement belongs to the verified account, not the device; restore access after reinstall/new phone.
- No payment UI may unlock access from a client-side flag. Provider webhook/server-side verification, idempotency, refunds and disputes are mandatory.
- Lifetime access covers the defined Signals app features, not unlimited third-party infrastructure, carrier data or paid external services.

## Modules
1. RiverShield — account/device/session controls, app lock, anti-scam warnings, reporting and abuse handling.
2. RiverGhost — per-message opt-in expiry and view-once media. Deletion must cover database rows, object storage and backups according to a documented retention policy. Screenshots and external recording cannot be guaranteed against.
3. RiverMask — face blur, masks and avatars applied to outgoing video before encoding/upload. Fallback full-frame blur if face tracking is unavailable.
4. RiverVoice — voice effects on recorded messages first; real-time call processing later, subject to latency/device testing.
5. RiverSSAI Assistant — optional user-invoked assistant; disclose what content is sent to the AI service and obtain consent.
6. RiverWorld — translation, transcription and captions; disclose processing and third-party providers.
7. RiverPay — money requests and payments through a licensed PSP/marketplace product. Chat intents are not money transfers. Do not custody seller funds in an ordinary company bank account.
8. RiverLive — live broadcasts, rooms and creator features with moderation and reporting.
9. RiverCommunity — groups, channels, local/global communities and events.
10. RiverIdentity — one account across RiverSpend apps, public/private profile controls and device management.
11. River ENIGMA — end-to-end encryption, device key lifecycle, recovery and independent security review. Current beta must not be described as certified or fully audited.
12. Sticker & Effects Studio — expanded stickers, emoji, themes and visual effects.

## Delivery phases
### Phase 1 — reliable core
Persistent login, chat, unread counts, notifications, profile/account lifecycle, device/session management, backup and two-device test matrix.

### Phase 2 — privacy and identity
View-once/expiring messages, storage cleanup, app lock, device revocation, report/block flows and threat modelling.

### Phase 3 — real-time media
WebRTC audio/video calls, signaling, TURN, permission handling, reconnects, call notifications and two-network/two-device tests. Add RiverMask and RiverVoice after reliable media transport exists.

### Phase 4 — AI and international communication
RiverSSAI backend integration, user-consented context sharing, translation, transcription and captions.

### Phase 5 — payments and community
PSP onboarding, KYC where required, seller/payment flows, refunds/disputes, groups, channels, live and moderation tooling.

## Release gates
A module can be labelled LIVE only after:
- implementation is present (not a placeholder or notice);
- backend schema, RLS, storage and server-side validation are reviewed;
- automated build/tests pass;
- preview is inspected;
- real-device tests cover Android and at least two accounts/devices;
- privacy, security, accessibility and failure states are checked;
- support and user-facing terms are ready.

## Current known boundaries (at blueprint creation)
- Existing Signals route contains chat, status, attachment and some ENIGMA beta functionality.
- Money controls currently create chat intentions; they do not transfer money.
- Audio/video call controls are notices; actual WebRTC calling is not complete.
- RiverSSAI helper is a static guidance panel, not a connected assistant engine.
- Several menu entries are informational notices rather than complete workflows.
- This document and the Universe page are a roadmap/overview, not proof of implementation.
