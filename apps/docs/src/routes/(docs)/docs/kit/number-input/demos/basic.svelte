<script lang="ts">
	import NumberInput from '$lib/components/coral/kit/number-input/number-input.svelte';

	let seats = $state(1);
</script>

<div class="flex flex-col items-center gap-3">
	<NumberInput bind:value={seats} min={1} max={99} />
	<p class="text-sm text-muted-foreground">Seats on the plan: {seats ?? '—'}</p>
</div>
