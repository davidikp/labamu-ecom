import { useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import Canvas from '../section-builder/ui/Canvas';
import ViewportToggle from '../section-builder/ui/ViewportToggle';
import { DEFAULT_BREAKPOINT } from '../section-builder/themes/breakpoints';
import { siteTemplateById, defaultPreviewDataFor } from '../section-builder/state/siteTemplates';
import { mergeRequiredSystemPages, requiredSystemPages } from '../section-builder/state/defaultTheme';
import { matchStorefrontPage, parsePathQuery } from '../section-builder/state/pageRouting';
import ProductDetailPage from '../section-builder/ui/ProductDetailPage';
import EditorialCollectionDetailPage from '../section-builder/ui/EditorialCollectionDetailPage';
import { StorefrontCartProvider } from '../section-builder/sections/shared/storefrontCart';
import SimulateTrigger from './SimulateTrigger';

/**
 * Full-page "See Preview" for a theme card on the Theme gallery (Online
 * Store > Theme) — a chrome-free, read-only render of that theme's own
 * default pages, at real size (unlike the gallery card's scaled-down
 * canvas). Never a merchant's real content — see `defaultPreviewDataFor`.
 *
 * Navigation follows PreviewLive.jsx's exact pattern: required system pages
 * (Shop, Product) are merged into the template's own `pages` list — a
 * template like Houzez/Xinear only hand-authors a `home` page, but its
 * header/footer nav links point at `/shop` etc., so without this merge
 * `matchStorefrontPage` finds nothing and every such click silently no-ops.
 * The "current page" is real router-backed state via `useSearchParams`
 * (`?path=/shop`), not local `useState`, so direct entry/reload/back-forward
 * all work the same way they do in PreviewLive.
 *
 * Uses the same 5-way ViewportToggle/BREAKPOINTS the section-builder canvas
 * uses (mobile/tablet/desktop/large desktop/fit) so a merchant can check how
 * a theme looks at each size before committing to it, not just desktop.
 */
export default function ThemePreview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { templateId } = useParams();
  const [viewport, setViewport] = useState(DEFAULT_BREAKPOINT);
  const [searchParams, setSearchParams] = useSearchParams();
  const path = searchParams.get('path');
  // Present only when this preview was opened from a specific draft theme
  // row (see ThemeGallery.jsx's handleDraftPreview/handleSeePreview) — a
  // preview opened from the published-theme card or Discover has no
  // draftId, so the "deleted in another window" simulate option below has
  // nothing real to key off and stays inert for those.
  const draftId = searchParams.get('draftId');
  const [simulateDraftDeletedElsewhere, setSimulateDraftDeletedElsewhere] = useState(false);
  const [draftDeleted, setDraftDeleted] = useState(false);

  const template = useMemo(() => siteTemplateById(templateId), [templateId]);
  const previewData = useMemo(() => (template ? defaultPreviewDataFor(template) : null), [template]);
  // Template-authored pages (usually just `home`) plus whichever required
  // system pages (Shop, Product) it doesn't already define — same merge
  // useSectionBuilder.js/PreviewLive.jsx apply to a real draft.
  const pages = useMemo(
    () => (template ? mergeRequiredSystemPages(template.pages, requiredSystemPages()) : null),
    [template]
  );

  const navigateToPath = useCallback(
    (nextPath) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('path', nextPath);
        return next;
      });
    },
    [setSearchParams]
  );

  const simulateOptions = [
    {
      type: 'checkbox',
      label: t('sectionBuilder:onlineStore.themes.simulateDraftDeletedElsewherePreview', 'Simulate draft theme deleted in another window'),
      checked: simulateDraftDeletedElsewhere,
      onChange: setSimulateDraftDeletedElsewhere,
    },
  ];

  // Full-bleed takeover, same convention as ThemeGallery.jsx's own
  // simulated-failure screens — this represents the draft this preview was
  // opened for no longer existing at all, so nothing of the normal preview
  // chrome (toolbar, viewport toggle) makes sense to keep showing under it.
  if (draftDeleted) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-black text-center text-white">
        <p className="text-sm">
          {t(
            'sectionBuilder:onlineStore.themes.draftDeletedPreviewMessage',
            'This draft theme has been deleted and is no longer available to preview.'
          )}
        </p>
        <button
          type="button"
          onClick={() => navigate('/online-store/theme')}
          className="text-sm text-white underline hover:text-gray-300"
        >
          {t('sectionBuilder:templates.gallery.backToThemes')}
        </button>
      </div>
    );
  }

  if (!template || !previewData) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-sm text-gray-500">
        {t('sectionBuilder:templates.gallery.previewNotFound')}
        <button type="button" onClick={() => navigate('/online-store/theme')} className="text-[#006BFF] hover:underline">
          {t('sectionBuilder:templates.gallery.backToThemes')}
        </button>
      </div>
    );
  }

  const match = path ? matchStorefrontPage(pages, path) : null;
  const initialCategory = path ? parsePathQuery(path).get('category') : null;
  // `pages`' own `home` entry is the exact same object as
  // `template.pages[0]` (mergeRequiredSystemPages only appends missing
  // pages, never touches existing ones), so its `.sections` is identical to
  // `previewData.sections` — no separate lookup needed for the Home case.
  const activePage = match?.page ?? pages.find((p) => p.systemType === 'home') ?? pages[0];
  const sections = activePage?.sections ?? [];
  const productHandle = match?.page?.systemType === 'product' ? match.params?.handle ?? null : null;
  const editorialCollectionSlug = match?.page?.systemType === 'editorial_collection_detail' ? match.params?.slug ?? null : null;
  // A catalog Collection Detail page's own `/collections/:handle` route
  // param — see `Canvas`'s `collectionHandle` prop / `featured_products`'
  // own Renderer doc comment for why this exists (that page was previously
  // 100% generic: every collection's `:handle` rendered byte-identical,
  // unfiltered content).
  const collectionHandle = match?.page?.systemType === 'collection' ? match.params?.handle ?? null : null;

  const handleNavigate = (url) => {
    if (simulateDraftDeletedElsewhere && draftId) {
      setDraftDeleted(true);
      return;
    }
    const targetMatch = matchStorefrontPage(pages, url);
    if (!targetMatch) return;
    navigateToPath(url);
  };

  const handleBackToShop = () => {
    const shopPage = pages.find((p) => p.systemType === 'shop');
    if (shopPage) navigateToPath(shopPage.slug);
  };

  const handleBackToCollectionList = () => {
    const collectionListPage = pages.find((p) => p.systemType === 'editorial_collection_list');
    if (collectionListPage) navigateToPath(collectionListPage.slug);
  };

  return (
    <StorefrontCartProvider>
      {/* `h-screen flex-col` + the content wrapper's own `overflow-auto`
          below — not a single `min-h-screen` document scroll — so this
          toolbar and the storefront's own sticky header aren't sticky
          within the *same* scrolling context. Two `position: sticky; top: 0`
          elements sharing one scroll root both pin to the same y=0 row once
          scrolled past, so the (lower-z-index, after the earlier z-index
          fix) header would render fully hidden behind this toolbar instead
          of sitting below it. Giving the content area its own scroll
          container (same pattern PageFrame.jsx already uses for the
          section-builder editor) means the header's sticky top:0 sticks to
          the top of *that* box — which starts right under this toolbar —
          instead of competing with it for the viewport's actual top edge. */}
      <div className="flex h-screen flex-col">
        {/* z-[60]: page sections use z-10 through z-50 for their own
            internal layering (e.g. hero_banner's content-over-photo div) —
            those establish stacking contexts sibling to this toolbar's, so
            a tied z-index falls back to DOM order and a later section can
            paint over this "sticky" bar while scrolling past it. Needs to
            beat the highest z-index used anywhere in a section. */}
        <div className="z-[60] flex shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => navigate('/online-store/theme')}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#006BFF]"
          >
            <ArrowLeft size={16} />
            {t('sectionBuilder:templates.gallery.backToThemes')}
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-500">
            {t(`sectionBuilder:templates.${template.id}.label`, template.name)}
          </span>
          <div className="ml-auto">
            <ViewportToggle viewport={viewport} onChange={setViewport} />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
        {productHandle !== null ? (
          <ProductDetailPage
            theme={previewData.theme}
            header={previewData.header}
            footer={previewData.footer}
            mediaLibrary={previewData.mediaLibrary ?? []}
            menus={previewData.menus}
            page={activePage}
            handle={productHandle}
            isMobile={viewport === 'mobile'}
            breakpoint={viewport}
            onNavigate={handleNavigate}
            onBackToShop={handleBackToShop}
          />
        ) : editorialCollectionSlug !== null ? (
          <EditorialCollectionDetailPage
            theme={previewData.theme}
            header={previewData.header}
            footer={previewData.footer}
            mediaLibrary={previewData.mediaLibrary ?? []}
            menus={previewData.menus}
            page={activePage}
            slug={editorialCollectionSlug}
            isMobile={viewport === 'mobile'}
            breakpoint={viewport}
            onNavigate={handleNavigate}
            onBackToCollectionList={handleBackToCollectionList}
          />
        ) : (
          <Canvas
            viewport={viewport}
            header={previewData.header}
            footer={previewData.footer}
            sections={sections}
            theme={previewData.theme}
            mediaLibrary={previewData.mediaLibrary ?? []}
            menus={previewData.menus}
            selectedId={null}
            readOnly
            onNavigate={handleNavigate}
            currentPath={activePage?.slug ?? '/'}
            initialCategory={initialCategory}
            collectionHandle={collectionHandle}
          />
        )}
        </div>
      </div>
      <SimulateTrigger options={simulateOptions} />
    </StorefrontCartProvider>
  );
}
