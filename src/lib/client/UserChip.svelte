<script lang="ts">
    import type { User } from '$lib/server/db/schema';
    import { queryUserPoints } from './commands.remote';

    const {
        user,
        size = 'large',
        collapse = false,
    }: {
        user: User;
        size?: 'small' | 'large';
        collapse?: boolean;
    } = $props();
</script>

<a
    class={[
        'flex flex-row h-min w-max rounded-full bg-base-300 p-1 shadow-sm items-center',
        {
            'gap-1': size === 'small',
            'gap-2': size !== 'small',
        },
    ]}
    href="/user/{user.id}"
>
    <div class="avatar">
        <div
            class={[
                'rounded-full',
                {
                    'max-h-5 max-w-5': size === 'small',
                    'max-h-12 max-w-12': size !== 'small',
                },
            ]}
        >
            <img src={user.picture} alt="avatar" />
        </div>
    </div>
    <div
        class={{
            'hidden lg:block': collapse,
            'mr-1': size === 'small',
            'mr-2': size !== 'small',
        }}
    >
        <p class="font-semibold">{user.displayName}</p>
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
