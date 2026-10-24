<script lang="ts">
	import Lightbox from '#lib/components/coral/kit/lightbox/lightbox.svelte';
	import type { LightboxMedia } from '#lib/components/coral/kit/lightbox/types.js';

	// Placeholder frames; a product would have its screenshots here.
	const frame = (hue: number, text: string) =>
		`data:image/svg+xml;utf8,${encodeURIComponent(
			`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="hsl(${hue} 40% 70%)"/><text x="50%" y="50%" font-family="sans-serif" font-size="64" text-anchor="middle" fill="white">${text}</text></svg>`
		)}`;

	const shots: LightboxMedia[] = [
		{ src: frame(200, 'Dashboard'), alt: 'The dashboard, light theme' },
		{ src: frame(260, 'Deployments'), alt: 'The deployments list' },
		{ src: frame(330, 'Settings'), alt: 'The project settings page' },
		{ src: frame(20, 'Billing'), alt: 'The billing page' }
	];

	let open = $state(false);
	let index = $state(0);
</script>

<ul class="grid grid-cols-4 gap-2">
	{#each shots as shot, at (shot.src)}
		<li>
			<button
				type="button"
				class="block w-full overflow-hidden rounded-md border focus-visible:outline-2 focus-visible:outline-ring"
				onclick={() => {
					index = at;
					open = true;
				}}
			>
				<img src={shot.src} alt={shot.alt} class="aspect-[3/2] w-full object-cover" />
			</button>
		</li>
	{/each}
</ul>

<Lightbox items={shots} bind:open bind:index />
