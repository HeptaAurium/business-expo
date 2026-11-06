import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// Lightweight shared-password gate for the organizer admin page — no user
// accounts, just one password (ADMIN_PASSWORD) shared with the organizing
// team. The session cookie is signed (HMAC) and expires server-side, so it
// can't be forged by hand-editing cookies in dev tools.
// Optionally set ADMIN_SESSION_SECRET to sign with a key separate from the
// password; otherwise ADMIN_PASSWORD is used.
export const ADMIN_COOKIE = "sjm_admin";
const SESSION_HOURS = 12;

function secret() {
  return process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Constant-time string comparison (hashes first so lengths always match). */
export function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function isAdminAuthenticated() {
  if (!secret()) return false;

  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  if (!value) return false;

  const [expiry, signature] = value.split(".");
  if (!expiry || !signature) return false;
  if (!(Number(expiry) > Date.now())) return false;

  return safeEqual(signature, sign(expiry));
}

export async function setAdminSession() {
  const expiry = String(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
  const store = await cookies();
  store.set(ADMIN_COOKIE, `${expiry}.${sign(expiry)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_HOURS * 60 * 60,
    path: "/",
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}