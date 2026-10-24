<script lang="ts">
	/**
	 * @coral/lib/defaults
	 * @version 1.0.0
	 */
	import { untrack } from 'svelte';
	import type { Component } from 'svelte';
	import Self from './defaults-harness.test.svelte';
	import { setDefaults } from './defaults.js';
	import type { Defaults } from './defaults.js';

	/** One `setDefaults` call per layer, each a component nested in the one before it. */
	let {
		layers,
		component: Target,
		values = {}
	}: {
		layers: Defaults[];
		component: Component<Record<string, unknown>>;
		values?: Record<string, unknown>;
	} = $props();

	const [layer, ...rest] = untrack(() => layers);
	if (layer) setDefaults(layer);
</script>

{#if rest.length > 0}
	<Self layers={rest} component={Target} {values} />
{:else}
	<Target {...values} />
{/if}
