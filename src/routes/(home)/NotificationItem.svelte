<script lang="ts">
    import ErrorHandlingForm from '$lib/client/ErrorHandlingForm.svelte';
    import { formatTimeRelative } from '$lib/time';
    import type { NotificationContext } from '$lib/server/notifications';
    import { dismissNotificationForm } from './notification.remote';
    import type { getNotifications } from './notifications';

    const {
        notification,
    }: { notification: Awaited<ReturnType<typeof getNotifications>>[number] } =
        $props();

    const title: { [k in NotificationContext['type']]: string } = {
        admin_points_adjustment: 'Admin points adjustment',
        bounty_completed: 'Bounty completed',
        bounty_expired: 'Bounty expired',
        bounty_submission_accepted: 'Bounty Submission accepted',
        bounty_submission_rejected: 'Bounty Submission rejected',
        item_redeemed: 'Someone redeemed an item',
        offer_completed: 'Offer completed',
        offer_confirmation: 'Confirm offer purchase',
        offer_dispute: 'Offer Dispute',
        offer_purchased: 'Offer Purchased',
        private_offer_posted: 'Private Offer Posted',
        new_submission: 'New Bounty Submission',
    };

    const link = $derived.by(() => {
        switch (notification.type as NotificationContext['type']) {
            case 'item_redeemed':
            case 'admin_points_adjustment':
                return `/statistics?transactionId=${notification.ledgerId}`;
            case 'bounty_completed':
            case 'bounty_expired':
            case 'bounty_submission_accepted':
            case 'bounty_submission_rejected':
                return `/bounties/${notification.bountyId}`;
            case 'offer_completed':
            case 'offer_purchased':
            case 'private_offer_posted':
                return `/marketplace/${notification.offerId}`;
            case 'offer_confirmation':
            case 'offer_dispute':
            case 'new_submission':
                return '/user';
        }

        return 'unknown';
    });

    let notificationElement: HTMLLIElement;
</script>

<li
    bind:this={notificationElement}
    class="list-row flex flex-row justify-between items-center"
>
    <div>
        <div class="text-md whitespace-nowrap">
            {title[notification.type as keyof typeof title]}
        </div>
        <div class="text-sm link flex gap-2">
            <a href={link}>see more</a>
            <ErrorHandlingForm
                remoteForm={dismissNotificationForm.for(notification.id)}
            >
                <input
                    type="hidden"
                    name="notificationId"
                    value={notification.id}
                />
                <button class="text-gray-500" type="submit">dismiss</button>
            </ErrorHandlingForm>
        </div>
    </div>
    <span class="text-xs text-gray-500"
        >{formatTimeRelative(notification.createdAt)}</span
    >
</li>
