// It's Cleaning Time! - "enquiry" Supabase Edge Function
//
// What it does:
//   POST  saves a quote enquiry from the website, then emails Kev a summary.
//   GET   health check + keep-alive ping (updates the heartbeat row).
//
// Where it lives: Supabase > Edge Functions > enquiry (paste this whole file into index.ts).
// Required secret: RESEND_API_KEY (Supabase > Edge Functions > Secrets).
// Optional secrets: NOTIFY_TO, NOTIFY_FROM, SITE_URL (defaults below).
// "Enforce JWT verification" must be OFF for this function (the public website calls it).

import { createClient } from "npm:@supabase/supabase-js@2";

const NOTIFY_TO = Deno.env.get("NOTIFY_TO") || "itscleaningtimeaus@gmail.com";
const NOTIFY_FROM = Deno.env.get("NOTIFY_FROM") || "Website enquiries <onboarding@resend.dev>";
const SITE_URL = (Deno.env.get("SITE_URL") || "https://itscleaningtime.com.au").replace(/\/+$/, "");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

const RATE_LIMIT = 5; // max enquiries from one connection...
const RATE_WINDOW_MINUTES = 15; // ...within this many minutes

// Supabase injects these automatically. Newer projects have SUPABASE_SECRET_KEYS,
// older ones SUPABASE_SERVICE_ROLE_KEY; use whichever exists.
function adminKey(): string {
  try {
    const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
    if (raw) {
      const keys = JSON.parse(raw);
      if (keys && typeof keys.default === "string") return keys.default;
    }
  } catch (_) { /* fall through */ }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
}

