import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function RiverSpaceSignals() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [viewStatus, setViewStatus] = useState(null);
  const [statusCaption, setStatusCaption] = useState('');
  const [statusFile, setStatusFile] = useState(null);
  const [statusBusy, setStatusBusy] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [active, setActive] = useState('');
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [stickerOpen, setStickerOpen] = useState(false);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installMessage, setInstallMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [mediaUrls, setMediaUrls] = useState({});
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState('');
  const recorderRef = useRef(null);

  const activeConversation = conversations.find(c => c.id === active);
  const otherId = activeConversation
    ? (activeConversation.participant_one === user?.id ? activeConversation.participant_two : activeConversation.participant_one)
    : '';
  const otherProfile = profiles.find(p => p.id === otherId);

  const loadStatuses = useCallback(async () => {
    const { data, error: e } = await supabase.from('rs_chat_statuses')
      .select('id,user_id,caption,media_path,media_type,created_at,expires_at')
      .gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false });
    if (e) throw e;
    const rows = data || [];
    const media = await Promise.all(rows.map(async row => {
      if (!row.media_path) return { ...row, mediaUrl: '' };
      const { data: signed } = await supabase.storage.from('signals-status-media').createSignedUrl(row.media_path, 3600);
      return { ...row, mediaUrl: signed?.signedUrl || '' };
    }));
    setStatuses(media);
  }, []);

  async function publishStatus() {
    if (!user || (!statusCaption.trim() && !statusFile) || statusBusy) return;
    setStatusBusy(true); setError('');
    let path = null;
    let type = 'text';
    if (statusFile) {
      type = statusFile.type.startsWith('video/') ? 'video' : 'image';
      path = user.id + '/' + Date.now() + '-' + statusFile.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-90);
      const { error: uploadError } = await supabase.storage.from('signals-status-media')
        .upload(path, statusFile, { contentType: statusFile.type, upsert: false });
      if (uploadError) { setError('Caricamento dello stato non riuscito: ' + uploadError.message); setStatusBusy(false); return; }
    }
    const { error: insertError } = await supabase.from('rs_chat_statuses').insert({
      user_id: user.id, caption: statusCaption.trim(), media_path: path, media_type: type
    });
    if (insertError) {
      if (path) await supabase.storage.from('signals-status-media').remove([path]);
      setError('Pubblicazione dello stato non riuscita: ' + insertError.message);
    } else {
      setStatusCaption(''); setStatusFile(null);
      await loadStatuses();
    }
    setStatusBusy(false);
  }

  const loadPeople = useCallback(async (uid) => {
    const { data, error: e } = await supabase.from('profiles').select('id,display_name').neq('id', uid).order('display_name');
    if (e) throw e;
    setProfiles(data || []);
  }, []);

  const loadConversations = useCallback(async (uid) => {
    const { data, error: e } = await supabase.from('rs_chat_conversations')
      .select('id,participant_one,participant_two,created_at,last_message_at')
      .or('participant_one.eq.' + uid + ',participant_two.eq.' + uid)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (e) throw e;
    setConversations(data || []);
  }, []);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return setMessages([]);
    const { data, error: e } = await supabase.from('rs_chat_messages')
      .select('id,conversation_id,sender_id,body,created_at,read_at,message_type,attachment_path,attachment_name,attachment_mime,attachment_size,metadata')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(300);
    if (e) throw e;
    setMessages(data || []);
    const media = {};
    await Promise.all((data || []).filter(m => m.attachment_path).map(async m => {
      const { data: signed } = await supabase.storage.from('signals-private-media').createSignedUrl(m.attachment_path, 3600);
      if (signed?.signedUrl) media[m.id] = signed.signedUrl;
    }));
    setMediaUrls(media);
  }, []);

  useEffect(() => {
    function beforeInstall(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }
    function installed() {
      setInstallPrompt(null);
      setInstallMessage('RiverSpaceSignals è stata installata sul dispositivo.');
    }
    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) {
      setInstallMessage('Per installarla, apri il menu ⋮ di Chrome e scegli “Installa app” oppure “Aggiungi a schermata Home”.');
      return;
    }
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallMessage(choice?.outcome === 'accepted' ? 'Installazione avviata.' : 'Installazione non completata. Puoi riprovare.');
    setInstallPrompt(null);
  }

  useEffect(() => {
    let alive = true;
    supabase.auth.getUser().then(({ data }) => { if (alive) setUser(data?.user || null); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => { alive = false; listener?.subscription?.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!user) { setProfiles([]); setConversations([]); setMessages([]); setActive(''); return; }
    let alive = true;
    (async () => {
      try {
        setError('');
        await Promise.all([loadPeople(user.id), loadConversations(user.id), loadStatuses()]);
      } catch (e) { if (alive) setError(e.message || 'Errore nel caricamento di Signals.'); }
    })();
    return () => { alive = false; };
  }, [user, loadPeople, loadConversations, loadStatuses]);

  useEffect(() => {
    if (!active) { setMessages([]); return; }
    loadMessages(active).catch(e => setError(e.message || 'Non riesco a caricare i messaggi.'));
    const channel = supabase.channel('signals-messages-' + active)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rs_chat_messages', filter: 'conversation_id=eq.' + active }, () => {
        loadMessages(active).catch(e => setError(e.message));
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [active, loadMessages]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('signals-statuses-' + user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rs_chat_statuses' }, () => {
        loadStatuses().catch(e => setError(e.message));
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, loadStatuses]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('signals-conversations-' + user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rs_chat_conversations' }, () => {
        loadConversations(user.id).catch(e => setError(e.message));
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, loadConversations]);

  async function sendLogin(e) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    const { error: e1 } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + '/riverspace-signals' }
    });
    setBusy(false);
    if (e1) setError(e1.message);
    else setNotice('Link di accesso inviato. Controlla la tua email e aprilo per entrare in Signals.');
  }

  async function startChat(person) {
    if (!user) return;
    setBusy(true); setError(''); setNotice('');
    const [one, two] = [user.id, person.id].sort();
    const { data: existing, error: findError } = await supabase.from('rs_chat_conversations')
      .select('id,participant_one,participant_two,created_at,last_message_at')
      .eq('participant_one', one).eq('participant_two', two).maybeSingle();
    if (findError) { setError(findError.message); setBusy(false); return; }
    let conversation = existing;
    if (!conversation) {
      const { data, error: insertError } = await supabase.from('rs_chat_conversations')
        .insert({ created_by: user.id, participant_one: one, participant_two: two })
        .select('id,participant_one,participant_two,created_at,last_message_at').single();
      if (insertError) {
        const { data: retry } = await supabase.from('rs_chat_conversations')
          .select('id,participant_one,participant_two,created_at,last_message_at')
          .eq('participant_one', one).eq('participant_two', two).maybeSingle();
        if (!retry) { setError(insertError.message); setBusy(false); return; }
        conversation = retry;
      } else conversation = data;
    }
    await loadConversations(user.id);
    setActive(conversation.id);
    setBusy(false);
  }

  async function sendMessage(e) {
    e.preventDefault();
    const body = draft.trim();
    const file = attachment;
    if ((!body && !file) || !active || !user || busy) return;
    setBusy(true); setError('');
    const messageType = !file ? 'text' : file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('video/') ? 'video' : 'file';
    const safeName = file ? file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100) : null;
    const attachmentPath = file ? active + '/' + user.id + '/' + Date.now() + '-' + safeName : null;
    const fallbackBody = messageType === 'image' ? 'Immagine' : messageType === 'audio' ? 'Messaggio vocale' : messageType === 'video' ? 'Video messaggio' : 'Documento';
    const { data: inserted, error: insertError } = await supabase.from('rs_chat_messages').insert({
      conversation_id: active, sender_id: user.id, body: body || fallbackBody,
      message_type: messageType, attachment_path: null,
      attachment_name: file?.name || null, attachment_mime: file?.type || null,
      attachment_size: file?.size || null,
      metadata: file ? { upload_status: 'uploading' } : {}
    }).select('id').single();
    if (insertError) { setBusy(false); setError(insertError.message); return; }
    setDraft(''); setAttachment(null);
    await Promise.all([loadMessages(active), loadConversations(user.id)]);
    if (file) {
      setUploading(true);
      const { error: uploadError } = await supabase.storage.from('signals-private-media')
        .upload(attachmentPath, file, { contentType: file.type || 'application/octet-stream', upsert: false });
      if (uploadError) {
        await supabase.from('rs_chat_messages').update({ metadata: { upload_status: 'failed', upload_error: uploadError.message } }).eq('id', inserted.id);
        setError('Il messaggio è visibile ma il file non è stato caricato: ' + uploadError.message);
      } else {
        const { error: finishError } = await supabase.from('rs_chat_messages').update({
          attachment_path: attachmentPath, metadata: { upload_status: 'sent' }
        }).eq('id', inserted.id);
        if (finishError) setError('File caricato, ma non è stato possibile completare il messaggio: ' + finishError.message);
      }
    }
    setBusy(false); setUploading(false);
    await Promise.all([loadMessages(active), loadConversations(user.id)]);
  }

  async function startMediaRecording(kind) {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { setError('Registrazione non supportata da questo browser.'); return; }
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia(kind === 'video' ? { audio: true, video: { facingMode: 'user' } } : { audio: true });
      const options = kind === 'video' ? { mimeType: 'video/webm' } : { mimeType: 'audio/webm' };
      const recorder = new MediaRecorder(stream, MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined);
      const chunks = []; recorderRef.current = recorder;
      recorder.ondataavailable = event => { if (event.data?.size) chunks.push(event.data); };
      recorder.onerror = () => setError('Errore durante la registrazione.');
      recorder.onstop = () => {
        const type = recorder.mimeType || (kind === 'video' ? 'video/webm' : 'audio/webm');
        const blob = new Blob(chunks, { type });
        if (blob.size) setAttachment(new File([blob], (kind === 'video' ? 'video-messaggio-' : 'messaggio-vocale-') + Date.now() + '.webm', { type }));
        stream.getTracks().forEach(track => track.stop()); recorderRef.current = null; setRecording('');
      };
      recorder.start(500); setRecording(kind); setAttachMenuOpen(false);
    } catch (e) { setError(e.message || 'Accesso a microfono o fotocamera non riuscito.'); }
  }
  function stopMediaRecording() { if (recorderRef.current?.state === 'recording') recorderRef.current.stop(); }
  async function sendLocation() {
    if (!navigator.geolocation || !active || !user || busy) return;
    setBusy(true); setError('');
    navigator.geolocation.getCurrentPosition(async position => {
      const { latitude, longitude } = position.coords;
      const body = '📍 La mia posizione: https://www.google.com/maps?q=' + latitude + ',' + longitude;
      const { error: sendError } = await supabase.from('rs_chat_messages').insert({
        conversation_id: active, sender_id: user.id, body, message_type: 'location',
        metadata: { latitude, longitude, accuracy_m: Math.round(position.coords.accuracy) }
      });
      setBusy(false);
      if (sendError) setError(sendError.message);
      else await loadMessages(active);
    }, err => { setBusy(false); setError(err.message || 'Posizione non disponibile.'); }, { enableHighAccuracy: true, timeout: 12000 });
  }

  async function sendSticker(sticker) {
    if (!active || !user || busy) return;
    setBusy(true); setError('');
    const { error: e } = await supabase.from('rs_chat_messages').insert({ conversation_id: active, sender_id: user.id, body: sticker, message_type: 'sticker', metadata: { sticker } });
    setBusy(false); setStickerOpen(false);
    if (e) setError(e.message); else await Promise.all([loadMessages(active), loadConversations(user.id)]);
  }

  function addEmoji(emoji) { setDraft(v => v + emoji); setEmojiOpen(false); }

  const filteredPeople = useMemo(() => profiles.filter(p =>
    (p.display_name || 'Membro RiverSpend').toLowerCase().includes(search.toLowerCase())
  ), [profiles, search]);

  return <>
    <Head>
      <title>RiverSpaceSignals · RiverSpend</title>
      <meta name="description" content="Messaggi privati RiverSpaceSignals" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      <meta name="theme-color" content="#063b4b" />
      <link rel="icon" href="/icons/riversignals.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/icons/riverspace-signals-app.jpg" />
    </Head>
    <main className="min-h-screen bg-[#eaf7f7] text-slate-800">
      <header className="flex items-center justify-between bg-[#073b4c] px-3 py-2 text-white shadow md:px-4 md:py-3">
        <div className="flex items-center gap-3">
          <img src="/icons/riversignals.svg" alt="RiverSpaceSignals" className="h-8 w-8 rounded-full bg-white p-1 md:h-10 md:w-10" />
          <div><div className="text-base font-bold tracking-wide md:text-lg">RiverSpaceSignals</div><div className="text-xs text-teal-100">YOUR SPACE · YOUR SIGNAL</div></div>
        </div>
        <nav className="flex flex-wrap items-center justify-end gap-1 md:gap-2"><Link href="/riverworld-live" className="rounded-full bg-emerald-300 px-2 py-1.5 text-xs font-bold text-slate-900 hover:bg-emerald-200 md:px-3 md:py-2 md:text-sm">🌍 World Live</Link><button type="button" onClick={installApp} className="rounded-full bg-amber-300 px-2 py-1.5 text-xs font-bold md:px-3 md:py-2 md:text-sm text-slate-900 hover:bg-amber-200">📲 Installa Signals</button><Link href="/" className="rounded-full border border-white/40 px-2 py-1.5 text-xs md:px-3 md:py-2 md:text-sm hover:bg-white/10">RiverSpendShop</Link><Link href="/riverspend-social-network" className="rounded-full border border-white/40 px-3 py-2 text-sm hover:bg-white/10">Community</Link></nav>
      </header>

      {installMessage && <div role="status" className="mx-auto mt-3 max-w-6xl rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-900">{installMessage}</div>}
      {error && <div role="alert" className="mx-auto mt-3 max-w-6xl rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800">{error}</div>}
      {notice && <div role="status" className="mx-auto mt-3 max-w-6xl rounded-xl bg-emerald-100 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      {!user ? <section className="mx-auto mt-12 max-w-md rounded-3xl bg-white p-7 shadow-lg">
        <div className="mb-5 text-center text-5xl">💬</div>
        <h1 className="text-center text-2xl font-bold text-[#073b4c]">Entra in Signals</h1>
        <p className="mt-2 text-center text-sm text-slate-600">Accedi con la tua email per inviare e ricevere messaggi privati.</p>
        <form onSubmit={sendLogin} className="mt-6 space-y-3">
          <label className="block text-sm font-semibold">La tua email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="nome@email.com" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-600" />
          <button disabled={busy} className="w-full rounded-xl bg-[#087e8b] px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Invio…' : 'Ricevi il link di accesso'}</button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-500">L'accesso avviene tramite link email sicuro.</p>
      </section> : <section className="mx-auto grid min-h-[calc(100dvh-56px)] max-w-6xl grid-cols-1 overflow-hidden bg-white shadow-xl md:my-6 md:min-h-[75vh] md:grid-cols-[320px_1fr] md:rounded-3xl">
        <aside className={`border-r border-slate-200 ${active ? 'hidden md:block' : 'block'}`}>
          <div className="border-b border-slate-200 p-4">
            <div className="mb-3">
              <div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-bold text-[#073b4c]">Stati · 24 ore</h2><span className="text-[10px] text-slate-400">RiverSpace</span></div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                <div className="w-24 shrink-0 text-center">
                  <div className="relative mx-auto h-24 w-24">
                    <label className="grid h-24 w-24 cursor-pointer place-items-center rounded-full border-[3px] border-dashed border-teal-500 bg-teal-50 text-3xl text-teal-800" title="Scatta una foto o registra un video">📷
                      <input type="file" accept="image/*,video/*" capture="environment" className="hidden" onChange={e => setStatusFile(e.target.files?.[0] || null)} />
                    </label>
                    <label className="absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full border-2 border-white bg-[#087e8b] text-lg text-white shadow" title="Scegli dalla galleria">＋
                      <input type="file" accept="image/*,video/*" className="hidden" onChange={e => setStatusFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                  <span className="mt-2 block text-xs font-semibold">Il mio stato</span>
                </div>
                {statuses.map(s => {
                  const p = profiles.find(x => x.id === s.user_id);
                  return <button key={s.id} type="button" onClick={() => setViewStatus(s)} className="w-24 shrink-0 text-center">
                    <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-violet-600 p-[3px]"><span className="grid h-full w-full place-items-center overflow-hidden rounded-full border-2 border-white bg-teal-50 text-2xl">{s.mediaUrl && s.media_type === 'image' ? <img src={s.mediaUrl} alt="" className="h-full w-full object-cover" /> : s.media_type === 'video' ? '🎥' : '🌊'}</span></span>
                    <span className="mt-2 block truncate text-xs font-semibold">{p?.display_name || 'Membro'}</span>
                  </button>;
                })}
              </div>
              {(statusFile || statusCaption) && <div className="mt-2 rounded-xl bg-teal-50 p-2">
                {statusFile && <div className="mb-1 truncate text-xs">{statusFile.name}</div>}
                <input value={statusCaption} onChange={e => setStatusCaption(e.target.value)} placeholder="Aggiungi un testo allo stato…" className="w-full rounded-lg border border-teal-100 bg-white px-2 py-2 text-xs" />
                <div className="mt-2 flex justify-end gap-2"><button type="button" onClick={() => { setStatusFile(null); setStatusCaption(''); }} className="text-xs text-slate-500">Annulla</button><button type="button" disabled={statusBusy || (!statusFile && !statusCaption.trim())} onClick={publishStatus} className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">{statusBusy ? 'Pubblico…' : 'Condividi'}</button></div>
              </div>}
            </div>
            <div className="flex items-center justify-between"><h1 className="text-xl font-bold text-[#073b4c]">Messaggi</h1><button onClick={() => supabase.auth.signOut()} className="text-xs text-slate-500 underline">Esci</button></div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca persone…" className="mt-3 w-full rounded-xl bg-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="p-3">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Le tue conversazioni</div>
            {conversations.map(c => {
              const id = c.participant_one === user.id ? c.participant_two : c.participant_one;
              const person = profiles.find(p => p.id === id);
              return <button key={c.id} onClick={() => setActive(c.id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-left ${active === c.id ? 'bg-teal-50 ring-1 ring-teal-200' : 'hover:bg-slate-50'}`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-100 text-lg">👤</span>
                <span className="min-w-0"><span className="block truncate font-semibold">{person?.display_name || 'Membro RiverSpend'}</span><span className="text-xs text-slate-500">Apri conversazione</span></span>
              </button>;
            })}
            <div className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">Trova persone</div>
            {filteredPeople.map(p => <button key={p.id} disabled={busy} onClick={() => startChat(p)} className="mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-slate-50 disabled:opacity-50">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-100 text-lg">👤</span>
              <span className="truncate font-medium">{p.display_name || 'Membro RiverSpend'}</span>
              <span className="ml-auto text-xs text-teal-700">Scrivi</span>
            </button>)}
            {!filteredPeople.length && <p className="px-3 text-sm text-slate-400">Nessun altro profilo disponibile.</p>}
          </div>
        </aside>

        <div className={`flex min-h-[calc(100dvh-56px)] flex-col md:min-h-[70vh] ${active ? 'flex' : 'hidden md:flex'}`}>
          {active ? <>
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
              <button onClick={() => setActive('')} className="rounded-lg px-2 py-1 text-xl md:hidden" aria-label="Torna ai contatti">‹</button>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-100">👤</span>
              <div><div className="font-bold">{otherProfile?.display_name || 'Membro RiverSpend'}</div><div className="text-xs text-emerald-600">Conversazione privata</div></div>
              <Link href="/karma-zen-relax.html" className="ml-auto rounded-full bg-[#073b4c] px-3 py-2 text-xs font-semibold text-white">🪷 Karma Zen</Link>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-[#f4fafa] p-4">
              {messages.length === 0 && <div className="mx-auto mt-12 max-w-xs text-center text-sm text-slate-400">Questa conversazione è pronta. Invia il tuo primo messaggio 👋</div>}
              {messages.map(m => <div key={m.id} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm md:max-w-[70%] ${m.sender_id === user.id ? 'rounded-br-sm bg-[#087e8b] text-white' : 'rounded-bl-sm bg-white text-slate-800'}`}>
                  {m.metadata?.upload_status === 'uploading' && <div className="mb-2 text-xs opacity-80">⏳ Invio del file in corso…</div>}
                  {m.metadata?.upload_status === 'failed' && <div className="mb-2 text-xs text-red-600">⚠️ Invio del file non riuscito</div>}
                  {m.message_type === 'sticker' && <div className="py-1 text-center text-6xl">{m.metadata?.sticker || m.body}</div>}
                  {m.message_type === 'image' && mediaUrls[m.id] && <a href={mediaUrls[m.id]} target="_blank" rel="noreferrer"><img src={mediaUrls[m.id]} alt={m.attachment_name || 'Immagine condivisa'} className="mb-2 max-h-64 max-w-full rounded-xl object-contain" /></a>}
                  {m.message_type === 'audio' && mediaUrls[m.id] && <audio controls preload="metadata" src={mediaUrls[m.id]} className="mb-2 max-w-full" />}
                  {m.message_type === 'video' && mediaUrls[m.id] && <video controls playsInline preload="metadata" src={mediaUrls[m.id]} className="mb-2 max-h-64 max-w-full rounded-xl" />}
                  {m.message_type === 'file' && mediaUrls[m.id] && <a href={mediaUrls[m.id]} target="_blank" rel="noreferrer" className="mb-2 block rounded-lg bg-black/10 px-3 py-2 text-sm underline">📎 {m.attachment_name || 'Apri documento'}</a>}
                  <p className="whitespace-pre-wrap break-words text-sm">{m.body}</p>
                  <div className={`mt-1 text-right text-[10px] ${m.sender_id === user.id ? 'text-teal-100' : 'text-slate-400'}`}>{new Date(m.created_at).toLocaleString('it-IT', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</div>
                </div>
              </div>)}
            </div>
            <form onSubmit={sendMessage} className="relative flex items-end gap-1.5 border-t border-slate-200 bg-white p-2 md:gap-2 md:p-3">
              <button type="button" onClick={() => { setAttachMenuOpen(v => !v); setEmojiOpen(false); }} className="rounded-xl bg-slate-100 px-2 py-2 text-lg md:px-3 md:py-3 md:text-xl" title="Apri allegati e condivisione" aria-label="Apri menu allegati">📎</button>
              {attachMenuOpen && <div className="absolute bottom-16 left-2 z-20 grid w-[min(310px,calc(100vw-24px))] grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl p-3 text-left text-sm hover:bg-teal-50">🖼️ <span>Foto e immagini<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={e => { setAttachment(e.target.files?.[0] || null); setAttachMenuOpen(false); }} /></span></label>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl p-3 text-left text-sm hover:bg-teal-50">📄 <span>Documenti<input type="file" accept=".pdf,.txt,.doc,.docx,.xls,.xlsx" className="hidden" onChange={e => { setAttachment(e.target.files?.[0] || null); setAttachMenuOpen(false); }} /></span></label>
                <button type="button" onClick={() => { setAttachMenuOpen(false); setStickerOpen(true); }} className="rounded-xl p-3 text-left text-sm hover:bg-teal-50">🎨 Sticker</button>
                <button type="button" onClick={() => { setAttachMenuOpen(false); setEmojiOpen(true); }} className="rounded-xl p-3 text-left text-sm hover:bg-teal-50">😊 Emoji</button>
                <button type="button" onClick={() => { setAttachMenuOpen(false); sendLocation(); }} className="rounded-xl p-3 text-left text-sm hover:bg-teal-50">📍 Posizione GPS</button>
                <button type="button" onClick={() => startMediaRecording("audio")} className="rounded-xl p-3 text-left text-sm hover:bg-teal-50">🎙️ Registra vocale</button>
                <button type="button" onClick={() => startMediaRecording("video")} className="rounded-xl p-3 text-left text-sm hover:bg-teal-50">🎥 Registra video</button>
              </div>}
              {stickerOpen && <div className="absolute bottom-16 left-2 z-20 grid w-[min(320px,calc(100vw-24px))] grid-cols-3 gap-2 rounded-2xl border bg-white p-3 shadow-xl"><div className="col-span-3 flex items-center justify-between text-sm font-semibold"><span>Sticker RiverSpace</span><button type="button" onClick={() => setStickerOpen(false)}>✕</button></div>{['🌊','🐠','🪷','💎','🚀','💚','🌟','🎁','🤗','❤️','🔥','👏','🥳','🦋','🐬'].map((x,i) => <button key={i} type="button" onClick={() => sendSticker(x)} className="grid aspect-square place-items-center rounded-xl bg-teal-50 text-4xl">{x}</button>)}</div>}
              {emojiOpen && <div className="absolute bottom-16 left-3 z-10 grid grid-cols-6 gap-1 rounded-2xl border bg-white p-3 shadow-xl">{['😀','😃','😄','😁','😆','😅','😂','🤣','🥹','😊','😇','🙂','😉','😍','🥰','😘','😋','😎','🤩','🥳','🤗','🤔','🙄','😴','😭','😡','🤯','😱','😌','🤝','🙏','👏','👍','👎','👌','✌️','🤞','💪','👋','❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','💕','💞','💖','💘','💝','🔥','✨','⭐','🌟','🎉','🎊','🎁','🌈','☀️','🌙','🌊','🪷','🌺','🌸','🌻','🍀','🐠','🐬','🦋','🚀','💎','💬','📍','🎵'].map(x => <button key={x} type="button" onClick={() => addEmoji(x)} className="rounded-lg p-1 text-xl hover:bg-slate-100">{x}</button>)}</div>}
              {recording && <button type="button" onClick={stopMediaRecording} className="rounded-lg bg-red-100 px-2 py-2 text-xs font-semibold text-red-800">⏹ Ferma {recording === 'video' ? 'video' : 'vocale'}</button>}
              {attachment && <span className="max-w-28 truncate rounded-lg bg-teal-50 px-2 py-2 text-xs text-teal-900">{attachment.name} <button type="button" onClick={() => setAttachment(null)} aria-label="Rimuovi allegato">×</button></span>}
              <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={1} placeholder="Scrivi un messaggio…" className="max-h-24 min-h-10 flex-1 resize-y rounded-xl bg-slate-100 px-3 py-2 text-sm md:max-h-32 md:min-h-12 md:px-4 md:py-3 outline-none focus:ring-2 focus:ring-teal-500" />
              <button disabled={busy || Boolean(recording) || (!draft.trim() && !attachment)} className="rounded-xl bg-[#087e8b] px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-40 md:px-5 md:py-3 md:text-base">{uploading ? 'Carico…' : busy ? '…' : 'Invia'}</button>
            </form>
          </> : <div className="grid flex-1 place-items-center p-8 text-center">
            <div><div className="text-6xl">🌊</div><h2 className="mt-4 text-2xl font-bold text-[#073b4c]">Il tuo spazio, i tuoi segnali</h2><p className="mt-2 max-w-sm text-sm text-slate-500">Scegli una conversazione oppure trova un membro RiverSpend per iniziare a scrivere.</p><Link href="/karma-zen-relax.html" className="mt-5 inline-block rounded-full border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-800">🪷 Apri Karma Zen Relax</Link></div>
          </div>}
        </div>
      </section>}
      {viewStatus && <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4" onClick={() => setViewStatus(null)}>
        <div className="relative flex max-h-[90dvh] w-full max-w-md flex-col items-center justify-center overflow-hidden rounded-2xl bg-slate-900 text-white" onClick={e => e.stopPropagation()}>
          <button type="button" onClick={() => setViewStatus(null)} className="absolute right-3 top-3 z-10 rounded-full bg-black/50 px-3 py-1 text-xl">×</button>
          <div className="absolute left-3 right-12 top-3 h-1 overflow-hidden rounded bg-white/30"><div className="h-full w-full bg-white" /></div>
          {viewStatus.media_type === 'image' && viewStatus.mediaUrl && <img src={viewStatus.mediaUrl} alt="Stato" className="max-h-[75dvh] w-full object-contain" />}
          {viewStatus.media_type === 'video' && viewStatus.mediaUrl && <video src={viewStatus.mediaUrl} controls autoPlay playsInline className="max-h-[75dvh] w-full" />}
          {viewStatus.caption && <p className="w-full p-4 text-center text-base">{viewStatus.caption}</p>}
          <p className="pb-3 text-xs text-white/60">{new Date(viewStatus.created_at).toLocaleString('it-IT')}</p>
        </div>
      </div>}
      <footer className="flex flex-wrap items-center justify-center gap-4 py-5 text-xs text-slate-500"><span>RiverSpaceSignals · RiverSpend · Comunicazioni private</span><button type="button" onClick={() => window.dispatchEvent(new Event("riverspend:open-cookie-settings"))} className="underline underline-offset-2">Privacy e cookie</button><Link href="/" className="underline underline-offset-2">Torna al sito RiverSpend</Link></footer>
    </main>
  </>;
}
