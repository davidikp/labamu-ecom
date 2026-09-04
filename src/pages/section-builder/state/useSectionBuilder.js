import { useEffect, useMemo, useReducer, useState } from 'react';
import { builderReducer, createInitialState, ACTIONS } from './builderReducer';
import { withHistory, initHistory, UNDO, REDO, RESET } from './withHistory';
import { createFieldCoalescer } from './fieldCoalescer';
import { loadDraft, saveDraft, loadPublished, savePublished } from './storage';
import { hasUnpublishedChanges } from './draftComparison';
import { defaultTheme, createDefaultPages, createDefaultGlobals } from './defaultTheme';

const TRANSIENT_ACTION_TYPES = new Set([
  ACTIONS.SELECT,
  ACTIONS.DESELECT,
  ACTIONS.ADD_MEDIA_ITEM,
  ACTIONS.REMOVE_MEDIA_ITEM,
  // Storefront theme preview controls (Phase 4) — a preview toggle, not
  // undoable merchant content, same rationale as SELECT/DESELECT above.
  ACTIONS.SET_STOREFRONT_THEME_ID,
  ACTIONS.SET_STOREFRONT_THEME_MODE,
]);

const historyReducer = withHistory(builderReducer, TRANSIENT_ACTION_TYPES);

const AUTOSAVE_INTERVAL_MS = 60_000;

export function createFreshState(storeId) {
  const pages = createDefaultPages();
  return createInitialState({
    storeId,
    pages,
    theme: defaultTheme,
    ...createDefaultGlobals(pages),
  });
}

/**
 * Owns the builder's reducer + undo/redo history + draft/published
 * persistence for a single store (US-1.5, US-7.1-7.4, US-8.1-8.5). One
 * instance per <SectionBuilder>.
 */
export function useSectionBuilder(storeId) {
  const restored = useMemo(() => loadDraft(storeId), [storeId]);
  const [published, setPublished] = useState(() => loadPublished(storeId));

  const [history, dispatch] = useReducer(
    historyReducer,
    null,
    () => initHistory(restored ?? createFreshState(storeId))
  );

  const coalescer = useMemo(() => createFieldCoalescer(dispatch), [dispatch]);

  // Persist on every settled (non-coalescing) change — cheap for localStorage
  // and gives crash-safety beyond the 60s interval (US-8.5).
  useEffect(() => {
    saveDraft(storeId, history.present);
  }, [storeId, history.present]);

  // Belt-and-suspenders interval autosave per US-1.5's explicit "every 60s".
  useEffect(() => {
    const id = setInterval(() => saveDraft(storeId, history.present), AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [storeId, history.present]);

  const undo = () => dispatch({ type: UNDO });
  const redo = () => dispatch({ type: REDO });

  /** US-8.1 — snapshots the current draft as the published version. */
  const publish = () => {
    const snapshot = savePublished(storeId, history.present) && loadPublished(storeId);
    setPublished(snapshot);
  };

  /** US-8.4 — reverts to the last published version (or a fresh default
   * template if the store has never published) and clears the undo stack. */
  const discardDraft = () => {
    const nextState = published ?? createFreshState(storeId);
    dispatch({ type: RESET, state: nextState });
  };

  return {
    state: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    undoLabel: history.presentLabel,
    redoLabel: history.future[0]?.label ?? null,
    dispatch,
    commitField: coalescer.commitField,
    undo,
    redo,
    publish,
    discardDraft,
    dirty: hasUnpublishedChanges(history.present, published),
    wasRestoredFromDraft: Boolean(restored),
    restoredAt: restored?.savedAt ?? null,
    hasPublishedVersion: Boolean(published),
  };
}
