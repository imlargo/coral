---
title: Accessibility
description: What every Coral component does for keyboard and screen reader users, how it is tested, and what stays your job.
group: Concepts
---

Accessibility in Coral is behavior, the same as filtering or a pending state: something each
component does for you, tested in a real browser. The shadcn-svelte primitives, through bits-ui,
already supply most of the WAI-ARIA patterns. Coral fills the gaps that show up once those
primitives are composed into a real control, and each component page lists them under
Accessibility, with a Keyboard table of every key it handles.

## What every component agrees on

**Focus goes somewhere sensible.** After a pick, focus returns to the trigger, so the next Tab
continues through the form. A button that becomes busy keeps focus (it is `aria-disabled` with a
click guard, not `disabled`, which would drop focus to the page). When the control holding focus
leaves the page, such as a removed file or a cancel button that turned into retry,
`lib/keep-focus` moves it to the nearest row instead of the top of the document.

**Changes are spoken.** Copying, a row moving under the keyboard, results arriving, an upload
finishing: each is announced through one live region per component (`lib/live-region`), rendered
before there is anything to say, because a region added together with its text is one most screen
readers never read. `lib/announce` makes a repeated message heard again: a live region only speaks
when its text changes, so pressing Copy twice would otherwise be silence the second time.

**Empty and loading lists are still lists.** A listbox may own nothing but options, so while
nothing matches or results are loading, `lib/list-status` draws the message as an option nothing can
pick, inside the list, where the arrow keys still have somewhere to land. The words are announced
too. See it in the [combobox](/docs/kit/combobox#accessibility).

**Labels go where the reader is.** Controls whose trigger is a button (select, combobox, date
picker, color picker) take `id` and `aria-*` and put them on the trigger, so `<Label for>` and a
form library's attributes name the element that is focused. A component only supplies its own
`aria-label` when nothing else names the control.

**Escape undoes before it closes.** A field with something to undo (a search term, a rename, a
number being typed) takes the first Escape and stops it there. With nothing to undo it lets the key
through, so the dialog around it closes on the second.

**Motion is optional.** Movement that carries meaning checks `prefersReducedMotion` or Tailwind's
`motion-safe:`, and skips the animation when the reader asked for less.

**Words are props.** Every string a reader sees or hears has an English default and can be set per
call or once per project with [`setCoralDefaults`](/docs/conventions#project-wide-defaults), screen
reader text included.

## How it is tested

Every component's behavior is tested in a real browser (Chromium, through Vitest), next to its
source: keyboard paths, focus after each action, what lands in the live region. Every component
is also run through axe in `a11y.svelte.test.ts`, in its default state and in each state that
changes its markup, such as open, busy or empty. CI runs both on every change.

## What stays your job

- **Naming each control.** A `<Label for>`, an `aria-label` or an `aria-labelledby` per field;
  Coral puts it on the right element but cannot invent the words.
- **Contrast.** Coral draws with your theme's tokens, so contrast is decided by your theme. Check
  it when you change the theme, as you would for the rest of the app.
- **Page structure.** Headings, landmarks and the order of a form are the page's, not a
  component's.
- **Errors in your words.** A handler that fails hands what it threw to `onerror`; turning that
  into a message a reader understands, and putting it where they will find it, is yours.
