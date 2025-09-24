<script lang="ts">
    import { enhance } from '$app/forms';
    import type { Snippet } from 'svelte';
    import type { HTMLFormAttributes } from 'svelte/elements';
    import { errorState } from './status';

    let submitting = $state(false);

    let form: HTMLFormElement | null = $state(null);

    export const submit = () => form?.requestSubmit();

    const {
        children,
        postSubmit,
        ...rest
    }: {
        children: Snippet;
        postSubmit?: () => void;
    } & Partial<HTMLFormAttributes> = $props();
</script>

{#if submitting}
    <p>Submitting form...</p>
{:else}
    <form
        bind:this={form}
        use:enhance={() => {
            submitting = true;
            return (response) => {
                if (response.result.type === 'failure') {
                    errorState.set(String(response.result.data));
                }
                postSubmit?.();
                submitting = false;
                response.update({
                    reset: true,
                    invalidateAll: true,
                });
            };
        }}
        method="POST"
        autocomplete="off"
        {...rest}
    >
        {@render children()}
    </form>
{/if}
