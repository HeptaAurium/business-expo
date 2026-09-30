import { cookies } from "next/headers";

// Lightweight shared-password gate for the organizer admin page — no user
// accounts, just one password (ADMIN_PASSWORD) shared with the organizing
// team. Good enough for a small, low-stakes internal tool; swap for real
// auth if this ever needs to scale beyond a handful of trusted organizers.
export const ADMIN_COOKIE = "sjm_admin";
const SESSION_HOURS = 12;

export async function isAdminAuthenticated() {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === "1";
}

export async function setAdminSession() {
  const store = await cookies();
  store.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_HOURS * 60 * 60,
    path: "/",
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}
