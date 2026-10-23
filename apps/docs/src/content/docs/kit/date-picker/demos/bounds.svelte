<script lang="ts">
	import { getLocalTimeZone, today } from '@internationalized/date';
	import DatePicker from '$lib/components/coral/kit/date-picker/date-picker.svelte';
	import type { DateValue } from '$lib/components/coral/kit/date-picker/types.js';

	const zone = getLocalTimeZone();
	const from = today(zone);

	function isWeekend(date: DateValue) {
		const weekday = date.toDate(zone).getDay();
		return weekday === 0 || weekday === 6;
	}

	let value = $state<DateValue>();
</script>

<div class="w-64">
	<DatePicker
		bind:value
		minValue={from}
		maxValue={from.add({ months: 2 })}
		isDateDisabled={isWeekend}
		placeholder="Business day"
	/>
</div>
