import { db, type DatabaseTransactionClient } from "./db"
import * as table from "./db/schema"
import { discordPrivateMessage } from "./discord"

export type NotificationContext = {
    type: "private_offer_posted" | "offer_purchased" | "offer_confirmation" | "offer_dispute" | "offer_completed"
    offerId: string
} | {
    type: "bounty_completed" | "bounty_expired" | "bounty_submission_accepted" | "bounty_submission_rejected" | "new_submission"
    bountyId: string
} | {
    type: "admin_points_adjustment" | "item_redeemed"
    ledgerId: string
}

export async function createNotification(userId: string, context: NotificationContext, client?: DatabaseTransactionClient) {
    await (client ?? db).insert(table.notification).values({
        userId: userId,
        type: context.type,
        offerId: "offerId" in context ? context.offerId : null,
        bountyId: "bountyId" in context ? context.bountyId : null,
        ledgerId: "ledgerId" in context ? context.ledgerId : null,
    })
    await discordPrivateMessage(userId, context)
}