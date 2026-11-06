"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const AUTO_REFRESH_MS = 30_000;

export default function AdminRefresh() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const refresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  // Stamp the time on mount and whenever a refresh finishes.
  useEffect(() => {
    if (!isPending) setUpdatedAt(new Date());
  }, [isPending]);

  // Auto-refresh while the tab is visible, and catch up when it becomes visible.
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const id = setInterval(tick, AUTO_REFRESH_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [refresh]);

  return (
    <div className="flex items-center gap-3">
      {updatedAt && (
        <span className="text-xs" style={{ color: "var(--brand-muted)" }}>
          Updated {updatedAt.toLocaleTimeString("en-KE")}
        </span>
      )}
      <button
        type="button"
        onClick={refresh}
        disabled={isPending}
        className="rounded border px-3 py-1.5 text-sm font-medium disabled:opacity-60"
        style={{
          borderColor: "var(--brand-muted)",
          color: "var(--brand-primary)",
        }}
      >
        {isPending ? "Refreshing…" : "Refresh"}
      </button>
    </div>
  );
}