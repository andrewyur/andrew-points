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

    let valid = $state(false);
    let submitting = $state(false);

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
    bind:submitting
    bind:valid
    {...rest}
    {remoteForm}
    children={formContents}
    postSubmit={() => {
        submitting = false;
    }}
/>

<dialog bind:this={dialog} class="modal">
    <div class="modal-box w-sm">
        {@render children()}
        <div class="modal-action flex flex-row justify-between">
            <button class="btn" onclick={close}>Cancel</button>
            <button
                class={['btn btn-primary', { loading: submitting }]}
                disabled={submitting || !valid}
                onclick={() => {
                    form.submit();
                    close();
                }}
            >
                {#if submitting}
                    <span class="loading-spinner"></span>
                {:else}
                    Confirm
                {/if}</button
            >
        </div>
    </div>
</dialog>
