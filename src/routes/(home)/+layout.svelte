<script lang="ts">
    import { errorState, infoState } from '$lib/client/status';
    import SvgIcon from '$lib/client/SvgIcon.svelte';
    import {
        mdiAlertCircle,
        mdiBellOutline,
        mdiCashMultiple,
        mdiChartBar,
        mdiFileSign,
        mdiHome,
        mdiInformationSlabCircleOutline,
        mdiMenu,
        mdiShoppingOutline,
        mdiWalletGiftcard,
    } from '@mdi/js';
    import type { LayoutServerData } from './$types';
    import type { Snippet } from 'svelte';
    import NotificationItem from './NotificationItem.svelte';

    let { children, data }: { data: LayoutServerData; children: Snippet } =
        $props();
</script>

<div class="navbar bg-base-200 shadow-sm sticky top-0">
    <div class="navbar-start">
        <div class="dropdown">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
                <SvgIcon path={mdiMenu} />
            </div>
            <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
            <ul
                tabindex="0"
                class="menu menu-md dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
                <li>
                    <a href="/user"> <SvgIcon path={mdiHome} />Home</a>
                </li>
                <li>
                    <a href="/bounties">
                        <SvgIcon path={mdiFileSign} />Bounties</a
                    >
                </li>
                <li>
                    <a href="/marketplace">
                        <SvgIcon path={mdiShoppingOutline} />Marketplace</a
                    >
                </li>
                <li>
                    <a href="/redeem"
                        ><SvgIcon path={mdiWalletGiftcard} /> Redeem</a
                    >
                </li>
                <li>
                    <a href="/earn"><SvgIcon path={mdiCashMultiple} /> Earn</a>
                </li>
                <li>
                    <a href="/statistics"
                        ><SvgIcon path={mdiChartBar} />Statistics</a
                    >
                </li>
            </ul>
        </div>
    </div>
    <div class="navbar-center">
        <a class="btn btn-ghost text-xl" href="/user">Lodge Points</a>
    </div>
    <div class="navbar-end">
        <div class="dropdown dropdown-end">
            <button tabindex="0" class="btn btn-ghost btn-circle">
                <div class="indicator">
                    <SvgIcon path={mdiBellOutline} />
                    {#if data.notifications}
                        <span
                            class="badge badge-xs badge-primary indicator-item"
                            >{data.notifications.length}</span
                        >
                    {/if}
                </div>
            </button>
            <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
            <ul
                tabindex="0"
                class="list dropdown-content bg-base-100 rounded-box z-1 p-2 shadow w-max max-h-100 overflow-y-scroll flex-nowrap overflow-visible"
            >
                {#if data.notifications}
                    {#each data.notifications as notification}
                        <NotificationItem {notification} />
                    {/each}
                {:else}
                    <li>No notifications</li>
                {/if}
            </ul>
        </div>
    </div>
</div>

<div class="min-h-screen w-full">
    {@render children()}
</div>

<div
    class="fixed bottom-2 left-2 right-2 pointer-events-none flex flex-col items-center"
>
    <div
        hidden={$errorState === null}
        role="alert"
        class="alert alert-error pointer-events-auto"
    >
        <SvgIcon path={mdiAlertCircle} />
        <span>{$errorState}</span>
        <button
            class="btn btn-soft btn-error"
            onclick={() => errorState.set(null)}>Ok</button
        >
    </div>
    <div
        hidden={$infoState === null}
        role="alert"
        class="alert alert-info pointer-events-auto"
    >
        <SvgIcon path={mdiInformationSlabCircleOutline} />
        <span>{$infoState}</span>
        <button
            class="btn btn-soft btn-info"
            onclick={() => infoState.set(null)}>Ok</button
        >
    </div>
</div>
