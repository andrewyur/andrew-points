<script lang="ts" generics="ElementType">
    import type { Snippet } from 'svelte';
    import type { HTMLFormAttributes } from 'svelte/elements';
    import ErrorHandlingForm from './ErrorHandlingForm.svelte';

    let {
        activeElement = $bindable(),
        header,
        children,
        ...rest
    }: {
        activeElement: ElementType | null;
        header?: Snippet;
        children: Snippet;
    } & HTMLFormAttributes = $props();

    let modal: HTMLDialogElement;
    let form: ErrorHandlingForm;

    $effect(() => {
        if (activeElement !== null) {
            modal.showModal();
        } else {
            console.log(modal);
            modal.close();
        }
    });

    const close = () => (activeElement = null);

    export const submit = () => form.submit();
</script>

<dialog bind:this={modal} onclose={close}>
    <button onclick={close}>Close</button>
    {@render header?.()}
    <ErrorHandlingForm
        bind:this={form}
        {...rest}
        {children}
        postSubmit={close}
    />
</dialog>
