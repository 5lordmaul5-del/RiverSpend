# RC260 — External Audio & MIDI Input

Experimental browser input hub for audio devices and MIDI keyboards.

## Prototype
- Browser audio capture via getUserMedia, device selection and basic level meter.
- Record audio through MediaRecorder and download the take.
- Web MIDI API enumerates available inputs and logs Note On/Off events.

## Device setups
- Android phone microphone: permission-enabled browser, HTTPS; capture available input.
- Guitar: plug into a compatible USB audio interface; connect interface to phone with compatible OTG/USB-C adapter or to PC. Guitar's analog jack should not be connected directly to phone jack without suitable audio interface/adaptor.
- MIDI keyboard: USB MIDI interface/keyboard plus USB host/OTG as applicable, permissions and compatible browser.
- PC: USB audio interface, MIDI controller, mic or line inputs; device and browser support varies.

## Limits
Prototype does not yet provide live monitoring, latency compensation, effects, pitch tracking, MIDI recording/export, DAW-grade multitrack editing, or RiverSSAI model integration. Device support depends on platform, browser, permissions and HTTPS context.
