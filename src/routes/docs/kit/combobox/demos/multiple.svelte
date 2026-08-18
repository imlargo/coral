<script lang="ts">
	import Combobox from '$lib/coral/kit/combobox/combobox.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	const roles = [
		{ value: 'admin', label: 'Administrador' },
		{ value: 'editor', label: 'Editor' },
		{ value: 'viewer', label: 'Lector' },
		{ value: 'auditor', label: 'Auditor' },
		{ value: 'billing', label: 'Facturación' }
	];

	let selected = $state<string[]>(['editor']);
	let lastChange = $state('nothing yet');
</script>

<div class="flex w-72 flex-col gap-3">
	<Combobox
		type="multiple"
		options={roles}
		bind:value={selected}
		clearable
		placeholder="Select roles..."
		searchPlaceholder="Search roles..."
		onchange={(picked) => (lastChange = picked.map((option) => option.label).join(', ') || 'none')}
	>
		{#snippet footer({ selected: picked, visible, clear, selectAll })}
			<div class="flex items-center justify-between gap-2 px-1">
				<span class="text-xs text-muted-foreground">
					{picked.length} of {visible.length}
				</span>
				<div class="flex gap-1">
					<Button variant="ghost" size="xs" onclick={selectAll}>All</Button>
					<Button variant="ghost" size="xs" onclick={clear}>None</Button>
				</div>
			</div>
		{/snippet}
	</Combobox>

	<p class="text-sm text-muted-foreground">{JSON.stringify(selected)}</p>
	<!-- `type="multiple"` makes onchange receive every selected option, so `.label` is right here. -->
	<p class="text-sm text-muted-foreground">onchange saw: {lastChange}</p>
</div>
