import HeaderRenderer from '../sections/header/Renderer';
import FooterRenderer from '../sections/footer/Renderer';
import ProductDetailRenderer from '../sections/product_detail/Renderer';
import { resolveStorefrontProductByHandle } from '../sections/shared/productSource';
import PageFrame from './PageFrame';
import SectionShell from './SectionShell';

/**
 * @module section-builder/ui/ProductDetailPage
 * @description Shared "real PDP" page shell used by BOTH PreviewLive.jsx
 * and ThemePreview.jsx — replaces Phase 2's temporary `ProductPlaceholder`
 * in both places (they must never diverge on which product route renders
 * what). Resolves the routed `:handle` to a real product via
 * `resolveStorefrontProductByHandle` and renders the header, the real
 * functional `product_detail` section (or a trivial Not Found state for an
 * unknown handle), and the footer — the same global chrome any other
 * storefront page gets, just without going through Canvas's generic
 * section-list renderer (the Product system page always has exactly one
 * fixed core section, see PRODUCT_CORE_SECTION_ID).
 *
 * Renders inside the exact same `PageFrame` (device-width simulation +
 * `--theme-*` custom property layer) Canvas.jsx uses for Home/Shop, and
 * wraps header/product_detail/footer in the same `SectionShell` chrome
 * (color scheme, padding) Canvas's `RenderedEntity` applies to every other
 * section — so this page never diverges visually from how the identical
 * header/footer data renders on Home/Shop in the same preview route.
 */
export default function ProductDetailPage({ theme, header, footer, mediaLibrary, page, handle, isMobile, breakpoint, onNavigate, onBackToShop, menus }) {
  const product = resolveStorefrontProductByHandle(theme, handle, mediaLibrary);
  const sectionData = page?.sections?.find((s) => s.type === 'product_detail')?.data ?? {};

  return (
    <PageFrame viewport={breakpoint} theme={theme}>
      {header && !header.hidden && (
        <SectionShell data={header.data ?? {}} theme={theme} breakpoint={breakpoint}>
          <HeaderRenderer data={header.data ?? {}} theme={theme} mediaLibrary={mediaLibrary} isMobile={isMobile} onNavigate={onNavigate} currentPath={page?.slug} menus={menus} />
        </SectionShell>
      )}
      <div className="py-8">
        {product ? (
          <SectionShell data={sectionData} theme={theme} breakpoint={breakpoint}>
            <ProductDetailRenderer
              data={sectionData}
              theme={theme}
              product={product}
              mediaLibrary={mediaLibrary}
              isMobile={isMobile}
              breakpoint={breakpoint}
              onNavigate={onNavigate}
            />
          </SectionShell>
        ) : (
          <div className="flex flex-col items-center gap-3 p-16 text-center">
            <h1 className="text-xl font-semibold">Product Not Found</h1>
            <p className="text-sm text-gray-500">We couldn&apos;t find a product at &ldquo;{handle}&rdquo;.</p>
            <button type="button" onClick={onBackToShop} className="mt-2 text-sm font-medium text-blue-600 underline">
              Back to shop
            </button>
          </div>
        )}
      </div>
      {footer && !footer.hidden && (
        <SectionShell data={footer.data ?? {}} theme={theme} breakpoint={breakpoint}>
          <FooterRenderer data={footer.data ?? {}} theme={theme} mediaLibrary={mediaLibrary} isMobile={isMobile} onNavigate={onNavigate} currentPath={page?.slug} />
        </SectionShell>
      )}
    </PageFrame>
  );
}
