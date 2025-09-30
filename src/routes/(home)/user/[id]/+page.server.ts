import { getUserFromId } from "$lib/server/user";
import { error } from "@sveltejs/kit";
import { getUserLedger, getUserPoints } from "$lib/server/points";

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