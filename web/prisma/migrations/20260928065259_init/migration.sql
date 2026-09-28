-- CreateEnum
CREATE TYPE "BoothType" AS ENUM ('STANDARD', 'CORPORATE');

-- CreateEnum
CREATE TYPE "BoothStatus" AS ENUM ('AVAILABLE', 'HELD', 'BOOKED');

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booth" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "BoothType" NOT NULL DEFAULT 'STANDARD',
    "status" "BoothStatus" NOT NULL DEFAULT 'AVAILABLE',
    "heldUntil" TIMESTAMP(3),
    "position" INTEGER NOT NULL,
    "locationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_slug_key" ON "Location"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Booth_code_key" ON "Booth"("code");

-- CreateIndex
CREATE INDEX "Booth_status_heldUntil_idx" ON "Booth"("status", "heldUntil");

-- CreateIndex
CREATE UNIQUE INDEX "Booth_locationId_position_key" ON "Booth"("locationId", "position");

-- AddForeignKey
ALTER TABLE "Booth" ADD CONSTRAINT "Booth_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
