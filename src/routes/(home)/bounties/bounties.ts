import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema"
import { createTransaction, getUserPoints } from "$lib/server/points";
import { computeFileHash } from "$lib/hashMedia";
import { MEDIA_LOCATON } from "$env/static/private";
import fs from "fs/promises";
import path from "path";
import { proceessMedia } from "./fileProcessing";
import { and, eq, isNotNull, not } from "drizzle-orm";
import { Mutex } from 'async-mutex';

export async function getBounties(userId: string) {
    const bounties = await db.query.bounty.findMany({
        where: not(table.bounty.completed),
        with: {
            creator: true,
            submissions: {
                with: {
                    creator: true
                },
            }
        }
    });

    const submittedIds = new Set(await getSubmittedBounties(userId));

    return bounties.map(b => ({
        ...b,
        submitted: submittedIds.has(b.id)
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

async function getSubmittedBounties(userId: string) {
    return (await db
        .select({ id: table.bounty.id })
        .from(table.bounty)
        .leftJoin(
            table.bountySubmission,
            and(
                eq(table.bounty.id, table.bountySubmission.bountyId),
                eq(table.bountySubmission.submitterId, userId)
            )
        )
        .where(isNotNull(table.bountySubmission.hash)))
        .map((o) => o.id)
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
            reference: bounty.id
        }, tx)

        return bounty
    })
}

const submissionMutex = new Mutex();

export async function createBountySubmission(submitterId: string, bountyId: string, media: File): Promise<table.BountySubmission> {
    const hash = await computeFileHash(media);

    let existingHash = await db.query.bountySubmission.findFirst({
        where: (s, { eq }) => eq(s.hash, hash)
    })
    if (existingHash) throw Error("Media already exists in the database!");

    let fileType: "image" | "video";
    let finalExt: string;

    if (media.type.startsWith("image/")) {
        fileType = "image";
        finalExt = "webp";
    } else if (media.type.startsWith("video/")) {
        fileType = "video";
        finalExt = "mp4";
    } else {
        throw new Error("File is not a video or image");
    }

    const tempfileName = "tmp_processed"

    const tempFolder = path.join(MEDIA_LOCATON, "/temp")
    await fs.mkdir(tempFolder, { recursive: true })

    const d = new Date()
    const month = d.getMonth().toString();
    const year = d.getFullYear().toString();

    const finalFolder = path.join(MEDIA_LOCATON, fileType, year, month.padStart(2, "0"));
    await fs.mkdir(finalFolder, { recursive: true })

    const tempPath = path.join(tempFolder, `${tempfileName}.${finalExt}`)
    const finalPath = path.join(finalFolder, `${hash}.${finalExt}`)

    return await submissionMutex.runExclusive(async () => {
        try {
            return await db.transaction(async (tx) => {
                const metadata = await proceessMedia(media, tempFolder, tempfileName)

                const [newRecord] = await tx.insert(table.bountySubmission).values({
                    hash,
                    submitterId,
                    bountyId,
                    mediaLocation: finalPath,
                    ...metadata
                }).returning();

                await fs.rename(tempPath, finalPath)

                return newRecord
            })
        } catch (err) {
            await fs.rm(tempPath, { force: true }).catch(() => { });
            throw err;
        }
    })
}

export async function deleteBountySubmission(submissionId: string) {
    const submission = (await getSubmissionById(submissionId))!;

    if (submission.mediaLocation !== null) {
        const resolvedMediaDir = path.resolve(MEDIA_LOCATON)
        const resolvedSubmissionPath = path.resolve(submission.mediaLocation)

        if (!resolvedSubmissionPath.startsWith(resolvedMediaDir)) throw Error("Media has a path that is not inside the media directory");

        await fs.unlink(resolvedSubmissionPath)
    }

    await db.delete(table.bountySubmission).where(eq(table.bountySubmission.id, submissionId))
}