import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { notifyAdmins, publicNotification } from "$lib/server/notifications";
import { getUserPoints, createTransaction } from "$lib/server/points";

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
    {
        name: "Wear Andrew's Clothes for the day",
        description: "Pick an outfit for from andrew's closet to wear for the day",
        redeemMessage: "Andrew will be reaching out to you shortly",
        cost: 200
    },
    {
        name: "Best Friend Photoshoot & Instagram Post",
        description: "Have a best friend themed photoshoot with andrew, and get a post announcing you are andrew's new best friend on instagram",
        redeemMessage: "Andrew will be reaching out to you shortly. Think of some ideas for pictures",
        cost: 500
    }
]

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
                type: "redeemed_reward",
                note: redeemedItem.name
            })
            publicNotification(`${locals.user.username} redeemed ${redeemedItem.cost} for ${redeemedItem.name}!`);
            notifyAdmins(`User ${locals.user.username} redeemed ${redeemedItem.name}. Contact them with details soon`);
        }
    }
}
