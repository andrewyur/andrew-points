import { computeFileHash } from "$lib/hashMedia";
import { Mutex } from "async-mutex";
import { db, type DatabaseTransactionClient } from "../db";
import * as table from "../db/schema"
import { eq } from "drizzle-orm";
import { MEDIA_LOCATON } from "$env/static/private";
import path from "path";
import fs from 'fs/promises'
import { processFile } from "./fileProcessing";

const mediaMutex = new Mutex();

export async function createMedia(file: File, transaction?: DatabaseTransactionClient) {

    const database = (transaction ?? db)

    const hash = await computeFileHash(file);

    let existingHash = await database.query.media.findFirst({
        where: eq(table.media.hash, hash)
    })
    if (existingHash) throw Error("Media already exists in the database!");

    let fileType: "image" | "video";
    let finalExt: string;

    if (file.type.startsWith("image/")) {
        fileType = "image";
        finalExt = "webp";
    } else if (file.type.startsWith("video/")) {
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

    return await mediaMutex.runExclusive(async () => {
        try {
            return await database.transaction(async (tx) => {
                const metadata = await processFile(file, tempFolder, tempfileName)

                const [newRecord] = await tx.insert(table.media).values({
                    hash,
                    path: finalPath,
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

export async function deleteMedia(hash: string, transaction?: DatabaseTransactionClient) {
    const database = (transaction ?? db);

    const media = (await database.query.media.findFirst({
        where: eq(table.media.hash, hash)
    }))!

    const resolvedMediaDir = path.resolve(MEDIA_LOCATON)
    const resolvedSubmissionPath = path.resolve(media.path)

    if (!resolvedSubmissionPath.startsWith(resolvedMediaDir)) throw Error("Media has a path that is not inside the media directory");

    await database.transaction(async (tx) => {
        await fs.unlink(resolvedSubmissionPath)
        await tx.delete(table.media).where(eq(table.media.hash, hash))
    })
}