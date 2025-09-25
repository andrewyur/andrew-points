import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getUserPoints, createTransaction } from "$lib/server/points";
import { redeemableItems } from "./redeemables";

export const load: PageServerLoad = () => {
    return { redeemableItems }
}

export const actions: Actions = {
    default: async ({ locals, request }) => {
        if (!locals.user) {
            return redirect(302, "/login");
        }

        const formData = await request.formData()
        const redeemedName = formData.get('redeemable_name') as string;
        const redeemedItem = redeemableItems.find((r) => r.name === redeemedName)

        if (!redeemedItem) {
            return fail(400, "No redeemable items exist with the provided name")
        }

        const userPoints = await getUserPoints(locals.user.id)

        if (userPoints < redeemedItem.cost) {
            return fail(400, "You do not have enough points to redeem this item")
        }

        if (redeemedItem) {
            await createTransaction(locals.user.id, -redeemedItem.cost, {
                type: `redeemed_reward#${redeemedItem.id}`,
            })
        }
    }
}
