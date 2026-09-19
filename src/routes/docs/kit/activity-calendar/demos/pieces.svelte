<script lang="ts">
	import ActivityCalendar from '$lib/coral/kit/activity-calendar/activity-calendar.svelte';
	import { END, START, sample } from '../sample.js';

	type Day = { hours: number };

	const format = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' });

	// `meta` is anything the project needs back. Coral carries it and never reads it.
	const data = sample().map((day) => ({ ...day, meta: { hours: day.count * 0.4 } as Day }));
</script>

<ActivityCalendar
	{data}
	start={START}
	end={END}
	caption="Commits per day, September 2025 to August 2026"
	label={(day) => `${day.count} commits on ${format.format(day.date)}`}
>
	{#snippet tooltip(day)}
		<div class="flex flex-col gap-0.5">
			<span class="font-medium">{format.format(day.date)}</span>
			<span>{day.count} commits · {day.meta?.hours.toFixed(1)} h</span>
		</div>
	{/snippet}

	{#snippet legend({ levels, colorFor, thresholds, total })}
		<div class="flex w-full items-center justify-between text-xs text-muted-foreground">
			<span>{total} commits this year</span>
			<div class="flex items-center gap-1">
				<span>1</span>
				{#each { length: levels + 1 }, level (level)}
					<span class="block size-3 rounded-xs" style="background-color: {colorFor(level)}"></span>
				{/each}
				<span>{thresholds.at(-1)}+</span>
			</div>
		</div>
	{/snippet}
</ActivityCalendar>
