<script lang="ts">
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import { ACCENT_COLORS, BASE_COLORS } from '#lib/features/theme/colors.js';
	import {
		RADII,
		type AccentColor,
		type BaseColor,
		type Radius
	} from '#lib/features/theme/presets.js';
	import { getSiteTheme } from '#lib/features/theme/theme.svelte.js';

	const theme = getSiteTheme();

	/** The accent group needs a value for "none", and a toggle group's values are strings. */
	const NO_ACCENT = 'none';

	// The customizer can be on screen twice: in the navbar's popover and on the Theming page.
	const id = $props.id();
</script>

{#snippet swatch(color: string)}
	<!-- The one inline style on the site: the swatch is the data it shows. -->
	<span class="size-3 shrink-0 rounded-full border" style:background-color={color}></span>
{/snippet}

<div class="grid gap-4">
	<div class="grid gap-2">
		<p id="{id}-base" class="text-xs font-medium text-muted-foreground">Base color</p>
		<ToggleGroup.Root
			type="single"
			variant="outline"
			spacing={1}
			class="grid w-full grid-cols-2 sm:grid-cols-3"
			aria-labelledby="{id}-base"
			bind:value={() => theme.choice.base, (base) => base && theme.set({ base: base as BaseColor })}
		>
			{#each BASE_COLORS as preset (preset.name)}
				<ToggleGroup.Item value={preset.name} class="justify-start">
					{@render swatch(preset.light['muted-foreground'])}
					{preset.title}
				</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>
	</div>

	<div class="grid gap-2">
		<p id="{id}-accent" class="text-xs font-medium text-muted-foreground">Accent</p>
		<ToggleGroup.Root
			type="single"
			variant="outline"
			spacing={1}
			class="grid w-full grid-cols-2 sm:grid-cols-3"
			aria-labelledby="{id}-accent"
			bind:value={
				() => theme.choice.accent ?? NO_ACCENT,
				(accent) =>
					accent &&
					theme.set({ accent: accent === NO_ACCENT ? undefined : (accent as AccentColor) })
			}
		>
			<ToggleGroup.Item value={NO_ACCENT} class="justify-start">
				{@render swatch(
					BASE_COLORS.find((preset) => preset.name === theme.choice.base)?.light.primary ?? ''
				)}
				None
			</ToggleGroup.Item>
			{#each ACCENT_COLORS as preset (preset.name)}
				<ToggleGroup.Item value={preset.name} class="justify-start">
					{@render swatch(preset.light.primary)}
					{preset.title}
				</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>
	</div>

	<div class="grid gap-2">
		<p id="{id}-radius" class="text-xs font-medium text-muted-foreground">Radius</p>
		<ToggleGroup.Root
			type="single"
			variant="outline"
			spacing={1}
			class="grid w-full grid-cols-6"
			aria-labelledby="{id}-radius"
			bind:value={
				() => String(theme.choice.radius),
				(radius) => radius && theme.set({ radius: Number(radius) as Radius })
			}
		>
			{#each RADII as radius (radius)}
				<ToggleGroup.Item value={String(radius)} aria-label="{radius} rem"
					>{radius}</ToggleGroup.Item
				>
			{/each}
		</ToggleGroup.Root>
	</div>

	<Button
		variant="ghost"
		class="justify-self-start"
		disabled={theme.isDefault}
		onclick={() => theme.reset()}
	>
		<RotateCcwIcon />
		Reset to default
	</Button>
</div>
