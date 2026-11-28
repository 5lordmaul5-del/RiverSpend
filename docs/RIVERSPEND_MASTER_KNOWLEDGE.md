# RiverSpend — canonical project context for RiverSSAI

This file is the versioned baseline project context for the isolated RiverSSAI runtime. It is intentionally concise and must not be treated as a substitute for checking live repository state.

## Project and identity
- Official project: RiverSpend. Marketplace area: RiverSpendShop.
- Tagline: YOUR SHOP • YOUR FLOW.
- Ecosystem concepts: RiverSpend Market, Pay, Shield, Box, Fidelity, Oracle, Experience, Recovery, Park, TV, Ecology, Fortress.
- Values: trust, protection, reliability, respect. Buyer protection and traffic-light trust rules (green/yellow/red).

## Phase priorities
1. Marketplace V1: private sellers first, catalog/search/categories, product pages, wishlist, cart, orders, reviews, seller profiles/offers; product upload should support 1–20 photos.
2. RiverSpend Pay and payment safety; payment provider integration is not presumed live.
3. RiverSpend Shield buyer protection.
4. RiverSpend Box logistics/tracking.
5. Continue other ecosystem modules only after the core is stable.

## UX and constraints
- Aqua/river visual identity, white marketplace surfaces, gold Shop accent.
- Avoid generic marketplace language; wishlist/net and RiverMoney are branded concepts.
- No autoplay audio; optional audio controls.
- User is not a programmer and prefers simple, executable installation instructions and sequential delivery.
- Budget-conscious; do not assume paid infrastructure or investor funding.

## Technical boundaries
- RiverSSAI independent runtime is intended to use local Ollama inference and isolated PostgreSQL, not live Supabase or public production data.
- Never merge, deploy, cut over, spend, change credentials or modify live data without explicit authorization.
- Do not claim hardware installation or runtime tests have occurred unless evidence exists.
- Treat this document as project context, not a source of live status, secrets, credentials, or approvals.
