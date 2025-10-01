<script lang="ts">
    import ErrorHandlingForm from '$lib/client/ErrorHandlingForm.svelte';
    import GeneralFormDialog from '$lib/client/GeneralFormDialog.svelte';
    import PerItemFormDialog from '$lib/client/PerItemFormDialog.svelte';
    import { renderMedia } from '$lib/client/RenderMedia.svelte';
    import { computeFileHash } from '$lib/hashMedia';
    import type { LayoutServerData } from '../$types';
    import type { PageServerData } from './$types';
    import {
        createBountyForm,
        createSubmissionForm,
        deleteSubmissionForm,
        fileHashExists,
    } from './bounties.remote';

    let { data }: { data: PageServerData & LayoutServerData } = $props();

    let createModal: GeneralFormDialog<typeof createBountyForm>;

    let activeBounty = $state<string | null>(null);

    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const threeDaysLaterValue = threeDaysLater.toISOString().split('T')[0];

    let fileInput: HTMLInputElement;

    async function validateMedia() {
        const file = fileInput.files?.[0];

        if (file === undefined) return;

        const hash = await computeFileHash(file);

        if (await fileHashExists(hash)) {
            fileInput.setCustomValidity(
                'Submission with that media already exists!',
            );
        } else {
            fileInput.setCustomValidity('');
        }
    }
</script>

<h1>Bounties</h1>

<button onclick={() => createModal.show()}>Create a bounty</button>

<table>
    <tbody>
        {#each data.bounties as bounty (bounty.id)}
            <tr>
                <td>
                    <img src={bounty.creator.picture} alt="creator" />
                    <p>{bounty.creator.username}</p>
                </td>
                <td>
                    <h2>{bounty.title}</h2>
                    <p>Completion Criteria: {bounty.fulfillmentCriteria}</p>
                </td>
                <td>
                    <p>{bounty.reward}</p>
                </td>
                <td>
                    <p>
                        {Intl.DateTimeFormat('en-us', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                        }).format(bounty.deadline)}
                    </p>
                </td>
                <td>
                    <button
                        disabled={bounty.submitted}
                        onclick={() => (activeBounty = bounty.id)}
                        >Submit</button
                    >
                </td>
            </tr>
            <tr>
                <td>
                    {#each bounty.submissions as submission}
                        {#if submission.submitterId === data.user.id}
                            <ErrorHandlingForm
                                remoteForm={deleteSubmissionForm}
                            >
                                <input
                                    hidden
                                    name="submissionId"
                                    value={submission.id}
                                />
                                <button type="submit">Delete</button>
                            </ErrorHandlingForm>
                        {/if}
                        {@render renderMedia(submission.media)}
                    {/each}
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<GeneralFormDialog remoteForm={createBountyForm} bind:this={createModal}>
    {#snippet header()}
        <h1>Create a Bounty</h1>
        <p>
            Points will be subtracted on bounty creation. Bounty reward must be
            at least 5% of your points. If not completed, the bounty will expire
            after the deadline, returning the points to your account. Other
            users can attempt to complete a bounty by uploading a picture or
            video as proof of completion, which can be approved or rejected by
            an admin, based on your completion criteria.
        </p>
    {/snippet}
    <label>
        Title
        <input name="title" required maxlength="80" />
    </label>
    <label>
        Fulfillment Criteria
        <input name="fulfillmentCriteria" required />
    </label>
    <label>
        Deadline
        <input
            name="deadline"
            required
            type="date"
            value={threeDaysLaterValue}
        />
    </label>
    <label>
        Reward
        <input
            name="reward"
            step="1"
            required
            type="number"
            min={Math.round(data.userPoints * 0.05)}
            max={data.userPoints}
        />
    </label>
    <button type="submit" aria-label="create">Create</button>
</GeneralFormDialog>

<PerItemFormDialog
    bind:activeElement={activeBounty}
    remoteForm={createSubmissionForm}
    enctype="multipart/form-data"
>
    {#snippet header()}
        <h1>Submit Bounty</h1>
        <p>
            Submit a video or photo as proof of bounty fulfillment. submission
            will be accepted/rejected by an admin based on the bounty's
            acceptance criteria. Media that has already been submitted will not
            be accepted. Video submissions will be cut off at 6 minutes.
        </p>
    {/snippet}
    <input type="hidden" name="bountyId" value={activeBounty} />
    <label
        >Proof
        <input
            type="file"
            accept="image/*, video/*"
            required
            name="media"
            onchange={validateMedia}
            bind:this={fileInput}
        />
    </label>
    <button type="submit">Submit</button>
</PerItemFormDialog>
