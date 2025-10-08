<script lang="ts">
    import type { ExpandedLedgerEntry } from '$lib/server/points';
    import { formatTimeAbsolute } from './time';
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
    <div class="timeline-middle">
        <span class="badge badge-neutral w-10">{ledgerEntry.amount}</span>
    </div>
    <div
        class="timeline-end timeline-box relative left-2 text-sm lg:text-lg flex flex-col gap-2"
        style="word-break: break-word;"
    >
        {#if ledgerEntry.type === 'bounty_escrow' || ledgerEntry.type === 'bounty_reward' || ledgerEntry.type === 'bounty_refund'}
            {#if ledgerEntry.bounty}
                <a
                    class="link font-semibold text-xl not-lg:text-lg"
                    href="/bounty/{ledgerEntry.bounty.id}"
                    >Bounty: {ledgerEntry.bounty.title}</a
                >
                {#if ledgerEntry.bounty.completed}
                    <span class="badge badge-success badge-sm">Completed</span>
                {/if}

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
            {#if ledgerEntry.message}
                <p>
                    <span class="text-gray-500 italic">message:</span>
                    {ledgerEntry.message}
                </p>
            {/if}
        {:else}
            {ledgerEntry.type}
        {/if}
    </div>
    <hr />
</li>
