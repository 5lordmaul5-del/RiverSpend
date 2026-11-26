# RiverCloud local backup and restricted restore (RC-19)

These scripts are for isolated local data directories only. They are not database-aware and do not guarantee a consistent snapshot while a writer is active.

## Backup

Stop or quiesce the RiverCloud writer first. Set:

```sh
export RIVERCLOUD_DATA_DIR=/path/to/quiesced/data
export RIVERCLOUD_BACKUP_DIR=/path/to/separate/backups
sh infra/rivercloud/scripts/backup.sh
```

The script refuses source symlinks and a backup destination inside the source directory. It also fails closed if any transaction lock or temporary snapshot file is present, rather than silently excluding it and producing a potentially inconsistent backup. It creates a compressed archive and SHA-256 checksum and uses restrictive umask. The preflight is not a substitute for quiescing the writer; a concurrent transaction can still race the check.

## Restore to a new isolated directory

Requires Python 3, `sha256sum`, and an archive plus its checksum:

```sh
export RIVERCLOUD_BACKUP_ARCHIVE=/path/to/backups/archive.tar.gz
export RIVERCLOUD_RESTORE_TARGET=/path/to/new-restore-directory
export CONFIRM_RIVERCLOUD_RESTORE=YES
sh infra/rivercloud/scripts/restore.sh
```

The target must not already exist. The checksum is verified before extraction. The restricted extractor permits only regular files and directories, rejects path traversal, absolute/backslash paths, links and special files, duplicate paths and conflicting file/child paths. It limits archive entries to 100,000 and total extracted file bytes to 20 GiB by default. The limit may be changed via `RIVERCLOUD_RESTORE_MAX_BYTES`.

Extraction uses restrictive permissions and cleans up the target if extraction fails. This is still a local recovery utility, not a production recovery system: encryption, off-site storage, retention, immutable storage, monitoring, and recovery-point/recovery-time testing remain to be implemented.
