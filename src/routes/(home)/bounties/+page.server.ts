import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createBounty, createBountySubmission, getBounties } from "./bounties";
import { getUserPoints } from "$lib/server/points";

export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) {
        redirect(302, '/login')
    }

    return {
        bounties: await getBounties(event.locals.user.id),
        user: event.locals.user,
        userPoints: await getUserPoints(event.locals.user.id)
    }
}

export const actions: Actions = {
    create: async ({ request, locals }) => {
        if (!locals.user) {
            redirect(302, '/login')
        }

        const formData = await request.formData()

        const title = formData.get("title")
        const completionCriteria = formData.get("completionCriteria")
        const reward = formData.get("reward")
        const deadline = formData.get("deadline")

        if (title === null || reward === null || deadline === null || completionCriteria == null) {
            return fail(400, "A required input was not provided")
        }

        try {
            await createBounty(locals.user.id, title as string, completionCriteria as string, new Date(deadline as string), Number(reward))
        } catch (e) {
            return fail(500, (e as Error).message)
        }
    },
    submit: async ({ locals, request }) => {
        if (!locals.user) {
            redirect(302, '/login')
        }

        const formData = await request.formData()

        const formFile = formData.get("media")
        const formBountyId = formData.get("bounty")

        if (formFile === null || formBountyId === null) {
            return fail(400, "an input was missing in form data")
        }

        const file = formFile as File;
        const bountyId = formBountyId as string;

        const bounties = await getBounties(locals.user.id)

        const bountyObj = bounties.find((x) => x.id === bountyId);

        if (!bountyObj) {
            return fail(400, "Bounty id does not exist")
        }

        if (bountyObj.submitted) {
            return fail(400, "User has already created a submission for this bounty")
        }

        try {
            await createBountySubmission(locals.user.id, bountyId, file)
        } catch (e) {
            console.log("form submission failed with error:", e)
            return fail(400, (e as Error).message ?? "Creating submission failed for unknown reason")
        }
    }
}