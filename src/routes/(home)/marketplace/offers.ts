import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema"
import { createTransaction } from "$lib/server/points";
import { and, eq, isNull, not } from "drizzle-orm";

// partitions public and private
export async function getOffers(id: string) {

    const [privateOffers, publicOffers] = await Promise.all([
        db.query.offer.findMany({
            where: and(eq(table.offer.state, "active"), eq(table.offer.visibleTo, id)),
            with: {
                buyer: true,
                poster: true
            },
        }),
        db.query.offer.findMany({
            where: and(eq(table.offer.state, "active"), isNull(table.offer.visibleTo)),
            with: {
                buyer: true,
                poster: true
            },
        }),
    ])

    return { privateOffers, publicOffers }
}

export async function getOfferById(id: string) {
    return await db.query.offer.findFirst({
        where: eq(table.offer.id, id)
    })
}

export async function createOffer(posterId: string, cost: number, title: string, description: string, visibleTo: string | null) {
    await db.insert(table.offer).values({
        posterId, cost, title, description, visibleTo
    })
}

export async function deleteOffer(id: string) {
    await db.delete(table.offer).where(eq(table.offer.id, id))
}

export async function buyOffer(userId: string, buyerId: string) {
    await db.transaction(async (tx) => {
        const [offer] = await tx.update(table.offer).set({
            state: "pending",
            buyerId
        }).where(eq(table.offer.id, userId)).returning()

        await createTransaction(buyerId, -offer.cost, {
            type: "offer_escrow",
            reference: offer.id
        }, tx)
    })

}