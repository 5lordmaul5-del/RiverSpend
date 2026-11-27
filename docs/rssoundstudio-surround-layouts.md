# RiverSoundStudio Surround Layout Presets

Added selectable surround project layouts:
- 2.1: 2 front channels + 1 subwoofer
- 4.1: front and rear speakers + 1 subwoofer
- 6.2: 6 main channels + 2 subwoofers
- 8.1: 8 main channels + 1 subwoofer
- 10.1: 10 main channels + 1 subwoofer
- 10.2.4: 10 main channels + 2 subwoofers + 4 height speakers (front/rear left/right)

The mixer now shows a selectable configuration and speaker-role list. This is project-layout selection/UI only, not yet hardware multichannel routing; output routing requires a dedicated engine and compatible-device validation.


## State initialization fix
The mixer initializes its selected surround preset to `10.2.4` and wires the selector to React state, preventing a render-time undefined-variable failure.
