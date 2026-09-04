import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Canvas from '../section-builder/ui/Canvas';
import ConfirmDialog from '../section-builder/ui/ConfirmDialog';
import { Popup } from '../../ce-ui';
import { SITE_TEMPLATES, defaultPreviewDataFor, siteTemplateById } from '../section-builder/state/siteTemplates';
import {
  loadDraft, saveDraft,
  loadPublishedTheme, savePublishedTheme, loadDraftThemes, saveDraftThemes,
} from '../section-builder/state/storage';
import { applySiteTemplate } from '../section-builder/state/siteTemplateApply';
import { inferActiveTemplateId, isDefaultTheme } from '../section-builder/state/inferActiveTemplate';
import { THEME_ROSTER } from '../section-builder/themes/themeRoster';
import { getUniqueName } from '../section-builder/state/nameUtils';
import { PublishedThemeCard, DraftThemeRow, DiscoverCard } from './ThemeGalleryCards';

// TODO: replace with the real active store id once multi-store routing
// exists — matches the hardcoded id used by Layout.jsx's builder entry.
const STORE_ID = 'demo';

// No store-domain field exists anywhere in this codebase yet (grepped for
// myshopify/storeDomain) — hardcode a plausible one matching STORE_ID.
const STORE_DOMAIN = `${STORE_ID}.myshopify.com`;

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
function FillWidthPreviewCanvas({ header, footer, sections, theme, mediaLibrary, aspectRatio }) {
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
        <Canvas viewport="desktop" header={header} footer={footer} sections={sections} theme={theme} mediaLibrary={mediaLibrary ?? []} selectedId={null} readOnly />
      </div>
    </div>
  );
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
      return applySiteTemplate(STORE_ID, SITE_TEMPLATES[0]);
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
    if (existing) return existing;
    // Seed from whatever's currently active in the live draft so the big
    // card always has something real to show on first visit.
    const activeTemplate = SITE_TEMPLATES.find((tpl) => tpl.id === activeTemplateId) ?? SITE_TEMPLATES[0];
    const seeded = {
      id: `published-${Date.now()}`,
      templateId: activeTemplate.id,
      name: activeTemplate.name,
      previewImageUrl: null,
      publishedAt: Date.now(),
      lastSavedAt: Date.now(),
    };
    savePublishedTheme(STORE_ID, seeded);
    return seeded;
  });
  const [draftThemes, setDraftThemes] = useState(() => loadDraftThemes(STORE_ID));
  // Fixed, stable order — the roster is now a real, finite catalog (Xinear +
  // 7 "coming soon" stubs), not a random "suggested" sample, so show all of
  // it rather than sampling a subset.
  const discoverItems = THEME_ROSTER;

  const [renamingId, setRenamingId] = useState(null); // 'published' | draft theme id
  const [publishConfirmTheme, setPublishConfirmTheme] = useState(null); // draft theme pending publish
  const [deleteConfirmTheme, setDeleteConfirmTheme] = useState(null); // draft theme pending delete
  const [addingDiscoverId, setAddingDiscoverId] = useState(null);

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
  }, [publishedTheme?.templateId, publishedTheme?.name, activeTemplateId, draft]);

  function draftPreviewElement(draftThemeRecord) {
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
    navigate(`/section-builder/${STORE_ID}`);
  }

  function handleSeePreview(template) {
    navigate(`/online-store/theme/${template.id}/preview`);
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

  // -- Draft theme row actions --------------------------------------------

  function handleDraftPreview(draftThemeRecord) {
    const template = SITE_TEMPLATES.find((tpl) => tpl.id === draftThemeRecord.templateId);
    if (template) {
      handleSeePreview(template);
      return;
    }
    console.log('Preview (illustrative only, no real template):', draftThemeRecord.name);
  }

  function handleDraftRenameSubmit(draftThemeRecord, newName) {
    const uniqueName = getUniqueName(
      draftThemes.filter((d) => d.id !== draftThemeRecord.id).map((d) => d.name),
      newName
    );
    const nextList = draftThemes.map((d) => (d.id === draftThemeRecord.id ? { ...d, name: uniqueName } : d));
    setDraftThemes(nextList);
    saveDraftThemes(STORE_ID, nextList);
    setRenamingId(null);
  }

  function handleDraftDuplicate(draftThemeRecord) {
    const uniqueName = getUniqueName(draftThemes.map((d) => d.name), draftThemeRecord.name);
    const copy = { ...draftThemeRecord, id: `draft-${Date.now()}`, name: uniqueName, addedAt: Date.now(), lastSavedAt: Date.now() };
    const nextList = [...draftThemes, copy];
    setDraftThemes(nextList);
    saveDraftThemes(STORE_ID, nextList);
  }

  function handleDraftDeleteConfirm() {
    const nextList = draftThemes.filter((d) => d.id !== deleteConfirmTheme.id);
    setDraftThemes(nextList);
    saveDraftThemes(STORE_ID, nextList);
    setDeleteConfirmTheme(null);
  }

  function handlePublishConfirm() {
    const promoted = publishConfirmTheme;
    if (!promoted) return;

    // Demote the currently published record into the draft list, deduping
    // its name against the existing draft names.
    const remainingDrafts = draftThemes.filter((d) => d.id !== promoted.id);
    const demotedName = getUniqueName(remainingDrafts.map((d) => d.name), publishedTheme.name);
    const demoted = { ...publishedTheme, id: publishedTheme.id ?? `draft-${Date.now()}`, name: demotedName, addedAt: Date.now() };

    const nextDraftThemes = [...remainingDrafts, demoted];
    const nextPublished = { ...promoted, publishedAt: Date.now(), lastSavedAt: Date.now() };

    setDraftThemes(nextDraftThemes);
    saveDraftThemes(STORE_ID, nextDraftThemes);
    setPublishedTheme(nextPublished);
    savePublishedTheme(STORE_ID, nextPublished);
    setPublishConfirmTheme(null);
  }

  // -- Discover section actions --------------------------------------------

  function handleDiscoverAdd(item) {
    // Defensive guard — the Add button is disabled for coming-soon stubs, so
    // this should be unreachable, but never apply a stub theme regardless.
    if (item.comingSoon) return;

    setAddingDiscoverId(item.id);
    setTimeout(() => {
      // Xinear is a real SITE_TEMPLATES entry now — apply it the same way
      // the auto-seed-on-first-visit path does, which actually reseeds
      // theme/pages/header/footer/media (mode: 'seed' — the "start fresh
      // with this theme" contract), rather than the skin-only
      // storefrontThemeId write used for roster items with no real
      // template content behind them.
      const xinearTemplate = item.id === 'xinear' ? siteTemplateById('xinear') : null;
      if (xinearTemplate) {
        applySiteTemplate(STORE_ID, xinearTemplate, 'seed');
      } else {
        // Skin-only fallback for roster items that are still just a
        // themes/registry.js color-token definition (no SITE_TEMPLATES
        // entry backing them yet): write storefrontThemeId/
        // storefrontThemeMode onto the live draft so Canvas.jsx's effect
        // (see ui/Canvas.jsx) skins the storefront preview/renderer with
        // this theme, without touching page/section content.
        const liveDraft = loadDraft(STORE_ID);
        if (liveDraft) {
          const nextDraft = {
            ...liveDraft,
            theme: {
              ...liveDraft.theme,
              storefrontThemeId: item.id,
              storefrontThemeMode: liveDraft.theme?.storefrontThemeMode || 'light',
            },
          };
          saveDraft(STORE_ID, nextDraft);
        }
      }

      // Bookkeeping record for the "Draft themes" list UX — unchanged from
      // before other than keying off `item.id` (roster entries have no
      // `templateId`/`previewImageUrl` fields).
      const newDraft = {
        id: `draft-${Date.now()}`,
        templateId: item.id,
        name: getUniqueName(draftThemes.map((d) => d.name), item.name),
        previewImageUrl: null,
        addedAt: Date.now(),
        lastSavedAt: Date.now(),
      };
      const nextList = [...draftThemes, newDraft];
      setDraftThemes(nextList);
      saveDraftThemes(STORE_ID, nextList);
      setAddingDiscoverId(null);
    }, 800);
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

        .published-theme-card {
          border-radius: 16px; border: 1px solid #E9E9E9; background: #F9FAFB;
          margin-bottom: 24px;
        }
        /* overflow:hidden lives here (not on .published-theme-card) so it
           only crops the preview image — the footer below, which hosts the
           More menu's popover, keeps a non-clipping stacking context. */
        .published-theme-card__preview {
          position: relative; width: 100%; height: 400px; overflow: hidden; background: #F3F4F6;
          border-radius: 16px 16px 0 0;
        }
        .published-badge {
          position: absolute; top: 16px; right: 16px; z-index: 5;
          padding: 6px 14px; border-radius: 100px; font-size: 10px; font-weight: 700;
          background: #006BFF; color: #FFFFFF; letter-spacing: 0.02em;
        }
        .published-theme-card__footer {
          display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: #FFFFFF; border-top: 1px solid #E9E9E9;
          border-radius: 0 0 16px 16px;
        }

        .draft-theme-row {
          display: flex; align-items: center; gap: 16px; padding: 14px 16px; border: 1px solid #E9E9E9; border-radius: 12px; background: #FFFFFF;
        }
        .draft-theme-row + .draft-theme-row { margin-top: 12px; }
        .draft-theme-row__thumb { position: relative; width: 120px; flex-shrink: 0; border-radius: 8px; overflow: hidden; background: #F3F4F6; }

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
        .discover-card__coming-soon-badge {
          position: absolute; top: 16px; right: 16px; z-index: 5;
          padding: 6px 14px; border-radius: 100px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
          background: #E5E7EB; color: #6B7280;
        }

        .more-menu-popover {
          position: absolute; top: calc(100% + 6px); right: 0; z-index: 20; min-width: 160px;
          background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          display: flex; flex-direction: column; padding: 6px; gap: 2px;
        }
        .more-menu-item {
          text-align: left; background: none; border: none; padding: 8px 10px; border-radius: 6px;
          font-size: 13px; font-weight: 600; color: #282828; cursor: pointer;
        }
        .more-menu-item:hover { background: #F3F4F6; }
        .more-menu-item:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div style={{ padding: '24px' }}>
        <h1 style={{ margin: '0 0 20px', fontSize: '26px', fontWeight: 700, color: '#282828' }}>
          {t('sectionBuilder:templates.gallery.heading')}
        </h1>

        {/* Card 1 — published theme. Always rendered when a publishedTheme
            record exists, regardless of whether it maps to a real
            SITE_TEMPLATES entry (publishedPreviewElement always resolves to
            something renderable — a live preview or an illustrative
            placeholder). */}
        {publishedTheme && (
          <PublishedThemeCard
            theme={publishedTheme}
            domain={STORE_DOMAIN}
            previewData={publishedPreviewElement}
            isRenaming={renamingId === 'published'}
            onEdit={handleOpen}
            onPreview={handlePublishedPreview}
            onRenameStart={() => setRenamingId('published')}
            onRenameSubmit={handlePublishedRenameSubmit}
            onRenameCancel={() => setRenamingId(null)}
          />
        )}

        {/* Card 2 — draft themes */}
        <div className="gallery-card">
          <h2 className="section-heading">{t('sectionBuilder:onlineStore.themes.draftHeading', 'Draft themes')}</h2>
          {draftThemes.length === 0 ? (
            <div style={{
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
            <div>
              {draftThemes.map((d) => (
                <DraftThemeRow
                  key={d.id}
                  theme={d}
                  previewData={draftPreviewElement(d)}
                  isRenaming={renamingId === d.id}
                  isPublishing={false}
                  onPublish={() => setPublishConfirmTheme(d)}
                  onEdit={handleOpen}
                  onPreview={() => handleDraftPreview(d)}
                  onRenameStart={() => setRenamingId(d.id)}
                  onRenameSubmit={(newName) => handleDraftRenameSubmit(d, newName)}
                  onRenameCancel={() => setRenamingId(null)}
                  onDuplicate={() => handleDraftDuplicate(d)}
                  onDelete={() => setDeleteConfirmTheme(d)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Card 3 — discover themes */}
        <div className="gallery-card">
          <h2 className="section-heading">{t('sectionBuilder:onlineStore.themes.discoverHeading', 'Discover themes')}</h2>
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
        </div>
      </div>

      <Popup
        open={Boolean(publishConfirmTheme)}
        onClose={() => setPublishConfirmTheme(null)}
        title={t('sectionBuilder:onlineStore.themes.publishConfirmTitle', 'Publish this theme?')}
        description={t(
          'sectionBuilder:onlineStore.themes.publishConfirmDescription',
          "Publishing '{{name}}' will replace your current published theme. Your current published theme will be moved to drafts.",
          { name: publishConfirmTheme?.name }
        )}
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
    </div>
  );
}
