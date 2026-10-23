<script lang="ts">
	import PageState from '#lib/components/coral/kit/page-state/page-state.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import type { PageStateKind } from '#lib/components/coral/kit/page-state/types.js';

	type Environment = { id: string; name: string; region: string };

	const all: Environment[] = [
		{ id: '1', name: 'production', region: 'fra1' },
		{ id: '2', name: 'preview', region: 'iad1' }
	];

	let rows = $state<Environment[]>(all);
	let loading = $state(false);
	let error = $state<unknown>(undefined);
	let status = $state<PageStateKind>('idle');

	async function load({ wait, fail, blank }: { wait: number; fail?: boolean; blank?: boolean }) {
		error = undefined;
		loading = true;
		await new Promise((resolve) => setTimeout(resolve, wait));
		if (fail) error = new Error('The environments service did not answer.');
		else rows = blank ? [] : all;
		loading = false;
	}
</script>

<div class="flex w-full max-w-xl flex-col gap-3">
	<div class="flex flex-wrap gap-2">
		<Button variant="outline" size="sm" onclick={() => load({ wait: 120 })}>Fast (120ms)</Button>
		<Button variant="outline" size="sm" onclick={() => load({ wait: 1500 })}>Slow (1.5s)</Button>
		<Button variant="outline" size="sm" onclick={() => load({ wait: 800, blank: true })}>
			Empty
		</Button>
		<Button variant="outline" size="sm" onclick={() => load({ wait: 800, fail: true })}>
			Failing
		</Button>
	</div>

	<div class="rounded-lg border p-2">
		<PageState
			{loading}
			{error}
			empty={rows.length === 0}
			bind:status
			onretry={() => load({ wait: 800 })}
			emptyTitle="No environments yet."
			emptyDescription="Create one to deploy a branch to it."
			errorTitle="Could not load environments."
		>
			<ul class="divide-y text-sm">
				{#each rows as row (row.id)}
					<li class="flex justify-between px-2 py-2">
						<span>{row.name}</span>
						<span class="text-muted-foreground">{row.region}</span>
					</li>
				{/each}
			</ul>
		</PageState>
	</div>

	<p class="text-sm text-muted-foreground">
		State: <code>{status}</code>. The fast one never shows a spinner: it finishes inside the delay
		window, so nothing is drawn at all.
	</p>
</div>
