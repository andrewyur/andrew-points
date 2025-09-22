import { db } from "./db";
import * as table from '$lib/server/db/schema';
import { eq, sql } from "drizzle-orm";

export type Context = {
    type: "admin_created" | "admin_removed"
    note?: string
} | {
    type: "bounty_escrow" | "bounty_reward"
    reference: string
} | {
    type: "redeemed_reward"
    note: string
} | {
    type: "offer_escrow" | "offer_payout"
    reference: string
}

export async function createTransaction(userId: string, amount: number, context: Context, client?: Parameters<Parameters<typeof db.transaction>[0]>[0]): Promise<void> {
    await (client ?? db).insert(table.ledgerEntry).values({
        amount,
        userId,
        type: context.type,
        reference: "reference" in context ? context?.reference : undefined,
        note: "note" in context ? context?.note : undefined,
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