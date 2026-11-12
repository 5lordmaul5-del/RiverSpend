import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.riverspend.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-push-admin-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" }
  });

  const adminSecret = Deno.env.get("PUSH_SEND_SECRET");
  const suppliedSecret = req.headers.get("x-push-admin-secret");
  if (!adminSecret || !suppliedSecret || suppliedSecret !== adminSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const publicKey = Deno.env.get("WEB_PUSH_VAPID_PUBLIC_KEY");
  const privateKey = Deno.env.get("WEB_PUSH_VAPID_PRIVATE_KEY");
  const contact = Deno.env.get("WEB_PUSH_CONTACT") ?? "mailto:assistenza@riverspend.com";
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!publicKey || !privateKey || !supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Push service secrets are not configured." }), {
      status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  let body: { title?: string; body?: string; url?: string };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 100) : "";
  const message = typeof body.body === "string" ? body.body.trim().slice(0, 240) : "";
  const targetUrl = typeof body.url === "string" ? body.url : "/";
  if (!title || !message || !targetUrl.startsWith("/") || targetUrl.startsWith("//")) {
    return new Response(JSON.stringify({ error: "Title, message and a same-site relative URL are required." }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    webpush.setVapidDetails(contact, publicKey, privateKey);
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: subscriptions, error } = await supabase.from("web_push_subscriptions").select("id, endpoint, subscription");
    if (error) throw error;

    let sent = 0;
    let failed = 0;
    for (const row of subscriptions ?? []) {
      try {
        await webpush.sendNotification(row.subscription, JSON.stringify({
          title, body: message, url: targetUrl, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png"
        }), { TTL: 3600 });
        sent++;
      } catch (err) {
        failed++;
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("web_push_subscriptions").delete().eq("id", row.id);
        }
      }
    }
    return new Response(JSON.stringify({ ok: true, total: (subscriptions ?? []).length, sent, failed }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch {
    return new Response(JSON.stringify({ error: "Notification send failed." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
