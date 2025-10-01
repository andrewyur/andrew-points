import { error } from "@sveltejs/kit";
import { getBountyById } from "../../bounties";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
    const bounty = await getBountyById(params.id);

    if (!bounty) {
        error(404, "bounty not found")
    }

    return { bounty }
}