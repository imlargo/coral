<script lang="ts">
	import CountrySelect from '#lib/components/coral/kit/country-select/country-select.svelte';
	import Select from '#lib/components/coral/kit/select/select.svelte';
	import * as Field from '#lib/components/ui/field/index.js';

	const locales = [
		{ value: 'en-US', label: 'English (US)' },
		{ value: 'de-DE', label: 'Deutsch' },
		{ value: 'ja-JP', label: '日本語' },
		{ value: 'es-CO', label: 'Español (Colombia)' }
	];

	let locale = $state<string | undefined>('de-DE');
	let region = $state<string | undefined>();
</script>

<div class="flex w-72 flex-col gap-4">
	<Select options={locales} bind:value={locale} aria-label="Locale" />
	<Field.Field>
		<Field.Label for="data-region">Data region</Field.Label>
		<CountrySelect
			id="data-region"
			{locale}
			countries={['DE', 'AT', 'CH', 'NL', 'FR', 'IE', 'SE', 'JP']}
			bind:value={region}
		/>
		<Field.Description>
			Names follow the locale. Search <code>netherlands</code> or <code>ie</code> in any of them.
		</Field.Description>
	</Field.Field>
</div>
