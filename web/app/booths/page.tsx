import { prisma } from "@/lib/prisma";
import { releaseExpiredHolds } from "@/lib/booths";
import BoothMap from "@/components/BoothMap";

export const metadata = {
  title: "Book a Booth — St. Joseph Mukasa Business Expo 2026",
};

export default async function BoothsPage() {
  await releaseExpiredHolds();

  const locations = await prisma.location.findMany({
    include: { booths: true },
    orderBy: { name: "asc" },
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
