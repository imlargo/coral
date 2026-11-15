<script lang="ts">
	import { config } from '#lib/config/app.js';
	import { resolvePathname } from '#lib/utils/paths.js';
	import { SITE, REGISTRY_PATH } from 'coral/registry.config.js';

	const pages = [
		{ title: 'Documentation', href: resolvePathname('/docs') },
		{ title: 'Changelog', href: resolvePathname('/docs/changelog') }
	];

	// Served by this site but not pages of it, or not on it at all: a full navigation either way.
	const external = [
		{ title: 'Registry index', href: `${SITE}${REGISTRY_PATH}/index.json` },
		{ title: 'Source', href: config.links.github },
		{ title: 'License', href: `${config.links.github}/blob/main/LICENSE` }
	];
</script>

<footer class="border-t">
	<div
		class="flex flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between"
	>
		<p>
			{config.branding.name} is open source under the MIT license. Built on
			<a
				href="https://shadcn-svelte.com"
				class="font-medium text-foreground underline-offset-4 hover:underline">shadcn-svelte</a
			>.
		</p>
		<nav aria-label="Footer">
			<ul class="flex flex-wrap gap-x-5 gap-y-2">
				{#each pages as link (link.title)}
					<li>
						<a href={link.href} class="underline-offset-4 hover:text-foreground hover:underline">
							{link.title}
						</a>
					</li>
				{/each}
				{#each external as link (link.title)}
					<li>
						<a
							href={link.href}
							rel="external"
							class="underline-offset-4 hover:text-foreground hover:underline"
						>
							{link.title}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</footer>
