<script lang="ts">
	import SendIcon from '@lucide/svelte/icons/send-horizontal';
	import Textarea from '$lib/components/coral/kit/textarea/textarea.svelte';
	import Shortcut from '$lib/components/coral/kit/shortcut/shortcut.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let draft = $state('');
	let sent = $state<string[]>([]);

	function send(text: string) {
		sent = [...sent, text.trim()];
		draft = '';
	}
</script>

<div class="flex w-96 flex-col gap-3">
	{#if sent.length > 0}
		<ul class="flex flex-col gap-1 text-sm">
			{#each sent as message, index (index)}
				<li class="rounded-md border px-2 py-1">{message}</li>
			{/each}
		</ul>
	{/if}

	<div class="flex items-end gap-2">
		<Textarea
			bind:value={draft}
			rows={1}
			maxRows={6}
			submitOn="enter"
			onsubmit={send}
			placeholder="Reply to the thread"
			aria-label="Reply to the thread"
		/>
		<Button size="icon" disabled={draft.trim() === ''} onclick={() => send(draft)}>
			<SendIcon />
			<span class="sr-only">Send</span>
		</Button>
	</div>

	<p class="flex items-center gap-2 text-sm text-muted-foreground">
		<Shortcut keys="enter" /> sends, <Shortcut keys="shift+enter" /> writes a new line.
	</p>
</div>
