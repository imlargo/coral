<script lang="ts">
	import Lightbox from '#lib/components/coral/kit/lightbox/lightbox.svelte';
	import RelativeTime from '#lib/components/coral/kit/relative-time/relative-time.svelte';
	import { Button } from '#lib/components/ui/button/index.js';

	type Screenshot = { id: string; url: string; title: string; takenBy: string; takenAt: Date };

	const frame = (text: string) =>
		`data:image/svg+xml;utf8,${encodeURIComponent(
			`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="hsl(150 30% 55%)"/><text x="50%" y="50%" font-family="sans-serif" font-size="64" text-anchor="middle" fill="white">${text}</text></svg>`
		)}`;

	const hours = (count: number) => new Date(Date.now() - count * 60 * 60 * 1000);

	const screenshots: Screenshot[] = [
		{
			id: 's1',
			url: frame('Build #418'),
			title: 'Build #418',
			takenBy: 'Priya Sharma',
			takenAt: hours(2)
		},
		{
			id: 's2',
			url: frame('Build #419'),
			title: 'Build #419',
			takenBy: 'Kenji Tanaka',
			takenAt: hours(1)
		}
	];

	let open = $state(false);
	let index = $state(0);
</script>

<Button variant="outline" onclick={() => (open = true)}>Review the build screenshots</Button>

<!-- `getMedia` maps the project's own type; `footer` gets the current item for a caption. -->
<Lightbox
	items={screenshots}
	getMedia={(shot) => ({ src: shot.url, alt: shot.title })}
	bind:open
	bind:index
	label="Build screenshots"
>
	{#snippet footer({ item })}
		<span class="truncate text-sm">
			{item.title} · {item.takenBy} · <RelativeTime date={item.takenAt} />
		</span>
	{/snippet}
</Lightbox>
