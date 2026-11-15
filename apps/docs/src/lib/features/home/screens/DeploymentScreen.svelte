<script lang="ts">
	import { onMount } from 'svelte';
	import GitBranchIcon from '@lucide/svelte/icons/git-branch';
	import GitCommitIcon from '@lucide/svelte/icons/git-commit-horizontal';
	import Avatar from '#lib/components/coral/kit/avatar/avatar.svelte';
	import CopyButton from '#lib/components/coral/kit/copy-button/copy-button.svelte';
	import FollowScroll from '#lib/components/coral/kit/follow-scroll/follow-scroll.svelte';
	import RelativeTime from '#lib/components/coral/kit/relative-time/relative-time.svelte';
	import Timeline from '#lib/components/coral/kit/timeline/timeline.svelte';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { PROJECT } from '#lib/features/home/world.js';

	type Status = 'Queued' | 'Building' | 'Ready';
	type Activity = { id: number; at: Date; who?: string; what: string };

	const DEPLOYMENT_URL = 'https://web-app-7hq2xk.example.com';
	const AUTHOR = 'Wei Zhang';

	// [line, the event it marks on the timeline, if any]
	const SCRIPT: [string, string?][] = [
		['Cloning github.com/example/web-app (branch: main, commit: 3f9c2e1)', 'Build started'],
		['Restored build cache from the previous deployment'],
		['Running "pnpm install --frozen-lockfile"'],
		['Lockfile is up to date, resolution step is skipped'],
		['Packages: +612'],
		['Done in 8.4s'],
		['Running "pnpm build"'],
		['vite v7.1.3 building for production...'],
		['transforming (1204) src/routes/+layout.svelte'],
		['✓ 1872 modules transformed.'],
		['rendering chunks...'],
		['computing gzip size...'],
		['.svelte-kit/output/client/_app/immutable/entry/app.js   38.21 kB'],
		['.svelte-kit/output/server/index.js                      142.08 kB'],
		['✓ built in 11.62s', 'Build finished'],
		['Prerendering 24 pages'],
		['Uploading build outputs'],
		['Deploying to iad1'],
		['Assigning domains'],
		[`Ready at ${DEPLOYMENT_URL}`, 'Promoted to Production']
	];

	let status = $state<Status>('Queued');
	let started = $state<Date>();
	let lines = $state<string[]>([]);
	let events = $state<Activity[]>([]);
	let pinned = $state(true);
	let timer: ReturnType<typeof setInterval> | undefined;

	function run() {
		clearInterval(timer);
		const at = new Date();
		started = at;
		status = 'Building';
		lines = [];
		pinned = true;
		events = [{ id: 0, at, who: AUTHOR, what: 'pushed to main and queued this deployment' }];
		let step = 0;
		timer = setInterval(() => {
			const [line, event] = SCRIPT[step];
			lines = [...lines, line];
			if (event) events = [{ id: step + 1, at: new Date(), what: event }, ...events];
			step++;
			if (step === SCRIPT.length) {
				clearInterval(timer);
				status = 'Ready';
			}
		}, 450);
	}

	// Times come from the reader's clock, so nothing time-dependent is rendered on the server.
	onMount(() => {
		run();
		return () => clearInterval(timer);
	});
</script>

<div class="flex min-w-0 flex-col gap-6">
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex flex-wrap items-center gap-2">
				<span class="font-mono">dpl_7Hq2xK</span>
				<Badge variant={status === 'Ready' ? 'default' : 'secondary'}>{status}</Badge>
			</Card.Title>
			<Card.Description>
				{PROJECT} · Production
				{#if started}
					· started <RelativeTime date={started} live />
				{/if}
			</Card.Description>
			<Card.Action>
				<Button variant="outline" size="sm" disabled={status === 'Building'} onclick={run}>
					Redeploy
				</Button>
			</Card.Action>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			<div class="flex min-w-0 items-center gap-2">
				<span class="min-w-0 truncate font-mono text-sm">{DEPLOYMENT_URL}</span>
				<CopyButton
					text={DEPLOYMENT_URL}
					variant="ghost"
					size="icon-sm"
					label="Copy deployment URL"
				/>
			</div>
			<Separator />
			<dl class="grid gap-3 text-sm sm:grid-cols-3">
				<div class="flex min-w-0 flex-col gap-1">
					<dt class="text-xs text-muted-foreground">Author</dt>
					<dd class="flex items-center gap-2">
						<Avatar name={AUTHOR} size="sm" />
						<span class="truncate">{AUTHOR}</span>
					</dd>
				</div>
				<div class="flex min-w-0 flex-col gap-1">
					<dt class="text-xs text-muted-foreground">Branch</dt>
					<dd class="flex items-center gap-2">
						<GitBranchIcon class="size-4 text-muted-foreground" aria-hidden="true" />
						<span class="font-mono">main</span>
					</dd>
				</div>
				<div class="flex min-w-0 flex-col gap-1">
					<dt class="text-xs text-muted-foreground">Commit</dt>
					<dd class="flex min-w-0 items-center gap-2">
						<GitCommitIcon class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
						<span class="truncate">
							<span class="font-mono">3f9c2e1</span> Retry webhooks with backoff
						</span>
					</dd>
				</div>
			</dl>
		</Card.Content>
	</Card.Root>

	<div class="grid min-w-0 gap-6 lg:grid-cols-3">
		<Card.Root class="min-w-0 lg:col-span-2">
			<Card.Header>
				<Card.Title>Build log</Card.Title>
				<Card.Description>
					{pinned ? 'Following new lines.' : 'Scrolled back. New lines keep arriving below.'}
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<FollowScroll
					bind:pinned
					count={lines.length}
					class="h-72 rounded-md border"
					aria-label="Build log"
				>
					<ol class="p-3 font-mono text-xs">
						{#each lines as line, index (index)}
							<li class="py-0.5 break-all text-muted-foreground">{line}</li>
						{/each}
					</ol>
				</FollowScroll>
			</Card.Content>
		</Card.Root>

		<Card.Root class="min-w-0">
			<Card.Header>
				<Card.Title>Activity</Card.Title>
				<Card.Description>What happened to this deployment.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Timeline
					items={events}
					getDate={(event) => event.at}
					getKey={(event) => event.id}
					headingLevel={3}
					timeFormat={{ hour: 'numeric', minute: '2-digit', second: '2-digit' }}
					emptyMessage="Waiting for the build to start."
					headingClass="text-sm font-medium text-muted-foreground"
				>
					{#snippet item({ item })}
						<span class="text-sm">
							{#if item.who}<span class="font-medium">{item.who}</span>{/if}
							{item.what}
						</span>
					{/snippet}
				</Timeline>
			</Card.Content>
		</Card.Root>
	</div>
</div>
