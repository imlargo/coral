<script lang="ts">
	import CopyButton from '#lib/features/docs/components/CopyButton.svelte';
	import ThemeCustomizer from '#lib/features/theme/ThemeCustomizer.svelte';
	import { themeCss } from '#lib/features/theme/presets.js';
	import { getSiteTheme } from '#lib/features/theme/theme.svelte.js';

	const theme = getSiteTheme();
	const css = $derived(themeCss(theme.choice));
</script>

<!-- The same controls as the navbar's palette menu: changing them here re-themes the whole site,
     and the block beside them is what a project pastes to get the same result. -->
<div class="not-prose my-6 grid gap-6 rounded-lg border p-4 lg:grid-cols-2 lg:p-6">
	<ThemeCustomizer />
	<div class="relative min-w-0 overflow-hidden rounded-md border">
		<div class="flex items-center justify-between border-b bg-muted/30 px-3 py-1.5">
			<span class="font-mono text-xs text-muted-foreground">src/app.css</span>
			<CopyButton text={css} />
		</div>
		<pre
			class="max-h-96 overflow-auto p-4 font-mono text-xs/5"
			tabindex="0"
			aria-label="Theme CSS"><code>{css}</code></pre>
	</div>
</div>
