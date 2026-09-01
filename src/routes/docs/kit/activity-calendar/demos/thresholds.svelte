<script lang="ts">
	import ActivityCalendar from '$lib/coral/kit/activity-calendar/activity-calendar.svelte';
	import { END, START, sample } from '../sample.js';
</script>

<!-- Fixed cuts, so two grids side by side are comparable rather than each scaled to itself. -->
<ActivityCalendar
	data={sample()}
	start={START}
	end={END}
	thresholds={[1, 3, 6, 10]}
	showLegend={false}
/>
