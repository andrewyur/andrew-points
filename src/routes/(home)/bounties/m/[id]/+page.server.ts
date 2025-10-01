import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema"
import { eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
    const sumbission = await db.query.bountySubmission.findFirst({
        where: eq(table.bountySubmission.id, params.id),
    })

    if (!sumbission) {
        error(404, "No submission with that id");
    }

    redirect(308, `/bounties/b/${sumbission.bountyId}`)
}