<script lang="ts">
	/**
	 * @coral/lib/keep-focus
	 * @version 1.0.0
	 */
	import { keepFocus } from './keep-focus.js';

	let { items }: { items: { id: string; done: boolean }[] } = $props();
</script>

<div {@attach keepFocus('[data-row]', (root) => root.querySelector('input'))}>
	<input aria-label="Field" />
	{#if items.length > 0}
		<ul>
			{#each items as item (item.id)}
				<li data-row>
					{#if item.done}
						<button type="button">Remove {item.id}</button>
					{:else}
						<button type="button">Cancel {item.id}</button>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
<button type="button">Outside</button>
