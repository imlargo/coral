<script lang="ts">
	import ScrubInput from '$lib/components/coral/kit/scrub-input/scrub-input.svelte';

	let width = $state(320);
	let height = $state(180);
	let radius = $state(8);
</script>

<div class="flex flex-col items-center gap-4">
	<div class="flex items-center gap-2">
		<ScrubInput label="W" bind:value={width} min={0} max={1920} suffix="px" pixelsPerStep={1} />
		<ScrubInput label="H" bind:value={height} min={0} max={1080} suffix="px" pixelsPerStep={1} />
		<ScrubInput label="R" bind:value={radius} min={0} max={64} suffix="px" />
	</div>

	<p class="text-sm text-muted-foreground">Drag a label sideways. Shift drags ten times faster.</p>

	<div
		class="h-(--box-h) w-(--box-w) rounded-(--box-r) border bg-muted/40"
		style:--box-w="{Math.min(width, 420)}px"
		style:--box-h="{Math.min(height, 160)}px"
		style:--box-r="{radius}px"
	></div>
</div>
