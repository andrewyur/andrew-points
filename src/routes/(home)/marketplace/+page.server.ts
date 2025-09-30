import type { PageServerLoad } from "./$types";
import { getOffers } from "./offers";

export const load: PageServerLoad = async ({ locals }) => {
    return {
        offers: await getOffers(locals.user?.id!)
    }
}