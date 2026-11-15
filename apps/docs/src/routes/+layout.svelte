<script lang="ts">
	import './layout.css';
	import { Toaster } from '#lib/components/ui/sonner/index.js';
	import { ModeWatcher } from 'mode-watcher';
	import { config } from '#lib/config/app.js';
	import type { LayoutProps } from './$types';
	import Navbar from '#lib/components/layout/navigation/Navbar.svelte';
	import SiteFooter from '#lib/components/layout/SiteFooter.svelte';
	import { SiteTheme, setSiteTheme } from '#lib/features/theme/theme.svelte.js';

	let { children }: LayoutProps = $props();

	setSiteTheme(new SiteTheme());
</script>

<svelte:head>
	<link rel="icon" href={config.branding.favicon} />
</svelte:head>

<ModeWatcher />
<Toaster />

<a
	href="#main-content"
	class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-ring"
>
	Skip to main content
</a>

<div class="flex min-h-svh flex-col">
	<Navbar></Navbar>

	<!-- Skip-link target only, not the `main` landmark: each nested layout renders its own `<main>`,
	     beside the asides it keeps out of it, and HTML forbids nesting two. -->
	<div id="main-content" tabindex="-1" class="flex-1">
		{@render children?.()}
	</div>

	<SiteFooter />
</div>
