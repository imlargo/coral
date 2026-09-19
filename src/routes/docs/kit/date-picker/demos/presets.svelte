<script lang="ts">
	import { getLocalTimeZone, today } from '@internationalized/date';
	import DatePicker from '$lib/coral/kit/date-picker/date-picker.svelte';
	import type { Preset } from '$lib/coral/kit/date-picker/presets.js';
	import type { DateRange } from '$lib/coral/kit/date-picker/types.js';

	const zone = getLocalTimeZone();

	// Thunks, not values: a tab left open overnight would otherwise still offer yesterday's "today".
	const lastDays = (days: number) => () => ({
		start: today(zone).subtract({ days: days - 1 }),
		end: today(zone)
	});

	const presets: Preset<DateRange>[] = [
		{ label: 'Today', value: () => ({ start: today(zone), end: today(zone) }) },
		{ label: 'Last 7 days', value: lastDays(7) },
		{ label: 'Last 30 days', value: lastDays(30) },
		{ label: 'This month', value: () => ({ start: today(zone).set({ day: 1 }), end: today(zone) }) }
	];

	let value = $state<DateRange>({ start: today(zone).subtract({ days: 6 }), end: today(zone) });
</script>

<div class="w-72">
	<DatePicker type="range" bind:value {presets} placeholder="Date range" />
</div>
