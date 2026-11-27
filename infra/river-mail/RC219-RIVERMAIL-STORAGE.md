# RC219 — RiverMail Storage & Archive Engine (prototype)

SQLite-based storage management: account plan quotas, message folders, archive, soft-delete trash, restore, permanent purge, attachment bytes, quota usage.

## Plan limits (illustrative defaults)
- Free: 100 MiB
- Plus: 5 GiB
- Business: 20 GiB

These are configurable prototype values, not live commercial promises. Quota currently counts message body bytes and attachment bytes; other metadata overhead is excluded. Attachment capacity is checked before insertion, with a prototype-local check (not designed for concurrent production transactions).

## API functions
- create_account / quota
- add_message / add_attachment
- create_folder / folders / move
- archive / trash / restore / purge
- list_messages / attachments

## Important boundaries
This is a local SQLite prototype. No real SMTP/IMAP, upload UI, secure attachment scanning, encryption, concurrent race-safe quota enforcement, retention policy, cloud sync, backup, authentication, billing or deployed service. Tests authored but not executed. Archive does not replace backups. Permanent deletion is user-requested through purge; retention rules require separate design.
