---
title: Form dialog
description: A dialog that creates or edits a record: sends once, keeps the input until the reader lets go of it, shows what went wrong beside the fields, and opens on the right values.
group: Blocks
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
</script>

Open, fill, validate, submit, show the error, close, refresh: every project wires this into a modal
its own way and gets a different subset right. The submit goes out twice, or the dialog closes while
the request is still running. The server's error lands in a toast that disappears instead of beside
the field that needs fixing. Escape or a click on the backdrop throws typed input away without
asking. A dialog used for both create and edit opens on the previous record's values.

<Preview name="blocks/form-dialog/basic" />

## What Coral adds

- **One submit.** The dialog waits on `onsubmit` and closes when it resolves. A second click, Enter
  or Escape while the request is out does nothing.
- **The failure where the fixing happens.** A refusal keeps the input as typed, puts the message
  beside the fields in an alert that is announced, and moves focus to the first field marked
  invalid.
- **Typed input is not thrown away by accident.** Cancel, Escape and a click outside all ask first
  when there is something to lose, through a [confirm dialog](/docs/kit/confirm-dialog), and the
  question can be answered with "keep editing".
- **The right record, every time.** The draft is reseeded from the record each time the dialog
  opens, so a dialog shared by "new" and "edit" never shows the last record's values. Focus lands
  on the first field, from the dialog primitive.
- **A dialog on a desktop and a drawer on a phone**, from [responsive dialog](/docs/kit/responsive-dialog),
  with the fields in its body so they are padded and scroll in both.

## Create and edit with one dialog

<Preview name="blocks/form-dialog/edit" />

The draft reads the record through a function, so pointing it at another record and opening the
dialog is all an edit takes. For "new", the record is the empty shape. `onsubmit` receives the
draft's data and follows the [action convention](/docs/conventions): a promise is waited on, `false`
or a throw keeps the dialog open.

## Import

```svelte
<script lang="ts">
	import FormDialog from '#lib/components/coral/blocks/form-dialog/form-dialog.svelte';
	import { Draft } from '#lib/components/coral/lib/draft.svelte.js';
</script>
```

## Props

Everything the responsive dialog root accepts stays available: `query`, `fallback`, `onOpenChange`.
On top of that:

| Prop                 | Type                       | Default                                           | Description                                    |
| -------------------- | -------------------------- | ------------------------------------------------- | ---------------------------------------------- |
| `draft`              | `Draft<T>`                 | -                                                 | The copy being edited. Required.               |
| `open`               | `boolean`                  | `false`                                           | Bindable.                                      |
| `title`              | `string`                   | -                                                 | The heading. Required.                         |
| `description`        | `string`                   | -                                                 | The line under it.                             |
| `onsubmit`           | `(value: T) => unknown`    | -                                                 | Saves. `false` or throw: stays open. Required. |
| `onerror`            | `(error: unknown) => void` | -                                                 | What `onsubmit` threw.                         |
| `oncancel`           | `() => void`               | -                                                 | The reader left without saving.                |
| `submitLabel`        | `string`                   | `Save`                                            | The button that saves.                         |
| `cancelLabel`        | `string`                   | `Cancel`                                          | The button that leaves.                        |
| `failedMessage`      | `string`                   | `Could not save. Check the fields and try again.` | Shown beside the fields on a refusal.          |
| `discardTitle`       | `string`                   | `Discard changes?`                                | The question before input is thrown away.      |
| `discardDescription` | `string`                   | `What you typed will be lost.`                    | The line under it.                             |
| `discardLabel`       | `string`                   | `Discard`                                         | Throws the input away.                         |
| `keepLabel`          | `string`                   | `Keep editing`                                    | Goes back to the fields.                       |
| `class`              | `string`                   | -                                                 | Merged onto the dialog content.                |

### Snippets

| Snippet    | Receives                                    | Replaces                              |
| ---------- | ------------------------------------------- | ------------------------------------- |
| `trigger`  | `{ props }`                                 | Nothing - the element that opens it.  |
| `children` | `{ draft, pending }`                        | Nothing - it is the fields. Required. |
| `footer`   | `{ draft, pending, dirty, submit, cancel }` | The cancel and submit buttons.        |

## Accessibility

The dialog and the drawer are the primitives', named by the title and described by the description,
with focus trapped and returned to the trigger. The corner close is left out on purpose: it would
bypass the question the footer's cancel asks. A failed submit is an `alert`, announced as it appears,
and focus moves to the first field with `aria-invalid="true"` or failing the browser's own
constraints, so a keyboard reader lands where the fixing starts. The submit button keeps focus while
it waits.
