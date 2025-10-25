<script
    lang="ts"
    generics="RemoteFormType extends RemoteForm<any, undefined | { error: string } | { value: unknown }> | Omit<RemoteForm<any, undefined | { error: string } | { value: unknown }>, 'for'>"
>
    import type { Snippet } from 'svelte';
    import type { HTMLFormAttributes } from 'svelte/elements';
    import ErrorHandlingForm from './ErrorHandlingForm.svelte';
    import type { RemoteFormInput, RemoteForm } from '@sveltejs/kit';

    const {
        header,
        children,
        remoteForm,
        actionText,
        ...rest
    }: {
        header?: Snippet;
        children: Snippet;
        remoteForm: RemoteFormType;
        actionText?: string;
    } & Partial<HTMLFormAttributes> = $props();

    let formElement: HTMLFormElement | undefined = $state();

    let modal: HTMLDialogElement | null = $state(null);
    let form: ErrorHandlingForm<RemoteFormType> | null = $state(null);
    let submitting = $state(false);

    export const show = () => modal?.showModal();
    export const submit = () => {
        form?.submit();
        submitting = true;
    };
    export const close = () => modal?.close();
</script>

<dialog bind:this={modal} class="modal">
    <div class="modal-box w-sm">
        <button
            onclick={close}
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >✕</button
        >
        {@render header?.()}
        <ErrorHandlingForm
            class="p-3 flex flex-col items-center gap-4"
            bind:submitting
            bind:this={form}
            bind:formElement
            {remoteForm}
            {...rest}
            {children}
            postSubmit={() => {
                modal?.close();
                submitting = false;
            }}
        />
        <div class="modal-action">
            <button
                class={['btn btn-primary', { 'loading disabled': submitting }]}
                onclick={submit}
                disabled={submitting || formElement?.checkValidity()}
            >
                {#if submitting}
                    <span class="loading-spinner"></span>
                {:else}
                    {actionText ?? 'Submit'}
                {/if}
            </button>
        </div>
    </div>
</dialog>
