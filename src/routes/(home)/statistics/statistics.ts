import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema"
import { eq, sql } from "drizzle-orm";

export async function getAllUserPoints() {
    return await db.select({
        user: table.user,
        points: sql<number>`SUM(${table.ledgerEntry.amount}) AS points`
    }).from(table.ledgerEntry)
        .innerJoin(table.user, sql`${table.user.id} = ${table.ledgerEntry.userId}`)
        .groupBy(table.ledgerEntry.userId)
        .orderBy(sql`points DESC`)
}

export async function getRecentActivity() {
    const ledgerEntries = await db.query.ledgerEntry.findMany({
        limit: 10,
        orderBy: table.ledgerEntry.createdAt,
        with: {
            user: true
        }
    })

    return await Promise.all(ledgerEntries.map(async (e) => {
        switch (e.type) {
            case "bounty_escrow":
            case "bounty_reward":
            case "bounty_refund":
                return {
                    ...e,
                    bounty: await db.query.bounty.findFirst({
                        where: eq(table.bounty.id, e.reference!),
                        with: {
                            creator: true
                        }
                    })
                }
            case "offer_escrow":
            case "offer_payout":
                return {
                    ...e,
                    offer: await db.query.offer.findFirst({
                        where: eq(table.offer.id, e.reference!),
                        with: {
                            buyer: true,
                            poster: true
                        }
                    })
                }
            default:
                return e
        }
    }))
}