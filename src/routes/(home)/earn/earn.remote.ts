import * as v from 'valibot';
import { form } from "$app/server";
import { verify } from 'hcaptcha';
import { HCAPTCHA_SECRET } from '$env/static/private';
import { advanceEarnSession, completeEarnSessionFromUser, createEarnSession, getEarnSessionFromUser } from './earnSession';
import { extractUser } from '$lib/server/user';
import { redirect } from '@sveltejs/kit';

export const verifyCaptchaForm = form(v.object({
    token: v.pipe(v.string(), v.nonEmpty())
}), async ({ token }) => {
    try {
        const user = extractUser();

        const response: { success: boolean } = await verify(HCAPTCHA_SECRET, token)
        if (!response.success) throw Error("failed to validate captcha")

        const session = await getEarnSessionFromUser(user.id);

        if (!session) throw Error("User has no current earn session!")

        if (session.remaining === 0) {
            await completeEarnSessionFromUser(user.id)
            return { value: "completed" }
        } else {
            await advanceEarnSession(user.id)
        }
    } catch (e) {
        return { error: `Could not verify captcha: ${(e as Error).message}` }
    }
})

export const startCaptchaSessionForm = form(v.object({}), async () => {
    try {
        const user = extractUser()
        const session = await getEarnSessionFromUser(user.id)

        if (!session) {
            await createEarnSession(user.id)
        }
    } catch (e) {
        return { error: `Could not start Captcha Session: ${(e as Error).message}` }
    }
    redirect(303, "/earn/captcha")
})