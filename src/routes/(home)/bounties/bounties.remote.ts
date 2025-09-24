import { query } from "$app/server";
import { db } from "$lib/server/db";
import * as v from "valibot"

export const fileHashExists = query(v.string(), async (hash: string) => {
    const existing = await db.query.bountySubmission.findFirst({
        where: (b, { eq }) => eq(b.hash, hash)
    })
    return existing !== undefined
})