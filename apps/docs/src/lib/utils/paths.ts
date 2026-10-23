import { resolve } from '$app/paths';
import type { Path, ResolvedPathname } from '$app/types';

/**
 * `resolve()` for the pathnames in `config/navigation` and `features/docs/sidebar`. They keep their
 * leading slash because they are compared with `page.url.pathname`, but `resolve` reads a leading
 * slash as a route ID, and route groups make `/docs` a different ID (`/(docs)/docs/[...slug]`).
 */
export function resolvePathname(pathname: string): ResolvedPathname {
	return resolve(pathname.slice(1) as Path);
}
