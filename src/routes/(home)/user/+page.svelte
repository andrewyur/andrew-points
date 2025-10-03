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

<div
	class="flex flex-col lg:flex-row lg:gap-30 justify-center items-center lg:gap-10 pt-20 lg:pt-30"
>
	<img
		src={data.user.picture}
		class="max-w-sm w-[100px] lg:w-3xs rounded-lg shadow-2xl"
		alt="profile"
	/>
	<div class="flex flex-col items-center">
		<h1 class="text-3xl lg:text-5xl font-bold mt-3">
			Hi, {data.user.displayName}!
		</h1>

		<div class="flex flex-row items-center gap-3 py-7">
			<p class="lg:text-lg">You have:</p>
			<p class="italic text-2xl lg:text-3xl">{data.userPoints} points</p>
		</div>

		{#if data.user.admin}
			<button class="btn" onclick={userPoints?.show}
				>Edit User Points</button
			>

			<GeneralFormDialog
				bind:this={userPoints}
				remoteForm={adjustUserPoints}
			>
				<select class="select" name="user" required>
					<option disabled selected>Pick a user</option>
					<svelte:boundary>
						{#each await queryUsers() as user}
							<option value={user.id}>{user.username}</option>
						{/each}
					</svelte:boundary>
				</select>
				<input
					class="input"
					type="number"
					step="1"
					required
					name="points"
					placeholder="points"
				/>
				<label class="label">
					Announce
					<input
						class="checkbox"
						type="checkbox"
						name="announce"
						value="true"
					/>
				</label>
				<input
					class="input"
					placeholder="message"
					type="text"
					name="message"
				/>
			</GeneralFormDialog>
		{/if}
	</div>
</div>

<div class="divider m-10 lg:m-20"></div>

<div class="flex flex-col gap-5 items-center w-full">
	<h1 class="text-2xl font-bold">Tasks</h1>
	{#each sortedTasks as task}
		<div class="card bg-base-200 max-w-96 m-7 shadow-sm -z-1">
			{#if task.taskType === 'pendingOffer'}
				<div class="card-body">
					<h2 class="card-title">Confirm Offer Fulfillment</h2>
					<p>
						If you have recieved the goods/services listed in the
						offer "{task.title}" from seller "{task.poster
							.username}", click confirm to release their payment.
						The offer will be automatically confirmed {formatDeadline(
							task.completeBy!,
						)}
					</p>
					<div class="card-actions flex flex-row justify-between">
						<ErrorHandlingForm remoteForm={disputeOfferForm}>
							<input hidden name="offerId" value={task.id} />
							<button class="btn" type="submit">Dispute</button>
						</ErrorHandlingForm>
						<ErrorHandlingForm remoteForm={confirmOfferForm}>
							<input hidden name="offerId" value={task.id} />
							<button class="btn btn-primary" type="submit"
								>Confirm</button
							>
						</ErrorHandlingForm>
					</div>
				</div>
			{:else if task.taskType === 'disputedOffer'}
				<div class="card-body">
					<h2 class="card-title">Settle Offer Dispute</h2>
					<p>{task.title}</p>
					<p>{task.description}</p>
					<div class="card-actions flex flex-row justify-between">
						<ErrorHandlingForm remoteForm={refundDisputedOfferForm}>
							<input hidden name="offerId" value={task.id} />
							<button class="btn" type="submit">Refund</button>
						</ErrorHandlingForm>
						<ErrorHandlingForm
							remoteForm={confirmDisputedOfferForm}
						>
							<input hidden name="offerId" value={task.id} />
							<button class="btn btn-primary" type="submit"
								>Confirm</button
							>
						</ErrorHandlingForm>
					</div>
				</div>
			{:else}
				<figure>
					{@render renderMedia(task.media)}
				</figure>
				<div class="card-body">
					<h2 class="card-title">Approve/Deny Bounty Submission</h2>
					<p>Bounty Title: {task.bounty?.title}</p>
					<p>
						Fulfillment Criteria:
						{task.bounty?.fulfillmentCriteria}
					</p>
					<div class="card-actions flex flex-row justify-between">
						<ErrorHandlingForm remoteForm={rejectSubmissionForm}>
							<input hidden name="submissionId" value={task.id} />
							<button class="btn" type="submit">Reject</button>
						</ErrorHandlingForm>
						<ErrorHandlingForm remoteForm={acceptSubmissionForm}>
							<input hidden name="submissionId" value={task.id} />
							<button class="btn btn-primary" type="submit"
								>Accept</button
							>
						</ErrorHandlingForm>
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>
