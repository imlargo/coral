<script lang="ts">
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import { ACCENT_COLORS, BASE_COLORS } from '#lib/features/theme/colors.js';
	import type { AccentColor } from '#lib/features/theme/presets.js';
	import { getSiteTheme } from '#lib/features/theme/theme.svelte.js';

	const theme = getSiteTheme();
	const NO_ACCENT = 'none';
	const id = $props.id();

	const swatches = $derived([
		{
			value: NO_ACCENT,
			title: 'No accent',
			color: BASE_COLORS.find((preset) => preset.name === theme.choice.base)?.light.primary ?? ''
		},
		...ACCENT_COLORS.map((preset) => ({
			value: preset.name,
			title: preset.title,
			color: preset.light.primary
		}))
	]);
</script>

<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
	<p id="{id}-label" class="text-sm text-muted-foreground">Accent</p>
	<ToggleGroup.Root
		type="single"
		variant="outline"
		spacing={1}
		class="flex-wrap"
		aria-labelledby="{id}-label"
		bind:value={
			() => theme.choice.accent ?? NO_ACCENT,
			(accent) =>
				accent && theme.set({ accent: accent === NO_ACCENT ? undefined : (accent as AccentColor) })
		}
	>
		{#each swatches as swatch (swatch.value)}
			<ToggleGroup.Item value={swatch.value} aria-label={swatch.title} title={swatch.title}>
				<!-- The swatch is the data it shows, so its color is the one inline style here. -->
				<span class="size-4 rounded-full border" style:background-color={swatch.color}></span>
			</ToggleGroup.Item>
		{/each}
	</ToggleGroup.Root>
</div>
