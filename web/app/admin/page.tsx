import { prisma } from "@/lib/prisma";
import { releaseExpiredHolds } from "@/lib/booths";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { logout } from "./actions";
import LoginForm from "./LoginForm";
import BoothRow from "./BoothRow";

export const metadata = {
  title: "Organizer Admin — St. Joseph Mukasa Business Expo 2026",
};

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return (
      <main className="mx-auto flex max-w-sm flex-col gap-4 px-6 py-16">
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--brand-primary)" }}
        >
          Organizer Login
        </h1>
        <LoginForm />
      </main>
    );
  }

  await releaseExpiredHolds();

  const locations = await prisma.location.findMany({
    include: { booths: { orderBy: { position: "asc" } } },
    orderBy: { name: "asc" },
  });

  const pendingBooths = locations.flatMap((location) =>
    location.booths
      .filter((booth) => booth.status !== "AVAILABLE")
      .map((booth) => ({ ...booth, locationName: location.name })),
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--brand-primary)" }}
          >
            Booth Requests
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--brand-muted)" }}>
            Confirm a hold once payment is received, or release it to open the
            booth back up.
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm underline underline-offset-2"
            style={{ color: "var(--brand-muted)" }}
          >
            Log out
          </button>
        </form>
      </div>

      {pendingBooths.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--brand-muted)" }}>
          No held or booked booths yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {pendingBooths.map((booth) => (
            <BoothRow key={booth.id} booth={booth} />
          ))}
        </div>
      )}
    </main>
  );
}
