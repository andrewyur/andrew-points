<script lang="ts">
    import ErrorHandlingForm from '$lib/client/ErrorHandlingForm.svelte';
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
    };

    // svelte-ignore non_reactive_update
    let link: string;
    switch (notification.type as NotificationContext['type']) {
        case 'item_redeemed':
        case 'admin_points_adjustment':
            link = `/statistics?transactionId=${notification.ledgerId}`;
            break;
        case 'bounty_completed':
        case 'bounty_expired':
        case 'bounty_submission_accepted':
        case 'bounty_submission_rejected':
            link = `/bounties/${notification.bountyId}`;
            break;
        case 'offer_completed':
        case 'offer_purchased':
        case 'private_offer_posted':
            link = `/offers/${notification.offerId}`;
            break;
        case 'offer_confirmation':
        case 'offer_dispute':
            link = '/user';
            break;
    }

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const divisions: { limit: number; unit: Intl.RelativeTimeFormatUnit }[] = [
        { limit: 60, unit: 'second' },
        { limit: 60, unit: 'minute' },
        { limit: 24, unit: 'hour' },
        { limit: 7, unit: 'day' },
    ];

    const diffMs = notification.createdAt.getTime() - new Date().getTime();
    const diffSec = Math.round(diffMs / 1000);

    // svelte-ignore non_reactive_update
    let relTime: string;

    let value = diffSec;
    for (let i = 0; i < divisions.length; i++) {
        const division = divisions[i];
        relTime = rtf.format(Math.round(value), division.unit);
        if (Math.abs(value) < division.limit) {
            break;
        }
        value /= division.limit;
    }

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
    <span class="text-xs text-gray-500">{relTime}</span>
</li>
