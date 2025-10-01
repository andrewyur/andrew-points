import { query, getRequestEvent, form } from "$app/server";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import * as table from "$lib/server/db/schema"
import * as v from "valibot"
import { createBounty, createBountySubmission, deleteBountySubmission, getBountyById, getBountySubmissions, getSubmissionById } from "./bounties";
import { extractUser } from "$lib/server/user";
import { getUserPoints } from "$lib/server/points";
import { discordAnnouncement } from "$lib/server/discord";

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
    title: v.pipe(v.string(), v.nonEmpty(), v.maxLength(80)),
    fulfillmentCriteria: v.pipe(v.string(), v.nonEmpty()),
    reward: v.pipe(v.string(), v.transform(Number), v.integer()),
    deadline: v.pipe(v.string(), v.isoDate(), v.transform(s => new Date(s)))
}), async ({ title, fulfillmentCriteria, deadline, reward }) => {
    try {
        const user = extractUser()
        const userPoints = await getUserPoints(user.id);
        if (userPoints * 0.05 > reward) throw Error("Bounty reward must be at least 5% of the user's points")
        if (userPoints < reward) throw Error("User does not have enough points to create the bounty")

        const bounty = await createBounty(user.id, title, fulfillmentCriteria, deadline, reward)
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
        })
    } catch (e) {
        return { error: `Could not create Bounty submission: ${(e as Error).message}` }
    }
})