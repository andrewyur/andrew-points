import type { PageServerLoad } from "./$types";
import { redeemableItems } from "./redeemables";

export const load: PageServerLoad = () => {
    return { redeemableItems }
}
