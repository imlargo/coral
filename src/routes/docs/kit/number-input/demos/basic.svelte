<script lang="ts">
	import NumberInput from '$lib/coral/kit/number-input/number-input.svelte';

	let quantity = $state(1);
</script>

<div class="flex flex-col items-center gap-3">
	<NumberInput bind:value={quantity} min={1} max={99} />
	<p class="text-sm text-muted-foreground">Cantidad: {quantity ?? '—'}</p>
</div>
