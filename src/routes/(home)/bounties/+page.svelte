<script lang="ts">
    import ErrorHandlingForm from '$lib/client/ErrorHandlingForm.svelte';
    import GeneralFormDialog from '$lib/client/GeneralFormDialog.svelte';
    import PerItemFormDialog from '$lib/client/PerItemFormDialog.svelte';
    import { computeFileHash } from '$lib/hashMedia';
    import type { LayoutServerData } from '../$types';
    import type { PageServerData } from './$types';

    let { data }: { data: PageServerData & LayoutServerData } = $props();

    let createModal: GeneralFormDialog;

    let activeBounty = $state<string | null>(null);

    // $inspect(activeBounty);

    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const threeDaysLaterValue = threeDaysLater.toISOString().split('T')[0];

    function getMediaLink(id: string) {
        const params = new URLSearchParams({ id });
        return '/bounties/submissionMedia?' + params.toString();
    }

    async function validateMedia(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (file) {
            target.setCustomValidity('Validating media...');

            const hash = await computeFileHash(file);
            const params = new URLSearchParams({ hash });
            const url = '/bounties/validateFile?' + params.toString();

            let response;
            try {
                response = await fetch(url);
            } catch {
                target.setCustomValidity('Validation endpoint failed');
                return;
            }

            if (!response.ok) {
                const reason = await response.text();
                target.setCustomValidity(
                    reason || 'File validation failed for unknown reason',
                );
            } else {
                target.setCustomValidity('');
            }
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
                        {#if submission.mediaLocation !== null}
                            <ErrorHandlingForm action="?/deleteSubmission">
                                <input
                                    type="hidden"
                                    name="id"
                                    value={submission.id}
                                />
                                <button type="submit">remove submission</button>
                            </ErrorHandlingForm>
                            {#if submission.type === 'video'}
                                <!-- svelte-ignore a11y_media_has_caption -->
                                <video
                                    src={getMediaLink(submission.id)}
                                    width={submission.width}
                                    height={submission.height}
                                    controls
                                ></video>
                            {:else}
                                <img
                                    src={getMediaLink(submission.id)}
                                    width={submission.width}
                                    height={submission.height}
                                    alt={'image submission'}
                                />
                            {/if}
                        {/if}
                    {/each}
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<GeneralFormDialog action="?/create" bind:this={createModal}>
    {#snippet header()}
        <h1>Create a Bounty</h1>
        <p>
            Points will be subtracted on bounty creation. If not completed, the
            bounty will expire after the deadline, returning the points to your
            account. Other users can attempt to complete a bounty by uploading a
            picture or video as proof of completion, which can be approved or
            rejected by an admin, based on your completion criteria.
        </p>
    {/snippet}
    <label>
        Title
        <input name="title" required />
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
            required
            type="number"
            min="0"
            max={data.userPoints}
        />
    </label>
    <button type="submit" aria-label="create">Create</button>
</GeneralFormDialog>

<PerItemFormDialog
    enctype="multipart/form-data"
    action="?/submit"
    bind:activeElement={activeBounty}
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
    <input type="hidden" name="bounty" value={activeBounty} />
    <label
        >Proof
        <input
            type="file"
            accept="image/*, video/*"
            required
            name="media"
            onchange={(e) => validateMedia(e)}
        />
    </label>
    <button type="submit">Submit</button>
</PerItemFormDialog>
