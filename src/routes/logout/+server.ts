import * as auth from "$lib/server/auth";
import type { RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent): Promise<Response> {
    if (!event.locals.session) {
        return new Response(null, { status: 401 });
    }
    await auth.invalidateSession(event.locals.session.id);
    auth.deleteSessionTokenCookie(event);

    return new Response(null, {
        status: 302,
        headers: {
            Location: "/login"
        }
    });
}