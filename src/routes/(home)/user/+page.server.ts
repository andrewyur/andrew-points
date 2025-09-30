import { getTasks } from "./userInfo";
import { getUserLedger } from "$lib/server/points";

export async function load({ locals }) {
	return {
		activity: await getUserLedger(locals.user?.id!),
		tasks: await getTasks(locals.user?.id!, locals.user?.admin!)
	}
}