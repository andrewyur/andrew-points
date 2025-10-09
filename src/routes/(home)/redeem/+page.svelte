<script lang="ts">
    import ConfirmationForm from '$lib/client/ConfirmationForm.svelte';
    import type { LayoutServerData } from '../$types';
    import type { PageServerData } from './$types';
    import { redeemItemForm } from './redeem.remote';
    import type { Redeemable } from './redeemables';

    let { data }: { data: PageServerData & LayoutServerData } = $props();
    const { redeemableItems } = data;

    let activeRedeemable: Redeemable | null = $state(null);

    let redeemedDialog: HTMLDialogElement;
</script>

<div class=" max-w-[1000px] w-[80%] my-7">
    <h1 class="font-bold text-4xl lg:text-6xl">Redeem</h1>
    <p class="text-base lg:text-lg max-w-lg pt-3">
        Redeem your points for services from Miles & Andrew
    </p>
</div>

<table
    class="max-w-[700px] mb-10 lg:mb-15 border-separate border-spacing-x-4 border-spacing-y-3"
>
    <tbody>
        {#each redeemableItems as redeemable}
            <tr>
                <td>
                    <div class="flex flex-row items-center gap-2">
                        <h2 class="font-semibold lg:text-xl">
                            {redeemable.name}
                        </h2>
                        <span
                            class="badge badge-neutral badge-outline text-nowrap"
                            >{redeemable.cost} Points</span
                        >
                    </div>
                    <p class="text-gray-500">{redeemable.description}</p>
                </td>
                <td
                    ><button
                        class="btn btn-primary btn-block"
                        disabled={redeemable.cost > data.userPoints}
                        onclick={() => (activeRedeemable = redeemable)}
                        aria-label="redeem">Buy</button
                    ></td
                >
            </tr>
        {/each}
    </tbody>
</table>

<ConfirmationForm remoteForm={redeemItemForm} bind:activator={activeRedeemable}>
    <h1 class="text-3xl my-3">Are you sure?</h1>
    <p>You are about to spend {activeRedeemable?.cost} points.</p>
    <p>This is an irreversible action.</p>
    {#snippet formContents()}
        <input hidden name="redeemableId" value={activeRedeemable?.id!} />
    {/snippet}
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
