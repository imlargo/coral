---
title: Theming
description: Coral has no appearance of its own. It looks like your app because your shadcn theme styles it.
group: Getting started
---

<script lang="ts">
	import ThemeCss from '#lib/features/theme/ThemeCss.svelte';
</script>

There is nothing to theme in Coral. It writes no colors, radii, shadows or type sizes; it composes
shadcn-svelte primitives, which your theme already styles, and draws the few things no primitive
draws with your theme's tokens. Change the theme and every Coral component follows, with no
configuration of its own.

## Try it

Pick a base color, an accent and a radius. The whole site, every demo and every popover in it,
re-renders in that theme. The block beside the controls is the CSS a project pastes into its global
stylesheet to get the same result. The values are shadcn-svelte's own theme presets.

<ThemeCss />

The same controls sit behind the palette button in the navbar, and the choice is remembered on
this device.

## Where the appearance comes from

**The primitives.** A combobox is a shadcn `popover`, `command`, `button` and `badge`. Their
appearance is the one shadcn-svelte installed in your project, in your style, and Coral never edits
those files. A Coral component that needs another look takes it from the primitive's own
`variant`, the same way your code would.

**Your tokens.** State no primitive draws is drawn with the theme's semantic tokens, never a literal
value:

| What                                          | Tokens                                                |
| --------------------------------------------- | ----------------------------------------------------- |
| Focus rings on controls Coral renders itself  | `ring`, through `lib/focus`                           |
| The section being read in a table of contents | `primary` for the marker, `foreground` for the text   |
| A file input while a file is dragged over it  | `accent` and `ring`                                   |
| Activity calendar, gauge and rating fills     | `primary` and `muted`, overridable with `color` props |
| Secondary text, counts and hints              | `muted-foreground`                                    |
| Corners on the shapes Coral draws itself      | the theme's radius scale (`rounded-sm`, `rounded-md`) |

**Layout utilities.** `flex`, `gap-*`, `w-full`, `min-w-0`: how parts sit next to each other, which
is behavior, not appearance.

## Changing one component

Every component accepts `class`, merged with `cn`, so a layout or spacing change never needs a
wrapper element. Components with several parts take one class prop per part (`contentClass`,
`listClass`, `groupClass`); each page lists them under Props.

For a change in how something looks everywhere, change the token, not the component. For a change
in one place, pass a class. For a change in what the component renders, use its snippets or its
pieces, which each page describes under Customizing.

## Dark mode

Coral has no dark styles to maintain. Your theme's `.dark` block redefines the tokens, and
everything drawn from them follows. This site uses `mode-watcher` to toggle the class, as
shadcn-svelte recommends.

## Motion

Coral animates only what a primitive already animates (a popover opening, a drawer sliding) and a
few movements that carry meaning, such as a gauge filling to its value or a list scrolling to keep
up with new output. Each one is skipped when the reader asked for reduced motion: through
`prefersReducedMotion` from `svelte/motion` in script, or Tailwind's `motion-safe:` in markup.
