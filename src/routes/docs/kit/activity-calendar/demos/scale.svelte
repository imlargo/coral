<script lang="ts">
	import ActivityCalendar from '$lib/coral/kit/activity-calendar/activity-calendar.svelte';
	import { END, START, sample } from '../sample.js';
</script>

<!-- Bigger squares, six steps, weeks starting on Sunday, and the ramp built on a chart token. -->
<ActivityCalendar
	data={sample()}
	start={START}
	end={END}
	weekStart={0}
	levels={6}
	color="var(--chart-2)"
	class="[--coral-cell:1rem] [--coral-gap:0.25rem]"
/>
