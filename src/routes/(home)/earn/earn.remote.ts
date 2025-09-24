import * as v from 'valibot';
import { command, getRequestEvent } from "$app/server";
import { verify } from 'hcaptcha';
import { HCAPTCHA_SECRET } from '$env/static/private';
import { advanceEarnSession, completeEarnSessionFromUser, createEarnSession, getEarnSessionFromUser } from './earnSession';

type CommandResponse = { ok: true, redirect?: true } | { ok: false, reason: string };

export const verifyCaptcha = command(v.string(), async (token): Promise<CommandResponse> => {
    const response: { success: boolean } = await verify(HCAPTCHA_SECRET, token)

    if (!response.success) {
        return { ok: false, reason: "failed to validate captcha" }
    }

    const request = getRequestEvent()

    if (!request.locals.user) {
        return { ok: false, reason: "User is not logged in" }
    }

    const session = await getEarnSessionFromUser(request.locals.user.id);

    if (!session) {
        return { ok: false, reason: "User has no current earn session!" }
    }

    if (session.remaining === 0) {
        await completeEarnSessionFromUser(request.locals.user.id)
        return { ok: true, redirect: true }
    }

    await advanceEarnSession(request.locals.user.id)
    return { ok: true }
})

export const startCaptchaSession = command(async (): Promise<CommandResponse> => {
    const request = getRequestEvent()

    if (!request.locals.user) {
        return { ok: false, reason: "User is not logged in" }
    }

    const session = await getEarnSessionFromUser(request.locals.user.id)

    if (!session) {
        await createEarnSession(request.locals.user.id)
    }

    return { ok: true }
})