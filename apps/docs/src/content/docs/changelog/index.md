---
title: Changelog
description: What changed in each component, version by version, newest first.
group: Getting started
---

<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.js';
</script>

Every component carries its own version, in the header of each of its files and in `coral.json`,
so there is no single Coral release to read about. Find the `@version` your copy reports, then read
the entries for that component above it: they are what [updating](/docs/installation#updating)
brings in.

Entries are grouped by the day they landed. A breaking change is marked as one and says how to
migrate.

## 2026-10-30

- `kit/combobox` 1.3.0: New `oncreate` adds a row that creates an option from the search term when
  no option is already labelled that. Return the new option, added to `options`, and it is selected;
  return `false` or throw and nothing is. `createLabel` words the row and `onerror` receives what
  was thrown.
- `kit/combobox` 1.2.0: New `anchor` lines the list up with any element and takes its width, for a
  trigger that is one part of a wider control. New `selection` snippet replaces what the trigger
  prints for the selection, keeping the placeholder, the chevron and the clear control.
- `kit/tags-input` 1.2.0: New `suggestions` are offered while typing, picked with the arrow keys
  and Enter or with a click; anything else typed is still a tag of its own. `suggestionsLabel`
  names the list and can come from project defaults.
- `kit/number-input` 1.2.0: New `format` takes `Intl.NumberFormatOptions` and writes the value as a
  currency, a percent or a unit, and reads it back with or without the symbols typed. With
  `percent` the value is the fraction: `0.15` shows as `15%`.
- `kit/phone-input` 1.0.0: new. A phone number formatted as it is typed, with a searchable country
  picker, bound as the E.164 a server stores.
- `kit/country-select` 1.0.0: new. Every country, named and sorted in the reader's language, and
  found by its English name or its code.
- `lib/number` 1.2.0: `parse` takes a `style` and reads past the currency, percent or unit symbols
  it writes.
- `lib/number-field` 1.2.0: Passes a number input's `format` through to reading and writing the
  value.
- `lib/intl` 1.1.0: Builds `Intl.DisplayNames` once per locale and options, like the other
  formatters.

## 2026-10-24

Projects can now set Coral's locale and copy in one place: call `setCoralDefaults` once, in the root
layout or in any subtree, and every component under it reads the shared `locale` plus the props it
lets a project set, keyed by its name (`'kit/select'`) (#10). A prop passed where the component is
used still wins, and a component outside `setCoralDefaults` keeps its English defaults. Defaults are
read when a component is created, so changing them later needs a re-render: key the subtree on the
locale. Each line below says which props a component takes from defaults.

- `kit/breadcrumbs` 1.0.0: new. A breadcrumb trail that stays on one line by folding its middle
  pages into a dropdown menu. The first page and the current page are never folded. Takes
  `foldedLabel` from project defaults (#31).
- `kit/timeline` 1.0.0: new. Events grouped under day headings in the reader's time zone, or a fixed
  `timeZone`, with "Today" and "Yesterday" and a time on every event. Loads older events with
  `hasMore`, `onloadmore` and `onerror`, and announces how many were added. Takes `timeZone`,
  `dayFormat`, `timeFormat`, `loadMoreLabel`, `loadedMessage` and `emptyMessage` from project
  defaults (#30).
- `kit/lightbox` 1.0.0: new. A full-screen viewer for images and videos over the dialog and carousel
  primitives, moved with the keyboard, touch or buttons. It says the current position aloud,
  returns focus to the thumbnail on close and binds the current item through `index`. Takes
  `label`, `positionLabel`, `previousLabel` and `nextLabel` from project defaults (#32).
- `kit/file-upload` 1.0.0: new. An uploader over `kit/file-input` that sends files through your own
  `upload` handler a few at a time (`concurrency`), with real progress, cancel and retry per file,
  and a tally when the batch ends (`onsettle`). The handler gets an abort signal and a progress
  callback; Coral never fetches. Takes `concurrency` and its labels and messages from project
  defaults (#36).
- `kit/combobox` 1.1.0: Keeps a selected option's label on the trigger after a server search returns
  results without it. New `align` puts the list against the trigger's end. While `loading`, the
  results already listed stay usable with a loading row under them, and the loading and empty
  states are read aloud; new `loadingMessage`. Takes `placeholder`, `searchPlaceholder`,
  `emptyMessage`, `loadingMessage`, `clearLabel` and `searchDebounce` from project defaults
  (#19, #20).
- `kit/command-palette` 1.1.0: While a server search runs, the known actions stay visible and
  runnable, with a loading row under them instead of an empty list. New `shouldFilter` turns local
  filtering back on for a palette that mixes local actions with remote results; new
  `loadingMessage`. Loading and empty states are read aloud. Takes `placeholder`, `emptyMessage`,
  `loadingMessage`, `recentLabel` and `searchDebounce` from project defaults (#24).
- `kit/select` 1.1.0: New `loading`, `loadingMessage` and `emptyMessage`. While `loading`, a loading
  row appears under the options, and an empty list says so instead of opening onto nothing, both
  read aloud. Takes `placeholder` and `clearLabel` from project defaults (#25).
- `kit/number-input` 1.1.0: **Breaking:** The input is a text input with the `spinbutton` role
  rather than `type="number"`, so `valueAsNumber` through `ref` and `input[type=number]` selectors
  no longer apply. New `locale`: decimals are typed and shown the way
  it writes them, so `1,5` works in `de-DE`. New `largeStep` (ten times `step` by default) for Page
  Up, Page Down and Shift with an arrow; Home and End jump to the bounds and Escape undoes an
  unfinished edit. Takes `decrementLabel`, `incrementLabel` and `locale` from project defaults
  (#11).
- `kit/scrub-input` 1.1.0: **Breaking:** The input is a text input with the `spinbutton` role, as
  in number input. New `locale`, read and written the same
  way. Takes `locale` from project defaults (#11).
- `kit/confirm-dialog` 1.1.0: New `confirmDisabled` keeps the confirm button off until the body is
  complete, such as a reason given or a name typed; cancel always works. Takes `confirmLabel` and
  `cancelLabel` from project defaults (#23).
- `kit/responsive-dialog` 1.1.0: New `ResponsiveDialogBody` pads the content in drawer mode and
  scrolls while the header and footer stay in place, in both modes. The dialog's height is capped
  at the viewport. Takes `query` from project defaults (#22).
- `kit/tree-view` 1.1.0: Padding in `rowClass` no longer removes the indent. New `actions` snippet
  puts controls at the end of each row: Tab from a row moves into them, Shift+Tab and Escape move
  back, the tree stays one tab stop, and clicking an action does not select the row. Takes
  `toggleLabel` and `locale` from project defaults (#21).
- `kit/file-input` 1.2.0: Takes `label` and `removeLabel` from project defaults.
- `kit/action-button` 1.1.0: Takes `pendingLabel` from project defaults.
- `kit/activity-calendar` 1.1.0: Takes `weekStart`, `label` and `locale` from project defaults.
- `kit/avatar-stack` 1.1.0: Takes `overflowLabel` from project defaults.
- `kit/copy-button` 1.1.0: Takes `label`, `copiedLabel`, `failedLabel` and `timeout` from project
  defaults.
- `kit/date-picker` 1.1.0: Takes `placeholder`, `clearLabel`, `format` and `locale` from project
  defaults.
- `kit/follow-scroll` 1.1.0: Takes `jumpLabel`, `unreadLabel` and `threshold` from project defaults.
- `kit/inline-edit` 1.1.0: Takes `editLabel` from project defaults.
- `kit/password-input` 1.1.0: Takes `toggleLabel` and `capsLockLabel` from project defaults.
- `kit/rating-group` 1.1.0: Takes `label` and `locale` from project defaults.
- `kit/relative-time` 1.1.0: Takes `numeric`, `format`, `precision`, `cutoff`, `titleFormat` and
  `locale` from project defaults.
- `kit/reorder-list` 1.1.0: Takes `handleLabel`, `instructions`, `grabbed`, `moved`, `dropped` and
  `cancelled` from project defaults.
- `kit/search-input` 1.1.0: Takes `clearLabel` and `searchDebounce` from project defaults.
- `kit/show-more` 1.1.0: Takes `moreLabel` and `lessLabel` from project defaults.
- `kit/stepper` 1.1.0: Takes `nextLabel`, `finishLabel` and `label` (the previous button's) from
  project defaults.
- `kit/tags-input` 1.1.0: Takes `clearLabel`, `removeLabel` and `delimiter` from project defaults.
- `kit/textarea` 1.1.0: Takes `remainingLabel` from project defaults.
- `kit/toc` 1.1.0: Takes `label` from project defaults.
- `lib/defaults` 1.0.0: new. `setCoralDefaults` and `getCoralDefaults`, plus a global
  `CoralDefaults` type that grows one entry for each installed component that declares defaults
  (#10).
- `lib/list-status` 1.0.0: new. The row a select, combobox or palette shows while its list has
  nothing to pick: an option nothing can select, saying the results are loading or nothing matched.
- `lib/number` 1.1.0: **Breaking:** `parse` takes an options object and reads the text in a locale.
  Change `parse(text, min, max, decimals)` to `parse(text, { min, max, decimals, locale })`. Adds
  `format`, which writes a number in a locale without thousands separators, and `separators` (#11).
- `lib/number-field` 1.1.0: **Breaking:** the config needs `step`, `largeStep` and `locale`. It
  returns `text`, `amount` and `keydown` and no longer `wheel`: drop `onwheel={field.wheel}` and
  wire `onkeydown` to `field.keydown`. The shared class no longer hides the browser's spinner arrows
  (#11).

## 2026-10-23

- `kit/activity-calendar` 1.0.1: The tooltip lines up with the hovered or focused square inside a
  CSS-scaled container, such as a dialog animating in. Before, it drifted.
- `kit/avatar` 1.0.1: Initials take the first character as a reader sees it. An accent typed as a
  separate mark stays on its letter, and multi-part emoji such as `👩🏽‍💻` or flags stay whole.
- `kit/combobox` 1.0.1: The search term is cleared after the popover finishes its closing
  animation, so the list no longer refills while it fades out. An `onOpenChangeComplete` you pass
  runs after Coral's own.
- `kit/command-palette` 1.0.1: The search term is cleared once the dialog finishes closing, however
  it was closed. An `onOpenChangeComplete` you pass runs after Coral's own.
- `kit/show-more` 1.0.1: Tabbing into hidden content expands the region inside a CSS-scaled
  container too. Before, the measurement could be wrong there and the content stayed clipped.
- `lib/scale` 1.0.0: new. How much a CSS transform enlarges or shrinks an element, so measurements
  stay correct inside scaled containers.
- `kit/data-table`: removed. An installed copy keeps working but gets no further updates.
- `lib/table`: removed. It goes with `kit/data-table`, its only consumer.
- `kit/page-state`: removed. An installed copy keeps working but gets no further updates.
- `lib/on-close`: removed. `kit/combobox` and `kit/command-palette` use the popover's
  `onOpenChangeComplete` instead; code of your own that imported it can do the same.

## 2026-09-28

**Every version restarted at 1.0.0**, whatever number it had before: `kit/combobox` 5.0.1,
`kit/select` 2.1.0 and `kit/number-input` 2.0.0 all became 1.0.0. A copy reporting a higher number
from before this date is older than 1.0.0, not newer, and the entries below this one use those old
numbers. Across the board:

- Controls whose trigger is a button (combobox, select, date picker) put `id`, `aria-label`,
  `aria-labelledby`, `aria-describedby` and `aria-invalid` on the trigger, so a `<Label for>`, a
  field's hint and error, and a validator's invalid flag reach the element a screen reader
  announces.
- Components that run a handler that can fail take an error callback, so a failure is reported
  instead of becoming an unhandled rejection.
- Every control Coral draws itself shares one keyboard-only focus ring in the theme's `ring` color.
- Dates, numbers and text comparison use formatters built once per locale instead of on every
  render.
- Loading indicators use shadcn's `spinner`, and motion follows `prefersReducedMotion`.

Per component:

- `kit/file-input` 1.1.1: Selected files are announced as a list in Safari again, which drops list
  semantics from an unstyled `<ul>`.
- `kit/file-input` 1.1.0: Each file is drawn with shadcn's `attachment` primitive, with a thumbnail
  for images. It now needs `attachment` and `empty`, and no longer `item` or `button`. The `file`
  snippet works as before.
- `kit/file-input` 1.0.0: **Breaking:** `removeLabel` is a function that receives the file, by
  default `Remove <file name>`: change `removeLabel="Remove"` to
  `removeLabel={(file) => 'Remove ' + file.name}`. The native field holds exactly the selected
  files, so `required` and `name` work in a plain form submit, and a form reset clears the selection
  and calls `onchange`.
- `kit/search-input` 1.0.0: **Breaking:** `debounce` is renamed `searchDebounce`.
- `kit/combobox` 1.0.0: Takes the trigger attributes. Screen readers are told which list the search
  box controls and which option is highlighted, and "no results" is announced. Disabled options
  look dimmed and can't be clicked. The search term is cleared when the footer's `close()` closes
  the popover.
- `kit/select` 1.0.0: Takes the trigger attributes. The trigger is announced as a combobox and the
  list is named after it. The placeholder no longer overrides a `<label for>` pointing at the
  trigger.
- `kit/date-picker` 1.0.0: Also accepts `aria-describedby` and `aria-invalid` on the trigger.
  Without an `id`, the trigger keeps the primitive's own.
- `kit/command-palette` 1.0.0: The search term is cleared when running an action closes the
  palette. The trigger's `aria-keyshortcuts` uses the ARIA spelling (`Control+Shift+K`). Screen
  readers are told which list the input controls and which action is highlighted. The empty message
  stays inside the list as an option nothing can select. It no longer depends on `@lucide/svelte`.
- `kit/confirm-dialog` 1.0.0: New `onerror` receives whatever `onconfirm` throws. The dialog stays
  open.
- `kit/inline-edit` 1.0.0: New `onerror` receives whatever `onsave` throws. The field stays open
  with the text as typed.
- `kit/stepper` 1.0.0: New `onerror` receives whatever `onbeforenext` or `onfinish` throws, and the
  stepper stays on the current step. The button text is set with `nextLabel` and `finishLabel` on
  the next button and `label` on the previous one.
- `kit/page-state` 1.0.0: New `onretryerror` receives whatever `onretry` throws, and the error state
  stays on screen. The built-in retry button and a custom `errorState` share one retry guard, so a
  retry from either shows as pending in both.
- `kit/tags-input` 1.0.0: Pasting text with line breaks, such as a spreadsheet column, makes one tag
  per line. An `onpaste` you pass runs first and can cancel this with `preventDefault()`.
- `kit/textarea` 1.0.0: New `remainingLabel` sets the "N characters left" announcement. The height
  is recalculated when the value is set from code or by a form reset.
- `kit/scrub-input` 1.0.0: Home and End move the caret when there is no `min` or `max` to jump to.
  Escape reverts typed text first; only a second Escape reaches an enclosing dialog.
- `kit/activity-calendar` 1.0.0: The arrow keys follow the reading direction on right-to-left pages,
  and month and weekday labels align to the start edge.
- `kit/responsive-dialog` 1.0.0: Changing `query` after mount takes effect.
- `kit/rating-group` 1.0.0: Read-only ratings no longer set `aria-readonly`, which is not valid on
  their `img` role.
- `kit/show-more` 1.0.0: Tabbing to content hidden below the fold reliably expands the region.
- `kit/toc` 1.0.0: Generated anchors for headings without an `id` keep letters from non-Latin
  scripts, so a Cyrillic or Japanese heading gets a real slug instead of `section`. Links to the
  old `section-N` anchors change.
- `kit/data-table` 1.0.0: Row and header checkboxes stay in sync with `selected` after a Shift range
  selection.
- `kit/shortcut` 1.0.0: No change in behavior; platform detection moved to a shared helper.
- `kit/number-input` 1.0.0: No change in behavior; stepping and committing moved to
  `lib/number-field`.
- `kit/follow-scroll` 1.0.0: No change in behavior.
- `kit/action-button` 1.0.0: No change in behavior.
- `kit/avatar` 1.0.0: No change in behavior.
- `kit/avatar-stack` 1.0.0: No change in behavior.
- `kit/copy-button` 1.0.0: No change in behavior.
- `kit/password-input` 1.0.0: No change in behavior.
- `kit/relative-time` 1.0.0: No change in behavior.
- `kit/reorder-list` 1.0.0: No change in behavior.
- `kit/tree-view` 1.0.0: No change in behavior.
- `lib/focus` 1.0.0: new. The focus-visible outline Coral draws on the controls it renders itself.
- `lib/intl` 1.0.0: new. Collators and formatters, built once per locale and options.
- `lib/number-field` 1.0.0: new. The stepping, committing and wheel handling number input and
  scrub input share.
- `lib/trigger` 1.0.0: new. The `id` and `aria-*` a button trigger takes.
- `lib/on-close` 1.0.0: new. Runs a callback when something closes, however it closed, including
  by assignment.
- `blocks/table-panel`: removed. Its search stopped dropping the space typed between words and its
  empty states moved to shadcn's `empty` primitive earlier the same day.

## 2026-09-27

- `kit/textarea` 1.0.0: new. A textarea that grows with its text between `rows` and `maxRows`, then
  scrolls inside itself. It keeps the page from jumping when it shrinks, has a character counter
  that counts the way `maxlength` does, and Enter or Mod+Enter send keys that wait while an input
  method is composing.
- `kit/follow-scroll` 1.0.0: new. A scroll container for logs, build output and chat threads that
  stays pinned to the end while content arrives, lets go when the reader scrolls up and picks up
  again when they come back. While the reader is behind, it shows a control to jump to the end,
  with a count of what arrived.
- `blocks/table-panel` 1.0.0: new. A full list screen over `kit/data-table`: search, sort and
  paging applied in that order, a page number that follows the filtered rows, separate "nothing
  yet" and "nothing found" states, selection kept across pages, and a bulk-action bar that does not
  push the rows down.
- `kit/page-state` 1.0.1: The loading spinner draws at full opacity instead of 60%.
- `kit/page-state` 1.0.0: new. The loading, error, empty or content state of a screen. The loading
  indicator appears only after `delay` and stays for at least `minimum`, a refresh keeps the
  current content on screen, and retrying goes through `kit/action-button`.
- `kit/data-table` 1.0.1: No change in behavior.
- `kit/data-table` 1.0.0: new. A table over `ui/table` with sortable headers and `aria-sort`, rows
  selected by id so the selection survives sorting and reloading, Shift-click range selection, a
  mixed-state header checkbox, placeholder rows while loading and `onrowactivate` for clickable
  rows.
- `kit/combobox` 5.0.1: The trigger uses the button's own gap between the label and the chevron.
- `kit/combobox` 5.0.0: **Breaking:** `fold.ts` moved to `lib/fold.ts`; change imports of
  `kit/combobox/fold.js` to `lib/fold.js`. The component works the same.
- `kit/number-input` 2.0.0: **Breaking:** the helpers in `kit/number-input/step.ts` moved to
  `lib/number.ts`; change imports accordingly. `onchange` is typed only as Coral's handler, which
  receives the value, not the DOM event.
- `kit/scrub-input` 1.0.0: new. A number field whose label is a drag handle: drag the label, type a
  number or use the arrow keys. Shift makes steps coarse, Escape during a drag restores the
  starting value, and `onscrubstart` and `onscrubend` mark one drag as one action.
- `kit/action-button` 1.1.0: Announces its pending state through `lib/live-region`. Same markup,
  same announcement.
- `kit/copy-button` 1.1.0: Copying the same value twice in a row announces "copied" again, and the
  announcement clears when the button returns to idle.
- `kit/password-input` 1.1.0: Announces the Caps Lock warning through `lib/live-region`, the same
  way as before.
- `kit/reorder-list` 1.1.1: No change in behavior.
- `kit/reorder-list` 1.1.0: A keyboard move announces again when its message repeats, such as an
  arrow key pressed at the end of the list.
- `kit/date-picker` 1.1.3: The trigger uses the button's own gap.
- `kit/activity-calendar` 1.0.3: No change in behavior; cell size and gap are the `--coral-cell`
  and `--coral-gap` variables instead of inline styles, with the same defaults.
- `kit/file-input` 1.1.2: No change in behavior; classes the primitives already apply were removed.
- `kit/rating-group` 1.0.2: No change in behavior; star size is the `--coral-star` variable instead
  of an inline style, with the same default.
- `kit/show-more` 1.0.2: No change in behavior; the collapsed height is a CSS variable instead of an
  inline style.
- `kit/toc` 1.1.3: No change in behavior; indentation is the `--coral-toc-indent` variable instead
  of an inline style, with the same default.
- `kit/tree-view` 1.0.2: No change in behavior; indentation is the `--coral-indent` variable instead
  of an inline style, with the same default.
- `lib/number` 1.0.0: new. The clamping, rounding, stepping and parsing number input and scrub input
  share.
- `lib/fold` 1.0.0: new. Text in the form searches compare: lower case, accents removed.
- `lib/table` 1.0.0: new. Sorting, filtering, paging and selection over an array of rows.
- `lib/announce` 1.0.0: new. Sends a message to a screen reader, heard again when the same words
  repeat.
- `lib/live-region` 1.0.0: new. The visually hidden status region components announce through.

## 2026-09-21

The registry opened: every component became installable with `shadcn-svelte add`, at the version it
already had.

- `kit/toc` 1.1.2: The default label has no wide letter spacing.
- `kit/toc` 1.1.1: The default label is no longer upper case.
- `kit/toc` 1.1.0: `label` is shown as a small heading above the list as well as naming the
  navigation, and the `heading` snippet replaces it. The list has a guide line, and the active entry
  is marked on it.
- `kit/activity-calendar` 1.0.2: Day cells and legend swatches are slightly more rounded.
- `kit/date-picker` 1.1.2: The preset buttons use the default button size.
- `kit/file-input` 1.1.1: The remove button on each file is larger.
- `kit/number-input` 1.0.1: The decrement and increment buttons are larger.
- `kit/password-input` 1.0.1: The show and hide button is larger.
- `kit/show-more` 1.0.1: The default toggle uses the default button size.
- `kit/tags-input` 1.0.1: The clear button is larger.
- `kit/tree-view` 1.0.1: No change in behavior.
- `lib/action` 1.0.0: new. The pending flag, the double-submit guard and the one agreed way to say
  an async handler failed.
- `lib/debounce` 1.0.0: new. Delays a call until the calls stop coming, with cancel, flush and a
  pending flag.
- `lib/hidden-field` 1.0.0: new. The hidden input that lets a select, combobox or date picker take
  part in a plain form.
- `lib/options` 1.0.0: new. `Option<T>`, `OptionGroup<T>`, and reading either shape.

The other components were published at `kit/avatar` 1.1.0, `kit/combobox` 4.2.0,
`kit/confirm-dialog` 1.1.0, `kit/date-picker` 1.1.1, `kit/file-input` 1.1.0, `kit/select` 2.1.0,
`kit/activity-calendar` 1.0.1, `kit/rating-group` 1.0.1, `kit/relative-time` 1.0.1, and 1.0.0 for
the rest.
