<script lang="ts" module>
    import type { Media } from '$lib/server/db/schema';

    export { renderMedia };
</script>

{#snippet renderMedia(media: Media)}
    {#if media.type === 'video'}
        <!-- svelte-ignore a11y_media_has_caption -->
        <video
            src={`/media/${media.hash}`}
            width={media.width}
            height={media.height}
            controls
        ></video>
    {:else}
        <!-- svelte-ignore a11y_missing_attribute -->
        <img
            src={`/media/${media.hash}`}
            width={media.width}
            height={media.height}
        />
    {/if}
{/snippet}
