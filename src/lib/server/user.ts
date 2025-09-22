import { eq } from "drizzle-orm";
import { db } from "./db";
import * as table from "./db/schema"

export async function getUserById(id: string) {
    return await db.query.user.findFirst({
        where: eq(table.user.id, id)
    });
}