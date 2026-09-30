import { prisma } from "@/lib/prisma";
import { releaseExpiredHolds } from "@/lib/booths";
import BoothMap from "@/components/BoothMap";

export const metadata = {
  title: "Book a Booth — St. Joseph Mukasa Business Expo 2026",
};

// Booth availability changes constantly (holds expire, organizers
// confirm/release bookings) and this page also writes on every load via
// releaseExpiredHolds() — it must never be statically pre-rendered at build
// time, both because a build-time DB connection isn't available on Vercel
// and because a static snapshot would show stale availability in production.
export const dynamic = "force-dynamic";

// Display order for the expo floor plans — not alphabetical, since we want
// Premium Ground shown above Arena. Any location whose slug isn't listed
// here (e.g. a future one, before its layout is confirmed) is appended
// after these, in whatever order Prisma returns it.
const LOCATION_ORDER = ["premium", "arena"];

export default async function BoothsPage() {
  await releaseExpiredHolds();

  const locations = await prisma.location.findMany({
    include: { booths: true },
  });

  locations.sort((a, b) => {
    const aIndex = LOCATION_ORDER.indexOf(a.slug);
    const bIndex = LOCATION_ORDER.indexOf(b.slug);
    return (
      (aIndex === -1 ? LOCATION_ORDER.length : aIndex) -
      (bIndex === -1 ? LOCATION_ORDER.length : bIndex)
    );
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold sm:text-3xl"
          style={{ color: "var(--brand-primary)" }}
        >
          Book Your Booth
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--brand-muted)" }}>
          Click an available booth below to select it, then confirm your package
          with the organizing team.
        </p>
      </div>

      {locations.length === 0 && (
        <p className="text-sm" style={{ color: "var(--brand-muted)" }}>
          No locations seeded yet — run <code>npm run db:seed</code>.
        </p>
      )}

      <div className="flex flex-col gap-12">
        {locations.map((location) => (
          <section
            key={location.id}
            id={location.slug}
            className="scroll-mt-20"
          >
            <BoothMap
              locationName={location.name}
              locationSlug={location.slug}
              booths={location.booths}
            />
          </section>
        ))}
      </div>
    </main>
  );
}
