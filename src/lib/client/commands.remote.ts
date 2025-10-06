import { query } from "$app/server";
import { db } from "$lib/server/db";
import { getUserPoints } from "$lib/server/points";
import * as v from "valibot"

export const queryUsers = query(async () => {
    return await db.query.user.findMany()
})

export const queryUserPoints = query(v.pipe(v.string(), v.uuid()), async (userId) => {
    return await getUserPoints(userId)
})