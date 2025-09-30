import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema"
import { createTransaction } from "$lib/server/points";
import { and, eq } from "drizzle-orm";


export async function getTasks(userId: string, admin: boolean) {
    return {
        pendingOffers: await db.query.offer.findMany({
            where: and(eq(table.offer.buyerId, userId), eq(table.offer.state, "pending")),
            with: {
                buyer: true,
                poster: true
            }
        }),
        disputedOffers: admin ? await db.query.offer.findMany({
            where: eq(table.offer.state, "disputed"),
            with: {
                buyer: true,
                poster: true
            }
        }) : null,
        bountySubmissions: admin ? await db.query.bountySubmission.findMany({
            where: eq(table.bountySubmission.state, 'pending'),
            with: {
                bounty: true,
                creator: true,
                media: true
            }
        }) : null
    }
}

export async function confirmOffer(offerId: string) {
    await db.transaction(async (tx) => {
        const [offer] = await tx.update(table.offer).set({
            state: "completed"
        }).where(eq(table.offer.id, offerId)).returning()
        await createTransaction(offer.posterId, offer.cost, { type: "offer_payout", offerId: offer.id }, tx)
    })
}

export async function disputeOffer(offerId: string) {
    await db.update(table.offer).set({
        state: "disputed"
    }).where(eq(table.offer.id, offerId))
}

export async function refundOffer(offerId: string) {
    await db.transaction(async (tx) => {
        const [offer] = await tx.update(table.offer).set({
            state: "completed"
        }).where(eq(table.offer.id, offerId)).returning()
        await createTransaction(offer.buyerId!, offer.cost, { type: "offer_refund", offerId: offer.id }, tx)
    })
}

export async function acceptSubmission(submissionId: string) {
    await db.transaction(async (tx) => {
        const [submission] = await tx.update(table.bountySubmission).set({
            state: "accepted"
        }).where(eq(table.bountySubmission.id, submissionId)).returning()
        const [bounty] = await tx.update(table.bounty).set({
            completed: true,
            fulfilledBy: submissionId,
        }).where(eq(table.bounty.id, submission.bountyId)).returning()
        await createTransaction(submission.submitterId, bounty.reward, { type: "bounty_reward", bountyId: bounty.id }, tx)
    })
}

export async function rejectSubmission(submissionId: string) {
    await db.update(table.bountySubmission).set({
        state: "rejected"
    }).where(eq(table.bountySubmission.id, submissionId))
}