<script lang="ts">
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { Button } from '$lib/components/ui/button/index.js';
	import DatePicker from '$lib/coral/kit/date-picker/date-picker.svelte';
	import type { DateValue } from '$lib/coral/kit/date-picker/types.js';

	let value = $state<DateValue>();
</script>

<DatePicker bind:value>
	{#snippet trigger({ props, label, empty })}
		<Button {...props} variant="ghost" size="sm">
			<CalendarIcon />
			{empty ? 'Programar' : label}
		</Button>
	{/snippet}

	{#snippet footer({ clear, close })}
		<div class="flex items-center justify-between gap-2">
			<Button variant="ghost" size="sm" onclick={clear}>Limpiar</Button>
			<Button variant="ghost" size="sm" onclick={close}>Listo</Button>
		</div>
	{/snippet}
</DatePicker>
