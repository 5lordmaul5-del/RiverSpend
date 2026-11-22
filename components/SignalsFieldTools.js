import { useEffect, useRef, useState } from "react";

const NATO = {
  A: "Alfa", B: "Bravo", C: "Charlie", D: "Delta", E: "Echo", F: "Foxtrot",
  G: "Golf", H: "Hotel", I: "India", J: "Juliett", K: "Kilo", L: "Lima",
  M: "Mike", N: "November", O: "Oscar", P: "Papa", Q: "Quebec", R: "Romeo",
  S: "Sierra", T: "Tango", U: "Uniform", V: "Victor", W: "Whiskey",
  X: "X-ray", Y: "Yankee", Z: "Zulu"
};

const MORSE = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.",
  H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.",
  O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-",
  V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
  "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
  ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-",
  "\"": ".-..-.", "$": "...-..-", "@": ".--.-."
};
const REVERSE_MORSE = Object.fromEntries(Object.entries(MORSE).map(([letter, code]) => [code, letter]));

function normalizeText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}
function encodeNato(value) {
  return normalizeText(value).trim().split(/\s+/).filter(Boolean)
    .map((word) => Array.from(word).map((char) => NATO[char] || char).join(" "))
    .join("   /   ");
}
function encodeMorse(value) {
  return normalizeText(value).split("").map((char) => {
    if (char === " ") return "/";
    return MORSE[char] || "";
  }).filter((item) => item !== "").join(" ");
}
function decodeMorse(value) {
  return String(value || "").trim().split(/\s*\/\s*/).map((word) => {
    if (!word.trim()) return "";
    return word.trim().split(/\s+/).map((code) => REVERSE_MORSE[code] || "�").join("");
  }).join(" ");
}

