// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

/*
 * `App.Platform` is deliberately not declared: the site is prerendered and never reads
 * `event.platform`. A route that needs a Cloudflare binding declares it here, with its types
 * imported from `@cloudflare/workers-types` - never `wrangler types`, whose globals redefine DOM
 * types (`Element`, `Response`) the components rely on.
 */
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
