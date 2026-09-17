import { builderReducer } from './builderReducer';
import { loadDraft, saveDraft } from './storage';
import { createFreshState } from './useSectionBuilder';
import { mergeRequiredSystemPages, requiredSystemPages } from './defaultTheme';

/**
 * @module section-builder/state/runDraftAction
 * @description Applies a single builderReducer action to a store's
 * persisted draft from *outside* the builder (Online Store > Pages has no
 * live useSectionBuilder instance mounted) — same pure reducer the builder
 * itself dispatches through, just without the undo/redo history wrapper or
 * autosave interval (each call persists immediately).
 *
 * Merges in any required system pages (Shop/Product, and the six written
 * policies — see REQUIRED_SYSTEM_TYPES/POLICY_SYSTEM_TYPES in
 * defaultTheme.js) before applying the action, same safety net
 * useSectionBuilder.js/PreviewLive.jsx use on load: a draft persisted before
 * one of those page kinds existed won't have it yet, and without this an
 * action targeting that page's id would silently no-op (page not found),
 * and the merge callers rely on for display (e.g. PoliciesSettings.jsx)
 * would get overwritten by this call's un-merged `next` on save.
 *
 * Deliberately falls back to a bare `createFreshState` (not
 * `loadOrSeedDemoDraft`) when nothing's persisted yet — `demoBootstrap.js`'s
 * `applySiteTemplate` call already routes through this same function to
 * persist its seed, so reaching back into `loadOrSeedDemoDraft` from here
 * would recurse into `applySiteTemplate` again (runDraftAction →
 * loadOrSeedDemoDraft → applySiteTemplate → runDraftAction → ...). Any page
 * that seeds its own initial draft via `loadOrSeedDemoDraft` (Menus/Files)
 * must make sure that seeded draft is actually persisted (`saveDraft`)
 * before dispatching through here, rather than relying on this fallback to
 * reconstruct it.
 */
export function runDraftAction(storeId, action) {
  const loaded = loadDraft(storeId) ?? createFreshState(storeId);
  const current = { ...loaded, pages: mergeRequiredSystemPages(loaded.pages, requiredSystemPages()) };
  const next = builderReducer(current, action);
  saveDraft(storeId, next);
  return next;
}
