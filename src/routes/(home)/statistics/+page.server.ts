import type { PageServerLoad } from "./$types";
import { getAllUserPoints, getPageOfLegderEntry, getRecentActivity, getRecentActivityPageAmount } from "./statistics";

export const load: PageServerLoad = async ({ url }) => {
    const transactionId = url.searchParams.get('transactionId');

    let recentActivityPage = 0
    if (transactionId !== null) {
        recentActivityPage = await getPageOfLegderEntry(transactionId)
    }

    return {
        allUserPoints: await getAllUserPoints(),
        recentActivity: await getRecentActivity(recentActivityPage),
        recentActivityPageAmount: await getRecentActivityPageAmount(),
        recentActivityPage,
    }
}