const db = createClient(Deno.env.get("SUPABASE_URL") || "", adminKey(), {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function redirect(path: string): Response {
  return new Response(null, { status: 303, headers: { ...CORS, Location: SITE_URL + path } });
}

function clean(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.replace(/[\u0000-\u001F\u007F]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

type Contact = { type: "email" | "phone"; value: string };

// Accepts an email address or an Australian mobile/landline number.
function parseContact(raw: string): Contact | null {
  const v = raw.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return { type: "email", value: v.toLowerCase() };
  let d = v.replace(/[\s\-().]/g, "");
  if (d.startsWith("+61")) d = "0" + d.slice(3);
  else if (/^61\d{9}$/.test(d)) d = "0" + d.slice(2);
  if (/^04\d{8}$/.test(d)) return { type: "phone", value: `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}` };
  if (/^0[2378]\d{8}$/.test(d)) return { type: "phone", value: `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}` };
  return null;
}

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function melbourneTime(d: Date): string {
  try {
    return d.toLocaleString("en-AU", {
      timeZone: "Australia/Melbourne", weekday: "short", day: "numeric", month: "short",
      hour: "numeric", minute: "2-digit",
    });
  } catch (_) {
    return d.toISOString();
  }
}

type Enquiry = {
  id: string; name: string; contact: Contact; service: string; suburb: string;
  frequency: string; note: string; source: string; receivedAt: Date;
};

function buildEmail(e: Enquiry) {
  const first = e.name.split(" ")[0];
  const subject = `New quote request: ${e.service || "Cleaning"}${e.suburb ? " in " + e.suburb : ""} - ${e.name}`;
  const digits = e.contact.value.replace(/\s/g, "");
  const contactHtml = e.contact.type === "phone"
    ? `<a href="tel:${esc(digits)}" style="color:#1F6FE5;font-weight:700">${esc(e.contact.value)}</a> (phone)`
    : `<a href="mailto:${esc(e.contact.value)}" style="color:#1F6FE5;font-weight:700">${esc(e.contact.value)}</a> (email)`;
  const sourceLabel = e.source === "service-tile" ? "Tapped a service, then the chat"
    : e.source === "no-js-form" ? "Basic form" : "Quote chat";
  const rows: [string, string][] = [
    ["Name", esc(e.name)],
    ["Contact", contactHtml],
    ["Service", esc(e.service || "Not given")],
    ["Suburb", esc(e.suburb || "Not given")],
    ["How often", esc(e.frequency || "Not given")],
    ["Anything else", esc(e.note || "-")],
    ["Received", esc(melbourneTime(e.receivedAt))],
    ["Came from", esc(sourceLabel)],
  ];
  const nextStep = e.contact.type === "phone"
    ? `Call or text ${esc(first)} on ${esc(e.contact.value)}.`
    : `Hit reply to answer ${esc(first)} directly.`;
  const html = `<!doctype html><html><body style="margin:0;background:#EAF3FF;font-family:Arial,Helvetica,sans-serif;color:#0B2463">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="background:#ffffff;border-radius:18px;padding:24px">
    <div style="font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#1F6FE5">New quote request</div>
    <h1 style="font-size:24px;line-height:1.2;margin:8px 0 18px">${esc(e.name)}: ${esc(e.service || "Cleaning")}${e.suburb ? " in " + esc(e.suburb) : ""}</h1>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:15px">
      ${rows.map(([k, v]) => `<tr><td style="padding:9px 12px 9px 0;color:#5B6B92;vertical-align:top;white-space:nowrap;border-top:1px solid #E3ECF8">${k}</td><td style="padding:9px 0;vertical-align:top;border-top:1px solid #E3ECF8">${v}</td></tr>`).join("")}
    </table>
    <p style="margin:20px 0 0;padding:14px 16px;background:#FFF6CC;border-radius:12px;font-size:15px"><strong>Next step:</strong> ${nextStep}</p>
  </div>
  <p style="font-size:12px;color:#5B6B92;margin:14px 4px 0">Sent by the itscleaningtime.com.au quote form. Saved in Supabase (enquiries table), ref ${esc(e.id.slice(0, 8))}.</p>
</div></body></html>`;
  const textRows: [string, string][] = [
    ["Name", e.name],
    ["Contact", `${e.contact.value} (${e.contact.type})`],
    ["Service", e.service || "Not given"],
    ["Suburb", e.suburb || "Not given"],
    ["How often", e.frequency || "Not given"],
    ["Anything else", e.note || "-"],
    ["Received", melbourneTime(e.receivedAt)],
    ["Came from", sourceLabel],
  ];
  const text = [
    "New quote request",
    "",
    ...textRows.map(([k, v]) => `${k}: ${v}`),
    "",
    e.contact.type === "phone" ? `Next step: call or text ${first} on ${e.contact.value}.` : `Next step: reply to this email to answer ${first}.`,
    `Ref ${e.id.slice(0, 8)}`,
  ].join("\n");
  return { subject, html, text };
}

async function sendEmail(e: Enquiry): Promise<void> {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY secret is not set");
  const { subject, html, text } = buildEmail(e);
  const body: Record<string, unknown> = { from: NOTIFY_FROM, to: [NOTIFY_TO], subject, html, text };
  if (e.contact.type === "email") body.reply_to = e.contact.value;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `enquiry-${e.id}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  // Health check / keep-alive. Visiting the function URL in a browser should show {"ok":true,...}.
  if (req.method === "GET") {
    const { error } = await db.from("heartbeat").upsert({ id: 1, last_ping: new Date().toISOString() });
    if (error) {
      console.error("heartbeat failed", error);
      return json({ ok: false, error: "database", detail: error.message }, 500);
    }
    return json({ ok: true, service: "enquiry", time: new Date().toISOString() });
  }

  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  // The quote chat sends JSON; the no-JavaScript fallback form sends normal form data.
  const isForm = !(req.headers.get("content-type") || "").includes("application/json");
  const fail = (code: string, status: number) => (isForm ? redirect("/not-sent.html") : json({ ok: false, error: code }, status));
  const succeed = (id?: string) => (isForm ? redirect("/thanks.html") : json({ ok: true, id }));

  let body: Record<string, unknown> = {};
  try {
    if (isForm) {
      const fd = await req.formData();
      fd.forEach((v, k) => { if (typeof v === "string") body[k] = v; });
    } else {
      body = await req.json();
    }
  } catch (_) {
    return fail("bad_request", 400);
  }

  // Spam trap: real people never see or fill the "company" field.
  if (clean(body.company, 200)) return succeed();

  const name = clean(body.name, 80);
  const contact = parseContact(clean(body.contact, 120));
  if (!name) return fail("name_required", 400);
  if (!contact) return fail("contact_invalid", 400);

  const source = ["chat", "service-tile", "no-js-form"].includes(String(body.source)) ? String(body.source) : "unknown";
  const submitted = new Date(String(body.submittedAt || ""));
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("cf-connecting-ip") || "";
  const ipHash = ip ? (await sha256("itscleaningtime:" + ip)).slice(0, 32) : null;

  // Basic flood protection.
  if (ipHash) {
    const since = new Date(Date.now() - RATE_WINDOW_MINUTES * 60_000).toISOString();
    const { count, error } = await db.from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash).gte("created_at", since);
    if (!error && (count ?? 0) >= RATE_LIMIT) return fail("too_many", 429);
  }

  const row = {
    name,
    contact: contact.value,
    contact_type: contact.type,
    email: contact.type === "email" ? contact.value : null,
    phone: contact.type === "phone" ? contact.value : null,
    service: clean(body.service, 60) || null,
    suburb: clean(body.suburb, 60) || null,
    frequency: clean(body.frequency, 40) || null,
    note: clean(body.note, 500) || null,
    source,
    page_url: clean(body.pageUrl, 300) || null,
    submitted_at: isNaN(submitted.getTime()) ? null : submitted.toISOString(),
    user_agent: clean(req.headers.get("user-agent"), 300) || null,
    ip_hash: ipHash,
  };

  // Save first, so the enquiry is never lost even if the email fails.
  const { data, error } = await db.from("enquiries").insert(row).select("id, created_at").single();
  if (error || !data) {
    console.error("insert failed", error);
    return fail("save_failed", 500);
  }

  try {
    await sendEmail({
      id: data.id, name, contact, service: row.service || "", suburb: row.suburb || "",
      frequency: row.frequency || "", note: row.note || "", source, receivedAt: new Date(data.created_at),
    });
    await db.from("enquiries").update({ email_sent: true }).eq("id", data.id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("email failed", msg);
    await db.from("enquiries").update({ email_error: msg.slice(0, 500) }).eq("id", data.id);
    // The enquiry is saved, so the customer still sees success.
  }

  return succeed(data.id);
});
