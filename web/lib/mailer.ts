import { after } from "next/server";
import { PRICE_PER_BOOTH, formatKes } from "@/lib/pricing";

// Transactional email via Resend's HTTP API (no extra dependency).
// Env: RESEND_API_KEY, MAIL_FROM (e.g. "Expo Team <expo@yourdomain.com>"),
// optional MAIL_REPLY_TO, SITE_URL (for links in emails) and
// ORGANIZER_EMAILS (comma-separated; get an alert on every booking event).
// If the key/sender aren't set, emails are skipped with a warning so local
// dev and booking itself never break.

const EVENT_NAME = "St. Joseph Mukasa Business Expo 2026";
const EVENT_DETAILS =
  "29 November 2026 · St. Joseph Mukasa Catholic Church, Kahawa West";

export type MailBooth = {
  code: string;
  holderName: string | null;
  holderEmail: string | null;
  holderBusiness: string | null;
  holderPhone?: string | null;
  heldUntil: Date | null;
};

type Message = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
};

async function sendEmail({ to, subject, html, text }: Message) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!apiKey || !from) {
    console.warn("[mailer] RESEND_API_KEY / MAIL_FROM not set — email skipped.");
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        reply_to: process.env.MAIL_REPLY_TO || undefined,
      }),
    });
    if (!res.ok) {
      console.error("[mailer] send failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[mailer] send error:", err);
  }
}

/** Runs after the response is sent, so email never slows or breaks a request. */
function queue(message: Message) {
  after(() => sendEmail(message));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatNairobi(date: Date) {
  return date.toLocaleString("en-KE", {
    timeZone: "Africa/Nairobi",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function siteUrl() {
  return (process.env.SITE_URL ?? "").trim().replace(/\/$/, "");
}

/** Paragraph pointing customers at the status page (omitted if no SITE_URL). */
function trackingParagraph() {
  const base = siteUrl();
  if (!base) return null;
  const url = `${base}/booking-status`;
  return `You can check the status of your booking any time at <a href="${url}">${url}</a> using the phone number and email you booked with.`;
}

function trackingText() {
  const base = siteUrl();
  return base
    ? `Check your booking status any time: ${base}/booking-status (use the phone number and email you booked with).`
    : null;
}

function layout(heading: string, paragraphs: string[]) {
  const body = paragraphs
    .map((p) => `<p style="margin:0 0 14px;line-height:1.55">${p}</p>`)
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
<div style="max-width:560px;margin:0 auto;padding:24px">
<div style="background:#ffffff;border-radius:8px;padding:28px">
<h1 style="margin:0 0 18px;font-size:20px;color:#1e3a5f">${heading}</h1>
${body}
</div>
<p style="text-align:center;font-size:12px;color:#6b7280;margin:14px 0 0">${EVENT_NAME}<br>${EVENT_DETAILS}</p>
</div></body></html>`;
}

function greeting(booth: MailBooth) {
  return `Hi ${escapeHtml(booth.holderName ?? "there")},`;
}

/* ------------------------------ organizer alerts ------------------------------ */

type AlertKind = "held" | "confirmed" | "released" | "expired";

const ALERT_LABEL: Record<AlertKind, string> = {
  held: "New hold",
  confirmed: "Booking confirmed",
  released: "Hold released",
  expired: "Hold expired",
};

function organizerRecipients() {
  return (process.env.ORGANIZER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

function queueOrganizerAlert(kind: AlertKind, booths: MailBooth[]) {
  const to = organizerRecipients();
  const first = booths[0];
  if (to.length === 0 || !first) return;

  const codes = booths.map((b) => b.code).join(", ");
  const amount = formatKes(booths.length * PRICE_PER_BOOTH);
  const until =
    kind === "held" && first.heldUntil ? formatNairobi(first.heldUntil) : null;

  const lines: [string, string][] = [
    ["Booths", codes],
    ["Name", first.holderName ?? "—"],
    ["Business", first.holderBusiness ?? "—"],
    ["Phone", first.holderPhone ?? "—"],
    ["Email", first.holderEmail ?? "—"],
    ["Tentative amount", amount],
  ];
  if (until) lines.push(["Hold expires", `${until} (EAT)`]);

  const admin = siteUrl() ? `${siteUrl()}/admin` : null;

  queue({
    to,
    subject: `[Expo] ${ALERT_LABEL[kind]}: ${codes}${first.holderName ? ` — ${first.holderName}` : ""}`,
    html: layout(
      `${ALERT_LABEL[kind]}: ${escapeHtml(codes)}`,
      [
        ...lines.map(
          ([k, v]) => `<strong>${k}:</strong> ${escapeHtml(v)}`,
        ),
        ...(admin ? [`<a href="${admin}">Open the admin page</a>`] : []),
      ],
    ),
    text: [
      `${ALERT_LABEL[kind]}: ${codes}`,
      ...lines.map(([k, v]) => `${k}: ${v}`),
      ...(admin ? [`Admin: ${admin}`] : []),
    ].join("\n"),
  });
}

/* ------------------------------ customer emails ------------------------------ */

/** One email covering every booth held in a single booking. */
export function queueBoothHeldEmail(booths: MailBooth[]) {
  const first = booths[0];
  if (!first) return;

  queueOrganizerAlert("held", booths);
  if (!first.holderEmail) return;

  const codes = booths.map((b) => b.code);
  const list = codes.join(", ");
  const plural = codes.length > 1;
  const until = first.heldUntil ? formatNairobi(first.heldUntil) : null;
  const subject = `Booth${plural ? "s" : ""} ${list} on hold — ${EVENT_NAME}`;
  const track = trackingParagraph();
  const trackTxt = trackingText();

  queue({
    to: first.holderEmail,
    subject,
    html: layout(`Booth${plural ? "s" : ""} ${escapeHtml(list)} on hold`, [
      greeting(first),
      `We've received your request and are holding booth${plural ? "s" : ""} <strong>${escapeHtml(list)}</strong>${first.holderBusiness
        ? ` for <strong>${escapeHtml(first.holderBusiness)}</strong>`
        : ""
      }.`,
      until
        ? `The hold is valid until <strong>${until}</strong> (East Africa Time). Our team will call you to confirm your package and payment. If the booking isn't confirmed by then, the booth${plural ? "s are" : " is"} released for others.`
        : `Our team will call you to confirm your package and payment.`,
      ...(track ? [track] : []),
    ]),
    text: [
      `Hi ${first.holderName ?? "there"},`,
      `We've received your request and are holding booth${plural ? "s" : ""} ${list}.`,
      until
        ? `The hold is valid until ${until} (East Africa Time). Our team will call you to confirm your package and payment. If it isn't confirmed by then, the booth${plural ? "s are" : " is"} released.`
        : `Our team will call you to confirm your package and payment.`,
      ...(trackTxt ? [trackTxt] : []),
      `${EVENT_NAME} — ${EVENT_DETAILS}`,
    ].join("\n\n"),
  });
}

