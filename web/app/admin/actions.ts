"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { setAdminSession, clearAdminSession } from "@/lib/admin-auth";

export type LoginState = {
  status: "idle" | "error";
  message?: string;
};

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

  if (password !== expected) {
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
  await prisma.booth.update({
    where: { id: boothId },
    data: { status: "BOOKED", heldUntil: null },
  });
  revalidatePath("/admin");
  revalidatePath("/booths");
}

export async function releaseBooth(boothId: string) {
  await prisma.booth.update({
    where: { id: boothId },
    data: {
      status: "AVAILABLE",
      heldUntil: null,
      holderName: null,
      holderPhone: null,
      holderBusiness: null,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/booths");
}
