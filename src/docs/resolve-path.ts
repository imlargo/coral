import { resolve } from '$app/paths';
import type { Path } from '$app/types';

/**
 * Resolves a site pathname kept in config (`/docs/kit/avatar`). Config keeps the leading slash
 * because it is compared against `page.url.pathname`; `resolve()` reads a leading slash as a route
 * ID, so it is dropped here.
 */
export function resolvePath(pathname: string) {
	return resolve(pathname.slice(1) as Path);
}
