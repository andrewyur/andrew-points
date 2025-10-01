import { error } from "@sveltejs/kit";
import { getOfferById } from "../offers";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
    const offer = await getOfferById(params.id)

    if (!offer) {
        error(404, "Offer not found")
    }

    return { offer }
} 