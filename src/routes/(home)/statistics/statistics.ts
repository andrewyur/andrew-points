import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema"
import type { ExpandedLedgerEntry } from "$lib/server/points";
import { desc, eq, sql } from "drizzle-orm";

export async function getAllUserPoints() {
    return await db.select({
        user: table.user,
        points: sql<number>`SUM(${table.ledgerEntry.amount}) AS points`
    }).from(table.ledgerEntry)
        .innerJoin(table.user, sql`${table.user.id} = ${table.ledgerEntry.userId}`)
        .groupBy(table.ledgerEntry.userId)
        .orderBy(desc(sql`points`))
}

export async function getRecentActivityPageAmount() {
    return Math.ceil((await db.query.ledgerEntry.findMany()).length / 10)
}

export async function getRecentActivity(page: number): Promise<ExpandedLedgerEntry[]> {
    return await db.query.ledgerEntry.findMany({
        limit: 10,
        offset: page * 10,
        orderBy: desc(table.ledgerEntry.createdAt),
        with: {
            user: true,
            bounty: {
                with: {
                    creator: true,
                    fulfiller: {
                        with: {
                            creator: true
                        }
                    }
                }
            },
            offer: {
                with: {
                    buyer: true,
                    poster: true
                }
            }
        }
    })
}

export async function getPageOfLegderEntry(ledgerEntryId: string) {
    const numbered = db.$with('numbered').as(db.select({
        id: table.ledgerEntry.id,
        position: sql<number>`ROW_NUMBER() OVER (ORDER BY ${table.ledgerEntry.createdAt} DESC)`.as('position')
    }).from(table.ledgerEntry))

    const [{ position }] = await db.with(numbered).select().from(numbered).where(eq(numbered.id, ledgerEntryId))

    return Math.ceil(position / 10) - 1
} 