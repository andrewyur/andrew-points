import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema"
import { createTransaction } from "$lib/server/points";
import { eq, sql } from "drizzle-orm";

export async function createEarnSession(userId: string) {
    await db.insert(table.earnSession).values({
        userId,
        payout: 5,
        type: "captcha"
    })
}

export async function getEarnSessionFromUser(userId: string) {
    return await db.query.earnSession.findFirst({
        where: eq(table.earnSession.userId, userId)
    })
}

export async function completeEarnSessionFromUser(userId: string) {
    return await db.transaction(async (tx) => {
        const [session] = await tx.delete(table.earnSession).where(eq(table.earnSession.userId, userId)).returning()
        await createTransaction(userId, session.payout, { type: "earn_payout", note: session.type }, tx)
        return session
    })
}

export async function advanceEarnSession(userId: string) {
    return await db.update(table.earnSession).set({
        remaining: sql`${table.earnSession.remaining} - 1`
    }).where(eq(table.earnSession.userId, userId)).returning()
}