/**
 * @coral/blocks/settings-form
 * @version 1.0.0
 */

import type { Snippet } from 'svelte';
import type { HTMLFormAttributes } from 'svelte/elements';
import type { Draft } from '../../lib/draft.svelte.js';

/** Where the last save stands. `idle` also while the reader is editing. */
export type SaveStatus = 'idle' | 'saved' | 'failed';

/** What the `children` snippet receives. */
export type FieldsContext<T> = {
	draft: Draft<T>;
	/** A save is in flight. Fields are usually left editable; a second save cannot start. */
	pending: boolean;
};

/** What the `bar` snippet receives. */
export type BarContext<T> = FieldsContext<T> & {
	dirty: boolean;
	status: SaveStatus;
	/** The line the default bar prints, or an empty string when there is nothing to say. */
	message: string;
	save: () => void;
	discard: () => void;
};

/**
 * `onsubmit` is Coral's: Enter in a field saves, through the same path as the button. `children`
 * is re-declared to receive the draft.
 */
type FormProps = Omit<HTMLFormAttributes, 'onsubmit' | 'children'>;

export type SettingsFormProps<T> = FormProps & {
	/** The copy being edited. Build it with `createDraft(() => settings)` - see `lib/draft`. */
	draft: Draft<T>;
	/**
	 * Saves the draft. Return a promise and the form waits; return exactly `false`, or throw, and
	 * the changes stay unsaved and the failure is said - the convention every Coral component that
	 * waits on a request follows. Once the saved record reflects the draft, the form is clean again
	 * on its own.
	 */
	onsave: (value: T) => unknown;
	/** Receives whatever `onsave` threw. Without it the error is an unhandled rejection. */
	onerror?: (error: unknown) => void;
	/**
	 * The combo that saves, in `kit/shortcut` syntax, bound while there is something to save. Pass
	 * an empty string to bind nothing.
	 */
	shortcut?: string;
	/** Label of the save button. */
	saveLabel?: string;
	/** Label of the control that throws the changes away. */
	discardLabel?: string;
	/** Shown while there are unsaved changes. */
	unsavedMessage?: string;
	/** Announced while a save is in flight. */
	savingMessage?: string;
	/** Shown and announced once a save landed. */
	savedMessage?: string;
	/** Shown and announced when a save did not go through. */
	failedMessage?: string;
	/** How long `savedMessage` stays, in milliseconds. */
	statusTimeout?: number;
	/** The form element. Bindable. */
	ref?: HTMLFormElement | null;
	/** Merged onto the form. */
	class?: string;
	/** Merged onto the bar. */
	barClass?: string;
	/** The fields, bound to `draft.current`. */
	children: Snippet<[FieldsContext<T>]>;
	/** Replaces the bar under the fields: the message, discard and save. */
	bar?: Snippet<[BarContext<T>]>;
};

/** What a project can state once for every settings form - see `lib/defaults`. */
export type SettingsFormDefaults = Partial<
	Pick<
		SettingsFormProps<unknown>,
		| 'shortcut'
		| 'saveLabel'
		| 'discardLabel'
		| 'unsavedMessage'
		| 'savingMessage'
		| 'savedMessage'
		| 'failedMessage'
		| 'statusTimeout'
	>
>;

declare global {
	interface CoralDefaults {
		'blocks/settings-form'?: SettingsFormDefaults;
	}
}
