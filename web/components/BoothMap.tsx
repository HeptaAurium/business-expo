"use client";

import { useActionState, useState } from "react";
import { requestBooth, type RequestBoothState } from "@/app/booths/actions";

type BoothStatus = "AVAILABLE" | "HELD" | "BOOKED";
type BoothType = "STANDARD" | "CORPORATE";

export type MapBooth = {
  id: string;
  code: string;
  type: BoothType;
  status: BoothStatus;
  position: number;
};

function boothClassName(
  type: BoothType,
  status: BoothStatus,
  isSelected: boolean,
) {
  const base = "booth";
  const statusClass =
    status === "HELD"
      ? "booth-held"
      : status === "BOOKED"
        ? "booth-booked"
        : type === "CORPORATE"
          ? "booth-corporate"
          : "booth-available";

  return [
    base,
    statusClass,
    isSelected ? "ring-2 ring-offset-2 ring-black/60" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function BoothButton({
  booth,
  isSelected,
  onSelect,
}: {
  booth: MapBooth;
  isSelected: boolean;
  onSelect: (booth: MapBooth) => void;
}) {
  const isPickable = booth.status === "AVAILABLE";

  return (
    <button
      type="button"
      disabled={!isPickable}
      onClick={() => {
        console.log("Booth clicked", booth);
        onSelect(booth);
      }}
      className={`${boothClassName(booth.type, booth.status, isSelected)} text-[11px]`}
      style={{ width: booth.type === "CORPORATE" ? 52 : 40, height: 40 }}
      aria-pressed={isSelected}
      title={`${booth.code} — ${booth.status.toLowerCase()}`}
    >
      {booth.code}
    </button>
  );
}

type BoothRow = {
  label?: string;
  booths: MapBooth[];
};

/**
 * Theatre/cinema-style seat map: a curved "screen" bar labels the front of
 * the floor, booths sit in centered rows below it (grouped by type), and a
 * legend runs along the bottom — matching the seat-map look the organizer
 * wanted, rather than a literal trace of the hand-drawn sketch.
 */
function TheatreFloorPlan({
  frontLabel,
  rows,
  selectedId,
  onSelect,
}: {
  frontLabel: string;
  rows: BoothRow[];
  selectedId: string | null;
  onSelect: (booth: MapBooth) => void;
}) {
  return (
    <div
      className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed px-6 py-8"
      style={{
        borderColor:
          "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <div
          className="h-3 w-56 max-w-full opacity-70 sm:w-72"
          style={{
            backgroundColor: "var(--brand-primary)",
            borderBottomLeftRadius: "999px",
            borderBottomRightRadius: "999px",
          }}
        />
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--brand-muted)" }}
        >
          {frontLabel}
        </span>
      </div>

      <div className="flex flex-col items-center gap-4">
        {rows.map((row, index) => (
          <div key={row.label ?? index} className="flex items-center gap-3">
            {row.label && (
              <span
                className="w-16 shrink-0 text-right text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "var(--brand-muted)" }}
              >
                {row.label}
              </span>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              {row.booths.map((booth) => (
                <BoothButton
                  key={booth.id}
                  booth={booth}
                  isSelected={selectedId === booth.id}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function byPosition(a: MapBooth, b: MapBooth) {
  return a.position - b.position;
}

function groupByType(booths: MapBooth[]) {
  return {
    corporate: booths.filter((b) => b.type === "CORPORATE").sort(byPosition),
    standard: booths.filter((b) => b.type === "STANDARD").sort(byPosition),
  };
}

type LayoutProps = {
  booths: MapBooth[];
  selectedId: string | null;
  onSelect: (booth: MapBooth) => void;
};

/** Arena — a single run of standard booths (B1–B8) facing the entrance. */
function ArenaFloorPlan({ booths, selectedId, onSelect }: LayoutProps) {
  const sorted = [...booths].sort(byPosition);
  return (
    <TheatreFloorPlan
      frontLabel="Entrance / Path"
      rows={[{ booths: sorted }]}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  );
}

/**
 * Premium Ground — traces the actual sketch rather than the generic theatre
 * rows: the church wall runs along the right edge, P2 sits in the top-right
 * corner against it, P1 sits just to P2's left, and the standard A booths
 * fill the left side of the ground.
 */
function PremiumFloorPlan({ booths, selectedId, onSelect }: LayoutProps) {
  const { corporate, standard } = groupByType(booths);

  return (
    <div
      className="flex overflow-hidden rounded-lg border-2 border-dashed"
      style={{
        borderColor:
          "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
      }}
    >
      <div className="flex flex-1 flex-col gap-6 px-6 py-8">
        {/* P1, P2 — anchored top-right, against the church wall */}
        <div className="flex justify-end gap-2">
          {corporate.map((booth) => (
            <BoothButton
              key={booth.id}
              booth={booth}
              isSelected={selectedId === booth.id}
              onSelect={onSelect}
            />
          ))}
        </div>

        {/* A1–A8 — fill the left side of the ground */}
        <div className="flex flex-wrap content-start gap-2">
          {standard.map((booth) => (
            <BoothButton
              key={booth.id}
              booth={booth}
              isSelected={selectedId === booth.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>

      {/* Church wall, running the full height along the right edge */}
      <div
        className="flex w-8 shrink-0 items-center justify-center"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
        }}
      >
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ writingMode: "vertical-rl", color: "var(--brand-muted)" }}
        >
          Church Wall
        </span>
      </div>
    </div>
  );
}

/** Fallback for a location whose floor layout hasn't been sketched yet. */
function GenericFloorPlan({ booths, selectedId, onSelect }: LayoutProps) {
  const { corporate, standard } = groupByType(booths);
  const rows: BoothRow[] = [];
  if (corporate.length > 0)
    rows.push({ label: "Corporate", booths: corporate });
  if (standard.length > 0) rows.push({ label: "Standard", booths: standard });

  return (
    <TheatreFloorPlan
      frontLabel="Entrance"
      rows={rows}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  );
}

const initialFormState: RequestBoothState = { status: "idle" };

function BoothBookingForm({
  booth,
  onDone,
}: {
  booth: MapBooth;
  onDone: () => void;
}) {
  const boundAction = requestBooth.bind(null, booth.id);
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialFormState,
  );

  if (state.status === "success") {
    return (
      <div
        className="rounded-md border p-4 text-sm"
        style={{ borderColor: "var(--booth-available-border)" }}
      >
        <p className="font-semibold" style={{ color: "var(--brand-primary)" }}>
          Booth {state.boothCode} held for you
        </p>
        <p className="mt-1" style={{ color: "var(--brand-muted)" }}>
          It&apos;s held for the next 24 hours. Our team will call you to
          confirm your package and payment.
        </p>
        <button
          type="button"
          onClick={onDone}
          className="mt-3 text-sm underline underline-offset-2"
          style={{ color: "var(--brand-primary)" }}
        >
          Choose another booth
        </button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-md border p-4"
      style={{
        borderColor:
          "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
      }}
    >
      <p
        className="text-sm font-semibold"
        style={{ color: "var(--foreground)" }}
      >
        Reserve booth {booth.code}
      </p>

      {state.status === "error" && (
        <p className="text-sm" style={{ color: "var(--brand-corporate)" }}>
          {state.message}
        </p>
      )}

      <label
        className="flex flex-col gap-1 text-xs font-medium"
        style={{ color: "var(--brand-muted)" }}
      >
        Full name
        <input
          name="name"
          required
          className="rounded border px-3 py-2 text-sm font-normal"
          style={{
            borderColor:
              "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
            color: "var(--foreground)",
          }}
        />
      </label>

      <label
        className="flex flex-col gap-1 text-xs font-medium"
        style={{ color: "var(--brand-muted)" }}
      >
        Phone number
        <input
          name="phone"
          type="tel"
          required
          className="rounded border px-3 py-2 text-sm font-normal"
          style={{
            borderColor:
              "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
            color: "var(--foreground)",
          }}
        />
      </label>

      <label
        className="flex flex-col gap-1 text-xs font-medium"
        style={{ color: "var(--brand-muted)" }}
      >
        Business name
        <input
          name="businessName"
          required
          className="rounded border px-3 py-2 text-sm font-normal"
          style={{
            borderColor:
              "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
            color: "var(--foreground)",
          }}
        />
      </label>

      <div className="mt-1 flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: "var(--brand-primary)" }}
        >
          {isPending ? "Holding…" : "Hold This Booth"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border px-4 py-2 text-sm"
          style={{
            borderColor: "var(--brand-muted)",
            color: "var(--brand-muted)",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function BoothMap({
  locationName,
  locationSlug,
  booths,
}: {
  locationName: string;
  locationSlug: string;
  booths: MapBooth[];
}) {
  const [selected, setSelected] = useState<MapBooth | null>(null);

  const layoutProps: LayoutProps = {
    booths,
    selectedId: selected?.id ?? null,
    onSelect: setSelected,
  };

  return (
    <div className="flex flex-col gap-5">
      <h2
        className="text-lg font-semibold"
        style={{ color: "var(--brand-primary)" }}
      >
        {locationName}
      </h2>

      {locationSlug === "arena" ? (
        <ArenaFloorPlan {...layoutProps} />
      ) : locationSlug === "premium" ? (
        <PremiumFloorPlan {...layoutProps} />
      ) : (
        <GenericFloorPlan {...layoutProps} />
      )}

      <div
        className="flex flex-wrap justify-center gap-4 text-xs"
        style={{ color: "var(--brand-muted)" }}
      >
        <LegendSwatch className="booth-available" label="Available" />
        <LegendSwatch className="booth-corporate" label="Corporate" />
        <LegendSwatch className="booth-held" label="Held" />
        <LegendSwatch className="booth-booked" label="Booked" />
      </div>

      {selected && selected.status === "AVAILABLE" ? (
        <BoothBookingForm
          key={selected.id}
          booth={selected}
          onDone={() => setSelected(null)}
        />
      ) : (
        <div
          className="text-center text-sm"
          style={{ color: "var(--brand-muted)" }}
        >
          Click an available booth to reserve it.
        </div>
      )}
    </div>
  );
}

function LegendSwatch({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`${className} inline-block`}
        style={{ width: 14, height: 14, borderRadius: 3 }}
      />
      {label}
    </span>
  );
}
