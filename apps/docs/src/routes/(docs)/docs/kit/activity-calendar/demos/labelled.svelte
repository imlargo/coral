<script lang="ts">
	import ActivityCalendar from '$lib/components/coral/kit/activity-calendar/activity-calendar.svelte';
	import { END, START, sample } from '../sample.js';

	const format = new Intl.DateTimeFormat('en-US', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
</script>

<!-- The copy lives here, where the project knows what it is counting. -->
<ActivityCalendar
	data={sample()}
	start={START}
	end={END}
	label={(day) =>
		day.count === 0
			? `No commits on ${format.format(day.date)}`
			: `${day.count} ${day.count === 1 ? 'commit' : 'commits'} on ${format.format(day.date)}`}
/>
