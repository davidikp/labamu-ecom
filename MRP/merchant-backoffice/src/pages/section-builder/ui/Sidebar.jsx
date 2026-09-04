import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Image as ImageIcon, Palette, PanelLeft, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tabs, IconBtn } from '../../../ce-ui';
import { useCompactSidebar } from '../hooks/useCompactSidebar';
import SectionListItem from './SectionListItem';
import PagesPanel from './PagesPanel';
import { MAX_SECTIONS_PER_PAGE } from '../state/builderReducer';

function GlobalRow({ label, hidden, onToggleHidden, selected, onSelect }) {
  const { t } = useTranslation();
  return (
    <div
      className={
        'flex items-center justify-between rounded-md px-3 py-2 text-sm ' +
        (selected ? 'bg-blue-50 text-blue-900' : 'text-gray-700')
      }
    >
      <button type="button" onClick={onSelect} className="min-w-0 flex-1 truncate text-left">
        {label} {hidden && <span className="text-gray-400">{t('sectionBuilder:editor.sidebar.hiddenSuffix')}</span>}
      </button>
      <button
        type="button"
        onClick={onToggleHidden}
        className="rounded px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-100"
      >
        {hidden ? t('sectionBuilder:editor.sidebar.show') : t('sectionBuilder:editor.sidebar.hide')}
      </button>
    </div>
  );
}

/**
 * Left sidebar (US-1.1, US-1.3, US-3.1..US-3.6). Header/footer are fixed,
 * globally-scoped rows above/below the reorderable middle section list.
 */
export default function Sidebar({
  header,
  footer,
  sections,
  selectedId,
  onSelect,
  onToggleGlobalHidden,
  onReorder,
  onSelectBlock,
  onAddBlock,
  onMoveBlock,
  onRequestAddSection,
  onOpenTheme,
  onOpenMedia,
  pages,
  activePageId,
  storeName,
  onSelectPage,
  onAddPage,
  onRenamePage,
  onDeletePage,
  onUpdatePageSeo,
  onTogglePageNavHidden,
  onReorderPages,
}) {
  const { t } = useTranslation();
  const isCompact = useCompactSidebar();
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [tab, setTab] = useState('sections');

  // US-10.4 — keyboard-operable reorder: Tab to the drag handle, Space to
  // pick up, Arrow keys to move, Space to drop (dnd-kit's standard
  // accessible pattern — the spec describes Alt+Arrow specifically, which
  // dnd-kit doesn't support out of the box; this is the closest equivalent
  // without a custom keyboard coordinate getter).
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = sections.map((s) => s.id);
    const from = ids.indexOf(active.id);
    const to = ids.indexOf(over.id);
    onReorder(arrayMove(ids, from, to));
  };

  const tabBar = (
    <div className="border-b border-gray-100">
      <Tabs
        tabs={[
          { id: 'sections', label: t('sectionBuilder:editor.sidebar.sectionsTab'), count: sections.length },
          { id: 'pages', label: t('sectionBuilder:editor.sidebar.pagesTab'), count: pages.length },
        ]}
        activeTab={tab}
        onChange={setTab}
      />
      <div className="flex items-center justify-between px-3 py-2">
        {tab === 'sections' ? (
          <span className="text-xs text-gray-400">
            {t('sectionBuilder:editor.sidebar.sectionCount', { n: sections.length, max: MAX_SECTIONS_PER_PAGE })}
          </span>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1">
          <IconBtn
            icon={<ImageIcon size={16} />}
            variant="ghost"
            size="sm"
            aria-label={t('sectionBuilder:editor.sidebar.mediaLibraryAriaLabel')}
            onClick={onOpenMedia}
          />
          <IconBtn
            icon={<Palette size={16} />}
            variant="ghost"
            size="sm"
            aria-label={t('sectionBuilder:editor.sidebar.themeSettingsAriaLabel')}
            onClick={onOpenTheme}
          />
        </div>
      </div>
    </div>
  );

  const sectionsBody = (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">{t('sectionBuilder:editor.sidebar.globalHeading')}</p>
        <GlobalRow
          label={t('sectionBuilder:editor.sidebar.header')}
          hidden={header.hidden}
          onToggleHidden={() => onToggleGlobalHidden('header')}
          selected={selectedId === 'header'}
          onSelect={() => onSelect('header')}
        />

        <div className="my-2 border-t border-gray-100" />

        {sections.length === 0 ? (
          <p className="p-3 text-sm text-gray-500">{t('sectionBuilder:editor.sidebar.emptySections')}</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <ul className="space-y-1">
                {sections.map((section) => (
                  <SectionListItem
                    key={section.id}
                    section={section}
                    selectedId={selectedId}
                    onSelect={() => onSelect(section.id)}
                    onSelectBlock={onSelectBlock}
                    onAddBlock={onAddBlock}
                    onMoveBlock={onMoveBlock}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}

        {onRequestAddSection && (
          <button
            type="button"
            onClick={onRequestAddSection}
            className="mt-1 flex w-full items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            <Plus size={16} /> {t('sectionBuilder:editor.sidebar.addSection', 'Add section')}
          </button>
        )}

        <div className="my-2 border-t border-gray-100" />
        <GlobalRow
          label={t('sectionBuilder:editor.sidebar.footer')}
          hidden={footer.hidden}
          onToggleHidden={() => onToggleGlobalHidden('footer')}
          selected={selectedId === 'footer'}
          onSelect={() => onSelect('footer')}
        />
      </div>
    </>
  );

  const body = (
    <div className="flex h-full min-h-0 w-full flex-col">
      {tabBar}
      {tab === 'sections' ? (
        sectionsBody
      ) : (
        <PagesPanel
          pages={pages}
          activePageId={activePageId}
          storeName={storeName}
          onSelectPage={onSelectPage}
          onAddPage={onAddPage}
          onRenamePage={onRenamePage}
          onDeletePage={onDeletePage}
          onUpdateSeo={onUpdatePageSeo}
          onToggleNavHidden={onTogglePageNavHidden}
          onReorderPages={onReorderPages}
        />
      )}
    </div>
  );

  if (!isCompact) {
    return <nav className="w-[280px] min-w-[240px] shrink-0 border-r border-gray-200 bg-white">{body}</nav>;
  }

  return (
    <nav className="relative w-14 shrink-0 border-r border-gray-200 bg-white">
      <div className="flex flex-col items-center gap-2 py-3">
        <button
          type="button"
          title={t('sectionBuilder:editor.sidebar.sectionsHeadingCompact')}
          aria-label={t('sectionBuilder:editor.sidebar.sectionsHeadingCompact')}
          onClick={() => setOverlayOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
        >
          <PanelLeft size={18} />
        </button>
      </div>

      {overlayOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOverlayOpen(false)} />
          <div className="absolute left-14 top-0 z-50 h-full w-[280px] border-r border-gray-200 bg-white shadow-lg">
            {body}
          </div>
        </>
      )}
    </nav>
  );
}
