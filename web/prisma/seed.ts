import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, BoothType } from "@/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const arena = await prisma.location.upsert({
    where: { slug: "arena" },
    update: {},
    create: { slug: "arena", name: "Arena" },
  });

  const premium = await prisma.location.upsert({
    where: { slug: "premium" },
    update: {},
    create: { slug: "premium", name: "Premium Ground" },
  });

  // Arena: single column, B1–B8, standard booths.
  // `code` is globally unique (not just per-location), so it's the upsert key.
  for (let i = 1; i <= 8; i++) {
    await prisma.booth.upsert({
      where: { code: `B${i}` },
      update: {},
      create: {
        code: `B${i}`,
        type: BoothType.STANDARD,
        position: i,
        locationId: arena.id,
      },
    });
  }

  // Premium: P1–P2 corporate booths, A1–A8 standard booths.
  for (let i = 1; i <= 2; i++) {
    await prisma.booth.upsert({
      where: { code: `P${i}` },
      update: {},
      create: {
        code: `P${i}`,
        type: BoothType.CORPORATE,
        position: i,
        locationId: premium.id,
      },
    });
  }

  for (let i = 1; i <= 8; i++) {
    await prisma.booth.upsert({
      where: { code: `A${i}` },
      update: {},
      create: {
        code: `A${i}`,
        type: BoothType.STANDARD,
        position: i + 2, // after P1, P2 in layout order
        locationId: premium.id,
      },
    });
  }
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
