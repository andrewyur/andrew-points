import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { createTransaction } from "$lib/server/points";
import { gt } from "drizzle-orm";

async function checkBountyExpirations() {
    db.transaction(async (tx) => {
        const bounties = await tx.update(table.bounty).set({
            completed: true
        }).where(gt(table.bounty.deadline, new Date())).returning()

        for (const bounty of bounties) {
            await createTransaction(bounty.creatorId, bounty.reward, { type: "bounty_refund", reference: bounty.id })
        }
    })

}

async function checkEarnSessionExpirations() {
    db.delete(table.earnSession).where(gt(table.earnSession.expiresAt, new Date()))
}

export function checkExpirations() {
    checkBountyExpirations()
    checkEarnSessionExpirations()
}