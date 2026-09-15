import { loadDraft } from './storage';
import { createFreshState } from './useSectionBuilder';
import { applySiteTemplate } from './siteTemplateApply';
import { SITE_TEMPLATES } from './siteTemplates';

/**
 * @module section-builder/state/demoBootstrap
 * @description Content > Pages/Menus/Files all read/write the same
 * hardcoded `STORE_ID = 'demo'` draft (see each page's own TODO about
 * multi-store routing) — a showcase store for this app, not a genuine
 * new-merchant signup. A real new store is meant to start on a blank
 * `createFreshState()` until a merchant explicitly picks a theme in the
 * Theme gallery; the demo store has no such onboarding step wired into
 * these admin pages, so if its draft is ever missing entirely (e.g. a
 * cleared localStorage), falling back to `createFreshState` would leave it
 * looking broken/empty instead of showing its usual baseline content.
 *
 * `loadOrSeedDemoDraft` is the drop-in replacement for the
 * `loadDraft(id) ?? createFreshState(id)` pattern these pages use: for any
 * other store id it behaves identically, but for 'demo' specifically it
 * reseeds from the Clothing template (the same SITE_TEMPLATES entry this
 * app's default demo content — hero.jpg/secondary.jpg, etc. — comes from)
 * via the same `applySiteTemplate` a merchant's own first theme pick goes
 * through, so the seeded draft is also persisted for the next page to read.
 */
export function loadOrSeedDemoDraft(storeId) {
  const existing = loadDraft(storeId);
  if (existing) return existing;
  if (storeId !== 'demo') return createFreshState(storeId);
  const clothing = SITE_TEMPLATES.find((template) => template.id === 'clothing') ?? SITE_TEMPLATES[0];
  return applySiteTemplate(storeId, clothing, 'seed');
}
