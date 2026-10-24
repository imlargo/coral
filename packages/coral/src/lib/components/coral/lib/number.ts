/**
 * @coral/lib/number
 * @version 1.1.0
 */

import { numberFormat } from './intl.js';

/**
 * How many decimals a step implies: `0.1` gives 1, `0.05` gives 2, `1` gives 0. Exponent notation
 * is read too - `1e-7` is a legitimate step, and `'1e-7'` has no decimal point to count.
 */
export function decimalsOf(step: number): number {
	if (!Number.isFinite(step)) return 0;

	const text = String(Math.abs(step));
	const [mantissa, exponent] = text.split('e-');
	const fraction = mantissa.split('.')[1]?.length ?? 0;

	return exponent ? Number(exponent) + fraction : fraction;
}

/**
 * Rounds to a fixed number of decimals. Stepping is repeated addition on binary floats, so
 * `0.1 + 0.2` is `0.30000000000000004` and a price field drifts into nonsense after a few clicks.
 * Rounding to the precision the step already implies keeps every stop on the ladder exact.
 */
export function round(value: number, decimals: number): number {
	if (!Number.isFinite(value)) return value;
	return Number(value.toFixed(Math.min(Math.max(decimals, 0), 20)));
}

/**
 * Holds a value inside its bounds. `max` is applied before `min`, so bounds passed the wrong way
 * round give `min` rather than something below both. Either may be left out, meaning unbounded
 * that way: defaulting `min` to `0` would quietly hide every negative a caller meant to allow.
 */
export function clamp(value: number, min?: number, max?: number): number {
	let next = value;
	if (max !== undefined) next = Math.min(max, next);
	if (min !== undefined) next = Math.max(min, next);
	return next;
}

export type StepOptions = {
	value: number | undefined;
	delta: number;
	min?: number;
	max?: number;
	decimals: number;
};

/**
 * The next value after a step, rounded and clamped. An empty field steps from `0`, not `min`: with
 * `min = 5` and `step = 1`, one press of `+` lands on 5 - the first allowed value - not 6.
 */
export function stepValue({ value, delta, min, max, decimals }: StepOptions): number {
	return clamp(round((value ?? 0) + delta, decimals), min, max);
}

type Symbols = { group: string; decimal: string; minus: string; digits: Map<string, string> };

const symbols = new Map<string, Symbols>();

/** The direction marks some locales wrap a minus sign in, which say nothing about the number. */
const MARKS = /[\u061c\u200e\u200f]/g;

/** How a locale writes a number, read off `Intl` rather than kept in a table that goes stale. */
function symbolsOf(locale: string | undefined): Symbols {
	const key = locale ?? '';
	const known = symbols.get(key);
	if (known) return known;

	const parts = numberFormat(locale).formatToParts(-12345.6);
	const part = (type: Intl.NumberFormatPartTypes) =>
		parts.find((entry) => entry.type === type)?.value ?? '';
	// Some locales write their own digits: `٩٨٧٦٥٤٣٢١٠` in Arabic is still 9876543210.
	const native = [...numberFormat(locale, { useGrouping: false }).format(9876543210)];

	const found = {
		group: part('group'),
		decimal: part('decimal'),
		minus: part('minusSign').replace(MARKS, ''),
		digits: new Map(native.map((digit, index) => [digit, String(9 - index)]))
	};
	symbols.set(key, found);
	return found;
}

/** Separates thousands once a group separator has been read as one. */
const GROUP = '_';
const NUMBER = /^-?(\d+(\.\d*)?|\.\d+)$/;
const GROUPED = /^-?\d{1,3}(_\d{3})+$/;

/**
 * Rewrites typed text into the form `Number` reads, or `undefined` when it is not a number: the
 * locale's digits, decimal separator and minus sign swapped for ASCII ones, its groups dropped. A
 * locale whose groups are spaces writes a narrow no-break space that no keyboard types, so any
 * space counts as one there.
 *
 * A group separator only groups when three digits follow it. Anywhere else, a single one with no
 * decimal separator beside it is the reader typing their own convention - `1.5` in `de-DE`, `1,5`
 * in `en-US` - and is read as the decimal point, instead of turning the number into fifteen.
 */
function delocalize(raw: string, locale: string | undefined): string | undefined {
	const { group, decimal, minus, digits } = symbolsOf(locale);
	const spaced = /\s/.test(group);

	let text = '';
	for (const char of raw.replace(MARKS, '').trim()) {
		if (char === group || (spaced && /\s/.test(char))) text += GROUP;
		else if (char === decimal) text += '.';
		else if (char === minus || char === '\u2212') text += '-';
		else text += digits.get(char) ?? char;
	}

	const [whole, fraction] = text.split('.', 2);
	if (whole.includes(GROUP)) {
		if (GROUPED.test(whole)) text = text.replaceAll(GROUP, '');
		else if (fraction === undefined && whole.split(GROUP).length === 2)
			text = whole.replace(GROUP, '.');
		else return undefined;
	}
	return NUMBER.test(text) ? text : undefined;
}

/**
 * Reads what someone typed, on commit rather than per keystroke, the way `locale` writes numbers:
 * `1.500,5` is fifteen hundred and a half in `de-DE`. `undefined` for an empty field, because
 * clearing means "no value", not "the smallest allowed one", and for anything that is not a plain
 * decimal number - a lone separator, `1e5`, `Infinity`. A `locale` left out follows the reader's
 * own.
 */
export function parse(
	raw: string,
	min: number | undefined,
	max: number | undefined,
	decimals: number,
	locale?: string
): number | undefined {
	const text = delocalize(raw, locale);
	if (text === undefined) return undefined;

	return clamp(round(Number(text), decimals), min, max);
}

/**
 * The text a field shows for a value, written the way `parse` reads it back. Never grouped:
 * separators that appear as the reader types are a caret moving on its own, and `1.500` is
 * ambiguous to a reader of the other convention.
 */
export function format(value: number | undefined, decimals: number, locale?: string): string {
	if (value === undefined) return '';

	// A value rounded towards zero from below is `-0`, which `Intl` prints with its sign.
	return numberFormat(locale, {
		maximumFractionDigits: Math.min(Math.max(decimals, 0), 20),
		useGrouping: false
	}).format(value === 0 ? 0 : value);
}
