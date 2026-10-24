<script lang="ts">
	/**
	 * @coral/lib/defaults
	 * @version 1.0.0
	 */
	import ConfirmDialog from '../kit/confirm-dialog/confirm-dialog.svelte';
	import NumberInput from '../kit/number-input/number-input.svelte';
	import Select from '../kit/select/select.svelte';
	import { untrack } from 'svelte';
	import { setCoralDefaults } from './defaults.js';
	import type { CoralDefaults } from './defaults.js';

	let { defaults, placeholder }: { defaults?: CoralDefaults; placeholder?: string } = $props();

	// Set once on the way in, as a root layout would; left unset, the children fall through to English.
	const initial = untrack(() => defaults);
	if (initial) setCoralDefaults(initial);
</script>

<Select options={[{ value: 1, label: 'Açaí' }]} {placeholder} aria-label="Fruit" />
<ConfirmDialog open title="Delete" />
<NumberInput value={1.5} step={0.5} aria-label="Amount" />
