import { fail, type Actions } from "@sveltejs/kit";
import { getTasks } from "./userInfo";
import { createTransaction, getUserLedger, getUserPoints } from "$lib/server/points";
import * as v from "valibot";

export async function load({ params, locals }) {
	return {
		activity: await getUserLedger(locals.user?.id!),
		tasks: await getTasks(locals.user?.id!, locals.user?.admin!)
	}
}

const adjustUserPoints = v.strictObject({
	user: v.pipe(v.string(), v.nonEmpty()),
	points: v.pipe(v.string(), v.nonEmpty(), v.transform(Number), v.integer()),
	message: v.optional(v.string())
});

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const data = Object.fromEntries(formData.entries())
		try {
			const { user, points, message } = v.parse(adjustUserPoints, data);

			await createTransaction(user, points, { type: 'admin', message });
		} catch (e) {
			return fail(400, `Could not edit user points: ${(e as Error).message ?? "Unknown reason"}`)
		}
	}
}