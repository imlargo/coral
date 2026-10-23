<script lang="ts">
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { Button } from '$lib/components/ui/button/index.js';
	import DatePicker from '$lib/components/coral/kit/date-picker/date-picker.svelte';
	import type { DateValue } from '$lib/components/coral/kit/date-picker/types.js';

	let value = $state<DateValue>();
</script>

<DatePicker bind:value>
	{#snippet trigger({ props, label, empty })}
		<Button {...props} variant="ghost" size="sm">
			<CalendarIcon />
			{empty ? 'Schedule' : label}
		</Button>
	{/snippet}

	{#snippet footer({ clear, close })}
		<div class="flex items-center justify-between gap-2">
			<Button variant="ghost" size="sm" onclick={clear}>Clear</Button>
			<Button variant="ghost" size="sm" onclick={close}>Done</Button>
		</div>
	{/snippet}
</DatePicker>
