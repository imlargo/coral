<script lang="ts">
	import Breadcrumbs from '#lib/components/coral/kit/breadcrumbs/breadcrumbs.svelte';
	import type { Crumb } from '#lib/components/coral/kit/breadcrumbs/types.js';

	const trail: Crumb[] = [
		{ label: 'Projects', href: '#' },
		{ label: 'api-gateway', href: '#' },
		{ label: 'Environments', href: '#' },
		{ label: 'production', href: '#' },
		{ label: 'Deployments', href: '#' },
		{ label: 'dpl_8f3a2c' }
	];
</script>

<!-- The resizable box stands in for a sidebar being dragged, or a phone. -->
<div class="w-72 max-w-full resize-x overflow-hidden rounded-md border p-3">
	<Breadcrumbs items={trail} />
</div>
