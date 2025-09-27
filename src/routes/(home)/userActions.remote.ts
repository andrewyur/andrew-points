import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import * as v from "valibot"
import * as table from "$lib/server/db/schema"
import { and, eq, or } from "drizzle-orm";
import { acceptSubmission, confirmOffer, disputeOffer, refundOffer, rejectSubmission } from "./userInfo";
import { createTransaction } from "$lib/server/points";

export const confirmOfferNotification = command(v.string(), async (offerId) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        return
    }

    const offer = await db.query.offer.findFirst({ where: and(eq(table.offer.id, offerId), eq(table.offer.buyerId, locals.user.id), eq(table.offer.state, "pending")) })

    if (!offer) {
        return
    }

    await confirmOffer(offerId)
})

export const disputeOfferNotification = command(v.string(), async (offerId) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        return
    }

    const offer = await db.query.offer.findFirst({ where: and(eq(table.offer.id, offerId), eq(table.offer.buyerId, locals.user.id), eq(table.offer.state, "pending")) })

    if (!offer) {
        return
    }

    await disputeOffer(offerId)
})

export const confirmDisputedOfferNotification = command(v.string(), async (offerId) => {
    const { locals } = getRequestEvent();

    if (!locals.user || !locals.user.admin) {
        return
    }

    const offer = await db.query.offer.findFirst({ where: and(eq(table.offer.id, offerId), eq(table.offer.state, "disputed")) })

    if (!offer) {
        return
    }

    await confirmOffer(offerId)
})


export const refundOfferNotification = command(v.string(), async (offerId) => {
    const { locals } = getRequestEvent();

    if (!locals.user || !locals.user.admin) {
        return
    }

    const offer = await db.query.offer.findFirst({ where: and(eq(table.offer.id, offerId), eq(table.offer.state, "disputed")) })

    if (!offer) {
        return
    }

    await refundOffer(offerId)
})

export const acceptSubmissionNotification = command(v.string(), async (submissionId: string) => {
    const { locals } = getRequestEvent();

    if (!locals.user || !locals.user.admin) {
        return
    }

    await acceptSubmission(submissionId)
})

export const rejectSubmissionNotification = command(v.string(), async (submissionId: string) => {
    const { locals } = getRequestEvent();

    if (!locals.user || !locals.user.admin) {
        return
    }

    await rejectSubmission(submissionId)
})