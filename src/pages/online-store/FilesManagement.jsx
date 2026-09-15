import { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Download, Link as LinkIcon, Pencil, Play, Plus, Trash2, UploadCloud, X } from 'lucide-react';
import { Table, MainBtn, IconBtn, Tooltip, Popup, MediaUploadField, TextField } from '../../ce-ui';
import { loadOrSeedDemoDraft } from '../section-builder/state/demoBootstrap';
import { runDraftAction } from '../section-builder/state/runDraftAction';
import { ACTIONS } from '../section-builder/state/builderReducer';
import ConfirmDialog from '../section-builder/ui/ConfirmDialog';
import { matchesSearch } from '../section-builder/sections/mediaHelpers';
import { parseVideoUrl, youtubeThumbnailUrl, embedUrlFor, watchUrlFor, fetchVimeoThumbnail } from '../section-builder/sections/videoUrlHelpers';
import { formatDateTime } from './timeUtils';

// TODO: replace with the real active store id once multi-store routing
// exists — matches the hardcoded id used by Layout.jsx's builder entry and
// PagesManagement.jsx.
const STORE_ID = 'demo';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
const MAX_BYTES = 10 * 1024 * 1024;

// "Date Added" filter presets — the FilterPill also gets a "Custom" option
// (via customDateEnabled, same as OrderList's date filter) for an explicit
// from–to range.
const DATE_FILTER_DAYS = { '7d': 7, '30d': 30, '90d': 90 };

function probeDimensions(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: null, height: null });
    img.src = dataUrl;
  });
}

// `uploadedAt` is persisted as an ISO string (see MediaLibraryPanel.jsx's
// UploadZone / SelectImageModal.jsx's handleFile) but formatRelativeTime/
// formatDateTime (timeUtils.js) expect an epoch-ms number — matching how
// ThemeGalleryCards.jsx's `lastSavedAt` is stored/consumed there.
function uploadedAtMs(item) {
  const ms = Date.parse(item.uploadedAt);
  return Number.isNaN(ms) ? null : ms;
}

// Extension-based "file type" — every upload here is validated against
// ACCEPTED_TYPES (images only, see handleFieldAdd), so this is really just
// picking the image format back out of the filename, same approach as
// ce-ui's file-type-icons.tsx getFileTypeIcon.
function getFileExt(filename) {
  return (filename.split('.').pop() || '').toLowerCase();
}

// The one thing every row (image or video) can be grouped/filtered/labeled
// by — an image's extension, or a video's provider. Used for the File Type
// column, the File Type filter pill's options, and the filter predicate
// itself, so all three always agree on what "type" a row has.
function getFileKind(item) {
  return item.mediaType === 'video' ? item.provider : getFileExt(item.filename);
}

function getFileKindLabel(item) {
  if (item.mediaType === 'video') return item.provider === 'youtube' ? 'YouTube' : 'Vimeo';
  return getFileExt(item.filename).toUpperCase() || '—';
}

// Best-effort filename for an image added via "Upload from URL" — its last
// path segment, decoded, or a generic fallback for a URL with none (e.g.
// just a bare domain).
function filenameFromUrl(rawUrl) {
  try {
    const { pathname } = new URL(rawUrl);
    const last = pathname.split('/').filter(Boolean).pop();
    return last ? decodeURIComponent(last) : 'image';
  } catch {
    return 'image';
  }
}

