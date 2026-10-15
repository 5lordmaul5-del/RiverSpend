import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Profilo() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data?.session || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession || null);
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
              <p className="mt-2 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">✓ Resta connesso su questo dispositivo. Quando torni su RiverSpendShop, non devi richiedere un nuovo link email, salvo che tu esca volontariamente o la sessione venga revocata.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Link href="/rete" className="rounded-xl border border-teal-200 bg-white p-4 text-center text-teal-800">🕸️ La mia rete</Link>
                <Link href="/desideri" className="rounded-xl border border-teal-200 bg-white p-4 text-center text-teal-800">♡ Desideri</Link>
                <Link href="/vendi" className="rounded-xl border border-teal-200 bg-white p-4 text-center text-teal-800">+ Vendi</Link>
              </div>
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
