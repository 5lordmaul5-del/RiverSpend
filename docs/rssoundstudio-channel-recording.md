# RiverSpend SoundStudio — per-channel recording foundation

- Added REC CH and STOP REC to each mixer channel.
- Recording taps the processed channel signal after the channel compressor and records locally with MediaRecorder.
- Starting REC begins playback of that source channel. Stop REC stops playback and finalizes a browser-downloadable take.
- Recorded output is a browser-supported container (typically WebM/Opus); the filename uses a .webm extension.
- No upload, cloud persistence, project saving, or runtime/browser validation is claimed.
- Requires browser support for Web Audio MediaStreamDestination and MediaRecorder.
