"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { status: "idle" };

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state.status === "error" && (
        <p className="text-sm" style={{ color: "var(--brand-corporate)" }}>
          {state.message}
        </p>
      )}

      <label
        className="flex flex-col gap-1 text-sm font-medium"
        style={{ color: "var(--brand-muted)" }}
      >
        Password
        <input
          type="password"
          name="password"
          required
          autoFocus
          className="rounded border px-3 py-2 text-sm font-normal"
          style={{
            borderColor:
              "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
            color: "var(--foreground)",
          }}
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: "var(--brand-primary)" }}
      >
        {isPending ? "Checking…" : "Log In"}
      </button>
    </form>
  );
}
