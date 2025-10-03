import { form } from "$app/server";
import { extractUser } from "$lib/server/user";
import * as v from "valibot";
import { redeemableItems } from "./redeemables";
import { createTransaction, getUserPoints } from "$lib/server/points";
import { createNotification } from "$lib/server/notifications";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import * as table from "$lib/server/db/schema"

export const redeemItemForm = form(v.object({
    redeemableId: v.string()
}), async ({ redeemableId }) => {
    try {
        const user = extractUser();
        const redeemedItem = redeemableItems.find((r) => r.id === redeemableId)

        if (!redeemedItem) throw Error("No redeemable items exist with the provided name")

        const userPoints = await getUserPoints(user.id)

        if (userPoints < redeemedItem.cost) throw Error("You do not have enough points to redeem this item")

        const ledger = await createTransaction(user.id, -redeemedItem.cost, {
            type: `redeemed_reward#${redeemedItem.id}`,
        })

        const admins = await db.query.user.findMany({
            where: eq(table.user.admin, true)
        })
        admins.forEach((admin) => {
            createNotification(admin.id, { type: "item_redeemed", ledgerId: ledger.id })
        })
    } catch (e) {
        return { error: `Could not redeem Item: ${(e as Error).message}` }
    }
})