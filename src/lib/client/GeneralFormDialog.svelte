<script
    lang="ts"
    generics="RemoteFormType extends RemoteForm<any, undefined | { error: string }>"
>
    import type { Snippet } from 'svelte';
    import type { HTMLFormAttributes } from 'svelte/elements';
    import ErrorHandlingForm from './ErrorHandlingForm.svelte';
    import type { RemoteFormInput, RemoteForm } from '@sveltejs/kit';

    const {
        header,
        children,
        remoteForm,
        ...rest
    }: {
        header?: Snippet;
        children: Snippet;
        remoteForm: RemoteFormType;
    } & Partial<HTMLFormAttributes> = $props();

    let modal: HTMLDialogElement | null = $state(null);
    let form: ErrorHandlingForm<RemoteFormType>;

    export const show = () => modal?.showModal();
    export const submit = () => form.submit();
    export const close = () => modal?.close();
</script>

<dialog bind:this={modal}>
    <button onclick={close}>Close</button>
    {@render header?.()}
    <ErrorHandlingForm
        bind:this={form}
        {remoteForm}
        {...rest}
        {children}
        onsubmit={() => modal?.close()}
    />
</dialog>
