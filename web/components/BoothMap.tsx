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
      onClick={() => onSelect(booth)}
      className={boothClassName(booth.type, booth.status, isSelected)}
      style={{ width: booth.type === "CORPORATE" ? 96 : 72, height: 56 }}
      aria-pressed={isSelected}
      title={`${booth.code} — ${booth.status.toLowerCase()}`}
    >
      {booth.code}
    </button>
  );
}

// Small pill used to label a zone of the floor plan (a wall, a path, an
// entrance) that isn't itself a bookable booth.
function ZoneLabel({ children }: { children: string }) {
  return (
    <span
      className="inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--brand-muted) 12%, transparent)",
        color: "var(--brand-muted)",
      }}
    >
      {children}
    </span>
  );
}

type LayoutProps = {
  booths: MapBooth[];
  selectedId: string | null;
  onSelect: (booth: MapBooth) => void;
};

const floorPlanBorder = {
  borderColor: "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
};

/**
 * Arena — a single row of standard booths (B1–B8) along the hall's left
 * wall, with open floor to the right and a path wrapping past both the top
 * and bottom entrances. Matches the organizer's hand-drawn layout: B8 sits
 * slightly apart from the B1–B7 run, closer to the bottom path.
 */
function ArenaFloorPlan({ booths, selectedId, onSelect }: LayoutProps) {
  const sorted = [...booths].sort((a, b) => a.position - b.position);
  const lastBooth = sorted[sorted.length - 1];
  const mainRun = sorted.slice(0, -1);

  return (
    <div
      className="relative rounded-lg border-2 border-dashed px-5 py-10"
      style={floorPlanBorder}
    >
      <div className="absolute right-4 top-3">
        <ZoneLabel>Path</ZoneLabel>
      </div>
      <div className="absolute right-4 bottom-3">
        <ZoneLabel>Path</ZoneLabel>
      </div>

      <div className="flex flex-col gap-2">
        {mainRun.map((booth) => (
          <BoothButton
            key={booth.id}
            booth={booth}
            isSelected={selectedId === booth.id}
            onSelect={onSelect}
          />
        ))}
        {lastBooth && (
          <div className="mt-3">
            <BoothButton
              booth={lastBooth}
              isSelected={selectedId === lastBooth.id}
              onSelect={onSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Premium Ground — corporate booths (P1–P2) run along the church wall at
 * the top, a path runs down the right side, and standard booths (A1–A8)
 * line up along the bottom next to the gate. Matches the organizer's
 * hand-drawn layout.
 */
function PremiumFloorPlan({ booths, selectedId, onSelect }: LayoutProps) {
  const corporate = booths
    .filter((b) => b.type === "CORPORATE")
    .sort((a, b) => a.position - b.position);
  const standard = booths
    .filter((b) => b.type === "STANDARD")
    .sort((a, b) => a.position - b.position);

  return (
    <div
      className="rounded-lg border-2 border-dashed p-5"
      style={floorPlanBorder}
    >
      <div className="flex justify-center pb-5">
        <ZoneLabel>Church wall</ZoneLabel>
      </div>

      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-6">
          {corporate.map((booth) => (
            <BoothButton
              key={booth.id}
              booth={booth}
              isSelected={selectedId === booth.id}
              onSelect={onSelect}
            />
          ))}
        </div>

        <div className="self-stretch pt-1">
          <ZoneLabel>Path</ZoneLabel>
        </div>
      </div>

      <div
        className="mt-8 flex flex-wrap items-center gap-3 border-t pt-4"
        style={{
          borderColor:
            "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
        }}
      >
        <ZoneLabel>Gate</ZoneLabel>
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
  );
}

/** Fallback for a location whose floor layout hasn't been sketched yet. */
function GenericFloorPlan({ booths, selectedId, onSelect }: LayoutProps) {
  const corporate = booths
    .filter((b) => b.type === "CORPORATE")
    .sort((a, b) => a.position - b.position);
  const standard = booths
    .filter((b) => b.type === "STANDARD")
    .sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col gap-4">
      {corporate.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {corporate.map((booth) => (
            <BoothButton
              key={booth.id}
              booth={booth}
              isSelected={selectedId === booth.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
      {standard.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {standard.map((booth) => (
            <BoothButton
              key={booth.id}
              booth={booth}
              isSelected={selectedId === booth.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
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
    <div className="flex flex-col gap-6">
      <div>
        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--brand-primary)" }}
        >
          {locationName}
        </h2>
        <div
          className="mt-1 flex gap-4 text-xs"
          style={{ color: "var(--brand-muted)" }}
        >
          <LegendSwatch className="booth-available" label="Available" />
          <LegendSwatch className="booth-corporate" label="Corporate" />
          <LegendSwatch className="booth-held" label="Held" />
          <LegendSwatch className="booth-booked" label="Booked" />
        </div>
      </div>

      {locationSlug === "arena" ? (
        <ArenaFloorPlan {...layoutProps} />
      ) : locationSlug === "premium" ? (
        <PremiumFloorPlan {...layoutProps} />
      ) : (
        <GenericFloorPlan {...layoutProps} />
      )}

      {selected && selected.status === "AVAILABLE" ? (
        <BoothBookingForm
          key={selected.id}
          booth={selected}
          onDone={() => setSelected(null)}
        />
      ) : (
        <div className="text-sm" style={{ color: "var(--brand-muted)" }}>
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
