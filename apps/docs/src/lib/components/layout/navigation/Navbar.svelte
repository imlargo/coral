<script lang="ts">
	import { resolvePathname } from '#lib/utils/paths.js';
	import { config } from '#lib/config/app.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import MobileNav from '#lib/components/layout/navigation/MobileNav.svelte';
	import NavbarNav from '#lib/components/layout/navigation/NavbarNav.svelte';
	import ReleasePill from '#lib/components/layout/navigation/ReleasePill.svelte';
	import DocsSearch from '#lib/features/docs/components/DocsSearch.svelte';
	import NavbarActions from '#lib/components/layout/navigation/NavbarActions.svelte';
</script>

<header class="sticky top-0 z-40 border-b bg-background">
	<div class="flex h-(--header-height) items-center gap-2 px-4 sm:px-6">
		<MobileNav />
		<a
			href={resolvePathname('/')}
			class="me-2 flex items-center gap-2 rounded-md font-semibold focus-visible:outline-2 focus-visible:outline-ring md:me-4"
		>
			<img src={config.branding.logo} alt="" class="size-6" />
			<span>{config.branding.name}</span>
		</a>
		<NavbarNav />

		<div class="ms-auto flex items-center gap-1 sm:gap-2">
			<ReleasePill />
			<DocsSearch />
			<Separator orientation="vertical" class="mx-1 hidden h-4 sm:block" />
			<NavbarActions />
		</div>
	</div>
</header>
