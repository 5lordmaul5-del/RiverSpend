import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function RiverSpaceSignals() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [active, setActive] = useState('');
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const activeConversation = conversations.find(c => c.id === active);
  const otherId = activeConversation
    ? (activeConversation.participant_one === user?.id ? activeConversation.participant_two : activeConversation.participant_one)
    : '';
  const otherProfile = profiles.find(p => p.id === otherId);

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
      .select('id,conversation_id,sender_id,body,created_at,read_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(300);
    if (e) throw e;
    setMessages(data || []);
  }, []);

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
        await Promise.all([loadPeople(user.id), loadConversations(user.id)]);
      } catch (e) { if (alive) setError(e.message || 'Errore nel caricamento di Signals.'); }
    })();
    return () => { alive = false; };
  }, [user, loadPeople, loadConversations]);

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
    if (!body || !active || !user || busy) return;
    setBusy(true); setError('');
    const { error: sendError } = await supabase.from('rs_chat_messages')
      .insert({ conversation_id: active, sender_id: user.id, body });
    setBusy(false);
    if (sendError) { setError(sendError.message); return; }
    setDraft('');
    await Promise.all([
      loadMessages(active),
      loadConversations(user.id)
    ]);
  }

  function addEmoji(emoji) { setDraft(v => v + emoji); setEmojiOpen(false); }

  const filteredPeople = useMemo(() => profiles.filter(p =>
    (p.display_name || 'Membro RiverSpend').toLowerCase().includes(search.toLowerCase())
  ), [profiles, search]);

  return <>
    <Head>
      <title>RiverSpaceSignals · RiverSpend</title>
      <meta name="description" content="Messaggi privati RiverSpaceSignals" />
      <meta name="theme-color" content="#063b4b" />
      <link rel="icon" href="/icons/riversignals.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/icons/riverspace-signals-app.jpg" />
    </Head>
    <main className="min-h-screen bg-[#eaf7f7] text-slate-800">
      <header className="flex items-center justify-between bg-[#073b4c] px-4 py-3 text-white shadow">
        <div className="flex items-center gap-3">
          <img src="/icons/riversignals.svg" alt="RiverSpaceSignals" className="h-10 w-10 rounded-full bg-white p-1" />
          <div><div className="text-lg font-bold tracking-wide">RiverSpaceSignals</div><div className="text-xs text-teal-100">YOUR SPACE · YOUR SIGNAL</div></div>
        </div>
        <nav className="flex items-center gap-2"><Link href="/" className="rounded-full border border-white/40 px-3 py-2 text-sm hover:bg-white/10">RiverSpendShop</Link><Link href="/riverspend-social-network" className="rounded-full border border-white/40 px-3 py-2 text-sm hover:bg-white/10">Community</Link></nav>
      </header>

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
      </section> : <section className="mx-auto grid min-h-[calc(100vh-72px)] max-w-6xl grid-cols-1 overflow-hidden bg-white shadow-xl md:my-6 md:min-h-[75vh] md:grid-cols-[320px_1fr] md:rounded-3xl">
        <aside className={`border-r border-slate-200 ${active ? 'hidden md:block' : 'block'}`}>
          <div className="border-b border-slate-200 p-4">
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

        <div className={`flex min-h-[70vh] flex-col ${active ? 'flex' : 'hidden md:flex'}`}>
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
                  <p className="whitespace-pre-wrap break-words text-sm">{m.body}</p>
                  <div className={`mt-1 text-right text-[10px] ${m.sender_id === user.id ? 'text-teal-100' : 'text-slate-400'}`}>{new Date(m.created_at).toLocaleString('it-IT', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</div>
                </div>
              </div>)}
            </div>
            <form onSubmit={sendMessage} className="relative flex items-end gap-2 border-t border-slate-200 bg-white p-3">
              <button type="button" onClick={() => setEmojiOpen(v => !v)} className="rounded-xl bg-amber-50 px-3 py-3 text-xl" aria-label="Apri emoji">😊</button>
              {emojiOpen && <div className="absolute bottom-16 left-3 z-10 grid grid-cols-6 gap-1 rounded-2xl border bg-white p-3 shadow-xl">{['😀','😂','🥰','😍','😉','😊','❤️','🔥','👍','🙏','🎉','🌈','🌊','🪷','✨','💚','💬','🚀'].map(x => <button key={x} type="button" onClick={() => addEmoji(x)} className="rounded-lg p-1 text-xl hover:bg-slate-100">{x}</button>)}</div>}
              <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={1} placeholder="Scrivi un messaggio…" className="max-h-32 min-h-12 flex-1 resize-y rounded-xl bg-slate-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
              <button disabled={busy || !draft.trim()} className="rounded-xl bg-[#087e8b] px-5 py-3 font-semibold text-white disabled:opacity-40">{busy ? '…' : 'Invia'}</button>
            </form>
          </> : <div className="grid flex-1 place-items-center p-8 text-center">
            <div><div className="text-6xl">🌊</div><h2 className="mt-4 text-2xl font-bold text-[#073b4c]">Il tuo spazio, i tuoi segnali</h2><p className="mt-2 max-w-sm text-sm text-slate-500">Scegli una conversazione oppure trova un membro RiverSpend per iniziare a scrivere.</p><Link href="/karma-zen-relax.html" className="mt-5 inline-block rounded-full border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-800">🪷 Apri Karma Zen Relax</Link></div>
          </div>}
        </div>
      </section>}
      <footer className="flex flex-wrap items-center justify-center gap-4 py-5 text-xs text-slate-500"><span>RiverSpaceSignals · RiverSpend · Comunicazioni private</span><button type="button" onClick={() => window.dispatchEvent(new Event("riverspend:open-cookie-settings"))} className="underline underline-offset-2">Privacy e cookie</button><Link href="/" className="underline underline-offset-2">Torna al sito RiverSpend</Link></footer>
    </main>
  </>;
}
