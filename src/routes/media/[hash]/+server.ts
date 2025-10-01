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
    const media = await db.query.media.findFirst({
        where: eq(table.media.hash, event.params.hash)
    })

    if (!media) {
        return new Response("Could not find any media for the hash", { status: 404 })
    }

    const resolvedMediaDir = path.resolve(MEDIA_LOCATON)
    const resolvedMediaPath = path.resolve(media.path)

    if (!resolvedMediaPath.startsWith(resolvedMediaDir)) {
        return new Response("Media has a path that is not inside the media directory", { status: 500 })
    }

    try {
        if (media.type === "video") {
            const { size } = await fs.stat(resolvedMediaPath)
            const stream = createReadStream(resolvedMediaPath)

            const webStream = Readable.toWeb(stream) as ReadableStream<Uint8Array>

            return new Response(webStream, {
                headers: {
                    "Content-Type": "video/mp4",
                    "Content-Length": size.toString(),
                }
            })

        } else {
            const media = await fs.readFile(resolvedMediaPath);

            return new Response(new Uint8Array(media), {
                headers: {
                    "Content-Type": "image/jpeg",
                    "Content-Disposition": 'attachment; filename="media.jpeg"',
                },
            });
        }
    } catch (e) {
        return new Response(`Could not read the media file: ${(e as Error).message ?? "unknown reason"}`, { status: 404 })
    }
}