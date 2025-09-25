<script lang="ts">
    import { enhance } from '$app/forms';
    import { errorState, infoState } from '$lib/client/status';

    let errorDialog: HTMLDialogElement;
    let infoDialog: HTMLDialogElement;

    $effect(() => {
        if ($errorState !== null) {
            errorDialog.showModal();
        } else {
            errorDialog.close();
        }
    });
    $effect(() => {
        if ($infoState !== null) {
            infoDialog.showModal();
        } else {
            infoDialog.close();
        }
    });

    let { children } = $props();
</script>

<div>
    <a href="/">Lodge Points</a>
    <a href="/redeem">Redeem</a>
    <a href="/bounties">Bounties</a>
    <a href="/marketplace">Marketplace</a>
    <a href="/earn">Earn</a>
    <a href="/statistics">Statistics</a>
    <form method="post" action="/logout" use:enhance>
        <button>Sign out</button>
    </form>
</div>

{@render children()}

<dialog bind:this={errorDialog}>
    <p>{$errorState}</p>
    <button onclick={() => errorState.set(null)}>Close</button>
</dialog>

<dialog bind:this={infoDialog}>
    <p>{$infoState}</p>
    <button onclick={() => infoState.set(null)}>Ok</button>
</dialog>

<style>
    div {
        position: static;
        top: 0;
        width: 100vw;
        left: 0;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 10px;
        background-color: purple;
        box-sizing: border-box;
        align-items: center;
    }
</style>
