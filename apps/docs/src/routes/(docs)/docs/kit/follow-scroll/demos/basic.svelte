<script lang="ts">
	import { onDestroy } from 'svelte';
	import FollowScroll from '$lib/components/coral/kit/follow-scroll/follow-scroll.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	const steps = [
		'Restoring cache',
		'Installing dependencies',
		'Running tests',
		'Type-checking',
		'Building',
		'Uploading artefacts'
	];

	let lines = $state<string[]>(['Queued', 'Starting runner']);
	let pinned = $state(true);
	let timer: ReturnType<typeof setInterval> | undefined;

	function start() {
		clearInterval(timer);
		lines = ['Queued', 'Starting runner'];
		let step = 0;
		timer = setInterval(() => {
			lines = [...lines, `${steps[step % steps.length]} (${lines.length})`];
			step++;
			if (lines.length > 60) clearInterval(timer);
		}, 220);
	}

	onDestroy(() => clearInterval(timer));
</script>

<div class="flex w-full max-w-xl flex-col gap-3">
	<div class="flex items-center gap-3">
		<Button variant="outline" size="sm" onclick={start}>Run the build</Button>
		<span class="text-sm text-muted-foreground">
			Following: {pinned ? 'yes' : 'no - scroll back down to resume'}
		</span>
	</div>

	<FollowScroll
		bind:pinned
		count={lines.length}
		class="h-56 rounded-lg border"
		aria-label="Build log"
	>
		<ol class="p-3 font-mono text-xs">
			{#each lines as line, index (index)}
				<li class="py-0.5 text-muted-foreground">{line}</li>
			{/each}
		</ol>
	</FollowScroll>
</div>
