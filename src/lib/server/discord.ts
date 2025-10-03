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
                channel.send(`${bounty.creator.displayName} 𝓱𝓪𝓼 𝓳𝓾𝓼𝓽 𝓹𝓵𝓪𝓬𝓮𝓭 𝓪 𝓫𝓸𝓾𝓷𝓽𝔂 𝔀𝓲𝓽𝓱 𝓪 ${bounty.reward} 𝓹𝓸𝓲𝓷𝓽𝓼 𝓻𝓮𝔀𝓪𝓻𝓭! 𝕾𝖊𝖊 𝖒𝖔𝖗𝖊: ${APP_URL}/bounties`)
            } else {
                if (!bounty.fulfiller) throw Error("Bounty missing fulfillment information")
                channel.send(`${bounty.fulfiller.creator.displayName}'𝓼 𝓼𝓾𝓫𝓶𝓲𝓼𝓼𝓲𝓸𝓷 𝓽𝓸 𝓽𝓱𝓮 𝓫𝓸𝓾𝓷𝓽𝔂 "${bounty.title}"𝔀𝓪𝓼 𝓪𝓬𝓬𝓮𝓹𝓽𝓮𝓭, 𝓮𝓪𝓻𝓷𝓲𝓷𝓰 𝓽𝓱𝓮𝓶 ${bounty.reward} 𝓹𝓸𝓲𝓷𝓽𝓼! 𝕾𝖊𝖊 𝖒𝖔𝖗𝖊: ${APP_URL}/bounties/b/${bounty.id}`)
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

            channel.send(`${submission.creator.displayName}𝓳𝓾𝓼𝓽 𝓬𝓻𝓮𝓪𝓽𝓮𝓭 𝓪 𝓷𝓮𝔀 𝓼𝓾𝓫𝓶𝓲𝓼𝓼𝓲𝓸𝓷 𝓯𝓸𝓻 𝓪 𝓫𝓸𝓾𝓷𝓽𝔂! 𝕾𝖊𝖊 𝖒𝖔𝖗𝖊: ${APP_URL}/bounties`)
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
                channel.send(`${offer.poster.displayName} 𝓳𝓾𝓼𝓽 𝓹𝓸𝓼𝓽𝓮𝓭 𝓪 𝓹𝓾𝓫𝓵𝓲𝓬 𝓸𝓯𝓯𝓮𝓻 𝓯𝓸𝓻 ${offer.cost} 𝓹𝓸𝓲𝓷𝓽𝓼! 𝕾𝖊𝖊 𝖒𝖔𝖗𝖊: ${APP_URL}/marketplace`)
            } else {
                if (!offer.buyer) throw Error("Offer missing buyer information")
                channel.send(`${offer.buyer.displayName} 𝓳𝓾𝓼𝓽 𝓹𝓾𝓻𝓬𝓱𝓪𝓼𝓮𝓭 𝓪𝓷 𝓸𝓯𝓯𝓮𝓻 "${offer.title}" 𝓯𝓸𝓻 ${offer.cost} 𝓹𝓸𝓲𝓷𝓽𝓼! 𝕾𝖊𝖊 𝖒𝖔𝖗𝖊: ${APP_URL}/marketplace/${offer.id}`)
            }
            break;
        case "item_redeemed":
            const redeemable = redeemableItems.find(r => r.id === announcement.redeemableId)
            const redeemer = await getUserFromId(announcement.userId)

            if (!redeemable) throw Error("No redeemable with that id")
            if (!redeemer) throw Error("No user with that id")

            channel.send(`${redeemer.displayName} 𝓳𝓾𝓼𝓽 𝓻𝓮𝓭𝓮𝓮𝓶𝓮𝓭 ${redeemable.cost}𝓯𝓸𝓻 𝓽𝓱𝓮 𝓲𝓽𝓮𝓶 "${redeemable.name}"!`)
            break;
        case "user_joined":
            const user = await getUserFromId(announcement.userId)

            if (!user) throw Error("No user with that id")

            channel.send(`${user.displayName} 𝓳𝓾𝓼𝓽 𝓳𝓸𝓲𝓷𝓮𝓭! 𝓦𝓮𝓵𝓬𝓸𝓶𝓮!`)
            break;
        case "admin_point_adjustment":
            const ledgerEntry = await db.query.ledgerEntry.findFirst({
                where: eq(table.ledgerEntry.id, announcement.ledgerEntryId),
                with: {
                    user: true
                }
            })
            if (!ledgerEntry) throw Error("no ledger entry with that id")

            channel.send(`𝓐𝓭𝓶𝓲𝓷 𝓳𝓾𝓼𝓽 ${ledgerEntry.amount > 0 ? "𝓰𝓪𝓿𝓮" : "𝓽𝓸𝓸𝓴"} ${Math.abs(ledgerEntry.amount)} 𝓹𝓸𝓲𝓷𝓽𝓼 ${ledgerEntry.amount > 0 ? "𝓽𝓸" : "𝓯𝓻𝓸𝓶"} ${ledgerEntry.user.displayName}: ${ledgerEntry.message ?? "𝓷𝓸 𝓻𝓮𝓪𝓼𝓸𝓷"}`)
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
            user.send(`𝓞𝓷𝓮 𝓸𝓯 𝔂𝓸𝓾𝓻 𝓫𝓸𝓾𝓷𝓽𝓲𝓮𝓼 𝔀𝓪𝓼 𝓬𝓸𝓶𝓹𝓵𝓮𝓽𝓮𝓭! 𝖘𝖊𝖊 𝖒𝖔𝖗𝖊: ${APP_URL}/bounties/b/${message.bountyId}`)
            break;
        case "bounty_expired":
            user.send(`𝓞𝓷𝓮 𝓸𝓯 𝔂𝓸𝓾𝓻 𝓫𝓸𝓾𝓷𝓽𝓲𝓮𝓼 𝓮𝔁𝓹𝓲𝓻𝓮𝓭! 𝖘𝖊𝖊 𝖒𝖔𝖗𝖊: ${APP_URL}/bounties/b/${message.bountyId}`)
            break;
        case "bounty_submission_accepted":
            user.send(`𝓞𝓷𝓮 𝓸𝓯 𝔂𝓸𝓾𝓻 𝓫𝓸𝓾𝓷𝓽𝔂 𝓼𝓾𝓫𝓶𝓲𝓼𝓼𝓲𝓸𝓷𝓼 𝔀𝓪𝓼 𝓪𝓬𝓬𝓮𝓹𝓽𝓮𝓭! 𝖘𝖊𝖊 𝖒𝖔𝖗𝖊: ${APP_URL}/bounties/${message.bountyId}`)
            break;
        case "bounty_submission_rejected":
            user.send(`𝓞𝓷𝓮 𝓸𝓯 𝔂𝓸𝓾𝓻 𝓫𝓸𝓾𝓷𝓽𝔂 𝓼𝓾𝓫𝓶𝓲𝓼𝓼𝓲𝓸𝓷𝓼 𝔀𝓪𝓼 𝓻𝓮𝓳𝓮𝓬𝓽𝓮𝓭! 𝖘𝖊𝖊 𝖒𝖔𝖗𝖊: ${APP_URL}/bounties/${message.bountyId}`)
            break;
        case "item_redeemed":
            user.send(`𝓢𝓸𝓶𝓮𝓸𝓷𝓮 𝓳𝓾𝓼𝓽 𝓻𝓮𝓭𝓮𝓮𝓶𝓮𝓭 an item! 𝖘𝖊𝖊 𝖒𝖔𝖗𝖊: ${APP_URL}/statistics?transactionId=${message.ledgerId}`)
            break;
        case "offer_confirmation":
            user.send(`𝓨𝓸𝓾 𝓷𝓮𝓮𝓭 𝓽𝓸 𝓬𝓸𝓷𝓯𝓲𝓻𝓶 𝓽𝓱𝓪𝓽 𝔂𝓸𝓾 𝓱𝓪𝓿𝓮 𝓻𝓮𝓬𝓲𝓮𝓿𝓮𝓭 𝓲𝓽𝓮𝓶𝓼 𝓯𝓻𝓸𝓶 𝓪𝓷 𝓸𝓯𝓯𝓮𝓻! 𝖘𝖊𝖊 𝖒𝖔𝖗𝖊: ${APP_URL}/marketplace/${message.offerId}`)
            break;
        case "offer_dispute":
            user.send(`𝓢𝓸𝓶𝓮𝓸𝓷𝓮 𝓳𝓾𝓼𝓽 𝓭𝓲𝓼𝓹𝓾𝓽𝓮𝓭 𝓪𝓷 𝓸𝓯𝓯𝓮𝓻! see more ${APP_URL}/user`)
            break;
        case "private_offer_posted":
            user.send(`𝓢𝓸𝓶𝓮𝓸𝓷𝓮 𝓹𝓸𝓼𝓽𝓮𝓭 𝓪𝓷 𝓸𝓯𝓯𝓮𝓻 𝓹𝓻𝓲𝓿𝓪𝓽𝓮 𝓽𝓸 𝔂𝓸𝓾! see more ${APP_URL}/marketplace/${message.offerId}`)
            break;
        case "offer_purchased":
            user.send(`𝓢𝓸𝓶𝓮𝓸𝓷𝓮 𝓳𝓾𝓼𝓽 𝓹𝓾𝓻𝓬𝓱𝓪𝓼𝓮𝓭 𝓸𝓷𝓮 𝓸𝓯 𝔂𝓸𝓾𝓻 𝓸𝓯𝓯𝓮𝓻𝓼! ${APP_URL}/marketplace/${message.offerId}`)
            break;
        case "admin_points_adjustment":
            user.send(`𝓐𝓭𝓶𝓲𝓷 𝓳𝓾𝓼𝓽 𝓪𝓭𝓳𝓾𝓼𝓽𝓮𝓭 𝔂𝓸𝓾𝓻 𝓹𝓸𝓲𝓷𝓽𝓼! 𝖘𝖊𝖊 𝖒𝖔𝖗𝖊: ${APP_URL}/user`)
            break;
        case "offer_completed":
            user.send(`𝓞𝓷𝓮 𝓸𝓯 𝔂𝓸𝓾𝓻 𝓸𝓯𝓯𝓮𝓻𝓼 𝔀𝓪𝓼 𝓳𝓾𝓼𝓽 𝓬𝓸𝓶𝓹𝓵𝓮𝓽𝓮𝓭!  𝖘𝖊𝖊 𝖒𝖔𝖗𝖊: ${APP_URL}/marketplace/${message.offerId}`)
            break;
    }
}