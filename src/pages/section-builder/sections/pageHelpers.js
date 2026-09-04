/**
 * @module section-builder/sections/pageHelpers
 * @description Pure helpers for custom page creation (US-6.3, US-6.5).
 */
export function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isSlugTaken(slug, pages, excludePageId = null) {
  return pages.some((p) => p.id !== excludePageId && p.slug === slug);
}

export function defaultMetaTitle(pageName, storeName) {
  return `${pageName} — ${storeName}`;
}

/**
 * Generates a page id from a name (slug + short uuid suffix) so ids stay
 * readable but never collide, even across two pages named the same thing.
 * Matches the pattern PagesManagement.jsx used pre-Page-editor split.
 */
export function createPageId(name) {
  const slug = slugify(name) || 'page';
  return `page-${slug}-${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * Resolves a page's visibility into the three states surfaced across Page
 * List (badges/filter/stat cards), the Page editor's visibility radios, and
 * Bulk Manage Pages — 'visible' + a future `visibleFrom` is a distinct
 * "scheduled" bucket, not a variant of "visible". Single source of truth so
 * PagesManagement.jsx and PageEditor.jsx can't drift on the definition.
 */
export function visibilityBucket(page) {
  if (page.visibility === 'visible' && page.visibleFrom && page.visibleFrom > Date.now()) {
    return 'scheduled';
  }
  if (page.visibility === 'hidden') return 'hidden';
  return 'visible';
}

/**
 * Full public-facing URL for a page. `domain` is the real
 * `<company_slug>.labamu.co.id` storefront domain (see
 * `pages/online-store/storeDomain.js`) — pass it in explicitly rather than
 * looking it up here, since it comes from `useCompany()` (a React context)
 * and this module stays plain/context-free. Single source of truth for the
 * URL shape so Page List's copy-URL column and the Page editor's own
 * copy-URL affordance can't drift on the format.
 */
export function pageUrlFor(page, domain) {
  return `https://${domain}${page?.slug ?? ''}`;
}
