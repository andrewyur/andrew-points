<script lang="ts">
    import type { LayoutServerData } from '../../$types';
    import type { PageServerData } from './$types';

    const { data }: { data: PageServerData & LayoutServerData } = $props();
</script>

<h1>{data.offer.title}</h1>
<p>{data.offer.description}</p>

<h2>Cost</h2>
<p>{data.offer.cost}</p>

<h2>State</h2>
<p>{data.offer.state}</p>

<h2>Poster:</h2>
<p>{data.offer.poster.displayName}</p>

{#if data.offer.buyer}
    <h2>Buyer:</h2>
    <p>{data.offer.buyer.displayName}</p>
{/if}
