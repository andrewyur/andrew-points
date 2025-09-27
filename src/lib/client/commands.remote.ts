import { query } from "$app/server";
import * as v from "valibot";
import * as table from "$lib/server/db/schema"
import { db } from "$lib/server/db";

export const queryUsers = query(async () => {
    return await db.query.user.findMany()
})