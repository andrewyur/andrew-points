<script lang="ts">
    import type { ExpandedLedgerEntry } from '$lib/server/points';
    import { redeemableItems } from '../../routes/(home)/redeem/redeemables';
    import { formatTimeAbsolute } from '../time';
    import UserChip from './UserChip.svelte';

    const {
        ledgerEntry,
        showUser = false,
    }: {
        ledgerEntry: ExpandedLedgerEntry;
        showUser?: boolean;
    } = $props();
</script>

<li
    style="grid-template-columns: 0, auto var( --timeline-col-end, minmax(0, 1fr) );
    };"
    class="flex flex-row justify-start target:bg-yellow-300"
    id={ledgerEntry.id}
>
    <hr />
    <div class="timeline-start pr-2 not-lg:hidden w-35">
        {formatTimeAbsolute(ledgerEntry.createdAt)}
    </div>
    <div class="timeline-middle indicator">
        <span class="badge badge-neutral w-10">{ledgerEntry.amount}</span>
    </div>
    <div
        class="timeline-end timeline-box relative left-2 text-sm lg:text-base flex flex-col gap-2"
        style="word-break: break-word;"
    >
        {#if ledgerEntry.type === 'bounty_escrow' || ledgerEntry.type === 'bounty_reward' || ledgerEntry.type === 'bounty_refund'}
            {#if ledgerEntry.bounty}
                <a
                    class=" flex flex-row gap-1 items-center"
                    href="/bounty/{ledgerEntry.bounty.id}"
                    ><p class="link font-semibold text-xl not-lg:text-lg">
                        Bounty: {ledgerEntry.bounty.title}
                    </p>
                    {#if ledgerEntry.bounty.completed}
                        <span class="badge badge-success badge-sm text-nowrap"
                            >Completed</span
                        >
                    {/if}</a
                >
                <div hidden={!showUser}>
                    <UserChip size="small" user={ledgerEntry.user} />
                </div>

                <div class="flex flex-row items-center gap-2">
                    <span class="text-gray-500 italic">poster:</span>
                    <UserChip size="small" user={ledgerEntry.bounty.creator} />
                </div>
                {#if ledgerEntry.bounty.fulfiller}
                    <div class="flex flex-row items-center gap-2">
                        <span class="text-gray-500 italic">fulfiller:</span>
                        <UserChip
                            size="small"
                            user={ledgerEntry.bounty.creator}
                        />
                    </div>
                {/if}
            {:else}
                Bounty not found...
            {/if}
        {:else if ledgerEntry.type === 'offer_escrow' || ledgerEntry.type === 'offer_payout' || ledgerEntry.type === 'offer_refund'}
            {#if ledgerEntry.offer && ledgerEntry.offer.visibleTo === null}
                <a
                    class="link font-semibold text-xl not-lg:text-lg"
                    href="/bounty/{ledgerEntry.offer.id}"
                    >Offer: {ledgerEntry.offer.title}</a
                >
                <div hidden={!showUser}>
                    <UserChip size="small" user={ledgerEntry.user} />
                </div>

                <div class="flex flex-row items-center gap-2">
                    <span class="text-gray-500 italic">poster:</span>
                    <UserChip size="small" user={ledgerEntry.offer.poster} />
                </div>
                {#if ledgerEntry.offer.buyer}
                    <div class="flex flex-row items-center gap-2">
                        <span class="text-gray-500 italic">buyer:</span>
                        <UserChip size="small" user={ledgerEntry.offer.buyer} />
                    </div>
                {/if}
            {:else}
                Offer not found...
            {/if}
        {:else if ledgerEntry.type === 'admin'}
            <p class="font-semibold text-xl not-lg:text-lg">
                Admin Points Adjustment
            </p>
            <div hidden={!showUser}>
                <UserChip size="small" user={ledgerEntry.user} />
            </div>

            {#if ledgerEntry.message}
                <p>
                    <span class="text-gray-500 italic">message:</span>
                    {ledgerEntry.message}
                </p>
            {/if}
        {:else if ledgerEntry.type.startsWith('redeemed_reward')}
            <p class="font-semibold text-xl not-lg:text-lg">Redeemed Reward</p>
            <div hidden={!showUser}>
                <UserChip size="small" user={ledgerEntry.user} />
            </div>
            <p>
                <span class="text-gray-500 italic">reward:</span>
                {redeemableItems.find(
                    (r) => r.id === ledgerEntry.type.split('#')[1],
                )?.name ?? 'Could not find redeemable'}
            </p>
        {:else if ledgerEntry.type.startsWith('earn_payout')}
            <p class="font-semibold text-xl not-lg:text-lg">Earn Payout</p>
            <div hidden={!showUser}>
                <UserChip size="small" user={ledgerEntry.user} />
            </div>
            <p>
                <span class="text-gray-500 italic">task type:</span>
                <span class="capitalize">{ledgerEntry.type.split('#')[1]}</span>
            </p>
        {:else}
            {ledgerEntry.type}
        {/if}
    </div>
    <hr />
</li>
