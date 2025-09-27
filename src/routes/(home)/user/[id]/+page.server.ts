import { getUserFromId } from "$lib/server/user";
import { error, fail, type Actions } from "@sveltejs/kit";
import { createTransaction, getUserLedger, getUserPoints } from "$lib/server/points";
import * as v from "valibot";

export async function load({ params }) {
    const otherUser = await getUserFromId(params.id)

    if (!otherUser) {
        throw error(404, 'User Not found');
    }

    return {
        otherUser,
        otherUserPoints: await getUserPoints(otherUser.id),
        activity: await getUserLedger(params.id),
    }
}

const adjustUserPoints = v.strictObject({
    user: v.pipe(v.string(), v.nonEmpty()),
    points: v.pipe(v.string(), v.nonEmpty(), v.transform(Number), v.integer()),
    message: v.optional(v.string())
});

export const actions: Actions = {
    default: async (event) => {
        const formData = await event.request.formData();
        const data = Object.fromEntries(formData.entries())
        try {
            const { user, points, message } = v.parse(adjustUserPoints, data);

            await createTransaction(user, points, { type: 'admin', message });
        } catch (e) {
            return fail(400, `Could not edit user points: ${(e as Error).message ?? "Unknown reason"}`)
        }
    }
}