<script lang="ts">
    import type { ExpandedLedgerEntry } from '$lib/server/points';
    import { mdiCircle } from '@mdi/js';
    import SvgIcon from './SvgIcon.svelte';
    import { formatTimeAbsolute } from './time';
    import UserChip from './UserChip.svelte';

    const {
        ledgerEntry,
    }: {
        ledgerEntry: ExpandedLedgerEntry;
    } = $props();
</script>

<!-- <li>
    <div class="timeline-start">1984</div>
    <div class="timeline-middle">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="h-5 w-5"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
    <div class="timeline-end timeline-box">First Macintosh computer</div>
    <hr />
  </li> -->

<li
    style="grid-template-columns: 0, auto var( --timeline-col-end, minmax(0, 1fr) );
    };"
    class="flex flex-row justify-start"
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

                <p class="flex flex-row items-center gap-2">
                    <span class="text-gray-500 italic">poster:</span>
                    <UserChip
                        size="small"
                        collapse={false}
                        user={ledgerEntry.bounty.creator}
                    />
                </p>
                {#if ledgerEntry.bounty.fulfiller}
                    <p class="flex flex-row items-center gap-2">
                        <span class="text-gray-500 italic">fulfiller:</span>
                        <UserChip
                            size="small"
                            collapse={false}
                            user={ledgerEntry.bounty.creator}
                        />
                    </p>
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
                <p class="flex flex-row items-center gap-2">
                    <span class="text-gray-500 italic">poster:</span>
                    <UserChip
                        size="small"
                        collapse={false}
                        user={ledgerEntry.offer.poster}
                    />
                </p>
                {#if ledgerEntry.offer.buyer}
                    <p class="flex flex-row items-center gap-2">
                        <span class="text-gray-500 italic">buyer:</span>
                        <UserChip
                            size="small"
                            collapse={false}
                            user={ledgerEntry.offer.buyer}
                        />
                    </p>
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
