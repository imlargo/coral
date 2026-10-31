<script lang="ts">
	import PhoneInput from '#lib/components/coral/kit/phone-input/phone-input.svelte';
	import * as Field from '#lib/components/ui/field/index.js';
	import type { PhoneInputProps } from '#lib/components/coral/kit/phone-input/types.js';

	let phone = $state<string | undefined>();
	let country = $state<PhoneInputProps['country']>('US');
</script>

<Field.Field class="w-80">
	<Field.Label for="alerts-phone">Phone for on-call alerts</Field.Label>
	<PhoneInput id="alerts-phone" bind:value={phone} bind:country placeholder="(201) 555-0123" />
	<Field.Description>
		Bound value: <code>{phone ?? 'undefined'}</code> · country: <code>{country ?? 'none'}</code>
	</Field.Description>
</Field.Field>
