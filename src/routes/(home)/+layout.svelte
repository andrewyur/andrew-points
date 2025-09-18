<script lang="ts">
    import { enhance } from '$app/forms';
    import { errorState } from '$lib/client/error';

    let errorDialog: HTMLDialogElement;

    $effect(() => {
        if ($errorState !== null) {
            errorDialog.showModal();
        } else {
            errorDialog.close();
        }
    });

    let { children } = $props();
</script>

<div>
    <a href="/">Lodge Points</a>
    <a href="/redeem">Redeem</a>
    <a href="/bounties">Bounties</a>
    <form method="post" action="/logout" use:enhance>
        <button>Sign out</button>
    </form>
</div>

{@render children()}

<dialog bind:this={errorDialog}>
    <p>{$errorState}</p>
    <button onclick={() => errorState.set(null)}>Close</button>
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
