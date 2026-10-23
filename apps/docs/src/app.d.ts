/// <reference types="@svmd/vite/client" />

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

/*
 * `App.Platform` is deliberately not declared. Typing it means `wrangler types`, whose globals
 * declare an `Element` with HTMLRewriter `append`/`prepend` signatures that merge with - and shadow -
 * the DOM one, which the components rendered here rely on. The site is prerendered and never reads
 * `event.platform`; a route that needs a binding declares `Platform` here with its types imported
 * from `@cloudflare/workers-types`, never as globals.
 */
declare global {
	namespace App {
		interface Error {
			/** Set by `handleError` for unexpected errors, and logged alongside them. */
			errorId?: string;
		}

		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
