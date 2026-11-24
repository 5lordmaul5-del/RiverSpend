import { createClient } from "@supabase/supabase-js";

const publicClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Metodo non consentito." });
  }

  const token = (req.headers.authorization || "").startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : "";
  if (!token) return res.status(401).json({ error: "Accedi a RiverSpend per continuare." });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !publicKey || !serviceKey) {
    return res.status(503).json({ error: "Configurazione server non completa." });
  }

  try {
    const auth = publicClient();
    const { data: authData, error: authError } = await auth.auth.getUser(token);
    const user = authData?.user;
    if (authError || !user) return res.status(401).json({ error: "Sessione non valida." });

    const db = adminClient();
    const { data: role, error: roleError } = await db
      .from("rs_admin_roles").select("role").eq("user_id", user.id).maybeSingle();
    if (roleError || role?.role !== "admin") {
      return res.status(403).json({ error: "Pannello riservato all'amministratore RiverSpend." });
    }

    const statuses = ["pending_release","eligible","submitted","paid","held","failed","cancelled","reversed"];
    const counts = await Promise.all(statuses.map(async (status) => {
      const { count, error } = await db.from("rs_financial_payouts")
        .select("id", { count: "exact", head: true }).eq("status", status);
      if (error) throw error;
      return [status, count || 0];
    }));

    const [payouts, batches, movements] = await Promise.all([
      db.from("rs_financial_payouts")
        .select("id,payout_kind,beneficiary_label,order_reference,amount,currency,status,schedule_code,eligible_at,created_at,provider_code")
        .order("created_at", { ascending: false }).limit(30),
      db.from("rs_financial_settlement_batches")
        .select("id,settlement_kind,period_start,period_end,total_amount,currency,payout_count,status,provider_code,created_at")
        .order("created_at", { ascending: false }).limit(15),
      db.from("rs_treasury_movements")
        .select("id,order_id,gross_amount,currency,status,description,created_at")
        .order("created_at", { ascending: false }).limit(15)
    ]);

    if (payouts.error) throw payouts.error;
    if (batches.error) throw batches.error;
    if (movements.error) throw movements.error;

    return res.status(200).json({
      ok: true,
      mode: "preparation_only",
      liveTransfersEnabled: false,
      payoutCounts: Object.fromEntries(counts),
      payouts: payouts.data || [],
      settlementBatches: batches.data || [],
      treasuryMovements: movements.data || []
    });
  } catch {
    return res.status(500).json({ error: "Impossibile caricare il controllo RiverPay." });
  }
}
