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
    import { onMount, type Snippet } from 'svelte';
    import NotificationItem from './NotificationItem.svelte';

    let { children, data }: { data: LayoutServerData; children: Snippet } =
        $props();
</script>

<div class="navbar bg-base-200 shadow-sm sticky top-0 z-20">
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
        <details class="dropdown dropdown-end">
            <summary class="btn btn-ghost btn-circle">
                <div class="indicator">
                    <SvgIcon path={mdiBellOutline} />
                    {#if data.notifications.length > 0}
                        <span class="badge badge-xs badge-accent indicator-item"
                            >{data.notifications.length}</span
                        >
                    {/if}
                </div>
            </summary>
            <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
            <ul
                class="list dropdown-content bg-base-100 rounded-box z-1 p-2 shadow w-max max-h-100 flex-nowrap overflow-y-scroll"
            >
                {#if data.notifications.length > 0}
                    <!-- <ErrorHandlingForm remoteForm={clearAllNotificationsForm}>
                        <button class="text-gray-500 w-full" type="submit"
                            >Clear All</button
                        >
                    </ErrorHandlingForm> -->
                    {#each data.notifications as notification (notification.id)}
                        <NotificationItem {notification} />
                    {/each}
                {:else}
                    <li class="px-10 py-4 text-gray-500">No notifications</li>
                {/if}
            </ul>
        </details>
    </div>
</div>

<div class="w-full flex flex-col items-center mb-10">
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
