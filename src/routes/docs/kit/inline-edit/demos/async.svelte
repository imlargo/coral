<script lang="ts">
	import InlineEdit from '$lib/coral/kit/inline-edit/inline-edit.svelte';

	const taken = ['North Office', 'South Office'];

	let name = $state('Central Office');
	let error = $state('');

	async function rename(next: string) {
		error = '';
		await new Promise((resolve) => setTimeout(resolve, 700));
		if (taken.includes(next)) {
			error = `A project named ${next} already exists.`;
			return false;
		}
	}
</script>

<div class="flex w-72 flex-col gap-2">
	<InlineEdit bind:value={name} class="w-full" onsave={rename} oncancel={() => (error = '')} />
	<p class="text-sm text-muted-foreground" role="status">
		{error || 'Try «North Office».'}
	</p>
</div>
