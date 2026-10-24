<script lang="ts">
	/**
	 * @coral/kit/lightbox
	 * @version 1.0.0
	 */
	import Lightbox from './lightbox.svelte';
	import type { LightboxMedia } from './types.js';

	let {
		items,
		open = $bindable(false),
		index = $bindable(0),
		onindexchange
	}: {
		items: LightboxMedia[];
		open?: boolean;
		index?: number;
		onindexchange?: (index: number) => void;
	} = $props();
</script>

<!-- A thumbnail grid, as a project would write it: each button opens the viewer on its own item. -->
<ul class="flex gap-2">
	{#each items as item, at (at)}
		<li>
			<button
				type="button"
				data-thumb
				onclick={() => {
					index = at;
					open = true;
				}}
			>
				<img src={item.src} alt={item.alt} width="24" height="24" />
			</button>
		</li>
	{/each}
</ul>

<Lightbox {items} bind:open bind:index {onindexchange} />
