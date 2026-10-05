import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function client() {
  return createClient(url, key);
}

function json(res, status, body) {
  return res.status(status).json(body);
}

export default async function handler(req, res) {
  if (!url || !key) return json(res, 500, { error: 'Configurazione Supabase mancante.' });

  const supabase = client();

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('music_works')
      .select('id,title,version,genre,duration_seconds,status,source_type,rights_status,author_name,rights_holder_name,soundreef_status,soundreef_work_id,registration_metadata,created_at,music_recordings(audio_url,mime_type,duration_seconds,is_master)')
      .eq('source_type', 'riverspend_original')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) return json(res, 500, { error: 'Errore catalogo musicale.' });
    return json(res, 200, data || []);
  }

  if (req.method === 'POST') {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return json(res, 401, { error: 'Accesso richiesto.' });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) return json(res, 401, { error: 'Sessione non valida.' });

    const body = req.body || {};
    const title = String(body.title || '').trim();
    if (!title) return json(res, 400, { error: 'Inserisci il titolo del brano.' });

    const metadata = {
      created_by_user_id: userData.user.id,
      author_name: 'Maurizio Lella',
      rights_holder_name: 'Maurizio Lella',
      soundreef_status: 'not_submitted',
      source: 'RiverSpend Music'
    };

    const { data: work, error: workError } = await supabase
      .from('music_works')
      .insert({
        title,
        version: String(body.version || '').trim() || null,
        genre: String(body.genre || '').trim() || null,
        duration_seconds: Number.isFinite(Number(body.duration_seconds)) ? Number(body.duration_seconds) : null,
        status: 'draft',
        source_type: 'riverspend_original',
        rights_status: 'pending',
        author_name: 'Maurizio Lella',
        rights_holder_name: 'Maurizio Lella',
        soundreef_status: 'not_submitted',
        registration_metadata: metadata
      })
      .select('*')
      .single();

    if (workError) return json(res, 403, { error: 'Impossibile registrare il brano. Verifica accesso e permessi.' });

    const { error: contributorError } = await supabase
      .from('music_contributors')
      .insert({
        work_id: work.id,
        display_name: 'Maurizio Lella',
        role: 'author_composer',
        rights_share: 100
      });

    if (contributorError) return json(res, 500, { error: 'Opera creata ma contributore non registrato.', work });

    return json(res, 201, {
      work,
      soundreef: {
        status: 'not_submitted',
        message: 'Opera RiverSpend registrata e pronta per il flusso Soundreef. Nessun deposito Soundreef è stato simulato.'
      }
    });
  }

  return json(res, 405, { error: 'Metodo non consentito.' });
}
