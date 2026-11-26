# RC-40 — Docker build-context exclusions

A root `.dockerignore` now excludes sensitive and runtime material from the Docker build context used for the isolated RiverCloud API image.

## Exclusions

- Repository metadata (`.git`)
- `.env` and environment-file variants
- Secret directories
- Queue and lifecycle state files/directories
- Lock, temporary, log, backup and archive files
- Common dependency/build/test-output directories

A regression test checks the required exclusions are present. This does not guarantee protection against every future file pattern; review the build context and Dockerfile before changing the builder.

## CI evidence

- Runs **45757190923 (#358)** and **45757195384 (#359)** failed on the new test's newline splitting logic (148/149 passed). The test is corrected in a follow-up commit; fresh CI is pending.
