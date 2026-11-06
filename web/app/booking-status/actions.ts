"use server";

import { prisma } from "@/lib/prisma";
import { releaseExpiredHolds } from "@/lib/booths";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^0[17]\d{8}$/;

export type LookupState = {
    status: "idle" | "error" | "found";
    message?: string;
    booths?: {
        code: string;
        status: "HELD" | "BOOKED";
        heldUntil: string | null;
    }[];
};

export async function lookupBooking(
    _prev: LookupState,
    formData: FormData,
): Promise<LookupState> {
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const phone = String(formData.get("phone") ?? "").replace(/[\s-]/g, "");

    if (!EMAIL_PATTERN.test(email) || !PHONE_PATTERN.test(phone)) {
        return {
            status: "error",
            message: "Enter the phone number (07…/01…) and email you booked with.",
        };
    }

    // Make sure lapsed holds aren't shown as active.
    await releaseExpiredHolds();

    // Both phone and email must match, so a booking can't be found by guessing
    // one detail.
    const booths = await prisma.booth.findMany({
        where: {
            holderEmail: email,
            holderPhone: phone,
            status: { in: ["HELD", "BOOKED"] },
        },
        orderBy: { position: "asc" },
        select: { code: true, status: true, heldUntil: true },
    });

    if (booths.length === 0) {
        return {
            status: "error",
            message:
                "No active bookings found for those details. Holds that expired or were released no longer appear.",
        };
    }

    return {
        status: "found",
        booths: booths.map((b) => ({
            code: b.code,
            status: b.status as "HELD" | "BOOKED",
            heldUntil: b.heldUntil ? b.heldUntil.toISOString() : null,
        })),
    };
}