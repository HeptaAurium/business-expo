"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  setAdminSession,
  clearAdminSession,
  isAdminAuthenticated,
  safeEqual,
} from "@/lib/admin-auth";
import {
  queueBoothConfirmedEmail,
  queueBoothReleasedEmail,
} from "@/lib/mailer";

export type LoginState = {
  status: "idle" | "error";
  message?: string;
};

// Server actions are public POST endpoints — the page-level login check
// doesn't protect them, so every mutating action verifies the session itself.
async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorized");
  }
}

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return {
      status: "error",
      message:
        "ADMIN_PASSWORD isn't set on the server yet — add it to web/.env.",
    };
  }

  if (!safeEqual(password, expected)) {
    return { status: "error", message: "Incorrect password." };
  }

  await setAdminSession();
  revalidatePath("/admin");
  return { status: "idle" };
}

export async function logout() {
  await clearAdminSession();
  revalidatePath("/admin");
}

export async function confirmBooking(boothId: string) {
  await requireAdmin();

  const before = await prisma.booth.findUnique({ where: { id: boothId } });
  const booth = await prisma.booth.update({
    where: { id: boothId },
    data: { status: "BOOKED", heldUntil: null },
  });

  // Only email on a real transition, not on a repeated click.
  if (before && before.status !== "BOOKED") queueBoothConfirmedEmail(booth);

  revalidatePath("/admin");
  revalidatePath("/booths");
}

export async function releaseBooth(boothId: string) {
  await requireAdmin();

  // Read first: the holder's details are cleared by the update below.
  const before = await prisma.booth.findUnique({ where: { id: boothId } });

  await prisma.booth.update({
    where: { id: boothId },
    data: {
      status: "AVAILABLE",
      heldUntil: null,
      holderName: null,
      holderPhone: null,
      holderEmail: null,
      holderBusiness: null,
    },
  });

  if (before && before.status !== "AVAILABLE") {
    queueBoothReleasedEmail(before, "released");
  }

  revalidatePath("/admin");
  revalidatePath("/booths");
}