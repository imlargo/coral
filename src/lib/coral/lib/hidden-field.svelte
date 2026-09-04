<script lang="ts">
	/**
	 * @coral/lib/hidden-field
	 * @version 1.0.0
	 */

	let {
		name,
		value,
		form,
		required = false
	}: {
		/** Field name. The caller decides whether to render this at all, so it is not optional. */
		name: string;
		/** Already serialized - this component never stringifies a domain value. */
		value: string;
		/** `id` of the form to submit with, for a control that sits outside it. */
		form?: string;
		/** Blocks submission while `value` is empty. */
		required?: boolean;
	} = $props();
</script>

<!--
	The field that actually submits, for the components whose visible control is not an input:
	select, combobox and date-picker. It lives in `lib/` because all three need it and the details
	below are too easy to get subtly wrong twice.

	**Not `type="hidden"`.** A hidden input is barred from constraint validation, so `required` on
	one is inert - the form submits with nothing in the field and the browser reports no error.
	Clipped to a pixel it is a real, validatable control, which is the same trick bits-ui's own
	hidden input plays and the only way `required` means anything here.

	`tabindex="-1"` keeps it out of the tab order and `aria-hidden` out of the accessibility tree,
	so the pixel is unreachable by every route except the validation bubble, which is precisely
	what it is there for. It is deliberately not `readonly` or `disabled`: both of those are also
	barred from validation, which would put `required` right back where it started.
-->
<input
	class="sr-only"
	tabindex="-1"
	aria-hidden="true"
	autocomplete="off"
	{name}
	{form}
	{required}
	{value}
/>
