<script lang="ts">
	import Breadcrumbs from '#lib/components/coral/kit/breadcrumbs/breadcrumbs.svelte';
	import type { Crumb } from '#lib/components/coral/kit/breadcrumbs/types.js';

	const trail: Crumb[] = [
		{ label: 'Projects', href: '#' },
		{ label: 'api-gateway', href: '#' },
		{ label: 'Deployments', href: '#' },
		{ label: 'dpl_8f3a2c' }
	];
</script>

<Breadcrumbs items={trail} class="w-full" />
