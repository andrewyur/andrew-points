<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageServerData } from './$types';
    import type { Redeemable } from './+page.server';

    let { data }: { data: PageServerData } = $props();
    const { redeemableItems } = data;

    let activeRedeemable: Redeemable | undefined = $state();

    let confirmationDialog: HTMLDialogElement;
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
                        disabled={redeemable.cost > data.user.points}
                        onclick={() => {
                            activeRedeemable = redeemable;
                            confirmationDialog.showModal();
                        }}
                        aria-label="redeem">Buy</button
                    ></td
                >
            </tr>
        {/each}
    </tbody>
</table>

<dialog bind:this={confirmationDialog}>
    <h1>Are you sure?</h1>
    <p>You are about to spend {activeRedeemable?.cost} points</p>
    <button
        onclick={() => {
            activeRedeemable = undefined;
            confirmationDialog.close();
        }}
        aria-label="cancel">Cancel</button
    >
    <form use:enhance method="POST">
        <input
            type="hidden"
            name="redeemable_name"
            value={activeRedeemable?.name}
        />
        <button
            type="submit"
            onclick={() => {
                confirmationDialog.close();
                redeemedDialog.showModal();
            }}>Redeem</button
        >
    </form>
</dialog>

<dialog bind:this={redeemedDialog}>
    <h1>Congratulations!</h1>
    <p>{activeRedeemable?.redeemMessage}</p>
    <button
        onclick={() => {
            activeRedeemable = undefined;
            redeemedDialog.close();
        }}>Close</button
    >
</dialog>

<style>
    table {
        max-width: 800px;
    }
</style>
