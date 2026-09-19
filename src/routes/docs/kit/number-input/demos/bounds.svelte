<script lang="ts">
	import NumberInput from '$lib/coral/kit/number-input/number-input.svelte';

	let replicas = $state(20);
</script>

<div class="flex flex-col items-center gap-3">
	<!-- Try typing 999, or -5, then click away. -->
	<NumberInput bind:value={replicas} min={0} max={25} />
	<p class="text-sm text-muted-foreground">
		Replicas, between 0 and 25 · value: {replicas ?? 'empty'}
	</p>
	<p class="text-sm text-muted-foreground">Type 999 and blur the field.</p>
</div>
