import { redirect } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';
import type { Actions, PageServerLoad } from './$types';
import { userPointsAddSubtract } from '$lib/server/points';

export const load: PageServerLoad = async () => {
	const user = requireLogin()
	return { user };
};

export const actions: Actions = {
	increment: async (event) => {
		const user = requireLogin()
		await userPointsAddSubtract(user.id, 1)
	},
	decrement: async (event) => {
		const user = requireLogin()
		await userPointsAddSubtract(user.id, -1)
	}
};

function requireLogin() {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		return redirect(302, "/login");
	}

	return locals.user;
}
