import { db } from "$lib/server/db";
import { type RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent) {
    const url = new URL(event.url);
    const hash = url.searchParams.get("hash")
    if (hash !== null) {
        const existingSumission = await db.query.bountySubmission.findFirst({
            where: (b, { eq }) => eq(b.hash, hash)
        })
        if (existingSumission !== undefined) {
            return new Response("Submission with media already exists", { status: 400 })
        } else {
            return new Response()
        }
    } else {
        return new Response("No hash in query params", { status: 400 })
    }
}