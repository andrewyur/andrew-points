import { discord } from "$lib/server/oauth";
import { createUser, getUserFromDiscordId, updateUserAvatar } from "./user";
import type { RequestEvent } from "@sveltejs/kit";
import type { OAuth2Tokens } from "arctic";
import * as auth from "$lib/server/auth"

export async function GET(event: RequestEvent): Promise<Response> {
    const storedState = event.cookies.get("discord_oauth_state") ?? null;
    const code = event.url.searchParams.get("code");
    const state = event.url.searchParams.get("state");

    if (storedState === null || code === null || state === null || storedState !== state) {
        return new Response("Please restart the process.", {
            status: 400
        })
    }

    let tokens: OAuth2Tokens;
    try {
        tokens = await discord.validateAuthorizationCode(code, null);
    } catch {
        return new Response("Please restart the process.", {
            status: 400
        })
    }

    const accessToken = tokens.accessToken();

    let discordUser: {
        id: string,
        username: string,
        avatar: string | null,
    }

    try {
        const response = await fetch("https://discord.com/api/users/@me", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        discordUser = await response.json();
    } catch {
        return new Response("Please restart the process.", {
            status: 400
        })
    }

    const existingUser = await getUserFromDiscordId(discordUser.id);
    if (existingUser !== undefined) {
        if (discordUser.avatar) {
            updateUserAvatar(discordUser.id, discordUser.avatar);
        }
    }

    const user = existingUser ?? await createUser(discordUser.id, discordUser.username, discordUser.avatar);

    const sessionToken = auth.generateSessionToken()
    const session = await auth.createSession(sessionToken, user.id)
    auth.setSessionTokenCookie(event, sessionToken, session.expiresAt)
    return new Response(null, {
        status: 302,
        headers: {
            Location: "/"
        }
    });
}