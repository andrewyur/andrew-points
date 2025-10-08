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
	import LedgerEntry from '$lib/client/LedgerEntry.svelte';

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
	class="flex flex-col lg:flex-row justify-center items-center lg:gap-10 pt-20 lg:pt-30"
>
	<a href="/user/{data.user.id}">
		<img
			src={data.user.picture}
			class="max-w-sm w-[100px] lg:w-3xs rounded-lg shadow-2xl"
			alt="profile"
		/>
	</a>
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

<div class="indicator max-w-[85%] w-120">
	<div class="collapse bg-base-100 border-base-300 border">
		<input type="checkbox" />
		<div class="collapse-title font-semibold text-xl text-center">
			Tasks
		</div>
		<div
			class="collapse-content flex flex-row flex-wrap gap-5 items-center justify-around"
		>
			{#if sortedTasks.length > 0}
				{#each sortedTasks as task}
					<div class="card bg-base-200 lg:m-5 shadow-sm w-110">
						{#if task.taskType === 'pendingOffer'}
							<div class="card-body">
								<h2 class="card-title">
									Confirm Offer Fulfillment
								</h2>
								<p>
									If you have recieved the goods/services
									listed in the offer <a
										class="link font-semibold"
										href="/marketplace/{task.id}"
										>{task.title}</a
									>
									from seller
									<a
										class="link font-semibold"
										href="/user/{task.posterId}"
										>{task.poster.displayName}</a
									>, click confirm to release their payment.
									The offer will be automatically confirmed {formatDeadline(
										task.completeBy!,
									)}
								</p>
								<div
									class="card-actions flex flex-row justify-between"
								>
									<ErrorHandlingForm
										remoteForm={disputeOfferForm.for(
											task.id,
										)}
									>
										<input
											hidden
											name="offerId"
											value={task.id}
										/>
										<button class="btn" type="submit"
											>Dispute</button
										>
									</ErrorHandlingForm>
									<ErrorHandlingForm
										remoteForm={confirmOfferForm.for(
											task.id,
										)}
									>
										<input
											hidden
											name="offerId"
											value={task.id}
										/>
										<button
											class="btn btn-primary"
											type="submit">Confirm</button
										>
									</ErrorHandlingForm>
								</div>
							</div>
						{:else if task.taskType === 'disputedOffer'}
							<div class="card-body">
								<h2 class="card-title">Settle Offer Dispute</h2>
								<p>{task.title}</p>
								<p>{task.description}</p>
								<div
									class="card-actions flex flex-row justify-between"
								>
									<ErrorHandlingForm
										remoteForm={refundDisputedOfferForm.for(
											task.id,
										)}
									>
										<input
											hidden
											name="offerId"
											value={task.id}
										/>
										<button class="btn" type="submit"
											>Refund</button
										>
									</ErrorHandlingForm>
									<ErrorHandlingForm
										remoteForm={confirmDisputedOfferForm.for(
											task.id,
										)}
									>
										<input
											hidden
											name="offerId"
											value={task.id}
										/>
										<button
											class="btn btn-primary"
											type="submit">Confirm</button
										>
									</ErrorHandlingForm>
								</div>
							</div>
						{:else}
							<figure>
								{@render renderMedia(task.media, '300px')}
							</figure>
							<div class="card-body">
								<h2 class="card-title">
									Approve/Deny Bounty Submission
								</h2>
								<p>Bounty Title: {task.bounty?.title}</p>
								<p>
									Fulfillment Criteria:
									{task.bounty?.fulfillmentCriteria}
								</p>
								<div
									class="card-actions flex flex-row justify-between"
								>
									<ErrorHandlingForm
										remoteForm={rejectSubmissionForm.for(
											task.id,
										)}
									>
										<input
											hidden
											name="submissionId"
											value={task.id}
										/>
										<button class="btn" type="submit"
											>Reject</button
										>
									</ErrorHandlingForm>
									<ErrorHandlingForm
										remoteForm={acceptSubmissionForm.for(
											task.id,
										)}
									>
										<input
											hidden
											name="submissionId"
											value={task.id}
										/>
										<button
											class="btn btn-primary"
											type="submit">Accept</button
										>
									</ErrorHandlingForm>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			{:else}
				<p class="text-gray-500">No tasks yet</p>
			{/if}
		</div>
	</div>
	{#if sortedTasks.length > 0}
		<span class="indicator-item badge badge-primary"
			>{sortedTasks.length}</span
		>
	{/if}
</div>

<div class="divider m-10 lg:m-20"></div>

<h1 class="text-3xl font-bold mb-7 lg:mb-17">Recent Activity</h1>

<ul class="timeline timeline-vertical max-w-[90%]">
	{#each data.activity as ledgerEntry}
		<LedgerEntry {ledgerEntry} />
	{/each}
</ul>