function formatBytes(bytes) {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Pure start/end-of-day helpers for the custom date range filter — no
// Date.now() involved, just normalizing the picked Date objects, so these
// stay safe to call from render/useMemo.
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

/**
 * @module pages/online-store/FilesManagement
 * @description Content > Files — Shopify-style table list of every image in
 * the site's shared `mediaLibrary` (the same array Section Builder's Media
 * panel and the Rich Text Editor's image picker read/write, see
 * mediaHelpers.js). Uploading, renaming, or deleting here goes through the
 * same ADD_MEDIA_ITEM/RENAME_MEDIA_ITEM/DELETE_MEDIA_ITEM/
 * BULK_DELETE_MEDIA_ITEMS reducer actions those surfaces use, via
 * runDraftAction, so all three stay in sync.
 */
export default function FilesManagement() {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(() => loadOrSeedDemoDraft(STORE_ID));
  const [search, setSearch] = useState('');
  const [fileTypeFilters, setFileTypeFilters] = useState([]);
  const [dateAddedPreset, setDateAddedPreset] = useState('');
  const [customDateFrom, setCustomDateFrom] = useState(null);
  const [customDateTo, setCustomDateTo] = useState(null);
  // The actual cutoff timestamp for a preset (7d/30d/90d), captured once
  // when the preset is picked (an event handler, not render) rather than
  // calling Date.now() inside the filtered/useMemo below — that would be an
  // impure call during render (react-hooks/purity). The custom range below
  // doesn't need this since it compares against the picked Date objects
  // directly, not "now".
  const [dateCutoffMs, setDateCutoffMs] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  // Upload modal — the dropzone that used to sit inline above the table
  // (see git history) now lives in here instead, opened via the "New File"
  // button, matching the Upload Document pattern. `pendingItem`/
  // `pendingPayload` hold the just-picked file until "Upload" is clicked;
  // nothing is written to the draft until then, so closing/cancelling the
  // modal discards the pick.
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // "New File" — a primary button (not a form-field-style trigger) that
  // opens a small popover with the two entry points, Upload file / Upload
  // from URL, matching Shopify's own two-option "New File" button. Hand-
  // rolled outside-click popover (same pattern as PagesManagement.jsx's own
  // bulk-actions menu) rather than ce-ui's `Dropdown` — that component's
  // trigger always renders as a select-style field box, which doesn't read
  // as a primary action button the way this one does.
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const fileMenuRef = useRef(null);

  useEffect(() => {
    if (!fileMenuOpen) return undefined;
    const handler = (e) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) setFileMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [fileMenuOpen]);

  // "Upload from URL" modal — accepts an image URL or a YouTube/Vimeo URL
  // (see videoUrlHelpers.js), added to mediaLibrary the same way a local
  // upload is (ACTIONS.ADD_MEDIA_ITEM) once it's confirmed to actually
  // resolve to something real.
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [urlFilenameValue, setUrlFilenameValue] = useState('');
  const [urlError, setUrlError] = useState(null);
  // True while either the image-load check or the Vimeo oEmbed fetch is in
  // flight — disables "Add file" so a double-click can't add the same URL
  // twice, and MediaUploadField's own convention (uploadError) is mirrored
  // here as urlError for the inline failure message.
  const [urlChecking, setUrlChecking] = useState(false);

  // Rename modal — the "Edit" row action.
  const [renamingItem, setRenamingItem] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Row-click preview — a Shopify-style full-screen detail view.
  const [previewItem, setPreviewItem] = useState(null);

  const mediaLibrary = useMemo(() => draft.mediaLibrary ?? [], [draft.mediaLibrary]);

  const fileTypeOptions = useMemo(() => {
    const kinds = new Set(mediaLibrary.map(getFileKind).filter(Boolean));
    return Array.from(kinds)
      .sort()
      .map((kind) => ({ value: kind, label: kind === 'youtube' ? 'YouTube' : kind === 'vimeo' ? 'Vimeo' : kind.toUpperCase() }));
  }, [mediaLibrary]);

  const dateFilterOptions = [
    { value: '7d', label: t('sectionBuilder:onlineStore.files.last7Days', 'Last 7 days') },
    { value: '30d', label: t('sectionBuilder:onlineStore.files.last30Days', 'Last 30 days') },
    { value: '90d', label: t('sectionBuilder:onlineStore.files.last90Days', 'Last 90 days') },
  ];

  const filtered = useMemo(() => {
    return mediaLibrary.filter((item) => {
      if (search.trim() && !matchesSearch(item, search)) return false;
      if (fileTypeFilters.length > 0 && !fileTypeFilters.includes(getFileKind(item))) return false;
      if (customDateFrom || customDateTo) {
        const ms = uploadedAtMs(item);
        if (!ms) return false;
        if (customDateFrom && ms < startOfDay(customDateFrom)) return false;
        if (customDateTo && ms > endOfDay(customDateTo)) return false;
      } else if (dateCutoffMs != null) {
        const ms = uploadedAtMs(item);
        if (!ms || ms < dateCutoffMs) return false;
      }
      return true;
    });
  }, [mediaLibrary, search, fileTypeFilters, customDateFrom, customDateTo, dateCutoffMs]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDirection) return filtered;
    const factor = sortDirection === 'asc' ? 1 : -1;
    const valueOf = (item) => (sortKey === 'uploadedAt' ? uploadedAtMs(item) ?? 0 : item.size ?? 0);
    return [...filtered].sort((a, b) => (valueOf(a) - valueOf(b)) * factor);
  }, [filtered, sortKey, sortDirection]);

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, page, perPage]);

  // ── Upload modal ──────────────────────────────────────────────────────────

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setPendingItem(null);
    setPendingPayload(null);
    setUploadError(null);
  };

  const handleFieldAdd = (payload) => {
    if (!ACCEPTED_TYPES.includes(payload.file.type)) {
      setUploadError(t('sectionBuilder:onlineStore.files.unsupportedFileType', 'That file type isn’t supported. Please upload an image.'));
      return;
    }
    if (payload.file.size > MAX_BYTES) {
      setUploadError(t('sectionBuilder:onlineStore.files.fileTooLarge', 'That image is too large (max 10MB).'));
      return;
    }
    setUploadError(null);
    setPendingPayload(payload);
    // MediaUploadField's own preview card (image + filename + size +
    // Change/Remove) is reused here rather than building a second one, so
    // this only needs the MediaItem shape it expects.
    setPendingItem({ id: 'pending', type: payload.type, src: payload.src, name: payload.name, size: payload.size });
  };

  const handleConfirmUpload = async () => {
    if (!pendingPayload) return;
    const { width, height } = await probeDimensions(pendingPayload.src);
    const item = {
      id: crypto.randomUUID(),
      filename: pendingPayload.name,
      url: pendingPayload.src,
      width,
      height,
      size: pendingPayload.size,
      uploadedAt: new Date().toISOString(),
    };
    const next = runDraftAction(STORE_ID, { type: ACTIONS.ADD_MEDIA_ITEM, item });
    setDraft(next);
    closeUploadModal();
  };

  // ── Upload from URL ──────────────────────────────────────────────────────

  const closeUrlModal = () => {
    setUrlModalOpen(false);
    setUrlValue('');
    setUrlFilenameValue('');
    setUrlError(null);
    setUrlChecking(false);
  };

  const addMediaItem = (item) => {
    const next = runDraftAction(STORE_ID, { type: ACTIONS.ADD_MEDIA_ITEM, item });
    setDraft(next);
  };

  // Detects a YouTube/Vimeo URL first (videoUrlHelpers.parseVideoUrl);
  // anything else is treated as an image and validated the same
  // `new Image()` onload/onerror way SelectImageModal.jsx's own
  // handleAddFromUrl does — there's no backend here to fetch/verify an
  // arbitrary cross-origin URL's bytes, so "does it actually render" is the
  // most this app can check. The File Name field is optional either way —
  // a blank one falls back to the same auto-derived name this flow always
  // used (the URL's last path segment for an image, "YouTube/Vimeo video"
  // for a video).
  const handleAddFromUrlConfirm = async () => {
    const raw = urlValue.trim();
    if (!raw) return;
    setUrlError(null);
    setUrlChecking(true);
    const customFilename = urlFilenameValue.trim();

    const video = parseVideoUrl(raw);
    if (video) {
      const thumbnailUrl = video.provider === 'youtube' ? youtubeThumbnailUrl(video.videoId) : await fetchVimeoThumbnail(video.videoId);
      if (!thumbnailUrl) {
        setUrlChecking(false);
        setUrlError(t('sectionBuilder:onlineStore.files.urlInvalidVideo', 'That URL doesn’t point to a valid video.'));
        return;
      }
      addMediaItem({
        id: crypto.randomUUID(),
        filename: customFilename || (video.provider === 'youtube' ? 'YouTube video' : 'Vimeo video'),
        mediaType: 'video',
        provider: video.provider,
        videoId: video.videoId,
        url: watchUrlFor(video.provider, video.videoId),
        thumbnailUrl,
        width: null,
        height: null,
        size: null,
        uploadedAt: new Date().toISOString(),
      });
      setUrlChecking(false);
      closeUrlModal();
      return;
    }

    const img = new Image();
    img.onload = () => {
      addMediaItem({
        id: crypto.randomUUID(),
        filename: customFilename || filenameFromUrl(raw),
        mediaType: 'image',
        url: raw,
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: null,
        uploadedAt: new Date().toISOString(),
      });
      setUrlChecking(false);
      closeUrlModal();
    };
    img.onerror = () => {
      setUrlChecking(false);
      setUrlError(t('sectionBuilder:onlineStore.files.urlInvalidImage', 'That URL doesn’t point to a valid image.'));
    };
    img.src = raw;
  };

  // ── Rename modal ──────────────────────────────────────────────────────────

  const openRename = (row) => {
    setRenamingItem(row);
    setRenameValue(row.filename);
  };

  const closeRename = () => {
    setRenamingItem(null);
    setRenameValue('');
  };

  const handleRename = (id, filename) => {
    if (!filename.trim()) return;
    const next = runDraftAction(STORE_ID, { type: ACTIONS.RENAME_MEDIA_ITEM, id, filename: filename.trim() });
    setDraft(next);
    // Keep the open preview panel (if any) in sync with the renamed item.
    setPreviewItem((current) => (current && current.id === id ? { ...current, filename: filename.trim() } : current));
  };

  const handleRenameConfirm = () => {
    if (!renamingItem) return;
    handleRename(renamingItem.id, renameValue);
    closeRename();
  };

  // ── Download ──────────────────────────────────────────────────────────────

  const handleDownload = (row) => {
    const link = document.createElement('a');
    link.href = row.url;
    link.download = row.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDeleteConfirm = () => {
    if (!pendingDeleteId) return;
    const next = runDraftAction(STORE_ID, { type: ACTIONS.DELETE_MEDIA_ITEM, id: pendingDeleteId });
    setDraft(next);
    setSelectedIds((ids) => ids.filter((id) => id !== pendingDeleteId));
    setPreviewItem((current) => (current && current.id === pendingDeleteId ? null : current));
    setPendingDeleteId(null);
  };

  const handleBulkDeleteConfirm = () => {
    const next = runDraftAction(STORE_ID, { type: ACTIONS.BULK_DELETE_MEDIA_ITEMS, ids: selectedIds });
    setDraft(next);
    setSelectedIds([]);
    setConfirmBulkDelete(false);
  };

  const columns = [
    {
      key: 'url',
      header: t('sectionBuilder:onlineStore.files.columnPreview', 'Preview'),
      render: (_value, row) => (
        <div style={{ position: 'relative', width: 40, height: 40 }}>
          <img
            src={row.mediaType === 'video' ? row.thumbnailUrl : row.url}
            alt={row.filename}
            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #E9E9E9' }}
          />
          {/* Video badge — a small play-circle overlay so a video row reads
              as "video" at a glance in every grid this shows up in (Files
              table here; SelectImageModal/MediaLibraryPanel's own thumbnail
              grids mirror this same badge). */}
          {row.mediaType === 'video' && (
            <span
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.25)',
                borderRadius: 6,
              }}
            >
              <Play size={16} color="#fff" fill="#fff" />
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'filename',
      header: t('sectionBuilder:onlineStore.files.columnFilename', 'Filename'),
      render: (value) => <span style={{ fontWeight: 700, color: '#282828' }}>{value}</span>,
    },
    {
      key: 'fileType',
      header: t('sectionBuilder:onlineStore.files.columnFileType', 'File Type'),
      render: (_value, row) => getFileKindLabel(row),
    },
    {
      key: 'uploadedAt',
      header: t('sectionBuilder:onlineStore.files.columnDateAdded', 'Date Added'),
      sortable: true,
      render: (_value, row) => {
        const ms = uploadedAtMs(row);
        return ms ? formatDateTime(ms) : '—';
      },
    },
    {
      key: 'size',
      header: t('sectionBuilder:onlineStore.files.columnFileSize', 'File Size'),
      sortable: true,
      render: (_value, row) => formatBytes(row.size),
    },
    {
      key: 'actions',
      width: 180,
      header: t('sectionBuilder:onlineStore.files.columnActions', 'Actions'),
      // Every action here stops propagation — this column sits inside a
      // clickable row (onRowClick opens the preview below), and these
      // buttons should act on their own, not also open/select the row.
      render: (_value, row) => (
        <div className="flex items-center gap-1">
          {/* No Download for a video row — there's nothing to download, it's
              just a YouTube/Vimeo URL, not a hosted file. */}
          {row.mediaType !== 'video' && (
            <Tooltip content={t('sectionBuilder:onlineStore.files.downloadTooltip', 'Download')}>
              <IconBtn
                variant="ghost"
                size="sm"
                icon={<Download size={16} />}
                aria-label={t('sectionBuilder:onlineStore.files.downloadTooltip', 'Download')}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(row);
                }}
              />
            </Tooltip>
          )}
          <Tooltip content={t('sectionBuilder:onlineStore.files.editTooltip', 'Edit')}>
            <IconBtn
              variant="ghost"
              size="sm"
              icon={<Pencil size={16} />}
              aria-label={t('sectionBuilder:onlineStore.files.editTooltip', 'Edit')}
              onClick={(e) => {
                e.stopPropagation();
                openRename(row);
              }}
            />
          </Tooltip>
          <Tooltip content={t('sectionBuilder:onlineStore.files.deleteFile', 'Delete file')}>
            <IconBtn
              variant="danger-ghost"
              size="sm"
              icon={<Trash2 size={16} />}
              aria-label={t('sectionBuilder:onlineStore.files.deleteFile', 'Delete file')}
              onClick={(e) => {
                e.stopPropagation();
                setPendingDeleteId(row.id);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div style={{ background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#282828' }}>
            {t('sectionBuilder:onlineStore.files.heading', 'Files')}
          </h1>
          <div style={{ position: 'relative' }} ref={fileMenuRef}>
            <MainBtn
              variant="primary"
              size="sm"
              leftIcon={<Plus size={16} />}
              rightIcon={<ChevronDown size={14} />}
              label={t('sectionBuilder:onlineStore.files.newFile', 'New File')}
              onClick={() => setFileMenuOpen((open) => !open)}
            />
            {fileMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 4px)',
                  zIndex: 30,
                  background: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  minWidth: 200,
                  padding: '4px 0',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setFileMenuOpen(false);
                    setUploadModalOpen(true);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    fontSize: 13,
                    color: '#282828',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <UploadCloud size={14} />
                  {t('sectionBuilder:onlineStore.files.uploadFile', 'Upload file')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFileMenuOpen(false);
                    setUrlModalOpen(true);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    fontSize: 13,
                    color: '#282828',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <LinkIcon size={14} />
                  {t('sectionBuilder:onlineStore.files.uploadFromUrl', 'Upload from URL')}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="files-table-wrapper" style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', position: 'relative' }}>
          <Table
            columns={columns}
            data={paged}
            onRowClick={(row) => setPreviewItem(row)}
            totalRows={filtered.length}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
            hidePaginationOnSinglePage
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={(key, direction) => {
              setSortKey(key);
              setSortDirection(direction);
              setPage(1);
            }}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            toolbar={
              selectedIds.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#282828' }}>
                    {t('sectionBuilder:onlineStore.files.bulkSelectedCount', '{{count}} selected', { count: selectedIds.length })}
                  </span>
                  <MainBtn
                    variant="secondary"
                    size="sm"
                    label={t('sectionBuilder:onlineStore.files.deleteFiles', 'Delete files')}
                    onClick={() => setConfirmBulkDelete(true)}
                  />
                </div>
              ) : undefined
            }
            filters={{
              multiSelect: {
                label: t('sectionBuilder:onlineStore.files.columnFileType', 'File Type'),
                options: fileTypeOptions,
                values: fileTypeFilters,
                onChange: (values) => {
                  setFileTypeFilters(values);
                  setPage(1);
                },
                searchable: false,
              },
              singleSelect: {
                label: t('sectionBuilder:onlineStore.files.columnDateAdded', 'Date Added'),
                options: dateFilterOptions,
                value: dateAddedPreset,
                onChange: (value) => {
                  setDateAddedPreset(value);
                  setCustomDateFrom(null);
                  setCustomDateTo(null);
                  setDateCutoffMs(DATE_FILTER_DAYS[value] ? Date.now() - DATE_FILTER_DAYS[value] * 24 * 60 * 60 * 1000 : null);
                  setPage(1);
                },
                searchable: false,
                customDateEnabled: true,
                customDateFrom,
                customDateTo,
                onCustomDateChange: (from, to) => {
                  setCustomDateFrom(from);
                  setCustomDateTo(to);
                  setPage(1);
                },
              },
              search: {
                value: search,
                onChange: (value) => {
                  setSearch(value);
                  setPage(1);
                },
                placeholder: t('sectionBuilder:onlineStore.files.searchPlaceholder', 'Search by filename'),
              },
              rowsPerPage: {
                onChange: (nextPerPage) => {
                  setPerPage(nextPerPage);
                  setPage(1);
                },
              },
            }}
            emptyStateTitle={t('sectionBuilder:onlineStore.files.noFilesTitle', 'No files available yet')}
            emptyStateDescription={t('sectionBuilder:onlineStore.files.noFilesDescription', 'Files will appear here once you upload one.')}
          />
        </div>
      </div>

      <Popup
        open={uploadModalOpen}
        onClose={closeUploadModal}
        title={t('sectionBuilder:onlineStore.files.uploadModalTitle', 'Upload File')}
        platform="desktop"
        align="left"
        primaryAction={{
          label: t('sectionBuilder:onlineStore.files.upload', 'Upload'),
          onClick: handleConfirmUpload,
          disabled: !pendingPayload,
        }}
        secondaryAction={{ label: t('sectionBuilder:editor.common.cancel', 'Cancel'), onClick: closeUploadModal }}
      >
        {/* `items` mirrors the single pending pick — nothing commits to the
            draft until "Upload" above is clicked, unlike the old inline
            dropzone which added on selection. */}
        <MediaUploadField
          items={pendingItem ? [pendingItem] : []}
          maxItems={1}
          maxSizeMB={10}
          onAdd={handleFieldAdd}
          onReplace={(_id, payload) => handleFieldAdd(payload)}
          onRemove={() => {
            setPendingItem(null);
            setPendingPayload(null);
          }}
        />
        {uploadError && <p style={{ marginTop: 8, marginBottom: 0, fontSize: 12, color: '#DA1E28' }}>{uploadError}</p>}
      </Popup>

      <Popup
        open={urlModalOpen}
        onClose={closeUrlModal}
        title={t('sectionBuilder:onlineStore.files.addFromUrlTitle', 'Add file from URL')}
        platform="desktop"
        align="left"
        primaryAction={{
          label: t('sectionBuilder:onlineStore.files.addFile', 'Add file'),
          onClick: handleAddFromUrlConfirm,
          disabled: !urlValue.trim() || urlChecking,
          loading: urlChecking,
        }}
        secondaryAction={{ label: t('sectionBuilder:editor.common.cancel', 'Cancel'), onClick: closeUrlModal }}
      >
        <div className="flex flex-col gap-4">
          <TextField
            label={t('sectionBuilder:onlineStore.files.urlFieldLabel', 'Image, YouTube, or Vimeo URL')}
            value={urlValue}
            onChange={(e) => {
              setUrlValue(e.target.value);
              if (urlError) setUrlError(null);
            }}
            placeholder="https://"
            autoFocus
            errorText={urlError}
          />
          {/* Optional — left blank, it falls back to the same auto-derived
              name this flow always used (see handleAddFromUrlConfirm). */}
          <TextField
            label={t('sectionBuilder:onlineStore.files.renameFilenameLabel', 'File Name')}
            value={urlFilenameValue}
            onChange={(e) => setUrlFilenameValue(e.target.value)}
            placeholder={t('sectionBuilder:onlineStore.files.urlFilenamePlaceholder', 'e.g. hero-banner')}
          />
        </div>
      </Popup>

      <Popup
        open={Boolean(renamingItem)}
        onClose={closeRename}
        title={t('sectionBuilder:onlineStore.files.renameFileTitle', 'Rename file')}
        platform="desktop"
        align="left"
        primaryAction={{
          label: t('sectionBuilder:onlineStore.files.save', 'Save'),
          onClick: handleRenameConfirm,
          disabled: !renameValue.trim(),
        }}
        secondaryAction={{ label: t('sectionBuilder:editor.common.cancel', 'Cancel'), onClick: closeRename }}
      >
        <TextField
          label={t('sectionBuilder:onlineStore.files.renameFilenameLabel', 'File Name')}
          required
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          autoFocus
        />
      </Popup>

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        danger
        title={t('sectionBuilder:onlineStore.files.deleteConfirmTitle', 'Delete this file?')}
        description={t('sectionBuilder:onlineStore.files.deleteConfirmDescription', 'This can’t be undone.')}
        confirmLabel={t('sectionBuilder:onlineStore.files.deleteFile', 'Delete file')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDeleteId(null)}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        danger
        title={t('sectionBuilder:onlineStore.files.bulkDeleteConfirmTitle', 'Delete {{count}} files?', { count: selectedIds.length })}
        description={t('sectionBuilder:onlineStore.files.deleteConfirmDescription', 'This can’t be undone.')}
        confirmLabel={t('sectionBuilder:onlineStore.files.deleteFiles', 'Delete files')}
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setConfirmBulkDelete(false)}
      />

      {previewItem && (
        <FilePreviewOverlay
          key={previewItem.id}
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          onDownload={() => handleDownload(previewItem)}
        />
      )}
    </div>
  );
}

/**
 * Shopify-style full-screen file detail view, opened by clicking a table
 * row (US ask: "preview and file details like in Shopify"). View-only —
 * Filename/Details are read-only and the only action is Download;
 * renaming/deleting stay on the row's own Edit/Delete actions instead.
 * There's also no crop/resize/draw tooling in this app to back those
 * Shopify buttons, so they're left out rather than added as non-functional
 * decoration.
 */
function FilePreviewOverlay({ item, onClose, onDownload }) {
  const { t } = useTranslation();

  useEffect(() => {
    const onKeyDown = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const ms = Date.parse(item.uploadedAt);
  const addedLabel = Number.isNaN(ms) ? '—' : formatDateTime(ms);
  const isVideo = item.mediaType === 'video';
  const kindLabel = getFileKindLabel(item);
  const dimensions = item.width && item.height ? `${item.width}×${item.height}` : '—';

  return ReactDOM.createPortal(
    // z-[300] clears Layout.jsx's sidebar (position: sticky, zIndex: 200) —
    // being `fixed` alone doesn't put this on top of it, since a lower
    // z-index still loses to the sidebar's explicit one regardless of DOM
    // order. Edge-to-edge (no padding/backdrop/rounding) — a true
    // full-screen takeover rather than a centered card. (Delete goes
    // through onDelete closing this first, so there's no confirm-dialog-
    // on-top-of-preview stacking case to also cover.)
    <div role="dialog" aria-modal="true" aria-label={item.filename} className="fixed inset-0 z-[300] flex">
      {/* Image side — full-bleed, no header bar above it. Translucent black,
          same backdrop convention as ce-ui's Popup overlay, rather than
          solid black or solid white. */}
      <div className="flex-1 min-w-0 flex items-center justify-center p-8 bg-black/50">
        {isVideo ? (
          <iframe
            key={item.id}
            src={embedUrlFor(item.provider, item.videoId)}
            title={item.filename}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="aspect-video w-full max-w-4xl border-0"
          />
        ) : (
          <img src={item.url} alt={item.filename} className="max-w-full max-h-full object-contain" />
        )}
      </div>

      {/* Drawer — carries its own header (filename + close) since the image
          side no longer has a top bar. */}
      <div className="w-[360px] flex-none border-l border-lb-line-1 bg-lb-surface flex flex-col h-full">
        <div className="flex-none flex items-center gap-2 px-4 h-14 border-b border-lb-line-1">
          <span className="flex-1 min-w-0 truncate text-lb-on-surface font-lb text-[14px] font-lb-bold">{item.filename}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('sectionBuilder:editor.common.close', 'Close')}
            className="w-8 h-8 flex-none flex items-center justify-center rounded-full text-lb-on-surface bg-transparent border-none cursor-pointer hover:bg-lb-surface-grey transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 p-5 overflow-y-auto flex flex-col gap-5">
          <div className="text-lb-on-surface font-lb text-[14px] font-lb-bold">
            {t('sectionBuilder:onlineStore.files.previewInformation', 'Information')}
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-lb-on-surface-3 font-lb text-[12px]">
              {t('sectionBuilder:onlineStore.files.renameFilenameLabel', 'File Name')}
            </span>
            <span className="text-lb-on-surface font-lb text-[13px]">{item.filename}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-lb-on-surface-3 font-lb text-[12px]">
              {t('sectionBuilder:onlineStore.files.columnFileType', 'File Type')}
            </span>
            <span className="text-lb-on-surface font-lb text-[13px]">{kindLabel}</span>
          </div>

          {/* Dimensions/File Size don't apply to a video entry — it's a
              YouTube/Vimeo URL, not a hosted image with real bytes/pixels. */}
          {!isVideo && (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-lb-on-surface-3 font-lb text-[12px]">
                  {t('sectionBuilder:onlineStore.files.previewDimensions', 'Dimensions')}
                </span>
                <span className="text-lb-on-surface font-lb text-[13px]">{dimensions}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-lb-on-surface-3 font-lb text-[12px]">
                  {t('sectionBuilder:onlineStore.files.columnFileSize', 'File Size')}
                </span>
                <span className="text-lb-on-surface font-lb text-[13px]">{formatBytes(item.size)}</span>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-lb-on-surface-3 font-lb text-[12px]">
              {t('sectionBuilder:onlineStore.files.columnDateAdded', 'Date Added')}
            </span>
            <span className="text-lb-on-surface font-lb text-[13px]">{addedLabel}</span>
          </div>

          <div className="mt-auto pt-3 border-t border-lb-line-1">
            {isVideo ? (
              <MainBtn
                variant="secondary"
                size="md"
                className="w-full"
                label={t('sectionBuilder:onlineStore.files.watchOnProvider', 'Watch on {{provider}}', {
                  provider: kindLabel,
                })}
                onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
              />
            ) : (
              <MainBtn
                variant="secondary"
                size="md"
                className="w-full"
                leftIcon={<Download size={16} />}
                label={t('sectionBuilder:onlineStore.files.downloadTooltip', 'Download')}
                onClick={onDownload}
              />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
