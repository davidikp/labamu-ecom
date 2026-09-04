import { builderReducer } from './builderReducer';
import { loadDraft, saveDraft } from './storage';
import { createFreshState } from './useSectionBuilder';

/**
 * @module section-builder/state/runDraftAction
 * @description Applies a single builderReducer action to a store's
 * persisted draft from *outside* the builder (Online Store > Pages has no
 * live useSectionBuilder instance mounted) — same pure reducer the builder
 * itself dispatches through, just without the undo/redo history wrapper or
 * autosave interval (each call persists immediately).
 */
export function runDraftAction(storeId, action) {
  const current = loadDraft(storeId) ?? createFreshState(storeId);
  const next = builderReducer(current, action);
  saveDraft(storeId, next);
  return next;
}
