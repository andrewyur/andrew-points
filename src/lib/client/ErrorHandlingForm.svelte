<script
    lang="ts"
    generics="RemoteFormType extends RemoteForm<any, undefined | { error: string } | { value: unknown }>"
>
    import type { Snippet } from 'svelte';
    import type { HTMLFormAttributes } from 'svelte/elements';
    import { errorState } from './status';
    import type { RemoteForm } from '@sveltejs/kit';

    let submitting = $state(false);

    let form: HTMLFormElement;

    export const submit = () => form.requestSubmit();

    const {
        children,
        postSubmit,
        remoteForm,
        ...rest
    }: {
        children: Snippet;
        postSubmit?: () => void;
        remoteForm: RemoteFormType;
    } & Partial<HTMLFormAttributes> = $props();
</script>

<p hidden={!submitting}>Submitting form...</p>

<form
    hidden={submitting}
    bind:this={form}
    {...remoteForm.enhance(async ({ submit }) => {
        submitting = true;
        try {
            console.log(remoteForm);
            await submit();
            console.log(remoteForm.result);
            if (remoteForm.result && 'error' in remoteForm.result) {
                errorState.set(remoteForm.result.error);
            }
        } catch (e) {
            errorState.set(
                `Could not complete action: ${(e as Error).message ?? 'Unknown Error'}`,
            );
        }
        submitting = false;
        postSubmit?.();
    })}
    autocomplete="off"
    {...rest}
>
    {@render children()}
</form>
