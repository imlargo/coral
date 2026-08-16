/**
 * @coral/kit/avatar
 * @version 1.0.0
 */

/**
 * Derives display initials from a person's name.
 *
 * Takes the first letter of the first word and, when there is more than one word, the first
 * letter of the last one - so `María del Carmen García` yields `MG`, not `MD`. Single-word
 * names yield a single letter. Uppercased with `es-CO` rules, accents preserved.
 *
 * Returns an empty string for empty or whitespace-only input, so the caller decides what to
 * render instead of getting a placeholder it never asked for.
 */
export function initials(name: string | null | undefined): string {
	const words = name?.trim().split(/\s+/).filter(Boolean) ?? [];
	if (words.length === 0) return '';

	const first = [...words[0]][0];
	const last = [...words[words.length - 1]][0];

	return (words.length === 1 ? first : first + last).toLocaleUpperCase('es-CO');
}
