<script lang="ts">
	import { page } from '$app/state';
	import { NAV_ITEMS } from '#lib/config/navigation.js';
	import { resolvePathname } from '#lib/utils/paths.js';

	// `/docs` is the section, so it stays current on every page under it that has no entry of its own.
	function isCurrent(href: string): boolean {
		const path = page.url.pathname;
		if (path === href) return true;
		if (href !== '/docs' || !path.startsWith('/docs/')) return false;
		return !NAV_ITEMS.some((item) => item.href !== href && path.startsWith(item.href));
	}
</script>

<nav aria-label="Site" class="hidden md:block">
	<ul class="flex items-center gap-1">
		{#each NAV_ITEMS as item (item.href)}
			<li>
				<a
					href={resolvePathname(item.href)}
					aria-current={isCurrent(item.href) ? 'page' : undefined}
					class="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:text-foreground"
				>
					{item.title}
				</a>
			</li>
		{/each}
	</ul>
</nav>
