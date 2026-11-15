<script lang="ts">
	/**
	 * How to install one component: the CLI command per package manager, or the manual copy - its
	 * primitives, its packages and every file it needs, `lib/` included.
	 *
	 * Rendered by `docs/[...slug]/+page.svelte` for every installable page rather than written into
	 * the Markdown: all of it follows from the manifest and the source, so a hand-written copy per
	 * page would be one more place to forget when either changes.
	 */
	import { itemUrl } from 'coral/registry.config.js';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '#lib/components/ui/tabs/index.js';
	import CommandLine from '#lib/features/docs/components/CommandLine.svelte';
	import { sourceUrl, type ComponentMeta } from '#lib/features/docs/component-meta.js';

	let { component }: { component: ComponentMeta } = $props();

	// The reader's package manager, not a preference of ours. pnpm first because the repo uses it.
	const managers = [
		{ id: 'pnpm', run: 'pnpm dlx', add: 'pnpm add' },
		{ id: 'npm', run: 'npx', add: 'npm install' },
		{ id: 'bun', run: 'bunx --bun', add: 'bun add' },
		{ id: 'yarn', run: 'yarn dlx', add: 'yarn add' }
	];

	let manager = $state('pnpm');
	const current = $derived(managers.find((m) => m.id === manager) ?? managers[0]);

	const cli = $derived(`${current.run} shadcn-svelte@latest add ${itemUrl(component.item)}`);
	const primitives = $derived(
		component.shadcn.length
			? `${current.run} shadcn-svelte@latest add ${component.shadcn.join(' ')}`
			: undefined
	);
	const packages = $derived(
		component.npm.length ? `${current.add} ${component.npm.join(' ')}` : undefined
	);
</script>

{#snippet managerTabs()}
	<Tabs bind:value={manager}>
		<TabsList class="h-7" aria-label="Package manager">
			{#each managers as m (m.id)}
				<TabsTrigger value={m.id} class="px-3 text-xs">{m.id}</TabsTrigger>
			{/each}
		</TabsList>
	</Tabs>
{/snippet}

<section aria-label="Installation" class="not-prose my-8">
	<Tabs value="cli" class="gap-0 overflow-hidden rounded-lg border">
		<div class="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-2 py-1.5">
			<TabsList class="h-7">
				<TabsTrigger value="cli" class="px-3 text-xs">CLI</TabsTrigger>
				<TabsTrigger value="manual" class="px-3 text-xs">Manual</TabsTrigger>
			</TabsList>
			{@render managerTabs()}
		</div>

		<TabsContent value="cli" class="mt-0">
			<CommandLine command={cli} />
			<p class="border-t px-4 py-3 text-xs text-muted-foreground">
				Installs the component as source under your <code>components</code> alias, with the
				{component.shadcn.length ? 'shadcn-svelte primitives and ' : ''}shared modules it needs.
			</p>
		</TabsContent>

		<TabsContent value="manual" class="mt-0">
			<ol class="grid list-decimal gap-5 p-4 ps-8 text-sm marker:text-muted-foreground">
				{#if primitives}
					<li class="grid gap-2">
						<p>Add the shadcn-svelte primitives it is built on.</p>
						<CommandLine command={primitives} class="rounded-md border" />
					</li>
				{/if}
				{#if packages}
					<li class="grid gap-2">
						<p>Install the packages it imports.</p>
						<CommandLine command={packages} class="rounded-md border" />
					</li>
				{/if}
				<li class="grid gap-2">
					<p>
						Copy these files into <code class="font-mono text-xs">src/lib/components/coral/</code>,
						keeping their paths.
					</p>
					<ul class="grid gap-1 rounded-md border p-3 font-mono text-xs">
						{#each component.files as file (file)}
							<li>
								<a
									href={sourceUrl(file)}
									rel="external"
									class="break-all underline-offset-4 hover:text-foreground hover:underline"
								>
									{file}
								</a>
							</li>
						{/each}
					</ul>
				</li>
				<li>
					<p class="text-muted-foreground">
						Coral imports <code class="font-mono text-xs">#lib/components/ui/*</code> and
						<code class="font-mono text-xs">#lib/utils.js</code>. If your
						<code class="font-mono text-xs">components.json</code> aliases differ, point those imports
						at yours.
					</p>
				</li>
			</ol>
		</TabsContent>
	</Tabs>
</section>
