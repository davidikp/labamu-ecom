import { memo, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { labelForType } from '../sections/registry';
import { SECTION_DEFINITIONS } from '../sections/index';
import { Plus, ArrowUp, ArrowDown, Copy, Trash2 } from 'lucide-react';
import { MAX_SECTIONS_PER_PAGE } from '../state/builderReducer';
import { parseBlockSelection, isAtBlockMax, createBlockCtx } from '../sections/blockHelpers';
import SectionShell from './SectionShell';
import { applyThemeToElement } from '../themes/applyTheme';
import { BREAKPOINTS } from '../themes/breakpoints';

const RenderedEntity = memo(function RenderedEntity({ entity, theme, mediaLibrary, onEdit, blockCtx, isMobile, breakpoint, onNavigate, currentPath }) {
  const { t } = useTranslation();
  const Renderer = SECTION_DEFINITIONS[entity.type]?.Renderer;
  if (!Renderer) {
    return <p className="p-6 text-xs text-gray-400">{t('sectionBuilder:editor.canvas.unknownSectionType', { type: entity.type })}</p>;
  }
  return (
    <SectionShell data={entity.data ?? {}} theme={theme} breakpoint={breakpoint}>
      <Renderer
        data={entity.data ?? {}}
        blocks={entity.blocks ?? []}
        theme={theme}
        mediaLibrary={mediaLibrary}
        isBuilder
        onEdit={onEdit}
        blockCtx={blockCtx}
        isMobile={isMobile}
        // Additive alongside `isMobile` (Phase 0 — see themes/breakpoints.js).
        // Existing Renderers ignore an unknown prop; new/responsive-aware
        // fields resolve against this instead of the boolean.
        breakpoint={breakpoint}
        onNavigate={onNavigate}
        currentPath={currentPath}
      />
    </SectionShell>
  );
});

const GlobalBlock = memo(function GlobalBlock({ entity, selected, onSelect, onInlineEdit, theme, mediaLibrary, readOnly, isMobile, breakpoint, onNavigate, currentPath }) {
  const { t } = useTranslation();
  const handleEdit = useCallback(
    (key, value) => onInlineEdit?.(entity.type, key, value),
    [onInlineEdit, entity.type]
  );
  if (entity.hidden) {
    // On the live storefront a hidden header/footer simply isn't rendered;
    // the "hidden" placeholder is a builder-only affordance.
    if (readOnly) return null;
    return (
      <div
        onClick={() => onSelect(entity.type)}
        className="cursor-pointer border-b border-dashed border-gray-200 bg-gray-50 p-3 text-center text-xs text-gray-400"
      >
        {t('sectionBuilder:editor.canvas.hiddenLabel', { label: labelForType(entity.type) })}
      </div>
    );
  }
  return (
    <div
      onClick={readOnly ? undefined : () => onSelect(entity.type)}
      className={'relative ' + (readOnly ? '' : 'cursor-pointer ') + (selected ? 'outline outline-2 outline-blue-500' : '')}
    >
      {selected && !readOnly && (
        <span className="absolute left-2 top-2 z-10 rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {labelForType(entity.type)}
        </span>
      )}
      <RenderedEntity
        entity={entity}
        theme={theme}
        mediaLibrary={mediaLibrary}
        onEdit={readOnly ? undefined : handleEdit}
        isMobile={isMobile}
        breakpoint={breakpoint}
        // Nav links only navigate on the read-only preview/live render — in
        // the interactive builder, clicking one should select the header
        // (the wrapping div's onClick above) rather than jump the merchant
        // away from what they're editing.
        onNavigate={readOnly ? onNavigate : undefined}
        currentPath={currentPath}
      />
    </div>
  );
});

/**
 * US-10.2 — memoized so editing one section's data (which only changes that
 * section's own object reference, see builderReducer.js's updatePage) does
 * not re-render sibling sections. `onSelect`/`onMove`/`onDuplicate`/`onDelete`
 * are the raw stable callbacks from SectionBuilder (useCallback'd there);
 * this component binds `section.id` itself so the props it receives never
 * change identity for unrelated edits.
 */
const SectionBlock = memo(function SectionBlock({ section, index, count, selectedId, onSelect, onMove, onDuplicate, onDelete, onInlineEdit, onSelectBlock, onAddBlock, onBlockInlineEdit, onRequestAdd, canAdd, theme, mediaLibrary, isMobile, breakpoint }) {
  const { t } = useTranslation();
  const selected = selectedId === section.id;
  const handleEdit = useCallback(
    (key, value) => onInlineEdit?.(section.id, key, value),
    [onInlineEdit, section.id]
  );

  // Builder-only block interaction context handed to the Renderer. Bound to
  // this section's id so blocks select/edit/add against the right section.
  // createBlockCtx recurses to any nesting depth via .childCtxFor(blockId).
  const blockSel = parseBlockSelection(selectedId);
  const inThisSection = blockSel?.sectionId === section.id;
  const selPath = inThisSection ? blockSel.path : [];
  const blockCtx = onSelectBlock
    ? createBlockCtx(section.id, [], selPath, {
        atMax: isAtBlockMax(section.type, section.blocks),
        sectionActive: selected,
        onSelectBlock,
        onBlockInlineEdit,
        onAddBlock,
      })
    : undefined;

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(section.id);
  };

  return (
    <div
      onClick={() => onSelect(section.id)}
      className={'group relative cursor-pointer ' + (selected ? 'z-10' : '')}
    >
      {selected && (
        <>
          {/* Inset overlay border — reliable on all four edges regardless of
              neighbouring full-bleed sections (an `outline` gets painted over
              by later positioned siblings like the footer). */}
          <div className="pointer-events-none absolute inset-0 z-20 border-2 border-blue-500" />
          <span className="absolute left-2 top-2 z-20 rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {labelForType(section.type)}
          </span>
        </>
      )}

      {/* Persistent "Add section" buttons above and below the active section
          (US-3.x). Clicking opens the modal picker at the right index. */}
      {selected && canAdd && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRequestAdd(index); }}
            className="absolute -top-3.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white shadow-md hover:bg-blue-700"
          >
            <Plus size={13} /> {t('sectionBuilder:editor.canvas.insertSection', 'Add section')}
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRequestAdd(index + 1); }}
            className="absolute -bottom-3.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white shadow-md hover:bg-blue-700"
          >
            <Plus size={13} /> {t('sectionBuilder:editor.canvas.insertSection', 'Add section')}
          </button>
        </>
      )}

      <div className="absolute right-2 top-2 z-10 hidden items-center gap-1 rounded-md border border-gray-200 bg-white p-0.5 shadow-sm group-hover:flex">
        <button
          type="button"
          title={t('sectionBuilder:editor.canvas.moveUp')}
          aria-label="Move section up"
          disabled={index === 0}
          onClick={(e) => { e.stopPropagation(); onMove(section.id, -1); }}
          className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
        >
          <ArrowUp size={14} />
        </button>
        <button
          type="button"
          title={t('sectionBuilder:editor.canvas.moveDown')}
          aria-label="Move section down"
          disabled={index === count - 1}
          onClick={(e) => { e.stopPropagation(); onMove(section.id, 1); }}
          className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
        >
          <ArrowDown size={14} />
        </button>
        <button
          type="button"
          title={t('sectionBuilder:editor.canvas.duplicate')}
          aria-label="Duplicate section"
          onClick={(e) => { e.stopPropagation(); onDuplicate(section.id); }}
          className="rounded p-1 text-gray-600 hover:bg-gray-100"
        >
          <Copy size={14} />
        </button>
        <button
          type="button"
          title={t('sectionBuilder:editor.common.delete')}
          aria-label="Delete section"
          onClick={handleDeleteClick}
          className="rounded p-1 text-red-600 hover:bg-red-50"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <RenderedEntity entity={section} theme={theme} mediaLibrary={mediaLibrary} onEdit={handleEdit} blockCtx={blockCtx} isMobile={isMobile} breakpoint={breakpoint} />
    </div>
  );
});

