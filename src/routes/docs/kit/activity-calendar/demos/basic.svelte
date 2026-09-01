<script lang="ts">
	import ActivityCalendar from '$lib/coral/kit/activity-calendar/activity-calendar.svelte';
	import { END, START, sample } from '../sample.js';
</script>

<ActivityCalendar data={sample()} start={START} end={END} />
