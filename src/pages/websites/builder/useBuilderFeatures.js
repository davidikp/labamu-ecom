import { useState, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getTranslatedFeatures } from './constants';
import { loadStorefrontConfig } from './storefrontStorage';

/**
 * Manages feature selection + drag-and-drop ordering for Step 0.
 *
 * Custom-page config entries (stored in `configs`) are managed via callbacks
 * passed in from useBuilderContent, keeping the two hooks decoupled.
 */
export function useBuilderFeatures({ onCustomPageAdd, onCustomPageRemove, onCustomPageRename }) {
  const { t } = useTranslation('website');

  const AVAILABLE_FEATURES = useMemo(() => getTranslatedFeatures(t), [t]);
  const saved = useMemo(() => loadStorefrontConfig(), []);

  const [selectedFeatures, setSelectedFeatures] = useState(
    () => new Set(saved?.selectedFeatures ?? AVAILABLE_FEATURES.map(f => f.id))
  );
  const [featureOrder, setFeatureOrder] = useState(
    () => saved?.featureOrder ?? AVAILABLE_FEATURES.map(f => f.id)
  );
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dropTargetIdx, setDropTargetIdx] = useState(null);

  // Refs mirror state for use inside drag event handlers, which would otherwise
  // close over stale values from the render they were attached in.
  const draggedIdxRef    = useRef(null);
  const dropTargetIdxRef = useRef(null);
  const selectedRef      = useRef(selectedFeatures);
  selectedRef.current    = selectedFeatures;

  // ── Feature toggle ────────────────────────────────────────────────────────

  // isCurrentlySelected is passed by the caller to avoid reading selectedFeatures
  // inside the callback (which would require it in deps, changing the reference).
  const handleToggleFeature = useCallback((id, isCurrentlySelected) => {
    setSelectedFeatures(prev => {
      const next = new Set(prev);
      if (isCurrentlySelected) next.delete(id);
      else next.add(id);
      return next;
    });
    if (isCurrentlySelected) {
      // Deselected: move to end of order (inactive items sit at the bottom)
      setFeatureOrder(prev => {
        const without = prev.filter(fid => fid !== id);
        return [...without, id];
      });
    }
    // Enabling: order stays the same (item was already in the list)
  }, []);

  // ── Custom pages ──────────────────────────────────────────────────────────

  const handleAddCustomPage = useCallback(() => {
    const id = `custom_${Date.now()}`;
    const defaultName = t('studio.features.pageName');

    setFeatureOrder(prev => {
      // Insert after the last currently-selected item
      let lastSelectedIdx = -1;
      prev.forEach((fid, idx) => {
        if (selectedRef.current.has(fid)) lastSelectedIdx = idx;
      });
      const next = [...prev];
      next.splice(lastSelectedIdx + 1, 0, id);
      return next;
    });
    setSelectedFeatures(prev => new Set([...prev, id]));
    onCustomPageAdd(id, defaultName);
  }, [t, onCustomPageAdd]);

  const handleRemoveCustomPage = useCallback((id) => {
    setFeatureOrder(prev => prev.filter(fid => fid !== id));
    setSelectedFeatures(prev => { const next = new Set(prev); next.delete(id); return next; });
    onCustomPageRemove(id);
  }, [onCustomPageRemove]);

  const handleRenameCustomPage = useCallback((id, name) => {
    onCustomPageRename(id, name);
  }, [onCustomPageRename]);

  // ── Drag and drop ─────────────────────────────────────────────────────────

  const handleDragStart = useCallback((e, index) => {
    e.dataTransfer.setData('text/plain', String(index));
    draggedIdxRef.current = index;
    setDraggedIdx(index);
    setTimeout(() => { if (e.target) e.target.style.opacity = '0.1'; }, 0);
  }, []);

  const handleDragEnd = useCallback((e) => {
    if (e.target) e.target.style.opacity = '1';
    draggedIdxRef.current    = null;
    dropTargetIdxRef.current = null;
    setDraggedIdx(null);
    setDropTargetIdx(null);
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    const rect   = e.currentTarget.getBoundingClientRect();
    const isTop  = (e.clientY - rect.top) < rect.height / 2;
    const target = isTop ? index : index + 1;
    if (dropTargetIdxRef.current !== target) {
      dropTargetIdxRef.current = target;
      setDropTargetIdx(target);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const rawData   = e.dataTransfer.getData('text/plain');
    const fromIndex = rawData !== '' ? parseInt(rawData, 10) : draggedIdxRef.current;
    const toIndex   = dropTargetIdxRef.current;

    if (fromIndex == null || toIndex == null) {
      setDraggedIdx(null); setDropTargetIdx(null); return;
    }
    const actualTo = fromIndex < toIndex ? toIndex - 1 : toIndex;
    if (fromIndex !== actualTo) {
      setFeatureOrder(prev => {
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        if (!moved) return prev;
        next.splice(actualTo, 0, moved);
        return next;
      });
    }
    draggedIdxRef.current    = null;
    dropTargetIdxRef.current = null;
    setDraggedIdx(null);
    setDropTargetIdx(null);
  }, []);

  const handleContainerDragOver = useCallback((e) => { e.preventDefault(); }, []);

  // For the sentinel drop zone rendered below the last item when dragging
  const handleEndZoneDragOver = useCallback((e, listLength) => {
    e.preventDefault();
    if (dropTargetIdxRef.current !== listLength) {
      dropTargetIdxRef.current = listLength;
      setDropTargetIdx(listLength);
    }
  }, []);

  return {
    AVAILABLE_FEATURES,
    selectedFeatures,
    featureOrder,
    draggedIdx,
    dropTargetIdx,
    draggedIdxRef,
    dropTargetIdxRef,
    handleToggleFeature,
    handleAddCustomPage,
    handleRemoveCustomPage,
    handleRenameCustomPage,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    handleContainerDragOver,
    handleEndZoneDragOver,
  };
}
