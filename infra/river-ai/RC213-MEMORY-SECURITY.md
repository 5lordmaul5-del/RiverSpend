# RC213 — Memory Security & Encryption

Authenticated encryption envelope for local memory export/backup files using AES-GCM via the external `cryptography` package.

- 256-bit AES-GCM keys supported (also accepts AES 128/192 keys).
- Random 96-bit nonce per file, authentication tag checked before plaintext is written.
- Key generation helper; keys are not stored, logged, or embedded.
- Caller must use a secure key-management system, OS keystore or offline secret manager.

## Usage
Install dependency `cryptography`. Generate a key using `generate_key()`; store it securely outside this module. Call `encrypt_file` / `decrypt_file`.

## Limits
Prototype: no key rotation workflow, envelope metadata/version migration, hardware-backed key storage, access policy, memory wiping, or enterprise key-management integration. Never store key alongside ciphertext. Tests authored but not executed here. Draft PR only; no merge/deploy.
