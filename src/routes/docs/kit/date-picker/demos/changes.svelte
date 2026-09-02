<script lang="ts">
	import DatePicker from '$lib/coral/kit/date-picker/date-picker.svelte';
	import type { DateRange } from '$lib/coral/kit/date-picker/types.js';

	let value = $state<DateRange>();
	let log = $state<string[]>([]);

	function handleChange(next: DateRange | undefined) {
		const label = next?.start && next?.end ? `${next.start} → ${next.end}` : 'sin rango';
		log = [label, ...log].slice(0, 4);
	}
</script>

<div class="flex w-72 flex-col gap-3">
	<DatePicker type="range" bind:value onchange={handleChange} placeholder="Periodo" clearable />

	<ul class="text-sm text-muted-foreground">
		{#each log as entry, index (`${index}-${entry}`)}
			<li>{entry}</li>
		{/each}
		{#if log.length === 0}
			<li>Aún no hay cambios.</li>
		{/if}
	</ul>
</div>
