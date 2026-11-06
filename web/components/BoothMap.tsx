"use client";

import { useActionState, useRef, useState } from "react";
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

/* ------------------------------------------------------------------ */
/* Draft Plan 1 — single ground, 63 booths                             */
/* Booths are assigned to sections by `position` order, so booth codes */
/* can be anything. Section order = booth order:                       */
/* left (20) → middle-1 (10) → middle-2 (10) → right-top (10)          */
/* → right-lower (10) → bottom (3)                                     */
/* ------------------------------------------------------------------ */

const BOOTH_SIZE = 30;
const GAP = 4;
const PITCH = BOOTH_SIZE + GAP;
const PLAN_W = 420;
const PLAN_H = 820;

// Orientation of the plan. Both true = church gate at the bottom right.
// Set either to false to undo that axis.
const FLIP_X = true;
const FLIP_Y = true;

type Section = {
  id: string;
  count: number;
  x: number;
  y: number;
  dir: "col" | "row";
};

const SECTIONS: Section[] = [
  { id: "left", count: 20, x: 8, y: 136, dir: "col" },
  { id: "middle-1", count: 10, x: 170, y: 40, dir: "col" },
  { id: "middle-2", count: 10, x: 204, y: 40, dir: "col" },
  { id: "right-top", count: 10, x: 372, y: 40, dir: "col" },
  { id: "right-lower", count: 10, x: 372, y: 426, dir: "col" },
  { id: "bottom", count: 3, x: 270, y: 772, dir: "row" },
];

type PlacedBooth = { booth: MapBooth; x: number; y: number };

function placeBooths(booths: MapBooth[]): PlacedBooth[] {
  const sorted = [...booths].sort((a, b) => a.position - b.position);
  const placed: PlacedBooth[] = [];
  let cursor = 0;

  for (const section of SECTIONS) {
    for (let i = 0; i < section.count; i++) {
      const booth = sorted[cursor++];
      if (!booth) return placed;
      const x = section.dir === "row" ? section.x + i * PITCH : section.x;
      const y = section.dir === "col" ? section.y + i * PITCH : section.y;
      placed.push({
        booth,
        x: FLIP_X ? PLAN_W - x - BOOTH_SIZE : x,
        y: FLIP_Y ? PLAN_H - y - BOOTH_SIZE : y,
      });
    }
  }
  return placed;
}

function PlanBackground() {
  const fx = (x: number) => (FLIP_X ? PLAN_W - x : x);
  const fy = (y: number) => (FLIP_Y ? PLAN_H - y + 10 : y);
  const anchor = FLIP_X ? "end" : "start";
  const roadStyle = {
    fill: "none",
    stroke: "var(--brand-primary)",
    strokeOpacity: 0.1,
    strokeWidth: 32,
    strokeLinecap: "butt" as const,
  };
  const labelStyle = {
    fill: "var(--brand-muted)",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
  };

  return (
    <svg
      viewBox={`0 0 ${PLAN_W} ${PLAN_H}`}
      width={PLAN_W}
      height={PLAN_H}
      className="absolute inset-0"
      aria-hidden="true"
    >
      <g
        transform={`translate(${FLIP_X ? PLAN_W : 0} ${FLIP_Y ? PLAN_H : 0}) scale(${FLIP_X ? -1 : 1} ${FLIP_Y ? -1 : 1})`}
      >
        {/* Main road ↔ church */}
        <path d="M210 820 C190 560, 110 260, 40 0" style={roadStyle} />
        {/* Branch to residentials */}
        <path d="M162 494 C250 485, 300 420, 420 401" style={roadStyle} />
      </g>

      <text x={fx(62)} y={fy(20)} textAnchor={anchor} style={labelStyle}>
        {FLIP_Y ? "↓" : "↑"} To Church
      </text>
      <text x={fx(236)} y={fy(812)} textAnchor={anchor} style={labelStyle}>
        {FLIP_Y ? "↑" : "↓"} To Main Road
      </text>
      <text x={fx(238)} y={fy(405)} textAnchor={anchor} style={labelStyle}>
        {FLIP_X ? "←" : ""} To Residentials {FLIP_X ? "" : "→"}
      </text>
    </svg>
  );
}

