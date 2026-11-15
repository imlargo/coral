<script lang="ts">
	import Gauge from '#lib/components/coral/kit/gauge/gauge.svelte';
</script>

<div class="flex flex-wrap items-center justify-center gap-8">
	<!-- A percent takes the fraction, so the range is 0 to 1. -->
	<Gauge
		value={0.996}
		max={1}
		format={{ style: 'percent' }}
		aria-label="Disk used on api-gateway"
	/>
	<Gauge
		value={48}
		max={64}
		format={{ style: 'unit', unit: 'gigabyte', maximumFractionDigits: 0 }}
		aria-label="Memory reserved by production"
		aria-valuetext="48 of 64 GB"
	/>
</div>
