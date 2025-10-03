import { getUserPoints } from "$lib/server/points";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { getNotifications } from "./notifications";

export const load: LayoutServerLoad = async ({ locals }) => {
    if (!locals.user) {
        redirect(302, '/login')
    }

    return {
        user: locals.user,
        userPoints: await getUserPoints(locals.user.id),
        notifications: await getNotifications(locals.user.id)
    }
}