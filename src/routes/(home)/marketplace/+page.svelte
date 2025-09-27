<script lang="ts">
    import ConfirmationForm from '$lib/client/ConfirmationForm.svelte';
    import ErrorHandlingForm from '$lib/client/ErrorHandlingForm.svelte';
    import GeneralFormDialog from '$lib/client/GeneralFormDialog.svelte';
    import type { LayoutServerData } from '../$types';
    import type { PageServerData } from './$types';

    const { data }: { data: PageServerData & LayoutServerData } = $props();

    let activeOffer: null | (typeof data)['offers']['privateOffers'][number] =
        $state(null);

    let createModal: GeneralFormDialog;
</script>

<h1>Marketplace</h1>

<p>Create or purchase public or private listings offering goods/services</p>

<button onclick={() => createModal.show()}>Create listing</button>

<h2>Private offers</h2>

{#each data.offers.privateOffers as offer}
    <div>
        <h3>{offer.title}</h3>
        <p>{offer.description}</p>
        <p>{offer.cost}</p>
        <div>
            <img src={offer.poster.picture} alt="poster" />
            <p>{offer.poster.username}</p>
        </div>
    </div>
{/each}

<h2>Public</h2>

{#each data.offers.publicOffers as offer}
    <div>
        {#if offer.posterId === data.user.id}
            <ErrorHandlingForm action="?/delete">
                <input type="hidden" name="id" value={offer.id} />
                <button type="submit">Delete</button>
            </ErrorHandlingForm>
        {/if}
        <button onclick={() => (activeOffer = offer)}>Buy</button>
        <h3>{offer.title}</h3>
        <p>{offer.description}</p>
        <p>{offer.cost}</p>
        <div>
            <img src={offer.poster.picture} alt="poster" />
            <p>{offer.poster.username}</p>
        </div>
    </div>
{/each}

<GeneralFormDialog bind:this={createModal} action="?/create">
    {#snippet header()}
        <h1>Create a listing</h1>
    {/snippet}
    <label>
        cost
        <input type="number" step="0" min="0" name="cost" required />
    </label>
    <label>
        title
        <input type="text" name="title" required />
    </label>
    <label>
        description
        <input type="text" name="description" />
    </label>
    <label>
        Visible to
        <select name="visibleTo">
            <option value="">-- Public --</option>
            {#each data.users as user}
                <option value={user.id}>{user.username}</option>
            {/each}
        </select>
    </label>
    <button type="submit">Submit</button>
</GeneralFormDialog>

<ConfirmationForm action="?/buy" bind:activator={activeOffer}>
    {#snippet formContents()}
        <input type="hidden" name="id" value={activeOffer?.id} />
    {/snippet}
    <h1>Are you sure?</h1>
    <p>You are about to spend {activeOffer?.cost} points.</p>
    <p>This action is irreversible.</p>
</ConfirmationForm>
