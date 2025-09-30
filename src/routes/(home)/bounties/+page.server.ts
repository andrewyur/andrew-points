import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getBounties } from "./bounties";
import { extractUser } from "$lib/server/user";

export const load: PageServerLoad = async () => {
    const user = extractUser();

    return {
        bounties: await getBounties(user.id),
    }
}

