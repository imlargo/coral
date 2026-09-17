<script lang="ts">
	import InlineEdit from '$lib/coral/kit/inline-edit/inline-edit.svelte';

	const taken = ['Obra Norte', 'Obra Sur'];

	let name = $state('Obra Centro');
	let error = $state('');

	async function rename(next: string) {
		error = '';
		await new Promise((resolve) => setTimeout(resolve, 700));
		if (taken.includes(next)) {
			error = `Ya existe un proyecto llamado ${next}.`;
			return false;
		}
	}
</script>

<div class="flex w-72 flex-col gap-2">
	<InlineEdit bind:value={name} class="w-full" onsave={rename} oncancel={() => (error = '')} />
	<p class="text-sm text-muted-foreground" role="status">
		{error || 'Prueba con «Obra Norte».'}
	</p>
</div>
