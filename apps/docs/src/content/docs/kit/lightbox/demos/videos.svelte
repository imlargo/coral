<script lang="ts">
	import Lightbox from '#lib/components/coral/kit/lightbox/lightbox.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import type { LightboxMedia } from '#lib/components/coral/kit/lightbox/types.js';

	const frame = (text: string) =>
		`data:image/svg+xml;utf8,${encodeURIComponent(
			`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200"><rect width="100%" height="100%" fill="hsl(220 30% 30%)"/><text x="50%" y="50%" font-family="sans-serif" font-size="56" text-anchor="middle" fill="white">${text}</text></svg>`
		)}`;

	// A portrait frame beside a landscape video: each keeps its own ratio inside the viewer.
	const media: LightboxMedia[] = [
		{ src: frame('Mobile sign-in'), alt: 'The sign-in screen on a phone' },
		{
			kind: 'video',
			src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
			poster: frame('Onboarding tour'),
			alt: 'The onboarding tour, recorded'
		}
	];

	let open = $state(false);
	let index = $state(0);
</script>

<div class="flex gap-2">
	{#each media as entry, at (entry.src)}
		<Button
			variant="outline"
			onclick={() => {
				index = at;
				open = true;
			}}
		>
			{entry.kind === 'video' ? 'Play the recording' : 'Open the screenshot'}
		</Button>
	{/each}
</div>

<Lightbox items={media} bind:open bind:index />
