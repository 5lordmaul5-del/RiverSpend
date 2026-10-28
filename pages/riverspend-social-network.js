import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const TYPES = [
  { id: 'post', label: 'Post', icon: '✍️' },
  { id: 'news', label: 'Notizia', icon: '📰' },
  { id: 'video', label: 'Video', icon: '▶️' },
  { id: 'link', label: 'Link esterno', icon: '🔗' },
];

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

function videoEmbed(value) {
  const url = safeUrl(value);
  if (!url) return '';
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return 'https://www.youtube-nocookie.com/embed/' + u.pathname.slice(1).split('/')[0];
    if (u.hostname.endsWith('youtube.com')) {
      if (u.pathname === '/watch') return 'https://www.youtube-nocookie.com/embed/' + (u.searchParams.get('v') || '');
      if (u.pathname.startsWith('/shorts/')) return 'https://www.youtube-nocookie.com/embed/' + u.pathname.split('/')[2];
      if (u.pathname.startsWith('/embed/')) return 'https://www.youtube-nocookie.com/embed/' + u.pathname.split('/')[2];
    }
  } catch {}
  return '';
}

function displayName(post) {
  return post.author_name || (post.user_id ? 'Membro RiverSpend' : 'Community RiverSpend');
}

export default function RiverSpendSocialNetwork() {
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [display, setDisplay] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [kind, setKind] = useState('post');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [email, setEmail] = useState('');
  const [filter, setFilter] = useState('all');
  const [commentDrafts, setCommentDrafts] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [busyLike, setBusyLike] = useState('');

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [{ data: postRows, error: postError }, { data: likeRows, error: likeError }, { data: commentRows, error: commentError }] = await Promise.all([
        supabase.from('rs_social_posts').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('rs_social_likes').select('post_id,user_id'),
        supabase.from('rs_social_comments').select('id,post_id,user_id,body,created_at').order('created_at', { ascending: true }).limit(500),
      ]);
      if (postError) throw postError;
      if (likeError) throw likeError;
      if (commentError) throw commentError;
      const ids = [...new Set((postRows || []).map(p => p.user_id).filter(Boolean))];
      let profiles = [];
      if (ids.length) {
        const result = await supabase.from('profiles').select('id,display_name').in('id', ids);
        if (!result.error) profiles = result.data || [];
      }
      const names = Object.fromEntries(profiles.map(p => [p.id, p.display_name]));
      setPosts((postRows || []).map(p => ({ ...p, author_name: names[p.user_id] || '' })));
      setLikes(likeRows || []);
      setComments((commentRows || []).map(c => ({ ...c, author_name: names[c.user_id] || '' })));
    } catch (e) {
      setError(e?.message || 'Non riesco a caricare il feed. Verifica la connessione e riprova.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUser(data?.user || null);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    loadFeed();
    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [loadFeed]);

  const visiblePosts = useMemo(() => filter === 'all' ? posts : posts.filter(p => p.post_type === filter), [posts, filter]);

  async function sendMagicLink(e) {
    e.preventDefault();
    setNotice('');
    setError('');
    const cleanEmail = email.trim();
    if (!cleanEmail) return setError('Inserisci la tua email.');
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin + '/riverspend-social-network' : undefined }
    });
    if (authError) setError(authError.message);
    else setNotice('Ti abbiamo inviato un link di accesso via email. Aprilo per partecipare alla community.');
  }

  async function publish(e) {
    e.preventDefault();
    if (!user) return setError('Accedi con la tua email per pubblicare.');
    const url = externalUrl.trim() ? safeUrl(externalUrl.trim()) : '';
    const image = previewImage.trim() ? safeUrl(previewImage.trim()) : '';
    if (externalUrl.trim() && !url) return setError('Il link deve iniziare con http:// o https://.');
    if (previewImage.trim() && !image) return setError('Il link immagine deve iniziare con http:// o https://.');
    if (!body.trim() && !url) return setError('Scrivi qualcosa oppure aggiungi un link esterno.');
    setSaving(true);
    setError('');
    setNotice('');
    const { error: insertError } = await supabase.from('rs_social_posts').insert({
      user_id: user.id,
      post_type: kind,
      title: title.trim(),
      body: body.trim(),
      external_url: url || null,
      preview_image_url: image || null,
    });
    setSaving(false);
    if (insertError) return setError(insertError.message);
    setTitle(''); setBody(''); setExternalUrl(''); setPreviewImage(''); setKind('post');
    setNotice('Pubblicato! Il tuo contenuto è ora nel feed RiverSpend.');
    await loadFeed();
  }

  async function toggleLike(postId) {
    if (!user) return setError('Accedi con la tua email per mettere Mi piace.');
    if (busyLike === postId) return;
    setBusyLike(postId);
    const exists = likes.some(l => l.post_id === postId && l.user_id === user.id);
    const result = exists
      ? await supabase.from('rs_social_likes').delete().eq('post_id', postId).eq('user_id', user.id)
      : await supabase.from('rs_social_likes').insert({ post_id: postId, user_id: user.id });
    setBusyLike('');
    if (result.error) return setError(result.error.message);
    setLikes(current => exists ? current.filter(l => !(l.post_id === postId && l.user_id === user.id)) : [...current, { post_id: postId, user_id: user.id }]);
  }

  async function addComment(postId) {
    if (!user) return setError('Accedi con la tua email per commentare.');
    const text = (commentDrafts[postId] || '').trim();
    if (!text) return;
    const { error: commentError } = await supabase.from('rs_social_comments').insert({ post_id: postId, user_id: user.id, body: text });
    if (commentError) return setError(commentError.message);
    setCommentDrafts(current => ({ ...current, [postId]: '' }));
    setOpenComments(current => ({ ...current, [postId]: true }));
    const { data } = await supabase.from('rs_social_comments').select('id,post_id,user_id,body,created_at').eq('post_id', postId).order('created_at', { ascending: true });
    const { data: profile } = await supabase.from('profiles').select('id,display_name').eq('id', user.id).maybeSingle();
    setComments(current => [...current.filter(c => c.post_id !== postId), ...(data || []).map(c => ({ ...c, author_name: c.user_id === user.id ? (profile?.display_name || '') : (current.find(x => x.user_id === c.user_id)?.author_name || '') }))]);
  }

  async function removePost(post) {
    if (!user || user.id !== post.user_id) return;
    if (!window.confirm('Eliminare questo post?')) return;
    const { error: deleteError } = await supabase.from('rs_social_posts').delete().eq('id', post.id).eq('user_id', user.id);
    if (deleteError) return setError(deleteError.message);
    setPosts(current => current.filter(p => p.id !== post.id));
    setLikes(current => current.filter(l => l.post_id !== post.id));
    setComments(current => current.filter(c => c.post_id !== post.id));
    setNotice('Post eliminato.');
  }

  return (
    <main className="min-h-screen bg-[#eef7f7] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-teal-900/10 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link href="/" className="font-black tracking-tight text-slate-900"><span className="text-teal-700">≈</span> RiverSpend<span className="text-amber-500">Social</span></Link>
          <div className="flex items-center gap-2">
            <Link href="/social-network" className="rounded-full border border-teal-700/30 px-3 py-2 text-xs font-bold text-teal-900 sm:text-sm">🛍️ Social Marketplace</Link>
            <Link href="/" className="hidden rounded-full bg-slate-900 px-3 py-2 text-xs font-bold text-white sm:inline-flex">RiverSpendShop</Link>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-3 py-5 lg:grid-cols-[minmax(0,1fr)_300px] sm:px-5">
        <section className="min-w-0">
          <div className="mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-[#042d38] via-[#075e67] to-[#0e2738] p-6 text-white shadow-lg sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[.24em] text-cyan-200">YOUR SHOP • YOUR FLOW</p>
            <h1 className="mt-2 text-3xl font-black sm:text-5xl">RiverSpend Social Network</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-50 sm:text-base">Una community per condividere idee, notizie, video e link dal web. Scopri contenuti interessanti e porta le conversazioni dentro l’ecosistema RiverSpend.</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-white/10 px-3 py-2">🌍 Community aperta</span><span className="rounded-full bg-white/10 px-3 py-2">📰 Notizie e link</span><span className="rounded-full bg-white/10 px-3 py-2">▶️ Video esterni</span><span className="rounded-full bg-white/10 px-3 py-2">💬 Commenti e Mi piace</span></div>
          </div>

          {notice && <div role="status" className="mb-4 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm font-semibold text-teal-900">{notice}</div>}
          {error && <div role="alert" className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"><b>Attenzione</b><p className="mt-1 break-words">{error}</p></div>}

          {!user && <section className="mb-5 rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">Entra nella community</h2>
            <p className="mt-1 text-sm text-slate-600">Per pubblicare, mettere Mi piace o commentare, ricevi un link di accesso sicuro via email. Puoi leggere il feed anche senza accedere.</p>
            <form onSubmit={sendMagicLink} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="La tua email" autoComplete="email" required className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-600" />
              <button className="rounded-xl bg-teal-700 px-5 py-3 font-bold text-white" type="submit">Invia link di accesso</button>
            </form>
          </section>}

          {user && <form onSubmit={publish} className="mb-5 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-lg font-black">Crea un contenuto</h2><span className="max-w-[48%] truncate rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-900">{user.email}</span></div>
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{TYPES.map(t => <button key={t.id} type="button" onClick={() => setKind(t.id)} className={`rounded-xl border px-3 py-3 text-sm font-bold ${kind === t.id ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>{t.icon} {t.label}</button>)}</div>
            <input value={title} onChange={e => setTitle(e.target.value)} maxLength={180} placeholder="Titolo (facoltativo)" className="mb-3 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-600" />
            <textarea value={body} onChange={e => setBody(e.target.value)} maxLength={5000} rows={4} placeholder="Che cosa vuoi condividere? Aggiungi contesto, commenti o una notizia..." className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-600" />
            <input value={externalUrl} onChange={e => setExternalUrl(e.target.value)} placeholder={kind === 'video' ? 'Link video YouTube o video esterno (https://...)' : kind === 'news' ? 'Link della notizia (https://...)' : 'Link esterno (facoltativo, https://...)'} inputMode="url" className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-600" />
            <input value={previewImage} onChange={e => setPreviewImage(e.target.value)} placeholder="Link immagine di anteprima (facoltativo)" inputMode="url" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-600" />
            <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><p className="text-xs text-slate-500">Condividi solo contenuti che hai il diritto di pubblicare. I link esterni restano attribuiti alla fonte.</p><button disabled={saving} type="submit" className="rounded-xl bg-teal-700 px-6 py-3 font-black text-white disabled:opacity-50">{saving ? 'Pubblicazione…' : '🌊 Pubblica nel Fiume'}</button></div>
          </form>}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Il Fiume dei contenuti</h2><div className="flex flex-wrap gap-1 rounded-xl bg-white p-1 shadow-sm">{[{id:'all',label:'Tutti'},{id:'post',label:'Post'},{id:'news',label:'Notizie'},{id:'video',label:'Video'},{id:'link',label:'Link'}].map(f=><button key={f.id} onClick={()=>setFilter(f.id)} className={`rounded-lg px-3 py-2 text-xs font-bold ${filter===f.id?'bg-teal-700 text-white':'text-slate-600'}`}>{f.label}</button>)}</div></div>

          {loading ? <div className="rounded-2xl bg-white p-8 text-center text-slate-600">Caricamento del feed…</div> : error && posts.length===0 ? <div className="rounded-2xl bg-white p-6 text-sm text-slate-600">Il feed non è disponibile. Controlla la configurazione del database e riprova.</div> : visiblePosts.length===0 ? <div className="rounded-2xl border border-dashed border-teal-200 bg-white p-8 text-center"><div className="text-3xl">🌊</div><h3 className="mt-2 font-bold">Il Fiume è pronto a scorrere</h3><p className="mt-1 text-sm text-slate-600">Non ci sono ancora contenuti in questa sezione. Sii il primo a condividere una notizia o un video.</p></div> : <div className="space-y-4">{visiblePosts.map(post=>{
            const postLikes=likes.filter(l=>l.post_id===post.id);
            const postComments=comments.filter(c=>c.post_id===post.id);
            const liked=!!user && postLikes.some(l=>l.user_id===user.id);
            const embed=videoEmbed(post.external_url);
            const outbound=safeUrl(post.external_url||'');
            return <article key={post.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-start justify-between gap-3 p-4 pb-2"><div className="flex min-w-0 items-center gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-teal-600 to-cyan-500 text-lg font-black text-white">{post.post_type==='news'?'📰':post.post_type==='video'?'▶️':post.post_type==='link'?'🔗':'≈'}</div><div className="min-w-0"><p className="truncate font-extrabold">{displayName(post)}</p><p className="text-xs text-slate-500">{TYPES.find(t=>t.id===post.post_type)?.icon} {TYPES.find(t=>t.id===post.post_type)?.label} · {new Date(post.created_at).toLocaleString('it-IT',{dateStyle:'medium',timeStyle:'short'})}</p></div></div>{user?.id===post.user_id && <button onClick={()=>removePost(post)} className="rounded-lg px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50">Elimina</button>}</div>
              <div className="px-4 pb-4">{post.title && <h3 className="mb-2 text-lg font-black">{post.title}</h3>}{post.body && <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{post.body}</p>}</div>
              {post.preview_image_url && safeUrl(post.preview_image_url) && <img src={safeUrl(post.preview_image_url)} alt={post.title||'Anteprima del contenuto'} loading="lazy" className="max-h-[480px] w-full bg-slate-100 object-contain" />}
              {embed && <div className="aspect-video w-full bg-black"><iframe src={embed} title={post.title||'Video condiviso'} loading="lazy" className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>}
              {outbound && <div className="mx-4 mb-4 rounded-xl border border-teal-100 bg-teal-50 p-4"><p className="break-all text-xs text-slate-500">{new URL(outbound).hostname}</p><a href={outbound} target="_blank" rel="noopener noreferrer nofollow" className="mt-1 inline-flex font-bold text-teal-800 underline underline-offset-2">Apri contenuto originale ↗</a></div>}
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-4 py-3"><button onClick={()=>toggleLike(post.id)} disabled={busyLike===post.id} className={`rounded-xl border px-4 py-2 text-sm font-bold ${liked?'border-rose-200 bg-rose-50 text-rose-700':'border-slate-200 text-slate-700'}`}>{liked?'♥ Ti piace':'♡ Mi piace'} · {postLikes.length}</button><button onClick={()=>setOpenComments(c=>({...c,[post.id]:!c[post.id]}))} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">💬 Commenti · {postComments.length}</button><button onClick={()=>{if(navigator.share) navigator.share({title:post.title||'RiverSpend Social Network',text:post.body,url:window.location.origin+'/riverspend-social-network'}).catch(()=>{});else {navigator.clipboard?.writeText(window.location.origin+'/riverspend-social-network');setNotice('Link della community copiato.')}}} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">↗ Condividi</button></div>
              {openComments[post.id] && <div className="border-t border-slate-100 bg-slate-50 p-4">{postComments.length? <div className="mb-4 space-y-3">{postComments.map(c=><div key={c.id} className="rounded-xl bg-white p-3"><p className="text-xs font-bold text-teal-800">{c.author_name||'Membro RiverSpend'} · <span className="font-normal text-slate-500">{new Date(c.created_at).toLocaleString('it-IT',{dateStyle:'medium',timeStyle:'short'})}</span></p><p className="mt-1 whitespace-pre-wrap break-words text-sm">{c.body}</p></div>)}</div>:<p className="mb-3 text-sm text-slate-500">Nessun commento ancora.</p>}
                {user?<form onSubmit={e=>{e.preventDefault();addComment(post.id)}} className="flex flex-col gap-2 sm:flex-row"><input value={commentDrafts[post.id]||''} onChange={e=>setCommentDrafts(c=>({...c,[post.id]:e.target.value}))} maxLength={2000} placeholder="Scrivi un commento…" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm" /><button className="rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white">Invia commento</button></form>:<p className="text-sm text-slate-600">Accedi via email per commentare.</p>}
              </div>}
            </article>;
          })}</div>}
          <button onClick={loadFeed} className="mt-5 w-full rounded-xl border border-teal-800/20 bg-white px-4 py-3 font-bold text-teal-900">↻ Aggiorna feed</button>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm"><h2 className="font-black">🌊 RiverSpend Social</h2><p className="mt-2 text-sm leading-6 text-slate-600">Condividi notizie, video, idee e link. Il feed è leggibile da tutti; per pubblicare e interagire serve l’accesso.</p><div className="mt-4 space-y-2 text-sm"><p>📰 Notizie e articoli</p><p>▶️ Video YouTube incorporati</p><p>🔗 Link esterni attribuiti alla fonte</p><p>💬 Commenti e Mi piace</p><p>🛡️ Puoi eliminare i tuoi post</p></div></section>
          <section className="rounded-2xl border border-amber-100 bg-amber-50 p-5"><h3 className="font-black text-amber-950">Una community rispettosa</h3><p className="mt-2 text-sm leading-6 text-amber-900">Pubblica contenuti legali, rispetta il copyright e la privacy. In una fase successiva aggiungeremo segnalazioni, moderazione amministrativa e upload media diretto.</p></section>
        </aside>
      </div>
      <footer className="border-t border-teal-900/10 bg-white px-4 py-6 text-center text-xs text-slate-500">RiverSpend Social Network · YOUR SHOP • YOUR FLOW</footer>
    </main>
  );
}
