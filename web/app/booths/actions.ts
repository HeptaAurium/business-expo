"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const HOLD_HOURS = 24;

export type RequestBoothState = {
  status: "idle" | "success" | "error";
  message?: string;
  boothCode?: string;
};

export async function requestBooth(
  boothId: string,
  _prevState: RequestBoothState,
  formData: FormData,
): Promise<RequestBoothState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const businessName = String(formData.get("businessName") ?? "").trim();

  if (!name || !phone || !businessName) {
    return { status: "error", message: "Please fill in every field." };
  }

  const heldUntil = new Date(Date.now() + HOLD_HOURS * 60 * 60 * 1000);

  // Atomic conditional update: only succeeds if the booth was still
  // AVAILABLE at this exact moment, so two people can't both hold the same
  // booth if they submit around the same time.
  const { count } = await prisma.booth.updateMany({
    where: { id: boothId, status: "AVAILABLE" },
    data: {
      status: "HELD",
      heldUntil,
      holderName: name,
      holderPhone: phone,
      holderBusiness: businessName,
    },
  });

  if (count === 0) {
    return {
      status: "error",
      message: "Sorry — that booth was just taken. Please pick another one.",
    };
  }

  const booth = await prisma.booth.findUnique({ where: { id: boothId } });

  revalidatePath("/booths");
  revalidatePath("/admin");

  return { status: "success", boothCode: booth?.code };
}
