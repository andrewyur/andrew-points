import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { createNotification } from "$lib/server/notifications";
import { createTransaction } from "$lib/server/points";
import { gt } from "drizzle-orm";

async function checkBountyExpirations() {
    db.transaction(async (tx) => {
        const bounties = await tx.update(table.bounty).set({
            completed: true
        }).where(gt(table.bounty.deadline, new Date())).returning()

        for (const bounty of bounties) {
            await createTransaction(bounty.creatorId, bounty.reward, { type: "bounty_refund", bountyId: bounty.id })
            createNotification(bounty.creatorId, { type: "bounty_expired", bountyId: bounty.id })
        }
    })

}

async function checkOfferExpirations() {
    db.transaction(async (tx) => {
        const offers = await tx.update(table.offer).set({
            state: "completed"
        }).where(gt(table.offer.completeBy, new Date())).returning()

        for (const offer of offers) {
            await createTransaction(offer.posterId, offer.cost, { type: "offer_payout", offerId: offer.id }, tx)
            createNotification(offer.posterId, { type: "offer_completed", offerId: offer.id })
        }
    })
}

async function checkEarnSessionExpirations() {
    db.delete(table.earnSession).where(gt(table.earnSession.expiresAt, new Date()))
}

export function checkExpirations() {
    checkBountyExpirations()
    checkOfferExpirations()
    checkEarnSessionExpirations()
}