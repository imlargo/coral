<script lang="ts">
	import ScrubInput from '$lib/components/coral/kit/scrub-input/scrub-input.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let padding = $state(16);
	let history = $state<number[]>([]);

	// One undo entry per drag rather than one per step: the value is remembered when a drag begins,
	// and the twenty it passes through on the way are not history of their own.
	let dragging = false;
	let previous = 16;

	function remember(value: number) {
		history = [...history, value];
	}

	function undo() {
		const last = history.at(-1);
		if (last === undefined) return;
		padding = last;
		previous = last;
		history = history.slice(0, -1);
	}
</script>

<div class="flex flex-col items-center gap-4">
	<div class="flex items-center gap-3">
		<ScrubInput
			label="Padding"
			bind:value={padding}
			min={0}
			max={96}
			step={2}
			suffix="px"
			onscrubstart={(value) => {
				dragging = true;
				remember(value ?? 0);
			}}
			onscrubend={(value) => {
				dragging = false;
				previous = value ?? previous;
			}}
			onchange={(value) => {
				// Arrow keys and typed edits are changes of their own, so each one is its own entry.
				if (!dragging) remember(previous);
				previous = value ?? previous;
			}}
		/>

		<Button variant="outline" size="sm" onclick={undo} disabled={history.length === 0}>
			Undo ({history.length})
		</Button>
	</div>

	<div class="rounded-lg border bg-muted/40" style="padding: {padding}px">
		<div class="rounded border bg-background px-3 py-1.5 text-sm">deploy.yml</div>
	</div>

	<p class="text-sm text-muted-foreground">
		Drag through twenty values and undo once: it goes back to where the drag began. Escape mid-drag
		cancels it outright.
	</p>
</div>
