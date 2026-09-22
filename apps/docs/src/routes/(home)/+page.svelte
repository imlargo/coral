<script lang="ts">
	/**
	 * Mirrors svdocs's own `(home)/+page.md` content exactly, just written as `.svelte` instead of
	 * `.md`: a literal `+page.md` route file hits the same landmine `svelte.config.js` documents for
	 * `docs/[...slug]` - SvelteKit resolves a route to its source file through Vite's manifest by
	 * exact path, and svmd's `.md` -> `.md.svmd.svelte` module id misses that lookup in a full
	 * adapter build. Loading through a plain `.svelte` file sidesteps it, same as the docs route.
	 */
	import { resolve } from '$app/paths';
	import { config } from '$docs/config/app.js';
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<svelte:head>
	<title>{config.branding.seo.title}</title>
	<meta name="description" content={config.branding.seo.description} />
</svelte:head>

<h1>{config.branding.name}</h1>

<p>{config.branding.seo.description}</p>

<div class="flex gap-3">
	<Button href={resolve('/docs')}>Get started</Button>
	<Button href={config.links.github} target="_blank" rel="noreferrer" variant="outline">
		GitHub
	</Button>
</div>
