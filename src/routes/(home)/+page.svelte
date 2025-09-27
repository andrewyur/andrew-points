<script lang="ts">
	import { Temporal } from 'temporal-polyfill';
	import type { LayoutServerData } from './$types';
	import type { PageServerData } from './$types';
	import {
		acceptSubmissionNotification,
		confirmDisputedOfferNotification,
		confirmOfferNotification,
		disputeOfferNotification,
		refundOfferNotification,
		rejectSubmissionNotification,
	} from './userActions.remote';
	import { refreshAll } from '$app/navigation';
	import GeneralFormDialog from '$lib/client/GeneralFormDialog.svelte';
	import { queryUsers } from '$lib/client/commands.remote';

	const { data }: { data: PageServerData & LayoutServerData } = $props();

	let userPoints: GeneralFormDialog | null = $state(null);

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
				return item.bounty_submission.submittedAt.valueOf();
			}
		};

		return allTasks.toSorted((a, b) => getSorted(a) - getSorted(b));
	});

	const formatter = new Intl.RelativeTimeFormat('en-US', {
		numeric: 'auto',
	});

	function getMediaLink(id: string) {
		const params = new URLSearchParams({ id });
		return '/bounties/submissionMedia?' + params.toString();
	}
</script>

<h1>Hi, {data.user.username}!</h1>
<img src={data.user.picture} height="100px" width="100px" alt="profile" />

<p>you have {data.userPoints} points.</p>

{#if data.user.admin}
	<button onclick={userPoints?.show}>Edit User Points</button>

	<GeneralFormDialog bind:this={userPoints}>
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
				their payment. The offer will be automatically confirmed {formatter.format(
					Math.ceil(
						Temporal.Now.instant()
							.until(
								Temporal.Instant.fromEpochMilliseconds(
									task.completeBy!.getTime(),
								),
							)
							.total('hours'),
					),
					'hour',
				)}
			</p>
			<button
				onclick={async () => {
					await confirmOfferNotification(task.id);
					refreshAll();
				}}>Confirm</button
			>
			<button
				onclick={async () => {
					await disputeOfferNotification(task.id);
					refreshAll();
				}}>Dispute</button
			>
		{:else if task.taskType === 'disputedOffer'}
			<h2>Settle Offer Dispute</h2>
			<p>{task.title}</p>
			<p>{task.description}</p>
			<button
				onclick={async () => {
					await confirmDisputedOfferNotification(task.id);
					refreshAll();
				}}>Confirm</button
			>
			<button
				onclick={async () => {
					await refundOfferNotification(task.id);
					refreshAll();
				}}>Refund</button
			>
		{:else}
			<h2>Settle Offer Dispute</h2>
			<p>{task.bounty?.title}</p>
			<p>{task.bounty?.fulfillmentCriteria}</p>
			{#if task.bounty_submission?.type === 'video'}
				<!-- svelte-ignore a11y_media_has_caption -->
				<video
					src={getMediaLink(task.bounty_submission.id)}
					width={task.bounty_submission?.width}
					height={task.bounty_submission?.height}
					controls
				></video>
			{:else}
				<img
					src={getMediaLink(task.bounty_submission.id)}
					width={task.bounty_submission?.width}
					height={task.bounty_submission?.height}
					alt={'image submission'}
				/>
			{/if}
			<button
				onclick={async () => {
					await acceptSubmissionNotification(
						task.bounty_submission.id,
					);
					refreshAll();
				}}>Confirm</button
			>
			<button
				onclick={async () => {
					await rejectSubmissionNotification(
						task.bounty_submission.id,
					);
					refreshAll();
				}}>Refund</button
			>
		{/if}
	</div>
{/each}
