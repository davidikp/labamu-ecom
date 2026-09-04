import { useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, X, ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { slugify, isSlugTaken, defaultMetaTitle } from '../sections/pageHelpers';
import { shouldShowCounter } from './fields/fieldHelpers';
import ConfirmDialog from './ConfirmDialog';

const META_TITLE_MAX = 60;
const META_DESCRIPTION_MAX = 160;

function CharCounter({ value, max }) {
  if (!shouldShowCounter(value, max)) return null;
  const over = (value ?? '').length >= max;
  return (
    <p className={'mt-0.5 text-right text-[11px] ' + (over ? 'text-red-600' : 'text-gray-400')}>
      {(value ?? '').length}/{max}
    </p>
  );
}

function AddPageForm({ pages, onAdd }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);

  const effectiveSlug = slug || slugify(name);
  const taken = effectiveSlug.length > 0 && isSlugTaken(effectiveSlug, pages);

  const reset = () => {
    setOpen(false);
    setName('');
    setSlug('');
    setSlugEdited(false);
  };

  const submit = () => {
    if (!name.trim() || !effectiveSlug || taken) return;
    onAdd({ name: name.trim(), slug: effectiveSlug });
    reset();
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 w-full rounded-md border border-dashed border-gray-300 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
      >
        {t('sectionBuilder:editor.pagesPanel.addPage')}
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-md border border-gray-200 p-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">{t('sectionBuilder:editor.pagesPanel.pageNameLabel')}</label>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugEdited) setSlug(slugify(e.target.value));
          }}
          placeholder={t('sectionBuilder:editor.pagesPanel.pageNamePlaceholder')}
          className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">{t('sectionBuilder:editor.pagesPanel.slugLabel')}</label>
        <input
          type="text"
          value={effectiveSlug}
          onChange={(e) => {
            setSlugEdited(true);
            setSlug(slugify(e.target.value));
          }}
          className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        {taken && <p className="mt-1 text-xs text-red-600">{t('sectionBuilder:editor.pagesPanel.slugInUse')}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={reset} className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50">
          {t('sectionBuilder:editor.common.cancel')}
        </button>
        <button
          type="button"
          disabled={!name.trim() || !effectiveSlug || taken}
          onClick={submit}
          className="rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-40"
        >
          {t('sectionBuilder:editor.pagesPanel.create')}
        </button>
      </div>
    </div>
  );
}

