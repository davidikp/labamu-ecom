import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Canvas from '../section-builder/ui/Canvas';
import ConfirmDialog from '../section-builder/ui/ConfirmDialog';
import { Popup, MainBtn } from '../../ce-ui';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { SITE_TEMPLATES, defaultPreviewDataFor, siteTemplateById } from '../section-builder/state/siteTemplates';
import {
  loadDraft, saveDraft, clearDraft,
  loadPublishedTheme, savePublishedTheme, loadDraftThemes, saveDraftThemes,
} from '../section-builder/state/storage';
import { applySiteTemplate } from '../section-builder/state/siteTemplateApply';
import { createFreshState } from '../section-builder/state/useSectionBuilder';
import { inferActiveTemplateId, isDefaultTheme } from '../section-builder/state/inferActiveTemplate';
import { THEME_ROSTER } from '../section-builder/themes/themeRoster';
import { getUniqueName } from '../section-builder/state/nameUtils';
import { PublishedThemeCard, DraftThemeRow, DiscoverCard } from './ThemeGalleryCards';
import SimulateTrigger from './SimulateTrigger';
import SessionExpiredIllustration from '../../assets/illustrations/session-expired.svg';

// TODO: replace with the real active store id once multi-store routing
// exists — matches the hardcoded id used by Layout.jsx's builder entry.
const STORE_ID = 'demo';

// This screen's own placeholder — the real per-company domain
// (storeDomain.js's `storeDomainFor`, `<slug>.labamu.co.id`) isn't wired
// through here, so this stays a hardcoded value matching STORE_ID.
const STORE_DOMAIN = `${STORE_ID}.etoko.labamu.co.id`;

// Cap shown next to "Draft themes" as a running "n/20" counter.
const MAX_DRAFT_THEMES = 20;

// Tracks whether this browser's already-saved published theme has been
// one-time-migrated to Xinear (the new default) — see publishedTheme's
// useState initializer below.
const XINEAR_DEFAULT_MIGRATION_KEY = `ot_published_theme_xinear_default_migrated_v1:${STORE_ID}`;

// Same one-time migration, but for the live section-builder draft (the
// content "Edit theme" actually opens) — separate flag/storage domain from
// the bookkeeping record above, see the `draft` useState initializer below.
const XINEAR_DRAFT_MIGRATION_KEY = `ot_draft_xinear_default_migrated_v1:${STORE_ID}`;

// Canvas's own desktop viewport width (see section-builder/ui/Canvas.jsx),
// scaled down to card size. Approximate for the gallery cards — these are
// previews, not pixel-perfect miniatures.
const CANVAS_DESKTOP_WIDTH = 1280;
const PREVIEW_SCALE_BIG = 0.42;

