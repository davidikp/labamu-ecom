/**
 * @module section-builder/state/pageRouting
 * @description Generic, parameterized storefront-page matching — resolves a
 * pathname against a store's `pages` list the same way a real router would,
 * so a parameterized system page's slug (e.g. `/products/:handle`) matches
 * `/products/dewalt-level-kit` and extracts `{ handle: 'dewalt-level-kit' }`,
 * not just an exact-string page (`/`, `/about`). Deliberately decoupled from
 * whether the extracted param actually resolves to a real product/collection
 * — that's a future phase's concern (see productSource.js); this module only
 * answers "does a page route exist for this path".
 *
 * Uses react-router-dom's own `matchPath` (already a project dependency, v7)
 * rather than a hand-rolled parser, so page slugs stay ordinary route
 * patterns merchants/templates already author them as.
 */
import { matchPath } from 'react-router-dom';

/**
 * Resolves `pathname` against `pages` (in list order — first match wins).
 * Returns `{ page, params }` on a match, `null` otherwise. An exact page
 * (`/`, `/about`) is just a `matchPath` with no `:params`, so this also
 * replaces plain exact-slug lookups — no separate code path needed.
 */
export function matchStorefrontPage(pages, pathname) {
  if (!pathname) return null;
  // A caller-built link can carry a query string (buildShopPath's own
  // `?category=...` — see productSource.js) as part of the same opaque
  // path value `onNavigate`/`navigateToPath` thread through end to end;
  // route matching itself only ever cares about the pathname portion.
  const [cleanPath] = pathname.split('?');
  for (const page of pages ?? []) {
    if (typeof page?.slug !== 'string') continue;
    const match = matchPath({ path: page.slug, end: true }, cleanPath);
    if (match) return { page, params: match.params ?? {} };
  }
  return null;
}

/** Companion to `matchStorefrontPage` — pulls the query string (if any)
 * back out of that same opaque path value. Currently only `category`
 * (Shop's own pre-filter, see productSource.js's `buildShopPath` and
 * catalog_list/Renderer.jsx's `initialCategory`) is a real consumer. */
export function parsePathQuery(pathWithQuery) {
  const [, query] = (pathWithQuery ?? '').split('?');
  return new URLSearchParams(query ?? '');
}
