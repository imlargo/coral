<script lang="ts">
	import { onDestroy } from 'svelte';
	import FollowScroll from '#lib/components/coral/kit/follow-scroll/follow-scroll.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import ShowcaseCard from './ShowcaseCard.svelte';

	const SCRIPT = [
		'Preview build for branch fix/webhook-retries',
		'Cloning github.com/example/web-app (commit: a41d07b)',
		'Restored build cache',
		'Running "pnpm install --frozen-lockfile"',
		'Packages: +612',
		'Running "pnpm test"',
		'✓ src/lib/webhooks/retry.test.ts (6 tests)',
		'✓ src/lib/webhooks/signature.test.ts (4 tests)',
		'✓ src/lib/deployments/queue.test.ts (9 tests)',
		'✓ src/lib/auth/session.test.ts (5 tests)',
		'✓ src/routes/api/keys/keys.test.ts (7 tests)',
		'Test Files  5 passed (5)',
		'Tests  31 passed (31)',
		'Running "pnpm build"',
		'vite building for production...',
		'✓ 1872 modules transformed.',
		'rendering chunks...',
		'✓ built in 11.62s',
		'Uploading build outputs',
		'Preview ready'
	];

	let lines = $state<string[]>([]);
	let pinned = $state(true);
	let running = $state(false);
	let timer: ReturnType<typeof setInterval> | undefined;

	function start() {
		clearInterval(timer);
		lines = [];
		pinned = true;
		running = true;
		timer = setInterval(() => {
			lines = [...lines, SCRIPT[lines.length]];
			if (lines.length === SCRIPT.length) {
				clearInterval(timer);
				running = false;
			}
		}, 400);
	}

	onDestroy(() => clearInterval(timer));
</script>

<ShowcaseCard
	title="Build log"
	description="A preview build of web-app, streamed as it runs."
	hint="Start the build and scroll up while it runs: the log stops following. Scroll back to the end, or use the jump button, and it follows again."
	components={['kit/follow-scroll']}
>
	<div class="flex flex-wrap items-center justify-between gap-2">
		<p class="min-w-0 text-sm text-muted-foreground" role="status">
			{#if running}
				{pinned ? 'Following new lines.' : 'Scrolled back.'}
			{:else}
				{lines.length ? 'Done.' : 'Not started.'}
			{/if}
		</p>
		<Button variant="outline" size="sm" disabled={running} onclick={start}>
			{lines.length ? 'Restart build' : 'Start build'}
		</Button>
	</div>

	<FollowScroll
		bind:pinned
		count={lines.length}
		class="h-48 rounded-md border"
		aria-label="Build log"
	>
		<ol class="p-3 font-mono text-xs">
			{#each lines as line, index (index)}
				<li class="py-0.5 break-all text-muted-foreground">{line}</li>
			{:else}
				<li class="text-muted-foreground">Start the build to stream its log here.</li>
			{/each}
		</ol>
	</FollowScroll>
</ShowcaseCard>
