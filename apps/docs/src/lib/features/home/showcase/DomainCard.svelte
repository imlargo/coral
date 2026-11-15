<script lang="ts">
	import ActionButton from '#lib/components/coral/kit/action-button/action-button.svelte';
	import ResponsiveDialog from '#lib/components/coral/kit/responsive-dialog/responsive-dialog.svelte';
	import ResponsiveDialogBody from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-body.svelte';
	import ResponsiveDialogClose from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-close.svelte';
	import ResponsiveDialogContent from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-content.svelte';
	import ResponsiveDialogDescription from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-description.svelte';
	import ResponsiveDialogFooter from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-footer.svelte';
	import ResponsiveDialogHeader from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-header.svelte';
	import ResponsiveDialogTitle from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-title.svelte';
	import ResponsiveDialogTrigger from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-trigger.svelte';
	import { buttonVariants } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { PROJECT, wait } from '#lib/features/home/world.js';
	import ShowcaseCard from './ShowcaseCard.svelte';

	const DOMAIN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;
	// Claimed by another team, so the platform refuses to point them at web-app.
	const TAKEN = new Set(['example.com', 'www.example.com']);

	let domains = $state([`${PROJECT}.example.dev`]);
	let open = $state(false);
	let domain = $state('');
	let error = $state('');

	async function add() {
		error = '';
		const next = domain.trim().toLowerCase();
		if (!DOMAIN.test(next)) throw new Error('Enter a domain like app.example.com.');
		await wait(800);
		if (TAKEN.has(next)) throw new Error(`${next} is already in use by another project.`);
		if (domains.includes(next)) throw new Error(`${next} already points to ${PROJECT}.`);
		domains.push(next);
		open = false;
	}
</script>

<ShowcaseCard
	title="Domains"
	description={`Where ${PROJECT} answers in Production.`}
	hint="Add example.com: it is taken, and the dialog stays open saying so. app.example.com goes through. On a narrow screen it opens as a drawer."
	components={['kit/responsive-dialog', 'kit/action-button']}
>
	<ul class="grid gap-1 text-sm">
		{#each domains as entry (entry)}
			<li class="min-w-0 truncate">{entry}</li>
		{/each}
	</ul>

	<ResponsiveDialog
		bind:open
		onOpenChangeComplete={(isOpen) => {
			if (isOpen) return;
			domain = '';
			error = '';
		}}
	>
		<ResponsiveDialogTrigger class={buttonVariants({ variant: 'outline', size: 'sm' })}>
			Add domain
		</ResponsiveDialogTrigger>

		<ResponsiveDialogContent>
			<ResponsiveDialogHeader>
				<ResponsiveDialogTitle>Add a domain</ResponsiveDialogTitle>
				<ResponsiveDialogDescription>
					Point a domain you own at {PROJECT}. DNS instructions follow once it is added.
				</ResponsiveDialogDescription>
			</ResponsiveDialogHeader>

			<ResponsiveDialogBody>
				<!-- The submit button lives in the footer; Enter in the field still reaches it. -->
				<form id="home-domain-form" class="grid gap-2" onsubmit={(event) => event.preventDefault()}>
					<Label for="home-domain">Domain</Label>
					<Input
						id="home-domain"
						bind:value={domain}
						placeholder="app.example.com"
						autocomplete="off"
						aria-invalid={error ? 'true' : undefined}
						aria-describedby={error ? 'home-domain-error' : undefined}
						oninput={() => (error = '')}
					/>
					{#if error}
						<p id="home-domain-error" class="text-sm text-destructive" role="alert">{error}</p>
					{/if}
				</form>
			</ResponsiveDialogBody>

			<ResponsiveDialogFooter>
				<ResponsiveDialogClose class={buttonVariants({ variant: 'outline' })}>
					Cancel
				</ResponsiveDialogClose>
				<ActionButton
					type="submit"
					form="home-domain-form"
					onclick={add}
					onerror={(reason) => (error = (reason as Error).message)}
					disabled={domain.trim() === ''}
					pendingLabel="Adding domain"
				>
					{#snippet children({ pending })}
						{pending ? 'Adding...' : 'Add domain'}
					{/snippet}
				</ActionButton>
			</ResponsiveDialogFooter>
		</ResponsiveDialogContent>
	</ResponsiveDialog>
</ShowcaseCard>
