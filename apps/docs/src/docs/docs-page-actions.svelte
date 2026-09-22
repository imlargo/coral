<script lang="ts">
	/**
	 * "View as Markdown" opens the page's raw source in a new tab - what an LLM or a reader pasting
	 * into one wants, not the rendered HTML. "Copy page" puts the same source on the clipboard.
	 * Both read off the build-time docs index, keyed by the current route, rather than the DOM.
	 */
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	import { pages } from 'virtual:coral-docs-index';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	const raw = $derived(pages.find((entry) => entry.href === page.url.pathname)?.raw);

	async function copyRaw() {
		if (!raw) return;
		await navigator.clipboard.writeText(raw);
		// The dropdown closes on select, so inline "copied" feedback would never be visible.
		toast.success('Copied to clipboard');
	}

	function viewAsMarkdown() {
		if (!raw) return;
		const url = URL.createObjectURL(new Blob([raw], { type: 'text/markdown' }));
		window.open(url, '_blank');
	}
</script>

{#if raw}
	<ButtonGroup.Root>
		<Button variant="outline" size="sm" onclick={viewAsMarkdown}>
			<FileTextIcon />
			View as Markdown
		</Button>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline" size="sm" aria-label="More options">
						<ChevronDownIcon />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Item onSelect={copyRaw}>
					<CopyIcon />
					Copy page
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</ButtonGroup.Root>
{/if}
