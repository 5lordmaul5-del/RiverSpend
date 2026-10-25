import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const types = {
  lottery_code: 'Codice RS Lottery',
  shop_bonus: 'Bonus RiverSpendShop',
  gift_card: 'Gift Card',
  rs_spons_credit: 'Credito RS Spons'
};
const campaigns = {
  RS_FRIENDS: 'RS Friends',
  RS_SHOP: 'RS Shop',
  RS_SELLER: 'RS Seller',
  RS_SPECIAL: 'RS Special'
};
const statuses = {
  pending_activation: 'In attesa di attivazione',
  active: 'Attivo',
  used: 'Utilizzato',
  expired: 'Scaduto',
  cancelled: 'Annullato'
};

export default function PortafoglioPremi() {
  const [session, setSession] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async (currentSession) => {
      if (!mounted) return;
      setSession(currentSession || null);
      if (!currentSession?.user) {
        setRewards([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('rs_user_rewards')
        .select('id,reward_type,campaign_code,reward_code,title,description,status,value_eur,expires_at,created_at')
        .order('created_at', { ascending: false });
      if (!mounted) return;
      if (error) setMessage('Non è stato possibile caricare il portafoglio. Riprova più tardi.');
      else { setRewards(data || []); setMessage(''); }
      setLoading(false);
    };
    supabase.auth.getSession().then(({ data }) => load(data?.session || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => load(currentSession || null));
    return () => { mounted = false; subscription?.unsubscribe(); };
  }, []);

  async function sendLoginLink(event) {
    event.preventDefault();
    if (!email.trim()) return;
    setMessage('Invio del link di accesso…');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + '/portafoglio-premi' }
    });
    setMessage(error ? 'Non siamo riusciti a inviare il link. Controlla l’indirizzo e riprova.' : 'Controlla la tua email: ti abbiamo inviato il link per accedere.');
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setRewards([]);
    setMessage('Sei uscito dal tuo account.');
  }

  return (
    <>
      <Head>
        <title>Il mio portafoglio premi | RiverSpend</title>
        <meta name="description" content="Consulta i codici premio, i bonus e le Gift Card del tuo profilo RiverSpend." />
      </Head>
      <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#062b45,#071426)', color: '#fff', padding: '24px 16px 48px' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <Link href="/app" style={{ color: '#67e8f9', textDecoration: 'none', fontWeight: 800 }}>← Torna alle app RiverSpend</Link>
          <header style={{ textAlign: 'center', padding: '28px 0 22px' }}>
            <div style={{ color: '#fbbf24', fontWeight: 900, letterSpacing: 3, fontSize: 12 }}>RIVERSPEND FRIENDS</div>
            <h1 style={{ fontSize: 'clamp(30px,6vw,44px)', margin: '10px 0', fontWeight: 900 }}>🎁 Il mio portafoglio premi</h1>
            <p style={{ color: '#cbd5e1', lineHeight: 1.6, maxWidth: 650, margin: '0 auto' }}>Un unico posto per consultare i tuoi codici RS Lottery, i bonus RiverSpend, le Gift Card e il credito RS Spons.</p>
          </header>

          {!session ? (
            <section style={{ maxWidth: 480, margin: '0 auto', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(103,232,249,.25)', borderRadius: 20, padding: 22 }}>
              <h2 style={{ marginTop: 0 }}>Accedi per vedere i tuoi premi</h2>
              <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>Inserisci l’email del tuo account RiverSpend. Riceverai un link sicuro per accedere.</p>
              <form onSubmit={sendLoginLink} style={{ display: 'grid', gap: 12 }}>
                <label htmlFor="reward-email">Email</label>
                <input id="reward-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" style={{ padding: 13, borderRadius: 10, border: '1px solid #64748b', background: '#fff', color: '#0f172a', fontSize: 16 }} />
                <button type="submit" style={{ border: 0, borderRadius: 12, padding: 13, background: '#06b6d4', color: '#062b45', fontWeight: 900, cursor: 'pointer' }}>Invia link di accesso</button>
              </form>
            </section>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18, color: '#cbd5e1' }}>
                <span>Account: {session.user.email}</span>
                <button onClick={signOut} style={{ border: '1px solid #67e8f9', background: 'transparent', color: '#67e8f9', borderRadius: 10, padding: '9px 13px', cursor: 'pointer' }}>Esci</button>
              </div>
              {loading ? <p style={{ textAlign: 'center', color: '#cbd5e1' }}>Caricamento del portafoglio…</p> : rewards.length === 0 ? (
                <section style={{ textAlign: 'center', padding: 26, borderRadius: 18, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(103,232,249,.22)' }}>
                  <div style={{ fontSize: 42 }}>🎟️</div>
                  <h2>Il tuo portafoglio è pronto</h2>
                  <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>Non ci sono ancora premi associati al tuo account. Quando le campagne saranno attive e un premio ti verrà assegnato, apparirà qui.</p>
                </section>
              ) : (
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,250px),1fr))', gap: 14 }}>
                  {rewards.map(reward => (
                    <article key={reward.id} style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(103,232,249,.25)', borderRadius: 18, padding: 18 }}>
                      <div style={{ color: '#fbbf24', fontSize: 12, fontWeight: 900 }}>{campaigns[reward.campaign_code] || reward.campaign_code}</div>
                      <h2 style={{ fontSize: 19, margin: '8px 0' }}>{reward.title || types[reward.reward_type] || 'Premio RiverSpend'}</h2>
                      <div style={{ fontFamily: 'monospace', fontSize: 16, overflowWrap: 'anywhere', padding: 10, background: 'rgba(0,0,0,.22)', borderRadius: 8 }}>{reward.reward_code}</div>
                      {reward.description && <p style={{ color: '#cbd5e1', lineHeight: 1.5 }}>{reward.description}</p>}
                      <p style={{ color: '#cbd5e1', fontSize: 13 }}>Tipo: {types[reward.reward_type] || reward.reward_type}</p>
                      <p style={{ color: '#cbd5e1', fontSize: 13 }}>Stato: <strong style={{ color: reward.status === 'active' ? '#86efac' : '#fcd34d' }}>{statuses[reward.status] || reward.status}</strong></p>
                      {reward.value_eur != null && <p style={{ color: '#fbbf24', fontWeight: 900 }}>Valore: {Number(reward.value_eur).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</p>}
                      {reward.expires_at && <p style={{ color: '#cbd5e1', fontSize: 12 }}>Scadenza: {new Date(reward.expires_at).toLocaleDateString('it-IT')}</p>}
                    </article>
                  ))}
                </section>
              )}
            </>
          )}
          {message && <p role="status" style={{ textAlign: 'center', marginTop: 18, color: '#fcd34d' }}>{message}</p>}
          <section style={{ marginTop: 24, padding: 18, borderRadius: 16, background: 'rgba(6,182,212,.10)', border: '1px solid rgba(103,232,249,.22)', color: '#dbeafe', fontSize: 13, lineHeight: 1.6 }}>
            <strong style={{ color: '#67e8f9' }}>Trasparenza:</strong> le campagne RS Friends, RS Shop, RS Seller e RS Special sono in preparazione. I codici e i bonus verranno assegnati solo quando le rispettive iniziative saranno attive e le condizioni pubblicate. Nessun premio viene creato automaticamente in questa pagina.
          </section>
        </div>
      </main>
    </>
  );
}
