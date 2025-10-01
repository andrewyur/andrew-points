import { db } from "./db"
import * as table from "./db/schema"
import { discordPrivateMessage } from "./discord"

export type NotificationContext = {
    type: "private_offer_posted" | "offer_purchased" | "offer_confirmation" | "offer_dispute" | "offer_completed"
    offerId: string
} | {
    type: "bounty_submission_accepted" | "bounty_submission_rejected"
    submissionId: string
} | {
    type: "bounty_completed" | "bounty_expired"
    bountyId: string
} | {
    type: "item_redeemed"
    redeemerId: string
    redeemableId: string
} | {
    type: "admin_points_adjustment"
    ledgerId: string
}

export async function createNotification(userId: string, context: NotificationContext) {
    await db.insert(table.notification).values({
        userId: userId,
        type: context.type,
        offerId: "offerId" in context ? context.offerId : null,
        submissionId: "submissionId" in context ? context.submissionId : null,
        bountyId: "bountyId" in context ? context.bountyId : null,
        redeemerId: "redeemerId" in context ? context.redeemerId : null,
        redeemableId: "redeemableId" in context ? context.redeemableId : null,
        ledgerId: "ledgerId" in context ? context.ledgerId : null,
    })
    await discordPrivateMessage(userId, context)
}