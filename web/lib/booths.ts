import { prisma } from "@/lib/prisma";

/**
 * Booths held for longer than the hold window revert to AVAILABLE.
 * There's no background job for this yet — instead, every page that reads
 * booth data calls this first, so an expired hold is cleaned up lazily on
 * the next view rather than needing a cron/worker.
 */
export async function releaseExpiredHolds() {
  await prisma.booth.updateMany({
    where: { status: "HELD", heldUntil: { lt: new Date() } },
    data: {
      status: "AVAILABLE",
      heldUntil: null,
      holderName: null,
      holderPhone: null,
      holderBusiness: null,
    },
  });
}
