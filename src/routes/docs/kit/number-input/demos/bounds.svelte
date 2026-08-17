<script lang="ts">
	import NumberInput from '$lib/coral/kit/number-input/number-input.svelte';

	let goal = $state(20);
</script>

<div class="flex flex-col items-center gap-3">
	<!-- Try typing 999, or -5, then click away. -->
	<NumberInput bind:value={goal} min={0} max={25} />
	<p class="text-sm text-muted-foreground">
		Entre 0 y 25 · valor: {goal ?? 'vacío'}
	</p>
	<p class="text-sm text-muted-foreground">Escribe 999 y sal del campo.</p>
</div>
