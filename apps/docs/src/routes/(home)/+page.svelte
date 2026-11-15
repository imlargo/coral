<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { page } from '$app/state';
	import { itemUrl } from 'coral/registry.config.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { config } from '#lib/config/app.js';
	import CommandLine from '#lib/features/docs/components/CommandLine.svelte';
	import Showcase from '#lib/features/home/Showcase.svelte';
	import ThemeStrip from '#lib/features/home/ThemeStrip.svelte';
	import { resolvePathname } from '#lib/utils/paths.js';

	/** The prose column every section but the showcase keeps. */
	const column = 'mx-auto w-full max-w-screen-xl px-4 sm:px-6';

	const latest = $derived<string | undefined>(page.data.release?.latest);
	const dateFormat = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC'
	});

	const resolves = [
		{
			title: 'Keyboard first',
			text: 'Every component is walked with the keys, and each page lists them in a table. Focus goes back where it came from after a pick, a close or a removed row.',
			href: '/docs/accessibility'
		},
		{
			title: 'Search that folds accents',
			text: 'Typing sao finds São Paulo and acai finds Açaí, in the combobox, the command palette and the country select.',
			href: '/docs/kit/combobox'
		},
		{
			title: 'Handlers that can fail',
			text: 'Return false or throw and the dialog stays open, the field keeps what was typed, the step stays put. A second click while it waits does nothing.',
			href: '/docs/conventions#what-every-component-agrees-on'
		},
		{
			title: 'States inside the list',
			text: 'Loading and empty are rows inside the list, announced to screen readers, so the arrow keys always have somewhere to go.',
			href: '/docs/accessibility#what-every-component-agrees-on'
		},
		{
			title: 'Your theme, nothing else',
			text: 'No colors, radii or type sizes of its own. Coral is drawn by shadcn primitives and your tokens, so it already looks like your app.',
			href: '/docs/theming'
		},
		{
			title: 'Source you own',
			text: 'Installed with the shadcn-svelte CLI into your project. No package to update behind your back; each component has its own version.',
			href: '/docs/ownership'
		}
	];

	const steps = [
		{
			title: 'Start from shadcn-svelte',
			text: 'Any SvelteKit or Svelte + Vite project with a components.json.',
			command: 'pnpm dlx shadcn-svelte@latest init'
		},
		{
			title: 'Add a component',
			text: 'Its primitives and shared modules come with it, imports rewritten to your aliases.',
			command: `pnpm dlx shadcn-svelte@latest add ${itemUrl('kit-combobox')}`
		},
		{
			title: 'Make it yours',
			text: 'Read it, change it, commit it. Update it when you choose, with --overwrite.',
			command: `import Combobox from '$lib/components/coral/kit/combobox/combobox.svelte';`
		}
	];
</script>

<svelte:head>
	<title>{config.branding.seo.title}</title>
	<meta name="description" content={config.branding.seo.description} />
</svelte:head>

<div class="grid gap-20 pt-16 pb-24 md:gap-28 md:pt-24">
	<section aria-labelledby="hero-title" class="{column} grid gap-6">
		<div class="grid max-w-3xl gap-6">
			{#if latest}
				<Badge href={resolvePathname('/docs/changelog')} variant="outline">
					What's new
					<span class="text-muted-foreground">
						<time datetime={latest}>{dateFormat.format(new Date(`${latest}T00:00:00Z`))}</time>
					</span>
					<ArrowRightIcon />
				</Badge>
			{/if}
			<h1 id="hero-title" class="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
				The components you were going to build on shadcn-svelte anyway.
			</h1>
			<p class="max-w-2xl text-lg text-pretty text-muted-foreground">
				A combobox that folds accents, a confirm dialog that survives a failed request, a date range
				that waits for its end. Installed as source with the shadcn-svelte CLI, and styled by your
				theme.
			</p>
			<div class="flex flex-wrap gap-3">
				<Button href={resolvePathname('/docs/installation')}>Get started</Button>
				<Button href={resolvePathname('/docs/components')} variant="outline">
					Browse components
				</Button>
			</div>
			<CommandLine
				command="pnpm dlx shadcn-svelte@latest add {itemUrl('kit-combobox')}"
				class="max-w-2xl overflow-hidden rounded-lg border"
			/>
		</div>
	</section>

	<!-- Wider than the prose column on purpose: the collage is the page's main exhibit, and on a
	     wide screen it takes the room for more columns rather than leaving the margins empty. -->
	<section aria-labelledby="showcase-title" class="grid gap-6">
		<div class="{column} flex flex-wrap items-end justify-between gap-4">
			<div class="grid max-w-2xl gap-2">
				<h2 id="showcase-title" class="text-2xl font-semibold tracking-tight">Try it here</h2>
				<p class="text-muted-foreground">
					Every card is a real Coral component, the file the registry installs. Each says what to
					try, and links to its page.
				</p>
			</div>
			<ThemeStrip />
		</div>
		<div class="px-2 sm:px-4">
			<Showcase />
		</div>
	</section>

	<section aria-labelledby="resolves-title" class="{column} grid gap-8">
		<div class="grid max-w-2xl gap-2">
			<h2 id="resolves-title" class="text-2xl font-semibold tracking-tight">What Coral resolves</h2>
			<p class="text-muted-foreground">
				The part that is easy to get wrong and tedious to get right, written once and tested in a
				real browser.
			</p>
		</div>
		<ul class="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each resolves as item (item.title)}
				<li class="grid content-start gap-2">
					<h3 class="font-medium">
						<a
							href={resolvePathname(item.href)}
							class="underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
						>
							{item.title}
						</a>
					</h3>
					<p class="text-sm text-muted-foreground">{item.text}</p>
				</li>
			{/each}
		</ul>
	</section>

	<section aria-labelledby="examples-title" class={column}>
		<Card.Root>
			<Card.Header>
				<Card.Title id="examples-title" class="text-xl">One product, several screens</Card.Title>
				<Card.Description>
					Project settings, a team page and a live deployment, each built from several Coral
					components wired together.
				</Card.Description>
			</Card.Header>
			<Card.Footer>
				<Button href={resolvePathname('/examples')} variant="outline">
					See the examples
					<ArrowRightIcon />
				</Button>
			</Card.Footer>
		</Card.Root>
	</section>

	<section aria-labelledby="start-title" class="{column} grid gap-8">
		<h2 id="start-title" class="text-2xl font-semibold tracking-tight">Start with one command</h2>
		<ol class="grid gap-6 lg:grid-cols-3">
			{#each steps as step, index (step.title)}
				<li class="grid min-w-0 content-start gap-3">
					<p class="text-sm text-muted-foreground tabular-nums">Step {index + 1}</p>
					<h3 class="font-medium">{step.title}</h3>
					<p class="text-sm text-muted-foreground">{step.text}</p>
					<CommandLine command={step.command} class="overflow-hidden rounded-lg border" />
				</li>
			{/each}
		</ol>
	</section>
</div>
