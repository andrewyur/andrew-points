import { db, runTransaction } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { createNotification } from "$lib/server/notifications";
import { createTransaction } from "$lib/server/points";
import { and, eq, lt, not } from "drizzle-orm";

async function checkBountyExpirations() {
    await runTransaction(async () => {
        const bounties = await db.update(table.bounty).set({
            completed: true
        }).where(and(lt(table.bounty.deadline, new Date()), not(table.bounty.completed))).returning()

        for (const bounty of bounties) {
            await createTransaction(bounty.creatorId, bounty.reward, { type: "bounty_refund", bountyId: bounty.id })
            await createNotification(bounty.creatorId, { type: "bounty_expired", bountyId: bounty.id })
        }
    })

}

async function checkOfferExpirations() {
    await runTransaction(async () => {
        const offers = await db.update(table.offer).set({
            state: "completed"
        }).where(and(lt(table.offer.completeBy, new Date()), not(eq(table.offer.state, "completed")))).returning()

        for (const offer of offers) {
            await createTransaction(offer.posterId, offer.cost, { type: "offer_payout", offerId: offer.id })
            await createNotification(offer.posterId, { type: "offer_completed", offerId: offer.id })
        }
    })
}

async function checkEarnSessionExpirations() {
    await db.delete(table.earnSession).where(lt(table.earnSession.expiresAt, new Date()))
}

export async function runJobs() {
    await checkBountyExpirations()
    await checkOfferExpirations()
    await checkEarnSessionExpirations()
}