import { db } from "./db";
import * as table from '$lib/server/db/schema';
import { eq, sql } from "drizzle-orm";

export async function userPointsAddSubtract(userId: string, payload: number) {
    await db.update(table.user)
        .set({
            points: sql`${table.user.points} + ${payload}`
        })
        .where(eq(table.user.id, userId));
}