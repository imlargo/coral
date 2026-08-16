<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { toggleMode } from 'mode-watcher';
	import { resolve } from '$app/paths';
	import Avatar from '$lib/coral/kit/avatar/avatar.svelte';
	import { AvatarGroup, AvatarGroupCount } from '$lib/components/ui/avatar/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';

	const team = ['Ana Restrepo', 'Juan Herrera', 'María del Carmen García', 'Diego Marín'];

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
			'It has no primitives of its own - it assembles the ones already there.'
		],
		['An npm package', 'One self-contained folder, copied into the project and owned by it.']
	];

	const test = [
		['Written twice already?', 'In real, paid projects. Otherwise it waits.'],
		['Does it define appearance?', 'Then it is the theme’s job, not Coral’s.'],
		['Does it know the client’s domain?', 'Then it belongs in the project’s features/.'],
		['Does the API match its nature?', 'Flat props only where a canonical case exists.'],
		['Does the rare case force a rewrite?', 'Then the pieces are not exposed enough.']
	];
</script>

<svelte:head>
	<title>Coral - Kora’s component library</title>
	<meta
		name="description"
		content="An ergonomics layer on top of shadcn-svelte. One folder, copied into the project."
	/>
</svelte:head>

<header class="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-sm">
	<div class="mx-auto flex h-14 max-w-4xl items-center gap-2 px-6">
		<a href={resolve('/')} class="flex items-center gap-2 font-semibold tracking-tight">
			<span aria-hidden="true">🪸</span>
			Coral
		</a>
		<nav class="ml-6 hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
			<a href={resolve('/docs')} class="transition-colors hover:text-foreground">Docs</a>
			<a href={resolve('/docs/installation')} class="transition-colors hover:text-foreground">
				Installation
			</a>
			<a href={resolve('/docs/kit/avatar')} class="transition-colors hover:text-foreground">Kit</a>
		</nav>
		<div class="ml-auto flex items-center gap-1">
			<span class="hidden text-xs text-muted-foreground md:inline">Kora</span>
			<Button variant="ghost" size="icon" onclick={toggleMode} aria-label="Toggle theme">
				<SunIcon class="dark:hidden" />
				<MoonIcon class="hidden dark:block" />
			</Button>
		</div>
	</div>
</header>

<main id="main-content" class="mx-auto w-full max-w-4xl px-6">
	<section class="py-16 sm:py-24">
		<Badge variant="secondary">Internal to Kora</Badge>

		<h1 class="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
			The repetitive code, already resolved.
		</h1>

		<p class="mt-5 max-w-2xl text-lg text-pretty text-muted-foreground">
			Coral is an ergonomics layer on top of shadcn-svelte. Its only job is to remove the code
			rewritten in every project - the combobox with search, the data table with sorting and
			pagination, the form with validation, the confirm dialog - and hand it over already solved,
			without closing the door on taking it apart.
		</p>

		<div class="mt-8 flex flex-wrap items-center gap-3">
			<a href={resolve('/docs')} class={buttonVariants({ size: 'lg' })}>
				Read the docs
				<ArrowRightIcon />
			</a>
			<a
				href={resolve('/docs/kit/avatar')}
				class={buttonVariants({ variant: 'outline', size: 'lg' })}
			>
				Browse the kit
			</a>
		</div>
	</section>

	<!-- Coral rendering itself. The initials below are derived by `kit/avatar`, not typed in. -->
	<section class="rounded-xl border bg-muted/20 p-6 sm:p-8">
		<div class="flex flex-wrap items-center justify-between gap-8">
			<div class="flex items-center gap-6">
				<Avatar src="https://github.com/shadcn.png" name="Shad CN" size="lg" />
				<AvatarGroup>
					{#each team as name (name)}
						<Avatar {name} size="lg" />
					{/each}
					<AvatarGroupCount>+3</AvatarGroupCount>
				</AvatarGroup>
			</div>
			<p class="max-w-xs text-sm leading-relaxed text-muted-foreground">
				One line each, with initials derived from the full name - <code
					class="rounded bg-muted px-1 font-mono text-[0.85em] text-foreground">MG</code
				>, not
				<code class="rounded bg-muted px-1 font-mono text-[0.85em] text-foreground">MA</code>.
				<a
					href={resolve('/docs/kit/avatar')}
					class="font-medium text-foreground underline decoration-muted-foreground/40 underline-offset-4 transition-colors hover:decoration-foreground"
				>
					See the component
				</a>
			</p>
		</div>
	</section>

	<section class="py-16 sm:py-20">
		<h2 class="text-[0.7rem] font-medium tracking-wider text-muted-foreground uppercase">
			What Coral is not
		</h2>
		<dl class="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
			{#each isNot as [term, detail] (term)}
				<div class="flex flex-col gap-1">
					<dt class="font-medium">{term}</dt>
					<dd class="text-sm leading-relaxed text-muted-foreground">{detail}</dd>
				</div>
			{/each}
		</dl>
	</section>

	<section class="border-t py-16 sm:py-20">
		<h2 class="text-[0.7rem] font-medium tracking-wider text-muted-foreground uppercase">
			What gets in
		</h2>
		<p class="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
			Nothing enters on intuition or just in case. A mediocre component in Coral contaminates every
			project it is copied into, so each candidate answers five questions first.
		</p>
		<ol class="mt-8 flex flex-col divide-y border-y">
			{#each test as [question, answer], i (question)}
				<li class="flex items-baseline gap-4 py-3.5">
					<span class="w-4 shrink-0 text-sm text-muted-foreground/60 tabular-nums">{i + 1}</span>
					<span class="flex-1 text-sm font-medium">{question}</span>
					<span class="hidden max-w-sm flex-1 text-sm text-muted-foreground sm:block">
						{answer}
					</span>
				</li>
			{/each}
		</ol>
	</section>
</main>

<footer class="border-t">
	<div
		class="mx-auto flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-8 text-sm text-muted-foreground"
	>
		<span>Built by Kora, Medellín.</span>
		<a href={resolve('/docs')} class="transition-colors hover:text-foreground">Docs</a>
		<a href={resolve('/docs/conventions')} class="transition-colors hover:text-foreground">
			Conventions
		</a>
	</div>
</footer>