export function queueBoothConfirmedEmail(booth: MailBooth) {
  queueOrganizerAlert("confirmed", [booth]);
  if (!booth.holderEmail) return;

  const subject = `Booth ${booth.code} confirmed — ${EVENT_NAME}`;
  const track = trackingParagraph();
  const trackTxt = trackingText();

  queue({
    to: booth.holderEmail,
    subject,
    html: layout(`Booth ${escapeHtml(booth.code)} is confirmed`, [
      greeting(booth),
      `Your booking for booth <strong>${escapeHtml(booth.code)}</strong> is confirmed. Thank you for taking part in ${EVENT_NAME}.`,
      `Event details: ${EVENT_DETAILS}. Our team will be in touch with setup information closer to the day.`,
      ...(track ? [track] : []),
    ]),
    text: [
      `Hi ${booth.holderName ?? "there"},`,
      `Your booking for booth ${booth.code} is confirmed. Thank you for taking part in ${EVENT_NAME}.`,
      `Event details: ${EVENT_DETAILS}. Our team will be in touch with setup information closer to the day.`,
      ...(trackTxt ? [trackTxt] : []),
    ].join("\n\n"),
  });
}

export function queueBoothReleasedEmail(
  booth: MailBooth,
  reason: "released" | "expired",
) {
  queueOrganizerAlert(reason === "expired" ? "expired" : "released", [booth]);
  if (!booth.holderEmail) return;

  const subject = `Booth ${booth.code} released — ${EVENT_NAME}`;
  const why =
    reason === "expired"
      ? `Your 24-hour hold on booth <strong>${escapeHtml(booth.code)}</strong> has expired without confirmation, so the booth has been released.`
      : `Your hold on booth <strong>${escapeHtml(booth.code)}</strong> has been released by the organizing team.`;
  const whyText =
    reason === "expired"
      ? `Your 24-hour hold on booth ${booth.code} has expired without confirmation, so the booth has been released.`
      : `Your hold on booth ${booth.code} has been released by the organizing team.`;

  queue({
    to: booth.holderEmail,
    subject,
    html: layout(`Booth ${escapeHtml(booth.code)} released`, [
      greeting(booth),
      why,
      `If you'd still like a booth, you're welcome to book again while spaces remain, or reply to this email and we'll help.`,
    ]),
    text: [
      `Hi ${booth.holderName ?? "there"},`,
      whyText,
      `If you'd still like a booth, you're welcome to book again while spaces remain, or reply to this email and we'll help.`,
    ].join("\n\n"),
  });
}