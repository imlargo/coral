<script lang="ts">
	import NumberInput from '$lib/coral/kit/number-input/number-input.svelte';

	let rate = $state(0.1);
	let price = $state(1000);
</script>

<div class="flex flex-col items-center gap-4">
	<div class="flex flex-col items-center gap-2">
		<NumberInput bind:value={rate} step={0.1} min={0} max={1} class="w-20" />
		<p class="text-sm text-muted-foreground">step 0.1 · {rate ?? '—'}</p>
	</div>

	<div class="flex flex-col items-center gap-2">
		<!-- Steps by 1 but still stores two decimals, which is what money needs. -->
		<NumberInput bind:value={price} step={1} decimals={2} min={0} class="w-24" />
		<p class="text-sm text-muted-foreground">step 1, decimals 2 · {price ?? '—'}</p>
	</div>
</div>
