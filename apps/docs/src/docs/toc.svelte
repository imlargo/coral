<script lang="ts">
	import { toc } from './toc.svelte.js';
	import { cn } from '$lib/utils.js';

	let active = $state('');

	$effect(() => {
		const targets = toc.headings
			.map(({ id }) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null);

		if (targets.length === 0) return;

		// Tracks the last heading to cross the top band of the viewport, so the highlight follows
		// the section being read rather than jumping to whatever is momentarily on screen.
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) active = entry.target.id;
				}
			},
			{ rootMargin: '-80px 0px -70% 0px' }
		);

		for (const target of targets) observer.observe(target);
		return () => observer.disconnect();
	});
</script>

{#if toc.headings.length > 1}
	<nav aria-label="On this page" class="flex flex-col gap-3 text-sm">
		<span class="text-[0.7rem] font-medium tracking-wider text-muted-foreground uppercase">
			On this page
		</span>
		<ul class="flex flex-col border-l">
			{#each toc.headings as heading (heading.id)}
				<li>
					<a
						href="#{heading.id}"
						aria-current={active === heading.id ? 'location' : undefined}
						class={cn(
							'-ml-px block border-l-2 border-transparent py-1 pl-3 text-[0.8rem] leading-snug text-muted-foreground transition-colors hover:text-foreground',
							heading.level === 3 && 'pl-6',
							active === heading.id && 'border-primary font-medium text-foreground'
						)}
					>
						{heading.text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