/**
 * Center canvas (US-1.1, US-2.1, US-3.3, US-3.4, US-3.6). Renders each
 * section's real Renderer (Epic 11) with a selection outline + hover action
 * bar layered on top.
 */
export default function Canvas({
  viewport,
  header,
  footer,
  sections,
  selectedId,
  onSelect,
  onDeselect,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
  onRequestAddSection,
  onInlineEdit,
  onSelectBlock,
  onAddBlock,
  onBlockInlineEdit,
  theme,
  mediaLibrary,
  readOnly = false,
  onNavigate,
  currentPath,
}) {
  const { t } = useTranslation();
  const isMobile = viewport === 'mobile';
  // `fit` has no fixed device width — it stretches to the canvas panel
  // itself (see themes/breakpoints.js), same as the existing `maxWidth:
  // '100%'` clamp already does for narrower panels.
  const width = BREAKPOINTS[viewport]?.width ?? '100%';
  const atCap = sections.length >= MAX_SECTIONS_PER_PAGE;
  const canInsert = !readOnly && !!onRequestAddSection && !atCap;
  const pageFrameRef = useRef(null);

  // Phase 4 — storefront theme layer (opt-in, separate from the existing
  // flat-preset `theme.colors`/`theme.typography` system). Only applies
  // `--theme-*` custom properties when a storefront theme has been
  // explicitly selected; storefrontThemeId defaults to null so existing
  // drafts/stores see zero visual change here.
  useEffect(() => {
    if (!theme?.storefrontThemeId) return;
    try {
      applyThemeToElement(pageFrameRef.current, theme.storefrontThemeId, theme.storefrontThemeMode || 'light');
    } catch (err) {
      console.error('Canvas: failed to apply storefront theme', {
        themeId: theme.storefrontThemeId,
        mode: theme.storefrontThemeMode,
        err,
      });
    }
  }, [theme?.storefrontThemeId, theme?.storefrontThemeMode]);

  return (
    <div className="min-w-[480px] flex-1 overflow-auto bg-gray-50 p-6" onClick={onDeselect}>
      <div
        ref={pageFrameRef}
        onClick={(e) => e.stopPropagation()}
        className={
          'mx-auto bg-white ' +
          (isMobile ? 'rounded-2xl border border-gray-300 shadow-sm' : 'shadow-sm')
        }
        style={{ width, maxWidth: '100%' }}
      >
        <GlobalBlock
          entity={header}
          selected={selectedId === 'header'}
          onSelect={onSelect}
          onInlineEdit={onInlineEdit}
          theme={theme}
          mediaLibrary={mediaLibrary}
          readOnly={readOnly}
          isMobile={isMobile}
          breakpoint={viewport}
          onNavigate={onNavigate}
          currentPath={currentPath}
        />

        {sections.length === 0 ? (
          !readOnly && (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-sm text-gray-400">
              {t('sectionBuilder:editor.canvas.empty')}
              {!readOnly && !!onRequestAddSection && (
                <button
                  type="button"
                  onClick={() => onRequestAddSection(0)}
                  className="flex items-center gap-1 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  <Plus size={14} /> {t('sectionBuilder:editor.canvas.insertSection', 'Add section')}
                </button>
              )}
            </div>
          )
        ) : readOnly ? (
          sections.map((section) => (
            <RenderedEntity key={section.id} entity={section} theme={theme} mediaLibrary={mediaLibrary} isMobile={isMobile} breakpoint={viewport} />
          ))
        ) : (
          sections.map((section, index) => (
            <SectionBlock
              key={section.id}
              section={section}
              index={index}
              count={sections.length}
              selectedId={selectedId}
              onSelect={onSelect}
              onMove={onMoveSection}
              onDuplicate={onDuplicateSection}
              onDelete={onDeleteSection}
              onInlineEdit={onInlineEdit}
              onSelectBlock={onSelectBlock}
              onAddBlock={onAddBlock}
              onBlockInlineEdit={onBlockInlineEdit}
              onRequestAdd={onRequestAddSection}
              canAdd={canInsert}
              theme={theme}
              mediaLibrary={mediaLibrary}
              isMobile={isMobile}
              breakpoint={viewport}
            />
          ))
        )}

        <GlobalBlock
          entity={footer}
          selected={selectedId === 'footer'}
          onSelect={onSelect}
          onInlineEdit={onInlineEdit}
          theme={theme}
          mediaLibrary={mediaLibrary}
          readOnly={readOnly}
          isMobile={isMobile}
          breakpoint={viewport}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
