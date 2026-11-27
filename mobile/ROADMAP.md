# Mobile rollout plan

1. Foundation: shared shell, Capacitor configuration and build/sync instructions.
2. App-by-app conversion: Shop, Signals, Park, Streaming and control tools; each gets its own package identifier and branding.
3. Device capability audit: notifications, camera/photo upload, files, offline caching and secure storage; add only when needed.
4. API integration: central documented API, authentication, environment configuration; never expose secrets in app bundles.
5. QA: automated web checks, Android emulator/device testing, iOS simulator/device testing, accessibility and crash/error handling.
6. Release: Android signed APK/AAB; iOS signed archive/TestFlight/App Store review.

This first scaffold does not claim any app is already compiled, installed, signed, or store-approved.
