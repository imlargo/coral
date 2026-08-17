<script lang="ts">
	import Combobox from '$lib/coral/kit/combobox/combobox.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import CircleDashedIcon from '@lucide/svelte/icons/circle-dashed';
	import CircleDotIcon from '@lucide/svelte/icons/circle-dot';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';

	const statuses = [
		{ value: 'todo', label: 'Todo' },
		{ value: 'doing', label: 'In progress' },
		{ value: 'done', label: 'Done' }
	];

	const ICONS = { todo: CircleDashedIcon, doing: CircleDotIcon, done: CircleCheckIcon };

	let status = $state<string>('todo');
</script>

<div class="flex items-center gap-3">
	<span class="text-sm text-muted-foreground">Status</span>

	<Combobox options={statuses} bind:value={status} searchPlaceholder="Change status...">
		{#snippet trigger({ props, selected })}
			{@const Icon = selected[0]
				? ICONS[selected[0].value as keyof typeof ICONS]
				: CircleDashedIcon}
			<Button {...props} variant="outline" size="sm">
				<Icon />
				{selected[0]?.label ?? 'Set status'}
			</Button>
		{/snippet}

		{#snippet option({ option })}
			{@const Icon = ICONS[option.value as keyof typeof ICONS]}
			<Icon />
			{option.label}
		{/snippet}
	</Combobox>
</div>
