import { loadDraft, saveDraft } from './storage';
import { createFreshState } from './useSectionBuilder';
import { applySiteTemplate } from './siteTemplateApply';
import { SITE_TEMPLATES } from './siteTemplates';
import { DEFAULT_MENU_ITEMS } from './builderReducer';

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
  const seeded = applySiteTemplate(storeId, clothing, 'seed');
  // The Clothing template has no `menus` override of its own, so
  // applySiteTemplate falls back to createDefaultGlobals' page-roster-
  // derived nav — just Home/About/Contact, since that's all Clothing's page
  // list has. Content > Menus' "Header Menu" is meant to always start from
  // the same canonical item set "Restore to Default" resets to (see
  // builderReducer.js's DEFAULT_MENU_ITEMS), regardless of which pages the
  // seeded theme happens to ship, so it's applied here too rather than only
  // on demand.
  const overridden = {
    ...seeded,
    menus: {
      ...seeded.menus,
      'main-menu': {
        ...seeded.menus['main-menu'],
        items: DEFAULT_MENU_ITEMS['main-menu'].map((item) => ({ ...item })),
      },
    },
  };
  // applySiteTemplate already persisted `seeded` (its un-overridden 3-item
  // menu) via its own runDraftAction call — re-save here with the corrected
  // `overridden` copy so the *next* read (loadDraft, e.g. from
  // runDraftAction when Menus/Files dispatches its first Create/Save/Delete)
  // doesn't silently revert back to the un-overridden version.
  saveDraft(storeId, overridden);
  return overridden;
}
