# RC-161 — Process-supervised task harness
Prototype runs allowlisted toy tasks in a child Python process, with isolated working directory, restricted environment, input-size validation and timeout supervision.

Files: `rc161_sandbox_supervisor.py`, `rc161_restricted_child.py`, tests.

**Security boundary warning:** a subprocess and clean environment are not a hardened sandbox; no OS-level network isolation, syscall restrictions, filesystem confinement guarantee, resource quotas, or container boundary is implemented. Only toy allowlisted tasks. Do not run untrusted code or deploy. Test suite authored; execution status must be verified by CI.

Run from directory: `python -m unittest -v`.
