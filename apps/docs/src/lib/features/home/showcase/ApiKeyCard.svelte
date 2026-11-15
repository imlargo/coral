<script lang="ts">
	import CopyButton from '#lib/components/coral/kit/copy-button/copy-button.svelte';
	import PasswordInput from '#lib/components/coral/kit/password-input/password-input.svelte';
	import RelativeTime from '#lib/components/coral/kit/relative-time/relative-time.svelte';
	import * as Field from '#lib/components/ui/field/index.js';
	import { TEAM } from '#lib/features/home/world.js';
	import ShowcaseCard from './ShowcaseCard.svelte';

	// A sample key: the shape of a real one, valid nowhere.
	const key = 'demo_key_web-app_0000000000000000';
	const createdAt = Date.now() - 3 * 24 * 60 * 60 * 1000;
	const createdBy = TEAM[1];
</script>

<ShowcaseCard
	title="API key"
	description="The key web-app's build pipeline signs its requests with."
	hint="Show the key, then copy it: the button confirms the copy and a screen reader hears it."
	components={['kit/password-input', 'kit/copy-button', 'kit/relative-time']}
>
	<Field.Field>
		<Field.Label for="api-key">Secret key</Field.Label>
		<div class="flex min-w-0 items-center gap-2">
			<div class="min-w-0 flex-1">
				<PasswordInput
					id="api-key"
					value={key}
					readonly
					autocomplete="off"
					toggleLabel="Show API key"
				/>
			</div>
			<CopyButton text={key} variant="outline" label="Copy API key" copiedLabel="API key copied" />
		</div>
		<Field.Description>
			Created <RelativeTime date={createdAt} /> by {createdBy.name}
		</Field.Description>
	</Field.Field>
</ShowcaseCard>
