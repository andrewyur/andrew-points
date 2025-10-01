<script lang="ts">
    import { renderMedia } from '$lib/client/RenderMedia.svelte';
    import type { PageServerData } from './$types';

    const { data }: { data: PageServerData } = $props();
</script>

<h1>{data.bounty.title}</h1>
<p>{data.bounty.fulfillmentCriteria}</p>

<h2>Posted By:</h2>
<p>{data.bounty.creator.displayName}</p>

<h2>Deadline:</h2>
<p>
    {Intl.DateTimeFormat('en-us', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(data.bounty.deadline)}
</p>

<h2>Reward:</h2>
<p>{data.bounty.reward}</p>

{#if data.bounty.fulfiller}
    <h2>Submission:</h2>
    {@render renderMedia(data.bounty.fulfiller.media)}
{/if}
