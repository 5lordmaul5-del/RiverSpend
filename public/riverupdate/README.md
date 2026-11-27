# RiverUpdate Registry V1

Static registry proposal for RiverSpend application update channels. This initial implementation is a registry format only; it is not a complete OTA updater or authenticated release system.

## Release channels
- **stable**: approved release for general users.
- **beta**: opted-in users testing pre-release builds.
- **alpha**: limited experimental builds.
- **emergency**: urgent security/critical patch announcements (planned extension).

## Planned workflow
1. Build/test app.
2. Publish immutable release assets and version metadata.
3. Review changelog and compatibility requirements.
4. Update registry channel pointer.
5. App checks registry and presents update notice.
6. PWA assets update through service worker lifecycle; user-facing confirmation and safe cache migration.
7. Rollback registry pointer to prior release when needed.

## Safety
Do not expose secrets in this public JSON. Registry entries should point to immutable, signed release metadata for native apps in the future. Avoid force-updating incompatible apps. For web/PWA apps, updates are delivered via deployment and service worker; users may need to reload or accept update prompts.