function SeoFields({ page, storeName, onUpdateSeo }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const metaTitle = page.seo?.metaTitle ?? '';
  const metaDescription = page.seo?.metaDescription ?? '';
  const displayTitle = metaTitle || defaultMetaTitle(page.name, storeName);

  return (
    <div className="mt-1 border-t border-gray-100 pt-1">
      <button type="button" onClick={() => setExpanded((v) => !v)} className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-700">
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />} {t('sectionBuilder:editor.pagesPanel.seoHeading')}
      </button>
      {expanded && (
        <div className="mt-2 space-y-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-gray-700">{t('sectionBuilder:editor.pagesPanel.metaTitleLabel')}</label>
            <input
              type="text"
              value={metaTitle}
              maxLength={META_TITLE_MAX}
              placeholder={defaultMetaTitle(page.name, storeName)}
              onChange={(e) => onUpdateSeo(page.id, { metaTitle: e.target.value })}
              className="w-full rounded-md border border-gray-200 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <CharCounter value={metaTitle} max={META_TITLE_MAX} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-gray-700">{t('sectionBuilder:editor.pagesPanel.metaDescriptionLabel')}</label>
            <textarea
              rows={2}
              value={metaDescription}
              maxLength={META_DESCRIPTION_MAX}
              placeholder={t('sectionBuilder:editor.pagesPanel.metaDescriptionPlaceholder')}
              onChange={(e) => onUpdateSeo(page.id, { metaDescription: e.target.value })}
              className="w-full rounded-md border border-gray-200 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <CharCounter value={metaDescription} max={META_DESCRIPTION_MAX} />
          </div>
          <div className="rounded-md bg-gray-50 p-2">
            <p className="truncate text-[11px] text-blue-800">{displayTitle}</p>
            <p className="truncate text-[10px] text-green-700">yourstore.com{page.slug}</p>
            <p className="line-clamp-2 text-[10px] text-gray-500">
              {metaDescription || t('sectionBuilder:editor.pagesPanel.metaDescriptionPlaceholder')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function PageRow({ page, active, isSystem, storeName, onSelect, onRename, onDelete, onUpdateSeo, onToggleNavHidden, onMove, moveDisabled }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(page.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const commitRename = () => {
    if (draftName.trim()) onRename(page.id, draftName.trim());
    setEditing(false);
  };

  return (
    <li className={'rounded-md px-2 py-1.5 ' + (active ? 'bg-blue-50' : 'hover:bg-gray-50')}>
      <div className="flex items-center gap-2">
        {onMove && (
          <div className="flex shrink-0 flex-col">
            <button
              type="button"
              aria-label={t('sectionBuilder:editor.canvas.moveUp')}
              disabled={moveDisabled?.up}
              onClick={() => onMove(page.id, -1)}
              className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
            >
              <ArrowUp size={12} />
            </button>
            <button
              type="button"
              aria-label={t('sectionBuilder:editor.canvas.moveDown')}
              disabled={moveDisabled?.down}
              onClick={() => onMove(page.id, 1)}
              className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
            >
              <ArrowDown size={12} />
            </button>
          </div>
        )}
        {editing ? (
          <input
            autoFocus
            type="text"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => e.key === 'Enter' && commitRename()}
            className="min-w-0 flex-1 rounded border border-gray-200 px-1 py-0.5 text-sm"
          />
        ) : (
          <button type="button" onClick={() => onSelect(page.id)} className="min-w-0 flex-1 truncate text-left text-sm text-gray-800">
            {page.name}
          </button>
        )}
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">{page.type}</span>

        {!isSystem && !editing && (
          <button type="button" aria-label={t('sectionBuilder:editor.pagesPanel.rename')} onClick={() => setEditing(true)} className="text-gray-400 hover:text-gray-700">
            <Pencil size={13} />
          </button>
        )}
        {isSystem ? (
          <button
            type="button"
            title={page.hiddenFromNav ? t('sectionBuilder:editor.pagesPanel.showNav') : t('sectionBuilder:editor.pagesPanel.hideNav')}
            onClick={() => onToggleNavHidden(page.id)}
            className="text-[11px] text-gray-500 hover:text-gray-700"
          >
            {page.hiddenFromNav ? t('sectionBuilder:editor.pagesPanel.showNav') : t('sectionBuilder:editor.pagesPanel.hideNav')}
          </button>
        ) : (
          <button type="button" aria-label={t('sectionBuilder:editor.common.delete')} onClick={() => setConfirmingDelete(true)} className="text-gray-400 hover:text-red-600">
            <X size={14} />
          </button>
        )}
      </div>

      <SeoFields page={page} storeName={storeName} onUpdateSeo={onUpdateSeo} />

      <ConfirmDialog
        open={confirmingDelete}
        title={t('sectionBuilder:editor.pagesPanel.deleteConfirmHeading', 'Delete page?')}
        description={t('sectionBuilder:editor.pagesPanel.deleteConfirmTitle', { name: page.name })}
        confirmLabel={t('sectionBuilder:editor.common.delete')}
        danger
        onConfirm={() => {
          onDelete(page.id);
          setConfirmingDelete(false);
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </li>
  );
}

/** Pages tab (US-6.1..US-6.6). */
export default function PagesPanel({ pages, activePageId, storeName, onSelectPage, onAddPage, onRenamePage, onDeletePage, onUpdateSeo, onToggleNavHidden, onReorderPages }) {
  const { t } = useTranslation();
  const systemPages = pages.filter((p) => p.type === 'system');
  const customPages = pages.filter((p) => p.type === 'custom');

  // Only custom pages are reorderable — system pages (Home, Product,
  // Collection, Cart, Checkout) have a fixed, meaningful order. Moving a
  // custom page swaps it within that sub-list, then re-derives the full
  // pages array's id order (system pages first, unchanged) for REORDER_PAGES.
  const handleMoveCustomPage = (pageId, direction) => {
    const idx = customPages.findIndex((p) => p.id === pageId);
    const targetIdx = idx + direction;
    if (idx === -1 || targetIdx < 0 || targetIdx >= customPages.length) return;
    const reordered = [...customPages];
    [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx], reordered[idx]];
    onReorderPages([...systemPages, ...reordered].map((p) => p.id));
  };

  return (
    <div className="flex min-h-0 flex-1 w-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">{t('sectionBuilder:editor.pagesPanel.heading')}</h2>
        <span className="text-xs text-gray-400">{t('sectionBuilder:editor.pagesPanel.pageCount', { n: pages.length })}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">{t('sectionBuilder:editor.pagesPanel.systemPages')}</p>
        <ul className="space-y-1">
          {systemPages.map((page) => (
            <PageRow
              key={page.id}
              page={page}
              isSystem
              active={page.id === activePageId}
              storeName={storeName}
              onSelect={onSelectPage}
              onRename={onRenamePage}
              onDelete={onDeletePage}
              onUpdateSeo={onUpdateSeo}
              onToggleNavHidden={onToggleNavHidden}
            />
          ))}
        </ul>

        <p className="mt-3 px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">{t('sectionBuilder:editor.pagesPanel.customPages')}</p>
        {customPages.length === 0 ? (
          <p className="p-3 text-sm text-gray-500">{t('sectionBuilder:editor.pagesPanel.noCustomPages')}</p>
        ) : (
          <ul className="space-y-1">
            {customPages.map((page, index) => (
              <PageRow
                key={page.id}
                page={page}
                isSystem={false}
                active={page.id === activePageId}
                storeName={storeName}
                onSelect={onSelectPage}
                onRename={onRenamePage}
                onDelete={onDeletePage}
                onUpdateSeo={onUpdateSeo}
                onToggleNavHidden={onToggleNavHidden}
                onMove={onReorderPages ? handleMoveCustomPage : undefined}
                moveDisabled={{ up: index === 0, down: index === customPages.length - 1 }}
              />
            ))}
          </ul>
        )}

        <AddPageForm pages={pages} onAdd={onAddPage} />
      </div>
    </div>
  );
}
