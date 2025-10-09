<script lang="ts">
    import UserChip from '$lib/client/UserChip.svelte';
    import type { LayoutServerData } from '../../$types';
    import type { PageServerData } from './$types';

    const { data }: { data: PageServerData & LayoutServerData } = $props();
</script>

<div class="flex flex-col pt-5 items-center max-w-[90%]">
    <h1
        class="text-3xl lg:text-6xl font-bold pt-5 max-w-[1000px] mb-5 lg:mb-10"
        style="word-break: break-word;"
    >
        {data.offer.title}
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
                        class={[
                            'badge badge-lg capitalize',
                            {
                                'badge-success':
                                    data.offer.state === 'completed',
                                'badge-neutral': data.offer.state === 'pending',
                                'badge-accent': data.offer.state === 'active',
                            },
                        ]}>{data.offer.state}</span
                    >
                </td>
            </tr>
            <tr>
                <td class="text-lg text-gray-500 italic text-right"
                    >Posted By:
                </td>
                <td>
                    <UserChip user={data.offer.poster} />
                </td>
            </tr>
            {#if data.offer.buyer}
                <tr>
                    <td class="text-lg text-gray-500 italic text-right"
                        >Bought By:
                    </td>
                    <td>
                        <UserChip user={data.offer.buyer} />
                    </td>
                </tr>
            {/if}
            <tr>
                <td class="align-top text-lg text-gray-500 italic text-right"
                    >Price:
                </td>
                <td class="text-lg">
                    {data.offer.cost} Points
                </td>
            </tr>
            <tr>
                <td
                    class="align-top text-lg text-gray-500 italic text-right lg:whitespace-nowrap"
                    >Description:</td
                >
                <td class="text-lg">
                    {data.offer.description}
                </td>
            </tr>
        </tbody>
    </table>
</div>
