import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, BoothType } from "@/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// 20 + 10 + 10 + 10 + 10 + 3 — matches SECTIONS in BoothMap.tsx
const BOOTH_COUNT = 63;

async function main() {
  // Retire the old two-area setup (booths cascade-delete with their location).
  await prisma.location.deleteMany({
    where: { slug: { in: ["arena", "premium"] } },
  });

  const parking = await prisma.location.upsert({
    where: { slug: "parking" },
    update: { name: "Parking Area" },
    create: { slug: "parking", name: "Parking Area" },
  });

  // All booths are ordinary. `code` is globally unique, so it's the upsert key;
  // `position` drives placement on the map.
  for (let i = 1; i <= BOOTH_COUNT; i++) {
    await prisma.booth.upsert({
      where: { code: `B${i}` },
      update: { position: i, locationId: parking.id },
      create: {
        code: `B${i}`,
        type: BoothType.STANDARD,
        position: i,
        locationId: parking.id,
      },
    });
  }

  console.log(`Seeded "${parking.name}" with ${BOOTH_COUNT} booths.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });