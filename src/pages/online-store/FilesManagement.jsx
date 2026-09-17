import { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Download, FileImage, FileVideo, Link as LinkIcon, Pencil, Play, Plus, Trash2, UploadCloud, X, AlertCircle, Check } from 'lucide-react';
import { Table, MainBtn, IconBtn, Tooltip, Popup, TextField } from '../../ce-ui';
import { loadOrSeedDemoDraft } from '../section-builder/state/demoBootstrap';
import { runDraftAction } from '../section-builder/state/runDraftAction';
import { ACTIONS } from '../section-builder/state/builderReducer';
import ConfirmDialog from '../section-builder/ui/ConfirmDialog';
import { matchesSearch } from '../section-builder/sections/mediaHelpers';
import { parseVideoUrl, youtubeThumbnailUrl, embedUrlFor, watchUrlFor, fetchVimeoThumbnail } from '../section-builder/sections/videoUrlHelpers';
import { formatDateTime } from './timeUtils';
import { useSnackbar } from '../../contexts/SnackbarContext';
import SimulateTrigger from './SimulateTrigger';

// Max length for the "File Name" field in the Add-from-URL modal (#15).
const FILENAME_MAX_LENGTH = 260;

// TODO: replace with the real active store id once multi-store routing
// exists — matches the hardcoded id used by Layout.jsx's builder entry and
// PagesManagement.jsx.
const STORE_ID = 'demo';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
const MIN_BYTES = 1024;
const MAX_BYTES = 10 * 1024 * 1024;

// Fake network progress for the upload queue below — no real backend to
// upload against, so this ticks progress on a timer like every other
// simulated async flow in this app (e.g. the 800ms menu-save spinner in
// MenusManagement.jsx), just with visible incremental progress instead of a
// flat delay since a Google-Drive-style progress list is the whole point.
const UPLOAD_TICK_MS = 150;
const UPLOAD_TICK_MIN_PCT = 8;
const UPLOAD_TICK_MAX_PCT = 22;

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
  const { showSnackbar } = useSnackbar();
  const [draft, setDraft] = useState(() => loadOrSeedDemoDraft(STORE_ID));
  const [search, setSearch] = useState('');

  // ── Simulate panel state — no real backend to fail/delay/conflict
  // against, so these are local toggles exercising the negative/edge
  // states on demand (see PagesManagement.jsx / ThemeGallery.jsx for the
  // same convention). All default "off" so normal usage is unaffected.
  const [simulateLoadError, setSimulateLoadError] = useState(false);
  const [simulateManyItems, setSimulateManyItems] = useState(false);
  const [simulateDeletedElsewhere, setSimulateDeletedElsewhere] = useState(false);
  const [simulateDeleteError, setSimulateDeleteError] = useState(false);
  const [simulatePreviewLoadError, setSimulatePreviewLoadError] = useState(false);
  const [simulateUploadFailure, setSimulateUploadFailure] = useState(false);
  // 'success' | 'malformed' | 'unsupported-host' | 'private-restricted' | '404'
  const [simulateUrlValidation, setSimulateUrlValidation] = useState('success');
  // 'normal' | 'too-small' | 'too-large' — forces the local Upload
  // file/drag-and-drop size check (enqueueFiles) to treat every picked/
  // dropped file as under 1KB or over 10MB regardless of its real size, so
  // this can be exercised without having to track down an actual file that
  // small/large.
  const [simulateLocalUploadSize, setSimulateLocalUploadSize] = useState('normal');
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

  // Upload queue — "Upload file" now opens the OS file picker directly
  // (multi-select) instead of a confirm-before-upload modal, and files
  // dropped anywhere on this page go through the same queue. Each entry is
  // `{ id, name, size, progress, status: 'uploading'|'done'|'error', errorMessage }`
  // and drives the Google-Drive-style floating progress card below —
  // uploading starts the instant a file is picked/dropped, no confirm step.
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploadPanelClosed, setUploadPanelClosed] = useState(false);
  const [uploadPanelCollapsed, setUploadPanelCollapsed] = useState(false);
  const [isDraggingOverPage, setIsDraggingOverPage] = useState(false);
  const fileInputRef = useRef(null);
  // File objects/timers aren't safe to keep in React state (not
  // serializable, and don't need to trigger re-renders themselves) — kept in
  // refs, keyed by the same upload entry id.
  const uploadFilesRef = useRef(new Map());
  const uploadTimersRef = useRef(new Map());
  const dragCounterRef = useRef(0);

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

  const realMediaLibrary = useMemo(() => draft.mediaLibrary ?? [], [draft.mediaLibrary]);

  // Bulks the list out past 25 rows (real files + fake extras) so the
  // table's pagination controls actually have something to page through.
  const mediaLibrary = useMemo(() => {
    if (!simulateManyItems) return realMediaLibrary;
    const extra = Array.from({ length: Math.max(0, 30 - realMediaLibrary.length) }).map((_, i) => ({
      id: `__simulated-file-${i}`,
      filename: `simulated-file-${i + 1}.png`,
      mediaType: 'image',
      url: 'https://placehold.co/40x40',
      width: 40,
      height: 40,
      size: 1024,
      uploadedAt: new Date().toISOString(),
    }));
    return [...realMediaLibrary, ...extra];
  }, [realMediaLibrary, simulateManyItems]);

  // Which file the "deleted elsewhere" simulation applies to — the first
  // real (non-simulated-extra) file.
  const simulateTargetFile = useMemo(() => realMediaLibrary[0] ?? null, [realMediaLibrary]);
  const isSimulatedDeletedElsewhere = (fileId) => simulateDeletedElsewhere && fileId === simulateTargetFile?.id;

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
    if (sortKey === 'filename') {
      return [...filtered].sort((a, b) => (a.filename ?? '').localeCompare(b.filename ?? '') * factor);
    }
    const valueOf = (item) => (sortKey === 'uploadedAt' ? uploadedAtMs(item) ?? 0 : item.size ?? 0);
    return [...filtered].sort((a, b) => (valueOf(a) - valueOf(b)) * factor);
  }, [filtered, sortKey, sortDirection]);

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, page, perPage]);

  // ── Upload queue ───────────────────────────────────────────────────────────
  // "Upload file" (and dropping files anywhere on this page) skips the old
  // confirm-before-upload modal entirely: each picked/dropped file is
  // validated, queued, and starts a simulated progress tick immediately,
  // rendered in the floating card below (mounted further down, near
  // SimulateTrigger). Nothing here talks to a real backend — `runDraftAction`
  // fires once a given entry's simulated progress reaches 100%.

  const updateUploadEntry = (id, patch) => {
    setUploadQueue((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  };

  const finishUpload = async (id) => {
    const file = uploadFilesRef.current.get(id);
    if (!file) return;
    // Simulated failure — mirrors the "Upload from URL" flow's own
    // simulateUploadFailure toggle (see handleAddFromUrlConfirm) so the same
    // Simulate-panel switch exercises both upload paths, not just the URL
    // one.
    if (simulateUploadFailure) {
      updateUploadEntry(id, { progress: 100, status: 'error', errorMessage: t('sectionBuilder:onlineStore.files.uploadFromUrlFailed', 'Failed to upload file') });
      return;
    }
    const src = URL.createObjectURL(file);
    const { width, height } = await probeDimensions(src);
    const item = {
      id: crypto.randomUUID(),
      filename: file.name,
      mediaType: 'image',
      url: src,
      width,
      height,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
    const next = runDraftAction(STORE_ID, { type: ACTIONS.ADD_MEDIA_ITEM, item });
    setDraft(next);
    updateUploadEntry(id, { progress: 100, status: 'done', item });
  };

  const startUploadTick = (id) => {
    const timer = window.setInterval(() => {
      setUploadQueue((prev) =>
        prev.map((entry) => {
          if (entry.id !== id || entry.status !== 'uploading') return entry;
          const next = Math.min(100, entry.progress + UPLOAD_TICK_MIN_PCT + Math.random() * (UPLOAD_TICK_MAX_PCT - UPLOAD_TICK_MIN_PCT));
          return { ...entry, progress: next };
        })
      );
    }, UPLOAD_TICK_MS);
    uploadTimersRef.current.set(id, timer);
  };

  // Watches the queue for any entry that just crossed 100% and settles it —
  // separate from the interval tick itself so the async dims-probe/dispatch
  // in finishUpload only ever runs once per entry (the interval keeps firing
  // right up until this effect clears it).
  useEffect(() => {
    uploadQueue.forEach((entry) => {
      if (entry.status === 'uploading' && entry.progress >= 100) {
        const timer = uploadTimersRef.current.get(entry.id);
        if (timer) {
          window.clearInterval(timer);
          uploadTimersRef.current.delete(entry.id);
        }
        finishUpload(entry.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadQueue]);

  const enqueueFiles = (fileList) => {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;
    setUploadPanelClosed(false);
    setUploadPanelCollapsed(false);
    const entries = files.map((file) => {
      const id = crypto.randomUUID();
      // Only a real image gets a thumbnail — an unsupported file type still
      // gets queued (so its row/error is visible) but never produces a
      // usable object URL.
      const thumbSrc = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
      // Simulated size overrides the file's real size for both the
      // min/max check below and what the row displays, so this can be
      // exercised with any ordinary file instead of a real 0.5KB/11MB one.
      const displaySize =
        simulateLocalUploadSize === 'too-small' ? Math.max(0, MIN_BYTES - 100) : simulateLocalUploadSize === 'too-large' ? MAX_BYTES + 1024 * 1024 : file.size;
      if (!ACCEPTED_TYPES.includes(file.type)) {
        return { id, name: file.name, size: displaySize, progress: 0, status: 'error', errorMessage: t('sectionBuilder:onlineStore.files.unsupportedFileType', 'That file type isn’t supported. Please upload an image.'), thumbSrc };
      }
      if (displaySize < MIN_BYTES) {
        return { id, name: file.name, size: displaySize, progress: 0, status: 'error', errorMessage: t('sectionBuilder:onlineStore.files.fileTooSmall', 'That file is too small (min 1KB).'), thumbSrc };
      }
      if (displaySize > MAX_BYTES) {
        return { id, name: file.name, size: displaySize, progress: 0, status: 'error', errorMessage: t('sectionBuilder:onlineStore.files.fileTooLarge', 'That image is too large (max 10MB).'), thumbSrc };
      }
      uploadFilesRef.current.set(id, file);
      return { id, name: file.name, size: file.size, progress: 0, status: 'uploading', errorMessage: null, thumbSrc };
    });
    setUploadQueue((prev) => [...prev, ...entries]);
    entries.filter((entry) => entry.status === 'uploading').forEach((entry) => startUploadTick(entry.id));
  };

  // Canceling stays visible in the card (status 'canceled') rather than
  // disappearing — same "the list is a running log of this batch" idea as
  // Google Drive's own upload toast, which is why the card's own header
  // separately counts uploaded vs. canceled entries (see uploadSummary
  // below).
  const cancelUpload = (id) => {
    const timer = uploadTimersRef.current.get(id);
    if (timer) {
      window.clearInterval(timer);
      uploadTimersRef.current.delete(id);
    }
    uploadFilesRef.current.delete(id);
    updateUploadEntry(id, { status: 'canceled' });
  };

  const handleFilePickerChange = (e) => {
    enqueueFiles(e.target.files);
    // Reset so picking the exact same file again still fires onChange.
    e.target.value = '';
  };

  // Whole-page drag-and-drop (Google Drive/Shopify convention) — a counter
  // (not a boolean flip on every dragenter/dragleave) because those events
  // fire once per descendant element entered/left, so a naive boolean would
  // flicker the overlay off while still dragging over a child element.
  useEffect(() => {
    const isFileDrag = (e) => Array.from(e.dataTransfer?.types ?? []).includes('Files');
    const onDragEnter = (e) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      dragCounterRef.current += 1;
      setIsDraggingOverPage(true);
    };
    const onDragOver = (e) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
    };
    const onDragLeave = (e) => {
      if (!isFileDrag(e)) return;
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) setIsDraggingOverPage(false);
    };
    const onDrop = (e) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDraggingOverPage(false);
      enqueueFiles(e.dataTransfer?.files);
    };
    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clears any still-running simulated-progress timers on unmount so they
  // don't keep ticking (and eventually dispatching) against an unmounted
  // page.
  useEffect(() => {
    const timers = uploadTimersRef.current;
    return () => {
      timers.forEach((timer) => window.clearInterval(timer));
      timers.clear();
    };
  }, []);

  const uploadingCount = uploadQueue.filter((entry) => entry.status === 'uploading').length;
  const uploadDoneCount = uploadQueue.filter((entry) => entry.status === 'done').length;
  const uploadCanceledCount = uploadQueue.filter((entry) => entry.status === 'canceled').length;
  const uploadErrorCount = uploadQueue.filter((entry) => entry.status === 'error').length;

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
  // Simulate-driven validation cases (#14) — there's no real network
  // validation here (the old `new Image()`/oEmbed check below is the only
  // "real" one, and even that can't be exercised for most failure modes
  // cross-origin), so the simulate panel's `simulateUrlValidation` select
  // stands in for a server-side validation response. 'success' falls
  // through to the pre-existing image/video detection below unchanged.
  function simulatedUrlValidationError() {
    switch (simulateUrlValidation) {
      case 'malformed':
        return t('sectionBuilder:onlineStore.files.urlInvalidGeneric', "This URL isn't a valid image or video link");
      case 'unsupported-host':
        return t('sectionBuilder:onlineStore.files.urlUnsupportedHost', 'Use a YouTube or Vimeo URL');
      case 'private-restricted':
        return t('sectionBuilder:onlineStore.files.urlPrivateRestricted', 'This video is private or restricted');
      case '404':
        return t('sectionBuilder:onlineStore.files.urlNotFound', "Couldn't verify the image, check the URL and try again");
      default:
        return null;
    }
  }

  const handleAddFromUrlConfirm = async () => {
    const raw = urlValue.trim();
    if (!raw) {
      setUrlError(t('sectionBuilder:onlineStore.files.fieldRequired', 'Field cannot be empty'));
      return;
    }
    setUrlError(null);

    const simulatedError = simulatedUrlValidationError();
    if (simulatedError) {
      setUrlError(simulatedError);
      return;
    }

    setUrlChecking(true);
    const customFilename = urlFilenameValue.trim();

    const finishFailure = (message) => {
      setUrlChecking(false);
      setUrlError(message);
    };

    const finishSuccess = (item) => {
      if (simulateUploadFailure) {
        setUrlChecking(false);
        closeUrlModal();
        showSnackbar(t('sectionBuilder:onlineStore.files.uploadFromUrlFailed', 'Failed to upload file'), 'red');
        return;
      }
      addMediaItem(item);
      setUrlChecking(false);
      closeUrlModal();
    };

    const video = parseVideoUrl(raw);
    if (video) {
      const thumbnailUrl = video.provider === 'youtube' ? youtubeThumbnailUrl(video.videoId) : await fetchVimeoThumbnail(video.videoId);
      if (!thumbnailUrl) {
        finishFailure(t('sectionBuilder:onlineStore.files.urlInvalidVideo', 'That URL doesn’t point to a valid video.'));
        return;
      }
      finishSuccess({
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
      return;
    }

    const img = new Image();
    img.onload = () => {
      finishSuccess({
        id: crypto.randomUUID(),
        filename: customFilename || filenameFromUrl(raw),
        mediaType: 'image',
        url: raw,
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: null,
        uploadedAt: new Date().toISOString(),
      });
    };
    img.onerror = () => {
      finishFailure(t('sectionBuilder:onlineStore.files.urlInvalidImage', 'That URL doesn’t point to a valid image.'));
    };
    img.src = raw;
  };

  // ── Rename modal ──────────────────────────────────────────────────────────

  const openRename = (row) => {
    if (isSimulatedDeletedElsewhere(row.id)) {
      showSnackbar(t('sectionBuilder:onlineStore.files.deletedElsewhereSnackbar', 'This file no longer exists'), 'red');
      return;
    }
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
    showSnackbar(t('sectionBuilder:onlineStore.files.renameSavedSnackbar', 'File name saved successfully'), 'green');
  };

  const handleRenameConfirm = () => {
    if (!renamingItem) return;
    handleRename(renamingItem.id, renameValue);
    closeRename();
  };

  // ── Download ──────────────────────────────────────────────────────────────

  const handleDownload = (row) => {
    if (isSimulatedDeletedElsewhere(row.id)) {
      showSnackbar(t('sectionBuilder:onlineStore.files.deletedElsewhereSnackbar', 'This file no longer exists'), 'red');
      return;
    }
    const link = document.createElement('a');
    link.href = row.url;
    link.download = row.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const requestDelete = (id) => {
    if (isSimulatedDeletedElsewhere(id)) {
      showSnackbar(t('sectionBuilder:onlineStore.files.deletedElsewhereSnackbar', 'This file no longer exists'), 'red');
      return;
    }
    setPendingDeleteId(id);
  };

  const handleDeleteConfirm = () => {
    if (!pendingDeleteId) return;
    if (simulateDeleteError) {
      showSnackbar(t('sectionBuilder:onlineStore.files.deleteFailedSnackbar', 'Failed to delete file'), 'red');
      setPendingDeleteId(null);
      return;
    }
    const next = runDraftAction(STORE_ID, { type: ACTIONS.DELETE_MEDIA_ITEM, id: pendingDeleteId });
    setDraft(next);
    setSelectedIds((ids) => ids.filter((id) => id !== pendingDeleteId));
    setPreviewItem((current) => (current && current.id === pendingDeleteId ? null : current));
    setPendingDeleteId(null);
    showSnackbar(t('sectionBuilder:onlineStore.files.deletedSnackbar', 'File deleted successfully'), 'grey');
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
      width: 72,
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
      header: t('sectionBuilder:onlineStore.files.columnFilename', 'File Name'),
      sortable: true,
      // Truncate + tooltip — this is the table's one "fill" column (see
      // table-fixed change), so a long filename needs to clip instead of
      // forcing the column wider than the space the fixed layout gave it.
      render: (value) => (
        // Tooltip's own wrapper is `inline-flex` with no width of its own
        // (sizes to content), which would let this row grow past the
        // column's fixed width instead of clipping — `w-full` stretches it
        // to fill the cell so the inner span's overflow/ellipsis actually
        // has a real boundary to clip against.
        <Tooltip content={value} className="w-full min-w-0">
          <span
            style={{ display: 'block', width: '100%', fontWeight: 700, color: '#282828', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {value}
          </span>
        </Tooltip>
      ),
    },
    {
      key: 'fileType',
      width: 110,
      header: t('sectionBuilder:onlineStore.files.columnFileType', 'File Type'),
      render: (_value, row) => getFileKindLabel(row),
    },
    {
      key: 'uploadedAt',
      width: 190,
      header: t('sectionBuilder:onlineStore.files.columnDateAdded', 'Date Added'),
      sortable: true,
      render: (_value, row) => {
        const ms = uploadedAtMs(row);
        return ms ? formatDateTime(ms) : '—';
      },
    },
    {
      key: 'size',
      width: 110,
      header: t('sectionBuilder:onlineStore.files.columnFileSize', 'File Size'),
      sortable: true,
      render: (_value, row) => formatBytes(row.size),
    },
    {
      key: 'actions',
      width: 136,
      align: 'right',
      header: t('sectionBuilder:onlineStore.files.columnActions', 'Actions'),
      // Every action here stops propagation — this column sits inside a
      // clickable row (onRowClick opens the preview below), and these
      // buttons should act on their own, not also open/select the row.
      render: (_value, row) => (
        <div className="flex items-center justify-end gap-1">
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
                requestDelete(row.id);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const simulateOptions = [
    {
      type: 'checkbox',
      label: t('sectionBuilder:onlineStore.files.simulateLoadError', 'Simulate load error'),
      checked: simulateLoadError,
      onChange: setSimulateLoadError,
    },
    {
      type: 'checkbox',
      label: t('sectionBuilder:onlineStore.files.simulateManyItems', 'Simulate many files (pagination)'),
      checked: simulateManyItems,
      onChange: setSimulateManyItems,
    },
    {
      type: 'checkbox',
      label: t('sectionBuilder:onlineStore.files.simulateDeletedElsewhere', 'Mark a file as deleted elsewhere'),
      checked: simulateDeletedElsewhere,
      onChange: setSimulateDeletedElsewhere,
    },
    {
      type: 'checkbox',
      label: t('sectionBuilder:onlineStore.files.simulateDeleteError', 'Simulate delete error'),
      checked: simulateDeleteError,
      onChange: setSimulateDeleteError,
    },
    {
      type: 'checkbox',
      label: t('sectionBuilder:onlineStore.files.simulatePreviewLoadError', 'Simulate preview load error'),
      checked: simulatePreviewLoadError,
      onChange: setSimulatePreviewLoadError,
    },
    {
      type: 'checkbox',
      label: t('sectionBuilder:onlineStore.files.simulateUploadFailure', 'Simulate upload failure'),
      checked: simulateUploadFailure,
      onChange: setSimulateUploadFailure,
    },
    {
      type: 'select',
      label: t('sectionBuilder:onlineStore.files.simulateLocalUploadSize', 'Local upload file size'),
      value: simulateLocalUploadSize,
      onChange: setSimulateLocalUploadSize,
      choices: [
        { value: 'normal', label: t('sectionBuilder:onlineStore.files.simulateLocalUploadSizeNormal', 'Normal') },
        { value: 'too-small', label: t('sectionBuilder:onlineStore.files.simulateLocalUploadSizeTooSmall', 'Under 1KB') },
        { value: 'too-large', label: t('sectionBuilder:onlineStore.files.simulateLocalUploadSizeTooLarge', 'Over 10MB') },
      ],
    },
    {
      type: 'select',
      label: t('sectionBuilder:onlineStore.files.simulateUrlValidation', 'URL validation result'),
      value: simulateUrlValidation,
      onChange: setSimulateUrlValidation,
      choices: [
        { value: 'success', label: t('sectionBuilder:onlineStore.files.simulateUrlValidationSuccess', 'Success') },
        { value: 'malformed', label: t('sectionBuilder:onlineStore.files.simulateUrlValidationMalformed', 'Malformed / non-media URL') },
        { value: 'unsupported-host', label: t('sectionBuilder:onlineStore.files.simulateUrlValidationUnsupportedHost', 'Unsupported video host') },
        { value: 'private-restricted', label: t('sectionBuilder:onlineStore.files.simulateUrlValidationPrivate', 'Private / restricted video') },
        { value: '404', label: t('sectionBuilder:onlineStore.files.simulateUrlValidation404', '404 on image fetch') },
      ],
    },
  ];

  // Sticky, whole-screen error state (same convention as PagesManagement's
  // own simulateLoadError) — takes over in place of the header + table.
  if (simulateLoadError) {
    return (
      <div style={{ background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
        <div className="flex h-full min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6 text-center">
          <h1 className="mb-1 text-xl font-bold text-gray-800">
            {t('sectionBuilder:onlineStore.pageEditor.loadErrorTitle', 'Couldn’t load this page')}
          </h1>
          <p className="mb-4 text-sm text-gray-500">
            {t('sectionBuilder:onlineStore.pageEditor.loadErrorDescription', 'Something went wrong while loading the page. Please try again.')}
          </p>
          <MainBtn
            variant="secondary"
            size="sm"
            label={t('sectionBuilder:onlineStore.pageEditor.loadErrorReload', 'Reload Page')}
            onClick={() => setDraft(loadOrSeedDemoDraft(STORE_ID))}
          />
        </div>
        <SimulateTrigger options={simulateOptions} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
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
                    fileInputRef.current?.click();
                  }}
                  className="bg-transparent hover:bg-lb-surface-grey transition-colors"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    fontSize: 13,
                    color: '#282828',
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
                  className="bg-transparent hover:bg-lb-surface-grey transition-colors"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    fontSize: 13,
                    color: '#282828',
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

        <div
          className="files-table-wrapper"
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E9E9E9',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 240px)',
          }}
        >
          <Table
            columns={columns}
            data={paged}
            onRowClick={(row) => {
              if (isSimulatedDeletedElsewhere(row.id)) {
                showSnackbar(t('sectionBuilder:onlineStore.files.deletedElsewhereSnackbar', 'This file no longer exists'), 'red');
                return;
              }
              setPreviewItem(row);
            }}
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
                placeholder: t('sectionBuilder:onlineStore.files.searchPlaceholder', 'Search by file name'),
              },
              rowsPerPage: {
                onChange: (nextPerPage) => {
                  setPerPage(nextPerPage);
                  setPage(1);
                },
              },
            }}
            emptyStateTitle={
              search.trim()
                ? t('sectionBuilder:onlineStore.files.noSearchResultsTitle', 'No Search Results Found')
                : t('sectionBuilder:onlineStore.files.noFilesTitle', 'No files available yet')
            }
            emptyStateDescription={
              search.trim()
                ? t('sectionBuilder:onlineStore.files.noSearchResultsDescription', 'Try searching with a different term, okay?')
                : t('sectionBuilder:onlineStore.files.noFilesDescription', 'Files will appear here once you upload one.')
            }
          />
        </div>
      </div>

      <SimulateTrigger options={simulateOptions} />

      {/* Hidden native picker — "Upload file" (and nothing else) triggers
          this directly, no intermediate modal. `multiple` + `accept`
          matching ACCEPTED_TYPES so the OS dialog itself pre-filters. */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFilePickerChange}
        style={{ display: 'none' }}
      />

      {/* Whole-page drop overlay — only visible while dragging a file over
          the window (see the dragenter/dragover/dragleave/drop listeners
          above), same "drop anywhere" affordance as Google Drive/Shopify. */}
      {isDraggingOverPage && (
        // `absolute` against this page's own (now `position: relative`)
        // root — not `fixed` against the viewport — so the dashed border
        // hugs just this content column instead of the whole browser
        // window, i.e. it stops short of Layout.jsx's sidebar rather than
        // drawing across it.
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 107, 255, 0.08)',
            border: '3px dashed #006BFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ background: '#fff', borderRadius: 12, padding: '24px 32px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <UploadCloud size={32} color="#006BFF" />
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#282828' }}>
              {t('sectionBuilder:onlineStore.files.dropFilesHere', 'Drop files to upload')}
            </p>
          </div>
        </div>
      )}

      {uploadQueue.length > 0 && !uploadPanelClosed && (
        <div
          style={{
            position: 'fixed',
            right: 24,
            bottom: 96,
            zIndex: 90,
            width: 360,
            maxHeight: 420,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            border: '1px solid #E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: uploadPanelCollapsed ? 'none' : '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#282828' }}>
                {uploadingCount > 0
                  ? t('sectionBuilder:onlineStore.files.uploadingCount', 'Uploading {{count}} item(s)', { count: uploadingCount })
                  : t('sectionBuilder:onlineStore.files.uploadsComplete', 'Uploads Complete')}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <IconBtn
                  icon={uploadPanelCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  size="sm"
                  variant="ghost"
                  onClick={() => setUploadPanelCollapsed((v) => !v)}
                  aria-label={uploadPanelCollapsed ? 'Expand' : 'Collapse'}
                />
                <IconBtn
                  icon={<X size={16} />}
                  size="sm"
                  variant="ghost"
                  onClick={() => setUploadPanelClosed(true)}
                  aria-label={t('sectionBuilder:editor.common.close', 'Close')}
                />
              </div>
            </div>
            {uploadingCount === 0 && (uploadDoneCount > 0 || uploadCanceledCount > 0 || uploadErrorCount > 0) && (
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9CA3AF' }}>
                {[
                  uploadDoneCount > 0 && t('sectionBuilder:onlineStore.files.uploadedCount', '{{count}} uploaded', { count: uploadDoneCount }),
                  uploadCanceledCount > 0 && t('sectionBuilder:onlineStore.files.canceledCount', '{{count}} canceled', { count: uploadCanceledCount }),
                  uploadErrorCount > 0 && t('sectionBuilder:onlineStore.files.failedCount', '{{count}} failed', { count: uploadErrorCount }),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
          </div>
          {!uploadPanelCollapsed && (
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {uploadQueue.map((entry) => (
                <UploadQueueRow key={entry.id} entry={entry} onCancel={cancelUpload} onOpenPreview={setPreviewItem} />
              ))}
            </div>
          )}
        </div>
      )}

      <Popup
        open={urlModalOpen}
        onClose={closeUrlModal}
        title={t('sectionBuilder:onlineStore.files.addFromUrlTitle', 'Add file from URL')}
        platform="desktop"
        align="left"
        primaryAction={{
          // Always enabled — an empty/invalid URL is caught on click and
          // surfaced as an inline field error instead of disabling the
          // button (#13), matching PageEditor.jsx's own "surface the error
          // on click" convention for required fields.
          label: t('sectionBuilder:onlineStore.files.addFile', 'Add file'),
          onClick: handleAddFromUrlConfirm,
          disabled: urlChecking,
          loading: urlChecking,
        }}
        secondaryAction={{ label: t('sectionBuilder:editor.common.cancel', 'Cancel'), onClick: closeUrlModal }}
      >
        <div className="flex flex-col gap-4">
          <TextField
            label={t('sectionBuilder:onlineStore.files.urlLabelRequired', '*Image, YouTube, or Vimeo URL')}
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
              name this flow always used (see handleAddFromUrlConfirm). Live
              char counter, max 260 chars (#15) — ce-ui TextField's own
              showCount/maxLength affordance (same pattern StorePreferences.jsx
              uses for its Title/Description fields). */}
          <TextField
            label={t('sectionBuilder:onlineStore.files.renameFilenameLabel', 'File Name')}
            value={urlFilenameValue}
            showCount
            maxLength={FILENAME_MAX_LENGTH}
            onChange={(e) => setUrlFilenameValue(e.target.value.slice(0, FILENAME_MAX_LENGTH))}
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
          onChange={(e) => setRenameValue(e.target.value.slice(0, FILENAME_MAX_LENGTH))}
          autoFocus
          showCount
          maxLength={FILENAME_MAX_LENGTH}
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
          simulatePreviewLoadError={simulatePreviewLoadError}
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
function FilePreviewOverlay({ item, onClose, onDownload, simulatePreviewLoadError = false }) {
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
        {simulatePreviewLoadError ? (
          // Simulated preview load error (#17) — a type-appropriate
          // placeholder icon instead of a broken image/video embed. SVG
          // files get the same image placeholder as any other image —
          // there's no separate "svg" mediaType, just a .svg filename.
          <div className="flex flex-col items-center gap-3 text-white/70">
            {isVideo ? <FileVideo size={64} /> : <FileImage size={64} />}
            <span className="text-sm">{t('sectionBuilder:onlineStore.files.previewLoadError', "Couldn’t load preview")}</span>
          </div>
        ) : isVideo ? (
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

// One row in the floating upload-progress card — a spinner ring while
// uploading (hover reveals a cancel X in its place, same "hover swaps the
// status icon for an action" convention Google Drive's own upload toast
// uses), a green check once done, or a red alert + inline error message if
// validation rejected the file outright (never queued/ticking in that case).
function UploadQueueRow({ entry, onCancel, onOpenPreview }) {
  const { t } = useTranslation();
  const [hovering, setHovering] = useState(false);
  const isError = entry.status === 'error';
  const isDone = entry.status === 'done';
  const isCanceled = entry.status === 'canceled';
  const isUploading = entry.status === 'uploading';
  // Only a completed upload opens the real file preview — there's no
  // persisted media item yet for the other states, and re-clicking a
  // canceled/failed row to "preview" it wouldn't show anything meaningful.
  const clickable = isDone && !!entry.item;

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={clickable ? () => onOpenPreview(entry.item) : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        borderBottom: '1px solid #F3F4F6',
        cursor: clickable ? 'pointer' : 'default',
        background: clickable && hovering ? '#F9FAFB' : 'transparent',
      }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {entry.thumbSrc ? (
          <img src={entry.thumbSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <FileImage size={16} color="#9CA3AF" />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#282828', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={entry.name}>
          {entry.name}
        </p>
        {isError ? (
          <p style={{ margin: 0, fontSize: 12, color: '#DA1E28' }}>{entry.errorMessage}</p>
        ) : isCanceled ? (
          <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>{t('sectionBuilder:onlineStore.files.uploadCanceled', 'Canceled')}</p>
        ) : (
          <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>
            {isDone ? formatBytes(entry.size) : `${Math.round(entry.progress)}%`}
          </p>
        )}
      </div>
      {/* Status indicator sits at the row's right edge (not the left, ahead
          of the thumbnail) — hover-to-cancel only ever applies while still
          uploading; a finished row has nothing to cancel, so hovering it
          just shows the click-to-preview affordance above instead. */}
      <div style={{ width: 20, height: 20, flexShrink: 0 }}>
        {isError ? (
          <AlertCircle size={20} color="#DA1E28" />
        ) : isCanceled ? (
          <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#DA1E28', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={13} color="#fff" strokeWidth={3} />
          </span>
        ) : isDone ? (
          <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={13} color="#fff" strokeWidth={3} />
          </span>
        ) : isUploading && hovering ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCancel(entry.id);
            }}
            aria-label={t('sectionBuilder:onlineStore.files.cancelUpload', 'Cancel upload')}
            style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280' }}
          >
            <X size={16} />
          </button>
        ) : (
          <ProgressRing percent={entry.progress} />
        )}
      </div>
    </div>
  );
}

function ProgressRing({ percent }) {
  const size = 20;
  const stroke = 2.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#006BFF"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}
