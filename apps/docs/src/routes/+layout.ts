// The site is static. Prerendering also means a broken page or a `<Preview name="…" />` naming a
// demo that does not exist fails the build instead of shipping a 500 or an empty box.
export const prerender = true;
