<script
    lang="ts"
    generics="Activator, RemoteFormType extends RemoteForm<any, undefined | { error: string } | { value: unknown }> | Omit<RemoteForm<any, undefined | { error: string } | { value: unknown }>, 'for'>"
>
    import type { Snippet } from 'svelte';
    import type { HTMLFormAttributes } from 'svelte/elements';
    import ErrorHandlingForm from './ErrorHandlingForm.svelte';
    import type { RemoteForm } from '@sveltejs/kit';

    let dialog: HTMLDialogElement;
    let form: ErrorHandlingForm<RemoteFormType>;

    let {
        children,
        formContents,
        activator = $bindable(),
        remoteForm,
        ...rest
    }: {
        children: Snippet;
        formContents: Snippet;
        activator?: Activator | null;
        remoteForm: RemoteFormType;
    } & Partial<HTMLFormAttributes> = $props();

    if (activator !== undefined) {
        $effect(() => {
            if (activator) {
                dialog.showModal();
            } else {
                dialog.close();
            }
        });
    }

    export const show = () => dialog.showModal();
    export const close = () => {
        dialog.close();
        activator = null;
    };
</script>

<ErrorHandlingForm
    bind:this={form}
    {...rest}
    {remoteForm}
    children={formContents}
/>

<dialog bind:this={dialog}>
    {@render children()}
    <button onclick={close}>Cancel</button>
    <button
        onclick={() => {
            form.submit();
            close();
        }}>Confirm</button
    >
</dialog>
