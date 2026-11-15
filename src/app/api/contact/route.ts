import { NextResponse } from "next/server";
import { site } from "@/lib/site";
import { intake, readLimitedBody } from "@/lib/lead-intake";

/**
 * Contact form handler.
 * Delivers submissions by email through Resend (https://resend.com) when these
 * environment variables are set in Vercel:
 *   RESEND_API_KEY     – API key from Resend
 *   CONTACT_TO_EMAIL   – inbox that receives leads
 *   CONTACT_FROM_EMAIL – verified sender, e.g. "Website <leads@advantageaisolutions.pro>"
 */

const MAX_BYTES = 16_384;
const MAX = { name: 120, email: 200, phone: 40, company: 160, stack: 400, message: 5000 };

function clean(v: unknown, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.split(";")[0].trim().toLowerCase() !== "application/json") {
    return NextResponse.json({ error: "Expected JSON." }, { status: 415 });
  }
  if (Number(req.headers.get("content-length") || 0) > MAX_BYTES) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }
  let body: Record<string, unknown>;
  try {
    const raw = await readLimitedBody(req, MAX_BYTES);
    if (new TextEncoder().encode(raw).length > MAX_BYTES) {
      return NextResponse.json({ error: "Request too large." }, { status: 413 });
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof Error && error.message === "Request too large") return NextResponse.json({ error: "Request too large." }, { status: 413 });
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Bots fill the hidden field — pretend success.
  if (clean(body.website, 200)) return NextResponse.json({ ok: true });

  const lead = {
    name: clean(body.name, MAX.name),
    email: clean(body.email, MAX.email),
    phone: clean(body.phone, MAX.phone),
    company: clean(body.company, MAX.company),
    stack: clean(body.stack, MAX.stack),
    message: clean(body.message, MAX.message),
  };

  if (!lead.name || !lead.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return NextResponse.json({ error: "Please add your name, a valid email and your workflow bottleneck." }, { status: 422 });
  }

  if (process.env.VERCEL_ENV === "preview") {
    try {
      // Vercel overwrites x-vercel-forwarded-for at its trusted ingress.
      const ip = req.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() || "unknown";
      const result = await intake(lead, ip, process.env);
      if (result.status === 429) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: { "Retry-After": String(result.retryAfter) } });
      if (result.status !== 200) return NextResponse.json({ error: "We couldn't send your message right now.", inquiryId: result.inquiryId }, { status: result.status });
      return NextResponse.json({ ok: true, inquiryId: result.inquiryId });
    } catch {
      console.error("[contact] Preview intake dependency unavailable");
      return NextResponse.json({ error: "Our form is temporarily unavailable. Please contact us directly." }, { status: 503 });
    }
  }

  const inquiryId = crypto.randomUUID();
  const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || site.email;
  const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Advantage AI Website <website@advantageaisolutions.pro>";
  // Accept the lowercase name too (the Vercel variable was created as resend_api_key).
  const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.resend_api_key;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) {
    console.warn("[contact] Email delivery not configured", { inquiryId });
    return NextResponse.json({ error: "Our form is being set up." }, { status: 503 });
  }

  const rows = Object.entries(lead)
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#64748b;vertical-align:top">${k}</td><td style="padding:4px 0;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`)
    .join("");

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: CONTACT_FROM_EMAIL || `${site.name} <onboarding@resend.dev>`,
      to: CONTACT_TO_EMAIL.split(",").map((s) => s.trim()),
      reply_to: lead.email,
      subject: `New operations review request [${inquiryId}] — ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
      html: `<h2 style="font-family:sans-serif">New website inquiry</h2><table style="font-family:sans-serif;font-size:14px">${rows}</table>`,
    }),
    });
  } catch (err) {
    console.error("[contact] Resend request failed", { inquiryId, errorType: err instanceof Error ? err.name : "unknown" });
    return NextResponse.json({ error: "We couldn't send your message right now." }, { status: 502 });
  }

  if (!res.ok) {
    console.error("[contact] Resend error", { inquiryId, status: res.status });
    return NextResponse.json({ error: "We couldn't send your message right now." }, { status: 502 });
  }

  console.info("[contact] Inquiry accepted by email provider", { inquiryId });
  return NextResponse.json({ ok: true, inquiryId });
}
