"use client";

import { useActionState } from "react";
import { lookupBooking, type LookupState } from "./actions";
import { PRICE_PER_BOOTH, formatKes } from "@/lib/pricing";

const initialState: LookupState = { status: "idle" };

function formatNairobi(iso: string) {
    return new Date(iso).toLocaleString("en-KE", {
        timeZone: "Africa/Nairobi",
        dateStyle: "medium",
        timeStyle: "short",
    });
}

export default function StatusLookup() {
    const [state, formAction, isPending] = useActionState(
        lookupBooking,
        initialState,
    );

    const inputStyle = {
        borderColor: "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
        color: "var(--foreground)",
    };

    return (
        <div className="flex flex-col gap-5">
            <form
                action={formAction}
                className="flex flex-col gap-3 rounded-md border p-4"
                style={{
                    borderColor:
                        "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
                }}
            >
                <label
                    className="flex flex-col gap-1 text-xs font-medium"
                    style={{ color: "var(--brand-muted)" }}
                >
                    Phone number
                    <input
                        name="phone"
                        type="tel"
                        required
                        inputMode="numeric"
                        pattern="0[17][0-9]{8}"
                        title="10 digits, starting with 07 or 01 (e.g. 0712345678)"
                        className="rounded border px-3 py-2 text-sm font-normal"
                        style={inputStyle}
                    />
                </label>
                <label
                    className="flex flex-col gap-1 text-xs font-medium"
                    style={{ color: "var(--brand-muted)" }}
                >
                    Email address
                    <input
                        name="email"
                        type="email"
                        required
                        className="rounded border px-3 py-2 text-sm font-normal"
                        style={inputStyle}
                    />
                </label>
                <button
                    type="submit"
                    disabled={isPending}
                    className="mt-1 rounded-md px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: "var(--brand-primary)" }}
                >
                    {isPending ? "Checking…" : "Check my booking"}
                </button>
            </form>

            {state.status === "error" && (
                <p className="text-sm" style={{ color: "var(--brand-corporate)" }}>
                    {state.message}
                </p>
            )}

            {state.status === "found" && state.booths && (
                <div className="flex flex-col gap-3">
                    {state.booths.map((b) => (
                        <div
                            key={b.code}
                            className="flex items-center justify-between rounded-md border p-3 text-sm"
                            style={{
                                borderColor:
                                    "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
                            }}
                        >
                            <span className="font-semibold">Booth {b.code}</span>
                            <span style={{ color: "var(--brand-muted)" }}>
                                {b.status === "BOOKED"
                                    ? "Confirmed"
                                    : b.heldUntil
                                        ? `On hold until ${formatNairobi(b.heldUntil)}`
                                        : "On hold"}
                            </span>
                        </div>
                    ))}
                    <p
                        className="text-sm font-medium"
                        style={{ color: "var(--brand-primary)" }}
                    >
                        Tentative total:{" "}
                        {formatKes(state.booths.length * PRICE_PER_BOOTH)}
                    </p>
                    <p className="text-xs" style={{ color: "var(--brand-muted)" }}>
                        Holds are released automatically if not confirmed in time. Our team
                        will contact you to confirm your package and payment.
                    </p>
                </div>
            )}
        </div>
    );
}