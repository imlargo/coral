<script lang="ts">
	import CountrySelect from '#lib/components/coral/kit/country-select/country-select.svelte';
	import * as Field from '#lib/components/ui/field/index.js';

	let country = $state<string | undefined>('JP');
</script>

<Field.Field class="w-72">
	<Field.Label for="billing-country">Billing country</Field.Label>
	<CountrySelect id="billing-country" bind:value={country} />
	<Field.Description>Bound value: <code>{country ?? 'undefined'}</code></Field.Description>
</Field.Field>
