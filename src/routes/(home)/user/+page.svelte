<script lang="ts">
	import { Temporal } from 'temporal-polyfill';
	import type { LayoutServerData } from '../$types';
	import type { PageServerData } from './$types';
	import {
		acceptSubmissionForm,
		adjustUserPoints,
		confirmDisputedOfferForm,
		confirmOfferForm,
		disputeOfferForm,
		refundDisputedOfferForm,
		rejectSubmissionForm,
	} from './userActions.remote';
	import GeneralFormDialog from '$lib/client/GeneralFormDialog.svelte';
	import { queryUsers } from '$lib/client/commands.remote';
	import { renderMedia } from '$lib/client/RenderMedia.svelte';
	import ErrorHandlingForm from '$lib/client/ErrorHandlingForm.svelte';

	const { data }: { data: PageServerData & LayoutServerData } = $props();

	let userPoints: GeneralFormDialog<typeof adjustUserPoints> | null =
		$state(null);

	const sortedTasks = $derived.by(() => {
		const allTasks = [
			...(data.tasks?.pendingOffers.map((p) => ({
				...p,
				taskType: 'pendingOffer' as const,
			})) ?? []),
			...(data.tasks?.disputedOffers?.map((p) => ({
				...p,
				taskType: 'disputedOffer' as const,
			})) ?? []),
			...(data.tasks?.bountySubmissions?.map((b) => ({
				...b,
				taskType: 'bountySubmission' as const,
			})) ?? []),
		];

		const getSorted = (item: (typeof allTasks)[number]) => {
			if (
				item.taskType === 'pendingOffer' ||
				item.taskType === 'disputedOffer'
			) {
				return item.purchasedAt!.valueOf();
			} else {
				return item.submittedAt.valueOf();
			}
		};

		return allTasks.toSorted((a, b) => getSorted(a) - getSorted(b));
	});

	const formatter = new Intl.RelativeTimeFormat('en-US', {
		numeric: 'auto',
	});

	const formatDeadline = (date: Date) =>
		formatter.format(
			Math.ceil(
				Temporal.Now.instant()
					.until(Temporal.Instant.fromEpochMilliseconds(Number(date)))
					.total('hours'),
			),
			'hour',
		);
</script>

<h1>Hi, {data.user.username}!</h1>
<img src={data.user.picture} height="100px" width="100px" alt="profile" />

<p>you have {data.userPoints} points.</p>

{#if data.user.admin}
	<button onclick={userPoints?.show}>Edit User Points</button>

	<GeneralFormDialog bind:this={userPoints} remoteForm={adjustUserPoints}>
		<label>
			User
			<select name="user" required>
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
		<label>
			Amount
			<input type="number" step="1" required name="points" />
		</label>
		<label>
			Announce
			<input type="checkbox" name="announce" value="true" />
		</label>
		<label>
			Message
			<input type="text" name="message" />
		</label>
		<button type="submit">Confirm</button>
	</GeneralFormDialog>
{/if}

<h1>Tasks</h1>
{#each sortedTasks as task}
	<div>
		{#if task.taskType === 'pendingOffer'}
			<h2>Confirm Offer Fulfillment</h2>
			<p>
				If you have recieved the goods/services listed in the offer "{task.title}"
				from seller "{task.poster.username}", click confirm to release
				their payment. The offer will be automatically confirmed {formatDeadline(
					task.completeBy!,
				)}
			</p>
			<ErrorHandlingForm remoteForm={confirmOfferForm}>
				<input hidden name="offerId" value={task.id} />
				<button type="submit">Confirm</button>
			</ErrorHandlingForm>
			<ErrorHandlingForm remoteForm={disputeOfferForm}>
				<input hidden name="offerId" value={task.id} />
				<button type="submit">Dispute</button>
			</ErrorHandlingForm>
		{:else if task.taskType === 'disputedOffer'}
			<h2>Settle Offer Dispute</h2>
			<p>{task.title}</p>
			<p>{task.description}</p>
			<ErrorHandlingForm remoteForm={confirmDisputedOfferForm}>
				<input hidden name="offerId" value={task.id} />
				<button type="submit">Confirm</button>
			</ErrorHandlingForm>
			<ErrorHandlingForm remoteForm={refundDisputedOfferForm}>
				<input hidden name="offerId" value={task.id} />
				<button type="submit">Refund</button>
			</ErrorHandlingForm>
		{:else}
			<h2>Approve/deny bounty submission</h2>
			<p>{task.bounty?.title}</p>
			<p>{task.bounty?.fulfillmentCriteria}</p>
			{@render renderMedia(task.media)}
			<ErrorHandlingForm remoteForm={acceptSubmissionForm}>
				<input hidden name="submissionId" value={task.id} />
				<button type="submit">Accept</button>
			</ErrorHandlingForm>
			<ErrorHandlingForm remoteForm={rejectSubmissionForm}>
				<input hidden name="submissionId" value={task.id} />
				<button type="submit">Reject</button>
			</ErrorHandlingForm>
		{/if}
	</div>
{/each}
