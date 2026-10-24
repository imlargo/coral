---
title: Lightbox
description: Images and videos full screen, moved through by keyboard, touch or pointer, with the reader told where they are and returned to the thumbnail they left.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
</script>

Opening a screenshot or a recording full screen from a grid is a `Dialog` with an `<img>` in it,
written again for every gallery, and the hand-rolled version misses the same things each time: the
arrow keys and the swipe between items, an Escape that closes the viewer rather than the dialog
behind it, focus that goes back to the thumbnail, a position the reader can hear, the next picture
loaded before it is asked for, and a video that keeps playing after the reader has moved on.
shadcn's `carousel` scrolls a strip; it is not a viewer.

<Preview name="kit/lightbox/basic" />

## What Coral adds

- **A dialog around a carousel.** Escape closes the viewer and nothing else, focus is trapped
  inside it while it is open and returns to the thumbnail that opened it when it closes. The swipe,
  the drag and the buttons are the carousel primitive's.
- **The keyboard from anywhere.** The arrows, Home and End move between items wherever focus is in
  the viewer, not only while a button has it. In a right-to-left page they turn around.
- **"3 of 12", seen and heard.** The position is the dialog's description, shown under the slides,
  and announced on every move.
- **Loaded ahead.** The pictures beside the current one are fetched eagerly, so moving never shows an
  empty frame; the rest wait until they are near.
- **Media at its own size.** A portrait video in a landscape window and the reverse both fit the
  room they have, and a video stops the moment the reader moves away from it.

## Opening from a grid

The viewer has no trigger of its own: a gallery is the project's, and every thumbnail is a button
that sets `index` and `open`. Focus returns to whichever button that was.

<Preview name="kit/lightbox/videos" />

## Your own slides

<Preview name="kit/lightbox/custom" />

`items` is generic: `getMedia` says what the default slide reads from an item, and the `media`
snippet replaces the slide altogether while the moving, the position and the keyboard stay. `footer`
sits beside the position for a caption or an action on the current item.

## Import

```svelte
<script lang="ts">
	import Lightbox from '#lib/components/coral/kit/lightbox/lightbox.svelte';
	import type { LightboxMedia } from '#lib/components/coral/kit/lightbox/types.js';
</script>
```

## Props

Everything the shadcn dialog root accepts stays available: `onOpenChange`, `onOpenChangeComplete`.
On top of that:

| Prop            | Type                                  | Default        | Description                                            |
| --------------- | ------------------------------------- | -------------- | ------------------------------------------------------ |
| `items`         | `T[]`                                 | -              | The gallery, in order. Required.                       |
| `getMedia`      | `(item: T) => LightboxMedia`          | identity       | What the default slide reads from an item.             |
| `open`          | `boolean`                             | `false`        | Bindable.                                              |
| `index`         | `number`                              | `0`            | Bindable. Set it before opening.                       |
| `onindexchange` | `(index: number) => void`             | -              | The reader moved. Never when `index` is set from code. |
| `label`         | `string`                              | `Media viewer` | Names the dialog.                                      |
| `positionLabel` | `(position, total) => string`         | `{n} of {m}`   | Shown and announced.                                   |
| `previousLabel` | `string`                              | `Previous`     | Accessible label of the back control.                  |
| `nextLabel`     | `string`                              | `Next`         | Accessible label of the forward control.               |
| `class`         | `string`                              | -              | Merged onto the dialog content.                        |
| `media`         | `Snippet<[{ item, index, current }]>` | -              | Replaces a slide.                                      |
| `footer`        | `Snippet<[{ item, index, current }]>` | -              | Rendered beside the position.                          |

### LightboxMedia

| Field    | Type                 | Description                                     |
| -------- | -------------------- | ----------------------------------------------- |
| `kind`   | `'image' \| 'video'` | `image` unless said otherwise.                  |
| `src`    | `string`             | The file.                                       |
| `alt`    | `string`             | What an image shows; a video's accessible name. |
| `poster` | `string`             | A video's still frame.                          |

## Accessibility

The dialog is the primitive's: `role="dialog"`, `aria-modal`, named by `label` and described by the
position, with focus trapped inside and returned on close. Each slide is a `group` with the role
description `slide`, from the carousel. The previous and next controls are real buttons, disabled at
the ends, and every move is announced assertively, since it is something the reader just did.
Images carry their `alt`; a video carries `aria-label` and the browser's own controls.
