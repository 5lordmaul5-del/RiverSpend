# RiverSpend mobile apps — implementation plan

## Scope
Prepare a family of separate mobile apps for Android and iOS, while keeping the existing RiverSpendShop website stable. Do not replace the current production homepage as part of mobile-app scaffolding.

## Apps
1. **RiverSpendShop** — marketplace for browsing, listing, wishlist/network, cart, orders and seller features.
2. **RiverSpendStream** — separate video/content destination; publish only content RiverSpend is licensed to distribute.
3. **RiverSpend Panel Control (RSPC)** — separate private app for the CEO and explicitly authorized collaborators; role-based access, never bundled into the public Shop app.
4. **RiverSpendPay** — payment experience only after the permitted payment flow, compliance, and backend protections have been verified. Do not collect or store card credentials in the app.
5. **RiverSpend Park** — separate park experience for attractions, tickets/entry information, events, and visitor information. Do not implement operational safety-critical controls without review.

## Technical approach
- Keep the existing Next.js/Vercel site and Supabase backend as the current source of truth.
- Build shared mobile foundations, then produce separate Android and iOS app targets. Evaluate a cross-platform framework (React Native/Expo or Capacitor) after checking the existing authentication, uploads, notifications, deep links, and native-device requirements.
- Reuse the backend only through authenticated, least-privilege APIs; never put Supabase service-role secrets or payment-provider secrets in mobile clients.
- Keep RSPC on its own access boundary and require server-side authorization for every privileged operation.
- Create development/test builds first; do not publish a download or claim an app is ready until it builds, installs, and passes functional tests.

## Release gates
1. Inventory existing routes, authentication, database tables, upload flow, checkout and environment variables.
2. Establish a minimal mobile shell and build pipeline for Android and iOS.
3. Implement and test each app independently against staging/test data.
4. Produce signed Android APK/AAB and iOS archive through the appropriate Apple build/signing process.
5. Complete developer account verification, privacy disclosures, content rights checks, and store/direct-distribution requirements before release.

## Important distribution note (13 October 2026)
Android direct distribution still requires planning for Google's developer-verification rollout; the requirement is expanding globally during 2027. Apple web distribution in the EU is subject to Apple's eligibility, signing, notarization and account requirements, so a website download link alone is not sufficient for iOS.

## Current status
This document records the agreed scope only. It is not evidence that native apps have already been built, signed, tested, or published.
