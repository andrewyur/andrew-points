<script lang="ts">
    import { enhance } from '$app/forms';

    let { children } = $props();
</script>

<div>
    <a href="/">Lodge Points</a>
    <a href="/redeem">Redeem</a>
    <form method="post" action="/logout" use:enhance>
        <button>Sign out</button>
    </form>
</div>

{@render children()}

<style>
    div {
        position: static;
        top: 0;
        width: 100vw;
        left: 0;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 10px;
        background-color: purple;
        box-sizing: border-box;
        align-items: center;
    }
</style>
