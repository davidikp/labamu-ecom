import { useMemo, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loadDraft } from './state/storage';
import { mergeRequiredSystemPages, requiredSystemPages } from './state/defaultTheme';
import { matchStorefrontPage, parsePathQuery } from './state/pageRouting';
import Canvas from './ui/Canvas';
import ViewportToggle from './ui/ViewportToggle';
import { DEFAULT_BREAKPOINT } from './themes/breakpoints';
import ProductDetailPage from './ui/ProductDetailPage';
import EditorialCollectionDetailPage from './ui/EditorialCollectionDetailPage';
import { StorefrontCartProvider } from './sections/shared/storefrontCart';

/**
 * Chrome-free live preview (US-2.2) opened from the builder's "Preview"
 * button — "chrome-free" means no editor UI (sidebar/settings panel), not
 * literally no chrome at all: it keeps a slim top bar carrying the same
 * ViewportToggle/BREAKPOINTS the ThemePreview.jsx gallery preview and the
 * builder canvas itself use, so a merchant can check the draft at each
 * device size here too, not just desktop. Real implementation needs a
 * signed, server-issued token with a 24h expiry; there's no backend yet, so
 * this only checks a token is present in the URL (TODO: replace with real
 * token issuance/verification once a backend exists).
 */
export default function PreviewLive() {
  const { t } = useTranslation();
  const { storeId } = useParams();
  // `searchParams`/`setSearchParams` are react-router's real history-backed
  // state (this component already sits under App.jsx's <BrowserRouter>) —
  // using them for the "which storefront page is showing" state, instead of
  // a plain useState, is what makes direct /shop-equivalent URL entry,
  // reload, and browser back/forward actually work: each navigation pushes
  // a real history entry (`?path=/shop`), so the browser's own back/forward
  // buttons move between previously-viewed pages exactly like the real
  // storefront would, and a link can be copied/reloaded and still land on
  // the same page. Previously `currentPageId`/`productHandle` were plain
  // React state with no router/history participation at all.
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get('token');
  const path = searchParams.get('path');
  const [viewport, setViewport] = useState(DEFAULT_BREAKPOINT);

  // `loadDraft` returns the raw persisted record, which — for any draft
  // saved before a required system page (e.g. Shop) existed — won't
  // contain that page at all. The interactive builder never has this
  // problem because useSectionBuilder.js merges required system pages in
  // right after loading; this preview must do the same or its Header/
  // Footer nav links can point at pages that simply aren't in `draft.pages`,
  // silently no-oping every click (matchStorefrontPage finds no match).
  const draft = useMemo(() => {
    const loaded = loadDraft(storeId);
    if (!loaded) return loaded;
    return { ...loaded, pages: mergeRequiredSystemPages(loaded.pages, requiredSystemPages()) };
  }, [storeId]);

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

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-gray-500">
        {t('sectionBuilder:editor.previewLive.invalidLink')}
      </div>
    );
  }

  // No `?path=` yet (first load from the builder's "Preview" button) falls
  // back to whichever page was active in the builder — same starting page
  // as before this fix. Any `path` present (typed/reloaded/navigated-to)
  // is resolved through the exact same parameterized matcher `onNavigate`
  // uses, so a direct link to `?path=/shop` (or `?path=/products/:handle`)
  // resolves identically to clicking there.
  const match = path ? matchStorefrontPage(draft?.pages, path) : null;
  const initialCategory = path ? parsePathQuery(path).get('category') : null;
  const activePage = match?.page ?? draft?.pages?.find((p) => p.id === draft?.activePageId) ?? draft?.pages?.[0];
  const sections = activePage?.sections ?? [];
  const isProductPage = match?.page?.systemType === 'product';
  const productHandle = isProductPage ? match.params?.handle ?? null : null;
  const isEditorialCollectionDetailPage = match?.page?.systemType === 'editorial_collection_detail';
  const editorialCollectionSlug = isEditorialCollectionDetailPage ? match.params?.slug ?? null : null;
  // A catalog Collection Detail page's own `/collections/:handle` route
  // param — see `Canvas`'s `collectionHandle` prop / `featured_products`'
  // own Renderer doc comment for why this exists.
  const collectionHandle = match?.page?.systemType === 'collection' ? match.params?.handle ?? null : null;

  const handleNavigate = (url) => {
    // Parameterized match (e.g. '/products/dewalt-level-kit' -> the Product
    // Detail system page) rather than an exact-slug lookup — see
    // state/pageRouting.js. Route existence is decoupled from product
    // existence: this only needs the page ROUTE to resolve, not the handle
    // to be a real product (future phase's concern).
    const targetMatch = matchStorefrontPage(draft?.pages, url);
    if (!targetMatch) return;
    navigateToPath(url);
  };

  const handleBackToShop = () => {
    const shopPage = draft?.pages?.find((p) => p.systemType === 'shop');
    if (shopPage) navigateToPath(shopPage.slug);
  };

  const handleBackToCollectionList = () => {
    const collectionListPage = draft?.pages?.find((p) => p.systemType === 'editorial_collection_list');
    if (collectionListPage) navigateToPath(collectionListPage.slug);
  };

  return (
    <StorefrontCartProvider>
      <div className="flex h-screen flex-col">
        <div className="flex shrink-0 items-center justify-end border-b border-gray-200 bg-white px-4 py-2">
          <ViewportToggle viewport={viewport} onChange={setViewport} />
        </div>
        <div className="flex-1 overflow-auto">
          {productHandle !== null ? (
            <ProductDetailPage
              theme={draft?.theme}
              header={draft?.header}
              footer={draft?.footer}
              mediaLibrary={draft?.mediaLibrary ?? []}
              menus={draft?.menus}
              page={activePage}
              handle={productHandle}
              isMobile={viewport === 'mobile'}
              breakpoint={viewport}
              onNavigate={handleNavigate}
              onBackToShop={handleBackToShop}
            />
          ) : editorialCollectionSlug !== null ? (
            <EditorialCollectionDetailPage
              theme={draft?.theme}
              header={draft?.header}
              footer={draft?.footer}
              mediaLibrary={draft?.mediaLibrary ?? []}
              menus={draft?.menus}
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
              header={draft?.header ?? { type: 'header', hidden: true }}
              footer={draft?.footer ?? { type: 'footer', hidden: true }}
              sections={sections}
              selectedId={null}
              onSelect={() => {}}
              onDeselect={() => {}}
              onMoveSection={() => {}}
              onDuplicateSection={() => {}}
              onDeleteSection={() => {}}
              theme={draft?.theme}
              mediaLibrary={draft?.mediaLibrary ?? []}
              menus={draft?.menus}
              onNavigate={handleNavigate}
              currentPath={activePage?.slug}
              initialCategory={initialCategory}
              collectionHandle={collectionHandle}
              readOnly
            />
          )}
        </div>
      </div>
    </StorefrontCartProvider>
  );
}
