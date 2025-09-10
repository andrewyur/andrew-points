import { discord } from "$lib/server/oauth";
import type { RequestEvent } from "@sveltejs/kit";
import { generateState } from "arctic";

export function GET(event: RequestEvent): Response {
    const state = generateState()
    const url = discord.createAuthorizationURL(state, null, ["openid", "identify"])

    event.cookies.set("discord_oauth_state", state, {
        httpOnly: true,
        maxAge: 60 * 10,
        secure: import.meta.env.PROD,
        path: "/",
        sameSite: "lax"
    });

    return new Response(null, {
        status: 302,
        headers: {
            Location: url.toString()
        }
    });
}