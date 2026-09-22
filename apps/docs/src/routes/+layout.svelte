<script lang="ts">
	import './layout.css';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { ModeWatcher } from 'mode-watcher';
	import { config } from '$docs/config/app.js';
	import Navbar from '$docs/components/layout/navigation/navbar.svelte';

	let { children } = $props();
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

<div>
	<Navbar></Navbar>

	<!-- Skip-link target only, not the `main` landmark: nested layouts (e.g. the docs sidebar's
	     `Sidebar.Inset`) render their own `<main>`, and HTML forbids nesting two. -->
	<div id="main-content" tabindex="-1">
		{@render children?.()}
	</div>
</div>
