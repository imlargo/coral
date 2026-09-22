<script lang="ts">
	import { resolve } from '$app/paths';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import NavbarNav from './navbar-nav.svelte';
	import NavbarSearch from './navbar-search.svelte';
	import NavbarActions from './navbar-actions.svelte';
</script>

<header class="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-sm">
	<div class="flex h-(--header-height) items-center justify-between gap-4 px-4 sm:px-6">
		<div class="flex items-center gap-6">
			<a href={resolve('/')} class="flex items-center gap-2 font-semibold tracking-tight">
				<span aria-hidden="true">🪸</span>
				Coral
			</a>

			<NavbarNav />
		</div>

		<div class="flex items-center gap-3">
			<div class="hidden sm:block">
				<NavbarSearch />
			</div>
			<div class="flex items-center justify-center">
				<Separator orientation="vertical" class="h-4" />
			</div>
			<NavbarActions />
		</div>
	</div>
</header>
