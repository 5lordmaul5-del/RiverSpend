# RiverCloud Project Snapshot v1
Metadata manifest foundation for project assets: identity, timestamp, paths, asset kinds, versions, and caller-supplied optional checksums.

## Boundaries
This is not a backup service: no asset bytes are uploaded, checksums are not computed/verified, storage is not connected, and restore is not implemented. A manifest alone cannot guarantee recovery. Integration requires storage, authorization, retention, encryption, restore testing, and conflict handling.