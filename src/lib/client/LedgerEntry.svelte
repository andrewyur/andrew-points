<script lang="ts">
    import type { ExpandedLedgerEntry } from '$lib/server/points';

    const {
        ledgerEntry,
    }: {
        ledgerEntry: ExpandedLedgerEntry;
    } = $props();
</script>

<div>
    <h3>{ledgerEntry.type}</h3>
    <p>User: {ledgerEntry.user.username}</p>
    <p>amount: {ledgerEntry.amount}</p>
    <p>
        at: {Intl.DateTimeFormat('en-us', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(ledgerEntry.createdAt)}
    </p>
    {#if ledgerEntry.bounty}
        <p>bounty: {ledgerEntry.bounty.title}</p>
        <p>
            fulfilled by: {ledgerEntry.bounty.fulfilledBy ?? 'Not fulfilled'}
        </p>
    {:else if ledgerEntry.offer && ledgerEntry.offer.visibleTo === null}
        <p>offer: {ledgerEntry.offer.title}</p>
        <p>poster: {ledgerEntry.offer.poster.username}</p>
        <p>buyer: {ledgerEntry.offer.buyer?.username ?? 'Not Bought'}</p>
        <p>cost: {ledgerEntry.offer.cost}</p>
    {/if}
    {#if ledgerEntry.message}
        <p>{ledgerEntry.message}</p>
    {/if}
</div>
