<script lang="ts">
    import '@hcaptcha/vanilla-hcaptcha';
    import type { VanillaHCaptchaWebComponent } from '@hcaptcha/vanilla-hcaptcha';
    import { onMount, tick } from 'svelte';
    import { verifyCaptchaForm } from '../earn.remote';
    import { infoState } from '$lib/client/status';
    import { goto } from '$app/navigation';
    import type { PageServerData } from './$types';
    import type { LayoutServerData } from '../../$types';
    import ErrorHandlingForm from '$lib/client/ErrorHandlingForm.svelte';

    let captcha: VanillaHCaptchaWebComponent;
    let captchaForm: ErrorHandlingForm<typeof verifyCaptchaForm>;
    let tokenInput: HTMLInputElement;

    let { data }: { data: PageServerData & LayoutServerData } = $props();

    async function handleVerify(e: Event) {
        const event = e as Event & {
            token: string;
            eKey: string;
            key: string;
        };

        tokenInput.value = event.token;
        captchaForm.submit();

        if (
            verifyCaptchaForm.result &&
            'value' in verifyCaptchaForm.result &&
            verifyCaptchaForm.result.value === 'completed'
        ) {
            infoState.set(
                `Congratulations! you have earned ${data.session.payout} points!`,
            );
            await tick();
            goto('/user');
        } else {
            captcha.reset();
        }
    }

    onMount(() => {
        captcha.addEventListener('verified', handleVerify);

        return () => {
            captcha.removeEventListener('verified', handleVerify);
        };
    });
</script>

<p>Remaining: {data.session.remaining}</p>

<h-captcha site-key="3e1e0c64-37d4-4a0a-83e2-7c9cc674d562" bind:this={captcha}
></h-captcha>

<ErrorHandlingForm remoteForm={verifyCaptchaForm} bind:this={captchaForm}>
    <input hidden name="token" bind:this={tokenInput} />
</ErrorHandlingForm>
