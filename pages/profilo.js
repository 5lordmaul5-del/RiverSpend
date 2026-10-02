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
    <main className="min-h-screen bg-[#08b8d0] px-4 py-8 text-[#17364a]">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-[#075b78] underline">← RiverSpendShop</Link>
        <section className="mt-6 rounded-3xl border border-white/80 bg-[#f4feff] p-6 shadow-xl shadow-[#075b78]/10">
          <p className="text-sm uppercase tracking-widest text-[#087f9b]">RiverSpend</p>
          <h1 className="mt-2 text-4xl font-bold">Profilo</h1>
          {session ? (
            <>
              <p className="mt-6 text-[#496575]">Accesso effettuato come <strong>{session.user.email}</strong></p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Link href="/rete" className="rounded-xl border border-[#8bd9e3] bg-white p-4 text-center text-[#075b78]">🕸️ La mia rete</Link>
                <Link href="/desideri" className="rounded-xl border border-teal-800 p-4 text-center text-teal-100">♡ Desideri</Link>
                <Link href="/vendi" className="rounded-xl border border-teal-800 p-4 text-center text-teal-100">+ Vendi</Link>
              </div>
              <button onClick={logout} className="mt-6 rounded-xl border border-[#8bd9e3] bg-white px-5 py-3 text-[#17364a]">Esci</button>
            </>
          ) : (
            <form onSubmit={login} className="mt-6">
              <p className="mb-4 text-[#496575]">Accedi con un link email.</p>
              <input className="w-full rounded-xl border border-[#9bdde5] bg-white p-3 text-[#17364a] placeholder:text-[#78909b]" type="email" placeholder="La tua email" value={email} onChange={e=>setEmail(e.target.value)} required />
              <button className="mt-3 w-full rounded-xl bg-[#079fbd] p-3 font-bold text-white shadow-md shadow-[#075b78]/15" type="submit">📩 Invia link di accesso</button>
            </form>
          )}
          {msg && <p className="mt-4 text-[#075b78]">{msg}</p>}
        </section>
        <Link href="/ecosistema" className="mt-5 inline-block text-[#075b78] underline">Apri l’ecosistema RiverSpend →</Link>
      </div>
    </main>
  );
}
