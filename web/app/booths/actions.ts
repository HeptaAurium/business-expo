"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { queueBoothHeldEmail } from "@/lib/mailer";

const HOLD_HOURS = 24;
const MAX_BOOTHS_PER_BOOKING = 10;

// Basic email shape: something@something.tld (no spaces, TLD of 2+ chars).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Kenyan mobile: 10 digits, starting 01 or 07.
const PHONE_PATTERN = /^0[17]\d{8}$/;

export type RequestBoothState = {
  status: "idle" | "success" | "error";
  message?: string;
  boothCodes?: string[];
};

export async function requestBooths(
  boothIds: string[],
  _prevState: RequestBoothState,
  formData: FormData,
): Promise<RequestBoothState> {
  const ids = [...new Set(boothIds)];
  const name = String(formData.get("name") ?? "").trim();
  // Allow people to type spaces or dashes, e.g. "0712 345 678".
  const phone = String(formData.get("phone") ?? "").replace(/[\s-]/g, "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const businessName = String(formData.get("businessName") ?? "").trim();

  if (ids.length === 0) {
    return { status: "error", message: "Please select at least one booth." };
  }
  if (ids.length > MAX_BOOTHS_PER_BOOKING) {
    return {
      status: "error",
      message: `You can book up to ${MAX_BOOTHS_PER_BOOKING} booths at a time.`,
    };
  }
  if (!name || !phone || !email || !businessName) {
    return { status: "error", message: "Please fill in every field." };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }
  if (!PHONE_PATTERN.test(phone)) {
    return {
      status: "error",
      message:
        "Phone number must be 10 digits and start with 07 or 01 (e.g. 0712345678).",
    };
  }

  const heldUntil = new Date(Date.now() + HOLD_HOURS * 60 * 60 * 1000);

  try {
    // All-or-nothing: if any selected booth is no longer AVAILABLE, the
    // transaction throws and none of them are held.
    await prisma.$transaction(async (tx) => {
      const { count } = await tx.booth.updateMany({
        where: { id: { in: ids }, status: "AVAILABLE" },
        data: {
          status: "HELD",
          heldUntil,
          holderName: name,
          holderPhone: phone,
          holderEmail: email,
          holderBusiness: businessName,
        },
      });
      if (count !== ids.length) throw new Error("BOOTH_TAKEN");
    });
  } catch (err) {
    if (err instanceof Error && err.message === "BOOTH_TAKEN") {
      return {
        status: "error",
        message:
          "Sorry — one of those booths was just taken. Please refresh and pick again.",
      };
    }
    throw err;
  }

  const booths = await prisma.booth.findMany({
    where: { id: { in: ids } },
    orderBy: { position: "asc" },
  });
  queueBoothHeldEmail(booths);

  revalidatePath("/booths");
  revalidatePath("/admin");

  return { status: "success", boothCodes: booths.map((b) => b.code) };
}