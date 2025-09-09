import { google } from "$lib/server/oauth";
import { createUser, getUserFromGoogleId } from "$lib/server/user";
import * as auth from "$lib/server/auth";
import { decodeIdToken } from "arctic";

import type { RequestEvent } from "./$types";
import type { OAuth2Tokens } from "arctic";

export async function GET(event: RequestEvent): Promise<Response> {
    const storedState = event.cookies.get("google_oauth_state") ?? null;
    const codeVerifier = event.cookies.get("google_code_verifier") ?? null;
    const code = event.url.searchParams.get("code");
    const state = event.url.searchParams.get("state");

    if (storedState === null || codeVerifier === null || code === null || state === null) {
        return new Response("Please restart the process.", {
            status: 400
        });
    }
    if (storedState !== state) {
        return new Response("Please restart the process.", {
            status: 400
        });
    }

    let tokens: OAuth2Tokens;
    try {
        tokens = await google.validateAuthorizationCode(code, codeVerifier);
    } catch (e) {
        return new Response("Please restart the process.", {
            status: 400
        });
    }

    const claims = decodeIdToken(tokens.idToken()) as {
        sub: string,
        name: string,
        picture: string,
        email: string,
    }

    const existingUser = await getUserFromGoogleId(claims.sub);
    if (existingUser !== undefined) {
        const sessionToken = auth.generateSessionToken();
        const session = await auth.createSession(sessionToken, existingUser.id);
        auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
        return new Response(null, {
            status: 302,
            headers: {
                Location: "/"
            }
        });
    }

    const user = await createUser(claims.sub, claims.email, claims.name, claims.picture);
    const sessionToken = auth.generateSessionToken();
    const session = await auth.createSession(sessionToken, user.id);
    auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
    return new Response(null, {
        status: 302,
        headers: {
            Location: "/"
        }
    });
}