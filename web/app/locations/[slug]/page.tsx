import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BoothMap from "@/components/BoothMap";

// Booth availability changes constantly, so this can't be a build-time
// static page — same reasoning as app/booths/page.tsx.
export const dynamic = "force-dynamic";

export default async function LocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const location = await prisma.location.findUnique({
    where: { slug },
    include: { booths: true },
  });

  if (!location) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link
        href="/"
        className="text-sm"
        style={{ color: "var(--brand-muted)" }}
      >
        ← All locations
      </Link>
      <div className="mt-4">
        <BoothMap
          locationName={location.name}
          locationSlug={location.slug}
          booths={location.booths}
        />
      </div>
    </main>
  );
}
