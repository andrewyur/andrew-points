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
    let form: ErrorHandlingForm;

    export const show = () => modal?.showModal();
    export const submit = () => form.submit();
    export const close = () => modal?.close();
</script>

<dialog bind:this={modal}>
    <button onclick={close}>Close</button>
    {@render header?.()}
    <ErrorHandlingForm
        bind:this={form}
        {...rest}
        {children}
        onsubmit={() => modal?.close()}
    />
</dialog>
