import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MediaUploadField } from '../../../ce-ui';
import { matchesSearch, findUsages } from '../sections/mediaHelpers';
import { labelForType } from '../sections/registry';
import ConfirmDialog from './ConfirmDialog';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_BYTES = 10 * 1024 * 1024;

function probeDimensions(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: null, height: null });
    img.src = dataUrl;
  });
}

/**
 * Always renders as an empty dropzone — `items` is permanently `[]` so
 * ce-ui's MediaUploadField never switches into its own thumbnail-grid view;
 * this panel has its own custom grid below (search, delete-with-in-use-check)
 * that MediaUploadField has no equivalent for. Validation (type/size) happens
 * here in onAdd since the component itself only shows a size hint, no
 * enforcement — same caveat as ui/fields/ImageField.jsx.
 */
function UploadZone({ onUpload }) {
  const { t } = useTranslation();
  const [error, setError] = useState(null);

  const handleAdd = async (payload) => {
    if (!ACCEPTED_TYPES.includes(payload.file.type)) {
      setError(t('sectionBuilder:editor.mediaLibraryPanel.unsupportedFileType'));
      return;
    }
    if (payload.file.size > MAX_BYTES) {
      setError(t('sectionBuilder:editor.mediaLibraryPanel.fileTooLarge'));
      return;
    }
    setError(null);
    const { width, height } = await probeDimensions(payload.src);
    onUpload({
      id: crypto.randomUUID(),
      filename: payload.name,
      url: payload.src,
      width,
      height,
      uploadedAt: new Date().toISOString(),
    });
  };

  return (
    <div>
      <MediaUploadField items={[]} maxItems={1} maxSizeMB={10} onAdd={handleAdd} onReplace={() => {}} onRemove={() => {}} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

/**
 * Shared media library UI (Epic 9). `mode="manage"` (docked in the right
 * panel via the sidebar's Media button) exposes delete with an in-use
 * check; `mode="picker"` (opened from an ImageField's "Choose from
 * library") exposes selection instead.
 */
export default function MediaLibraryPanel({ mode, mediaLibrary, state, onUpload, onDelete, onPick, onClose }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    if (!onClose) return;
    const handler = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const visible = mediaLibrary.filter((item) => matchesSearch(item, query));

  return (
    <div role={mode === 'picker' ? 'dialog' : undefined} aria-label={mode === 'picker' ? t('sectionBuilder:editor.mediaLibraryPanel.chooseImage') : undefined} className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">{t('sectionBuilder:editor.mediaLibraryPanel.heading')}</h2>
        {onClose && (
          <button type="button" onClick={onClose} aria-label={t('sectionBuilder:editor.common.close')} className="text-gray-400 hover:text-gray-700">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="space-y-2 p-3">
        <UploadZone onUpload={onUpload} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('sectionBuilder:editor.mediaLibraryPanel.searchPlaceholder')}
          className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-3 pt-0">
        {mediaLibrary.length === 0 ? (
          <p className="p-3 text-sm text-gray-500">{t('sectionBuilder:editor.mediaLibraryPanel.emptyState')}</p>
        ) : visible.length === 0 ? (
          <p className="p-3 text-sm text-gray-500">{t('sectionBuilder:editor.mediaLibraryPanel.noSearchResults', { query })}</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {visible.map((item) => (
              <div key={item.id} className="group relative rounded-md border border-gray-200 p-1">
                <button
                  type="button"
                  onClick={() => (mode === 'picker' ? onPick(item) : undefined)}
                  className={'block w-full ' + (mode === 'picker' ? 'cursor-pointer' : '')}
                >
                  <img src={item.url} alt={item.filename} className="aspect-square w-full rounded object-cover" />
                </button>
                <p className="mt-1 truncate text-[11px] text-gray-600">{item.filename}</p>
                {item.width && (
                  <p className="text-[10px] text-gray-400">
                    {item.width}×{item.height}
                  </p>
                )}
                {mode === 'manage' && (
                  <button
                    type="button"
                    aria-label={t('sectionBuilder:editor.common.delete')}
                    onClick={() => setPendingDelete(item)}
                    className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs text-gray-700 shadow hover:bg-white group-hover:flex"
                  >
                    🗑
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          open
          danger
          confirmLabel={findUsages(state, pendingDelete.id).length > 0 ? t('sectionBuilder:editor.mediaLibraryPanel.deleteAnyway') : t('sectionBuilder:editor.common.delete')}
          title={
            findUsages(state, pendingDelete.id).length > 0
              ? t('sectionBuilder:editor.mediaLibraryPanel.usedInWarning', { sections: findUsages(state, pendingDelete.id).map(labelForType).join(', ') })
              : t('sectionBuilder:editor.mediaLibraryPanel.deleteConfirmTitle', { filename: pendingDelete.filename })
          }
          onConfirm={() => {
            onDelete(pendingDelete.id);
            setPendingDelete(null);
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
