---
title: Stepper
description: Multi-step flows with validation that waits, steps that cannot be skipped, and focus that follows.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import validationDemo from './demos/validation.svelte?demo';
</script>

A wizard is a `currentStep` number until it has to validate. Then Next needs to wait on a request
and stay put when it fails, the step list has to refuse a jump past a step nobody filled in, and after
Next the focus is on a button that may no longer exist. For a keyboard user, that's the page body.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- A flow is split into steps that depend on each other: create a project, connect a repository,
  pick an environment, invite team members.
- A step has to be validated, possibly against a server, before the next one opens.
- The reader may go back to fix an earlier step without losing the ones already finished.

**Reach for something else when**

- The sections are independent and can be filled in any order: shadcn `Tabs`.
- The steps are a record of what already happened, not a flow to complete:
  [Timeline](/docs/kit/timeline).
- The form is short enough for one screen: a plain form, or a
  [Responsive dialog](/docs/kit/responsive-dialog) around one.

## Usage

```svelte
<script lang="ts">
	import Stepper from '#lib/components/coral/kit/stepper/stepper.svelte';
	import StepperContent from '#lib/components/coral/kit/stepper/stepper-content.svelte';
	import StepperItem from '#lib/components/coral/kit/stepper/stepper-item.svelte';
	import StepperList from '#lib/components/coral/kit/stepper/stepper-list.svelte';
	import StepperNext from '#lib/components/coral/kit/stepper/stepper-next.svelte';
	import StepperPrevious from '#lib/components/coral/kit/stepper/stepper-previous.svelte';

	const steps = ['Repository', 'Build', 'Deploy'];
</script>

<Stepper {steps} onfinish={() => console.log('Deployment queued')}>
	<StepperList aria-label="Deployment steps">
		{#each steps as step (step)}
			<StepperItem {step}>
				{#snippet children({ index })}{index + 1}. {step}{/snippet}
			</StepperItem>
		{/each}
	</StepperList>

	{#each steps as step (step)}
		<StepperContent {step}>Settings for the {step} step.</StepperContent>
	{/each}

	<StepperPrevious />
	<StepperNext />
</Stepper>
```

## Examples

### Validation

<Preview demo={validationDemo} />

`onbeforenext` runs on Next with the step being left. Return a promise and the stepper waits;
return `false` or throw and it stays. The Next button reports it is busy and keeps focus, and
Previous and the step list are blocked until the promise settles.

Next on the last step runs `onbeforenext`, then `onfinish`, under the same `false` convention.

Steps are whatever you pass (strings, ids, the step objects themselves), compared with `===`. Prefer
ids when binding `value`: an object assigned into a `$state` comes back wrapped in a proxy, which is
no longer `===` to the object in `steps`. Bind to `$state.raw` if the steps must be objects.

### Jumping between steps

With `linear`, the default, a step can be jumped to once every step before it is complete. After
going back to fix step 1, step 4 is still one click away. A step that cannot be visited yet renders
its button `disabled`, and `StepperItem`'s `children` receives `disabled` to draw it. Set
`linear={false}` to let any step be picked at any time.

### When validation fails

What `onbeforenext` or `onfinish` throws goes to `onerror`, and the stepper stays on the step it was
on. Without `onerror` it is an unhandled rejection. `completed` is bindable, so a saved draft can
restore how far someone got.

### One form across steps

`StepperContent` unmounts the panels that are not showing, and an unmounted field is not submitted.
When every step's fields post in a single `<form>`, set `keepMounted`: inactive panels stay in the page
with `hidden`. Validate each step in `onbeforenext`: the browser cannot focus a `required` field
inside a hidden panel to report it.

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
| `onerror`       | `(error: unknown) => void`     | -            | What `onbeforenext` or `onfinish` threw. |
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

### StepperPrevious

| Prop       | Type      | Default    | Description                                |
| ---------- | --------- | ---------- | ------------------------------------------ |
| `label`    | `string`  | `Previous` | The label, when the children are left out. |
| `children` | `Snippet` | -          | Replaces the label.                        |

### StepperNext

| Prop          | Type                             | Default  | Description                                        |
| ------------- | -------------------------------- | -------- | -------------------------------------------------- |
| `nextLabel`   | `string`                         | `Next`   | The label on every step but the last.              |
| `finishLabel` | `string`                         | `Finish` | The label on the last step.                        |
| `children`    | `Snippet<[{ isLast, pending }]>` | -        | Replaces the label. Receives where the stepper is. |

Both accept the shadcn button's props as well.

## Keyboard

`Tab` reaches the step buttons that can be visited, then the panel's own fields, then Previous and
Next. With focus on a step button, inside `StepperList`:

| Key               | Action                                                                  |
| ----------------- | ----------------------------------------------------------------------- |
| `←` / `→`         | Moves to the previous or next step button. Horizontal orientation only. |
| `↑` / `↓`         | Moves to the previous or next step button. Vertical orientation only.   |
| `Home` / `End`    | Moves to the first or last step button that can be visited.             |
| `Enter` / `Space` | Goes to the focused step, when it can be visited.                       |

The arrows skip disabled steps and stop at either end. In a right-to-left horizontal stepper, `←`
and `→` swap. Previous and Next are native buttons, pressed with `Enter` or `Space`.

## Accessibility

- **Position is announced.** The steps are an ordered list, and the current step's button carries
  `aria-current="step"` and `aria-controls` pointing at its panel.
- **Focus follows.** After Next or Previous, focus moves to the new panel, which is a `region` named
  by its step's button, so a screen reader says where the reader landed. It only moves when focus
  was inside the stepper, and the panel is focusable from code alone (`tabindex="-1"`), adding no
  tab stop.
- **Busy without losing focus.** While `onbeforenext` or `onfinish` runs, Next is marked
  `aria-busy` and `aria-disabled` rather than `disabled`, so it keeps focus, and the stepper root
  carries `aria-busy`.
- **Name the list.** `StepperList` renders the `<ol>` and forwards its attributes: give it an
  `aria-label`, as the usage above does.

## Customizing

- **Class props.** Every piece takes `class`, merged onto its own element: the root `<div>`, the
  `<ol>`, each step's `<button>`, each panel, and the two shadcn `Button`s. `StepperItem`'s
  `itemClass` lands on its `<li>`. Steps and panels expose `data-state` (`complete`, `current`,
  `upcoming`) for styling.
- **Project-wide defaults.** `nextLabel`, `finishLabel` and `previousLabel` (the Previous button's
  `label`) can be stated once under `'kit/stepper'` with `setCoralDefaults`: see
  [Project-wide defaults](/docs/conventions#project-wide-defaults).

### Composition

```text
Stepper
├── StepperList
│   └── StepperItem ×n       → button, children({ state, index, disabled })
├── StepperContent ×n        → shown for its step
├── StepperPrevious
└── StepperNext              → children({ isLast, pending })
```

`Stepper`'s own `children` snippet receives the shared state (`value`, `next()`, `goTo()`,
`stateOf()`) for a layout the pieces do not cover.

`steps.ts` exports the rules on their own: `stateOf`, `canVisit`, `adjacent` and `complete`.
Dropping to raw markup means rebuilding the waiting Next, the completion rule for jumps, focus
moving to the new panel, and the arrow keys between steps.
