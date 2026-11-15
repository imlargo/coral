<script lang="ts">
	import CodeIcon from '@lucide/svelte/icons/code';
	import FileJsonIcon from '@lucide/svelte/icons/file-json';
	import { itemUrl } from 'coral/registry.config.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { sourceUrl, type ComponentMeta } from '#lib/features/docs/component-meta.js';

	let { component }: { component: ComponentMeta } = $props();

	const linkClass =
		'inline-flex items-center gap-1.5 rounded-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring [&_svg]:size-3.5';
</script>

<dl class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
	<div class="flex items-center gap-2">
		<dt class="sr-only">Version</dt>
		<dd><Badge variant="outline" class="font-mono">v{component.version}</Badge></dd>
	</div>
	<div class="flex items-center gap-2">
		<dt class="sr-only">Links</dt>
		<dd class="flex items-center gap-4">
			<a href={sourceUrl(component.name)} rel="external" class={linkClass}>
				<CodeIcon aria-hidden="true" />
				Source
			</a>
			<a href={itemUrl(component.item)} rel="external" class={linkClass}>
				<FileJsonIcon aria-hidden="true" />
				Registry item
			</a>
		</dd>
	</div>
	{#if component.shadcn.length}
		<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
			<dt class="text-muted-foreground">Built on</dt>
			<dd class="flex flex-wrap gap-1">
				{#each component.shadcn as primitive (primitive)}
					<Badge
						href="https://shadcn-svelte.com/docs/components/{primitive}"
						variant="secondary"
						class="font-mono">{primitive}</Badge
					>
				{/each}
			</dd>
		</div>
	{/if}
</dl>
