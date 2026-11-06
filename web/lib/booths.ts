import { prisma } from "@/lib/prisma";
import { queueBoothReleasedEmail } from "@/lib/mailer";

/**
 * Booths held for longer than the hold window revert to AVAILABLE.
 * There's no background job for this yet — instead, every page that reads
 * booth data calls this first, so an expired hold is cleaned up lazily on
 * the next view rather than needing a cron/worker. Each customer whose hold
 * lapses gets a "released" email.
 */
export async function releaseExpiredHolds() {
  const expired = await prisma.booth.findMany({
    where: { status: "HELD", heldUntil: { lt: new Date() } },
  });

  for (const booth of expired) {
    // Per-booth conditional update: if another request (or an admin confirm)
    // got there first, count is 0 and no duplicate email is sent.
    const { count } = await prisma.booth.updateMany({
      where: { id: booth.id, status: "HELD", heldUntil: { lt: new Date() } },
      data: {
        status: "AVAILABLE",
        heldUntil: null,
        holderName: null,
        holderPhone: null,
        holderEmail: null,
        holderBusiness: null,
      },
    });
    if (count === 1) queueBoothReleasedEmail(booth, "expired");
  }
}