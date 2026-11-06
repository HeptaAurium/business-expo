import { confirmBooking, releaseBooth } from "./actions";

export type AdminBooth = {
  id: string;
  code: string;
  status: "AVAILABLE" | "HELD" | "BOOKED";
  holderName: string | null;
  holderPhone: string | null;
  holderBusiness: string | null;
  heldUntil: Date | null;
  locationName: string;
};

export default function BoothRow({ booth }: { booth: AdminBooth }) {
  const confirm = confirmBooking.bind(null, booth.id);
  const release = releaseBooth.bind(null, booth.id);
  const isHeld = booth.status === "HELD";

  return (
    <div
      className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
      style={{
        borderColor:
          "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
      }}
    >
      <div className="text-sm">
        <p className="font-semibold" style={{ color: "var(--foreground)" }}>
          {booth.locationName} — {booth.code}
          <span
            className="ml-2 rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{
              backgroundColor: isHeld
                ? "var(--booth-held-bg)"
                : "var(--booth-booked-bg)",
              color: isHeld
                ? "var(--booth-held-text)"
                : "var(--booth-booked-text)",
            }}
          >
            {booth.status}
          </span>
        </p>
        <p style={{ color: "var(--brand-muted)" }}>
          {booth.holderName} · {booth.holderPhone} · {booth.holderBusiness}
        </p>
        {isHeld && booth.heldUntil && (
          <p className="text-xs" style={{ color: "var(--brand-muted)" }}>
            Held until{" "}
            {booth.heldUntil.toLocaleString("en-KE", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        )}
      </div>

      <div className="flex shrink-0 gap-2">
        {isHeld && (
          <form action={confirm}>
            <button
              type="submit"
              className="rounded-md px-3 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--brand-primary)" }}
            >
              Confirm
            </button>
          </form>
        )}
        <form action={release}>
          <button
            type="submit"
            className="rounded-md border px-3 py-1.5 text-sm transition-opacity hover:opacity-70"
            style={{
              borderColor: "var(--brand-corporate)",
              color: "var(--brand-corporate)",
            }}
          >
            Release
          </button>
        </form>
      </div>
    </div>
  );
}
