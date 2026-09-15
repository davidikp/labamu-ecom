import { useEffect, useRef } from 'react';
import { applyThemeToElement } from '../themes/applyTheme';
import { BREAKPOINTS } from '../themes/breakpoints';

/**
 * @module section-builder/ui/PageFrame
 * @description Shared device-width simulation frame — the single place that
 * decides "what does the storefront look like at breakpoint X" regardless
 * of the real browser window's actual width. Originally inlined in
 * Canvas.jsx; extracted so ProductDetailPage.jsx (PreviewLive.jsx /
 * ThemePreview.jsx's real-PDP shell) renders header/product_detail/footer
 * inside the exact same simulated-width card Home/Shop get from Canvas,
 * instead of stretching to the real, unconstrained window width.
 *
 * Without this frame, `isMobile`/`breakpoint`-driven layout branches inside
 * a Renderer (e.g. `flex-col` at `breakpoint === 'mobile'`) still fire
 * correctly, but the surrounding page never actually narrows to a phone-
 * width viewport — content just stacks at full desktop width, which is why
 * "mobile preview" looked wrong on PDP even though the breakpoint value
 * itself was threaded through correctly. See product_detail/Renderer.jsx
 * and footer/Renderer.jsx's own comments about `isMobile` existing because
 * real CSS media queries can't be relied on inside this simulated frame.
 *
 * Also applies the `--theme-*` CSS custom property layer
 * (`themes/applyTheme.js`) to the frame root, same as Canvas — so any
 * section that reads those custom properties (opt-in storefront theme
 * layer) behaves identically whether it's rendered via Canvas or via this
 * frame.
 */
export default function PageFrame({ viewport, theme, onDeselect, children }) {
  const isMobile = viewport === 'mobile';
  const width = BREAKPOINTS[viewport]?.width ?? '100%';
  const pageFrameRef = useRef(null);

  useEffect(() => {
    if (!theme?.storefrontThemeId) return;
    try {
      applyThemeToElement(pageFrameRef.current, theme.storefrontThemeId, theme.storefrontThemeMode || 'light');
    } catch (err) {
      console.error('PageFrame: failed to apply storefront theme', {
        themeId: theme.storefrontThemeId,
        mode: theme.storefrontThemeMode,
        err,
      });
    }
  }, [theme?.storefrontThemeId, theme?.storefrontThemeMode]);

  return (
    <div className="min-w-[480px] flex-1 overflow-auto bg-gray-50 p-6" onClick={onDeselect}>
      <div
        ref={pageFrameRef}
        onClick={onDeselect ? (e) => e.stopPropagation() : undefined}
        className={'mx-auto bg-white ' + (isMobile ? 'rounded-2xl border border-gray-300 shadow-sm' : 'shadow-sm')}
        style={{ width, maxWidth: '100%' }}
      >
        {children}
      </div>
    </div>
  );
}
