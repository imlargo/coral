<script lang="ts">
	/**
	 * @coral/kit/shortcut
	 * @version 1.0.0
	 */
	import { onMount } from 'svelte';
	import { Kbd, KbdGroup } from '$lib/components/ui/kbd/index.js';
	import { detectPlatform, parse, tokens } from './keys.js';
	import { listen } from './listen.js';
	import type { Platform } from './keys.js';
	import type { ShortcutProps } from './types.js';

	let {
		keys,
		onpress,
		enabled = true,
		allowInFields,
		preventDefault = true,
		platform,
		key: keySnippet,
		ref = $bindable(null),
		...restProps
	}: ShortcutProps = $props();

	/**
	 * `other` until mounted, then the real platform. The server cannot know it, and rendering `⌘` on
	 * the server for a Windows reader - or `Ctrl` on the client over server markup that said `⌘` - is
	 * a hydration mismatch. Starting from what the server drew and correcting after mount costs one
	 * repaint on a Mac. Pass `platform` when the server does know, from a user-agent header.
	 */
	let detected = $state<Platform>('other');
	onMount(() => {
		detected = detectPlatform();
	});

	const resolved = $derived(platform ?? detected);
	const drawn = $derived(tokens(parse(keys, resolved), resolved));

	$effect(() => {
		if (!onpress || !enabled) return;
		return listen(keys, (event) => onpress(event), {
			platform: resolved,
			allowInFields,
			preventDefault
		});
	});
</script>

<KbdGroup bind:ref {...restProps}>
	{#each drawn as token, index (index)}
		{#if keySnippet}
			{@render keySnippet(token)}
		{:else}
			<!--
				The symbol is hidden and its name read instead: `⌘` announced by a screen reader is
				"place of interest sign", and `⇧` is "upwards white arrow".
			-->
			<Kbd>
				<span aria-hidden="true">{token.symbol}</span>
				<span class="sr-only">{token.name}</span>
			</Kbd>
		{/if}
	{/each}
</KbdGroup>
