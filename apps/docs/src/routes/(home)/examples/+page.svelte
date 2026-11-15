<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '#lib/components/ui/tabs/index.js';
	import { config } from '#lib/config/app.js';
	import { SCREENS } from '#lib/features/home/screens/screens.js';
	import ThemeStrip from '#lib/features/home/ThemeStrip.svelte';
	import { resolvePathname } from '#lib/utils/paths.js';

	let current = $state(SCREENS[0].id);
</script>

<svelte:head>
	<title>Examples - {config.branding.name}</title>
	<meta
		name="description"
		content="Screens from one deploy product, each built from several Coral components working together."
	/>
</svelte:head>

<div class="mx-auto grid max-w-screen-xl gap-8 px-4 pt-12 pb-24 sm:px-6 md:pt-16">
	<header class="grid max-w-3xl gap-3">
		<h1 class="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Examples</h1>
		<p class="text-lg text-pretty text-muted-foreground">
			Screens from one deploy product, built only from shadcn-svelte primitives and Coral
			components. Everything works: type, pick, save, and watch the handlers fail and recover.
		</p>
	</header>

	<Tabs bind:value={current} class="gap-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<TabsList aria-label="Screens">
				{#each SCREENS as screen (screen.id)}
					<TabsTrigger value={screen.id}>{screen.title}</TabsTrigger>
				{/each}
			</TabsList>
			<ThemeStrip />
		</div>

		{#each SCREENS as screen (screen.id)}
			{@const Screen = screen.component}
			<TabsContent value={screen.id} class="grid gap-6">
				<div class="grid gap-3">
					<p class="max-w-3xl text-sm text-muted-foreground">{screen.description}</p>
					<div class="flex flex-wrap items-center gap-1.5">
						<span class="text-xs text-muted-foreground">Built from</span>
						{#each screen.components as name (name)}
							<Badge href={resolvePathname(`/docs/${name}`)} variant="secondary" class="font-mono">
								{name.replace(/^kit\//, '')}
							</Badge>
						{/each}
					</div>
				</div>
				<Screen />
			</TabsContent>
		{/each}
	</Tabs>
</div>
