# RC-32 — restore target directory-descriptor isolation

## Finding

The RC-31 helper used no-follow/exclusive creation for the final file component, but path-based directory checks and open(dest, ...) still left a race in intermediate restore-target directories. An intermediate directory could be renamed and replaced with a symlink between the directory check and file open.

## Correction

- Require O_DIRECTORY, O_NOFOLLOW, and directory-descriptor support for open and mkdir; fail closed when unavailable.
- Traverse/create each archive directory relative to an already-open directory descriptor, opening every child with O_DIRECTORY | O_NOFOLLOW.
- Create files by basename relative to the verified parent descriptor, with O_EXCL | O_NOFOLLOW.
- Sync files and their parent directories, and the restore root.
- On extraction failure, cleanup only if the target path still identifies the directory opened by this restore; do not delete a replaced path.

## Regression

The test injects a directory rename and symlink replacement immediately before the second file is opened. The descriptor-based implementation writes to the directory descriptor already acquired, never follows the replacement symlink, and leaves the outside target unchanged.

## Evidence and limitations

- Reconstructed local workspace: 1/1 deterministic race regression passed.
- Negative-control run against a reconstructed version of the former path-based helper failed the regression because it wrote through the replacement symlink. This is a test-sensitivity check, not a repository checkout.
- GitHub Actions verification is pending. A shallow clone/check-out attempt was blocked by DNS resolution of github.com; do not treat reconstructed testing as full checkout evidence.
- No backup or restore was run against RiverSpend data, no service was started, and no production operation was performed.


## CI closeout — verified

- GitHub Actions run **45723627763 (#322)** passed **131/131 Node tests**, Python syntax and **1/1 directory-replacement race regression**, bootstrap/backup/restore syntax, Compose configuration and Caddy validation.
- Run #322 verified commit **245707bc0a0f869404d7aaa57b6b1467ec71bcb1**. No RiverCloud service or runner was started. The Caddy check used a temporary validation container.