export default function SignalsFieldTools({ open, onClose, canTalk, onVoiceReady }) {
  const [tab, setTab] = useState("nato");
  const [text, setText] = useState("");
  const [morseText, setMorseText] = useState("");
  const [morseMode, setMorseMode] = useState("encode");
  const [speaking, setSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingError, setRecordingError] = useState("");
  const [copied, setCopied] = useState("");
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const pressHeldRef = useRef(false);
  const audioContextRef = useRef(null);

  const natoOutput = encodeNato(text);
  const morseOutput = morseMode === "encode" ? encodeMorse(morseText) : decodeMorse(morseText);

  useEffect(() => {
    if (open) return;
    pressHeldRef.current = false;
    if (recorderRef.current?.state === "recording") {
      try { recorderRef.current.stop(); } catch {}
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
    setRecording(false);
  }, [open]);

  useEffect(() => () => {
    pressHeldRef.current = false;
    try { if (recorderRef.current?.state === "recording") recorderRef.current.stop(); } catch {}
    streamRef.current?.getTracks().forEach((track) => track.stop());
    try { audioContextRef.current?.close(); } catch {}
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  async function copyText(value, label) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("Copia non disponibile: seleziona il testo");
    }
  }

  function speakNato() {
    if (!natoOutput || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(natoOutput.replaceAll("/", "pausa"));
    utterance.lang = "en-US";
    utterance.rate = 0.82;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  async function playMorse() {
    const code = morseMode === "encode" ? encodeMorse(morseText) : encodeMorse(decodeMorse(morseText));
    if (!code) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      setRecordingError("Audio Morse non supportato da questo browser.");
      return;
    }
    try {
      const context = audioContextRef.current || new AudioContextClass();
      audioContextRef.current = context;
      if (context.state !== "running") await context.resume();
      const unit = 0.085;
      let at = context.currentTime + 0.08;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 650;
      gain.gain.value = 0;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(at);
      for (const symbol of code) {
        if (symbol === "." || symbol === "-") {
          const duration = symbol === "." ? unit : unit * 3;
          gain.gain.setValueAtTime(0.18, at);
          gain.gain.setValueAtTime(0, at + duration);
          at += duration + unit;
        } else if (symbol === " ") {
          at += unit * 2;
        } else if (symbol === "/") {
          at += unit * 5;
        }
      }
      oscillator.stop(at + 0.05);
      setRecordingError("Segnale Morse riprodotto.");
    } catch (error) {
      setRecordingError("Audio Morse non avviato: " + (error?.message || "controlla il volume del telefono."));
    }
  }

  async function beginPushToTalk(event) {
    event?.preventDefault?.();
    if (!canTalk || recorderRef.current || recording) return;
    pressHeldRef.current = true;
    setRecordingError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("Il browser non supporta la registrazione audio.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      if (!pressHeldRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        return;
      }
      const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
      const mimeType = candidates.find((candidate) => MediaRecorder.isTypeSupported?.(candidate));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data?.size) chunksRef.current.push(e.data); };
      recorder.onerror = () => {
        setRecordingError("Errore durante la registrazione PTT.");
        stopResources();
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        const extension = type.includes("mp4") ? "m4a" : "webm";
        if (blob.size && onVoiceReady) {
          onVoiceReady(new File([blob], "signals-ptt-" + Date.now() + "." + extension, { type }));
          setRecordingError("Messaggio vocale PTT pronto nella chat. Premi Invia per spedirlo.");
        } else if (!blob.size) {
          setRecordingError("Registrazione vuota: tieni premuto più a lungo e riprova.");
        }
        stream.getTracks().forEach((track) => track.stop());
        if (streamRef.current === stream) streamRef.current = null;
        recorderRef.current = null;
        setRecording(false);
      };
      recorder.start(250);
      setRecording(true);
    } catch (error) {
      pressHeldRef.current = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setRecording(false);
      setRecordingError(error?.message || "Microfono non disponibile.");
    }
  }

  function stopResources() {
    pressHeldRef.current = false;
    try {
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      else {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setRecording(false);
      }
    } catch {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      recorderRef.current = null;
      setRecording(false);
    }
  }

  function endPushToTalk(event) {
    event?.preventDefault?.();
    if (!pressHeldRef.current) return;
    stopResources();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/75 p-3" role="dialog" aria-modal="true" aria-labelledby="signals-tools-title">
      <section className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-amber-300/70 bg-[#f7faf5] shadow-2xl">
        <header className="flex items-center justify-between gap-3 bg-[#263b2a] px-4 py-4 text-white">
          <div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200">Signals Field Tools</div><h2 id="signals-tools-title" className="text-xl font-black">Alfabeto · Morse · Walkie</h2></div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-white/40 text-2xl" aria-label="Chiudi strumenti">×</button>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b border-emerald-900/15 bg-[#e8eee2] p-3">
          {[["nato","🔠 NATO / ICAO"],["morse","〰 Morse"],["ptt","📻 Walkie PTT"]].map(([id,label]) => <button key={id} type="button" onClick={() => setTab(id)} className={"shrink-0 rounded-full px-4 py-2 text-xs font-bold " + (tab === id ? "bg-[#263b2a] text-white" : "bg-white text-[#263b2a]")}>{label}</button>)}
        </nav>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {tab === "nato" && <div>
            <p className="text-sm leading-relaxed text-slate-600">Scrivi lettere, nomi o codici. Signals li converte nell’alfabeto fonetico internazionale ICAO, parola per parola.</p>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Es. RIVERSPEND 10.0" className="mt-3 w-full rounded-2xl border border-emerald-900/20 bg-white p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-700" />
            <div className="mt-3 rounded-2xl border border-emerald-900/20 bg-white p-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-900">Conversione NATO · ICAO</div>
              <p className="mt-2 min-h-12 whitespace-pre-wrap break-words text-sm font-semibold text-[#263b2a]">{natoOutput || "Qui apparirà la conversione."}</p>
              <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4 md:grid-cols-5">
                {Object.entries(NATO).map(([letter, word]) => <div key={letter} className="flex items-center gap-2 rounded-lg bg-[#eef3e9] px-2 py-1.5"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#263b2a] text-[10px] font-black text-white">{letter}</span><span className="truncate text-[10px] font-bold text-[#263b2a]">{word}</span></div>)}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" disabled={!natoOutput} onClick={() => copyText(natoOutput, "Conversione copiata")} className="rounded-xl bg-[#263b2a] px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Copia</button>
                <button type="button" disabled={!natoOutput} onClick={speakNato} className="rounded-xl bg-amber-300 px-3 py-2 text-xs font-bold text-[#263b2a] disabled:opacity-40">{speaking ? "Pronuncia in corso…" : "🔊 Ascolta"}</button>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">La pronuncia usa la voce installata nel dispositivo; la voce disponibile dipende dal telefono.</p>
            </div>
          </div>}
          {tab === "morse" && <div>
            <p className="text-sm leading-relaxed text-slate-600">Converti testo in punti e linee oppure decodifica una sequenza Morse. Usa uno spazio fra le lettere e “ / ” fra le parole.</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => setMorseMode("encode")} className={"rounded-full px-4 py-2 text-xs font-bold " + (morseMode === "encode" ? "bg-[#263b2a] text-white" : "bg-white text-[#263b2a]")}>Testo → Morse</button>
              <button type="button" onClick={() => setMorseMode("decode")} className={"rounded-full px-4 py-2 text-xs font-bold " + (morseMode === "decode" ? "bg-[#263b2a] text-white" : "bg-white text-[#263b2a]")}>Morse → Testo</button>
            </div>
            <textarea value={morseText} onChange={(e) => setMorseText(e.target.value)} rows={3} placeholder={morseMode === "encode" ? "Scrivi un messaggio…" : "... --- ... / .- .. ..- - ---"} className="mt-3 w-full rounded-2xl border border-emerald-900/20 bg-white p-3 font-mono text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-700" />
            <div className="mt-3 rounded-2xl border border-emerald-900/20 bg-white p-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-900">Risultato</div>
              <p className="mt-2 min-h-12 whitespace-pre-wrap break-words font-mono text-sm font-semibold text-[#263b2a]">{morseOutput || "Qui apparirà la conversione."}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" disabled={!morseOutput} onClick={() => copyText(morseOutput, "Codice copiato")} className="rounded-xl bg-[#263b2a] px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Copia codice</button>
                <button type="button" disabled={!morseText.trim()} onClick={playMorse} className="rounded-xl bg-amber-300 px-3 py-2 text-xs font-bold text-[#263b2a] disabled:opacity-40">🔊 Riproduci segnale</button>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">Supporta lettere A–Z, numeri 0–9 e punteggiatura comune. Le lettere accentate vengono convertite nella lettera base.</p>
          </div>}
          {tab === "ptt" && <div>
            <div className="rounded-2xl border border-emerald-900/20 bg-white p-4">
              <div className="text-center text-5xl">📻</div>
              <h3 className="mt-2 text-center text-lg font-black text-[#263b2a]">Push‑to‑Talk RiverSignals</h3>
              <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">Tieni premuto mentre parli, rilascia per preparare il messaggio vocale. Potrai ascoltarlo nella chat prima di inviarlo.</p>
              <button type="button" disabled={!canTalk} onPointerDown={beginPushToTalk} onPointerUp={endPushToTalk} onPointerCancel={endPushToTalk} onPointerLeave={endPushToTalk} onContextMenu={(e) => e.preventDefault()} className={"mt-5 flex min-h-20 w-full select-none touch-none items-center justify-center rounded-2xl px-4 py-5 text-base font-black text-white shadow-lg " + (recording ? "bg-red-700" : "bg-[#263b2a]") + (!canTalk ? " opacity-40" : "")}>
                {recording ? "🔴 STO REGISTRANDO · RILASCIA PER TERMINARE" : "🎙️ TIENI PREMUTO PER PARLARE"}
              </button>
              {!canTalk && <p className="mt-3 text-center text-xs text-amber-800">Apri prima una conversazione per preparare un vocale nella chat.</p>}
              {recordingError && <p role="status" className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">{recordingError}</p>}
              <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500">Questa è la modalità PTT per messaggi vocali. La trasmissione walkie‑talkie in diretta tra due telefoni richiede ancora chiamata WebRTC, segnalazione e server TURN: non è attiva in questa versione.</p>
            </div>
          </div>}
          {copied && <p role="status" className="mt-3 text-center text-xs font-semibold text-emerald-800">{copied}</p>}
        </div>
        <footer className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 text-[11px] text-slate-500"><span>Strumenti locali · nessun messaggio inviato automaticamente</span><button type="button" onClick={onClose} className="rounded-full bg-[#263b2a] px-4 py-2 font-bold text-white">Fine</button></footer>
      </section>
    </div>
  );
}
