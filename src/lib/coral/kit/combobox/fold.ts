/**
 * @coral/kit/combobox
 * @version 1.0.0
 */

/**
 * Folds a string into the form searches should compare against: lower case, no accents.
 *
 * Spanish is the reason this exists. `Bogotá`, `Medellín` and `Muñoz` are typed `bogota`,
 * `medellin` and `munoz` far more often than not, and a matcher that compares the raw strings
 * finds none of them — the list looks empty for a term the user can see on screen.
 *
 * Decomposing to NFD splits an accented character into its base letter plus a combining mark,
 * so dropping the marks leaves the base letter behind. `ñ` folds to `n` for the same reason:
 * it is what people type when searching, even though it is a distinct letter of the alphabet.
 */
export function fold(value: string): string {
	return value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLocaleLowerCase('es-CO');
}
