<script lang="ts">
	import DatePicker from '$lib/coral/kit/date-picker/date-picker.svelte';
	import type { DateRange } from '$lib/coral/kit/date-picker/types.js';

	let value = $state<DateRange>();
</script>

<div class="w-72">
	<DatePicker
		type="range"
		bind:value
		numberOfMonths={2}
		placeholder="Selecciona un rango"
		clearable
	/>
</div>
