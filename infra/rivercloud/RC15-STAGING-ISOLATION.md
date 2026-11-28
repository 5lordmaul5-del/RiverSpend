# RC-15 staging isolation — validation hardening

The plan validator accepts only fixed worker profiles, an immutable commit SHA, explicit approval and staging paths with safe segments. Paths such as /staging/../../production and embedded traversal segments are rejected.

## Limits

Path validation is only a prototype boundary. It does not create or enforce filesystem isolation. No worker process, container, staging host, network policy or runtime resource limit is implemented or started.
