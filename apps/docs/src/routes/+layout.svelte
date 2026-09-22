<script lang="ts">
	import './layout.css';
	import favicon from '$assets/favicon.svg';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { ModeWatcher } from 'mode-watcher';
	import Navbar from '$docs/navigation/navbar.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ModeWatcher />
<Toaster />

<a
	href="#main-content"
	class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-ring"
>
	Skip to main content
</a>

<Navbar />

<!-- Skip-link target only, not the `main` landmark: a nested layout (the docs sidebar's
     `Sidebar.Inset`, the home page's own `<main>`) renders its own, and HTML forbids nesting two. -->
<div id="main-content" tabindex="-1">
	{@render children()}
</div>
