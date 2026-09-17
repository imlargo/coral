---
title: Stepper
description: Multi-step flows with validation that waits, steps that cannot be skipped, and focus that follows.
---

<script lang="ts">
	import Preview from '$lib/docs/preview.svelte';
</script>

A wizard is a `currentStep` number until it has to validate. Then Next needs to wait on a request
and stay put when it fails, the step list has to refuse a jump past a step nobody filled in, and after
Next the focus is on a button that may no longer exist - the page body, for a keyboard user.

<Preview name="kit/stepper/basic" />

## What Coral adds

- **Validation that waits.** `onbeforenext` runs on Next with the step being left. Return a promise
  and the stepper waits; return `false` or throw and it stays. The Next button reports it is busy and
  keeps focus.
- **Linear by completion.** A step can be jumped to once every step before it is complete. After
  going back to fix step 1, step 4 is still one click away.
- **Focus follows.** After Next or Previous, focus moves to the new panel, which is named by its step -
  so a screen reader says where the reader landed. Only when focus was inside the stepper.
- **`aria-current="step"`** on the current step, and an ordered list, so position is announced for free.
- **Arrow keys** between steps, on top of Tab. Right-to-left aware.

## Validation

<Preview name="kit/stepper/validation" />

Next on the last step runs `onbeforenext`, then `onfinish`, under the same `false` convention.

Steps are whatever you pass - strings, ids, the step objects themselves - compared with `===`. Prefer
ids when binding `value`: an object assigned into a `$state` comes back wrapped in a proxy, which is
no longer `===` to the object in `steps`. Bind to `$state.raw` if the steps must be objects.

## Composition

```text
Stepper
├── StepperList
│   └── StepperItem ×n       → button, children({ state, index, disabled })
├── StepperContent ×n        → shown for its step
├── StepperPrevious
└── StepperNext              → children({ isLast, pending })
```

`Stepper`'s own `children` snippet receives the shared state - `value`, `next()`, `goTo()`,
`stateOf()` - for a layout the pieces do not cover.

## One form across steps

`StepperContent` unmounts the panels that are not showing, and an unmounted field is not submitted.
When every step's fields post in a single `<form>`, set `keepMounted`: inactive panels stay in the page
with `hidden`. Validate each step in `onbeforenext` - the browser cannot focus a `required` field
inside a hidden panel to report it.

## Installation

```bash
pnpm dlx shadcn-svelte@latest add button spinner
```

```svelte
<script lang="ts">
	import Stepper from '$lib/coral/kit/stepper/stepper.svelte';
	import StepperItem from '$lib/coral/kit/stepper/stepper-item.svelte';
	// ...one import per piece you use
</script>
```

## Props

### Stepper

| Prop            | Type                           | Default      | Description                              |
| --------------- | ------------------------------ | ------------ | ---------------------------------------- |
| `steps`         | `T[]`                          | -            | Every step, in order. Required.          |
| `value`         | `T`                            | first step   | Bindable.                                |
| `completed`     | `T[]`                          | `[]`         | Bindable. Steps finished with Next.      |
| `linear`        | `boolean`                      | `true`       | Refuses jumping past an incomplete step. |
| `onbeforenext`  | `(step: T) => unknown`         | -            | Async-aware. `false` or throw stays.     |
| `onfinish`      | `() => unknown`                | -            | Next on the last step.                   |
| `onvaluechange` | `(step: T) => void`            | -            | The current step changed.                |
| `orientation`   | `'horizontal' \| 'vertical'`   | `horizontal` | Arrow keys and layout direction.         |
| `children`      | `Snippet<[StepperContext<T>]>` | -            | The pieces, with the shared state.       |

### StepperItem

| Prop        | Type                                    | Description                    |
| ----------- | --------------------------------------- | ------------------------------ |
| `step`      | `T`                                     | Which step. Required.          |
| `itemClass` | `string`                                | Merged onto the `<li>`.        |
| `children`  | `Snippet<[{ state, index, disabled }]>` | What the step shows. Required. |

`state` is `complete`, `current` or `upcoming`, also exposed as `data-state` for styling.

### StepperContent

| Prop          | Type      | Default | Description                                  |
| ------------- | --------- | ------- | -------------------------------------------- |
| `step`        | `T`       | -       | Which step. Required.                        |
| `keepMounted` | `boolean` | `false` | Keeps inactive panels in the page, `hidden`. |

`StepperPrevious` and `StepperNext` accept the shadcn button's props.
