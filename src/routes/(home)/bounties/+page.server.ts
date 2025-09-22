import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createBountySubmission, getBounties, createBounty, deleteBountySubmission, getBountyById, getBountySubmissions, getSubmissionById } from "./bounties";
import { validateDate, validateFile, validatePoints, validateString } from "$lib/server/validate";
import { getUserById } from "$lib/server/user";
import { getUserPoints } from "$lib/server/points";

export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) {
        redirect(302, '/login')
    }

    return {
        bounties: await getBounties(event.locals.user.id),
    }
}

export const actions: Actions = {
    create: async ({ request, locals }) => {
        if (!locals.user) {
            redirect(302, '/login')
        }

        const formData = await request.formData()

        try {
            const title = validateString(formData.get("title"))
            const fulfillmentCriteria = validateString(formData.get("fulfillmentCriteria"))
            const reward = validatePoints(formData.get("reward"))
            const deadline = validateDate(formData.get("deadline"))

            const user = await getUserById(locals.user.id)

            if (!user) throw Error("User does not exist");

            const userPoints = await getUserPoints(user.id);

            if (userPoints < reward) throw Error("User does not have enough points to create a bounty")

            await createBounty(locals.user.id, title, fulfillmentCriteria, deadline, reward)
        } catch (e) {
            return fail(400, `Error creating bounty: ${(e as Error).message ?? "unknown reason"}`)
        }
    },
    submit: async ({ locals, request }) => {
        if (!locals.user) {
            redirect(302, '/login')
        }

        locals.user

        const formData = await request.formData()

        try {
            const media = validateFile(formData.get("media"))
            const bountyId = validateString(formData.get("bounty"))

            const bounty = await getBountyById(bountyId)

            if (!bounty) throw Error("Bounty with id does not exist");
            if (bounty.completed) throw Error("Bounty has already been completed");

            const bountySubmissions = await getBountySubmissions(bountyId)

            const userId = locals.user.id
            if (bountySubmissions.some(s => s.submitterId === userId)) throw Error("User has already created a submission for this bounty");

            await createBountySubmission(locals.user.id, bountyId, media)
        } catch (e) {
            return fail(400, `Creating submission failed: ${(e as Error).message ?? "unknown reason"}`)
        }
    },
    deleteSubmission: async ({ locals, request }) => {
        if (!locals.user) {
            redirect(302, '/login')
        }

        const formData = await request.formData()

        try {
            const submissionId = validateString(formData.get("id"))

            const submission = await getSubmissionById(submissionId);

            if (!submission) throw Error("No bounty submission with that id")

            const bounty = (await getBountyById(submission.bountyId))!;

            if (bounty.completed) throw Error("Bounty has been completed");
            if (locals.user.id !== submission.submitterId) throw Error("Submission does not belong to current user");
            if (bounty.fulfilledBy !== null) throw Error("Bounty has already been fulfilled");

            await deleteBountySubmission(submissionId)
        } catch (e) {
            return fail(400, `error deleting submission: ${(e as Error).message ?? "unknown reason"}`)
        }
    }
}