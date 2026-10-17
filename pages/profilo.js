import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Profilo() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profile, setProfile] = useState({ nome: '', cognome: '', telefono: '', indirizzo: '', tipoAccount: 'Privato' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const current = data?.session || null;
      setSession(current);
      if (current?.user) {
        const metadata = current.user.user_metadata || {};
        setProfile({
          nome: metadata.nome || '',
          cognome: metadata.cognome || '',
          telefono: metadata.telefono || '',
          indirizzo: metadata.indirizzo || '',
          tipoAccount: metadata.tipoAccount || 'Privato'
        });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession || null);
      if (currentSession?.user) {
        const metadata = currentSession.user.user_metadata || {};
        setProfile({
          nome: metadata.nome || '',
          cognome: metadata.cognome || '',
          telefono: metadata.telefono || '',
          indirizzo: metadata.indirizzo || '',
          tipoAccount: metadata.tipoAccount || 'Privato'
        });
      }
    });
    return () => subscription?.unsubscribe();
  }, []);

  async function login(event) {
    event.preventDefault();
    if (!email.trim() || sending) return;

    // If a session already exists, do not send another email link.
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession) {
      setSession(currentSession);
      setMsg('Sei già connesso. Non serve un nuovo link.');
      return;
    }

    setSending(true);
    setMsg('Invio del link di accesso…');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin + '/profilo' }
      });
      if (error) {
        if (error.message?.toLowerCase().includes('rate limit')) {
          setMsg('Hai richiesto troppi link in poco tempo. Non creare un altro account: attendi il ripristino del limite email oppure usa il link più recente già ricevuto.');
        } else {
          setMsg('Accesso non riuscito: ' + error.message);
        }
        return;
      }
      setMsg('Link inviato. Apri l’email più recente per accedere. Dopo l’accesso resterai connesso su questo dispositivo.');
    } catch (error) {
      setMsg('Accesso non riuscito: ' + (error?.message || 'errore imprevisto'));
    } finally {
      setSending(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (savingProfile) return;
    setSavingProfile(true);
    setMsg('Salvataggio del profilo…');
    try {
      const { data, error } = await supabase.auth.updateUser({ data: { ...profile } });
      if (error) throw error;
      if (data?.user) setSession(current => current ? { ...current, user: data.user } : current);
      setEditingProfile(false);
      setMsg('Profilo aggiornato correttamente.');
    } catch (error) {
      setMsg('Non è stato possibile salvare il profilo: ' + (error?.message || 'errore imprevisto'));
    } finally {
      setSavingProfile(false);
    }
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    setMsg(error ? 'Uscita non riuscita: ' + error.message : 'Hai effettuato la disconnessione.');
    if (!error) setSession(null);
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-teal-700 underline">← RiverSpendShop</Link>
        <section className="mt-6 rounded-3xl border border-teal-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-widest text-teal-700">RiverSpend</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">Profilo</h1>
          {session ? (
            <>
              <p className="mt-6 text-slate-700">Accesso effettuato come <strong>{session.user.email}</strong></p>
              <section className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><h2 className="text-xl font-bold text-slate-900">Modifica profilo</h2><p className="text-sm text-slate-600">Aggiorna i tuoi dati personali.</p></div>
                  <button type="button" onClick={() => setEditingProfile(value => !value)} className="rounded-xl bg-teal-700 px-4 py-2 font-bold text-white">{editingProfile ? 'Annulla' : '✏️ Modifica profilo'}</button>
                </div>
                {editingProfile && <form onSubmit={saveProfile} className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-medium">Nome<input className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3" value={profile.nome} onChange={event => setProfile(value => ({ ...value, nome: event.target.value }))} autoComplete="given-name" /></label>
                  <label className="text-sm font-medium">Cognome<input className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3" value={profile.cognome} onChange={event => setProfile(value => ({ ...value, cognome: event.target.value }))} autoComplete="family-name" /></label>
                  <label className="text-sm font-medium">Telefono<input className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3" type="tel" value={profile.telefono} onChange={event => setProfile(value => ({ ...value, telefono: event.target.value }))} autoComplete="tel" /></label>
                  <label className="text-sm font-medium">Indirizzo<input className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3" value={profile.indirizzo} onChange={event => setProfile(value => ({ ...value, indirizzo: event.target.value }))} autoComplete="street-address" /></label>
                  <label className="text-sm font-medium sm:col-span-2">Tipo di account<select className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3" value={profile.tipoAccount} onChange={event => setProfile(value => ({ ...value, tipoAccount: event.target.value }))}><option>Privato</option><option>Azienda</option><option>Professionista</option><option>Venditore</option><option>Acquirente</option><option>Associazione/Ente</option><option>Negozio</option></select></label>
                  <button disabled={savingProfile} type="submit" className="rounded-xl bg-teal-700 p-3 font-bold text-white disabled:opacity-60 sm:col-span-2">{savingProfile ? 'Salvataggio…' : 'Salva modifiche'}</button>
                </form>}
              </section>
              <p className="mt-2 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">✓ Resta connesso su questo dispositivo. Quando torni su RiverSpendShop, non devi richiedere un nuovo link email, salvo che tu esca volontariamente o la sessione venga revocata.</p>
              <section className="mt-6">
                <h2 className="text-2xl font-bold text-slate-900">Il mio pannello di controllo</h2>
                <p className="mt-1 text-sm text-slate-600">Gestisci il tuo account e le tue attività su RiverSpendShop.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Link href="/vendi" className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-left text-teal-900">
                    <span className="block text-lg font-bold">📦 I miei annunci</span>
                    <span className="mt-1 block text-sm">Consulta gli annunci pubblicati e gestisci le disponibilità. La modifica del prezzo compare qui dopo la pubblicazione dell’aggiornamento.</span>
                  </Link>
                  <Link href="/notifiche" className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-slate-900">
                    <span className="block text-lg font-bold">🔔 Notifiche</span>
                    <span className="mt-1 block text-sm text-slate-600">Apri le notifiche del tuo account.</span>
                  </Link>
                  <Link href="/rete" className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-slate-900">
                    <span className="block text-lg font-bold">🕸️ La mia rete</span>
                    <span className="mt-1 block text-sm text-slate-600">Gestisci gli articoli salvati nella tua Rete.</span>
                  </Link>
                  <Link href="/desideri" className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-slate-900">
                    <span className="block text-lg font-bold">♡ Lista dei desideri</span>
                    <span className="mt-1 block text-sm text-slate-600">Rivedi gli articoli che hai salvato.</span>
                  </Link>
                </div>
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                  <strong>Messaggi, ordini e cancellazione annunci:</strong> queste funzioni richiedono ancora un’area dedicata e collegata ai dati corretti. Non mostro pulsanti finti che potrebbero non funzionare o cancellare dati sbagliati.
                </div>
              </section>
              <button onClick={logout} className="mt-6 rounded-xl border border-slate-300 bg-white px-5 py-3 text-slate-800">Esci</button>
            </>
          ) : (
            <form onSubmit={login} className="mt-6">
              <p className="mb-4 text-slate-600">Accedi una volta con il link email. Dopo l’accesso la sessione viene salvata su questo dispositivo.</p>
              <input className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-400" type="email" placeholder="La tua email" value={email} onChange={event => setEmail(event.target.value)} required />
              <button disabled={sending} className="mt-3 w-full rounded-xl bg-teal-600 p-3 font-bold text-white disabled:opacity-60" type="submit">{sending ? '⏳ Invio in corso…' : '📩 Invia link di accesso'}</button>
            </form>
          )}
          {msg && <p role="status" className="mt-4 rounded-xl bg-slate-50 p-3 text-slate-800">{msg}</p>}
        </section>
        <Link href="/ecosistema" className="mt-5 inline-block text-teal-700 underline">Apri l’ecosistema RiverSpend →</Link>
      </div>
    </main>
  );
}
