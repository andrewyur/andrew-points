<script lang="ts">
    import LedgerEntry from '$lib/client/LedgerEntry.svelte';
    import UserChip from '$lib/client/UserChip.svelte';
    import type { LayoutServerData } from '../$types';
    import type { PageServerData } from './$types';

    const { data }: { data: PageServerData & LayoutServerData } = $props();
</script>

<h1 class="text-4xl font-bold py-7">Leaderboard</h1>

<table class="border-separate border-spacing-x-4 border-spacing-y-3">
    <tbody>
        {#each data.allUserPoints as user, place}
            <tr>
                <td class="text-xl font-bold">{place + 1}</td>
                <td><UserChip collapse={false} user={user.user} /></td>
            </tr>
        {/each}
    </tbody>
</table>

<h1 class="text-4xl font-bold py-7">Recent Activity</h1>

<ul class="timeline timeline-vertical max-w-[90%]">
    {#each data.recentActivity as ledgerEntry}
        <LedgerEntry {ledgerEntry} />
    {/each}
</ul>
