<script lang="ts">
	import { enhance } from '$app/forms';
	import type { LayoutServerData } from './$types';

	let { data }: { data: LayoutServerData } = $props();
</script>

<h1>Hi, {data.user.username}!</h1>
<img src={data.user.picture} height="100px" width="100px" alt="profile" />

<p>you have {data.userPoints} points.</p>
<form method="POST" use:enhance>
	<button type="submit" formaction="?/increment">add</button>
	<button type="submit" formaction="?/decrement">subtract</button>
</form>
