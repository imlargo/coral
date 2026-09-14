---
title: Avatar
description: A person's image with an initials fallback, wired in one line.
---

<script lang="ts">
	import Preview from '$lib/docs/preview.svelte';
</script>

Raw shadcn asks for three components and a hand-written fallback every single time:

```svelte
<Avatar>
	<AvatarImage src={user.photo} alt={user.name} />
	<AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
</Avatar>
```

That last line is the problem. It is rewritten in every project, and it is wrong in most of them -
`slice(0, 2)` on `María del Carmen García` gives `MA`, not `MG`.

<Preview name="kit/avatar/basic" />

## Why flat props

Avatar has a defensible canonical case: a person, maybe a photo, initials when there is no photo.
The parts do not vary independently, so composition would be ceremony. This is the shape the
[conventions](/docs/conventions) call for - flat props, and the pieces still reachable when the
rare case shows up.

## Installation

```bash
pnpm dlx shadcn-svelte@latest add avatar
```

```svelte
<script lang="ts">
	import Avatar from '$lib/coral/kit/avatar/avatar.svelte';
</script>
```

## Props

Everything the shadcn root accepts stays available - `size`, `class`, `delayMs`, `loadingStatus`,
`ref` and any `div` attribute. On top of that:

| Prop       | Type                  | Default | Description                                                         |
| ---------- | --------------------- | ------- | ------------------------------------------------------------------- |
| `src`      | `string`              | -       | Image URL. Absent or failed to load, the fallback shows instead.    |
| `alt`      | `string`              | `name`  | Alt text for the image. Falls back to `''`, i.e. decorative.        |
| `name`     | `string`              | -       | Person's name. Derives the initials and acts as the default `alt`.  |
| `fallback` | `string` \| `Snippet` | -       | Replaces the derived initials. Text, or a snippet for full control. |
| `children` | `Snippet`             | -       | Extra content inside the root, alongside the image - e.g. a badge.  |

## Fallback

The fallback is shown when there is no `src`, and when the image fails to load. Initials come
from `name`: first letter of the first word, plus first letter of the last word when there is more
than one. Single-word names give a single letter.

An empty or missing `name` produces an empty string rather than a placeholder - the caller decides
what an unknown person looks like, and gets an empty circle until it says so.

<Preview name="kit/avatar/fallback" />

## Accessibility

An avatar is called the same thing whether or not the photo loads. `name` becomes the image's
`alt`, and - when the fallback is showing instead - a visually hidden label, so a screen reader
reads _María del Carmen García_ rather than the letters _M G_.

Only one of the two is ever in the accessibility tree: the fallback is `display: none` while the
image is showing, so the name is never announced twice.

| Given                     | A screen reader reads | On screen |
| ------------------------- | --------------------- | --------- |
| `name`                    | the name              | initials  |
| `name` + a broken `src`   | the name              | initials  |
| `name` + a working `src`  | the name (via `alt`)  | the photo |
| `name` + `alt=""`         | nothing               | initials  |
| `fallback` with no `name` | the fallback text     | that text |
| nothing                   | nothing               | empty     |

`alt=""` means here what it means everywhere else: this avatar is decorative, the name is already
in the text next to it. Use it in a table row or a list item that already names the person, and the
same name will not be read twice.

## Sizes

`size` is forwarded straight to the shadcn root. Coral adds nothing here, and removes nothing.

<Preview name="kit/avatar/sizes" />

## Custom fallback

When initials are not the right answer - an unauthenticated user, a machine account - pass a
snippet instead of a string.

<Preview name="kit/avatar/custom-fallback" />

## Escaping the flat API

The pieces stay reachable. `children` renders inside the root, next to the image, so anything the
primitive supports still works without dropping Coral.

<Preview name="kit/avatar/badge" />

The same goes for grouping: `AvatarGroup` comes from shadcn and Coral avatars sit inside it
unchanged.

<Preview name="kit/avatar/group" />

## initials()

The derivation lives in `kit/avatar/initials.ts` and is exported on its own, so a project that
needs the same initials somewhere else - a mention chip, an export, a PDF - does not re-implement
it.

```ts
import { initials } from '$lib/coral/kit/avatar/initials.js';

initials('María del Carmen García'); // 'MG'
initials('Juan'); // 'J'
initials('   '); // ''
initials(undefined); // ''
```

It stays inside the component's folder rather than in `lib/` because it has exactly one consumer
in Coral today. It moves the day a second component needs it.
