import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // process.env rather than env(): `prisma generate` runs during the Docker
    // build (postinstall) where DATABASE_URL isn't set, and env() would throw.
    url: process.env.DATABASE_URL ?? "",
  },
});
