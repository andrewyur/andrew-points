<script lang="ts">
    import { renderMedia } from '$lib/client/RenderMedia.svelte';
    import type { PageServerData } from './$types';
    import {
        createSubmissionForm,
        deleteBountyForm,
        deleteSubmissionForm,
        fileHashExists,
    } from '../bounties.remote';
    import PerItemFormDialog from '$lib/client/PerItemFormDialog.svelte';
    import SvgIcon from '$lib/client/SvgIcon.svelte';
    import { computeFileHash } from '$lib/hashMedia';
    import UserChip from '$lib/client/UserChip.svelte';
    import { mdiPlusBox } from '@mdi/js';
    import GeneralFormDialog from '$lib/client/GeneralFormDialog.svelte';
    import { formatTime } from '$lib/client/time';

    const { data }: { data: PageServerData } = $props();

    let submissionForm: GeneralFormDialog<typeof createSubmissionForm>;
    let fileInput: HTMLInputElement | null = $state(null);

    async function validateMedia() {
        const file = fileInput?.files?.[0];

        if (file === undefined) return;

        const hash = await computeFileHash(file);

        if (await fileHashExists(hash)) {
            fileInput?.setCustomValidity(
                'Submission with that media already exists!',
            );
        } else {
            fileInput?.setCustomValidity('');
        }

        console.log(fileInput?.validationMessage);
    }

    let submissionsOpen = $state(false);
</script>

<div class="flex flex-col pt-5 items-center max-w-[90%]">
    <h1
        class="text-3xl lg:text-6xl font-bold pt-5 max-w-[1000px] mb-5 lg:mb-10"
        style="word-break: break-word;"
    >
        {data.bounty.title}
    </h1>
    <table
        class="max-w-[700px] mb-10 lg:mb-15 border-separate border-spacing-x-4 border-spacing-y-3"
    >
        <tbody>
            <tr>
                <td class="text-lg text-gray-500 italic text-right"
                    >Status:
                </td>
                <td>
                    <span
                        class="badge badge-lg {data.bounty.completed
                            ? 'badge-success'
                            : 'badge-neutral'}"
                        >{data.bounty.completed
                            ? 'Completed'
                            : 'Unfulfilled'}</span
                    >
                </td>
            </tr>
            <tr>
                <td class="text-lg text-gray-500 italic text-right"
                    >Posted By:
                </td>
                <td>
                    <UserChip collapse={false} user={data.bounty.creator} />
                </td>
            </tr>
            <tr>
                <td class="align-top text-lg text-gray-500 italic text-right"
                    >Reward:
                </td>
                <td class="text-lg">
                    {data.bounty.reward} Points
                </td>
            </tr>
            <tr>
                <td
                    class="align-top text-lg text-gray-500 italic text-right lg:whitespace-nowrap"
                    >Completion Criteria:</td
                >
                <td class="text-lg">
                    {data.bounty.fulfillmentCriteria}
                </td>
            </tr>
            <tr>
                <td class="align-top text-lg text-gray-500 italic text-right"
                    >Deadline:
                </td>
                <td class="text-lg">
                    {Intl.DateTimeFormat('en-us', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                    }).format(data.bounty.deadline)} ({formatTime(
                        data.bounty.deadline,
                    )})
                </td>
            </tr>
        </tbody>
    </table>

    <div class="flex flex-col gap-4 items-center w-full">
        <button class="btn btn-wide" onclick={() => submissionForm.show()}
            ><SvgIcon path={mdiPlusBox} /> Create a Submission</button
        >

        <div class="indicator max-w-[85%] w-fit">
            <div
                class="collapse bg-base-100 border-base-300 border mb-5 transition-[width] duration-1000 w-fit"
            >
                <input type="checkbox" bind:checked={submissionsOpen} />

                <div
                    class="collapse-title font-semibold text-lg justify-between"
                >
                    Submissions
                </div>
                <div
                    class="collapse-content flex flex-wrap gap-4 w-full items-center justify-around"
                >
                    {#if data.bounty.submissions.length > 0}
                        {#each data.bounty.submissions as submission}
                            <div
                                class="card shadow-sm bg-base-100 overflow-hidden relative w-[300px] h-[300px]"
                            >
                                {@render renderMedia(
                                    submission.media,
                                    '300px',
                                    '300px',
                                )}
                                <span
                                    class="badge badge-lg {submission.state ===
                                    'completed'
                                        ? 'badge-success'
                                        : submission.state === 'rejected'
                                          ? 'badge-error'
                                          : ''} absolute top-3 left-3"
                                    >{submission.state}</span
                                >
                            </div>
                        {/each}
                    {:else}
                        <p class="text-lg">Bounty has no submissions yet...</p>
                    {/if}
                </div>
            </div>
            {#if data.bounty.submissions.length > 0}
                <span class="indicator-item badge badge-primary"
                    >{data.bounty.submissions.length}</span
                >
            {/if}
        </div>
    </div>
</div>

<GeneralFormDialog
    bind:this={submissionForm}
    remoteForm={createSubmissionForm}
    enctype="multipart/form-data"
>
    {#snippet header()}
        <h1 class="text-2xl font-bold">Submit Bounty</h1>
        <p class="my-4">
            Submit a video or photo as proof of bounty fulfillment. submission
            will be accepted/rejected by an admin based on the bounty's
            acceptance criteria. Media that has already been submitted will not
            be accepted. Video submissions will be cut off at 6 minutes.
        </p>
    {/snippet}
    <input type="hidden" name="bountyId" value={data.bounty.id} />
    <input
        type="file"
        class="file-input validator"
        accept="image/*, video/*"
        required
        name="media"
        onchange={validateMedia}
        bind:this={fileInput}
    />
</GeneralFormDialog>
