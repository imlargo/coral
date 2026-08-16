<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { toggleMode } from 'mode-watcher';
	import { resolve } from '$app/paths';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';

	const isNot = [
		[
			'A design system',
			'Appearance comes from the project’s shadcn theme. Coral never defines it.'
		],
		[
			'A fork of shadcn',
			'The primitives stay CLI-managed and untouched. Coral composes around them.'
		],
		[
			'A primitives library',
			'It has no primitives of its own — it assembles the ones already there.'
		],
		['An npm package', 'One self-contained folder, copied into the project and owned by it.']
	];

	const test = [
		'Has the pattern been written twice already, in real projects?',
		'Does it define appearance? Then it is the theme’s job, not Coral’s.',
		'Does it know the client’s domain? Then it belongs in the project’s features/.',
		'Does the API match the component’s nature — flat only with a canonical case?',
		'Does the rare case force abandoning Coral? Then expose the pieces.'
	];
</script>

<svelte:head>
	<title>Coral — Kora’s component library</title>
	<meta
		name="description"
		content="An ergonomics layer on top of shadcn-svelte. One folder, copied into the project."
	/>
</svelte:head>

<header class="flex h-14 items-center gap-2 border-b px-6">
	<a href={resolve('/')} class="flex items-center gap-2 font-semibold">
		<span aria-hidden="true">🪸</span>
		Coral
	</a>
	<span class="ml-auto text-xs text-muted-foreground">Kora</span>
	<Button variant="ghost" size="icon" onclick={toggleMode} aria-label="Toggle theme">
		<SunIcon class="dark:hidden" />
		<MoonIcon class="hidden dark:block" />
	</Button>
</header>

<main id="main-content" class="mx-auto w-full max-w-3xl px-6 py-20">
	<Badge variant="secondary">Internal to Kora</Badge>

	<h1 class="mt-6 text-4xl font-semibold tracking-tight text-balance">
		The repetitive code, already resolved.
	</h1>

	<p class="mt-4 text-lg text-pretty text-muted-foreground">
		Coral is an ergonomics layer on top of shadcn-svelte. Its only job is to remove the code
		rewritten in every project — the combobox with search, the data table with sorting and
		pagination, the form with validation, the confirm dialog — and hand it over already solved,
		without closing the door on taking it apart.
	</p>

	<div class="mt-8 flex flex-wrap gap-3">
		<a href={resolve('/docs')} class={buttonVariants()}>
			Read the docs
			<ArrowRightIcon />
		</a>
		<a href={resolve('/docs/kit/avatar')} class={buttonVariants({ variant: 'outline' })}>
			Browse the kit
		</a>
	</div>

	<section class="mt-20">
		<h2 class="text-sm font-medium tracking-wide text-muted-foreground uppercase">
			What Coral is not
		</h2>
		<dl class="mt-6 grid gap-6 sm:grid-cols-2">
			{#each isNot as [term, detail] (term)}
				<div class="flex flex-col gap-1">
					<dt class="font-medium">{term}</dt>
					<dd class="text-sm text-muted-foreground">{detail}</dd>
				</div>
			{/each}
		</dl>
	</section>

	<section class="mt-16">
		<h2 class="text-sm font-medium tracking-wide text-muted-foreground uppercase">What gets in</h2>
		<p class="mt-4 text-sm text-muted-foreground">
			Nothing enters on intuition or just in case. A mediocre component in Coral contaminates every
			project it is copied into, so each candidate answers five questions first.
		</p>
		<ol class="mt-6 flex flex-col gap-3 text-sm">
			{#each test as question, i (question)}
				<li class="flex gap-3">
					<span class="text-muted-foreground tabular-nums">{i + 1}.</span>
					<span>{question}</span>
				</li>
			{/each}
		</ol>
	</section>
</main>
