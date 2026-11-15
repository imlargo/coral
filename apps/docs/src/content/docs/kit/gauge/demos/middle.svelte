<script lang="ts">
	import Gauge from '#lib/components/coral/kit/gauge/gauge.svelte';
</script>

<div class="flex flex-wrap items-center justify-center gap-8">
	<Gauge value={7} max={10} aria-label="Seats taken" aria-valuetext="7 of 10 seats">
		{#snippet children({ value })}
			<div class="flex flex-col items-center">
				<span class="text-2xl font-semibold tabular-nums">{value}/10</span>
				<span class="text-xs text-muted-foreground">seats</span>
			</div>
		{/snippet}
	</Gauge>

	<!-- Small enough for a table row: the number goes beside it instead of inside. -->
	<div class="flex items-center gap-2">
		<Gauge
			value={0.41}
			max={1}
			format={{ style: 'percent' }}
			thickness={16}
			class="[--coral-gauge:--spacing(6)]"
			contentClass="hidden"
			aria-label="CPU"
		/>
		<span class="text-sm tabular-nums" aria-hidden="true">41% CPU</span>
	</div>
</div>
