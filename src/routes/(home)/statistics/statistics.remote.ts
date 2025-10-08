import { query } from "$app/server";
import * as v from "valibot"
import { getRecentActivity } from "./statistics";

export const getRecentActivityPageQuery = query(v.pipe(v.number(), v.integer(), v.gtValue(-1)), async (page) => {
    return await getRecentActivity(page)
})