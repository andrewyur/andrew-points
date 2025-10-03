import { db } from "$lib/server/db";
import { desc, eq } from "drizzle-orm";
import * as table from "$lib/server/db/schema"

export async function getNotifications(userId: string) {
    return await db.query.notification.findMany({
        where: eq(table.notification.userId, userId),
        orderBy: desc(table.notification.createdAt),
    })
}
export async function removeNotification(id: string) {
    await db.delete(table.notification).where(eq(table.notification.id, id))
}