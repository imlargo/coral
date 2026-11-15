---
title: Shortcut
description: Draws a keyboard shortcut the way the reader's platform prints it, and binds it.
group: Kit
category: Actions and overlays
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import platformsDemo from './demos/platforms.svelte?demo';
	import inButtonDemo from './demos/in-button.svelte?demo';
	import activateDemo from './demos/activate.svelte?demo';
</script>

`<Kbd>⌘</Kbd><Kbd>K</Kbd>` is right for half the readers, and the `keydown` listener next to it usually
checks `metaKey`, so on Windows the hint is wrong and the shortcut does not work. Pressing `/` to
search fires while someone is typing a slash into a field, and a combo checked with `includes` also
fires on every combo that contains it.

<Preview demo={basicDemo} />

## What Coral adds

- **`mod` means the right key.** Command on a Mac, Control everywhere else; drawn and matched alike.
- **Drawn by platform convention.** `⌃⌥⇧⌘` in Apple's order on a Mac, `Ctrl Alt Shift` elsewhere.
- **Read out by name.** Symbols are hidden from screen readers and named instead: `⌘` is otherwise
  read as "place of interest sign".
- **Exact matching:** `mod+k` does not fire on `mod+shift+k`.
- **Layout-aware.** Keys are matched by the character typed, so `ctrl+z` is the key labelled Z on an
  AZERTY keyboard; the physical key is only consulted when Option has turned `k` into `˚`.
- **Stays out of fields.** A plain key such as `s` or `?` does not fire while the reader is typing;
  combos with Control, Command or Alt do. Key repeat and IME composition are ignored.
- **Quiet behind a modal.** While a dialog it is not part of is open, the shortcut neither fires nor
  takes the key from the browser: the page behind a modal is out of reach of the pointer and Tab,
  and a key should not reach it either.

## Platforms

<Preview demo={platformsDemo} />

The platform is detected in the browser after mount. The server cannot know it, so it renders the
non-Mac version and a Mac corrects it on hydration: one repaint, and no hydration mismatch. When the
server does know, from the user-agent, pass `platform` and there is nothing to correct.

## Plain keys

<Preview demo={inButtonDemo} />

A shortcut something closer to the focus already handled (its `keydown` called `preventDefault`) is
left alone. This site's own search takes `mod+k` and `/`, which is why these demos use other keys.

Put `aria-keyshortcuts` on the control the shortcut activates, so assistive tech announces it there.
`ariaKeyshortcuts()` in `keys.ts` produces the attribute's syntax from a combo.

## On the control it presses

<Preview demo={activateDemo} />

`activate` binds the combo to the button or link the keys are drawn in: pressing it clicks that
control, so the handler is written once, on the button. `onpress`, if given, runs first. While the
control is disabled the shortcut does nothing and leaves the key to the browser.

```svelte
<Button onclick={save}>
	Save <Shortcut keys="mod+s" activate />
</Button>
```

## Without drawing anything

`listen` is exported on its own and returns its cleanup, which is the shape an `$effect` wants:

```svelte
<script lang="ts">
	import { listen } from '#lib/components/coral/kit/shortcut/listen.js';

	let open = $state(false);

	$effect(() => listen('mod+k', () => (open = true)));
</script>
```

## Import

```svelte
<script lang="ts">
	import Shortcut from '#lib/components/coral/kit/shortcut/shortcut.svelte';
</script>
```

## Props

Everything the shadcn kbd group accepts stays available: `class`, `aria-*`, `ref`. On top of that:

| Prop             | Type                             | Default         | Description                                   |
| ---------------- | -------------------------------- | --------------- | --------------------------------------------- |
| `keys`           | `string`                         | -               | The combo, as `mod+shift+k`. Required.        |
| `onpress`        | `(event: KeyboardEvent) => void` | -               | Binds the combo. Omit to only draw it.        |
| `activate`       | `boolean`                        | `false`         | Clicks the button or link it is drawn in.     |
| `enabled`        | `boolean`                        | `true`          | Stops listening without unmounting.           |
| `allowInFields`  | `boolean`                        | with a modifier | Whether it fires while typing in a field.     |
| `preventDefault` | `boolean`                        | `true`          | Stops the browser's own action for the combo. |
| `platform`       | `'mac' \| 'other'`               | detected        | Forces a platform's conventions.              |
| `key`            | `Snippet<[{ symbol, name }]>`    | -               | Replaces how each key is drawn.               |

Understood aliases: `cmd`, `command`, `ctrl`, `control`, `opt`, `option`, `alt`, `shift`, `esc`,
`return`, `del`, `up`, `down`, `left`, `right`, `space`, `plus`.
