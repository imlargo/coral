<script lang="ts">
	import Gauge from '#lib/components/coral/kit/gauge/gauge.svelte';
</script>

<!-- One `sweep`, three shapes: a full circle starts at twelve o'clock, anything less opens at the
     bottom. The drawing is cropped to the arc, so a half circle takes half the height. -->
<div class="flex flex-wrap items-end justify-center gap-8">
	<Gauge value={64} aria-label="Uptime score" />
	<Gauge value={64} sweep={360} aria-label="Uptime score" />
	<Gauge value={64} sweep={180} aria-label="Uptime score" />
</div>
