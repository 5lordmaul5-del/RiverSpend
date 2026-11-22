import { createClient } from "@supabase/supabase-js";

function reply(res, status, body) {
  return res.status(status).json(body);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return reply(res, 405, { error: "Metodo non consentito." });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return reply(res, 503, { error: "Backend RiverSpend non configurato." });
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return reply(res, 401, { error: "Sessione RiverSpend richiesta." });

  const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: auth, error: authError } = await db.auth.getUser(token);
  if (authError || !auth?.user) return reply(res, 401, { error: "Sessione non valida." });
  const { data: owner, error: ownerError } = await db.from("river_ai_owner_access")
    .select("tier").eq("singleton", true).eq("user_id", auth.user.id).maybeSingle();
  if (ownerError) return reply(res, 503, { error: "Verifica autorizzazioni non disponibile." });
  if (owner?.tier !== "nova_ultra_power_mega") return reply(res, 403, { error: "Pannello riservato al proprietario RiverSpend." });

  try {
    const [players, activePlayers, purchases, paid, pending, transactions, worlds, creatures, recent] = await Promise.all([
      db.from("rsgg_players").select("*", { count: "exact", head: true }),
      db.from("rsgg_players").select("*", { count: "exact", head: true }).eq("status", "active"),
      db.from("rsgg_purchases").select("*", { count: "exact", head: true }),
      db.from("rsgg_purchases").select("*", { count: "exact", head: true }).eq("payment_status", "paid"),
      db.from("rsgg_purchases").select("*", { count: "exact", head: true }).in("payment_status", ["pending", "not_started"]),
      db.from("rsgg_transactions").select("amount_minor,currency,status,transaction_type,created_at").order("created_at", { ascending: false }).limit(100),
      db.from("rsgg_worlds").select("id,name,biome,access_state").order("name"),
      db.from("rsgg_creatures").select("id,name,faction,species,rarity").order("name"),
      db.from("rsgg_purchases").select("id,player_id,catalog_item_id,quantity,total_minor,currency,payment_status,fulfillment_status,created_at").order("created_at", { ascending: false }).limit(20)
    ]);
    const errors = [players,activePlayers,purchases,paid,pending,transactions,worlds,creatures,recent].filter(x=>x.error);
    if (errors.length) {
      console.error("RSGG admin data query failed:", errors.map(x=>x.error.message));
      return reply(res, 503, { error: "Schema Games non ancora installato o query non disponibile.", setup: "Applica la migrazione supabase/migrations/20261122120000_riverspace_galaxy_core.sql." });
    }
    const paidTotals = {};
    (transactions.data || []).filter(t => t.status === "paid" && t.transaction_type === "real_payment").forEach(t => {
      paidTotals[t.currency] = (paidTotals[t.currency] || 0) + Number(t.amount_minor || 0);
    });
    return reply(res, 200, {
      owner: true,
      metrics: {
        players: players.count || 0,
        activePlayers: activePlayers.count || 0,
        purchases: purchases.count || 0,
        paidPurchases: paid.count || 0,
        pendingPurchases: pending.count || 0,
        paidTotalsMinor: paidTotals
      },
      transactions: transactions.data || [],
      worlds: worlds.data || [],
      creatures: creatures.data || [],
      recentPurchases: recent.data || [],
      integration: { riverSSAI: "adapter_not_connected", payments: "provider_webhooks_required", telemetry: "player_events_not_yet_ingested" }
    });
  } catch (error) {
    console.error("RSGG admin unexpected error:", error);
    return reply(res, 500, { error: "Errore interno del pannello Games." });
  }
}
