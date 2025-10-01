import { form } from "$app/server";
import { db } from "$lib/server/db";
import * as v from "valibot"
import * as table from "$lib/server/db/schema"
import { and, eq } from "drizzle-orm";
import { acceptSubmission, confirmOffer, disputeOffer, refundOffer, rejectSubmission } from "./userInfo";
import { extractUser, getAdmins } from "$lib/server/user";
import { createTransaction } from "$lib/server/points";
import { discordAnnouncement } from "$lib/server/discord";
import { createNotification } from "$lib/server/notifications";

const validateOfferId = async (offerId: string, admin?: boolean) => {
    const user = extractUser();

    if (admin && !user.admin) throw Error("User is not an admin")

    const ownsOffer = admin ? [] : [eq(table.offer.buyerId, user.id)]
    const correctState = admin ? [eq(table.offer.state, "disputed")] : [eq(table.offer.state, "pending")]

    const offer = await db.query.offer.findFirst({ where: and(eq(table.offer.id, offerId), ...ownsOffer, ...correctState) })

    if (!offer) throw Error("No offer with that id")

    return offer
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

    return submission
}

export const confirmOfferForm = form(v.object({
    offerId: v.pipe(v.string(), v.uuid())
}), async ({ offerId }) => {
    try {
        const offer = await validateOfferId(offerId)
        await confirmOffer(offerId)
        createNotification(offer.posterId, { type: "offer_completed", offerId: offer.id })
    } catch (e) {
        return { error: `Could not complete the action: ${(e as Error).message}` }
    }
})

export const disputeOfferForm = form(v.object({
    offerId: v.pipe(v.string(), v.uuid())
}), async ({ offerId }) => {
    try {
        const offer = await validateOfferId(offerId)
        await disputeOffer(offerId)
        const admins = await getAdmins()
        admins.forEach(a => createNotification(a.id, { type: "offer_dispute", offerId: offer.id }))
    } catch (e) {
        return { error: `Could not complete the action: ${(e as Error).message}` }
    }
})

export const confirmDisputedOfferForm = form(v.object({
    offerId: v.pipe(v.string(), v.uuid())
}), async ({ offerId }) => {
    try {
        const offer = await validateOfferId(offerId, true)
        await confirmOffer(offerId)
        createNotification(offer.posterId, { type: "offer_completed", offerId: offer.id })
    } catch (e) {
        return { error: `Could not complete the action: ${(e as Error).message}` }
    }
})


export const refundDisputedOfferForm = form(v.object({
    offerId: v.pipe(v.string(), v.uuid())
}), async ({ offerId }) => {
    try {
        const offer = await validateOfferId(offerId, true)
        await refundOffer(offerId)
        createNotification(offer.posterId, { type: "offer_completed", offerId: offer.id })
    } catch (e) {
        return { error: `Could not complete the action: ${(e as Error).message}` }
    }
})

export const acceptSubmissionForm = form(v.object({
    submissionId: v.pipe(v.string(), v.uuid())
}), async ({ submissionId }) => {
    try {
        const submission = await validateSubmissionId(submissionId)
        await acceptSubmission(submissionId)
        await createNotification(submission.submitterId, { type: "bounty_submission_accepted", submissionId })
    } catch (e) {
        return { error: `Could not complete the action: ${(e as Error).message}` }
    }
})

export const rejectSubmissionForm = form(v.object({
    submissionId: v.pipe(v.string(), v.uuid())
}), async ({ submissionId }) => {
    try {
        const submission = await validateSubmissionId(submissionId)
        await rejectSubmission(submissionId)
        await createNotification(submission.submitterId, { type: "bounty_submission_rejected", submissionId })
    } catch (e) {
        return { error: `Could not complete the action: ${(e as Error).message}` }
    }
})

export const adjustUserPoints = form(v.object({
    user: v.pipe(v.string(), v.nonEmpty()),
    points: v.pipe(v.string(), v.nonEmpty(), v.transform(Number), v.integer()),
    message: v.optional(v.string()),
    announce: v.optional(v.string())
}), async ({ user, points, message, announce }) => {
    try {
        const ledgerEntry = await createTransaction(user, points, { type: 'admin', message });
        await createNotification(user, { type: "admin_points_adjustment", ledgerId: ledgerEntry.id })
        if (announce) {
            await discordAnnouncement({ type: "admin_point_adjustment", ledgerEntryId: ledgerEntry.id })
        }
    } catch (e) {
        return { error: `Could not complete the action: ${(e as Error).message}` }
    }
})