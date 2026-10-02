<script lang="ts">
	import ScrubInput from '#lib/components/coral/kit/scrub-input/scrub-input.svelte';

	let timeout = $state(1500);
	let rate = $state(60);
	let sample = $state(0.25);
	let log = $state<string[]>([]);

	function record(field: string) {
		return (value: number | undefined) => {
			log = [`${field} = ${value ?? '—'}`, ...log].slice(0, 4);
		};
	}
</script>

<div class="flex flex-col items-center gap-4">
	<div class="flex flex-wrap items-center justify-center gap-4">
		<label class="flex items-center gap-2 text-sm">
			Request timeout
			<ScrubInput
				label="t"
				bind:value={timeout}
				min={100}
				max={30000}
				step={100}
				suffix="ms"
				onchange={record('timeout')}
			/>
		</label>

		<label class="flex items-center gap-2 text-sm">
			Rate limit
			<ScrubInput
				label="r"
				bind:value={rate}
				min={1}
				max={600}
				suffix="/min"
				onchange={record('rate')}
			/>
		</label>

		<label class="flex items-center gap-2 text-sm">
			Trace sample
			<ScrubInput
				label="p"
				bind:value={sample}
				min={0}
				max={1}
				step={0.05}
				onchange={record('sample')}
			/>
		</label>
	</div>

	<pre class="text-xs text-muted-foreground">{log.join('\n') || 'No changes yet'}</pre>
</div>
