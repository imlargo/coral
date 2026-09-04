<script lang="ts" generics="T">
	/**
	 * @coral/kit/select
	 * @version 2.1.0
	 */
	import XIcon from '@lucide/svelte/icons/x';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import HiddenField from '../../lib/hidden-field.svelte';
	import { flatten, toGroups } from '../../lib/options.js';
	import type { SelectProps } from './types.js';

	let {
		options,
		value = $bindable(),
		open = $bindable(false),
		placeholder = 'Select an option...',
		clearLabel = 'Clear selection',
		onchange,
		disabled = false,
		clearable = false,
		name,
		form,
		required = false,
		serialize,
		size = 'default',
		class: className,
		contentClass,
		trigger,
		option: optionSnippet,
		...restProps
	}: SelectProps<T> = $props();

	const toText = $derived(serialize ?? ((entry: T) => String(entry)));
	const groups = $derived(toGroups(options));
	const all = $derived(flatten(options));

	/**
	 * bits-ui keys an item by a string, and `T` is not one. An index cannot collide with itself;
	 * `String(value)` - what three of the four selects in the corpus used - collides twice over,
	 * on ids that stringify alike and on objects, which all become `[object Object]`.
	 */
	const indexed = $derived.by(() => {
		let index = 0;
		return groups.map((group) => ({
			label: group.label,
			entries: group.options.map((option) => ({ option, index: index++ }))
		}));
	});

	const selectedIndex = $derived(all.findIndex((option) => option.value === value));
	const selected = $derived(selectedIndex === -1 ? undefined : all[selectedIndex]);
	const selectedKey = $derived(selectedIndex === -1 ? '' : String(selectedIndex));
	const showClear = $derived(clearable && selected !== undefined && !disabled);

	/**
	 * Typeahead while the trigger is focused and the list is shut, the way a native `<select>` does.
	 * bits-ui needs the labels up front: an item that never mounted cannot report its own.
	 */
	const items = $derived(
		all.map((option, index) => ({
			value: String(index),
			label: option.label,
			disabled: option.disabled
		}))
	);

	/**
	 * The only place `onchange` is called from. Deriving it from `value` with an `$effect`, as both
	 * selects in the corpus did, also fires on mount and on every programmatic assignment - so a
	 * form loading a saved record announces a change nobody made.
	 */
	function handleValueChange(key: string) {
		// bits-ui reports a deselection as an empty string.
		const option = key === '' ? undefined : all[Number(key)];
		value = option?.value;
		onchange?.(option);
	}

	function clear() {
		value = undefined;
		onchange?.(undefined);
	}
</script>

<div class="relative">
	<Select.Root
		type="single"
		bind:open
		{disabled}
		{items}
		allowDeselect={clearable}
		value={selectedKey}
		onValueChange={handleValueChange}
		{...restProps}
	>
		<!-- `aria-required`: the primitive spends `required` on the field it submits, never here. -->
		<Select.Trigger
			{size}
			class={cn('w-full', showClear && 'pe-9', className)}
			aria-label={selected ? undefined : placeholder}
			aria-required={required ? 'true' : undefined}
		>
			{#if trigger}
				{@render trigger({ selected, placeholder, disabled })}
			{:else if selected}
				<span class="min-w-0 truncate">{selected.label}</span>
			{:else}
				<!-- The primitive dims placeholder text off `data-placeholder`, which it only sets when
				     its own value is empty. Coral drives the value, so the dimming is spelled out. -->
				<span class="min-w-0 truncate text-muted-foreground">{placeholder}</span>
			{/if}
		</Select.Trigger>

		<Select.Content class={contentClass}>
			{#each indexed as group, groupIndex (groupIndex)}
				<Select.Group>
					{#if group.label}
						<Select.GroupHeading>{group.label}</Select.GroupHeading>
					{/if}
					{#each group.entries as entry (entry.index)}
						{@const isSelected = entry.index === selectedIndex}
						<Select.Item
							value={String(entry.index)}
							label={entry.option.label}
							disabled={entry.option.disabled}
						>
							{#if optionSnippet}
								{@render optionSnippet({ option: entry.option, selected: isSelected })}
							{:else if entry.option.description}
								<span class="flex min-w-0 flex-col">
									<span class="truncate">{entry.option.label}</span>
									<span class="truncate text-muted-foreground">{entry.option.description}</span>
								</span>
							{:else}
								{entry.option.label}
							{/if}
						</Select.Item>
					{/each}
				</Select.Group>
			{/each}
		</Select.Content>
	</Select.Root>

	<!-- Beside the trigger, not inside: a button within a button is invalid HTML, and browsers
	     recover by dropping one of the two. -->
	{#if showClear}
		<Button
			type="button"
			variant="ghost"
			size="icon-xs"
			class="absolute inset-y-0 end-7 my-auto"
			aria-label={clearLabel}
			onclick={clear}
		>
			<XIcon class="opacity-50" />
		</Button>
	{/if}
</div>

<!-- `required` is not forwarded to the primitive: it spends it on a field it only renders when it
     owns `name`, and Coral owns `name` here so the value submits instead of the index key. -->
{#if name}
	<HiddenField {name} {form} {required} value={value === undefined ? '' : toText(value)} />
{/if}
