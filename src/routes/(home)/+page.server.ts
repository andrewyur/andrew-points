import { redirect } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';
import type { Actions, PageServerLoad } from './$types';
import { createTransaction, getUserPoints } from '$lib/server/points';

export const load: PageServerLoad = async () => {
	const user = requireLogin()
	return { user, userPoints: await getUserPoints(user.id) };
};

export const actions: Actions = {
	increment: async (event) => {
		const user = requireLogin()
		await createTransaction(user.id, 100, {
			type: "admin_created"
		})
	},
	decrement: async (event) => {
		const user = requireLogin()
		await createTransaction(user.id, -100, {
			type: "admin_removed"
		})
	}
};

function requireLogin() {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		return redirect(302, "/login");
	}

	return locals.user;
}
