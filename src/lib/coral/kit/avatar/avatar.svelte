<script lang="ts">
	/**
	 * @coral/kit/avatar
	 * @version 1.0.0
	 */
	import { Avatar as Root, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar/index.js';
	import { initials } from './initials.js';
	import type { AvatarProps } from './types.js';

	let {
		src,
		alt,
		name,
		fallback,
		children,
		ref = $bindable(null),
		loadingStatus = $bindable('loading'),
		...restProps
	}: AvatarProps = $props();
</script>

<Root bind:ref bind:loadingStatus {...restProps}>
	{#if src}
		<AvatarImage {src} alt={alt ?? name ?? ''} />
	{/if}
	<AvatarFallback>
		{#if typeof fallback === 'function'}
			{@render fallback()}
		{:else}
			{fallback ?? initials(name)}
		{/if}
	</AvatarFallback>
	{@render children?.()}
</Root>
