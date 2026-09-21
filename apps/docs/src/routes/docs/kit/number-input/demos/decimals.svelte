<script lang="ts">
	import NumberInput from '$lib/components/coral/kit/number-input/number-input.svelte';

	let sampleRate = $state(0.1);
	let budget = $state(1000);
</script>

<div class="flex flex-col items-center gap-4">
	<div class="flex flex-col items-center gap-2">
		<NumberInput bind:value={sampleRate} step={0.1} min={0} max={1} class="w-20" />
		<p class="text-sm text-muted-foreground">sample rate · step 0.1 · {sampleRate ?? '—'}</p>
	</div>

	<div class="flex flex-col items-center gap-2">
		<!-- Steps by whole units but still stores cents, which is what a billing cap needs. -->
		<NumberInput bind:value={budget} step={1} decimals={2} min={0} class="w-24" />
		<p class="text-sm text-muted-foreground">budget · step 1, decimals 2 · {budget ?? '—'}</p>
	</div>
</div>
