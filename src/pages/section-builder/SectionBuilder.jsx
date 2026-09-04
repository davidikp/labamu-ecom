import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LocaleProvider, Snackbar } from '../../ce-ui';
import { useSectionBuilder } from './state/useSectionBuilder';
import { ACTIONS } from './state/builderReducer';
import { getGroupSchema } from './state/themeSchemaAdapter';
import { registerBuilderMocks } from './mocks/registerBuilderMocks';
import { useConfirmLeaveIfDirty } from './hooks/useConfirmLeaveIfDirty';
import { useUndoRedoShortcuts } from './hooks/useUndoRedoShortcuts';
import TopBar from './ui/TopBar';
import Sidebar from './ui/Sidebar';
import Canvas from './ui/Canvas';
import SettingsPanel from './ui/SettingsPanel';
import ThemePanel from './ui/ThemePanel';
import MediaLibraryPanel from './ui/MediaLibraryPanel';
import PublishDrawer from './ui/PublishDrawer';
import DraftRecoveryBanner from './ui/DraftRecoveryBanner';
import ConcurrentEditingBanner from './ui/ConcurrentEditingBanner';
import ConfirmDialog from './ui/ConfirmDialog';
import { slugify } from './sections/pageHelpers';
import { labelForType } from './sections/registry';
import { countEntitiesUsingSlot } from './sections/themeHelpers';
import { createInitialCheckState, allChecksPass } from './sections/publishChecks';
import { schemaForType } from './sections/index';
import { defaultsForSchema } from './sections/schemaDefaults';
import {
  seedBlocks,
  makeBlock,
  blockTypeDef,
  blockSelectionId,
  parseBlockSelection,
  sectionSupportsBlocks,
  isAtBlockMax,
  resolveBlockPath,
  childBlockTypes,
  blockConfigForType,
} from './sections/blockHelpers';
import BlockList from './ui/BlockList';
import SectionPickerModal from './ui/SectionPickerModal';

registerBuilderMocks();

// TODO: replace with the real store/company name once catalog/company APIs
// are wired into this builder — see api/client.js's company service.
const STORE_NAME_PLACEHOLDER = 'My Store';

function createSectionId(type) {
  return `${type}-${crypto.randomUUID()}`;
}

function createPageId(slug) {
  return `page-${slugify(slug)}-${crypto.randomUUID().slice(0, 8)}`;
}

const TEXT_LIKE_FIELD_TYPES = new Set(['text', 'textarea', 'richtext']);
const THEME_PANEL_SELECTION = 'theme-settings';
const MEDIA_PANEL_SELECTION = 'media-library';

