<script lang="ts">
    import ConfirmationForm from '$lib/client/ConfirmationForm.svelte';
    import type { LayoutServerData } from '../$types';
    import type { PageServerData } from './$types';
    import type { Redeemable } from './+page.server';

    let { data }: { data: PageServerData & LayoutServerData } = $props();
    const { redeemableItems } = data;

    let activeRedeemable: Redeemable | null = $state(null);

    let redeemedDialog: HTMLDialogElement;
</script>

<h1>Redeem Points</h1>

<table>
    <tbody>
        {#each redeemableItems as redeemable}
            <tr>
                <td>{redeemable.name}</td>
                <td>{redeemable.cost}</td>
                <td>{redeemable.description}</td>
                <td
                    ><button
                        disabled={redeemable.cost > data.userPoints}
                        onclick={() => (activeRedeemable = redeemable)}
                        aria-label="redeem">Buy</button
                    ></td
                >
            </tr>
        {/each}
    </tbody>
</table>

<ConfirmationForm bind:activator={activeRedeemable}>
    {#snippet formContents()}
        <input
            type="hidden"
            name="redeemable_name"
            value={activeRedeemable?.name}
        />
    {/snippet}
    <h1>Are you sure?</h1>
    <p>You are about to spend {activeRedeemable?.cost} points.</p>
    <p>This is an irreversible action.</p>
</ConfirmationForm>

<dialog bind:this={redeemedDialog}>
    <h1>Congratulations!</h1>
    <p>{activeRedeemable?.redeemMessage}</p>
    <button onclick={() => redeemedDialog.close()}>Close</button>
</dialog>

<style>
    table {
        max-width: 800px;
    }
</style>
