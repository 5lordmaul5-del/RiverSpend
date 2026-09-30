import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Profilo() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  useEffect(() => {
    supabase.auth.getSession().then(({data}) => setSession(data?.session || null));
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_e,s) => setSession(s || null));
    return () => subscription?.unsubscribe();
  }, []);
  async function login(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setMsg('Invio link…');
    const {error} = await supabase.auth.signInWithOtp({email:email.trim(), options:{emailRedirectTo:window.location.origin + '/profilo'}});
    setMsg(error ? '❌ ' + error.message : '✅ Controlla la tua email.');
  }
  async function logout() {
    const {error}=await supabase.auth.signOut();
    setMsg(error ? '❌ ' + error.message : 'Sei uscito.');
    setSession(null);
  }
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-teal-300 underline">← RiverSpendShop</Link>
        <section className="mt-6 rounded-3xl border border-teal-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-widest text-teal-300">RiverSpend</p>
          <h1 className="mt-2 text-4xl font-bold">Profilo</h1>
          {session ? (
            <>
              <p className="mt-6 text-slate-300">Accesso effettuato come <strong>{session.user.email}</strong></p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Link href="/rete" className="rounded-xl border border-teal-800 p-4 text-center text-teal-100">🕸️ La mia rete</Link>
                <Link href="/desideri" className="rounded-xl border border-teal-800 p-4 text-center text-teal-100">♡ Desideri</Link>
                <Link href="/vendi" className="rounded-xl border border-teal-800 p-4 text-center text-teal-100">+ Vendi</Link>
              </div>
              <button onClick={logout} className="mt-6 rounded-xl border border-slate-700 px-5 py-3">Esci</button>
            </>
          ) : (
            <form onSubmit={login} className="mt-6">
              <p className="mb-4 text-slate-400">Accedi con un link email.</p>
              <input className="w-full rounded-xl border p-3" type="email" placeholder="La tua email" value={email} onChange={e=>setEmail(e.target.value)} required />
              <button className="mt-3 w-full rounded-xl bg-teal-500 p-3 font-bold text-slate-950" type="submit">📩 Invia link di accesso</button>
            </form>
          )}
          {msg && <p className="mt-4 text-teal-200">{msg}</p>}
        </section>
        <Link href="/ecosistema" className="mt-5 inline-block text-teal-300 underline">Apri l’ecosistema RiverSpend →</Link>
      </div>
    </main>
  );
}
