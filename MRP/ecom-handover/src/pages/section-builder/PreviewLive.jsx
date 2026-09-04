import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loadDraft } from './state/storage';
import Canvas from './ui/Canvas';
import ViewportToggle from './ui/ViewportToggle';
import { DEFAULT_BREAKPOINT } from './themes/breakpoints';

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
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [viewport, setViewport] = useState(DEFAULT_BREAKPOINT);

  const draft = useMemo(() => loadDraft(storeId), [storeId]);
  // Starts on whatever page was active in the builder; clicking a header/
  // footer nav link (see onNavigate below) switches which page is shown,
  // matching the link's URL against each page's slug — this preview has no
  // real routing of its own, just this one in-memory "current page".
  const [currentPageId, setCurrentPageId] = useState(() => draft?.activePageId);

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-gray-500">
        {t('sectionBuilder:editor.previewLive.invalidLink')}
      </div>
    );
  }

  const activePage = draft?.pages?.find((p) => p.id === currentPageId) ?? draft?.pages?.[0];
  const sections = activePage?.sections ?? [];

  const handleNavigate = (url) => {
    const target = draft?.pages?.find((p) => p.slug === url);
    if (target) setCurrentPageId(target.id);
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="flex shrink-0 items-center justify-end border-b border-gray-200 bg-white px-4 py-2">
        <ViewportToggle viewport={viewport} onChange={setViewport} />
      </div>
      <div className="flex-1 overflow-auto">
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
          onNavigate={handleNavigate}
          currentPath={activePage?.slug}
          readOnly
        />
      </div>
    </div>
  );
}
