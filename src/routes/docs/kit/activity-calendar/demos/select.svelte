<script lang="ts">
	import ActivityCalendar from '$lib/coral/kit/activity-calendar/activity-calendar.svelte';
	import type { ActivityCell } from '$lib/coral/kit/activity-calendar/types.js';
	import { END, START, sample } from '../sample.js';

	let picked = $state<ActivityCell | null>(null);

	const format = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' });
</script>

<div class="flex w-full flex-col gap-4">
	<ActivityCalendar data={sample()} start={START} end={END} onselect={(day) => (picked = day)} />

	<p class="text-sm text-muted-foreground">
		{picked ? `${format.format(picked.date)} · ${picked.count}` : 'Pick a day.'}
	</p>
</div>
