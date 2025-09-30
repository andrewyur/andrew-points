<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import { queryUsers } from '$lib/client/commands.remote';
    import ConfirmationForm from '$lib/client/ConfirmationForm.svelte';
    import ErrorHandlingForm from '$lib/client/ErrorHandlingForm.svelte';
    import GeneralFormDialog from '$lib/client/GeneralFormDialog.svelte';
    import type { LayoutServerData } from '../$types';
    import type { PageServerData } from './$types';
    import {
        buyOfferForm,
        createOfferForm,
        deleteOfferForm,
    } from './marketplace.remote';

    const { data }: { data: PageServerData & LayoutServerData } = $props();

    let activeOffer: null | (typeof data)['offers']['privateOffers'][number] =
        $state(null);

    let createModal: GeneralFormDialog<typeof createOfferForm>;
</script>

<h1>Marketplace</h1>

<p>Create or purchase public or private listings offering goods/services</p>

<button onclick={() => createModal.show()}>Create listing</button>

{#snippet offerListing(offer: (typeof data.offers.privateOffers)[number])}
    <div>
        {#if offer.posterId === data.user.id}
            <ErrorHandlingForm remoteForm={deleteOfferForm}>
                <input hidden name="offerId" value={offer.id} />
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
{/snippet}

<h2>Private offers</h2>

{#each data.offers.privateOffers as offer}
    {@render offerListing(offer)}
{/each}

<h2>Public</h2>

{#each data.offers.publicOffers as offer}
    {@render offerListing(offer)}
{/each}

<GeneralFormDialog bind:this={createModal} remoteForm={createOfferForm}>
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
        <input type="text" name="description" required />
    </label>
    <label>
        Visible to
        <select name="visibleTo">
            <option value={null}>-- Public --</option>
            <svelte:boundary>
                {#each await queryUsers() as user}
                    <option value={user.id}>{user.username}</option>
                {/each}
                {#snippet pending()}
                    <option>loading...</option>
                {/snippet}
            </svelte:boundary>
        </select>
    </label>
    <button type="submit">Submit</button>
</GeneralFormDialog>

<ConfirmationForm remoteForm={buyOfferForm} bind:activator={activeOffer}>
    <h1>Are you sure?</h1>
    <p>You are about to spend {activeOffer?.cost} points.</p>
    <p>This action is irreversible.</p>
    {#snippet formContents()}
        <input hidden name="offerId" value={activeOffer?.id!} />
    {/snippet}
</ConfirmationForm>