// Fill-width preview canvas shared by the published card, draft rows, and
// discover cards: measures its own rendered width (ref + ResizeObserver) and
// derives the scale factor from it, so the live Canvas content always spans
// exactly 100% of the container regardless of viewport/card width, instead
// of relying on a static scale constant that only "fills" at one particular
// width. Falls back to PREVIEW_SCALE_BIG before the first measurement to
// avoid a flash of unscaled/empty content. Sizing is controlled by the
// caller: pass `aspectRatio` (draft/discover cards, e.g. 'aspect-[16/10]')
// to have this component size itself, or omit it and let the parent
// constrain height/width instead (published card: fixed 400px tall via
// .published-theme-card__preview) — either way this component fills exactly
// 100% of whatever box it ends up in, and overflow:hidden crops the scaled
// content rather than distorting it, since width and height no longer
// necessarily share one ratio.
function FillWidthPreviewCanvas({ header, footer, sections, theme, mediaLibrary, menus, aspectRatio }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(PREVIEW_SCALE_BIG);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    function measure() {
      const width = el.getBoundingClientRect().width;
      if (width > 0) setScale(width / CANVAS_DESKTOP_WIDTH);
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-gray-50 ${aspectRatio ?? ''}`}
    >
      <div
        style={{ width: CANVAS_DESKTOP_WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        className="pointer-events-none"
      >
        <Canvas viewport="desktop" header={header} footer={footer} sections={sections} theme={theme} mediaLibrary={mediaLibrary ?? []} menus={menus} selectedId={null} readOnly />
      </div>
    </div>
  );
}

/**
 * Freezes a live preview into a true static snapshot — the published-theme
 * card's thumbnail should read as a screenshot, not a running mini
 * storefront, but FillWidthPreviewCanvas renders the real Canvas tree,
 * carousel included: hero_banner/Renderer.jsx's slideshow auto-advances on
 * its own internal `setInterval` regardless of the `readOnly` prop (that
 * only suppresses selection/edit chrome, not section-level behavior like
 * autoplay), so the "preview" was visibly animating.
 *
 * Mounts `children` normally just long enough to paint, then captures the
 * rendered DOM's `innerHTML` and swaps to that frozen markup permanently —
 * the live component tree (carousel timer included) unmounts for good at
 * that point, so this isn't merely visually paused, its interval's cleanup
 * genuinely stops it. 200ms is comfortably before hero_banner's own 5s
 * autoplay tick, so the snapshot always lands on the first slide.
 */
function StaticSnapshot({ children }) {
  const liveRef = useRef(null);
  const [frozenHtml, setFrozenHtml] = useState(null);

  useEffect(() => {
    if (frozenHtml != null) return undefined;
    const id = setTimeout(() => {
      if (liveRef.current) setFrozenHtml(liveRef.current.innerHTML);
    }, 200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (frozenHtml != null) {
    return <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: frozenHtml }} />;
  }
  return <div ref={liveRef} className="w-full h-full">{children}</div>;
}

// Fallback for theme records (published, draft, or Discover) that have no
// real renderable Canvas content: coming-soon roster stubs, the real Xinear
// entry (no seeded pages/sections/media yet — see discoverPreviewElement
// below), and defensively, any stale/unknown templateId (e.g. a leftover
// localStorage record referencing a deleted old-pool id) so nothing ever
// renders blank or throws.
function PreviewPlaceholder({ name, comingSoon, aspectRatio = 'aspect-[16/9]' }) {
  // Declares its own aspect ratio (default 16:9, matching its original
  // behavior for published/draft contexts) rather than relying on a parent
  // container ratio, so callers with a different shape — discoverItems use
  // 4:3, matching FillWidthPreviewCanvas's own aspectRatio prop there — can
  // override it without a conflicting ratio declared on both the container
  // and its content. The coming-soon badge lives on the DiscoverCard
  // wrapper itself (so it's not duplicated for discover items), not here.
  return (
    <div className={`relative w-full overflow-hidden discover-card__placeholder ${aspectRatio}${comingSoon ? ' discover-card__placeholder--coming-soon' : ''}`}>
      {name}
    </div>
  );
}

// The rotated-square decorative background behind the simulated
// session-expired takeover (Figma node 4430:25587) — ported from
// LoginRevamp.jsx's own `BgRects`, which is the same design language, since
// there's no shared component for it yet to import instead.
function SessionExpiredBgRects() {
  const base = {
    position: 'absolute',
    width: '309px',
    height: '309px',
    background: '#FFFFFF',
    opacity: 0.1,
    borderRadius: '30px',
  };
  return (
    <>
      <div style={{ ...base, left: '984px', top: '-29px', transform: 'rotate(-15.75deg)' }} />
      <div style={{ ...base, left: '-115px', top: '-140px', transform: 'rotate(37deg)' }} />
      <div style={{ ...base, left: '508px', top: '283px', transform: 'rotate(-30.26deg)' }} />
      <div style={{ ...base, left: '1211px', top: '720px', transform: 'rotate(-30.26deg)' }} />
      <div style={{ ...base, left: '115px', top: '894px', transform: 'rotate(22.2deg)' }} />
    </>
  );
}

export default function ThemeGallery() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Backfill activeTemplateId for drafts that predate this field (edited
  // before ever visiting this page) by matching the current theme against
  // a known template, and persist it immediately — so the currently-used
  // theme is saved and marked active as soon as this page opens, not just
  // recomputed-and-discarded on every render.
  const [draft] = useState(() => {
    const loaded = loadDraft(STORE_ID);

    // One-time migration: Xinear is now the default theme, including for
    // this store's live draft (what "Edit theme" opens) — runs once per
    // browser so it replaces whatever was already seeded (e.g. the old
    // Clothing/"Horizon & Co." default), but never touches real edits made
    // afterward. Deliberately unconditional (unlike the `looksUntouched`
    // auto-seed below) since the whole point is to override existing
    // content this one time.
    let draftMigrated = true;
    try { draftMigrated = localStorage.getItem(XINEAR_DRAFT_MIGRATION_KEY) === '1'; } catch { /* storage unavailable */ }
    if (!draftMigrated) {
      const xinearTemplate = siteTemplateById('xinear') ?? SITE_TEMPLATES[0];
      const migrated = applySiteTemplate(STORE_ID, xinearTemplate, 'seed');
      try { localStorage.setItem(XINEAR_DRAFT_MIGRATION_KEY, '1'); } catch { /* storage unavailable */ }
      return migrated;
    }

    if (loaded?.activeTemplateId) return loaded;

    if (loaded) {
      const inferredId = inferActiveTemplateId(loaded.theme);
      if (inferredId) {
        const backfilled = { ...loaded, activeTemplateId: inferredId };
        saveDraft(STORE_ID, backfilled);
        return backfilled;
      }
    }

    // No template has ever been chosen and nothing to infer from — either a
    // brand-new store (no draft at all) or an untouched default draft (still
    // the schema's default theme, blank homepage). Rather than showing
    // nothing as active, auto-seed the first template so the gallery — and
    // the site itself — always has one selected. Deliberately conservative:
    // only auto-seeds when the site still looks untouched, so it never
    // clobbers a merchant's real (if unthemed) work.
    const homePage = loaded?.pages?.find((p) => p.id === 'home') ?? loaded?.pages?.[0];
    const looksUntouched = !loaded || ((homePage?.sections?.length ?? 0) === 0 && isDefaultTheme(loaded.theme));
    if (looksUntouched) {
      // Xinear is the default theme for a fresh/untouched store (was
      // SITE_TEMPLATES[0] — Clothing/"Horizon & Co."). Falls back to
      // SITE_TEMPLATES[0] only if the roster ever loses its 'xinear' entry.
      const defaultTemplate = siteTemplateById('xinear') ?? SITE_TEMPLATES[0];
      return applySiteTemplate(STORE_ID, defaultTemplate);
    }
    return loaded;
  });

  const activeTemplateId = draft?.activeTemplateId ?? null;

  // ---------------------------------------------------------------------
  // Online Store > Themes bookkeeping layer (published-theme card, draft
  // theme rows, discover rail below). IMPORTANT: this is a separate concept
  // from `draft` above. `draft` is the live, editable site content that
  // section-builder actually renders and that SwitchThemeDialog/
  // applySiteTemplate operate on. The published/draft-theme *records*
  // below are just metadata cards (name, timestamps, which one is
  // "published") for this gallery screen's Shopify-style bookkeeping UI —
  // publishing one of these records does NOT re-render the live site with
  // that theme's real content. The two layers intentionally coexist
  // without touching each other's storage keys.
  // ---------------------------------------------------------------------
  const [publishedTheme, setPublishedTheme] = useState(() => {
    const existing = loadPublishedTheme(STORE_ID);

    // One-time migration: Xinear is now the default published theme. Runs
    // once per browser (tracked by XINEAR_DEFAULT_MIGRATION_KEY) so it
    // overwrites whatever was already saved (including the old
    // Clothing/"Horizon & Co." seed), but never fights a merchant's own
    // publish afterwards — once migrated, `existing` wins on every later
    // load same as before this change.
    let alreadyMigrated = true;
    try { alreadyMigrated = localStorage.getItem(XINEAR_DEFAULT_MIGRATION_KEY) === '1'; } catch { /* storage unavailable */ }
    if (existing && alreadyMigrated) return existing;

    const xinearTemplate = siteTemplateById('xinear')
      ?? SITE_TEMPLATES.find((tpl) => tpl.id === activeTemplateId)
      ?? SITE_TEMPLATES[0];
    const seeded = {
      id: existing?.id ?? `published-${Date.now()}`,
      templateId: xinearTemplate.id,
      name: xinearTemplate.name,
      previewImageUrl: null,
      publishedAt: existing?.publishedAt ?? Date.now(),
      lastSavedAt: Date.now(),
      visibility: existing?.visibility ?? 'public',
    };
    savePublishedTheme(STORE_ID, seeded);
    try { localStorage.setItem(XINEAR_DEFAULT_MIGRATION_KEY, '1'); } catch { /* storage unavailable */ }
    return seeded;
  });
  const [draftThemes, setDraftThemes] = useState(() => {
    const loaded = loadDraftThemes(STORE_ID);
    // Defensive one-time cleanup: an `isInstalling` row is always meant to
    // be transient in-memory-only state (see handleDiscoverAdd/
    // handleDraftDuplicate — neither persists it while installing/copying),
    // so one showing up here at all is leftover corrupted data from before
    // a since-fixed race where an overlapping install/duplicate could get
    // its stale placeholder written to storage permanently, stuck forever
    // on "Installing…"/"Copying…" since nothing is left to ever resolve
    // it. Strip any such rows and persist the cleaned list immediately.
    const cleaned = loaded.filter((d) => !d.isInstalling);
    if (cleaned.length !== loaded.length) saveDraftThemes(STORE_ID, cleaned);
    return cleaned;
  });
  // Fixed, stable order — the roster is now a real, finite catalog (Xinear +
  // 7 "coming soon" stubs), not a random "suggested" sample, so show all of
  // it rather than sampling a subset.
  const discoverItems = THEME_ROSTER;

  const [renamingId, setRenamingId] = useState(null); // 'published' | draft theme id
  const [publishConfirmTheme, setPublishConfirmTheme] = useState(null); // draft theme pending publish
  const [deleteConfirmTheme, setDeleteConfirmTheme] = useState(null); // draft theme pending delete
  const [addingDiscoverId, setAddingDiscoverId] = useState(null);
  const [pendingVisibility, setPendingVisibility] = useState(null); // 'public' | 'private' | null
  const { showSnackbar, hideSnackbar } = useSnackbar();

  // Simulate trigger — there's no real backend for this screen's theme data
  // to fail/time out against, or a real session to expire, so these are all
  // forced via the panel below. Checked in this order (like PagesManagement's
  // simulateNotFound/simulateLoadError) so the toggles don't fight if more
  // than one is left on at once.
  const [simulateSessionExpired, setSimulateSessionExpired] = useState(false);

  // Grouped into 'select' dropdowns (one mutually-exclusive outcome at a
  // time) rather than a checkbox per outcome — same convention as
  // PagesManagement.jsx's "Bulk delete"/"Change visibility" selects — since
  // this screen's checkbox list had grown long enough that most of the
  // toggles were really just alternate outcomes of the same action anyway
  // (e.g. a draft row can't simultaneously be "deleted elsewhere" and
  // "published elsewhere"). Each defaults to 'none'; the derived booleans
  // right below let the rest of this file keep reading a plain flag per
  // outcome instead of comparing against the select's string value
  // everywhere.
  const [simulateThemeDataState, setSimulateThemeDataState] = useState('none'); // 'none' | 'error' | 'timeout'
  const [simulateCatalogState, setSimulateCatalogState] = useState('none'); // 'none' | 'error'
  const [simulatePreviewState, setSimulatePreviewState] = useState('none'); // 'none' | 'timeout' | 'error'
  const [simulateDraftRowState, setSimulateDraftRowState] = useState('none'); // 'none' | 'deleted' | 'published'
  const [simulateDraftActionState, setSimulateDraftActionState] = useState('none'); // 'none' | 'add' | 'publish' | 'rename' | 'edit' | 'duplicate' | 'delete'

  const simulateThemeLoadError = simulateThemeDataState === 'error';
  const simulateThemeLoadTimeout = simulateThemeDataState === 'timeout';
  const simulateCatalogLoadError = simulateCatalogState === 'error';
  const simulatePreviewLoadTimeout = simulatePreviewState === 'timeout';
  const simulatePreviewLoadError = simulatePreviewState === 'error';
  const simulateAddThemeError = simulateDraftActionState === 'add';
  const simulateDraftDeletedElsewhere = simulateDraftRowState === 'deleted';
  const simulateDraftPublishedElsewhere = simulateDraftRowState === 'published';
  const simulatePublishThemeError = simulateDraftActionState === 'publish';
  const simulateRenameThemeError = simulateDraftActionState === 'rename';
  const simulateEditThemeError = simulateDraftActionState === 'edit';
  const simulateDuplicateThemeError = simulateDraftActionState === 'duplicate';
  const simulateDeleteThemeError = simulateDraftActionState === 'delete';

  // Tracks which draft ids currently have a duplicate in flight — keyed by
  // id (not a single boolean) so spamming Duplicate on row A is blocked
  // while A is copying, without also locking out row B's own Duplicate.
  const [duplicatingIds, setDuplicatingIds] = useState(() => new Set());

  // Caps the draft-themes card to the published-theme card's rendered
  // height, so a long draft list scrolls internally (.draft-theme-list)
  // instead of growing the row taller than its row partner.
  //
  // A callback ref (rather than a plain ref read inside a useLayoutEffect
  // with an empty dep array) so the observer attaches the moment the DOM
  // node actually exists — a useLayoutEffect that runs before this node's
  // conditional branch (publishedTheme && <div ref=...>) has committed
  // would otherwise capture a null .current forever and never retry, which
  // is exactly the "works after an in-session add, but not after a hard
  // refresh" symptom this was seeing.
  const [draftCardMaxHeight, setDraftCardMaxHeight] = useState(null);
  const resizeObserverRef = useRef(null);
  const publishedCardRef = useRef((node) => {
    resizeObserverRef.current?.disconnect();
    if (!node) return;
    // Measure synchronously right away — ResizeObserver's own first
    // callback is asynchronous (queued for "before next paint" at the
    // earliest), which left a visible flash of the un-capped, hugging
    // card on mount/remount. The observer below still catches later
    // resizes (font/image load, viewport changes).
    setDraftCardMaxHeight(node.getBoundingClientRect().height);
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      setDraftCardMaxHeight(entry.contentRect.height);
    });
    observer.observe(node);
    resizeObserverRef.current = observer;
  }).current;
  useEffect(() => () => resizeObserverRef.current?.disconnect(), []);

  function previewDataFor(template) {
    const isActive = template.id === activeTemplateId;
    if (isActive && draft) {
      const activePage = draft.pages.find((p) => p.id === draft.activePageId) ?? draft.pages[0];
      return {
        header: draft.header,
        footer: draft.footer,
        sections: activePage?.sections ?? [],
        theme: draft.theme,
        mediaLibrary: draft.mediaLibrary,
        menus: draft.menus,
      };
    }
    // Not active (or nothing applied yet) — illustrative preview built from
    // the template's own default data, never the merchant's real content.
    return defaultPreviewDataFor(template);
  }

  // Preview element for the big published-theme card: reuses the real, live
  // draft content when the published record's templateId matches the
  // currently-active template (the common case), falls back to that
  // template's illustrative default preview when it doesn't, and — for a
  // published record whose templateId has no SITE_TEMPLATES match at all
  // (e.g. published straight from a Discover-added draft) — falls back to
  // an illustrative placeholder rather than hiding the card entirely (the
  // bug being fixed here). Always resolves to something renderable, so the
  // card's render guard no longer needs to gate on this.
  const publishedPreviewElement = useMemo(() => {
    // Prefer the published record's own persisted builder content — same
    // as draftPreviewElement does for draft rows below — over the
    // templateId-match/activeTemplateId logic further down. A theme
    // promoted from the draft list (see handlePublishConfirm) keeps its own
    // section-builder namespace (draftThemeRecord.id) with whatever the
    // merchant actually edited there; without this, the card would instead
    // show either the shared STORE_ID draft (only right by coincidence, if
    // that happens to be on the same template) or the template's generic
    // illustrative default — neither of which is a real "snapshot" of what
    // was just published.
    const liveContent = publishedTheme?.id ? loadDraft(publishedTheme.id) : null;
    if (liveContent) {
      const activePage = liveContent.pages.find((p) => p.id === liveContent.activePageId) ?? liveContent.pages[0];
      return (
        <FillWidthPreviewCanvas
          header={liveContent.header}
          footer={liveContent.footer}
          sections={activePage?.sections ?? []}
          theme={liveContent.theme}
          mediaLibrary={liveContent.mediaLibrary}
          menus={liveContent.menus}
        />
      );
    }
    const publishedTemplate = SITE_TEMPLATES.find((tpl) => tpl.id === publishedTheme?.templateId);
    if (publishedTemplate) {
      const data = publishedTemplate.id === activeTemplateId
        ? previewDataFor(publishedTemplate)
        : defaultPreviewDataFor(publishedTemplate);
      return <FillWidthPreviewCanvas {...data} />;
    }
    // Not a real SITE_TEMPLATES entry — fall back to the theme roster (e.g.
    // published straight from a Discover-added draft). Roster entries carry
    // no `theme`/`header`/`footer`/`pages` shape (unlike the old Discover
    // pool fixtures), so there's nothing to feed defaultPreviewDataFor —
    // render a named placeholder instead.
    const rosterItem = THEME_ROSTER.find((item) => item.id === publishedTheme?.templateId);
    if (rosterItem) return <PreviewPlaceholder name={rosterItem.name} />;
    // Neither a real template nor a known roster entry (e.g. a stale
    // localStorage record referencing a deleted old pool id) — final
    // defensive fallback so this never throws or renders blank.
    return <PreviewPlaceholder name={publishedTheme?.name} />;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publishedTheme?.id, publishedTheme?.templateId, publishedTheme?.name, activeTemplateId, draft]);

  function draftPreviewElement(draftThemeRecord) {
    // Each draft theme now has its own persisted builder content, keyed by
    // draftThemeRecord.id (see handleDiscoverAdd) — prefer that real, live
    // content so the card reflects whatever the merchant has actually edited
    // in this draft's own section-builder URL, not just an illustrative
    // stand-in. Falls back to the old illustrative-preview behavior for
    // draft records that predate this (no content saved under their id yet).
    const liveDraft = loadDraft(draftThemeRecord.id);
    if (liveDraft) {
      const activePage = liveDraft.pages.find((p) => p.id === liveDraft.activePageId) ?? liveDraft.pages[0];
      return (
        <FillWidthPreviewCanvas
          header={liveDraft.header}
          footer={liveDraft.footer}
          sections={activePage?.sections ?? []}
          theme={liveDraft.theme}
          mediaLibrary={liveDraft.mediaLibrary}
          menus={liveDraft.menus}
          aspectRatio="aspect-[16/10]"
        />
      );
    }
    const template = SITE_TEMPLATES.find((tpl) => tpl.id === draftThemeRecord.templateId);
    if (template) return <FillWidthPreviewCanvas {...defaultPreviewDataFor(template)} aspectRatio="aspect-[16/10]" />;
    const rosterItem = THEME_ROSTER.find((item) => item.id === draftThemeRecord.templateId);
    if (rosterItem) return <PreviewPlaceholder name={rosterItem.name} />;
    return <PreviewPlaceholder name={draftThemeRecord.name} />;
  }

  // Every THEME_ROSTER entry now carries a static `previewImage` screenshot
  // (ported from ecom-from-bella's WebsiteTemplates.jsx cards, which use the
  // same images) — that's always preferred over a live Canvas render here,
  // matching the reference design exactly (it never live-renders a card,
  // always a static image), and it's the only real preview available at all
  // for the still-`comingSoon` stubs, which have no SITE_TEMPLATES content
  // to render live in the first place. The live-Canvas/placeholder fallback
  // stays only as defense against a future roster entry that's missing one.
  function discoverPreviewElement(item) {
    if (item.previewImage) {
      return (
        <img
          src={item.previewImage}
          alt={item.name}
          className="discover-card__preview-img aspect-[4/3]"
        />
      );
    }
    const template = siteTemplateById(item.id);
    if (template) return <FillWidthPreviewCanvas {...defaultPreviewDataFor(template)} aspectRatio="aspect-[4/3]" />;
    return <PreviewPlaceholder name={item.name} comingSoon={item.comingSoon} aspectRatio="aspect-[4/3]" />;
  }

  function handleOpen() {
    if (simulateEditThemeError) {
      showSnackbar(t('sectionBuilder:onlineStore.themes.editThemeFailed', 'Failed to open theme editor'), 'red');
      return;
    }
    navigate(`/section-builder/${STORE_ID}`);
  }

  // Each draft theme is its own storeId namespace (see handleDiscoverAdd),
  // so "Edit" on a draft row must open that draft's own section-builder URL
  // rather than the shared STORE_ID route the published-theme card uses —
  // otherwise every draft (and the published theme) all edit the exact same
  // content under the same URL.
  function handleDraftOpen(draftThemeRecord) {
    if (!checkDraftAvailable()) return;
    if (simulateEditThemeError) {
      showSnackbar(t('sectionBuilder:onlineStore.themes.editThemeFailed', 'Failed to open theme editor'), 'red');
      return;
    }
    navigate(`/section-builder/${draftThemeRecord.id}`);
  }

  // Checked at the top of every draft-row action — represents the draft
  // record having been deleted from another browser tab/window since this
  // one last loaded the list, which this demo has no real cross-tab
  // channel to detect on its own. Applies to every draft row once armed
  // (there's no per-row picker in the Simulate panel, same as the other
  // global toggles here).
  function checkDraftAvailable() {
    if (simulateDraftDeletedElsewhere) {
      showSnackbar(t('sectionBuilder:onlineStore.themes.draftNoLongerExists', 'Draft theme no longer exists'), 'red');
      return false;
    }
    return true;
  }

  // `draftThemeId` is only passed when this preview was opened from a draft
  // row (see handleDraftPreview) — it's threaded onto the preview URL as
  // ?draftId=, which ThemePreview.jsx reads to know it's showing a specific
  // draft's content rather than a template's static illustrative preview,
  // so its own "deleted in another window" simulate option has something
  // real to key off.
  function handleSeePreview(template, draftThemeId) {
    // "Fails to load" is treated as failing before a preview attempt even
    // gets underway — straight to the red error snackbar, no loading state
    // in between (per the simulate spec: fail immediately).
    if (simulatePreviewLoadError) {
      showSnackbar(t('sectionBuilder:onlineStore.themes.previewLoadFailed', 'Failed to load preview'), 'red');
      return;
    }
    showSnackbar(t('sectionBuilder:onlineStore.themes.loadingPreview', 'Loading preview...'), 'grey');
    if (simulatePreviewLoadTimeout) {
      // Longer than the normal 2000ms loading window so this reads as the
      // preview timing out rather than the ordinary load — the loading
      // snackbar just runs out and the preview page never opens.
      setTimeout(() => {
        showSnackbar(t('sectionBuilder:onlineStore.themes.previewLoadFailed', 'Failed to load preview'), 'red');
      }, 5000);
      return;
    }
    setTimeout(() => {
      hideSnackbar();
      const suffix = draftThemeId ? `?draftId=${encodeURIComponent(draftThemeId)}` : '';
      navigate(`/online-store/theme/${template.id}/preview${suffix}`);
    }, 2000);
  }

  // -- Published theme card actions --------------------------------------

  function handlePublishedPreview() {
    const template = SITE_TEMPLATES.find((tpl) => tpl.id === publishedTheme?.templateId);
    if (template) {
      handleSeePreview(template);
      return;
    }
    // No real template backs this published record (e.g. published from a
    // Discover-added draft) — consistent with handleDiscoverPreview's
    // deliberate no-op for decorative/illustrative-only fixtures.
    console.log('Preview (illustrative only, no real template):', publishedTheme?.name);
  }

  function handlePublishedRenameSubmit(newName) {
    const updated = { ...publishedTheme, name: newName };
    setPublishedTheme(updated);
    savePublishedTheme(STORE_ID, updated);
    setRenamingId(null);
  }

  // Opens the confirm dialog for a visibility change picked from the badge's
  // popover (see PublishedVisibilityBadge) — the popover itself already
  // no-ops a re-selection of the current value, so `next` here is always an
  // actual change.
  function handleVisibilitySelect(next) {
    setPendingVisibility(next);
  }

  function handleVisibilityConfirm() {
    const updated = { ...publishedTheme, visibility: pendingVisibility };
    setPublishedTheme(updated);
    savePublishedTheme(STORE_ID, updated);
    setPendingVisibility(null);
    showSnackbar(t('sectionBuilder:onlineStore.themes.visibilityUpdated', 'Theme visibility updated'), 'green');
  }

  // -- Draft theme row actions --------------------------------------------

  function handleDraftPreview(draftThemeRecord) {
    if (!checkDraftAvailable()) return;
    const template = SITE_TEMPLATES.find((tpl) => tpl.id === draftThemeRecord.templateId);
    if (template) {
      handleSeePreview(template, draftThemeRecord.id);
      return;
    }
    console.log('Preview (illustrative only, no real template):', draftThemeRecord.name);
  }

  function handleDraftRenameStart(draftThemeRecord) {
    if (!checkDraftAvailable()) return;
    setRenamingId(draftThemeRecord.id);
  }

  // Returns true/false to RenameField (see ThemeGalleryCards.jsx) — false
  // means the save was rejected (its own red snackbar already shown here)
  // and the field should revert its text and stay open, true means it was
  // applied and rename mode has already been exited below.
  function handleDraftRenameSubmit(draftThemeRecord, trimmedName) {
    if (!checkDraftAvailable()) return false;
    if (simulateRenameThemeError) {
      showSnackbar(t('sectionBuilder:onlineStore.themes.renameFailed', 'Failed to save draft theme'), 'red');
      return false;
    }
    const isDuplicate = draftThemes.some(
      (d) => d.id !== draftThemeRecord.id && d.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      showSnackbar(t('sectionBuilder:onlineStore.themes.nameAlreadyExists', 'Draft theme name already exist'), 'red');
      return false;
    }
    const nextList = draftThemes.map((d) => (d.id === draftThemeRecord.id ? { ...d, name: trimmedName } : d));
    setDraftThemes(nextList);
    saveDraftThemes(STORE_ID, nextList);
    setRenamingId(null);
    showSnackbar(t('sectionBuilder:onlineStore.themes.draftSaved', 'Draft theme successfully saved'), 'green');
    return true;
  }

  function handleDraftDuplicate(draftThemeRecord) {
    // Spam guard — silently ignored (no snackbar) rather than erroring,
    // since this isn't a failure, just a click that arrived while this
    // exact row's own copy was already running.
    if (duplicatingIds.has(draftThemeRecord.id)) return;
    if (!checkDraftAvailable()) return;
    if (simulateDuplicateThemeError) {
      showSnackbar(t('sectionBuilder:onlineStore.themes.duplicateFailed', 'Failed to duplicate theme'), 'red');
      return;
    }
    if (draftThemes.length >= MAX_DRAFT_THEMES) {
      showSnackbar(t('sectionBuilder:onlineStore.themes.draftFull', 'Draft theme is full'), 'red');
      return;
    }

    // Same "installing" placeholder treatment as handleDiscoverAdd (spinner
    // thumb, disabled actions, not persisted) — just with copy-specific
    // wording and a 4s delay to actually be visible, matching that flow's
    // deliberately-slowed-down timing.
    //
    // Both the insert below and the resolve inside the timeout use the
    // *functional* setDraftThemes(prev => ...) form and patch the specific
    // placeholder by id, rather than snapshotting `draftThemes` once into a
    // `baseline` and rebuilding the whole list from it later. A snapshot
    // taken at click time goes stale the moment a second duplicate/install
    // starts before this one's 4s timer fires — its own later resolve would
    // then overwrite the list from its own older baseline, silently
    // dropping (or resurrecting an already-finished) placeholder from a
    // still-in-flight sibling operation. Patching by id is safe regardless
    // of how many of these overlap or in what order they resolve.
    const uniqueName = getUniqueName(draftThemes.map((d) => d.name), draftThemeRecord.name);
    const installingId = `installing-${Date.now()}`;
    const placeholder = {
      id: installingId,
      templateId: draftThemeRecord.templateId,
      name: uniqueName,
      previewImageUrl: null,
      addedAt: Date.now(),
      lastSavedAt: Date.now(),
      isInstalling: true,
      installingLabel: t('sectionBuilder:onlineStore.themes.copying', 'Copying your theme'),
    };
    setDraftThemes((prev) => [...prev, placeholder]);
    setDuplicatingIds((prev) => new Set(prev).add(draftThemeRecord.id));

    setTimeout(() => {
      const newId = `draft-${Date.now()}`;
      // Copy the source draft's real builder content into the new draft's
      // own namespace too, not just the bookkeeping row, so the duplicate
      // opens with the same content instead of an empty/default site.
      const sourceContent = loadDraft(draftThemeRecord.id);
      if (sourceContent) saveDraft(newId, sourceContent);
      const copy = { ...draftThemeRecord, id: newId, name: uniqueName, addedAt: Date.now(), lastSavedAt: Date.now() };
      setDraftThemes((prev) => {
        const next = prev.map((d) => (d.id === installingId ? copy : d));
        saveDraftThemes(STORE_ID, next);
        return next;
      });
      setDuplicatingIds((prev) => {
        const next = new Set(prev);
        next.delete(draftThemeRecord.id);
        return next;
      });
      showSnackbar(t('sectionBuilder:onlineStore.themes.draftSaved', 'Draft theme successfully saved'), 'green');
    }, 4000);
  }

  function handleDraftDeleteClick(draftThemeRecord) {
    if (!checkDraftAvailable()) return;
    if (simulateDraftPublishedElsewhere) {
      showSnackbar(t('sectionBuilder:onlineStore.themes.draftAlreadyPublished', 'Draft theme already published'), 'red');
      return;
    }
    if (simulateDeleteThemeError) {
      showSnackbar(t('sectionBuilder:onlineStore.themes.deleteThemeFailed', 'Failed to delete theme'), 'red');
      return;
    }
    setDeleteConfirmTheme(draftThemeRecord);
  }

  function handleDraftDeleteConfirm() {
    // Clean up the draft's own persisted builder content along with its
    // bookkeeping row, so deleted drafts don't linger in localStorage.
    clearDraft(deleteConfirmTheme.id);
    const nextList = draftThemes.filter((d) => d.id !== deleteConfirmTheme.id);
    setDraftThemes(nextList);
    saveDraftThemes(STORE_ID, nextList);
    setDeleteConfirmTheme(null);
    showSnackbar(t('sectionBuilder:onlineStore.themes.draftDeleted', 'Draft theme successfully deleted'), 'grey');
  }

  function handleDraftPublishClick(draftThemeRecord) {
    if (!checkDraftAvailable()) return;
    if (simulateDraftPublishedElsewhere) {
      showSnackbar(t('sectionBuilder:onlineStore.themes.draftAlreadyPublished', 'Draft theme already published'), 'red');
      return;
    }
    if (simulatePublishThemeError) {
      showSnackbar(t('sectionBuilder:onlineStore.themes.publishThemeFailed', 'Failed to publish theme'), 'red');
      return;
    }
    setPublishConfirmTheme(draftThemeRecord);
  }

  function handlePublishConfirm() {
    const promoted = publishConfirmTheme;
    if (!promoted) return;
    // Close the confirm dialog immediately (the merchant already
    // confirmed) — the grey "Publishing…" snackbar below stands in for the
    // publish actually happening, same convention as the Discover "Add"/
    // duplicate flows' own installing-delay snackbars.
    setPublishConfirmTheme(null);
    showSnackbar(t('sectionBuilder:onlineStore.themes.publishingTheme', 'Publishing theme...'), 'grey');

    setTimeout(() => {
      // Demote the currently published record into the draft list, deduping
      // its name against the existing draft names.
      const remainingDrafts = draftThemes.filter((d) => d.id !== promoted.id);
      const demotedName = getUniqueName(remainingDrafts.map((d) => d.name), publishedTheme.name);
      const demoted = { ...publishedTheme, id: publishedTheme.id ?? `draft-${Date.now()}`, name: demotedName, addedAt: Date.now() };

      const nextDraftThemes = [...remainingDrafts, demoted];
      // Visibility is a property of the *store*, not of whichever theme
      // happens to be published — swapping which theme is live must never
      // silently flip a store that was deliberately set Private back to
      // Public. Carries the outgoing publishedTheme's own visibility
      // forward onto the new record (defaulting to 'public' only if that's
      // somehow missing, e.g. a pre-visibility-field record).
      const nextPublished = {
        ...promoted,
        publishedAt: Date.now(),
        lastSavedAt: Date.now(),
        visibility: publishedTheme?.visibility ?? 'public',
      };

      setDraftThemes(nextDraftThemes);
      saveDraftThemes(STORE_ID, nextDraftThemes);
      setPublishedTheme(nextPublished);
      savePublishedTheme(STORE_ID, nextPublished);
      showSnackbar(t('sectionBuilder:onlineStore.themes.themePublished', 'Theme published successfully'), 'green');
    }, 2000);
  }

  // -- Discover section actions --------------------------------------------

  function handleDiscoverAdd(item) {
    // Defensive guard — the Add button is disabled for coming-soon stubs, so
    // this should be unreachable, but never apply a stub theme regardless.
    if (item.comingSoon) return;

    if (simulateAddThemeError) {
      showSnackbar(t('sectionBuilder:onlineStore.themes.addThemeFailed', 'Failed to add theme'), 'red');
      return;
    }

    if (draftThemes.length >= MAX_DRAFT_THEMES) {
      showSnackbar(t('sectionBuilder:onlineStore.themes.draftFull', 'Draft theme is full'), 'red');
      return;
    }

    // Shopify-style "Installing theme" row — shows up in the Draft themes
    // list immediately (spinner thumb, disabled actions; see
    // DraftThemeRow's isInstalling prop) rather than only reflecting in the
    // Discover card's own "Adding…" button state.
    //
    // Both the insert below and the resolve inside the timeout use the
    // *functional* setDraftThemes(prev => ...) form and patch the specific
    // placeholder by id, rather than snapshotting `draftThemes` once into a
    // `baseline` and rebuilding the whole list from it 4s later — a
    // snapshot taken at click time goes stale the moment a second
    // install/duplicate starts before this one resolves (see
    // handleDraftDuplicate's own version of this fix for the full story).
    const uniqueName = getUniqueName(draftThemes.map((d) => d.name), item.name);
    const installingId = `installing-${Date.now()}`;
    const placeholder = {
      id: installingId,
      templateId: item.id,
      name: uniqueName,
      previewImageUrl: null,
      addedAt: Date.now(),
      lastSavedAt: Date.now(),
      isInstalling: true,
    };
    // Deliberately not persisted via saveDraftThemes — an in-progress
    // install is transient UI state, not something a page refresh mid-way
    // through should try to resume.
    setDraftThemes((prev) => [...prev, placeholder]);

    setAddingDiscoverId(item.id);
    // Same 4000ms window as the installing placeholder above resolves in
    // (see the setTimeout below) — the snackbar's lifespan should track the
    // actual installing process, not run on its own separate clock.
    showSnackbar(t('sectionBuilder:onlineStore.themes.installingTheme', 'Installing theme...'), 'grey');
    setTimeout(() => {
      // Every draft theme gets its own section-builder storeId namespace
      // (storage.js keys everything off storeId), so each one opens at its
      // own /section-builder/:storeId URL with its own content, instead of
      // every draft (and the published theme) all reading/writing the same
      // shared STORE_ID draft.
      const newDraftId = `draft-${Date.now()}`;

      // Any roster item backed by a real SITE_TEMPLATES entry (Xinear,
      // Houzez, ...) is applied the same way the auto-seed-on-first-visit
      // path does, which actually seeds theme/pages/header/footer/media
      // (mode: 'seed' — the "start fresh with this theme" contract) and
      // sets activeTemplateId so the builder loads the correct content,
      // rather than the skin-only storefrontThemeId write used for roster
      // items with no real template content behind them.
      const matchedTemplate = siteTemplateById(item.id);
      if (matchedTemplate) {
        applySiteTemplate(newDraftId, matchedTemplate, 'seed');
      } else {
        // Skin-only fallback for roster items that are still just a
        // themes/registry.js color-token definition (no SITE_TEMPLATES
        // entry backing them yet): start from a fresh default builder state
        // (nothing exists yet under this new draft's own id) and write
        // storefrontThemeId/storefrontThemeMode onto it so Canvas.jsx's
        // effect (see ui/Canvas.jsx) skins the storefront preview/renderer
        // with this theme, without fabricating page/section content.
        const fresh = createFreshState(newDraftId);
        const seeded = {
          ...fresh,
          theme: {
            ...fresh.theme,
            storefrontThemeId: item.id,
            storefrontThemeMode: fresh.theme?.storefrontThemeMode || 'light',
          },
        };
        saveDraft(newDraftId, seeded);
      }

      // Bookkeeping record for the "Draft themes" list UX — its `id` doubles
      // as the section-builder storeId namespace seeded above, so the row's
      // "Edit" link (handleDraftOpen) and its persisted content always agree.
      const newDraft = {
        id: newDraftId,
        templateId: item.id,
        name: uniqueName,
        previewImageUrl: null,
        addedAt: Date.now(),
        lastSavedAt: Date.now(),
      };
      // Replaces the installing placeholder in-place by id — see the note
      // above the placeholder insert for why this reads/writes off the
      // functional `prev` rather than a stale click-time snapshot.
      setDraftThemes((prev) => {
        const next = prev.map((d) => (d.id === installingId ? newDraft : d));
        saveDraftThemes(STORE_ID, next);
        return next;
      });
      setAddingDiscoverId(null);
      showSnackbar(t('sectionBuilder:onlineStore.themes.draftSaved', 'Draft theme successfully saved'), 'green');
    }, 4000);
  }

  function handleDiscoverPreview(item) {
    // Xinear (and any future roster item backed by a real SITE_TEMPLATES
    // entry — see discoverPreviewElement above, which already renders a
    // live thumbnail for exactly this case) gets the same full "See
    // Preview" route as a published/draft theme. This previously always
    // no-op'd regardless of whether real content existed, which is why the
    // Preview button did nothing for Xinear specifically — only the
    // genuinely content-less `comingSoon` stubs should stay a no-op, since
    // there's truly nothing to preview for those.
    const template = siteTemplateById(item.id);
    if (template) {
      handleSeePreview(template);
      return;
    }
    console.log('Preview (discover, illustrative only):', item.name);
  }

  // 'None' choice reused across every select group below — one shared
  // label/value pair instead of re-declaring it per group.
  const SIMULATE_NONE_CHOICE = { value: 'none', label: t('sectionBuilder:onlineStore.themes.simulateNone', 'None') };

  const simulateOptions = [
    {
      type: 'checkbox',
      label: t('sectionBuilder:onlineStore.themes.simulateSessionExpired', 'Simulate session expired'),
      checked: simulateSessionExpired,
      // Clears the real auth flag the instant this is armed — the modal
      // below is meant to represent an actually-expired session, not just
      // a visual overlay sitting on top of a still-logged-in app. Without
      // this, closing/dismissing the modal any other way (e.g. navigating
      // away) would leave the merchant still authenticated underneath.
      onChange: (checked) => {
        if (checked) sessionStorage.removeItem('lb_mock_auth');
        setSimulateSessionExpired(checked);
      },
    },
    {
      type: 'select',
      label: t('sectionBuilder:onlineStore.themes.simulateThemeDataLabel', 'Theme data'),
      value: simulateThemeDataState,
      onChange: setSimulateThemeDataState,
      choices: [
        SIMULATE_NONE_CHOICE,
        { value: 'error', label: t('sectionBuilder:onlineStore.themes.simulateLoadError', 'Load error') },
        { value: 'timeout', label: t('sectionBuilder:onlineStore.themes.simulateTimeout', 'Timeout') },
      ],
    },
    {
      type: 'select',
      label: t('sectionBuilder:onlineStore.themes.simulateCatalogLabel', 'Theme catalog'),
      value: simulateCatalogState,
      onChange: setSimulateCatalogState,
      choices: [
        SIMULATE_NONE_CHOICE,
        { value: 'error', label: t('sectionBuilder:onlineStore.themes.simulateLoadError', 'Load error') },
      ],
    },
    {
      type: 'select',
      label: t('sectionBuilder:onlineStore.themes.simulatePreviewLabel', 'Preview'),
      value: simulatePreviewState,
      onChange: setSimulatePreviewState,
      choices: [
        SIMULATE_NONE_CHOICE,
        { value: 'timeout', label: t('sectionBuilder:onlineStore.themes.simulateTimeout', 'Timeout') },
        { value: 'error', label: t('sectionBuilder:onlineStore.themes.simulateLoadError', 'Load error') },
      ],
    },
    {
      type: 'select',
      // The row itself being stale — deleted or already published from
      // another tab — as opposed to simulateDraftActionState below, which
      // is a specific action call failing on an otherwise-still-valid row.
      label: t('sectionBuilder:onlineStore.themes.simulateDraftRowLabel', 'Draft theme row'),
      value: simulateDraftRowState,
      onChange: setSimulateDraftRowState,
      choices: [
        SIMULATE_NONE_CHOICE,
        { value: 'deleted', label: t('sectionBuilder:onlineStore.themes.simulateDeletedElsewhere', 'Deleted in another window') },
        { value: 'published', label: t('sectionBuilder:onlineStore.themes.simulatePublishedElsewhere', 'Already published in another window') },
      ],
    },
    {
      type: 'select',
      label: t('sectionBuilder:onlineStore.themes.simulateDraftActionLabel', 'Draft theme action'),
      value: simulateDraftActionState,
      onChange: setSimulateDraftActionState,
      choices: [
        SIMULATE_NONE_CHOICE,
        { value: 'add', label: t('sectionBuilder:onlineStore.themes.simulateAddError', 'Add error') },
        { value: 'publish', label: t('sectionBuilder:onlineStore.themes.simulatePublishError', 'Publish error') },
        { value: 'rename', label: t('sectionBuilder:onlineStore.themes.simulateRenameError', 'Rename error') },
        { value: 'edit', label: t('sectionBuilder:onlineStore.themes.simulateEditError', 'Edit error') },
        { value: 'duplicate', label: t('sectionBuilder:onlineStore.themes.simulateDuplicateError', 'Duplicate error') },
        { value: 'delete', label: t('sectionBuilder:onlineStore.themes.simulateDeleteError', 'Delete error') },
      ],
    },
  ];

  // The merchant's session expiring takes over the whole screen — this
  // should read as "you're logged out", not as this page's own data
  // failing, so it's a Figma-specced full-bleed prompt to log back in
  // (design: node 4430:25587) rather than the load-error/timeout cards'
  // inline banner-with-retry treatment. The decorative rotated-square
  // background (BgRects) is ported from LoginRevamp.jsx's own copy of the
  // same design language rather than re-derived from scratch.
  if (simulateSessionExpired) {
    // Portaled to document.body and pinned to the full viewport (not just
    // this route's content area) — Layout.jsx's sidebar/header render
    // around whatever this component returns, so returning the takeover
    // normally would leave them visible behind it, looking like the
    // merchant is still logged in even though the auth flag really was
    // just cleared. A real /login redirect (see the button below) is the
    // only way to shed that chrome for good; this portal just makes the
    // simulated screen look the part in the meantime.
    return createPortal(
      <div style={{ position: 'fixed', inset: 0, zIndex: 2000, minHeight: '100vh', background: '#006BFF', overflow: 'hidden', fontFamily: "'Lato', sans-serif" }}>
        <SessionExpiredBgRects />
        {/* No close/dismiss control — this represents an actually-expired,
            logged-out session (see the onChange above), not a dismissable
            overlay you can close and keep working behind. */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '375px', maxWidth: 'calc(100vw - 32px)', background: '#FFFFFF', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={SessionExpiredIllustration} alt="" style={{ width: '181px', height: 'auto', margin: '0 0 32px' }} />
          <h1 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, lineHeight: '26px', letterSpacing: '0.1238px', color: '#282828', textAlign: 'center' }}>
            {t('sectionBuilder:onlineStore.themes.sessionExpiredTitle', 'Session Expired')}
          </h1>
          <p style={{ margin: '0 0 32px', fontSize: '12px', lineHeight: '18px', letterSpacing: '0.0825px', color: '#7E7E7E', textAlign: 'center' }}>
            {t(
              'sectionBuilder:onlineStore.themes.sessionExpiredDescription',
              'Your session has ended for security reasons. You’ll be signed out of all Labamu platforms included in your subscription. Sign in again to continue.'
            )}
          </p>
          <MainBtn
            variant="primary"
            size="lg"
            className="w-full"
            label={t('sectionBuilder:onlineStore.themes.sessionExpiredLogIn', 'Sign In Again')}
            onClick={() => {
              // A real logout, not just a redirect — matches Layout.jsx's
              // own handleLogout, so this genuinely leaves the merchant
              // signed out (App.jsx's route guard reads this same key)
              // rather than just visually landing on /login while still
              // authenticated underneath.
              sessionStorage.removeItem('lb_mock_auth');
              navigate('/login', { replace: true });
            }}
          />
        </div>
        <SimulateTrigger options={simulateOptions} />
      </div>,
      document.body
    );
  }

  // Scoped to just the Published Theme + Draft Themes cards (the "theme
  // data" this page loads) — unlike the session-expired/timeout takeovers,
  // the page chrome (heading, Discover Themes below) stays intact, since
  // that section has nothing to do with the store's own theme data. A
  // shared explicit height (rather than `alignSelf: stretch`, which should
  // equalize identical siblings on paper but didn't hold up in practice —
  // and rather than .theme-gallery-row's own `align-items: start`,
  // deliberately *not* stretch there so the real published/draft cards can
  // size the row from a JS-measured height without a stretched sibling
  // fighting it) guarantees both cards render at the same height
  // regardless. Reload genuinely clears the flag and returns to the normal
  // view — unlike PagesManagement's sticky-while-armed simulateLoadError,
  // there's no reason to make a merchant re-open the Simulate panel just
  // to see the recovered state after clicking Reload.
  function ThemeSectionErrorCard() {
    // marginTop: 0 overrides ".gallery-card + .gallery-card { margin-top:
    // 24px }" (meant for this class's other use — vertically-stacked cards
    // elsewhere on this page) — these two render as adjacent siblings in
    // the same grid row, so that rule was matching the second one and
    // pushing it down within its cell, misaligning it against the first
    // despite both being the same height.
    return (
      <div className="gallery-card" style={{ height: '320px', marginTop: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '48px 24px', gap: '4px' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#282828' }}>
          {t('sectionBuilder:onlineStore.themes.loadErrorTitle', 'Couldn’t load theme data')}
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6B7280' }}>
          {t('sectionBuilder:onlineStore.themes.loadErrorDescription', 'Something went wrong while loading your theme data. Please try again.')}
        </p>
        <MainBtn
          variant="secondary"
          size="sm"
          label={t('sectionBuilder:onlineStore.themes.loadErrorReload', 'Reload')}
          onClick={() => setSimulateThemeDataState('none')}
        />
      </div>
    );
  }

  // Scoped to just the Discover Themes section — the store's own theme
  // data (Published Theme + Draft Themes) still renders normally, since
  // this represents the roster/catalog request failing independently of
  // that data. Reload clears the flag, same as ThemeSectionErrorCard above.
  function CatalogSectionErrorCard() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '48px 24px', gap: '4px' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#282828' }}>
          {t('sectionBuilder:onlineStore.themes.catalogLoadErrorTitle', 'Couldn’t load theme catalog')}
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6B7280' }}>
          {t('sectionBuilder:onlineStore.themes.catalogLoadErrorDescription', 'Something went wrong while loading Discover Themes. Please try again.')}
        </p>
        <MainBtn
          variant="secondary"
          size="sm"
          label={t('sectionBuilder:onlineStore.themes.loadErrorReload', 'Reload')}
          onClick={() => setSimulateCatalogState('none')}
        />
      </div>
    );
  }

  // Same full-page takeover as the hard-error case above, and now the same
  // "Couldn't load this page" / "Reload Page" wording too — the visible
  // distinction between a timeout and a hard error is left to whatever a
  // real backend would report (a request that timed out vs. one that
  // failed outright), not to different copy on this demo screen.
  if (simulateThemeLoadTimeout) {
    return (
      <div style={{ background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
        <div className="flex h-full min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6 text-center">
          <h1 className="mb-1 text-xl font-bold text-gray-800">
            {t('sectionBuilder:onlineStore.themes.loadTimeoutTitle', 'Couldn’t load this page')}
          </h1>
          <p className="mb-4 text-sm text-gray-500">
            {t('sectionBuilder:onlineStore.themes.loadTimeoutDescription', 'The request took too long to complete. Try reloading the page.')}
          </p>
          <MainBtn
            variant="secondary"
            size="sm"
            label={t('sectionBuilder:onlineStore.themes.loadTimeoutReload', 'Reload Page')}
            onClick={() => {}}
          />
        </div>
        <SimulateTrigger options={simulateOptions} />
      </div>
    );
  }

  return (
    <div style={{ background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
      <style>{`
        .template-overlay {
          position: absolute; inset: 0; background: rgba(0, 0, 0, 0.5); opacity: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
          transition: opacity 0.2s; backdrop-filter: blur(4px); padding: 24px; z-index: 20;
        }
        .template-overlay-container:hover .template-overlay { opacity: 1; }
        .discover-overlay-btn {
          width: 140px; padding: 10px 20px; font-size: 13px; font-weight: 700;
          border-radius: 12px; cursor: pointer; transition: all 0.15s ease; font-family: 'Lato', sans-serif;
        }
        .discover-overlay-btn--secondary { background: #FFFFFF; color: #006BFF; border: 1px solid #006BFF; }
        .discover-overlay-btn--secondary:hover { background: #F0F6FF; border-color: #0055D4; }

        .section-heading { margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #282828; }

        .gallery-card {
          background: #FFFFFF; border: 1px solid #E9E9E9; border-radius: 12px; padding: 24px 20px;
        }
        .gallery-card + .gallery-card { margin-top: 24px; }

        .theme-gallery-row {
          display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; align-items: start;
          margin-bottom: 24px;
        }
        @media (max-width: 900px) {
          .theme-gallery-row { grid-template-columns: 1fr; }
        }

        .draft-heading-row {
          display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;
        }
        .draft-heading-row .section-heading { margin: 0; }
        .draft-count {
          flex-shrink: 0; font-size: 13px; font-weight: 700; color: #6B7280;
        }
        .draft-count--full { color: #DC2626; }

        /* Card 2 is given an explicit height (in px, from JS — see
           publishedCardRef) matching the published theme card's own
           rendered height, and the draft list scrolls internally once it
           outgrows that height instead of pushing the card taller than its
           row partner. A definite height (rather than max-height on an
           auto-sizing grid item, which fought with the grid's own track
           sizing across renders) so the flex column below has something
           concrete to size its scrollable child against. */
        .theme-gallery-row .gallery-card {
          display: flex; flex-direction: column; min-height: 0; overflow: hidden;
        }
        .draft-theme-list {
          flex: 1 1 auto; overflow-y: auto; min-height: 0; padding-right: 4px;
        }

        .published-theme-card {
          border-radius: 16px; border: 1px solid #E9E9E9; background: #F9FAFB;
        }
        /* overflow:hidden lives here (not on .published-theme-card) so it
           only crops the preview image — the footer below, which hosts the
           More menu's popover, keeps a non-clipping stacking context. */
        .published-theme-card__preview {
          position: relative; width: 100%; height: 400px; overflow: hidden; background: #F3F4F6;
          border-radius: 16px 16px 0 0;
        }
        .published-theme-card__footer {
          display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: #FFFFFF; border-top: 1px solid #E9E9E9;
          border-radius: 0 0 16px 16px;
        }

        .draft-theme-row {
          display: flex; align-items: center; gap: 16px; padding: 14px 16px; border: 1px solid #E9E9E9; border-radius: 12px; background: #FFFFFF;
        }
        .draft-theme-row + .draft-theme-row { margin-top: 12px; }
        /* aspect-ratio matches previewData's own aspect-[16/10] canvas, so
           the thumb keeps its height even with no normal-flow content
           inside it — the installing spinner is absolutely positioned and
           so, unlike previewData, contributes nothing to the parent's
           height on its own; without this the thumb collapsed to 0 height
           while installing, making the spinner invisible. */
        .draft-theme-row__thumb { position: relative; width: 120px; aspect-ratio: 16 / 10; flex-shrink: 0; border-radius: 8px; overflow: hidden; background: #F3F4F6; }
        /* Shopify-style "Installing theme" placeholder spinner — replaces
           the preview render entirely while a discover-theme add is in
           flight (see handleDiscoverAdd's placeholder record). Centered via
           absolute positioning (not flex) so it doesn't change how the
           thumb lays out its normal preview-render child. */
        .theme-install-spinner {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 22px; height: 22px; border-radius: 50%;
          border: 2px solid #E5E7EB; border-top-color: #6B7280;
          animation: theme-install-spin 0.7s linear infinite;
        }
        @keyframes theme-install-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }

        .discover-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 32px;
        }
        /* Ported from ecom-from-bella's WebsiteTemplates.jsx theme-card
           design (.template-card/.template-card-container) - rounded-2xl,
           lifts + blue border/shadow on hover. Unlike the reference (whose
           Edit action lives in the hover overlay), Add stays inline next to
           the name below the card, matching this app's previous layout, so
           it doesn't require a hover to find. Coming-soon stubs opt out of
           the hover lift/border entirely (nothing to click into) via the
           discover-card--static modifier. */
        .discover-card-container { display: flex; flex-direction: column; gap: 16px; }
        .discover-card {
          position: relative;
          border-radius: 16px; overflow: hidden;
          border: 1px solid #F3F4F6; background: #F9FAFB;
          cursor: pointer; transition: all 0.3s ease;
        }
        .discover-card:hover {
          transform: translateY(-4px);
          border-color: #006BFF;
          box-shadow: 0 12px 24px rgba(0, 107, 255, 0.12);
        }
        .discover-card--static { cursor: default; }
        .discover-card--static:hover { transform: none; border-color: #F3F4F6; box-shadow: none; }
        .discover-card__preview {
          /* No aspect-ratio of its own — its content (a static preview img,
             FillWidthPreviewCanvas, or PreviewPlaceholder — see
             discoverPreviewElement) declares its own aspect-[4/3] via a
             class/prop, same convention published/draft previews already
             use, so there's exactly one source of truth for the ratio
             instead of two competing declarations. */
          position: relative; background: #F3F4F6;
        }
        /* Ported from ecom-from-bella's .template-img. */
        .discover-card__preview-img { width: 100%; object-fit: cover; object-position: top center; display: block; }
        .discover-card__footer {
          display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 0 4px;
        }
        .discover-card__name {
          margin: 0; font-size: 16px; font-weight: 700; color: #111827;
        }
        .discover-card__placeholder {
          position: relative;
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #EEF2FF 0%, #F5F0FF 100%); color: #4338CA; font-size: 16px; font-weight: 700;
        }
        .discover-card__placeholder--coming-soon {
          background: linear-gradient(135deg, #F3F4F6 0%, #EAEBEE 100%); color: #9CA3AF;
        }
        .discover-card__coming-soon-overlay {
          position: absolute; inset: 0; z-index: 5; background: rgba(0, 0, 0, 0.4);
        }

        /* Overrides ce-ui IconBtn's built-in "danger" variant (synced,
           un-editable — see ce-ui/SYNC_MANIFEST.json), whose hover state
           flips to a fully solid red fill. The rename Cancel button should
           behave like the (blue) primary Save button's hover instead — a
           small in-place shade shift, never a full fill/outline swap —
           just applied to an outline button rather than a filled one.
           !important beats the synced component's own Tailwind hover
           utility regardless of stylesheet injection order. */
        .rename-cancel-btn {
          background: #FFFFFF !important;
          color: #DC2626 !important;
          border: 1px solid #DC2626 !important;
        }
        .rename-cancel-btn:hover:enabled {
          background: #FEF2F2 !important;
          color: #B91C1C !important;
          border-color: #B91C1C !important;
        }
      `}</style>

      <div style={{ padding: '24px' }}>
        <h1 style={{ margin: '0 0 20px', fontSize: '26px', fontWeight: 700, color: '#282828' }}>
          {t('sectionBuilder:templates.gallery.heading')}
        </h1>

        <div className="theme-gallery-row">
          {simulateThemeLoadError ? (
            <>
              <ThemeSectionErrorCard />
              <ThemeSectionErrorCard />
            </>
          ) : (
            <>
              {/* Card 1 — published theme. Always rendered when a publishedTheme
                  record exists, regardless of whether it maps to a real
                  SITE_TEMPLATES entry (publishedPreviewElement always resolves to
                  something renderable — a live preview or an illustrative
                  placeholder). */}
              {publishedTheme && (
                <div ref={publishedCardRef}>
                  <PublishedThemeCard
                    theme={publishedTheme}
                    domain={STORE_DOMAIN}
                    previewData={(
                      // Keyed by id+publishedAt so a new publish (see
                      // handlePublishConfirm) remounts StaticSnapshot fresh
                      // instead of reusing the old instance — StaticSnapshot
                      // freezes its children into static HTML exactly once
                      // on mount and never re-captures on a prop change, so
                      // without this the card would keep showing whatever
                      // was frozen before the previous theme was replaced.
                      <StaticSnapshot key={`${publishedTheme.id}-${publishedTheme.publishedAt}`}>
                        {publishedPreviewElement}
                      </StaticSnapshot>
                    )}
                    isRenaming={renamingId === 'published'}
                    onEdit={handleOpen}
                    onPreview={handlePublishedPreview}
                    onRenameStart={() => setRenamingId('published')}
                    onRenameSubmit={handlePublishedRenameSubmit}
                    onRenameCancel={() => setRenamingId(null)}
                    onVisibilityChange={handleVisibilitySelect}
                  />
                </div>
              )}

              {/* Card 2 — draft themes */}
              <div className="gallery-card" style={draftCardMaxHeight ? { height: draftCardMaxHeight } : undefined}>
              <div className="draft-heading-row">
                <h2 className="section-heading">{t('sectionBuilder:onlineStore.themes.draftHeading', 'Draft Themes')}</h2>
                <span className={`draft-count${draftThemes.length >= MAX_DRAFT_THEMES ? ' draft-count--full' : ''}`}>{draftThemes.length}/{MAX_DRAFT_THEMES}</span>
              </div>
              {draftThemes.length === 0 ? (
                <div style={{
                  flex: '1 1 auto',
                  padding: '48px 24px',
                  textAlign: 'center',
                  color: '#9CA3AF',
                  fontSize: '15px',
                  background: '#FFFFFF',
                  border: '1.5px dashed #E5E7EB',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '120px',
                }}>
                  {t('sectionBuilder:onlineStore.themes.draftEmpty', 'No draft themes yet — add one from Discover themes below.')}
                </div>
              ) : (
                <div className="draft-theme-list">
                  {draftThemes.map((d) => (
                    <DraftThemeRow
                      key={d.id}
                      theme={d}
                      previewData={d.isInstalling ? null : draftPreviewElement(d)}
                      isInstalling={d.isInstalling}
                      installingLabel={d.installingLabel}
                      isDuplicating={duplicatingIds.has(d.id)}
                      isRenaming={renamingId === d.id}
                      isPublishing={false}
                      onPublish={() => handleDraftPublishClick(d)}
                      onEdit={() => handleDraftOpen(d)}
                      onPreview={() => handleDraftPreview(d)}
                      onRenameStart={() => handleDraftRenameStart(d)}
                      onRenameSubmit={(newName) => handleDraftRenameSubmit(d, newName)}
                      onRenameCancel={() => setRenamingId(null)}
                      onDuplicate={() => handleDraftDuplicate(d)}
                      onDelete={() => handleDraftDeleteClick(d)}
                    />
                  ))}
                </div>
              )}
              </div>
            </>
          )}
        </div>

        {/* Card 3 — discover themes */}
        <div className="gallery-card">
          <h2 className="section-heading">{t('sectionBuilder:onlineStore.themes.discoverHeading', 'Discover Themes')}</h2>
          {simulateCatalogLoadError ? (
            <CatalogSectionErrorCard />
          ) : (
          <div className="discover-grid">
            {discoverItems.map((item) => (
              <DiscoverCard
                key={item.id}
                item={item}
                comingSoon={item.comingSoon}
                previewData={discoverPreviewElement(item)}
                isAdding={addingDiscoverId === item.id}
                onAdd={handleDiscoverAdd}
                onPreview={handleDiscoverPreview}
              />
            ))}
          </div>
          )}
        </div>
      </div>

      <Popup
        open={Boolean(publishConfirmTheme)}
        onClose={() => setPublishConfirmTheme(null)}
        title={t('sectionBuilder:onlineStore.themes.publishConfirmTitle', 'Publish this theme?')}
        description={
          // Publishing swaps *which theme* is live, but never changes the
          // store's own visibility on its own — a store already set Private
          // (see PublishedVisibilityBadge) stays Private through a publish,
          // same as handlePublishConfirm below carries the current
          // publishedTheme.visibility forward onto the new record instead
          // of resetting it. The copy calls that out explicitly so this
          // doesn't read as silently reverting to Public.
          publishedTheme?.visibility === 'private'
            ? t(
                'sectionBuilder:onlineStore.themes.publishConfirmDescriptionPrivate',
                "This will replace '{{currentName}}' as your current theme. Your store will remain private.",
                { currentName: publishedTheme?.name }
              )
            : t(
                'sectionBuilder:onlineStore.themes.publishConfirmDescription',
                "Publishing '{{name}}' will replace your current published theme. Your current published theme will be moved to drafts.",
                { name: publishConfirmTheme?.name }
              )
        }
        platform="desktop"
        primaryAction={{ label: t('sectionBuilder:onlineStore.themes.publish', 'Publish'), onClick: handlePublishConfirm }}
        secondaryAction={{ label: t('sectionBuilder:editor.common.cancel'), onClick: () => setPublishConfirmTheme(null) }}
      />

      <ConfirmDialog
        open={Boolean(deleteConfirmTheme)}
        title={t('sectionBuilder:onlineStore.themes.deleteConfirmTitle', 'Delete this theme?')}
        description={t(
          'sectionBuilder:onlineStore.themes.deleteConfirmDescription',
          "'{{name}}' will be permanently removed from your draft themes.",
          { name: deleteConfirmTheme?.name }
        )}
        danger
        confirmLabel={t('sectionBuilder:onlineStore.themes.delete', 'Delete')}
        onConfirm={handleDraftDeleteConfirm}
        onCancel={() => setDeleteConfirmTheme(null)}
      />

      <ConfirmDialog
        open={Boolean(pendingVisibility)}
        title={
          pendingVisibility === 'private'
            ? t('sectionBuilder:onlineStore.themes.visibilityConfirmPrivateTitle', 'Make this theme Private?')
            : t('sectionBuilder:onlineStore.themes.visibilityConfirmPublicTitle', 'Make this theme Public?')
        }
        description={
          pendingVisibility === 'private'
            ? t(
                'sectionBuilder:onlineStore.themes.visibilityConfirmPrivateDescription',
                'Visitors won’t be able to view your storefront while it’s Private.'
              )
            : t(
                'sectionBuilder:onlineStore.themes.visibilityConfirmPublicDescription',
                'Your storefront will become visible to everyone.'
              )
        }
        confirmLabel={t('sectionBuilder:onlineStore.themes.visibilityConfirm', 'Confirm')}
        onConfirm={handleVisibilityConfirm}
        onCancel={() => setPendingVisibility(null)}
      />

      <SimulateTrigger options={simulateOptions} />
    </div>
  );
}
