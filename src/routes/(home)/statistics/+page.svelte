<script lang="ts">
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

{#each data.recentActivity as activity}
    <div>
        <h3>{activity.type}</h3>
        <p>User: {activity.user.username}</p>
        <p>amount: {activity.amount}</p>
        <p>
            at: {Intl.DateTimeFormat('en-us', {
                dateStyle: 'short',
                timeStyle: 'short',
            }).format(activity.createdAt)}
        </p>
        {#if 'bounty' in activity && activity.bounty}
            <p>bounty: {activity.bounty.title}</p>
            <p>
                fulfilled by: {activity.bounty.fulfilledBy ?? 'Not fulfilled'}
            </p>
        {:else if 'offer' in activity && activity.offer && activity.offer.visibleTo === null}
            <p>offer: {activity.offer.title}</p>
            <p>poster: {activity.offer.poster.username}</p>
            <p>buyer: {activity.offer.buyer?.username ?? 'Not Bought'}</p>
            <p>cost: {activity.offer.cost}</p>
        {/if}
    </div>
{/each}
