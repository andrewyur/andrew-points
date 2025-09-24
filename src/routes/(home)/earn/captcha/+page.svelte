<script lang="ts">
    import '@hcaptcha/vanilla-hcaptcha';
    import type { VanillaHCaptchaWebComponent } from '@hcaptcha/vanilla-hcaptcha';
    import { onMount } from 'svelte';
    import { verifyCaptcha } from '../earn.remote';
    import { errorState, infoState } from '$lib/client/status';
    import { goto, invalidateAll } from '$app/navigation';
    import type { PageServerData } from './$types';
    import type { LayoutServerData } from '../../$types';

    let captcha: VanillaHCaptchaWebComponent;

    let { data }: { data: PageServerData & LayoutServerData } = $props();

    async function handleVerify(e: Event) {
        const event = e as Event & {
            token: string;
            eKey: string;
            key: string;
        };

        console.log(event.token);
        const response = await verifyCaptcha(event.token);

        if (!response.ok) {
            errorState.set(response.reason);
        } else {
            if (response.redirect) {
                infoState.set(
                    `Congratulations! you have earned ${data.session.payout} points!`,
                );
                goto('/');
            } else {
                captcha.reset();
                invalidateAll();
            }
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
