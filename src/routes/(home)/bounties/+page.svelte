<script lang="ts">
    import { enhance } from '$app/forms';
    import { errorState } from '$lib/client/error';
    import { computeFileHash } from '$lib/hashMedia';
    import type { PageServerData } from './$types';

    let { data }: { data: PageServerData } = $props();

    let createModal: HTMLDialogElement;
    let submitModal: HTMLDialogElement;

    let activeBounty: number | null = $state(null);

    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const threeDaysLaterValue = threeDaysLater.toISOString().split('T')[0];

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

<button onclick={() => createModal.showModal()}>Create a bounty</button>

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
                    <p>Completion Criteria: {bounty.completionCriteria}</p>
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
                        onclick={() => {
                            submitModal.showModal();
                            activeBounty = bounty.id;
                        }}>Submit</button
                    >
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<dialog bind:this={createModal}>
    <h1>Create a Bounty</h1>
    <p>
        Points will be subtracted on bounty creation. If not completed, the
        bounty will expire after the deadline, returning the points to your
        account. Other users can attempt to complete a bounty by uploading a
        picture or video as proof of completion, which can be approved or
        rejected by an admin, based on your completion criteria.
    </p>
    <form
        use:enhance
        onsubmit={() => createModal.close()}
        method="POST"
        action="?/create"
    >
        <label>
            Title
            <input name="title" required />
        </label>
        <label>
            Completion Criteria
            <input name="completionCriteria" required />
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
                max={data.user.points}
            />
        </label>
        <button type="submit" aria-label="create">Create</button>
    </form>
</dialog>

<dialog bind:this={submitModal}>
    <h1>Submit Bounty</h1>
    <p>
        Submit a video or photo as proof of bounty fulfillment. submission will
        be accepted/rejected by an admin based on the bounty's acceptance
        criteria. Media that has already been submitted will not be accepted.
        Video submissions will be cut off at 6 minutes.
    </p>
    <form
        use:enhance={() => {
            return (response) => {
                activeBounty = null;
                if (response.result.type === 'failure') {
                    errorState.set(
                        'Error returned from server when submitting bounty: ' +
                            response.result.data,
                    );
                }
                response.update({
                    reset: true,
                    invalidateAll: true,
                });
            };
        }}
        method="POST"
        action="?/submit"
        onsubmit={() => {
            submitModal.close();
        }}
        enctype="multipart/form-data"
    >
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
    </form>
</dialog>
