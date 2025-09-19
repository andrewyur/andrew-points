import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createTransaction } from '$lib/server/points';


export const actions: Actions = {
	increment: async ({ locals }) => {
		if (!locals.user) {
			return redirect(302, "/login");
		}

		await createTransaction(locals.user.id, 100, {
			type: "admin_created"
		})
	},
	decrement: async ({ locals }) => {
		if (!locals.user) {
			return redirect(302, "/login");
		}

		await createTransaction(locals.user.id, -100, {
			type: "admin_removed"
		})
	}
};
