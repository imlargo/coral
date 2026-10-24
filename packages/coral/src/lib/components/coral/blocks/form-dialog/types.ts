/**
 * @coral/blocks/form-dialog
 * @version 1.0.0
 */

import type { Snippet } from 'svelte';
import type { ResponsiveDialogProps } from '../../kit/responsive-dialog/types.js';
import type { Draft } from '../../lib/draft.svelte.js';

/** What the `children` snippet receives. */
export type FieldsContext<T> = {
	draft: Draft<T>;
	/** The submit is in flight. */
	pending: boolean;
};

/** What the `footer` snippet receives. */
export type FooterContext<T> = FieldsContext<T> & {
	dirty: boolean;
	submit: () => void;
	/** Closes, asking first when there are changes to lose. */
	cancel: () => void;
};

/**
 * Everything the responsive dialog root accepts - `query`, `fallback`, `onOpenChange` - stays
 * available. `open` and `children` are re-declared below.
 */
type RootProps = Omit<ResponsiveDialogProps, 'open' | 'children'>;

export type FormDialogProps<T> = RootProps & {
	/**
	 * The copy being edited. Build it with `createDraft(() => record)` - see `lib/draft`. It is
	 * reseeded from the record every time the dialog opens, so an edit dialog reused for another
	 * record always opens on that record's values.
	 */
	draft: Draft<T>;
	/** Whether the dialog is showing. Bindable. */
	open?: boolean;
	/** The heading. */
	title: string;
	/** The line under it. */
	description?: string;
	/**
	 * Saves the draft. Return a promise and the dialog waits; it closes once the promise resolves.
	 * Return exactly `false`, or throw, and it stays open with the input kept and the failure shown
	 * beside the fields - the convention every Coral component that waits on a request follows.
	 */
	onsubmit: (value: T) => unknown;
	/** Receives whatever `onsubmit` threw. Without it the error is an unhandled rejection. */
	onerror?: (error: unknown) => void;
	/** Runs when the reader leaves without saving, after any discard was confirmed. */
	oncancel?: () => void;
	/** Label of the button that saves. */
	submitLabel?: string;
	/** Label of the button that leaves. */
	cancelLabel?: string;
	/** Shown beside the fields, and announced, when a submit did not go through. */
	failedMessage?: string;
	/** The question asked before changes are thrown away. */
	discardTitle?: string;
	/** The line under that question. */
	discardDescription?: string;
	/** Label of the button that throws the changes away. */
	discardLabel?: string;
	/** Label of the button that goes back to editing. */
	keepLabel?: string;
	/** Merged onto the dialog content. */
	class?: string;
	/** The element that opens the dialog. Spread `props` onto it. Or bind `open`. */
	trigger?: Snippet<[{ props: Record<string, unknown> }]>;
	/** The fields, bound to `draft.current`. */
	children: Snippet<[FieldsContext<T>]>;
	/** Replaces the footer's cancel and submit buttons. */
	footer?: Snippet<[FooterContext<T>]>;
};

/** What a project can state once for every form dialog - see `lib/defaults`. */
export type FormDialogDefaults = Partial<
	Pick<
		FormDialogProps<unknown>,
		| 'submitLabel'
		| 'cancelLabel'
		| 'failedMessage'
		| 'discardTitle'
		| 'discardDescription'
		| 'discardLabel'
		| 'keepLabel'
	>
>;

declare global {
	interface CoralDefaults {
		'blocks/form-dialog'?: FormDialogDefaults;
	}
}
