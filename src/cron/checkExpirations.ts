import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { gt } from "drizzle-orm";

export async function checkExpirations() {
    await db.update(table.bounty).set({
        completed: true
    }).where(gt(table.bounty.deadline, new Date()))
}