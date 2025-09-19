import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import * as table from "$lib/server/db/schema"
import type { RequestEvent } from "./$types";
import path from "path";
import { MEDIA_LOCATON } from "$env/static/private";
import fs from "fs/promises";
import { createReadStream } from "fs";
import { Readable } from "stream";

export async function GET(event: RequestEvent) {
    const url = new URL(event.url);
    const id = url.searchParams.get("id")
    if (!id) {
        return new Response("No id in query params", { status: 400 })
    }

    const submission = await db.query.bountySubmission.findFirst({
        where: eq(table.bountySubmission.id, id)
    })

    if (!submission || submission.mediaLocation === null) {
        return new Response("Could not find any submission media for the provided id", { status: 404 })
    }

    const resolvedMediaDir = path.resolve(MEDIA_LOCATON)
    const resolvedSubmissionPath = path.resolve(submission.mediaLocation)

    if (!resolvedSubmissionPath.startsWith(resolvedMediaDir)) {
        return new Response("Media has a path that is not inside the media directory", { status: 400 })
    }

    try {
        if (submission.type === "video") {
            const { size } = await fs.stat(resolvedSubmissionPath)
            const stream = createReadStream(resolvedSubmissionPath)

            const webStream = Readable.toWeb(stream) as ReadableStream<Uint8Array>

            return new Response(webStream, {
                headers: {
                    "Content-Type": "video/mp4",
                    "Content-Length": size.toString(),
                }
            })

        } else {
            const media = await fs.readFile(resolvedSubmissionPath);

            return new Response(new Uint8Array(media), {
                headers: {
                    "Content-Type": "image/webp",
                    "Content-Disposition": 'attachment; filename="media.webp"',
                },
            });
        }
    } catch (e) {
        return new Response(`Could not read the media file: ${(e as Error).message ?? "unknown reason"}`, { status: 404 })
    }

}