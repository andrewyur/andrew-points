import { redirect } from "@sveltejs/kit";
import { getEarnSessionFromUser } from "../earnSession";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    const session = await getEarnSessionFromUser(locals.user?.id!)

    if (!session) {
        redirect(302, "/earn")
    }

    return {
        session
    }
}