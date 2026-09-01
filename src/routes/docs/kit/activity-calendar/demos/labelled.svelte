<script lang="ts">
	import ActivityCalendar from '$lib/coral/kit/activity-calendar/activity-calendar.svelte';
	import { END, START, sample } from '../sample.js';

	const format = new Intl.DateTimeFormat('es-CO', {
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
			? `Sin despachos el ${format.format(day.date)}`
			: `${day.count} despachos el ${format.format(day.date)}`}
/>
