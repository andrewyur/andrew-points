import { form } from "$app/server";
import { db } from "$lib/server/db";
import * as v from "valibot"
import * as table from "$lib/server/db/schema"
import { and, eq } from "drizzle-orm";
import { acceptSubmission, confirmOffer, disputeOffer, refundOffer, rejectSubmission } from "./userInfo";
import { extractUser } from "$lib/server/user";
import { createTransaction } from "$lib/server/points";

const validateOfferId = async (offerId: string, admin?: boolean) => {
    const user = extractUser();

    if (admin && !user.admin) throw Error("User is not an admin")

    const ownsOffer = admin ? [] : [eq(table.offer.buyerId, user.id)]
    const correctState = admin ? [eq(table.offer.state, "disputed")] : [eq(table.offer.state, "pending")]

    const offer = await db.query.offer.findFirst({ where: and(eq(table.offer.id, offerId), ...ownsOffer, ...correctState) })

    if (!offer) throw Error("No offer with that id")
}

const validateSubmissionId = async (submissionId: string) => {
    const user = extractUser();

    if (!user.admin) throw Error("User is not an admin")

    const submission = await db.query.bountySubmission.findFirst({
        where: and(eq(table.bountySubmission.id, submissionId), eq(table.bountySubmission.state, "pending")),
        with: {
            bounty: true
        }
    })

    if (!submission) throw Error("No submission with that id");
    if (submission.bounty.completed) Error("Bounty is already completed!")
}

export const confirmOfferForm = form(v.object({
    offerId: v.pipe(v.string(), v.uuid())
}), async ({ offerId }) => {
    try {
        await validateOfferId(offerId)
        await confirmOffer(offerId)
    } catch (e) {
        return { error: `Could not complete the action: ${(e as Error).message}` }
    }
})

export const disputeOfferForm = form(v.object({
    offerId: v.pipe(v.string(), v.uuid())
}), async ({ offerId }) => {
    try {
        await validateOfferId(offerId)
        await disputeOffer(offerId)
    } catch (e) {
        return { error: `Could not complete the action: ${(e as Error).message}` }
    }
})

export const confirmDisputedOfferForm = form(v.object({
    offerId: v.pipe(v.string(), v.uuid())
}), async ({ offerId }) => {
    try {
        await validateOfferId(offerId, true)
        await confirmOffer(offerId)
    } catch (e) {
        return { error: `Could not complete the action: ${(e as Error).message}` }
    }
})


export const refundDisputedOfferForm = form(v.object({
    offerId: v.pipe(v.string(), v.uuid())
}), async ({ offerId }) => {
    try {
        await validateOfferId(offerId, true)
        await refundOffer(offerId)
    } catch (e) {
        return { error: `Could not complete the action: ${(e as Error).message}` }
    }
})

export const acceptSubmissionForm = form(v.object({
    submissionId: v.pipe(v.string(), v.uuid())
}), async ({ submissionId }) => {
    try {
        await validateSubmissionId(submissionId)
        await acceptSubmission(submissionId)
    } catch (e) {
        return { error: `Could not complete the action: ${(e as Error).message}` }
    }
})

export const rejectSubmissionForm = form(v.object({
    submissionId: v.pipe(v.string(), v.uuid())
}), async ({ submissionId }) => {
    try {
        await validateSubmissionId(submissionId)
        await rejectSubmission(submissionId)
    } catch (e) {
        return { error: `Could not complete the action: ${(e as Error).message}` }
    }
})

export const adjustUserPoints = form(v.object({
    user: v.pipe(v.string(), v.nonEmpty()),
    points: v.pipe(v.string(), v.nonEmpty(), v.transform(Number), v.integer()),
    message: v.optional(v.string())
}), async ({ user, points, message }) => {
    try {
        await createTransaction(user, points, { type: 'admin', message });
    } catch (e) {
        return { error: `Could not complete the action: ${(e as Error).message}` }
    }
})