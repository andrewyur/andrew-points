import { db, runTransaction } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { createNotification } from "$lib/server/notifications";
import { createTransaction } from "$lib/server/points";
import { lt } from "drizzle-orm";

async function checkBountyExpirations() {
    await runTransaction(async () => {
        const bounties = await db.update(table.bounty).set({
            completed: true
        }).where(lt(table.bounty.deadline, new Date())).returning()

        for (const bounty of bounties) {
            await createTransaction(bounty.creatorId, bounty.reward, { type: "bounty_refund", bountyId: bounty.id })
            await createNotification(bounty.creatorId, { type: "bounty_expired", bountyId: bounty.id })
        }

        db.insert(table.user).values({
            discordId: "testing",
            displayName: "testing",
            username: "testing"
        })

        throw Error("test")
    })

}

async function checkOfferExpirations() {
    await runTransaction(async () => {
        const offers = await db.update(table.offer).set({
            state: "completed"
        }).where(lt(table.offer.completeBy, new Date())).returning()

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