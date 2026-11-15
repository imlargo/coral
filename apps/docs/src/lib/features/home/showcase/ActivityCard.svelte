<script lang="ts">
	import ActivityCalendar from '#lib/components/coral/kit/activity-calendar/activity-calendar.svelte';
	import type { ActivityDay } from '#lib/components/coral/kit/activity-calendar/types.js';
	import Gauge from '#lib/components/coral/kit/gauge/gauge.svelte';
	import ShowcaseCard from '#lib/features/home/showcase/ShowcaseCard.svelte';

	// Seeded, so the prerendered page and the hydrated one draw the same grid.
	function random(seed: number): () => number {
		let state = seed;
		return () => {
			state = (state + 0x6d2b79f5) | 0;
			let value = Math.imul(state ^ (state >>> 15), 1 | state);
			value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
			return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
		};
	}

	const START = '2025-11-01';
	const END = '2026-10-31';

	function deploys(seed: number): ActivityDay[] {
		const next = random(seed);
		const days: ActivityDay[] = [];
		for (let day = 0; day < 365; day++) {
			const date = new Date(2025, 10, 1 + day, 12);
			const weekend = date.getDay() === 0 || date.getDay() === 6;
			// A code freeze over the holidays.
			const frozen = day > 50 && day < 64;
			const count = !frozen && next() > (weekend ? 0.8 : 0.3) ? Math.ceil(next() ** 3 * 12) : 0;
			days.push({
				date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
				count
			});
		}
		return days;
	}

	const data = deploys(11);
	const total = data.reduce((sum, day) => sum + day.count, 0);

	const USED = 4180;
	const LIMIT = 6000;

	const day = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
	const number = new Intl.NumberFormat('en-US');
</script>

<ShowcaseCard
	title="Deploys this year"
	description="Production deploys of web-app per day, and build minutes on the Pro plan."
	hint="Hover a square, or Tab into the grid and use the arrow keys: each day says what it counts."
	components={['kit/activity-calendar', 'kit/gauge']}
>
	<div class="flex min-w-0 flex-col gap-4">
		<ActivityCalendar
			{data}
			start={START}
			end={END}
			locale="en-US"
			caption="Production deploys per day"
			label={(cell) =>
				cell.count === 0
					? `No deploys on ${day.format(cell.date)}`
					: `${cell.count} ${cell.count === 1 ? 'deploy' : 'deploys'} on ${day.format(cell.date)}`}
		/>
		<p class="text-sm text-muted-foreground">
			{number.format(total)} deploys in the last 12 months
		</p>
		<div class="flex flex-wrap items-center gap-4">
			<Gauge
				value={USED / LIMIT}
				max={1}
				locale="en-US"
				format={{ style: 'percent' }}
				aria-label="Build minutes used this month"
				aria-valuetext="{number.format(USED)} of {number.format(LIMIT)} minutes"
			/>
			<div class="flex min-w-0 flex-col gap-1 text-sm">
				<p class="font-medium">Build minutes</p>
				<p class="text-muted-foreground">
					{number.format(USED)} of {number.format(LIMIT)} used this month. Resets on December 1.
				</p>
			</div>
		</div>
	</div>
</ShowcaseCard>
