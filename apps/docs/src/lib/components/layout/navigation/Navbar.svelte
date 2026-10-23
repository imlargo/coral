<script lang="ts">
	import { resolvePathname } from '#lib/utils/paths.js';
	import { config } from '#lib/config/app.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import NavbarNav from '#lib/components/layout/navigation/NavbarNav.svelte';
	import DocsSearch from '#lib/features/docs/components/DocsSearch.svelte';
	import NavbarActions from '#lib/components/layout/navigation/NavbarActions.svelte';
</script>

<header class="border-b">
	<div class="flex h-(--header-height) items-center justify-between pr-4 pl-8">
		<div class="flex items-center gap-6">
			<a href={resolvePathname('/')} class="flex items-center gap-2 font-semibold">
				<img src={config.branding.logo} alt="" class="size-6" />
				<span>{config.branding.name}</span>
			</a>

			<NavbarNav />
		</div>

		<div class="flex items-center gap-3">
			<DocsSearch />
			<div class="flex items-center justify-center">
				<Separator orientation="vertical" class="h-4" />
			</div>
			<NavbarActions />
		</div>
	</div>
</header>
