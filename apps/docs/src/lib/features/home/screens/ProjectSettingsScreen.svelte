<script lang="ts">
	import ActionButton from '#lib/components/coral/kit/action-button/action-button.svelte';
	import Breadcrumbs from '#lib/components/coral/kit/breadcrumbs/breadcrumbs.svelte';
	import Combobox from '#lib/components/coral/kit/combobox/combobox.svelte';
	import InlineEdit from '#lib/components/coral/kit/inline-edit/inline-edit.svelte';
	import NumberInput from '#lib/components/coral/kit/number-input/number-input.svelte';
	import Select from '#lib/components/coral/kit/select/select.svelte';
	import TagsInput from '#lib/components/coral/kit/tags-input/tags-input.svelte';
	import Textarea from '#lib/components/coral/kit/textarea/textarea.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { ENVIRONMENTS, PROJECT, REGIONS, REPOSITORIES, wait } from '#lib/features/home/world.js';

	const environments = ENVIRONMENTS.map((environment) => ({
		value: environment,
		label: environment
	}));

	let name = $state(PROJECT);
	let nameError = $state('');
	let description = $state('The customer-facing dashboard, built from the main branch.');
	let environment = $state<(typeof ENVIRONMENTS)[number]>('Preview');
	let region = $state<string>('iad');
	let concurrency = $state<number | undefined>(2);
	let ignored = $state(['docs/**', '*.md', '.github/**']);

	let attempts = 0;
	let saveMessage = $state('');

	async function rename(next: string) {
		nameError = '';
		await wait(600);
		// The other repositories in the team stand in for project names already taken.
		if (next !== PROJECT && REPOSITORIES.includes(next)) {
			nameError = `A project named ${next} already exists.`;
			return false;
		}
	}

	async function save() {
		saveMessage = '';
		attempts++;
		await wait(900);
		if (attempts === 1) throw new Error('A deployment is still running. Try again once it ends.');
	}
</script>

<div class="flex min-w-0 flex-col gap-6">
	<div class="flex min-w-0 flex-col gap-2">
		<Breadcrumbs
			items={[{ label: 'Team' }, { label: 'Projects' }, { label: name }, { label: 'Settings' }]}
		/>
		<h2 class="text-xl font-semibold">Project settings</h2>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>General</Card.Title>
			<Card.Description>How the project is named and where a new deployment lands.</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<Field.Group>
				<Field.Field>
					<!-- A title, not a label: the field only exists while editing. -->
					<Field.Title>Project name</Field.Title>
					<InlineEdit
						bind:value={name}
						aria-label="Project name"
						onsave={rename}
						oncancel={() => (nameError = '')}
						editLabel={(value) => `Rename ${value}`}
						required
						class="w-full"
					/>
					<Field.Description role="status">
						{nameError || 'Used in deployment URLs.'}
					</Field.Description>
				</Field.Field>

				<Field.Field>
					<Field.Label for="project-description">Description</Field.Label>
					<Textarea
						id="project-description"
						bind:value={description}
						rows={2}
						maxRows={6}
						maxLength={160}
						showCount
					/>
				</Field.Field>

				<Field.Field>
					<Field.Label for="project-environment">Default environment</Field.Label>
					<Select id="project-environment" options={environments} bind:value={environment} />
					<Field.Description
						>Where a push to a branch without its own rule deploys.</Field.Description
					>
				</Field.Field>
			</Field.Group>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Region</Card.Title>
			<Card.Description>Functions run here. Pick the one closest to your database.</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<Field.Field>
				<Field.Label for="project-region">Function region</Field.Label>
				<Combobox
					id="project-region"
					options={REGIONS}
					bind:value={region}
					placeholder="Select a region"
					searchPlaceholder="Search regions"
					emptyMessage="No region matches."
				/>
				<Field.Description>Static assets are served from every region either way.</Field.Description
				>
			</Field.Field>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Build</Card.Title>
			<Card.Description>What runs on every push, and what never triggers one.</Card.Description>
		</Card.Header>
		<Card.Content>
			<Field.Group>
				<Field.Field>
					<Field.Label for="project-concurrency">Concurrent builds</Field.Label>
					<NumberInput id="project-concurrency" bind:value={concurrency} min={1} max={8} />
					<Field.Description>Between 1 and 8. Extra pushes wait in a queue.</Field.Description>
				</Field.Field>

				<Field.Field>
					<Field.Label for="project-ignored">Ignored paths</Field.Label>
					<TagsInput
						id="project-ignored"
						bind:value={ignored}
						placeholder="Add a glob"
						removeLabel={(path) => `Stop ignoring ${path}`}
						clearable
						clearLabel="Clear ignored paths"
					/>
					<Field.Description>
						A push that only touches these paths skips the build. Paste several separated by commas.
					</Field.Description>
				</Field.Field>
			</Field.Group>
		</Card.Content>
	</Card.Root>

	<div class="flex flex-wrap items-center justify-end gap-3">
		<p class="min-w-0 text-sm text-muted-foreground" role="status">
			{saveMessage}
		</p>
		<ActionButton
			onclick={save}
			onsuccess={() => (saveMessage = 'Settings saved.')}
			onerror={(error) => (saveMessage = error instanceof Error ? error.message : String(error))}
			pendingLabel="Saving settings"
		>
			{#snippet children({ pending })}
				{pending ? 'Saving...' : 'Save changes'}
			{/snippet}
		</ActionButton>
	</div>
</div>
