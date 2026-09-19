---
title: Show more
description: Clamps long content to a few lines, and only offers to expand what actually overflows.
---

<script lang="ts">
	import Preview from '$lib/docs/preview.svelte';
</script>

A description, an incident note, release notes: clamp it with `line-clamp-3` and add a "Show more"
button, and the button shows up under text that already fits, the clamp does nothing to a paragraph
followed by a list, and tabbing onto a link inside the hidden part puts focus somewhere nobody can
see.

<Preview name="kit/show-more/basic" />

## What Coral adds

- **A toggle only when there is more.** Overflow is measured, and re-measured as the width or the
  content changes. Short content gets no button.
- **Any markup.** Clipped by height in `lh` units - the content's own line height - so paragraphs,
  lists and inline elements are cut alike. `line-clamp` only counts one run of inline text.
- **Focus never lands out of sight.** Tabbing onto a link in the clipped part expands the content.
- **Collapsing keeps your place.** If the top of a long block has scrolled away, collapsing brings it
  back into view instead of leaving the reader somewhere below where the content now ends.
- **Wired up.** The toggle carries `aria-expanded` and `aria-controls`.

## Rich content, custom toggle

<Preview name="kit/show-more/rich" />

The `toggle` snippet receives `props` to spread onto your own button - they carry the ARIA wiring and
the click handler - plus `expanded` and `toggle`.

## Installation

```bash
pnpm dlx shadcn-svelte@latest add button
```

```svelte
<script lang="ts">
	import ShowMore from '$lib/coral/kit/show-more/show-more.svelte';
</script>
```

## Props

Everything a `<div>` accepts stays available on the root. On top of that:

| Prop               | Type                                     | Default     | Description                     |
| ------------------ | ---------------------------------------- | ----------- | ------------------------------- |
| `lines`            | `number`                                 | `3`         | Lines shown while collapsed.    |
| `expanded`         | `boolean`                                | `false`     | Bindable.                       |
| `onexpandedchange` | `(expanded: boolean) => void`            | -           | The reader toggled it.          |
| `moreLabel`        | `string`                                 | `Show more` | Default toggle, collapsed.      |
| `lessLabel`        | `string`                                 | `Show less` | Default toggle, expanded.       |
| `class`            | `string`                                 | -           | Merged onto the root.           |
| `contentClass`     | `string`                                 | -           | Merged onto the clipped region. |
| `children`         | `Snippet`                                | -           | The content. Required.          |
| `toggle`           | `Snippet<[{ props, expanded, toggle }]>` | -           | Replaces the toggle.            |

## Accessibility

Clipped content is still in the accessibility tree, so a screen reader reads all of it - clamping is
a visual convenience, not a way to hide text. That is also why the button's label does not need to
describe what is hidden.

A height cut can slice an image in half at the boundary. That is the trade for clamping any markup,
and the right one for text; for a gallery, show a count of items instead.
