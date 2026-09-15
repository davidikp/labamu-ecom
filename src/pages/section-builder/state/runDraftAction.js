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
 */
export function runDraftAction(storeId, action) {
  const loaded = loadDraft(storeId) ?? createFreshState(storeId);
  const current = { ...loaded, pages: mergeRequiredSystemPages(loaded.pages, requiredSystemPages()) };
  const next = builderReducer(current, action);
  saveDraft(storeId, next);
  return next;
}
