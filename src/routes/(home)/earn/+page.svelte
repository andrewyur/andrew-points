<script lang="ts">
    import ErrorHandlingForm from '$lib/client/ErrorHandlingForm.svelte';
    import { startCaptchaSessionForm } from './earn.remote';
</script>

<div class=" max-w-[1000px] w-[80%] my-7">
    <h1 class="font-bold text-4xl lg:text-6xl">Earn</h1>
    <p class="text-base lg:text-lg max-w-lg pt-3">
        Earn points by doing various activities
    </p>
</div>

<div class="rounded-xl max-w-[90%] p-4 border flex flex-col gap-3 items-center">
    <ErrorHandlingForm remoteForm={startCaptchaSessionForm} invalidate={false}>
        <button type="submit" class="btn btn-xl">Captchas</button>
        <!-- <button class="btn btn-primary" type="submit">Start</button> -->
    </ErrorHandlingForm>
    <p class="text-gray-500">
        Do 10 captchas for 5 points. You may repeat this as many times as you
        want. Click to start
    </p>
</div>
