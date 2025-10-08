<script lang="ts">
    import ErrorHandlingForm from '$lib/client/ErrorHandlingForm.svelte';
    import GeneralFormDialog from '$lib/client/GeneralFormDialog.svelte';
    import SvgIcon from '$lib/client/SvgIcon.svelte';
    import {
        mdiArrowLeft,
        mdiTrashCanOutline,
        mdiPlus,
        mdiPlusBox,
    } from '@mdi/js';
    import type { LayoutServerData } from '../$types';
    import type { PageServerData } from './$types';
    import { createBountyForm, deleteBountyForm } from './bounties.remote';
    import UserChip from '$lib/client/UserChip.svelte';
    import { formatTimeRelative } from '$lib/client/time';

    let { data }: { data: PageServerData & LayoutServerData } = $props();

    let createModal: GeneralFormDialog<typeof createBountyForm>;

    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const threeDaysLaterValue = threeDaysLater.toISOString().split('T')[0];

    function getDeadlineStyling(deadline: Date) {
        const dueIn = deadline.getTime() - new Date().getTime();

        // less than an hour
        if (dueIn < 1000 * 60 * 60) {
            return 'text-red-500 text-xl';
        }

        // less than 3 hours
        if (dueIn < 1000 * 60 * 60 * 3) {
            return 'text-red-500 text-lg';
        }

        // less than a day
        if (dueIn < 1000 * 60 * 60 * 24) {
            return 'text-red-500';
        }

        return '';
    }
</script>

<div class="flex flex-row justify-between max-w-[1000px] w-[80%] items-center">
    <h1 class="font-bold text-4xl lg:text-6xl my-7">Bounties</h1>

    <button class="btn btn-square" onclick={() => createModal.show()}
        ><SvgIcon path={mdiPlus} /></button
    >
</div>

<div
    class="flex flex-row flex-wrap justify-center items-center max-w-[90%] w-400 gap-5"
>
    {#each data.bounties as bounty (bounty.id)}
        <div class="card bg-base-200 max-w-120 max-h-full w-full">
            <div class="card-body flex flex-col gap-5 lg:gap-8">
                <div class="flex flex-row justify-between">
                    <div>
                        <a
                            class="card-title font-bold text-2xl lg:text-4xl max-w-full"
                            style="word-break: break-word;"
                            href="/bounties/{bounty.id}"
                        >
                            {bounty.title}
                        </a>
                        <p
                            class="font-semibold {getDeadlineStyling(
                                bounty.deadline,
                            )}"
                        >
                            Due {formatTimeRelative(bounty.deadline)}
                        </p>
                    </div>
                    {#if data.user.admin}
                        <ErrorHandlingForm
                            remoteForm={deleteBountyForm.for(bounty.id)}
                        >
                            <input
                                type="hidden"
                                name="bountyId"
                                value={bounty.id}
                            />
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
                    <h3
                        class="text-xl lg:text-2xl font-bold bg-accent text-accent-content w-max rounded-lg p-2 shadow-sm"
                    >
                        {bounty.reward} Points
                    </h3>
                    <SvgIcon path={mdiArrowLeft} />
                    <UserChip collapse={true} user={bounty.creator} />
                </div>
                <p>
                    <span class="text-gray-500 italic"
                        >Completion Criteria:</span
                    >
                    {bounty.fulfillmentCriteria}
                </p>

                <a
                    class="card-actions flex-row justify-center !w-full"
                    href="/bounties/{bounty.id}"
                >
                    <div class="btn btn-square bg-base-100">
                        <SvgIcon path={mdiPlusBox} />
                    </div>
                    <div class="indicator grow">
                        <div class="btn grow font-semibold bg-base-100">
                            Submissions
                        </div>
                        {#if bounty.submissions.length > 0}
                            <span class="indicator-item badge badge-primary"
                                >{bounty.submissions.length}</span
                            >
                        {/if}
                    </div>
                </a>
            </div>
        </div>
    {/each}
</div>

<GeneralFormDialog remoteForm={createBountyForm} bind:this={createModal}>
    {#snippet header()}
        <h1 class="text-2xl font-bold text-center mb-4">Create a Bounty</h1>
    {/snippet}
    <input
        class="input validator"
        name="title"
        required
        maxlength="40"
        placeholder="Bounty Title"
    />
    <p class="text-md">
        An admin will approve/deny submissions for your bounty. This tells them
        how to know when a submission has successfully completed your bounty.
    </p>
    <textarea
        class="textarea"
        name="fulfillmentCriteria"
        required
        placeholder="Photo/Video must contain..."
    ></textarea>
    <p class="text-md">
        Your bounty will expire in a set amount of time. The default is 3 days.
    </p>
    <label class="input validator">
        <span class="label">Deadline</span>
        <input
            name="deadline"
            required
            type="date"
            value={threeDaysLaterValue}
        />
    </label>
    <p class="text-md">
        Points are deducted when you create a bounty and awarded to whoever
        completes it. If it expires, points are returned. Rewards must be at
        least 5% of your balance.
    </p>
    <input
        class="input validator"
        name="reward"
        step="1"
        required
        type="number"
        min={Math.round(data.userPoints * 0.05)}
        max={data.userPoints}
        placeholder="Points Reward"
    />
</GeneralFormDialog>
