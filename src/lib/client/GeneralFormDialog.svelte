<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { HTMLFormAttributes } from 'svelte/elements';
    import ErrorHandlingForm from './ErrorHandlingForm.svelte';

    const {
        header,
        children,
        ...rest
    }: {
        header?: Snippet;
        children: Snippet;
    } & Partial<HTMLFormAttributes> = $props();

    let modal: HTMLDialogElement | null = $state(null);

    export const show = () => modal?.showModal();

    export const close = () => modal?.close();
</script>

<dialog bind:this={modal}>
    <button onclick={close}>Close</button>
    {@render header?.()}
    <ErrorHandlingForm {...rest} {children} onsubmit={() => modal?.close()} />
</dialog>
