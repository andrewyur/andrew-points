<script lang="ts">
    import LedgerEntry from '$lib/client/LedgerEntry.svelte';
    import type { LayoutServerData } from '../../$types';
    import type { PageServerData } from './$types';

    const { data }: { data: PageServerData & LayoutServerData } = $props();
</script>

<h1>Points Balance: {data.otherUserPoints}</h1>

<h1>Recent Activity</h1>

{#each data.activity as ledgerEntry}
    <LedgerEntry {ledgerEntry} />
{/each}
