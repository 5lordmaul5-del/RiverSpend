import { createClient } from "@supabase/supabase-js";

const ALLOWED_PROVIDERS = new Set(["stripe", "paypal", "sumup"]);
const PAYABLE_ORDER_STATUS = new Set(["pending"]);

function getCurrencyDigits(currency) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency
  }).resolvedOptions().maximumFractionDigits;
}

function toMinorUnits(total, currency) {
  const amount = Number(total);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  let digits;
  try {
    digits = getCurrencyDigits(currency);
  } catch {
    return null;
  }
  const factor = 10 ** digits;
  const minor = Math.round((amount + Number.EPSILON) * factor);
  if (!Number.isSafeInteger(minor) || minor <= 0) return null;
  return minor;
}

function jsonError(res, status, error, code) {
  return res.status(status).json({ ok: false, error, code });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return jsonError(res, 405, "Metodo non consentito.", "method_not_allowed");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !publicKey || !serviceKey) {
    return jsonError(res, 503, "Configurazione server non completa.", "server_not_configured");
  }

  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return jsonError(res, 401, "Sessione RiverSpend richiesta.", "unauthorized");

  const { orderId, provider } = req.body || {};
  if ((typeof orderId !== "string" && typeof orderId !== "number") || !String(orderId).trim()) {
    return jsonError(res, 400, "orderId non valido.", "invalid_order");
  }
  const selectedProvider = String(provider || "").toLowerCase();
  if (!ALLOWED_PROVIDERS.has(selectedProvider)) {
    return jsonError(res, 400, "Provider non supportato.", "invalid_provider");
  }

  try {
    const authClient = createClient(url, publicKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    const user = authData?.user;
    if (authError || !user) {
      return jsonError(res, 401, "Sessione RiverSpend non valida.", "invalid_session");
    }

    const db = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: order, error: orderError } = await db
      .from("orders")
      .select("id,total,currency,buyer_id,status,payment_status")
      .eq("id", String(orderId))
      .maybeSingle();

    if (orderError) throw orderError;
    if (!order) return jsonError(res, 404, "Ordine non trovato.", "order_not_found");
    if (String(order.buyer_id) !== String(user.id)) {
      return jsonError(res, 403, "Ordine non appartenente a questo account.", "order_forbidden");
    }
    if (!PAYABLE_ORDER_STATUS.has(order.status) || order.payment_status === "paid") {
      return jsonError(res, 409, "Ordine non disponibile per il checkout.", "order_not_payable");
    }

    const currency = String(order.currency || "EUR").toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) {
      return jsonError(res, 400, "Valuta dell'ordine non valida.", "invalid_currency");
    }
    const amountMinor = toMinorUnits(order.total, currency);
    if (amountMinor === null) {
      return jsonError(res, 400, "Importo dell'ordine non valido.", "invalid_amount");
    }

    // Stable key makes retries for the same order/provider idempotent.
    const idempotencyKey = "riverpay-checkout:" + String(order.id) + ":" + selectedProvider;
    const { data: existing, error: lookupError } = await db
      .from("riverpay_transactions")
      .select("id,provider,status,currency,amount_minor,created_at")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (lookupError) throw lookupError;

    let transaction = existing;
    if (!transaction) {
      const { data: inserted, error: insertError } = await db
        .from("riverpay_transactions")
        .insert({
          order_id: String(order.id),
          provider: selectedProvider,
          status: "pending",
          currency,
          amount_minor: amountMinor,
          fee_minor: 0,
          idempotency_key: idempotencyKey,
          metadata: {
            source: "riverpay_checkout_engine",
            mode: "preparation_only",
            provider_adapter_enabled: false
          }
        })
        .select("id,provider,status,currency,amount_minor,created_at")
        .single();

      if (insertError && insertError.code !== "23505") throw insertError;
      transaction = inserted;
      if (!transaction) {
        const { data: retryRecord, error: retryError } = await db
          .from("riverpay_transactions")
          .select("id,provider,status,currency,amount_minor,created_at")
          .eq("idempotency_key", idempotencyKey)
          .single();
        if (retryError) throw retryError;
        transaction = retryRecord;
      }
    }

    if (transaction.currency !== currency || Number(transaction.amount_minor) !== amountMinor) {
      return jsonError(res, 409, "L'importo dell'ordine è cambiato: serve una nuova verifica prima del pagamento.", "order_amount_changed");
    }

    return res.status(202).json({
      ok: true,
      mode: "preparation_only",
      checkoutStatus: "prepared",
      paymentCanProceed: false,
      livePaymentsEnabled: false,
      transaction: {
        id: transaction.id,
        provider: transaction.provider,
        status: transaction.status,
        currency: transaction.currency,
        amountMinor: Number(transaction.amount_minor)
      },
      message: "Checkout preparato in modalità tecnica. Il collegamento al provider non è ancora attivo: nessun addebito è stato richiesto."
    });
  } catch {
    return jsonError(res, 500, "Impossibile preparare il checkout RiverPay.", "checkout_prepare_failed");
  }
}
