<script lang="ts" generics="Activator">
    import type { Snippet } from 'svelte';
    import type { HTMLFormAttributes } from 'svelte/elements';
    import ErrorHandlingForm from './ErrorHandlingForm.svelte';

    let dialog: HTMLDialogElement;
    let form: ErrorHandlingForm;

    let {
        children,
        formContents,
        activator = $bindable(),
        ...rest
    }: {
        children: Snippet;
        formContents: Snippet;
        activator?: Activator | null;
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

<ErrorHandlingForm bind:this={form} {...rest} children={formContents} />

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
