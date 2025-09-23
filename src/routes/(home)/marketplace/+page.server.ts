import { getAllUsers, getUserFromId, userExists } from "$lib/server/user";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { buyOffer, createOffer, deleteOffer, getOfferById, getOffers } from "./offers";
import { validateNullableString, validatePoints, validateString } from "$lib/server/validate";
import { getUserPoints } from "$lib/server/points";

export const load: PageServerLoad = async ({ locals }) => {
    return {
        offers: await getOffers(locals.user?.id!),
        users: (await getAllUsers()).filter((u) => u.id !== locals.user?.id)
    }
}

export const actions: Actions = {
    create: async ({ locals, request }) => {
        if (!locals.user) {
            redirect(302, '/login')
        }

        const formData = await request.formData()

        try {
            const cost = validatePoints(formData.get("cost"))
            const title = validateString(formData.get("title"))
            const description = validateString(formData.get("description"))
            const visibleTo = validateNullableString(formData.get("visibleTo"))

            if (visibleTo !== null && !(await userExists(visibleTo))) throw Error("VisibleTo does not correspond to an entry in the users table")

            await createOffer(locals.user.id, cost, title, description, visibleTo)
        } catch (e) {
            return fail(400, `Could not create offer: ${(e as Error).message}`)
        }
    },
    delete: async ({ locals, request }) => {
        if (!locals.user) {
            redirect(302, '/login')
        }

        const formData = await request.formData()

        try {
            const id = validateString(formData.get("id"))

            const offer = await getOfferById(id)

            if (!offer) throw Error("No offer with that id");
            if (offer.posterId !== locals.user.id) throw Error("Offer was not posted by current user");
            if (offer.state !== "active") throw Error("Offer is no longer active");

            await deleteOffer(id)
        } catch (e) {
            return fail(400, `Could not delete offer: ${(e as Error).message}`)
        }
    },
    buy: async ({ locals, request }) => {
        if (!locals.user) {
            redirect(302, '/login')
        }

        const formData = await request.formData()

        try {
            const id = validateString(formData.get("id"))

            const offer = await getOfferById(id)

            if (!offer) throw Error("No offer with that id");
            if (offer.state !== "active") throw Error("the offer is not active");
            if (offer.buyerId !== null) throw Error("the offer already has a buyer");

            const points = await getUserPoints(locals.user.id);

            if (points < offer.cost) throw Error("User does not have enough points to buy the offer")

            console.log(locals)

            await buyOffer(id, locals.user.id)

        } catch (e) {
            return fail(400, `Could not buy offer: ${(e as Error).message}`)
        }
    }
}