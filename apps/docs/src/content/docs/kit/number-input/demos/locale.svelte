<script lang="ts">
	import NumberInput from '#lib/components/coral/kit/number-input/number-input.svelte';
	import Select from '#lib/components/coral/kit/select/select.svelte';

	const locales = [
		{ value: 'en-US', label: 'English (US)' },
		{ value: 'de-DE', label: 'Deutsch' },
		{ value: 'es-CO', label: 'Español (Colombia)' },
		{ value: 'fr-FR', label: 'Français' }
	];

	let locale = $state<string | undefined>('de-DE');
	let price = $state<number | undefined>(1234.5);
</script>

<div class="flex flex-col items-center gap-4">
	<div class="w-56">
		<Select options={locales} bind:value={locale} aria-label="Locale" />
	</div>
	<NumberInput bind:value={price} step={0.01} min={0} {locale} class="w-28" aria-label="Price" />
	<p class="text-sm text-muted-foreground">
		Type a decimal the way that locale writes it. Stored: {price ?? '—'}
	</p>
</div>
