<script lang="ts">
    import LedgerEntry from '$lib/client/LedgerEntry.svelte';
    import type { LayoutServerData } from '../$types';
    import type { PageServerData } from './$types';

    const { data }: { data: PageServerData & LayoutServerData } = $props();
</script>

<h1>Statistics</h1>

<h2>Leaderboard</h2>

<table>
    <thead>
        <tr>
            <th>points</th>
            <th>user</th>
        </tr>
    </thead>
    <tbody>
        {#each data.allUserPoints as user}
            <tr>
                <td>{user.points}</td>
                <td>{user.user.username}</td>
            </tr>
        {/each}
    </tbody>
</table>

<h2>Recent Activity</h2>

{#each data.recentActivity as ledgerEntry}
    <LedgerEntry {ledgerEntry} />
{/each}