export default function SectionBuilder() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { storeId, pageId } = useParams();
  const {
    state,
    canUndo,
    canRedo,
    undoLabel,
    redoLabel,
    undo,
    redo,
    dispatch,
    commitField,
    publish,
    discardDraft,
    dirty,
    wasRestoredFromDraft,
    restoredAt,
  } = useSectionBuilder(storeId);

  // Deep-link support for the "Pages" management screen (Online Store >
  // Pages) — /section-builder/:storeId/pages/:pageId opens the builder with
  // that page already selected, instead of always defaulting to pages[0].
  useEffect(() => {
    if (!pageId) return;
    if (pageId === state.activePageId) return;
    if (!state.pages.some((page) => page.id === pageId)) return;
    dispatch({ type: ACTIONS.SET_ACTIVE_PAGE, pageId });
    // Only re-run when the route's pageId changes — not on every state
    // update, otherwise this would fight the sidebar's own page switcher.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);
  const [viewport, setViewport] = useState('desktop');
  const [recoveryBannerDismissed, setRecoveryBannerDismissed] = useState(false);
  const [publishDrawerOpen, setPublishDrawerOpen] = useState(false);
  const [publishCheckState, setPublishCheckState] = useState(createInitialCheckState);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [sectionPickerIndex, setSectionPickerIndex] = useState(null);
  const [publishToastOpen, setPublishToastOpen] = useState(false);
  const [mediaPicker, setMediaPicker] = useState(null); // { onPick } | null

  const simulatedEditor = new URLSearchParams(window.location.search).get('simulateEditor');

  useConfirmLeaveIfDirty(dirty);
  useUndoRedoShortcuts(undo, redo);

  const activePage = state.pages.find((p) => p.id === state.activePageId);
  const activePageId = activePage?.id;
  const sections = useMemo(() => activePage?.sections ?? [], [activePage]);
  const selectedId = state.selection.id;

  const blockSel = parseBlockSelection(selectedId);
  const selectedEntity = blockSel
    ? null
    : selectedId === 'header'
    ? state.header
    : selectedId === 'footer'
    ? state.footer
    : sections.find((s) => s.id === selectedId) ?? null;

  const selectedBlockSection = blockSel ? sections.find((s) => s.id === blockSel.sectionId) ?? null : null;
  // `blockChain` resolves the full ancestor chain (top-level block → deepest
  // nested block) addressed by the selection path, so a group nested inside a
  // group inside a group is still reachable, not just one level.
  const blockChain = blockSel ? resolveBlockPath(selectedBlockSection?.blocks, blockSel.path) : null;
  const selectedBlock = blockChain?.length ? blockChain[blockChain.length - 1] : null;
  // Path to the immediate container (group) holding `selectedBlock` — [] for
  // a top-level block, otherwise the ids of every ancestor group above it.
  const blockParentPath = blockSel ? blockSel.path.slice(0, -1) : [];

  // US-10.2 — Canvas wraps each section's Renderer in React.memo so editing
  // one section doesn't re-render its siblings. That only pays off if the
  // callback props handed to each section stay referentially stable across
  // unrelated state changes, hence useCallback here (deps limited to the
  // active page id + dispatch, both stable) rather than plain arrow
  // functions recreated on every SectionBuilder render.
  const sectionsRef = useRef(sections);
  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  const select = useCallback((id) => dispatch({ type: ACTIONS.SELECT, id }), [dispatch]);
  const deselect = useCallback(() => dispatch({ type: ACTIONS.DESELECT }), [dispatch]);

  const handleToggleGlobalHidden = (which) =>
    dispatch({
      type: ACTIONS.TOGGLE_GLOBAL_HIDDEN,
      which,
      meta: {
        label: t(
          state[which].hidden
            ? 'sectionBuilder:editor.sectionBuilder.actions.show'
            : 'sectionBuilder:editor.sectionBuilder.actions.hide',
          { label: labelForType(which) }
        ),
      },
    });

  const handleReorder = (orderedIds) =>
    dispatch({
      type: ACTIONS.REORDER_SECTIONS,
      pageId: activePage.id,
      orderedIds,
      meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.reorderSections') },
    });

  const handleAddSectionAt = useCallback(
    (type, index) =>
      dispatch({
        type: ACTIONS.ADD_SECTION,
        pageId: activePageId,
        section: { id: createSectionId(type), type, data: defaultsForSchema(schemaForType(type)), blocks: seedBlocks(type) },
        index,
        meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.addSection', { type: labelForType(type) }) },
      }),
    [activePageId, dispatch, t]
  );

  // Inline, on-canvas text edits (Shopify-style). Routed through the same
  // field coalescer as the settings panel so a burst of keystrokes collapses
  // into a single undo entry. `entityId` is a section id, or 'header'/'footer'.
  const handleInlineEdit = useCallback(
    (entityId, key, value) => {
      const isGlobal = entityId === 'header' || entityId === 'footer';
      const type = isGlobal ? entityId : sectionsRef.current.find((s) => s.id === entityId)?.type;
      const meta = {
        label: t('sectionBuilder:editor.sectionBuilder.actions.fieldChange', {
          type: labelForType(type),
          field: key,
        }),
      };
      const action = isGlobal
        ? { type: ACTIONS.UPDATE_GLOBAL_DATA, which: entityId, data: { [key]: value }, meta }
        : { type: ACTIONS.UPDATE_SECTION_DATA, pageId: activePageId, sectionId: entityId, data: { [key]: value }, meta };
      commitField(`${entityId}:${key}`, action);
    },
    [activePageId, commitField, t]
  );

  const handleMoveSection = useCallback(
    (sectionId, direction) =>
      dispatch({
        type: ACTIONS.MOVE_SECTION,
        pageId: activePageId,
        sectionId,
        direction,
        meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.reorderSections') },
      }),
    [activePageId, dispatch]
  );

  const handleDuplicateSection = useCallback(
    (sectionId) => {
      const original = sectionsRef.current.find((s) => s.id === sectionId);
      dispatch({
        type: ACTIONS.DUPLICATE_SECTION,
        pageId: activePageId,
        sectionId,
        newId: createSectionId('copy'),
        meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.duplicateSection', { type: labelForType(original?.type) }) },
      });
    },
    [activePageId, dispatch]
  );

  const requestDeleteSection = useCallback((sectionId) => setDeleteTargetId(sectionId), []);

  const handleDeleteSection = useCallback(
    (sectionId) => {
      const target = sectionsRef.current.find((s) => s.id === sectionId);
      dispatch({
        type: ACTIONS.REMOVE_SECTION,
        pageId: activePageId,
        sectionId,
        meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.deleteSection', { type: labelForType(target?.type) }) },
      });
    },
    [activePageId, dispatch]
  );

  // ── Blocks ────────────────────────────────────────────────────────────
  const handleAddBlock = useCallback(
    (sectionId, blockType, index, parentPath) => {
      const section = sectionsRef.current.find((s) => s.id === sectionId);
      const def = blockTypeDef(section?.type, blockType);

      // Defense-in-depth (Phase 3 — nested `accepts`/childTypes, see
      // sections/blocks/registry.js): AddBlockControl already filters its
      // menu to the target container's allowed types, but this is the one
      // place every add funnels through regardless of caller, so re-check
      // here rather than trusting the UI filter alone.
      const path = parentPath ?? [];
      const allowed = path.length
        ? childBlockTypes(resolveBlockPath(section?.blocks, path)?.at(-1)?.type)
        : blockConfigForType(section?.type)?.allowed;
      if (allowed && !allowed.includes(blockType)) return;

      dispatch({
        type: ACTIONS.ADD_BLOCK,
        pageId: activePageId,
        sectionId,
        block: makeBlock(section?.type, blockType),
        index,
        parentPath,
        meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.addBlock', { type: def?.label ?? 'Block' }) },
      });
    },
    [activePageId, dispatch, t]
  );

  const handleRemoveBlock = useCallback(
    (sectionId, blockId, parentPath) =>
      dispatch({
        type: ACTIONS.REMOVE_BLOCK,
        pageId: activePageId,
        sectionId,
        blockId,
        parentPath,
        meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.removeBlock') },
      }),
    [activePageId, dispatch, t]
  );

  const handleReorderBlocks = useCallback(
    (sectionId, orderedIds, parentPath) =>
      dispatch({
        type: ACTIONS.REORDER_BLOCKS,
        pageId: activePageId,
        sectionId,
        orderedIds,
        parentPath,
        meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.reorderBlocks') },
      }),
    [activePageId, dispatch, t]
  );

  // Cross-container move (the sidebar layers tree's drag-and-drop) — moves a
  // block from one container to another at any depth, including into or out
  // of a group, in one undo step.
  const handleMoveBlockToPath = useCallback(
    (sectionId, blockId, fromParentPath, toParentPath, toIndex) => {
      const section = sectionsRef.current.find((s) => s.id === sectionId);

      // Same accepts/childTypes guard as handleAddBlock — the sidebar tree's
      // drag-and-drop (SectionListItem.jsx) can move a block across
      // containers, e.g. out of or into a group, so a cross-container move
      // needs the same defense-in-depth check a fresh add gets.
      const toPath = toParentPath ?? [];
      if (toPath.length) {
        const movedType = resolveBlockPath(section?.blocks, [...(fromParentPath ?? []), blockId])?.at(-1)?.type;
        const allowed = childBlockTypes(resolveBlockPath(section?.blocks, toPath)?.at(-1)?.type);
        if (movedType && allowed && !allowed.includes(movedType)) return;
      }

      dispatch({
        type: ACTIONS.MOVE_BLOCK_TO_PATH,
        pageId: activePageId,
        sectionId,
        blockId,
        fromParentPath,
        toParentPath,
        toIndex,
        meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.reorderBlocks') },
      });
    },
    [activePageId, dispatch, t]
  );

  const handleSelectBlock = useCallback(
    (sectionId, path) => select(blockSelectionId(sectionId, path)),
    [select]
  );

  // Field change for the currently-selected block; text-like fields coalesce
  // into one undo entry, same as section/inline edits.
  const handleBlockFieldChange = (key, value, field) => {
    if (!blockSel || !selectedBlock) return;
    const meta = {
      label: t('sectionBuilder:editor.sectionBuilder.actions.fieldChange', {
        type: blockTypeDef(selectedBlockSection?.type, selectedBlock?.type)?.label ?? 'Block',
        field: field.label,
      }),
    };
    const action = {
      type: ACTIONS.UPDATE_BLOCK_DATA,
      pageId: activePageId,
      sectionId: blockSel.sectionId,
      blockId: selectedBlock.id,
      parentPath: blockParentPath,
      data: { [key]: value },
      meta,
    };
    if (TEXT_LIKE_FIELD_TYPES.has(field.type)) {
      commitField(`${blockSel.sectionId}:${selectedBlock.id}:${key}`, action);
    } else {
      dispatch(action);
    }
  };

  // On-canvas inline text edit targeting a specific block, addressed by its
  // full path (top-level block id → … → target block id) within the section.
  const handleBlockInlineEdit = useCallback(
    (sectionId, path, key, value) => {
      const blockId = path[path.length - 1];
      const parentPath = path.slice(0, -1);
      const action = {
        type: ACTIONS.UPDATE_BLOCK_DATA,
        pageId: activePageId,
        sectionId,
        blockId,
        parentPath,
        data: { [key]: value },
        meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.fieldChange', { type: 'Block', field: key }) },
      };
      commitField(`${sectionId}:${path.join('>')}:${key}`, action);
    },
    [activePageId, commitField, t]
  );

  const handleFieldChange = (key, value, field) => {
    const isGlobal = selectedId === 'header' || selectedId === 'footer';
    const meta = {
      label: t('sectionBuilder:editor.sectionBuilder.actions.fieldChange', {
        type: labelForType(selectedEntity?.type),
        field: field.label,
      }),
    };
    const data = { [key]: value };
    // Generic "seed a sibling repeater on first pick" hook — e.g.
    // collection_list's display_style declares defaultCollectionsByStyle so
    // switching to 'circular' lands on a filled-in row (Figma's 6) instead
    // of an empty repeater, but only when the merchant hasn't already
    // populated `collections` themselves.
    if (field.defaultCollectionsByStyle && !selectedEntity?.data?.collections?.length) {
      const handles = field.defaultCollectionsByStyle[value];
      if (handles) {
        data.collections = handles.map((handle) => ({ id: crypto.randomUUID(), source: 'catalog', handle }));
      }
    }
    const action = isGlobal
      ? { type: ACTIONS.UPDATE_GLOBAL_DATA, which: selectedId, data, meta }
      : { type: ACTIONS.UPDATE_SECTION_DATA, pageId: activePage.id, sectionId: selectedId, data, meta };

    if (TEXT_LIKE_FIELD_TYPES.has(field.type)) {
      commitField(`${selectedId}:${key}`, action);
    } else {
      dispatch(action);
    }
  };

  const handleSelectPage = (pageId) => dispatch({ type: ACTIONS.SET_ACTIVE_PAGE, pageId });

  const handleAddPage = ({ name, slug }) =>
    dispatch({
      type: ACTIONS.ADD_PAGE,
      page: { id: createPageId(slug), name, type: 'custom', slug: `/${slug}`, sections: [], seo: {}, hiddenFromNav: false },
      meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.addPage', { name }) },
    });

  const handleRenamePage = (pageId, name) =>
    dispatch({ type: ACTIONS.RENAME_PAGE, pageId, name, meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.renamePage') } });
  const handleDeletePage = (pageId) =>
    dispatch({ type: ACTIONS.DELETE_PAGE, pageId, meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.deletePage') } });
  const handleUpdatePageSeo = (pageId, seo) =>
    dispatch({ type: ACTIONS.UPDATE_PAGE_SEO, pageId, seo, meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.updatePageSeo') } });
  const handleTogglePageNavHidden = (pageId) =>
    dispatch({ type: ACTIONS.TOGGLE_PAGE_NAV_HIDDEN, pageId, meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.togglePageNav') } });
  const handleReorderPages = (orderedIds) =>
    dispatch({ type: ACTIONS.REORDER_PAGES, orderedIds, meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.reorderPages') } });

  const handleOpenTheme = () => select(THEME_PANEL_SELECTION);
  const handleOpenMedia = () => select(MEDIA_PANEL_SELECTION);

  const handleAddMedia = (item) => dispatch({ type: ACTIONS.ADD_MEDIA_ITEM, item });
  const handleDeleteMedia = (id) => dispatch({ type: ACTIONS.REMOVE_MEDIA_ITEM, id });
  const handleOpenLibraryPicker = (onPick) => setMediaPicker({ onPick });

  const handleThemeFieldChange = (group, fieldKey, value) => {
    const fieldSchema = getGroupSchema(group).fields[fieldKey];
    const affects = group === 'colors' ? ` (affects ${countEntitiesUsingSlot(state, fieldKey)} sections)` : '';
    dispatch({
      type: ACTIONS.UPDATE_THEME_FIELD,
      group,
      field: fieldKey,
      value,
      meta: { label: `Theme → ${fieldSchema.label}${affects}` },
    });
  };

  const handleApplyThemePreset = (preset) =>
    dispatch({
      type: ACTIONS.APPLY_THEME_PRESET,
      colors: preset.colors,
      typography: preset.typography,
      meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.themePreset', { name: preset.name }) },
    });

  // Phase 4 — storefront theme layer, additive/separate from the preset
  // system above; excluded from undo history (see TRANSIENT_ACTION_TYPES).
  const handleSetStorefrontThemeId = (themeId) =>
    dispatch({ type: ACTIONS.SET_STOREFRONT_THEME_ID, themeId });
  const handleSetStorefrontThemeMode = (mode) =>
    dispatch({ type: ACTIONS.SET_STOREFRONT_THEME_MODE, mode });

  const handlePreview = () => {
    const token = `dev-${Date.now()}`;
    window.open(`/section-builder/${storeId}/preview?token=${token}`, '_blank', 'noopener');
  };

  const runPublish = () => {
    publish();
    setPublishDrawerOpen(false);
    setPublishToastOpen(true);
  };

  const handlePublish = () => {
    if (allChecksPass(publishCheckState)) {
      runPublish();
    } else {
      setPublishDrawerOpen(true);
    }
  };

  const handleToggleCheck = (key) => setPublishCheckState((prev) => ({ ...prev, [key]: true }));

  const handleDiscard = () => setDiscardConfirmOpen(true);
  const confirmDiscard = () => {
    discardDraft();
    setDiscardConfirmOpen(false);
  };

  // Exit (top-left back arrow, like Shopify's theme editor) — returns to
  // the backoffice's Online Store > Theme screen (the entry point most
  // merchants land in the builder from). If there are unpublished changes,
  // warn before discarding them and leaving, same as the ⋮ menu's "Discard
  // changes" action above.
  const goToBackoffice = () => navigate('/online-store/theme');
  const handleExit = () => (dirty ? setExitConfirmOpen(true) : goToBackoffice());
  const confirmExit = () => {
    discardDraft();
    setExitConfirmOpen(false);
    goToBackoffice();
  };

  // Snackbar dismisses itself (animates out, then calls onDismiss) once its
  // action is clicked — no need to flip publishToastOpen manually here.
  const handleViewLiveStore = () => {
    handlePreview();
  };

  return (
    <LocaleProvider locale="en">
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50">
      {wasRestoredFromDraft && !recoveryBannerDismissed && dirty && (
        <DraftRecoveryBanner
          restoredAt={restoredAt}
          onKeep={() => setRecoveryBannerDismissed(true)}
          onDiscard={() => {
            discardDraft();
            setRecoveryBannerDismissed(true);
          }}
        />
      )}
      <ConcurrentEditingBanner editorName={simulatedEditor} />
      <TopBar
        pageName={activePage?.name ?? '—'}
        viewport={viewport}
        onViewportChange={setViewport}
        canUndo={canUndo}
        canRedo={canRedo}
        undoLabel={undoLabel}
        redoLabel={redoLabel}
        onUndo={undo}
        onRedo={redo}
        dirty={dirty}
        onPreview={handlePreview}
        onPublish={handlePublish}
        onDiscard={handleDiscard}
        onExit={handleExit}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          header={state.header}
          footer={state.footer}
          sections={sections}
          selectedId={selectedId}
          onSelect={select}
          onToggleGlobalHidden={handleToggleGlobalHidden}
          onReorder={handleReorder}
          onSelectBlock={handleSelectBlock}
          onAddBlock={handleAddBlock}
          onMoveBlock={handleMoveBlockToPath}
          onRequestAddSection={() => setSectionPickerIndex(sections.length)}
          onOpenTheme={handleOpenTheme}
          onOpenMedia={handleOpenMedia}
          pages={state.pages}
          activePageId={state.activePageId}
          storeName={STORE_NAME_PLACEHOLDER}
          onSelectPage={handleSelectPage}
          onAddPage={handleAddPage}
          onRenamePage={handleRenamePage}
          onDeletePage={handleDeletePage}
          onUpdatePageSeo={handleUpdatePageSeo}
          onTogglePageNavHidden={handleTogglePageNavHidden}
          onReorderPages={handleReorderPages}
        />
        <Canvas
          viewport={viewport}
          header={state.header}
          footer={state.footer}
          sections={sections}
          selectedId={selectedId}
          onSelect={select}
          onDeselect={deselect}
          onMoveSection={handleMoveSection}
          onDuplicateSection={handleDuplicateSection}
          onDeleteSection={requestDeleteSection}
          onRequestAddSection={setSectionPickerIndex}
          onInlineEdit={handleInlineEdit}
          onSelectBlock={handleSelectBlock}
          onAddBlock={handleAddBlock}
          onBlockInlineEdit={handleBlockInlineEdit}
          theme={state.theme}
          mediaLibrary={state.mediaLibrary}
          currentPath={activePage?.slug}
        />
        {selectedId === THEME_PANEL_SELECTION ? (
          <ThemePanel
            theme={state.theme}
            onFieldChange={handleThemeFieldChange}
            onApplyPreset={handleApplyThemePreset}
            onSetStorefrontThemeId={handleSetStorefrontThemeId}
            onSetStorefrontThemeMode={handleSetStorefrontThemeMode}
          />
        ) : selectedId === MEDIA_PANEL_SELECTION ? (
          <aside className="w-[280px] min-w-[240px] shrink-0 border-l border-gray-200 bg-white">
            <MediaLibraryPanel
              mode="manage"
              mediaLibrary={state.mediaLibrary}
              state={state}
              onUpload={handleAddMedia}
              onDelete={handleDeleteMedia}
            />
          </aside>
        ) : blockSel && selectedBlock ? (
          <SettingsPanel
            entity={{ type: selectedBlock.type, data: selectedBlock.data }}
            schema={blockTypeDef(null, selectedBlock.type)?.fields ?? {}}
            title={blockTypeDef(null, selectedBlock.type)?.label ?? 'Block'}
            onBack={() => select(blockParentPath.length ? blockSelectionId(blockSel.sectionId, blockParentPath) : blockSel.sectionId)}
            palette={state.theme.colors}
            onFieldChange={handleBlockFieldChange}
            mediaLibrary={state.mediaLibrary}
            onAddMedia={handleAddMedia}
            onOpenLibrary={handleOpenLibraryPicker}
            viewport={viewport}
            footer={
              blockTypeDef(null, selectedBlock.type)?.container ? (
                <BlockList
                  sectionType={selectedBlockSection?.type}
                  addTypes={blockTypeDef(null, selectedBlock.type)?.childTypes}
                  blocks={selectedBlock.blocks}
                  atMax={false}
                  onAdd={(blockType) => handleAddBlock(blockSel.sectionId, blockType, undefined, [...blockParentPath, selectedBlock.id])}
                  onRemove={(childId) => handleRemoveBlock(blockSel.sectionId, childId, [...blockParentPath, selectedBlock.id])}
                  onReorder={(orderedIds) => handleReorderBlocks(blockSel.sectionId, orderedIds, [...blockParentPath, selectedBlock.id])}
                  onSelect={(childId) => handleSelectBlock(blockSel.sectionId, [...blockParentPath, selectedBlock.id, childId])}
                />
              ) : null
            }
            onRemove={() => handleRemoveBlock(blockSel.sectionId, selectedBlock.id, blockParentPath)}
            removeLabel={t('sectionBuilder:editor.blockList.remove', 'Remove block')}
          />
        ) : (
          <SettingsPanel
            entity={selectedEntity}
            palette={state.theme.colors}
            onFieldChange={handleFieldChange}
            mediaLibrary={state.mediaLibrary}
            onAddMedia={handleAddMedia}
            onOpenLibrary={handleOpenLibraryPicker}
            activePage={activePage}
            viewport={viewport}
            footer={
              selectedEntity && sectionSupportsBlocks(selectedEntity.type) ? (
                <BlockList
                  sectionType={selectedEntity.type}
                  blocks={selectedEntity.blocks}
                  atMax={isAtBlockMax(selectedEntity.type, selectedEntity.blocks)}
                  onAdd={(blockType) => handleAddBlock(selectedId, blockType)}
                  onRemove={(blockId) => handleRemoveBlock(selectedId, blockId)}
                  onReorder={(orderedIds) => handleReorderBlocks(selectedId, orderedIds)}
                  onSelect={(blockId) => handleSelectBlock(selectedId, blockId)}
                />
              ) : null
            }
            onRemove={
              selectedId && selectedId !== 'header' && selectedId !== 'footer' && sections.some((s) => s.id === selectedId)
                ? () => requestDeleteSection(selectedId)
                : undefined
            }
          />
        )}
      </div>

      <PublishDrawer
        open={publishDrawerOpen}
        checkState={publishCheckState}
        onToggleCheck={handleToggleCheck}
        onPublishAnyway={runPublish}
        onClose={() => setPublishDrawerOpen(false)}
      />

      <SectionPickerModal
        open={sectionPickerIndex !== null}
        onClose={() => setSectionPickerIndex(null)}
        onPick={(type) => {
          handleAddSectionAt(type, sectionPickerIndex);
          setSectionPickerIndex(null);
        }}
        theme={state.theme}
        mediaLibrary={state.mediaLibrary}
      />

      <ConfirmDialog
        open={deleteTargetId !== null}
        title={t('sectionBuilder:editor.canvas.deleteConfirm.heading', 'Delete this section?')}
        description={t('sectionBuilder:editor.canvas.deleteConfirm.message', "This can't be undone.")}
        confirmLabel={t('sectionBuilder:editor.common.delete')}
        danger
        onConfirm={() => {
          handleDeleteSection(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />

      <ConfirmDialog
        open={discardConfirmOpen}
        title={t('sectionBuilder:editor.sectionBuilder.discardConfirm.title')}
        confirmLabel={t('sectionBuilder:editor.sectionBuilder.discardConfirm.confirmLabel')}
        danger
        onConfirm={confirmDiscard}
        onCancel={() => setDiscardConfirmOpen(false)}
      />

      <ConfirmDialog
        open={exitConfirmOpen}
        title={t('sectionBuilder:editor.sectionBuilder.exitConfirm.title')}
        confirmLabel={t('sectionBuilder:editor.sectionBuilder.exitConfirm.confirmLabel')}
        danger
        onConfirm={confirmExit}
        onCancel={() => setExitConfirmOpen(false)}
      />

      {publishToastOpen && (
        <Snackbar
          message={t('sectionBuilder:editor.sectionBuilder.publishSuccess.message')}
          variant="success"
          action={{ label: t('sectionBuilder:editor.sectionBuilder.publishSuccess.viewLiveStore'), onClick: handleViewLiveStore }}
          onClose={() => setPublishToastOpen(false)}
        />
      )}

      {mediaPicker && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 border-l border-gray-200 bg-white shadow-xl">
          <MediaLibraryPanel
            mode="picker"
            mediaLibrary={state.mediaLibrary}
            state={state}
            onUpload={handleAddMedia}
            onPick={(item) => {
              mediaPicker.onPick(item);
              setMediaPicker(null);
            }}
            onClose={() => setMediaPicker(null)}
          />
        </div>
      )}
    </div>
    </LocaleProvider>
  );
}
