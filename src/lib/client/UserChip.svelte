<script lang="ts">
    import type { User } from '$lib/server/db/schema';
    import { queryUserPoints } from './commands.remote';

    const {
        user,
        size = 'medium',
        collapse = true,
    }: {
        user: User;
        size?: 'small' | 'medium' | 'large';
        collapse?: boolean;
    } = $props();
</script>

<a
    class="flex flex-row h-min w-max rounded-full bg-base-300 shadow-sm items-center gap-2"
    href="/user/{user.id}"
>
    <div class="avatar p-1">
        <div
            class="rounded-full {size === 'small'
                ? 'max-h-5 max-w-5'
                : 'max-h-12 max-w-12'}
                "
        >
            <img src={user.picture} alt="avatar" />
        </div>
    </div>
    <div class="mr-3 {collapse ? 'hidden lg:block' : ''}">
        <p class="{size === 'small' ? '' : 'font-bold '} text-nowrap">
            {user.displayName}
        </p>
        {#if size !== 'small'}
            <svelte:boundary>
                <p class="text-sm">
                    {await queryUserPoints(user.id)} Points
                </p>
                {#snippet pending()}
                    <p class="text-sm">loading...</p>
                {/snippet}
            </svelte:boundary>
        {/if}
    </div>
</a>
