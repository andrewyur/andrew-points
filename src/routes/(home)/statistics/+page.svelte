<script lang="ts">
    import LedgerEntry from '$lib/client/LedgerEntry.svelte';
    import UserChip from '$lib/client/UserChip.svelte';
    import type { LayoutServerData } from '../$types';
    import type { PageServerData } from './$types';
    import { getRecentActivityPageQuery } from './statistics.remote';
    import { page } from '$app/state';
    import { onMount } from 'svelte';

    let { data }: { data: PageServerData & LayoutServerData } = $props();

    let currentPage = $state(data.recentActivityPage);
    let recentActivity = $state(data.recentActivity);

    async function changePage(increment: boolean) {
        if (increment) {
            currentPage += 1;
        } else {
            currentPage -= 1;
        }

        recentActivity = await getRecentActivityPageQuery(currentPage);
    }

    onMount(() => {
        const transactionId = page.url.searchParams.get('transactionId');
        if (transactionId !== null) {
            const el = document.getElementById(transactionId);
            if (el) {
                el.classList.add(
                    'bg-yellow-300',
                    'transition-[background-color]',
                    'transition-duration-300',
                );
                setTimeout(() => el.classList.remove('bg-yellow-300'), 2000);
                el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }
    });
</script>

<h1 class="text-4xl font-bold py-7">Leaderboard</h1>

<table class="border-separate border-spacing-x-4 border-spacing-y-3">
    <tbody>
        {#each data.allUserPoints as user, place}
            <tr>
                <td class="text-xl font-bold">{place + 1}</td>
                <td><UserChip user={user.user} /></td>
            </tr>
        {/each}
    </tbody>
</table>

<h1 class="text-4xl font-bold py-7">Recent Activity</h1>

<ul class="timeline timeline-vertical max-w-[90%]">
    {#each recentActivity as ledgerEntry}
        <LedgerEntry showUser={true} {ledgerEntry} />
    {/each}
</ul>

<div class="join pt-3">
    <button
        class:disabled={currentPage == 0}
        disabled={currentPage == 0}
        class="join-item btn"
        onclick={() => changePage(false)}>«</button
    >
    <button class="join-item btn">Page {currentPage + 1}</button>
    <button
        class:disabled={currentPage >= data.recentActivityPageAmount - 1}
        disabled={currentPage >= data.recentActivityPageAmount - 1}
        class="join-item btn"
        onclick={() => changePage(true)}>»</button
    >
</div>
