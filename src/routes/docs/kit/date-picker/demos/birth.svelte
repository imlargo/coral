<script lang="ts">
	import { getLocalTimeZone, today } from '@internationalized/date';
	import { Label } from '$lib/components/ui/label/index.js';
	import DatePicker from '$lib/coral/kit/date-picker/date-picker.svelte';
	import type { DateValue } from '$lib/coral/kit/date-picker/types.js';

	const id = $props.id();
	let value = $state<DateValue>();
</script>

<div class="flex w-64 flex-col gap-3">
	<Label for={id}>Fecha de nacimiento</Label>
	<DatePicker
		{id}
		bind:value
		captionLayout="dropdown"
		maxValue={today(getLocalTimeZone())}
		format={{ dateStyle: 'long' }}
		placeholder="Selecciona tu fecha"
	/>
</div>
