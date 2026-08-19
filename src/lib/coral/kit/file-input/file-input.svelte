<script lang="ts">
	/**
	 * @coral/kit/file-input
	 * @version 1.0.0
	 */
	import FileIcon from '@lucide/svelte/icons/file';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import XIcon from '@lucide/svelte/icons/x';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import * as Item from '$lib/components/ui/item/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { describeAccept } from './accept.js';
	import { collect } from './collect.js';
	import { formatBytes } from './format-bytes.js';
	import type { FileInputProps } from './types.js';

	let {
		value = $bindable([]),
		onchange,
		onreject,
		accept = '',
		multiple = false,
		maxFiles,
		maxSize,
		disabled = false,
		label = 'Drop files here, or click to browse',
		hint,
		removeLabel = 'Remove file',
		class: className,
		listClass,
		zone,
		file: fileSnippet,
		...restProps
	}: FileInputProps = $props();

	/**
	 * One number instead of two contradictory ones. Every copy in the corpus carries both a
	 * single/multiple switch and a `maxFiles`, and defaults them to `single` and `5` - so the props
	 * disagree out of the box and the reader has to go and find out which one wins.
	 */
	const limit = $derived(multiple ? (maxFiles ?? Number.POSITIVE_INFINITY) : 1);

	/**
	 * How many drag events deep the pointer is.
	 *
	 * A plain boolean flag does not survive the zone having children: moving from the zone onto the
	 * icon inside it fires `dragleave` on the zone, and the highlight flickers off while the file is
	 * still over it. Counting enters against leaves is what stays correct.
	 */
	let depth = $state(0);
	const dragging = $derived(depth > 0);

	const summary = $derived(
		[describeAccept(accept), maxSize === undefined ? '' : formatBytes(maxSize)]
			.filter(Boolean)
			.join(' · ')
	);
	const shownHint = $derived(hint ?? summary);

	function receive(incoming: File[]) {
		const { files, rejected } = collect(incoming, { current: value, accept, maxSize, limit });
		if (rejected.length > 0) onreject?.(rejected);

		// `collect` returns the current list by identity when nothing got through, so this is the
		// one place that decides whether anything actually changed.
		if (files === value) return;
		value = files;
		onchange?.(files);
	}

	function pick(event: Event & { currentTarget: HTMLInputElement }) {
		const picked = Array.from(event.currentTarget.files ?? []);
		/**
		 * Cleared so the same file can be picked again. An input keeps what it was given, so
		 * removing a file and re-selecting it fires no `change` at all - the value has not moved.
		 */
		event.currentTarget.value = '';
		receive(picked);
	}

	function remove(index: number) {
		value = value.filter((_, at) => at !== index);
		onchange?.(value);
	}

	function dragenter(event: DragEvent) {
		if (disabled) return;
		event.preventDefault();
		depth += 1;
	}

	function dragover(event: DragEvent) {
		if (disabled) return;
		// Without this the browser takes the drop itself and navigates to the file.
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
	}

	function dragleave() {
		if (disabled) return;
		depth = Math.max(0, depth - 1);
	}

	function drop(event: DragEvent) {
		if (disabled) return;
		event.preventDefault();
		depth = 0;
		receive(Array.from(event.dataTransfer?.files ?? []));
	}
</script>

<div class="flex w-full flex-col gap-3">
	<!--
		A `<label>`, not a div with a click handler.

		All four pickers in the corpus hang `onclick` off a div and hide the input with `hidden`,
		which takes it out of the accessibility tree - so none of them can be opened from the
		keyboard at all, and each needed an `a11y_click_events_have_key_events` suppression to build.
		A label wrapping a focusable input needs no handler and no suppression: the click is native,
		Tab reaches the input, and Space and Enter open the picker the way the platform intends.
	-->
	<label
		data-dragging={dragging || undefined}
		data-disabled={disabled || undefined}
		class={cn(
			'group/zone relative block cursor-pointer rounded-xl border border-dashed transition-colors',
			'hover:bg-accent/40',
			'has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/50',
			'data-dragging:border-ring data-dragging:bg-accent/60',
			'data-disabled:pointer-events-none data-disabled:opacity-50',
			className
		)}
		ondragenter={dragenter}
		ondragover={dragover}
		ondragleave={dragleave}
		ondrop={drop}
	>
		<!--
			`sr-only` rather than `hidden`: it is clipped to a pixel but still focusable, which is the
			whole difference between a keyboard-operable picker and a mouse-only one.
		-->
		<input
			type="file"
			class="sr-only"
			{accept}
			{multiple}
			{disabled}
			onchange={pick}
			{...restProps}
		/>

		{#if zone}
			{@render zone({ dragging, disabled, hint: shownHint })}
		{:else}
			<!-- `Empty` already carries the centred layout and the dashed radius; the border width is
			     the one thing it leaves to its caller, so it lives on the label above. -->
			<Empty.Root class="border-0">
				<Empty.Header>
					<Empty.Media variant="icon">
						<UploadIcon />
					</Empty.Media>
					<Empty.Title>{label}</Empty.Title>
					{#if shownHint}
						<Empty.Description>{shownHint}</Empty.Description>
					{/if}
				</Empty.Header>
			</Empty.Root>
		{/if}
	</label>

	{#if value.length > 0}
		<Item.Group class={listClass}>
			{#each value as file, index (`${file.name}-${file.size}-${file.lastModified}`)}
				{#if fileSnippet}
					{@render fileSnippet({ file, index, remove: () => remove(index) })}
				{:else}
					<Item.Root variant="outline">
						<Item.Media variant="icon">
							<FileIcon />
						</Item.Media>
						<Item.Content class="min-w-0">
							<Item.Title class="truncate">{file.name}</Item.Title>
							<Item.Description>{formatBytes(file.size)}</Item.Description>
						</Item.Content>
						<Item.Actions>
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								aria-label={removeLabel}
								{disabled}
								onclick={() => remove(index)}
							>
								<XIcon class="opacity-50" />
							</Button>
						</Item.Actions>
					</Item.Root>
				{/if}
			{/each}
		</Item.Group>
	{/if}
</div>
