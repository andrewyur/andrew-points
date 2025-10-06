<script lang="ts" module>
    import type { Media } from '$lib/server/db/schema';

    export { renderMedia };
</script>

{#snippet renderMedia(media: Media, h: string = '100%', w: string = '100%')}
    {#if media.type === 'video'}
        <!-- svelte-ignore a11y_media_has_caption -->
        <video
            src={`/media/${media.hash}`}
            class="bg-black object-contain w-full h-full"
            style="max-width: {w}; max-height: {h}"
            controls
        ></video>
    {:else}
        <!-- svelte-ignore a11y_missing_attribute -->
        <img
            src={`/media/${media.hash}`}
            class="bg-black object-contain w-full h-full"
            style="max-width: {w}; max-height: {h}"
        />
    {/if}
{/snippet}
