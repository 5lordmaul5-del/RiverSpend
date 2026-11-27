# RiverSpend Mobile Foundation (Android + iOS)

This is the first shared mobile foundation for RiverSpend-family apps. It uses a web-first shared shell intended to be wrapped by Capacitor for Android and iOS. This repository contribution is scaffolding/documentation, not compiled or signed APK/IPA artifacts.

## Targets
- Android: Capacitor Android project, ultimately APK for direct testing and AAB for Play Store.
- iOS: Capacitor iOS project, build/sign/archive through Xcode on macOS.
- Shared: UI, application logic, API integration and assets.

## Bootstrap (developer machine)
Prerequisites: Node.js LTS, npm, Android Studio/SDK for Android; macOS + Xcode for iOS.

```sh
npm install
npm run build
npx cap add android
# On macOS:
npx cap add ios
npm run sync
npx cap open android
# or npx cap open ios
```

If the native platform directories are not present, run the add commands once. After changing web assets, run `npm run sync`.

## Release readiness
- Set real API endpoints and secure auth before production.
- Configure app identifiers, icons, splash screens, privacy declarations, and permission rationale.
- Test on physical devices and multiple OS versions.
- Android builds require signing configuration; iOS builds require Apple signing and provisioning.
- Do not embed secrets in client apps.
- App-store publishing and payments must comply with platform policies.

## Initial shell
A small responsive shell is included at `mobile/web`. Use it as a starting point for a shared mobile shell, not as a production app or finished ecosystem integration.
