import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema"
import type { ExpandedLedgerEntry } from "$lib/server/points";
import { sql } from "drizzle-orm";

export async function getAllUserPoints() {
    return await db.select({
        user: table.user,
        points: sql<number>`SUM(${table.ledgerEntry.amount}) AS points`
    }).from(table.ledgerEntry)
        .innerJoin(table.user, sql`${table.user.id} = ${table.ledgerEntry.userId}`)
        .groupBy(table.ledgerEntry.userId)
        .orderBy(sql`points DESC`)
}

export async function getRecentActivity(): Promise<ExpandedLedgerEntry[]> {
    return await db.query.ledgerEntry.findMany({
        limit: 10,
        orderBy: table.ledgerEntry.createdAt,
        with: {
            user: true,
            bounty: {
                with: {
                    creator: true
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