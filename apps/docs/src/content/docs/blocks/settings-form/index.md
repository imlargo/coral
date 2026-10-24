---
title: Settings form
description: A form that edits a saved copy, saying when there are unsaved changes, saving once, announcing how it went, and warning before the tab closes on them.
group: Blocks
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
</script>

A settings page edits a copy of saved data and saves it on request, and every hand-built one goes
wrong in the same places: nothing shows that anything changed, or Save is enabled all the time; there
is no way to discard short of reloading; "Saved" flashes too fast to read and is never announced; a
second save starts while the first is still out; closing the tab loses the edits without a word.

<Preview name="blocks/settings-form/basic" class="min-h-64" />

## What Coral adds

- **A draft, not the record.** Fields bind to `draft.current`, a deep copy of what is saved, and
  `draft.dirty` is read against the saved record as it stands - so the moment the record reflects
  the save, the form is clean on its own, with nothing to call. See [`lib/draft`](#lib-draft).
- **A bar that appears when it has something to say.** Unsaved changes, saving, saved, could not
  save: one line, with discard and save beside it, and nothing at all while the form is clean.
- **One save at a time**, from the button, from Enter in a field and from `mod+s`, all through the
  same door. A refusal keeps the changes and says why.
- **Heard as well as seen.** Saving, saved and failed are announced through a status region.
- **A warning before the tab closes** on unsaved changes, from the draft itself.

## The draft

```svelte
<script lang="ts">
	import SettingsForm from '#lib/components/coral/blocks/settings-form/settings-form.svelte';
	import { createDraft } from '#lib/components/coral/lib/draft.svelte.js';

	let { data } = $props();

	// The saved record is the project's; the draft is a copy of it that the fields edit.
	const draft = createDraft(() => data.project);
</script>

<SettingsForm {draft} onsave={(value) => projects.save(value)}>
	{#snippet children({ draft })}
		<Label for="name">Name</Label>
		<Input id="name" bind:value={draft.current.name} />
	{/snippet}
</SettingsForm>
```

`onsave` follows the [action convention](/docs/conventions): return a promise and the form waits;
return exactly `false`, or throw, and the changes stay unsaved and the failure is said. The form
never writes the record: once `onsave` has landed and the project's record holds the new values,
`draft.dirty` is false and the bar steps aside.

## When the save fails

<Preview name="blocks/settings-form/failing" class="min-h-64" />

The message stays until the reader edits again, because the changes were unsaved before the attempt
too, and what they need to know is why they still are. `onerror` receives what was thrown, for a
toast with the server's own words.

## Leaving with changes

The draft warns before the tab closes or the page reloads while it is dirty. Navigation inside the
app is the router's to guard, and Coral never imports SvelteKit, so that part is one line in the
project:

```ts
import { beforeNavigate } from '$app/navigation';

beforeNavigate((navigation) => {
	if (draft.dirty && !confirm('Leave without saving?')) navigation.cancel();
});
```

## Import

```svelte
<script lang="ts">
	import SettingsForm from '#lib/components/coral/blocks/settings-form/settings-form.svelte';
	import { createDraft } from '#lib/components/coral/lib/draft.svelte.js';
</script>
```

## Props

Everything a `<form>` accepts stays available. On top of that:

| Prop             | Type                       | Default                     | Description                                                 |
| ---------------- | -------------------------- | --------------------------- | ----------------------------------------------------------- |
| `draft`          | `Draft<T>`                 | -                           | The copy being edited. Required.                            |
| `onsave`         | `(value: T) => unknown`    | -                           | Saves. `false` or throw: stays unsaved. Required.           |
| `onerror`        | `(error: unknown) => void` | -                           | What `onsave` threw.                                        |
| `shortcut`       | `string`                   | `mod+s`                     | Saves while there is something to save. `''` binds nothing. |
| `saveLabel`      | `string`                   | `Save changes`              | The save button.                                            |
| `discardLabel`   | `string`                   | `Discard`                   | The control that throws the changes away.                   |
| `unsavedMessage` | `string`                   | `You have unsaved changes.` | Shown while dirty.                                          |
| `savingMessage`  | `string`                   | `Saving...`                 | Announced while a save is out.                              |
| `savedMessage`   | `string`                   | `Saved.`                    | Shown and announced once it landed.                         |
| `failedMessage`  | `string`                   | `Could not save.`           | Shown and announced when it did not.                        |
| `statusTimeout`  | `number`                   | `3000`                      | How long `savedMessage` stays, in milliseconds.             |
| `class`          | `string`                   | -                           | Merged onto the form.                                       |
| `barClass`       | `string`                   | -                           | Merged onto the bar.                                        |

### Snippets

| Snippet    | Receives                                                    | Replaces                              |
| ---------- | ----------------------------------------------------------- | ------------------------------------- |
| `children` | `{ draft, pending }`                                        | Nothing - it is the fields. Required. |
| `bar`      | `{ draft, pending, dirty, status, message, save, discard }` | The bar under the fields.             |

## lib/draft

`Draft<T>` is the piece a [form dialog](/docs/blocks/form-dialog) shares with this block, and it
stands on its own for a form that is neither:

```ts
import { createDraft } from '#lib/components/coral/lib/draft.svelte.js';

const draft = createDraft(() => saved); // built where a component's state is
draft.current.name = 'gateway'; // deep state: bind fields to it
draft.dirty; // true until `saved` holds the same data
draft.reset(); // the copy becomes `saved` again
```

A saved record that changes under an untouched copy reseeds it; a copy the reader has already
edited keeps their edits. `equals` takes over the comparison, and `guardUnload: false` turns the
tab-close warning off.

## Accessibility

The bar's message is visible text and is also announced: saving while the request is out, then
saved or failed. The save button keeps focus while it waits, so Enter does not throw the keyboard
back to the top of the page, and a second press does nothing. Discard comes before save, so the
destructive choice is not the one under the hand that just finished typing.
