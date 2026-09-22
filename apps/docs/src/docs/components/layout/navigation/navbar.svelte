<script lang="ts">
	import { resolve } from '$app/paths';
	import { config } from '$docs/config/app.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import NavbarNav from './navbar-nav.svelte';
	import NavbarSearch from './navbar-search.svelte';
	import NavbarActions from './navbar-actions.svelte';
</script>

<header class="border-b">
	<div class="flex h-(--header-height) items-center justify-between pr-4 pl-8">
		<div class="flex items-center gap-6">
			<a href={resolve('/')} class="flex items-center gap-2 font-semibold">
				<img src={config.branding.logo} alt="" class="size-6" />
				<span>{config.branding.name}</span>
			</a>

			<NavbarNav />
		</div>

		<div class="flex items-center gap-3">
			<NavbarSearch />
			<div class="flex items-center justify-center">
				<Separator orientation="vertical" class="h-4" />
			</div>
			<NavbarActions />
		</div>
	</div>
</header>
