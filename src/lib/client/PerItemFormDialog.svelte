<script
    lang="ts"
    generics="ElementType, RemoteFormType extends RemoteForm<any, undefined | { error: string }>"
>
    import type { Snippet } from 'svelte';
    import type { HTMLFormAttributes } from 'svelte/elements';
    import ErrorHandlingForm from './ErrorHandlingForm.svelte';
    import type { RemoteForm } from '@sveltejs/kit';

    let {
        activeElement = $bindable(),
        header,
        children,
        remoteForm,
        ...rest
    }: {
        activeElement: ElementType | null;
        header?: Snippet;
        children: Snippet;
        remoteForm: RemoteFormType;
    } & Partial<HTMLFormAttributes> = $props();

    let modal: HTMLDialogElement;
    let form: ErrorHandlingForm<RemoteFormType>;

    $effect(() => {
        if (activeElement !== null) {
            modal.showModal();
        } else {
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
        {remoteForm}
        {...rest}
        {children}
        postSubmit={close}
    />
</dialog>
