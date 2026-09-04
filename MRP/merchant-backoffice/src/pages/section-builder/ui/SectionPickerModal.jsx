import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  ChevronDown,
  X,
  LayoutTemplate,
  ShoppingBag,
  BookOpen,
  Star,
  Megaphone,
  Image as ImageIcon,
  Wrench,
} from 'lucide-react';
import { SECTION_REGISTRY, SECTION_CATEGORIES } from '../sections/registry';
import { SECTION_DEFINITIONS, schemaForType } from '../sections/index';
import { defaultsForSchema } from '../sections/schemaDefaults';
import { seedBlocks } from '../sections/blockHelpers';
import SectionShell from './SectionShell';

const CATEGORY_ICON = {
  hero: LayoutTemplate,
  product: ShoppingBag,
  brand: BookOpen,
  social: Star,
  marketing: Megaphone,
  media: ImageIcon,
  utility: Wrench,
};

const CATEGORY_ORDER = Object.keys(SECTION_CATEGORIES);

/**
 * Live preview of a section rendered with its default content. Uses CSS
 * `zoom` so a full desktop-width render (1024px) shrinks to fit the preview
 * pane — layout box included — without manual transform/height juggling.
 */
function SectionPreview({ type, theme, mediaLibrary }) {
  const data = useMemo(() => defaultsForSchema(schemaForType(type)), [type]);
  const blocks = useMemo(() => seedBlocks(type), [type]);
  const Renderer = SECTION_DEFINITIONS[type]?.Renderer;
  if (!Renderer) return null;
  return (
    <div className="pointer-events-none w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div style={{ width: 1024, zoom: 0.52 }}>
        <SectionShell data={data} theme={theme}>
          <Renderer data={data} blocks={blocks} theme={theme} mediaLibrary={mediaLibrary} />
        </SectionShell>
      </div>
    </div>
  );
}

/**
 * Add-section picker (Shopify-style): searchable, categorized list on the
 * left with a live preview of the highlighted section on the right. Inserts
 * the chosen type at a caller-supplied index via `onPick`.
 */
export default function SectionPickerModal({ open, onClose, onPick, theme, mediaLibrary = [] }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState({});
  const [active, setActive] = useState(SECTION_REGISTRY[0]?.type ?? null);

  // Reset transient state each time the modal opens.
  useEffect(() => {
    if (open) {
      setQuery('');
      setCollapsed({});
      setActive(SECTION_REGISTRY[0]?.type ?? null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      q
        ? SECTION_REGISTRY.filter(
            (e) => e.label.toLowerCase().includes(q) || (e.description ?? '').toLowerCase().includes(q)
          )
        : SECTION_REGISTRY,
    [q]
  );

  const grouped = useMemo(() => {
    const acc = {};
    filtered.forEach((e) => {
      (acc[e.category] ??= []).push(e);
    });
    return acc;
  }, [filtered]);

  const categories = CATEGORY_ORDER.filter((c) => grouped[c]?.length);

  // Keep the preview pointing at a still-visible item as the search narrows.
  useEffect(() => {
    if (filtered.length && !filtered.some((e) => e.type === active)) {
      setActive(filtered[0].type);
    }
  }, [filtered, active]);

  if (!open) return null;

  const activeEntry = SECTION_REGISTRY.find((e) => e.type === active);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative flex h-[600px] max-h-[90vh] w-[920px] max-w-[95vw] overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Left: search + categorized list */}
        <div className="flex w-[340px] shrink-0 flex-col border-r border-gray-200">
          <div className="border-b border-gray-100 p-3">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('sectionBuilder:editor.sectionPicker.searchPlaceholder', 'Search sections')}
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {categories.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-400">
                {t('sectionBuilder:editor.sectionPicker.noResults', 'No sections found')}
              </p>
            ) : (
              categories.map((category) => {
                const CatIcon = CATEGORY_ICON[category] ?? LayoutTemplate;
                const isCollapsed = !q && collapsed[category];
                return (
                  <div key={category} className="mb-1">
                    <button
                      type="button"
                      onClick={() => setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }))}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[13px] font-semibold text-gray-800 hover:bg-gray-50"
                    >
                      <span>{SECTION_CATEGORIES[category]}</span>
                      <ChevronDown
                        size={15}
                        className={'text-gray-400 transition-transform ' + (isCollapsed ? '-rotate-90' : '')}
                      />
                    </button>
                    {!isCollapsed && (
                      <ul>
                        {grouped[category].map((entry) => {
                          const isActive = entry.type === active;
                          return (
                            <li key={entry.type}>
                              <button
                                type="button"
                                onMouseEnter={() => setActive(entry.type)}
                                onFocus={() => setActive(entry.type)}
                                onClick={() => onPick(entry.type)}
                                className={
                                  'flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm ' +
                                  (isActive ? 'bg-blue-50 text-blue-900' : 'text-gray-700 hover:bg-gray-50')
                                }
                              >
                                <CatIcon size={16} className={isActive ? 'text-blue-500' : 'text-gray-400'} />
                                <span className="truncate">{entry.label}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: preview of the highlighted section */}
        <div className="relative flex min-w-0 flex-1 flex-col bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('sectionBuilder:editor.common.close')}
            className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200"
          >
            <X size={16} />
          </button>

          {activeEntry ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
              <div className="flex flex-1 items-center">
                <SectionPreview type={activeEntry.type} theme={theme} mediaLibrary={mediaLibrary} />
              </div>
              <div className="pt-4">
                <h3 className="text-base font-semibold text-gray-900">{activeEntry.label}</h3>
                {activeEntry.description && (
                  <p className="mt-1 text-sm text-gray-500">{activeEntry.description}</p>
                )}
                <button
                  type="button"
                  onClick={() => onPick(activeEntry.type)}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {t('sectionBuilder:editor.sectionPicker.addThisSection', 'Add this section')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
              {t('sectionBuilder:editor.sectionPicker.noResults', 'No sections found')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
