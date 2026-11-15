<script lang="ts">
	import PaletteIcon from '@lucide/svelte/icons/palette';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import ThemeCustomizer from '#lib/features/theme/ThemeCustomizer.svelte';
	import { resolvePathname } from '#lib/utils/paths.js';
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" aria-label="Theme">
				<PaletteIcon />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content align="end" class="w-auto max-w-[calc(100vw-2rem)] gap-4 p-4">
		<Popover.Header>
			<Popover.Title>Theme</Popover.Title>
			<Popover.Description>
				Read the site in another shadcn theme. Coral follows it, because it has no colors of its
				own.
			</Popover.Description>
		</Popover.Header>
		<ThemeCustomizer />
		<a
			href={resolvePathname('/docs/theming')}
			class="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
		>
			Copy this theme's CSS
		</a>
	</Popover.Content>
</Popover.Root>
