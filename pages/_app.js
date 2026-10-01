import { useEffect, useState } from 'react';
import '../styles/globals.css';

const LANGUAGES = [
  ['it', '🇮🇹 Italiano'],
  ['en', '🇬🇧 English'],
  ['es', '🇪🇸 Español'],
  ['fr', '🇫🇷 Français'],
  ['de', '🇩🇪 Deutsch'],
  ['pt', '🇵🇹 Português'],
  ['ar', '🇸🇦 العربية'],
  ['zh', '🇨🇳 中文'],
  ['ja', '🇯🇵 日本語'],
  ['hi', '🇮🇳 हिन्दी'],
  ['ru', '🇷🇺 Русский']
];

function LanguageControl() {
  const [language, setLanguage] = useState('it');

  useEffect(() => {
    let saved = '';
    try { saved = localStorage.getItem('riverspend-language') || ''; } catch {}
    const supported = LANGUAGES.some(([code]) => code === saved);
    const browser = (navigator.language || 'it').slice(0, 2).toLowerCase();
    const initial = supported ? saved : (LANGUAGES.some(([code]) => code === browser) ? browser : 'en');
    setLanguage(initial);
    document.documentElement.lang = initial;
  }, []);

  function changeLanguage(event) {
    const next = event.target.value;
    setLanguage(next);
    document.documentElement.lang = next;
    try { localStorage.setItem('riverspend-language', next); } catch {}
    window.dispatchEvent(new CustomEvent('riverspend:language-change', { detail: { language: next } }));
  }

  return (
    <div className="fixed right-3 top-3 z-[100]">
      <label htmlFor="rs-language" className="sr-only">Choose language / Scegli la lingua</label>
      <select
        id="rs-language"
        value={language}
        onChange={changeLanguage}
        aria-label="Choose language / Scegli la lingua"
        className="max-w-[145px] rounded-full border border-teal-700 bg-slate-950/95 px-3 py-2 text-xs font-semibold text-teal-100 shadow-lg backdrop-blur"
      >
        {LANGUAGES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
      </select>
    </div>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <>
      <LanguageControl />
      <Component {...pageProps} />
    </>
  );
}
