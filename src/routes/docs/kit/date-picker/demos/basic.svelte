<script lang="ts">
	import DatePicker from '$lib/coral/kit/date-picker/date-picker.svelte';
	import type { DateValue } from '$lib/coral/kit/date-picker/types.js';

	let value = $state<DateValue>();
</script>

<div class="w-64">
	<DatePicker bind:value placeholder="Selecciona una fecha" clearable />
</div>
