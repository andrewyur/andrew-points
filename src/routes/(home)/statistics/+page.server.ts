import type { PageServerLoad } from "./$types";
import { getAllUserPoints, getRecentActivity } from "./statistics";

export const load: PageServerLoad = async () => {
    return {
        allUserPoints: await getAllUserPoints(),
        recentActivity: await getRecentActivity(),
    }
}