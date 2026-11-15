<script lang="ts">
	import CountrySelect from '#lib/components/coral/kit/country-select/country-select.svelte';
	import PhoneInput from '#lib/components/coral/kit/phone-input/phone-input.svelte';
	import type { PhoneInputProps } from '#lib/components/coral/kit/phone-input/types.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import ShowcaseCard from './ShowcaseCard.svelte';

	type Country = NonNullable<PhoneInputProps['country']>;

	// Every one of these has a calling code, so any pick can also drive the phone field.
	const BILLING_COUNTRIES: Country[] = [
		'BR',
		'CA',
		'CI',
		'CO',
		'DE',
		'FR',
		'GB',
		'IN',
		'JP',
		'MX',
		'NG',
		'US'
	];

	let country = $state<string | undefined>('US');
	let phoneCountry = $state<Country | undefined>('US');
	let phone = $state<string | undefined>();
	let saved = $state('');

	// A number already typed belongs to its own country; only an empty field follows the address.
	function followCountry(code: string | undefined) {
		saved = '';
		if (code && phone === undefined) phoneCountry = code as Country;
	}

	function save(event: SubmitEvent) {
		event.preventDefault();
		saved = phone ? `Saved. Invoices go to ${phone}.` : 'Saved without a phone number.';
	}
</script>

<ShowcaseCard
	title="Billing contact"
	description="Who gets the receipts for the team's plan."
	hint="Type bra or cote: accents are folded. With the phone empty, the country sets its dial code; an incomplete number blocks Save."
	components={['kit/country-select', 'kit/phone-input']}
>
	<form class="grid gap-4" onsubmit={save}>
		<div class="grid gap-2">
			<Label for="home-billing-country">Country</Label>
			<CountrySelect
				id="home-billing-country"
				countries={BILLING_COUNTRIES}
				bind:value={country}
				onchange={(selection) => followCountry(selection?.value)}
			/>
		</div>

		<div class="grid gap-2">
			<Label for="home-billing-phone">Phone</Label>
			<PhoneInput
				id="home-billing-phone"
				name="phone"
				countries={BILLING_COUNTRIES}
				bind:country={phoneCountry}
				bind:value={phone}
				onchange={() => (saved = '')}
			/>
			<p class="text-xs text-muted-foreground">
				Stored as <code>{phone ?? 'nothing yet'}</code>
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-3">
			<Button type="submit" size="sm">Save contact</Button>
			<p class="min-w-0 text-sm text-muted-foreground" role="status">{saved}</p>
		</div>
	</form>
</ShowcaseCard>
