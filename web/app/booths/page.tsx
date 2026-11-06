import { prisma } from "@/lib/prisma";
import { releaseExpiredHolds } from "@/lib/booths";
import BoothMap from "@/components/BoothMap";

export const metadata = {
  title: "Book a Booth — St. Joseph Mukasa Business Expo 2026",
};

// Availability changes constantly and this page writes on every load via
// releaseExpiredHolds() — never statically pre-render it.
export const dynamic = "force-dynamic";

export default async function BoothsPage() {
  await releaseExpiredHolds();

  const location = await prisma.location.findUnique({
    where: { slug: "parking" },
    include: { booths: true },
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

      {location ? (
        <BoothMap locationName={location.name} booths={location.booths} />
      ) : (
        <p className="text-sm" style={{ color: "var(--brand-muted)" }}>
          No booths seeded yet — run <code>npm run db:seed</code>.
        </p>
      )}
    </main>
  );
}