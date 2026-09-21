// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

/*
 * `App.Platform` is deliberately not declared.
 *
 * Typing it means pulling `worker-configuration.d.ts` into the program, and that file declares a
 * global `Element` whose HTMLRewriter signatures merge with - and shadow - the DOM one. The cost
 * showed up twice: DOM code had to avoid `append`/`prepend`, and shadcn's untouchable
 * `ui/native-select` reported an error nobody could fix.
 *
 * The site is prerendered and never reads `event.platform`, so it buys nothing. A route that
 * genuinely needs the Cloudflare bindings should declare the interface here again, add
 * `"types": ["./worker-configuration.d.ts"]` back to `tsconfig.json`, and take the shadowing with
 * it.
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
