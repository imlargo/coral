<script lang="ts">
	import SegmentedProgress from '#lib/components/coral/kit/segmented-progress/segmented-progress.svelte';
	import { Button } from '#lib/components/ui/button/index.js';

	const steps = ['Name your workspace', 'Invite your team', 'Connect a repository', 'Deploy'];

	let step = $state(1);
</script>

<div class="flex w-full max-w-sm flex-col gap-4">
	<SegmentedProgress count={steps.length} value={step} aria-label="Workspace setup" />
	<p class="text-sm font-medium">{steps[step - 1]}</p>
	<div class="flex justify-between">
		<Button variant="outline" disabled={step === 1} onclick={() => step--}>Back</Button>
		<Button disabled={step === steps.length} onclick={() => step++}>Next</Button>
	</div>
</div>
