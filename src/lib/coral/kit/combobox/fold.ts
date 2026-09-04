/**
 * @coral/kit/combobox
 * @version 4.1.0
 */

/**
 * Folds a string into the form searches compare against: lower case, no accents.
 *
 * Spanish is why this exists. `Bogotá` and `Muñoz` are typed `bogota` and `munoz` far more often
 * than not, and comparing raw strings finds neither - the list looks empty for a term the user can
 * see on screen. NFD splits an accented character into base letter plus combining mark, so
 * dropping the marks leaves the letter. `ñ` folds to `n` for the same reason, distinct letter of
 * the alphabet though it is.
 */
export function fold(value: string): string {
	return value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLocaleLowerCase('es-CO');
}
