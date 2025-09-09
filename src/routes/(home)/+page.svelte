<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<h1>Hi, {data.user.name}!</h1>
<img src={data.user.picture} height="100px" width="100px" alt="profile" />
<p>Email: {data.user.email}</p>

<p>you have {data.user.points} points.</p>
<form method="POST" use:enhance>
	<button type="submit" formaction="?/increment">add</button>
	<button type="submit" formaction="?/decrement">subtract</button>
</form>
