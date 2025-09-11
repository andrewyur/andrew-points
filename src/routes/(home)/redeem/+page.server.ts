import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { notifyAdmins, publicNotification } from "$lib/server/notifications";
import { userPointsAddSubtract } from "$lib/server/points";

export type Redeemable = {
    name: string,
    description: string,
    redeemMessage: string
    cost: number,
}

const redeemableItems: Redeemable[] = [
    {
        name: "Homecooked Dinner with Andrew",
        description: "Come over to Andrew's apartment and he will cook you a romantic dinner.",
        redeemMessage: "Andrew will be reaching out to you to schedule a date shortly.",
        cost: 300,
    },
    {
        name: "Mystery Gift",
        description: "Miles will procure you a mystery gift",
        redeemMessage: "Miles will be contacting you shortly",
        cost: 100,
    },
    {
        name: "Night with Deriso",
        description: "Switch rooms with Miles for a night, sleep in room 8 with Deriso",
        redeemMessage: "Miles will be contacting you shortly.",
        cost: 150,
    },
]

export const load: PageServerLoad = (event) => {
    if (!event.locals.user) {
        return redirect(302, "/login");
    }

    return { redeemableItems, user: event.locals.user }
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
            return fail(400, { error: "No redeemable items exist with the provided name" })
        }

        if (locals.user.points < redeemedItem.cost) {
            return fail(400, { error: "You do not have enough points to redeem this item" })
        }

        if (redeemedItem) {
            userPointsAddSubtract(locals.user.id, -redeemedItem.cost);
            publicNotification(`${locals.user.username} redeemed ${redeemedItem.cost} for ${redeemedItem.name}!`);
            notifyAdmins(`User ${locals.user.username} redeemed ${redeemedItem.name}. Contact them with details soon`);
        }
    }
}
