<script lang="ts">
    import LedgerEntry from '$lib/client/LedgerEntry.svelte';
    import type { LayoutServerData } from '../../$types';
    import type { PageServerData } from './$types';

    const { data }: { data: PageServerData & LayoutServerData } = $props();
</script>

<div
    class="flex flex-col lg:flex-row justify-center items-center lg:gap-10 pt-20 lg:pt-30"
>
    <a href="/user/{data.user.id}">
        <img
            src={data.otherUser.picture}
            class="max-w-sm w-[100px] lg:w-3xs rounded-lg shadow-2xl"
            alt="profile"
        />
    </a>
    <div class="flex flex-col items-center gap-7">
        <h1 class="text-3xl lg:text-5xl font-bold mt-3">
            {data.otherUser.displayName}
        </h1>

        <p class="text-lgfont-semibold">
            @{data.otherUser.username}

            {#if data.otherUser.admin}
                <span class="badge badge-primary">Admin</span>
            {/if}
        </p>

        <div class="flex flex-row items-center gap-3">
            <p class="lg:text-lg">Balance:</p>
            <p class="italic text-2xl lg:text-3xl">
                {data.otherUserPoints} points
            </p>
        </div>
    </div>
</div>

<div class="divider m-10 lg:m-20"></div>

<h1 class="text-3xl font-bold mb-7 lg:mb-17">Recent Activity</h1>

<ul class="timeline timeline-vertical max-w-[90%]">
    {#each data.activity as ledgerEntry}
        <LedgerEntry {ledgerEntry} />
    {/each}
</ul>
