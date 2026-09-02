<script lang="ts">
	import { getLocalTimeZone, today } from '@internationalized/date';
	import DatePicker from '$lib/coral/kit/date-picker/date-picker.svelte';
	import type { Preset } from '$lib/coral/kit/date-picker/presets.js';
	import type { DateRange } from '$lib/coral/kit/date-picker/types.js';

	const zone = getLocalTimeZone();

	// Thunks, not values: a tab left open overnight would otherwise still offer yesterday's "hoy".
	const lastDays = (days: number) => () => ({
		start: today(zone).subtract({ days: days - 1 }),
		end: today(zone)
	});

	const presets: Preset<DateRange>[] = [
		{ label: 'Hoy', value: () => ({ start: today(zone), end: today(zone) }) },
		{ label: 'Últimos 7 días', value: lastDays(7) },
		{ label: 'Últimos 30 días', value: lastDays(30) },
		{ label: 'Este mes', value: () => ({ start: today(zone).set({ day: 1 }), end: today(zone) }) }
	];

	let value = $state<DateRange>({ start: today(zone).subtract({ days: 6 }), end: today(zone) });
</script>

<div class="w-72">
	<DatePicker type="range" bind:value {presets} placeholder="Periodo" />
</div>
