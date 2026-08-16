<script lang="ts" generics="T">
	/**
	 * @coral/kit/combobox
	 * @version 1.0.0
	 */
	import { tick } from 'svelte';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { fold } from './fold.js';
	import type { ComboboxProps, Option } from './types.js';

	let {
		options,
		value = $bindable(),
		open = $bindable(false),
		placeholder = 'Select an option...',
		searchPlaceholder = 'Search...',
		emptyMessage = 'No results found.',
		disabled = false,
		class: className,
		...restProps
	}: ComboboxProps<T> = $props();

	let triggerRef = $state<HTMLButtonElement>(null!);

	const selected = $derived(options.find((option) => option.value === value));

	/**
	 * Scores an option against the search term: 1 keeps it, 0 hides it.
	 *
	 * Command's own matcher compares raw strings, which in Spanish means the accented entries -
	 * the ones people search for most - never match what they type. Both sides are folded first,
	 * so `bogota` finds `Bogotá`. Matching is on the label, which is the only part of an option
	 * the user can actually see.
	 */
	function match(_value: string, search: string, keywords?: string[]): number {
		return fold(keywords?.join(' ') ?? '').includes(fold(search)) ? 1 : 0;
	}

	/**
	 * Selecting closes the popover, which unmounts the element holding focus and drops the user
	 * at the top of the document. Handing focus back to the trigger keeps the keyboard where the
	 * user left it, so the next Tab continues through the form.
	 */
	function select(option: Option<T>) {
		value = option.value;
		open = false;
		tick().then(() => triggerRef?.focus());
	}
</script>

<Popover.Root bind:open {...restProps}>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				role="combobox"
				aria-expanded={open}
				{disabled}
				class={cn('w-full justify-between', className)}
			>
				{selected?.label ?? placeholder}
				<ChevronsUpDownIcon class="opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>

	<Popover.Content class="w-(--bits-popover-anchor-width) p-0">
		<Command.Root filter={match}>
			<Command.Input placeholder={searchPlaceholder} />
			<Command.List>
				<Command.Empty>{emptyMessage}</Command.Empty>
				<Command.Group>
					<!--
						Command identifies an item by a string, and `T` is not one - stringifying an id
						is lossy and two options can collapse onto the same key. The index is unique by
						construction, and the label travels in `keywords`, which is what `match` reads.
						The check mark is the theme's: shadcn's command item renders it from `data-checked`.
					-->
					{#each options as option, index (index)}
						<Command.Item
							value={String(index)}
							keywords={[option.label]}
							disabled={option.disabled}
							data-checked={option.value === value ? 'true' : undefined}
							onSelect={() => select(option)}
						>
							{option.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
