<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import DatePicker from '$lib/coral/kit/date-picker/date-picker.svelte';
	import type { DateRange } from '$lib/coral/kit/date-picker/types.js';

	let value = $state<DateRange>();
	let submitted = $state<string[]>([]);

	function handleSubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		submitted = [...data.entries()].map(([key, entry]) => `${key} = ${entry || '—'}`);
	}
</script>

<form onsubmit={handleSubmit} class="flex w-72 flex-col gap-3">
	<DatePicker type="range" name="periodo" bind:value placeholder="Periodo" clearable />
	<Button type="submit" variant="outline">Enviar</Button>

	{#if submitted.length > 0}
		<ul class="text-sm text-muted-foreground">
			{#each submitted as entry (entry)}
				<li>{entry}</li>
			{/each}
		</ul>
	{/if}
</form>
