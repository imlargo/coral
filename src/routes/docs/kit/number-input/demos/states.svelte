<script lang="ts">
	import NumberInput from '$lib/coral/kit/number-input/number-input.svelte';

	let empty = $state<number>();
	let fixed = $state(8);
	let off = $state(3);
</script>

<div class="flex flex-col items-center gap-4">
	<div class="flex flex-col items-center gap-2">
		<NumberInput bind:value={empty} min={5} max={9} placeholder="—" />
		<p class="text-sm text-muted-foreground">vacío, min 5 · {empty ?? 'undefined'}</p>
	</div>

	<div class="flex flex-col items-center gap-2">
		<NumberInput bind:value={fixed} readonly />
		<p class="text-sm text-muted-foreground">readonly</p>
	</div>

	<div class="flex flex-col items-center gap-2">
		<NumberInput bind:value={off} disabled />
		<p class="text-sm text-muted-foreground">disabled</p>
	</div>
</div>
