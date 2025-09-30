import { query } from "$app/server";
import { db } from "$lib/server/db";

export const queryUsers = query(async () => {
    return await db.query.user.findMany()
})