function BoothButton({
  booth,
  x,
  y,
  isSelected,
  onSelect,
}: {
  booth: MapBooth;
  x: number;
  y: number;
  isSelected: boolean;
  onSelect: (booth: MapBooth) => void;
}) {
  const isPickable = booth.status === "AVAILABLE";

  return (
    <button
      type="button"
      disabled={!isPickable}
      onClick={() => onSelect(booth)}
      className={`${boothClassName(booth.type, booth.status, isSelected)} absolute text-[10px]`}
      style={{ left: x, top: y, width: BOOTH_SIZE, height: BOOTH_SIZE }}
      aria-pressed={isSelected}
      title={`${booth.code} — ${booth.status.toLowerCase()}`}
    >
      {booth.code}
    </button>
  );
}

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const DEFAULT_ZOOM = 1.5;

function FloorPlan({
  booths,
  selectedId,
  onSelect,
}: {
  booths: MapBooth[];
  selectedId: string | null;
  onSelect: (booth: MapBooth) => void;
}) {
  const placed = placeBooths(booths);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const viewportRef = useRef<HTMLDivElement>(null);

  const clamp = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
  const fitWidth = () => {
    const w = viewportRef.current?.clientWidth;
    if (w) setZoom(clamp((w - 24) / PLAN_W));
  };

  const controlClass =
    "rounded border px-3 py-1.5 text-sm font-medium disabled:opacity-40";
  const controlStyle = {
    borderColor: "var(--brand-muted)",
    color: "var(--brand-primary)",
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end gap-2">
        <span className="mr-1 text-xs" style={{ color: "var(--brand-muted)" }}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          aria-label="Zoom out"
          className={controlClass}
          style={controlStyle}
          disabled={zoom <= MIN_ZOOM}
          onClick={() => setZoom((z) => clamp(z - ZOOM_STEP))}
        >
          −
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          className={controlClass}
          style={controlStyle}
          disabled={zoom >= MAX_ZOOM}
          onClick={() => setZoom((z) => clamp(z + ZOOM_STEP))}
        >
          +
        </button>
        <button
          type="button"
          className={controlClass}
          style={controlStyle}
          onClick={fitWidth}
        >
          Fit width
        </button>
        <button
          type="button"
          className={controlClass}
          style={controlStyle}
          onClick={() => setZoom(DEFAULT_ZOOM)}
        >
          Reset
        </button>
      </div>

      {/* Scrollable viewport: drag/scroll to pan when zoomed in */}
      <div
        ref={viewportRef}
        className="overflow-auto rounded-lg border-2 border-dashed p-3"
        style={{
          maxHeight: "80vh",
          borderColor:
            "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
        }}
      >
        <div
          className="relative mx-auto"
          style={{ width: PLAN_W * zoom, height: PLAN_H * zoom }}
        >
          <div
            className="absolute left-0 top-0"
            style={{
              width: PLAN_W,
              height: PLAN_H,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
          >
            <PlanBackground />
            {placed.map(({ booth, x, y }) => (
              <BoothButton
                key={booth.id}
                booth={booth}
                x={x}
                y={y}
                isSelected={selectedId === booth.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </div>
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

  const inputStyle = {
    borderColor: "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
    color: "var(--foreground)",
  };

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

      {[
        { label: "Full name", name: "name", type: "text" },
        { label: "Phone number", name: "phone", type: "tel" },
        { label: "Business name", name: "businessName", type: "text" },
      ].map((f) => (
        <label
          key={f.name}
          className="flex flex-col gap-1 text-xs font-medium"
          style={{ color: "var(--brand-muted)" }}
        >
          {f.label}
          <input
            name={f.name}
            type={f.type}
            required
            className="rounded border px-3 py-2 text-sm font-normal"
            style={inputStyle}
          />
        </label>
      ))}

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
  booths,
}: {
  locationName: string;
  booths: MapBooth[];
}) {
  const [selected, setSelected] = useState<MapBooth | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <h2
        className="text-lg font-semibold"
        style={{ color: "var(--brand-primary)" }}
      >
        {locationName}
      </h2>

      <FloorPlan
        booths={booths}
        selectedId={selected?.id ?? null}
        onSelect={setSelected}
      />

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