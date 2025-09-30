<script lang="ts">
    import ErrorHandlingForm from '$lib/client/ErrorHandlingForm.svelte';
    import { startCaptchaSessionForm } from './earn.remote';
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
<ErrorHandlingForm remoteForm={startCaptchaSessionForm}>
    <button type="submit">Start</button>
</ErrorHandlingForm>
