import { form } from "$app/server";
import { extractUser, userExists } from "$lib/server/user";
import * as v from "valibot"
import { buyOffer, createOffer, deleteOffer, getOfferById } from "./offers";
import { getUserPoints } from "$lib/server/points";
import { discordAnnouncement } from "$lib/server/discord";
import { createNotification } from "$lib/server/notifications";

export const deleteOfferForm = form(v.object({
    offerId: v.pipe(v.string(), v.uuid())
}), async ({ offerId }) => {
    try {
        const user = extractUser();
        const offer = await getOfferById(offerId)

        if (!offer) throw Error("No offer with that id");
        if (offer.posterId !== user.id) throw Error("Offer was not posted by current user");
        if (offer.state !== "active") throw Error("Offer is no longer active");

        await deleteOffer(offerId)
    } catch (e) {
        return { error: `Could not delete Offer: ${(e as Error).message}` }
    }
})

export const buyOfferForm = form(v.object({
    offerId: v.pipe(v.string(), v.uuid())
}), async ({ offerId }) => {
    try {
        const user = extractUser();
        const offer = await getOfferById(offerId)

        if (!offer) throw Error("No offer with that id");
        if (offer.state !== "active") throw Error("the offer is not active");
        if (offer.buyerId !== null) throw Error("the offer already has a buyer");

        const points = await getUserPoints(user.id);

        if (points < offer.cost) throw Error("User does not have enough points to buy the offer")

        await buyOffer(offerId, user.id)
        if (!offer.visibleTo) {
            await discordAnnouncement({ type: "offer_purchased", offerId })
        }
        await createNotification(offer.posterId, { type: "offer_purchased", offerId })
        await createNotification(user.id, { type: "offer_confirmation", offerId })
    } catch (e) {
        return { error: `Could not buy Offer: ${(e as Error).message}` }
    }
})

export const createOfferForm = form(v.object({
    cost: v.pipe(v.string(), v.transform(Number), v.integer()),
    title: v.pipe(v.string(), v.nonEmpty(), v.maxLength(80)),
    description: v.pipe(v.string(), v.nonEmpty()),
    visibleTo: v.union([v.pipe(v.string(), v.uuid()), v.pipe(v.literal(''), v.transform(() => null))])
}), async ({ cost, title, description, visibleTo }) => {
    try {
        const user = extractUser();

        if (visibleTo !== null && !(await userExists(visibleTo))) throw Error("VisibleTo does not correspond to an entry in the users table")

        const offer = await createOffer(user.id, cost, title, description, visibleTo)
        if (visibleTo) {
            await createNotification(visibleTo, { type: "private_offer_posted", offerId: offer.id })
        } else {
            await discordAnnouncement({
                type: "offer_posted",
                offerId: offer.id
            })
        }
    } catch (e) {
        return { error: `Could not create Offer: ${(e as Error).message}` }
    }
})