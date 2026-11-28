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

- Runs **45757190923 (#358)** and **45757195384 (#359)** failed because the test's escaped newline splitter did not split the `.dockerignore` lines (148/149 passed).
- Runs **45757276500 (#360)** and **45757283045 (#361)** failed on the first splitter correction because the line comparison was not robust to whitespace/line-ending normalization.
- The test is corrected to trim each line after splitting on LF. These failures are recorded and not counted as passes; fresh CI is pending.
