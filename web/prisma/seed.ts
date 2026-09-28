import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { BoothType, PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type BoothSeed = { code: string; type: BoothType };

const standard = (prefix: string, count: number): BoothSeed[] =>
  Array.from({ length: count }, (_, i) => ({
    code: `${prefix}${i + 1}`,
    type: BoothType.STANDARD,
  }));

const locations: { slug: string; name: string; booths: BoothSeed[] }[] = [
  {
    slug: "premium-ground",
    name: "Premium Ground",
    booths: [
      { code: "P1", type: BoothType.CORPORATE },
      { code: "P2", type: BoothType.CORPORATE },
      ...standard("A", 8),
    ],
  },
  {
    slug: "arena",
    name: "Arena",
    booths: standard("B", 8),
  },
];

async function main() {
  for (const loc of locations) {
    const location = await prisma.location.upsert({
      where: { slug: loc.slug },
      update: { name: loc.name },
      create: { slug: loc.slug, name: loc.name },
    });

    // Upsert by code so re-seeding never resets the status of live bookings.
    for (const [position, booth] of loc.booths.entries()) {
      await prisma.booth.upsert({
        where: { code: booth.code },
        update: { type: booth.type, position, locationId: location.id },
        create: { ...booth, position, locationId: location.id },
      });
    }

    console.log(`Seeded ${loc.name}: ${loc.booths.length} booths`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
