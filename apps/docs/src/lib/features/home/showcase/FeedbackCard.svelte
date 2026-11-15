<script lang="ts">
	import ActionButton from '#lib/components/coral/kit/action-button/action-button.svelte';
	import RatingGroup from '#lib/components/coral/kit/rating-group/rating-group.svelte';
	import Textarea from '#lib/components/coral/kit/textarea/textarea.svelte';
	import { Label } from '#lib/components/ui/label/index.js';
	import { wait } from '#lib/features/home/world.js';
	import ShowcaseCard from './ShowcaseCard.svelte';

	let rating = $state(0);
	let comment = $state('');
	let error = $state('');
	let sent = $state('');
	let attempts = 0;

	async function send() {
		error = '';
		sent = '';
		attempts++;
		await wait(900);
		if (attempts === 1) throw new Error('Could not reach the feedback service. Nothing was lost.');
		sent = `Sent: ${rating} of 5. Thanks.`;
		rating = 0;
		comment = '';
	}
</script>

<ShowcaseCard
	title="Rate this deploy"
	description="web-app to Production from main, finished a few minutes ago."
	hint="Pick a rating, write a note and send twice: the first send fails and keeps what you wrote. The counter warns near 280."
	components={['kit/rating-group', 'kit/textarea', 'kit/action-button']}
>
	<div class="grid gap-2">
		<span id="home-feedback-rating" class="text-sm font-medium">How did it go?</span>
		<RatingGroup
			bind:value={rating}
			aria-labelledby="home-feedback-rating"
			label={(value, count) => `${value} of ${count}`}
			onchange={() => (sent = '')}
		/>
	</div>

	<div class="grid gap-2">
		<Label for="home-feedback-comment">What should we know?</Label>
		<Textarea
			id="home-feedback-comment"
			bind:value={comment}
			rows={2}
			maxRows={6}
			maxLength={280}
			showCount
			placeholder="The build cache missed again on api."
		/>
	</div>

	<div class="flex flex-wrap items-center gap-3">
		<ActionButton
			size="sm"
			onclick={send}
			onerror={(reason) => (error = (reason as Error).message)}
			disabled={rating === 0}
			pendingLabel="Sending feedback"
		>
			{#snippet children({ pending })}
				{pending ? 'Sending...' : 'Send feedback'}
			{/snippet}
		</ActionButton>
		<p
			class={error ? 'min-w-0 text-sm text-destructive' : 'min-w-0 text-sm text-muted-foreground'}
			role="status"
		>
			{error || sent}
		</p>
	</div>
</ShowcaseCard>
