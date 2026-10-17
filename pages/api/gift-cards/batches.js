import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const DENOMINATIONS = new Set([500, 1000, 2500, 5000, 10000, 20000, 50000, 100000]);
const publicClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
function makeCode(bytes = 16) {
  return crypto.randomBytes(bytes).toString("hex").toUpperCase();
}
function secretCode() {
  // Hex uses only 0-9/A-F, so separators cannot collide with characters in the secret.
  return crypto.randomBytes(16).toString("hex").toUpperCase().match(/.{4}/g).join("-");
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo non consentito." });
  }
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Accesso richiesto." });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !publicKey || !serviceKey) {
    return res.status(503).json({ error: "Configurazione server incompleta: verificare le variabili Supabase in Vercel." });
  }

  try {
    const pub = publicClient();
    const { data: authData, error: authError } = await pub.auth.getUser(token);
    const user = authData?.user;
    if (authError || !user) return res.status(401).json({ error: "Sessione non valida." });

    const db = adminClient();
    const { data: role, error: roleError } = await db.from("rs_admin_roles").select("role").eq("user_id", user.id).maybeSingle();
    if (roleError || role?.role !== "admin") return res.status(403).json({ error: "Solo l'amministratore può generare lotti." });

    const count = Number(req.body?.count);
    const denominationCents = Number(req.body?.denominationCents);
    const label = String(req.body?.label || "Lotto Gift Card").trim().slice(0, 100);
    if (!Number.isInteger(count) || count < 1 || count > 1000) {
      return res.status(400).json({ error: "Per sicurezza ogni lotto deve contenere da 1 a 1.000 carte." });
    }
    if (!DENOMINATIONS.has(denominationCents)) {
      return res.status(400).json({ error: "Importo non valido." });
    }

    const { data: batch, error: batchError } = await db.from("rs_gift_card_batches").insert({
      label: label || "Lotto Gift Card",
      denomination_cents: denominationCents,
      requested_count: count,
      created_by: user.id
    }).select("id").single();
    if (batchError) throw batchError;

    const printable = [];
    const rows = [];
    for (let i = 0; i < count; i++) {
      const publicCode = "RS-" + makeCode(6);
      const secret = secretCode();
      const barcode = "RS" + makeCode(8);
      rows.push({
        batch_id: batch.id,
        public_code: publicCode,
        barcode_value: barcode,
        secret_hash: crypto.createHash("sha256").update(secret).digest("hex"),
        initial_balance_cents: denominationCents,
        balance_cents: denominationCents,
        currency: "EUR",
        status: "pending_activation",
        issued_by: user.id
      });
      printable.push({
        batch_id: batch.id,
        public_code: publicCode,
        barcode_value: barcode,
        denomination_eur: (denominationCents / 100).toFixed(2),
        secret_code: secret,
        status: "pending_activation",
        print_note: "Codice segreto mostrato una sola volta: conservare il CSV in modo protetto."
      });
    }

    const { data: inserted, error: insertError } = await db.from("rs_gift_cards").insert(rows).select("id,public_code,barcode_value");
    if (insertError) {
      await db.from("rs_gift_card_batches").delete().eq("id", batch.id);
      throw insertError;
    }
    const byPublic = new Map(inserted.map((r) => [r.public_code, r.id]));
    const transactions = rows.map((r) => ({
      gift_card_id: byPublic.get(r.public_code),
      transaction_type: "issued",
      amount_cents: denominationCents,
      balance_before_cents: 0,
      balance_after_cents: denominationCents,
      actor_user_id: user.id,
      note: "Carta creata nel lotto " + batch.id,
      metadata: { batch_id: batch.id }
    }));
    const { error: txError } = await db.from("rs_gift_card_transactions").insert(transactions);
    if (txError) {
      await db.from("rs_gift_cards").delete().eq("batch_id", batch.id);
      await db.from("rs_gift_card_batches").delete().eq("id", batch.id);
      throw txError;
    }

    // Secret codes are returned once to the authorized administrator for secure print production.
    return res.status(201).json({
      batchId: batch.id,
      count: inserted.length,
      denominationEur: denominationCents / 100,
      totalValueEur: (inserted.length * denominationCents) / 100,
      cards: printable
    });
  } catch (error) {
    console.error("Gift-card batch generation failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "Impossibile creare il lotto. Nessun codice segreto viene scritto nei log." });
  }
}
