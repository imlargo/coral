<script lang="ts">
	import SearchIcon from '@lucide/svelte/icons/search';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Kbd } from '$lib/components/ui/kbd/index.js';

	let open = $state(false);
</script>

<Button
	variant="outline"
	class="w-56 justify-start gap-2 text-muted-foreground"
	onclick={() => (open = true)}
>
	<SearchIcon />
	<span class="flex-1 text-start">Search</span>
	<Kbd>⌘K</Kbd>
</Button>

<Command.Dialog bind:open title="Search" description="Search the documentation">
	<Command.Input placeholder="Search..." />
	<Command.List>
		<Command.Empty>Search isn't wired up yet.</Command.Empty>
	</Command.List>
</Command.Dialog>
