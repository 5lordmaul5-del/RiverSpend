# RC255 — RiverSSAI Wind Orchestra & Score Composer

## Vision
Add an orchestral composition workspace supporting wind-band instrumentation, including flute/piccolo, oboe, clarinets, bass clarinet, saxophones, bassoon, horns, trumpets, trombones, euphonium, tuba and percussion.

## Prototype scope
- Instrument selection and composition brief (style, tempo, meter, key, duration/form).
- Exportable project JSON.
- MusicXML starter scaffold for selected parts.
- Human review explicitly required.

## MusicXML limitations
The current prototype emits a simple shared placeholder note sequence into selected parts, not transposed or range-checked instrument parts; the notation is not a complete arrangement. It is an interoperability scaffold, intended to be opened and refined in notation software.

## Planned RiverSSAI runtime
Prompt-to-composition generation, musical form and motif planning, harmony/counterpoint, instrument-specific ranges and transposition, voice leading, dynamic/articulation markings, rhythmic variation, score rendering, part extraction, playback, iterative real-time editing and quality validation.

No live AI connection or audio synthesis is implemented in this milestone.
