import { query, getRequestEvent, form } from "$app/server";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import * as table from "$lib/server/db/schema"
import * as v from "valibot"
import { createBounty, createBountySubmission, deleteBounty, deleteBountySubmission, getBountyById, getBountySubmissions, getSubmissionById } from "./bounties";
import { extractUser, getAdmins } from "$lib/server/user";
import { getUserPoints } from "$lib/server/points";
import { discordAnnouncement } from "$lib/server/discord";
import { queryUserPoints } from "$lib/client/commands.remote";
import { createNotification } from "$lib/server/notifications";

export const fileHashExists = query(v.string(), async (hash: string) => {
    const existing = await db.query.media.findFirst({
        where: eq(table.media.hash, hash)
    })
    return existing !== undefined
})


export const deleteSubmissionForm = form(v.object({
    submissionId: v.pipe(v.string(), v.uuid())
}), async ({ submissionId }) => {
    try {
        const user = extractUser();

        const submission = await getSubmissionById(submissionId);

        if (!submission) throw Error("No bounty submission with that id")

        const bounty = await getBountyById(submission.bountyId);

        if (!bounty) throw Error("No bounty associated with submission")
        if (bounty.completed) throw Error("Bounty has been completed");
        if (user.id !== submission.submitterId) throw Error("Submission does not belong to current user");
        if (bounty.fulfilledBy !== null) throw Error("Bounty has already been fulfilled");

        await deleteBountySubmission(submission.id)
    } catch (e) {
        return { error: `Could not delete submission: ${(e as Error).message}` }
    }
})


export const createBountyForm = form(v.object({
    title: v.pipe(v.string(), v.nonEmpty(), v.maxLength(40)),
    fulfillmentCriteria: v.pipe(v.string(), v.nonEmpty()),
    reward: v.pipe(v.string(), v.nonEmpty(), v.transform(Number), v.integer()),
    deadline: v.pipe(v.string(), v.nonEmpty(), v.isoDate(), v.transform(s => new Date(s)), v.gtValue(new Date()))
}), async ({ title, fulfillmentCriteria, deadline, reward }) => {

    try {
        const user = extractUser()
        const userPoints = await getUserPoints(user.id);
        if (userPoints * 0.05 > reward) throw Error("Bounty reward must be at least 5% of the user's points")
        if (userPoints < reward) throw Error("User does not have enough points to create the bounty")

        const bounty = await createBounty(user.id, title, fulfillmentCriteria, deadline, reward)
        queryUserPoints(user.id).refresh()
        await discordAnnouncement({
            type: "bounty_placed",
            bountyId: bounty.id
        })
    } catch (e) {
        return { error: `Could not create the bounty: ${(e as Error).message}` }
    }
})


export const createSubmissionForm = form(v.object({
    media: v.file(),
    bountyId: v.pipe(v.string(), v.uuid())
}), async ({ media, bountyId }) => {
    try {
        const user = extractUser()
        const bounty = await getBountyById(bountyId)

        if (!bounty) throw Error("Bounty with id does not exist");
        if (bounty.completed) throw Error("Bounty has already been completed");

        const bountySubmissions = await getBountySubmissions(bountyId)

        if (bountySubmissions.some(s => s.submitterId === user.id)) throw Error("User has already created a submission for this bounty");

        const submission = await createBountySubmission(user.id, bountyId, media)
        discordAnnouncement({
            type: "bounty_submission_created",
            submissionId: submission.id
        });
        (await getAdmins()).forEach((a) => {
            createNotification(a.id, { type: "new_submission", bountyId: bounty.id })
        })
    } catch (e) {
        return { error: `Could not create Bounty submission: ${(e as Error).message}` }
    }
})

export const deleteBountyForm = form(v.object({
    bountyId: v.pipe(v.string(), v.uuid())
}), async ({ bountyId }) => {
    try {
        const user = extractUser();

        if (!user.admin) {
            throw Error("User is not an admin")
        }

        await deleteBounty(bountyId)
    } catch (e) {
        return { error: `Could not delete Bounty: ${(e as Error).message}` }
    }
})