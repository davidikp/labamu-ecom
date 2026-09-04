import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import Canvas from '../section-builder/ui/Canvas';
import { loadDraft, loadPendingPreview } from '../section-builder/state/storage';
import { createFreshState } from '../section-builder/state/useSectionBuilder';

// TODO: replace with the real active store id once multi-store routing
// exists — matches the hardcoded id used across online-store/*.
const STORE_ID = 'demo';

/**
 * Full-page, read-only preview for a single custom Page (Online Store >
 * Pages > Page Editor > Preview) — renders the merchant's REAL current site
 * chrome (header/footer/theme/media from the live draft, not an illustrative
 * template like ThemePreview.jsx) with this page's rich-text `content`
 * rendered as the body, in place of drag-and-drop `sections`.
 */
export default function PagePreview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pageId } = useParams();

  // Falls back to the same default draft (default theme + system pages like
  // "home") PagesManagement.jsx/PageEditor.jsx use when nothing's been saved
  // to localStorage yet — otherwise a fresh browser/deploy with no draft
  // ever persisted would 404 on every page, including the system ones.
  const draft = useMemo(() => loadDraft(STORE_ID) ?? createFreshState(STORE_ID), []);
  // PageEditor.jsx's Preview button hands off the CURRENT, possibly-unsaved
  // form state here (see storage.js's savePendingPreview) so Preview
  // reflects what's on screen right now instead of only what's already been
  // saved to the draft. One-shot: only used when it's for THIS page id
  // (guards against a stale/unrelated handoff from a previous preview), and
  // consumed via loadPendingPreview so a plain reload of this tab falls back
  // to the real persisted draft rather than replaying it forever.
  const pendingPreview = useMemo(() => {
    const pending = loadPendingPreview(STORE_ID);
    return pending && pending.id === pageId ? pending : null;
  }, [pageId]);
  const page = useMemo(
    () => pendingPreview ?? draft?.pages?.find((p) => p.id === pageId) ?? null,
    [pendingPreview, draft, pageId]
  );

  const handleBack = () => navigate(`/online-store/pages/${pageId}`);

  if (!draft || !page) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-sm text-gray-500">
        {t('sectionBuilder:onlineStore.pageEditor.previewNotFound', 'Page not found')}
        <button type="button" onClick={() => navigate('/online-store/pages')} className="text-[#006BFF] hover:underline">
          {t('sectionBuilder:onlineStore.pages.heading', 'Pages')}
        </button>
      </div>
    );
  }

  // Canvas is a monolithic header+sections+footer renderer with no slot for
  // injecting arbitrary body content between its header and footer, and no
  // prop to omit one of them outright. Rendering it twice — once showing
  // only the real header (footer forced `hidden`) and once showing only the
  // real footer (header forced `hidden`) — with this page's rich-text
  // `content` sandwiched between reuses the same real chrome (GlobalBlock's
  // `readOnly` branch renders nothing for a `hidden` global block) in the
  // correct header → content → footer order, rather than falling back to a
  // single Canvas call whose body would render below the footer.
  const headerOnlyFooter = { ...draft.footer, hidden: true };
  const footerOnlyHeader = { ...draft.header, hidden: true };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#006BFF]"
        >
          <ArrowLeft size={16} />
          {t('sectionBuilder:onlineStore.pageEditor.editPageTitle', 'Edit Page')}
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-500">{page.name}</span>
      </div>

      <Canvas
        viewport="desktop"
        header={draft.header}
        footer={headerOnlyFooter}
        sections={[]}
        theme={draft.theme}
        mediaLibrary={draft.mediaLibrary ?? []}
        selectedId={null}
        readOnly
      />
      <div
        className="mx-auto bg-white"
        style={{
          width: 1280,
          maxWidth: '100%',
          marginTop: '-24px',
          marginBottom: '-24px',
          fontFamily: draft.theme?.typography?.body_font || undefined,
        }}
      >
        <div className="px-8 py-10">
          <h1 className="mb-6 text-4xl font-bold" style={{ fontFamily: draft.theme?.typography?.heading_font || undefined }}>
            {page.name}
          </h1>
          {/* Rich-text HTML authored by the merchant in RichTextEditor.jsx — same trust boundary/pattern used there. */}
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
        </div>
      </div>
      <Canvas
        viewport="desktop"
        header={footerOnlyHeader}
        footer={draft.footer}
        sections={[]}
        theme={draft.theme}
        mediaLibrary={draft.mediaLibrary ?? []}
        selectedId={null}
        readOnly
      />
    </div>
  );
}
