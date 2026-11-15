<script lang="ts">
	import PaletteIcon from '@lucide/svelte/icons/palette';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import ThemeCustomizer from '#lib/features/theme/ThemeCustomizer.svelte';
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
	</Popover.Content>
</Popover.Root>
