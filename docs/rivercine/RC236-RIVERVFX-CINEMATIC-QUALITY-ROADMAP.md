# RC236 — RiverVFX Cinematic Quality & Technology Roadmap

## Quality mandate
RiverVFX is intended for serious cinematic, broadcast, game-cinematic and high-end creative work. Avoid novelty effects, toy-like presets, random flashy overlays, meme effects and effects that undermine shot intent. Every effect must be motivated by narrative, art direction, physical context or a deliberate stylized brief.

## Design pillars
1. Shot-first: effects belong to a shot, camera, lens, lighting, composition and story context—not generic filters.
2. Physically informed: where appropriate, model scale, gravity, turbulence, density, light scattering, material response, occlusion, motion blur and exposure consistently.
3. Art-directed control: expose parameters and curves, preserve procedural reproducibility, and allow restrained presets as starting points—not one-click gimmicks.
4. Temporal stability: avoid flicker, popping, inconsistent noise, particle discontinuity and frame-to-frame drift; use deterministic seeds and temporal validation.
5. Layer discipline: explicit layer order, masks/mattes, blend/composite operations, color-space awareness, premultiplication and metadata.
6. Pipeline interoperability: shot IDs and metadata align with RiverStory, RiverVirtual Production, RiverEdit, RiverColor, RiverRender, RiverSAnimationS and River ISSA.
7. Performance and scalability: quality tiers, proxy mode, cache strategy, resource budgeting, render queue and recovery.
8. Professional review: technical QC, preview/full resolution distinction, versioned recipes, non-destructive workflows.

## Target effect families (roadmap, not currently implemented)
- Volumetric atmosphere: fog, haze, cloud layers, shafts of light and controlled density fields.
- Particle systems: dust, debris, rain, snow, sparks, embers and custom emitter systems, with physically informed motion and art direction.
- Fluid and surface effects: water, spray, ripples, foam, wetness and simulation/approximation workflows.
- Fire and smoke: layered simulations or interoperable simulation assets; cinematic scale and lighting controls.
- Destruction and environment effects: debris, procedural fracture, dust impact and environment response, subject to safety and compute constraints.
- Optical and camera effects: restrained lens response, lens distortion, depth-of-field support, exposure-aware glare and optical artifacts; avoid gratuitous lens-flare presets.
- Sci-fi / fantasy effects: energy fields, holographic elements, magic, beams and portals, designed as coherent materials, volumetrics, motion and lighting—not generic neon stickers.
- Compositing and cleanup: masks, roto workflows, keying, tracking data, plate cleanup, grain integration, edge treatment, color management and layer transforms.
- Motion graphics: high-quality typography, title design and procedural graphic elements with controls and templates.

## Future engine roadmap
A staged engine approach is recommended: first interoperable asset and shot graph plus preview pipeline; then real compositing, GPU acceleration, procedural/particle systems and integrations; later selected simulation workflows and render farm/cloud queue. Evaluate mature external engines and formats rather than attempting to reinvent all simulation technology immediately.

## Acceptance criteria for effects modules
- Clear artistic use case and shot context.
- No misleading claims that preview is a final render.
- Reproducible parameters, seeds and versions.
- Temporal and visual QC criteria.
- Documented dependencies and export/interchange path.
- Performance budget and graceful proxy/fallback.
- Accessibility and interface clarity.
- Effects catalog curated for professional quality; presets are not gimmicks.

## RC236 scope
This change establishes quality policy and technical roadmap only. It does not implement simulation, compositor, renderer, tracking, roto, or GPU processing.
