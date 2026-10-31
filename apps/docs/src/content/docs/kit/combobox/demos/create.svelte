<script lang="ts">
	import Combobox from '#lib/components/coral/kit/combobox/combobox.svelte';
	import type { Option } from '#lib/components/coral/lib/options.js';

	let teams = $state<Option<string>[]>([
		{ value: 'platform', label: 'Platform' },
		{ value: 'payments', label: 'Payments' },
		{ value: 'growth', label: 'Growth' }
	]);
	let team = $state<string | undefined>();

	async function createTeam(name: string): Promise<Option<string>> {
		// Stands in for the request that creates it.
		await new Promise((resolve) => setTimeout(resolve, 400));
		const created = { value: name.toLowerCase().replace(/\s+/g, '-'), label: name };
		teams = [...teams, created];
		return created;
	}
</script>

<div class="flex w-64 flex-col gap-3">
	<Combobox
		options={teams}
		bind:value={team}
		oncreate={createTeam}
		placeholder="Assign a team..."
		searchPlaceholder="Find or create a team..."
		aria-label="Team"
	/>
	<p class="font-mono text-xs text-muted-foreground">value: {team ?? 'undefined'}</p>
</div>
