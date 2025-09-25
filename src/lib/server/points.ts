import { db, type DatabaseTransactionClient } from "./db";
import * as table from '$lib/server/db/schema';
import { eq, sql } from "drizzle-orm";


export type Context = {
    type: "bounty_escrow" | "bounty_reward" | "bounty_refund",
    bountyId: string
} | {
    type: "offer_escrow" | "offer_payout"
    offerId: string
} | {
    type: "admin" | `redeemed_reward#${string}` | `earn_payout#${string}`
}

// const transactionMessages = new Map<TransactionType, string>([
//     ["admin", "Admin created/removed"],
//     ["bounty_escrow", "Bounty reward held in escrow"],
//     ["bounty_reward", "Bounty reward awarded"],
//     ["bounty_refund", "Bounty refunded after expiration"],
//     ["offer_escrow", "Offer payment held in escrow"],
//     ["offer_payout", "Offer payment recieved from purchase"],
//     ["redeemed_reward", "Points redeemed for a reward"],
//     ["earn_payout_captcha", "Points earned from completing captchas"]
// ])


export async function createTransaction(userId: string, amount: number, context: Context, client?: DatabaseTransactionClient): Promise<void> {
    await (client ?? db).insert(table.ledgerEntry).values({
        userId,
        amount,
        type: context.type,
        bountyId: "bountyId" in context ? context.bountyId : undefined,
        offerId: "offerId" in context ? context.offerId : undefined,
    })
}

export async function getUserPoints(userId: string): Promise<number> {
    const [row] = await db
        .select({
            balance: sql<number>`COALESCE(SUM(${table.ledgerEntry.amount}), 0)`,
        })
        .from(table.ledgerEntry)
        .where(eq(table.ledgerEntry.userId, userId));

    return row?.balance ?? 0;
}