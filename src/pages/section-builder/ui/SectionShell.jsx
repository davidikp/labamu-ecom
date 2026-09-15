import { resolveSectionScheme } from '../sections/shared/sectionChrome';
import { resolveResponsiveValue } from '../state/resolveResponsive';
import { resolveContainerWidth } from '../sections/shared/themedLayout';
import { DEFAULT_BREAKPOINT } from '../themes/breakpoints';
import { SectionChromeProvider } from './SectionChromeContext';

/**
 * Wraps every section Renderer's output (Canvas.jsx, SectionPickerModal.jsx)
 * to apply the shared chrome fields — color scheme, padding, full-width —
 * centrally, so individual Renderer.jsx files don't each reimplement it.
 *
 * `data.full_width` defaults to `true` (not the schema's own default of
 * `false`) when the key is altogether absent, so sections that haven't merged
 * SECTION_CHROME_FIELDS into their schema yet keep rendering edge-to-edge
 * exactly as before instead of suddenly gaining an unrequested max-width.
 *
 * `padding_top`/`padding_bottom` are `responsive: true` in sectionChrome.js
 * (Phase 1 of the Easyblocks-inspired responsive work) — their stored value
 * may be a plain number (legacy/un-overridden) or a `{ $res: true, ... }`
 * per-breakpoint object; resolveResponsiveValue collapses either to the
 * scalar for the current `breakpoint`. SectionPickerModal.jsx's preview has
 * no live breakpoint, so `breakpoint` defaults to desktop there.
 */
export default function SectionShell({ data = {}, theme, breakpoint = DEFAULT_BREAKPOINT, children }) {
  const scheme = resolveSectionScheme(data.color_scheme, theme?.colors);
  const paddingTop = resolveResponsiveValue(data.padding_top, breakpoint) ?? 0;
  const paddingBottom = resolveResponsiveValue(data.padding_bottom, breakpoint) ?? 0;
  const fullWidth = data.full_width ?? true;

  return (
    <div
      style={{
        backgroundColor: scheme.background,
        color: scheme.text,
        paddingTop: paddingTop || undefined,
        paddingBottom: paddingBottom || undefined,
      }}
    >
      <div
        className={fullWidth ? 'w-full' : 'mx-auto w-full'}
        style={fullWidth ? undefined : { maxWidth: resolveContainerWidth(theme?.layout) }}
      >
        <SectionChromeProvider value={scheme}>{children}</SectionChromeProvider>
      </div>
    </div>
  );
}
