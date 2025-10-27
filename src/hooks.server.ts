import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import * as table from "$lib/server/db/schema"

const handleAuth: Handle = async ({ event, resolve }) => {
	if (import.meta.env.DEV) {
		const adminUser = await db.query.user.findFirst({
			where: eq(table.user.admin, true)
		})

		event.locals.user = adminUser!;
		return resolve(event);
	}


	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

export const handle: Handle = handleAuth;
