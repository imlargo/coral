<script lang="ts">
	import Textarea from '#lib/components/coral/kit/textarea/textarea.svelte';
	import FollowScroll from '#lib/components/coral/kit/follow-scroll/follow-scroll.svelte';
	import Avatar from '#lib/components/coral/kit/avatar/avatar.svelte';

	type Message = { id: number; from: string; body: string };

	let messages = $state<Message[]>([
		{ id: 1, from: 'Amara Diallo', body: 'The staging deploy is green again.' },
		{ id: 2, from: 'Wei Zhang', body: 'Nice. Was it the lockfile?' },
		{ id: 3, from: 'Amara Diallo', body: 'Yes - regenerated it and the build step passed.' },
		{ id: 4, from: 'Priya Sharma', body: 'I will roll it to production after the review.' },
		{ id: 5, from: 'Kenji Tanaka', body: 'Adding the changelog entry now.' }
	]);

	let draft = $state('');

	function send(text: string) {
		messages = [...messages, { id: messages.length + 1, from: 'You', body: text.trim() }];
		draft = '';
	}
</script>

<div class="flex w-full max-w-md flex-col gap-2">
	<FollowScroll count={messages.length} class="h-52 rounded-lg border" aria-label="Thread">
		<ul class="flex flex-col gap-3 p-3">
			{#each messages as message (message.id)}
				<li class="flex items-start gap-2">
					<Avatar name={message.from} size="sm" />
					<div class="min-w-0">
						<p class="text-xs text-muted-foreground">{message.from}</p>
						<p class="text-sm">{message.body}</p>
					</div>
				</li>
			{/each}
		</ul>
	</FollowScroll>

	<Textarea
		bind:value={draft}
		rows={1}
		maxRows={4}
		submitOn="enter"
		onsubmit={send}
		placeholder="Message the thread"
		aria-label="Message the thread"
	/>
</div>
