<script lang="ts">
	import { toc } from './toc.svelte.js';
	import { cn } from '$lib/utils.js';

	let active = $state('');

	$effect(() => {
		const targets = toc.headings
			.map(({ id }) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null);

		if (targets.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries.filter((entry) => entry.isIntersecting);
				if (visible.length > 0) active = visible[0].target.id;
			},
			{ rootMargin: '0px 0px -70% 0px' }
		);

		for (const target of targets) observer.observe(target);
		return () => observer.disconnect();
	});
</script>

{#if toc.headings.length > 1}
	<nav aria-label="On this page" class="flex flex-col gap-2 text-sm">
		<span class="font-medium">On this page</span>
		<ul class="flex flex-col gap-2 border-l">
			{#each toc.headings as heading (heading.id)}
				<li>
					<a
						href="#{heading.id}"
						class={cn(
							'-ml-px block border-l border-transparent pl-3 text-muted-foreground transition-colors hover:text-foreground',
							heading.level === 3 && 'pl-6',
							active === heading.id && 'border-foreground text-foreground'
						)}
					>
						{heading.text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
