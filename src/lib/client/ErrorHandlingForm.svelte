<script
    lang="ts"
    generics="RemoteFormType extends RemoteForm<any, undefined | { error: string } | { value: unknown }> | Omit<RemoteForm<any, undefined | { error: string } | { value: unknown }>, 'for'>"
>
    import { type Snippet } from 'svelte';
    import type { HTMLFormAttributes } from 'svelte/elements';
    import { errorState } from './status';
    import type { RemoteForm } from '@sveltejs/kit';
    import { invalidateAll } from '$app/navigation';

    let formElement: HTMLFormElement;

    $effect(() => {
        if (submitting) {
            formElement
                ?.querySelectorAll('input, textarea, select')
                .forEach((i) => ((i as HTMLInputElement).disabled = true));
        } else {
            formElement
                ?.querySelectorAll('input, textarea, select')
                .forEach((i) => ((i as HTMLInputElement).disabled = false));
        }
    });

    export const submit = () => {
        formElement?.requestSubmit();
    };

    let {
        children,
        postSubmit,
        remoteForm,
        submitting = $bindable(false),
        valid = $bindable(false),
        invalidate = true,
        ...rest
    }: {
        children: Snippet;
        postSubmit?: () => void;
        submitting?: boolean;
        remoteForm: RemoteFormType;
        valid?: boolean;
        invalidate?: boolean;
    } & Partial<HTMLFormAttributes> = $props();

    const updateValidity = () => {
        valid = formElement.checkValidity();
    };
</script>

<form
    bind:this={formElement}
    onchange={updateValidity}
    {...remoteForm.enhance(async ({ submit }) => {
        submitting = true;
        try {
            await submit();
            if (remoteForm.result && 'error' in remoteForm.result) {
                errorState.set(remoteForm.result.error);
            }
        } catch (e) {
            errorState.set(
                `Could not complete action: ${(e as Error).message ?? 'Unknown Error'}`,
            );
        }
        submitting = false;
        if (invalidate) {
            invalidateAll();
        }
        postSubmit?.();
    })}
    autocomplete="off"
    {...rest}
>
    {@render children()}
</form>
