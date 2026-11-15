<script lang="ts">
	import { endOfMonth, getLocalTimeZone, today } from '@internationalized/date';
	import DatePicker from '#lib/components/coral/kit/date-picker/date-picker.svelte';
	import type { Preset } from '#lib/components/coral/kit/date-picker/presets.js';
	import type { DateRange } from '#lib/components/coral/kit/date-picker/types.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import ShowcaseCard from './ShowcaseCard.svelte';

	const zone = getLocalTimeZone();

	const nextDays = (days: number) => () => ({
		start: today(zone),
		end: today(zone).add({ days: days - 1 })
	});

	const presets: Preset<DateRange>[] = [
		{ label: 'Next 3 days', value: nextDays(3) },
		{ label: 'Next 7 days', value: nextDays(7) },
		{
			label: 'Rest of the month',
			value: () => ({ start: today(zone), end: endOfMonth(today(zone)) })
		}
	];

	let value = $state<DateRange>();

	const frozen = $derived.by(() => {
		if (!value?.start || !value.end) return undefined;
		const formatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
		const days = value.end.compare(value.start) + 1;
		return `${formatter.formatRange(value.start.toDate(zone), value.end.toDate(zone))} (${days} ${days === 1 ? 'day' : 'days'})`;
	});
</script>

<ShowcaseCard
	title="Deploy freeze"
	description="No deployments reach Production during this window."
	hint="Pick a shortcut, then open it again: the shortcut it came from is still marked."
	components={['kit/date-picker']}
>
	<Field.Field>
		<Field.Label for="freeze-window">Freeze window</Field.Label>
		<DatePicker
			id="freeze-window"
			type="range"
			bind:value
			{presets}
			minValue={today(zone)}
			placeholder="Pick dates"
			clearable
			clearLabel="Clear freeze window"
		/>
	</Field.Field>

	<p class="text-sm text-muted-foreground" role="status">
		{frozen ? `Frozen ${frozen}` : 'No freeze scheduled.'}
	</p>
</ShowcaseCard>
