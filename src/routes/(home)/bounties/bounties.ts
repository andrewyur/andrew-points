import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema"
import { createTransaction } from "$lib/server/points";
import { and, eq, not } from "drizzle-orm";
import { createMedia, deleteMedia } from "$lib/server/media";

export async function getBounties(userId: string) {
    const bounties = await db.query.bounty.findMany({
        where: not(table.bounty.completed),
        with: {
            creator: true,
            submissions: {
                with: {
                    creator: true,
                    media: true
                },
            }
        }
    });

    const userSubmissions = await db
        .select({ id: table.bountySubmission.bountyId })
        .from(table.bountySubmission)
        .where(eq(table.bountySubmission.submitterId, userId))

    const submissionsSet = new Set(userSubmissions.map(s => s.id))

    return bounties.map(b => ({
        ...b,
        submitted: submissionsSet.has(b.id)
    }));
}

export async function getBountyById(bountyId: string) {
    return await db.query.bounty.findFirst({
        where: eq(table.bounty.id, bountyId)
    })
}

export async function getBountySubmissions(bountyId: string) {
    return await db.query.bountySubmission.findMany({
        where: eq(table.bountySubmission.bountyId, bountyId)
    })
}

export async function getSubmissionById(submissionId: string) {
    return await db.query.bountySubmission.findFirst({
        where: eq(table.bountySubmission.id, submissionId)
    })
}

export async function createBounty(creatorId: string, title: string, fulfillmentCriteria: string, deadline: Date, reward: number): Promise<table.Bounty> {
    return await db.transaction(async (tx) => {
        const [bounty] = await tx.insert(table.bounty).values({
            creatorId,
            title,
            fulfillmentCriteria,
            reward,
            deadline
        }).returning()

        await createTransaction(creatorId, -reward, {
            type: "bounty_escrow",
            bountyId: bounty.id
        }, tx)

        return bounty
    })
}


export async function createBountySubmission(submitterId: string, bountyId: string, file: File): Promise<table.BountySubmission> {
    return await db.transaction(async (tx) => {
        const media = await createMedia(file, tx)
        const [record] = await tx.insert(table.bountySubmission).values({
            bountyId,
            submitterId,
            mediaHash: media.hash,
        }).returning().catch(async (e) => {
            await deleteMedia(media.hash, tx)
            throw e
        });
        return record
    })
}

export async function deleteBountySubmission(submissionId: string) {
    db.transaction(async tx => {
        const [submission] = await tx
            .delete(table.bountySubmission)
            .where(eq(table.bountySubmission.id, submissionId))
            .returning()
        await deleteMedia(submission.mediaHash, tx)
    })
}