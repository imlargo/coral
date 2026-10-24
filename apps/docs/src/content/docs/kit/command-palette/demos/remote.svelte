<script lang="ts">
	import CommandPalette from '#lib/components/coral/kit/command-palette/command-palette.svelte';
	import { fold } from '#lib/components/coral/lib/fold.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import type { CommandAction } from '#lib/components/coral/kit/command-palette/types.js';

	// Stands in for a search endpoint.
	const REPOSITORIES = ['api-gateway', 'billing-service', 'docs-site', 'mobile-app', 'web-app'];

	const local: CommandAction[] = [
		{ id: 'new-project', label: 'New project', group: 'Actions', run: () => {} },
		{ id: 'invite', label: 'Invite a team member', group: 'Actions', run: () => {} },
		{ id: 'api-keys', label: 'Manage API keys', group: 'Actions', run: () => {} }
	];

	let open = $state(false);
	let term = $state('');
	let remote = $state<CommandAction[]>([]);
	let loading = $state(false);

	// `onsearch` switches the primitive's filtering off, so the local actions are filtered here.
	const matches = (label: string) => fold(label).includes(fold(term.trim()));
	const actions = $derived([...local.filter((entry) => matches(entry.label)), ...remote]);

	async function search(next: string) {
		term = next;
		remote = [];
		loading = next.trim() !== '';
		if (!loading) return;

		await new Promise((resolve) => setTimeout(resolve, 600));
		// A newer search has started, and owns `loading` now.
		if (next !== term) return;
		remote = REPOSITORIES.filter(matches).map((name) => ({
			id: `repo-${name}`,
			label: name,
			group: 'Repositories',
			run: () => {}
		}));
		loading = false;
	}
</script>

<Button variant="outline" onclick={() => (open = true)}>Search everything</Button>

<CommandPalette
	{actions}
	{loading}
	bind:open
	shortcut=""
	onsearch={search}
	searchDebounce={200}
	placeholder="Search actions and repositories..."
/>
