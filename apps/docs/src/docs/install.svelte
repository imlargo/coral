<script lang="ts">
	/**
	 * The command that installs one component, per package manager.
	 *
	 * Rendered by `docs/[...slug]/+page.svelte` for every `kit/*` page rather than written into the
	 * Markdown: the command is the item name and the registry URL, both of which the page already
	 * knows, and 25 hand-written copies of it is 25 places to forget when either changes.
	 *
	 * The command is printed rather than highlighted. Everything else on a docs page goes through
	 * shiki at build time, and one line of shell that is mostly a URL has nothing to colour that
	 * would justify shipping a highlighter to the browser for it.
	 *
	 * The tabs are the reader's package manager, not a preference we have. pnpm goes first because
	 * it is what the repo uses.
	 */
	import CopyButton from './copy-button.svelte';
	import { itemUrl } from 'coral/registry-config';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs/index.js';

	let {
		/** Registry item name, e.g. `kit-select`. */
		item
	}: { item: string } = $props();

	const managers = [
		{ id: 'pnpm', run: 'pnpm dlx' },
		{ id: 'npm', run: 'npx' },
		{ id: 'bun', run: 'bunx --bun' },
		{ id: 'yarn', run: 'yarn dlx' }
	];

	const commands = $derived(
		managers.map((manager) => ({
			...manager,
			command: `${manager.run} shadcn-svelte@latest add ${itemUrl(item)}`
		}))
	);
</script>

<Tabs value="pnpm" class="not-prose my-6 gap-0 overflow-hidden rounded-lg border">
	<div class="flex items-center border-b bg-muted/30 px-2 py-1.5">
		<TabsList class="h-7">
			{#each managers as manager (manager.id)}
				<TabsTrigger value={manager.id} class="px-3 text-xs">{manager.id}</TabsTrigger>
			{/each}
		</TabsList>
	</div>

	{#each commands as manager (manager.id)}
		<TabsContent value={manager.id} class="relative mt-0">
			<CopyButton text={manager.command} class="absolute top-2 right-2 z-10" />
			<div class="docs-code">
				<pre><code>{manager.command}</code></pre>
			</div>
		</TabsContent>
	{/each}
</Tabs>
