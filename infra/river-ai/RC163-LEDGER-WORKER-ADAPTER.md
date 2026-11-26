# RC-163 — Ledger/Worker integration adapter
An interface-level adapter prototype connects a ledger lease interface, injected supervisor, and injected policy gate.

The ledger and policy are protocol-like contracts with test doubles, not a real integrated dependency. This does not wire into RC-159's implementation or a running service, and does not provide distributed lease guarantees. Error handling is deliberately generic; tests are authored but not executed in this session.
