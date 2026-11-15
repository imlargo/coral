<script lang="ts">
	import PasswordInput from '#lib/components/coral/kit/password-input/password-input.svelte';
	import SegmentedProgress from '#lib/components/coral/kit/segmented-progress/segmented-progress.svelte';
	import * as Field from '#lib/components/ui/field/index.js';

	const levels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

	let password = $state('');

	// How strength is scored is the product's rule, not Coral's: this one is a demo, not advice.
	const score = $derived(
		password.length < 8
			? 0
			: [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z\d]/].filter((rule) => rule.test(password)).length
	);
	const color = $derived(score < 2 ? 'var(--destructive)' : 'var(--primary)');
</script>

<Field.Field class="w-full max-w-sm">
	<Field.Label for="new-password">New password</Field.Label>
	<PasswordInput id="new-password" bind:value={password} autocomplete="new-password" />
	<SegmentedProgress
		type="meter"
		count={4}
		value={score}
		{color}
		valueText={(value) => levels[value]}
		aria-label="Password strength"
	/>
	<!-- The meter already says the level; the word is for the eye. -->
	<Field.Description aria-hidden="true">
		{password ? levels[score] : 'At least 8 characters, mixing cases, digits and symbols.'}
	</Field.Description>
</Field.Field>
