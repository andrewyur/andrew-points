import { APP_URL, DISCORD_BOT_TOKEN, GUILD_ID, POINTS_CHANNEL_ID } from "$env/static/private";
import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import { db } from "./db";
import * as table from "./db/schema"
import { eq } from "drizzle-orm";
import { redeemableItems } from "../../routes/(home)/redeem/redeemables";
import { getUserFromId } from "./user";
import type { NotificationContext } from "./notifications";

const client = new Client({
    intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages]
})

client.once('clientReady', async () => {
    console.log("Discord Bot Client ready")

    const guild = await client.guilds.fetch(GUILD_ID);
    const channel = await client.channels.fetch(POINTS_CHANNEL_ID)
    if (!channel || !(channel instanceof TextChannel)) {
        console.error("Could not find text channel with ID:");
        return;
    }

    // channel.send("https://google.com")

    // await channel.send("<@677282151959625730>");

    const user = await client.users.fetch("677282151959625730")

    const member = await guild.members.fetch("677282151959625730")

    // console.log(member.displayName)

    // user.send("Test notification!!")
})

client.login(DISCORD_BOT_TOKEN)

export async function fetchDisplayName(discordId: string) {
    if (!client.isReady()) {
        throw Error("Discord client is not ready. Please try again later.")
    }

    const guild = await client.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(discordId)

    if (!member) {
        throw Error("Discord account is not in the lodge discord. Please use another account.")
    }

    return member.displayName
}

type Announcement = {
    type: 'bounty_placed' | 'bounty_completed'
    bountyId: string
} | {
    type: 'bounty_submission_created'
    submissionId: string
} | {
    type: 'offer_posted' | 'offer_purchased'
    offerId: string
} | {
    type: 'item_redeemed'
    userId: string
    redeemableId: string
} | {
    type: 'user_joined'
    userId: string
} | {
    type: 'admin_point_adjustment'
    ledgerEntryId: string
}

export async function discordAnnouncement(announcement: Announcement) {
    if (!client.isReady()) {
        throw Error("Discord client is not ready. Please try again later.")
    }

    const channel = await client.channels.fetch(POINTS_CHANNEL_ID)
    if (!channel || !(channel instanceof TextChannel)) {
        throw Error("Could not find the points text channel")
    }

    switch (announcement.type) {
        case "bounty_completed":
        case "bounty_placed":
            const bounty = await db.query.bounty.findFirst({
                where: eq(table.bounty.id, announcement.bountyId),
                with: {
                    creator: true,
                    fulfiller: {
                        with: {
                            creator: true
                        }
                    }
                }
            })
            if (!bounty) throw Error("No bounty with that id");

            if (announcement.type === "bounty_placed") {
                channel.send(`${bounty.creator.displayName} has just placed a bounty with a ${bounty.reward} points reward. See more: ${APP_URL}/bounties`)
            } else {
                if (!bounty.fulfiller) throw Error("Bounty missing fulfillment information")
                channel.send(`${bounty.fulfiller.creator.displayName}'s submission to the bounty "${bounty.title}" was accepted, earning him ${bounty.reward}`)
            }
            break;
        case "bounty_submission_created":
            const submission = await db.query.bountySubmission.findFirst({
                where: eq(table.bountySubmission.id, announcement.submissionId),
                with: {
                    creator: true,
                    bounty: true,
                }
            })
            if (!submission) throw Error("No submission with that id");

            channel.send(`${submission.creator.displayName} just created a new submission for a bounty! See more at: ${APP_URL}/bounties`)
            break;
        case "offer_posted":
        case "offer_purchased":
            const offer = await db.query.offer.findFirst({
                where: eq(table.offer.id, announcement.offerId),
                with: {
                    buyer: true,
                    poster: true
                }
            })
            if (!offer) throw Error("No offer with that id");
            if (offer.visibleTo) throw Error("Offer is private");

            if (announcement.type === "offer_posted") {
                channel.send(`${offer.poster.displayName} just posted a public offer for ${offer.cost} points! See more at ${APP_URL}/marketplace`)
            } else {
                if (!offer.buyer) throw Error("Offer missing buyer information")
                channel.send(`${offer.buyer.displayName} just purchased the offer "${offer.title}" for ${offer.cost} points!`)
            }
            break;
        case "item_redeemed":
            const redeemable = redeemableItems.find(r => r.id === announcement.redeemableId)
            const redeemer = await getUserFromId(announcement.userId)

            if (!redeemable) throw Error("No redeemable with that id")
            if (!redeemer) throw Error("No user with that id")

            channel.send(`${redeemer.displayName} just redeemed ${redeemable.cost} for the item "${redeemable.name}"!`)
            break;
        case "user_joined":
            const user = await getUserFromId(announcement.userId)

            if (!user) throw Error("No user with that id")

            channel.send(`${user.displayName} just joined! Welcome!`)
            break;
        case "admin_point_adjustment":
            const ledgerEntry = await db.query.ledgerEntry.findFirst({
                where: eq(table.ledgerEntry.id, announcement.ledgerEntryId),
                with: {
                    user: true
                }
            })
            if (!ledgerEntry) throw Error("no ledger entry with that id")

            channel.send(`admin just ${ledgerEntry.amount > 0 ? "gave" : "took"} ${Math.abs(ledgerEntry.amount)} ${ledgerEntry.amount > 0 ? "to" : "from"} ${ledgerEntry.user.displayName}: ${ledgerEntry.message ?? "No reason"}`)
    }
}

export async function discordPrivateMessage(userId: string, message: NotificationContext) {
    if (!client.isReady()) {
        throw Error("Discord client is not ready. Please try again later.")
    }

    const userRecord = await getUserFromId(userId)

    if (!userRecord) throw Error("No user with that id")

    const user = await client.users.fetch(userRecord.discordId)

    if (!user) throw Error("Could not find discord user with that id")

    switch (message.type) {
        case "bounty_completed":
            user.send(`One of your bounties was completed! see more: ${APP_URL}/bounties/b/${message.bountyId}`)
            break;
        case "bounty_expired":
            user.send(`One of your bounties expired! see more: ${APP_URL}/bounties/b/${message.bountyId}`)
            break;
        case "bounty_submission_accepted":
            user.send(`One of your bounty submissions was accepted! see more: ${APP_URL}/bounties/s/${message.submissionId}`)
            break;
        case "bounty_submission_rejected":
            user.send(`One of your bounty submissions was rejected! see more: ${APP_URL}/bounties/s/${message.submissionId}`)
            break;
        case "item_redeemed":
            user.send(`Someone just redeemed ${message.redeemableId}! see more: ${APP_URL}/user`)
            break;
        case "offer_confirmation":
            user.send(`You need to confirm that you have recieved items from an offer! see more: ${APP_URL}/marketplace/${message.offerId}`)
            break;
        case "offer_dispute":
            user.send(`Someone just disputed an offer! see more ${APP_URL}/user`)
            break;
        case "private_offer_posted":
            user.send(`Someone posted an offer private to you! see more ${APP_URL}/marketplace/${message.offerId}`)
            break;
        case "offer_purchased":
            user.send(`Someone just purchased one of your offers! ${APP_URL}/marketplace/${message.offerId}`)
            break;
        case "admin_points_adjustment":
            user.send(`Admin just adjusted your points! see more: ${APP_URL}/user`)
            break;
        case "offer_completed":
            user.send(`One of your offers was just completed! see more: ${APP_URL}/marketplace/${message.offerId}`)
            break;
    }
}