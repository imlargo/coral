<script lang="ts">
	import CopyIcon from '@lucide/svelte/icons/copy';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	let { raw }: { raw: string } = $props();

	async function copyRaw() {
		await navigator.clipboard.writeText(raw);
		// The dropdown closes on select, so inline "copied" feedback would never be visible.
		toast.success('Copied to clipboard');
	}

	function viewAsMarkdown() {
		const url = URL.createObjectURL(new Blob([raw], { type: 'text/markdown' }));
		window.open(url, '_blank');
	}
</script>

<ButtonGroup.Root>
	<Button variant="outline" onclick={viewAsMarkdown}>
		<FileTextIcon />
		View as Markdown
	</Button>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="outline" size="icon" aria-label="More options">
					<ChevronDownIcon />
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end">
			<DropdownMenu.Item onSelect={copyRaw}>
				<CopyIcon />
				Copy raw
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</ButtonGroup.Root>
