<script lang="ts">
	import NumberInput from '#lib/components/coral/kit/number-input/number-input.svelte';

	let cpu = $state(1.5);
</script>

<div class="flex flex-col items-center gap-4">
	<div class="flex items-center gap-6">
		<div class="flex flex-col items-center gap-2">
			<NumberInput bind:value={cpu} step={0.25} min={0} max={8} locale="de-DE" class="w-20" />
			<p class="text-sm text-muted-foreground">de-DE</p>
		</div>
		<div class="flex flex-col items-center gap-2">
			<NumberInput bind:value={cpu} step={0.25} min={0} max={8} locale="en-US" class="w-20" />
			<p class="text-sm text-muted-foreground">en-US</p>
		</div>
	</div>
	<p class="text-sm text-muted-foreground">vCPUs per instance · value {cpu ?? '—'}</p>
</div>
