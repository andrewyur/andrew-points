<script lang="ts">
    import { queryUsers } from '$lib/client/commands.remote';
    import ConfirmationForm from '$lib/client/ConfirmationForm.svelte';
    import ErrorHandlingForm from '$lib/client/ErrorHandlingForm.svelte';
    import GeneralFormDialog from '$lib/client/GeneralFormDialog.svelte';
    import SvgIcon from '$lib/client/SvgIcon.svelte';
    import { mdiArrowLeft, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
    import type { LayoutServerData } from '../$types';
    import type { PageServerData } from './$types';
    import {
        buyOfferForm,
        createOfferForm,
        deleteOfferForm,
    } from './marketplace.remote';
    import UserChip from '$lib/client/UserChip.svelte';

    const { data }: { data: PageServerData & LayoutServerData } = $props();

    let activeOffer: null | (typeof data)['offers']['privateOffers'][number] =
        $state(null);

    let createModal: GeneralFormDialog<typeof createOfferForm>;
</script>

<div class=" max-w-[1000px] w-[80%] my-7">
    <div class="flex flex-row justify-between items-center">
        <h1 class="font-bold text-4xl lg:text-6xl">Marketplace</h1>
        <button class="btn btn-square" onclick={() => createModal.show()}
            ><SvgIcon path={mdiPlus} /></button
        >
    </div>
    <p class="text-base lg:text-lg max-w-lg pt-3">
        Create or purchase public or private listings offering goods/services
    </p>
</div>

{#snippet offerListing(offer: (typeof data.offers.privateOffers)[number])}
    <div class="card bg-base-200 max-w-120 max-h-full w-full">
        <div class="card-body flex flex-col gap-5 lg:gap-8">
            <div class="flex flex-row justify-between">
                <a
                    class="card-title font-bold text-2xl lg:text-4xl max-w-full"
                    style="word-break: break-word;"
                    href="/marketplace/{offer.id}"
                >
                    {offer.title}
                </a>
                {#if offer.posterId === data.user.id}
                    <ErrorHandlingForm
                        remoteForm={deleteOfferForm.for(offer.id)}
                    >
                        <input hidden name="offerId" value={offer.id} />
                        <button
                            class="btn btn-error btn-soft btn-square"
                            type="submit"
                        >
                            <SvgIcon path={mdiTrashCanOutline} />
                        </button>
                    </ErrorHandlingForm>
                {/if}
            </div>

            <div class="flex flex-row justify-center gap-4 items-center">
                <UserChip collapse={true} user={offer.poster} />
                <SvgIcon path={mdiArrowLeft} />
                <h3
                    class="text-xl lg:text-2xl font-bold bg-accent text-accent-content w-max rounded-lg p-2 shadow-sm"
                >
                    {offer.cost} Points
                </h3>
            </div>

            <p>
                <span class="text-gray-500 italic">Listing Description :</span>
                {offer.description}
            </p>

            <button
                class="btn grow font-semibold bg-base-100"
                onclick={() => (activeOffer = offer)}
            >
                Purchase
            </button>
        </div>
    </div>
{/snippet}

<h2 class="text-2xl lg:text-4xl font-bold flex items-center gap-2 py-7">
    Private Offers <span class="text-sm text-gray-500 font-normal"
        >(Visible only to you)</span
    >
</h2>

<div
    class="flex flex-row flex-wrap justify-center items-center max-w-[90%] w-400 gap-5"
>
    {#each data.offers.privateOffers as offer}
        {@render offerListing(offer)}
    {/each}
</div>

<h2 class="text-2xl lg:text-4xl font-bold py-7">Public</h2>

<div
    class="flex flex-row flex-wrap justify-center items-center max-w-[90%] w-400 gap-5"
>
    {#each data.offers.publicOffers as offer}
        {@render offerListing(offer)}
    {/each}
</div>

<GeneralFormDialog bind:this={createModal} remoteForm={createOfferForm}>
    {#snippet header()}
        <h1 class="text-2xl font-bold text-center mb-4">Create a listing</h1>
    {/snippet}
    <input
        class="input validator"
        type="text"
        name="title"
        required
        maxlength="40"
        placeholder="Title"
    />
    <input
        class="input validator"
        type="number"
        step="0"
        min="0"
        name="cost"
        placeholder="Price"
        required
    />
    <textarea
        class="textarea"
        name="description"
        placeholder="Description"
        required
    ></textarea>
    <label class="select validator">
        <span class="label">Visible to</span>
        <select name="visibleTo">
            <option value={null}>-- Public --</option>
            <svelte:boundary>
                {#each await queryUsers() as user}
                    <option value={user.id}>{user.displayName}</option>
                {/each}
                {#snippet pending()}
                    <option>loading...</option>
                {/snippet}
            </svelte:boundary>
        </select>
    </label>
</GeneralFormDialog>

<ConfirmationForm
    remoteForm={buyOfferForm.for(activeOffer?.id ?? 'inactive')}
    bind:activator={activeOffer}
>
    <h1 class="text-3xl my-3">Are you sure?</h1>
    <p>You are about to spend {activeOffer?.cost} points.</p>
    <p>This action is irreversible.</p>
    {#snippet formContents()}
        <input hidden name="offerId" value={activeOffer?.id!} />
    {/snippet}
</ConfirmationForm>
