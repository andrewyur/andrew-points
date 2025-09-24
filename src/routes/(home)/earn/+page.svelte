<script lang="ts">
    import { goto } from '$app/navigation';
    import { errorState } from '$lib/client/status';
    import { startCaptchaSession } from './earn.remote';

    async function captcha() {
        const response = await startCaptchaSession();

        if (response.ok) {
            goto('/earn/captcha');
        } else {
            errorState.set(response.reason);
        }
    }
</script>

<h1>Earn</h1>

<p>
    Earn points by doing various activities. Your account can have only 1 active
    earn session.
</p>

<h2>Captchas</h2>
<p>
    Do 10 captchas for 5 points. You may repeat this as many times as you want.
</p>
<button onclick={() => captcha()}>Start</button>
