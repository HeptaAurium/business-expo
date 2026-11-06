import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// The new "prisma-client" generator doesn't read DATABASE_URL from the
// schema on its own — it needs a driver adapter constructed with it
// explicitly.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Standard Next.js dev-mode singleton: without this, hot reload creates a
// fresh PrismaClient (and a fresh connection pool) on every file change.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
