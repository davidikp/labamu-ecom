import { useTranslation } from 'react-i18next';
import HeaderRenderer from '../sections/header/Renderer';
import FooterRenderer from '../sections/footer/Renderer';
import EditorialCollectionDetailRenderer from '../sections/editorial_collection_detail/Renderer';
import { resolveEditorialCollectionBySlug } from '../sections/shared/editorialCollections';
import PageFrame from './PageFrame';
import SectionShell from './SectionShell';

/**
 * @module section-builder/ui/EditorialCollectionDetailPage
 * @description Shared "Collection story" page shell used by BOTH
 * PreviewLive.jsx and ThemePreview.jsx — mirrors ProductDetailPage.jsx's
 * architecture exactly (Product Detail is this feature's canonical
 * reference, per the approved plan): resolves the routed `:slug` to a real
 * collection via `resolveEditorialCollectionBySlug`, and renders the header,
 * the single fixed `editorial_collection_detail` section (or a Not Found
 * state for an unknown slug), and the footer — the same global chrome any
 * other storefront page gets, just without going through Canvas's generic
 * section-list renderer (the Editorial Collection Detail system page always
 * has exactly one fixed core section, see
 * EDITORIAL_COLLECTION_DETAIL_CORE_SECTION_ID).
 */
export default function EditorialCollectionDetailPage({ theme, header, footer, mediaLibrary, page, slug, isMobile, breakpoint, onNavigate, onBackToCollectionList, menus }) {
  const { t } = useTranslation();
  const collection = resolveEditorialCollectionBySlug(slug);
  const sectionData = page?.sections?.find((s) => s.type === 'editorial_collection_detail')?.data ?? {};

  return (
    <PageFrame viewport={breakpoint} theme={theme}>
      {header && !header.hidden && (
        <SectionShell data={header.data ?? {}} theme={theme} breakpoint={breakpoint}>
          <HeaderRenderer data={header.data ?? {}} theme={theme} mediaLibrary={mediaLibrary} isMobile={isMobile} onNavigate={onNavigate} currentPath={page?.slug} menus={menus} />
        </SectionShell>
      )}
      <div className="py-8">
        {collection ? (
          <SectionShell data={sectionData} theme={theme} breakpoint={breakpoint}>
            <EditorialCollectionDetailRenderer
              data={sectionData}
              theme={theme}
              collection={collection}
              mediaLibrary={mediaLibrary}
              isMobile={isMobile}
              breakpoint={breakpoint}
              onNavigate={onNavigate}
            />
          </SectionShell>
        ) : (
          <div className="flex flex-col items-center gap-3 p-16 text-center">
            <h1 className="text-xl font-semibold">{t('sectionBuilder:sections.editorialCollectionDetail.notFoundTitle', 'Collection Not Found')}</h1>
            <p className="text-sm text-gray-500">
              {t('sectionBuilder:sections.editorialCollectionDetail.notFoundBody', 'We couldn’t find a collection at "{{slug}}".', { slug })}
            </p>
            <button type="button" onClick={onBackToCollectionList} className="mt-2 text-sm font-medium text-blue-600 underline">
              {t('sectionBuilder:sections.editorialCollectionDetail.backToCollections', 'Back to collections')}
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
