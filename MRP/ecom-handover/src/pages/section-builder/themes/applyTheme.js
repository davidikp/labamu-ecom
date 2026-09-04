import { colorSlots } from './tokenSchema';
import { getTheme } from './registry';

/**
 * @module section-builder/themes/applyTheme
 * @description Runtime mechanism for the storefront theme layer. This
 * `--theme-*` CSS custom property layer is intentionally separate from
 * `--lb-*` (vendored ce-ui tokens) and `--neutral-*`/`--feature-*`/`--status-*`
 * (backoffice app-shell tokens) — it must only ever be applied to the
 * storefront preview/renderer root, never to the app shell.
 *
 * Framework-agnostic on purpose: plain DOM only, so it can be called from a
 * React `useEffect` in a later phase. No React integration/hook/context is
 * built here.
 */

const MODES = ['light', 'dark'];

// camelCase colorSlot key -> kebab-case CSS custom property suffix.
// e.g. onSurface1_70 -> on-surface-1-70
function kebabCaseSlot(key) {
  return key
    .replace(/_/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Za-z])([0-9])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Applies a theme's tokens onto a DOM element as `--theme-*` CSS custom
 * properties, and stamps `data-theme`/`data-theme-mode` attributes for
 * debugging and CSS attribute selectors.
 *
 * @param {HTMLElement} el - the storefront preview/renderer root
 * @param {string} themeId - key into the theme registry, e.g. 'xinear'
 * @param {'light'|'dark'} mode
 */
export function applyThemeToElement(el, themeId, mode) {
  if (!el || typeof el.style?.setProperty !== 'function') {
    throw new Error('applyThemeToElement: el must be a DOM element');
  }
  if (!MODES.includes(mode)) {
    throw new Error(`applyThemeToElement: mode must be 'light' or 'dark', got "${mode}"`);
  }

  const theme = getTheme(themeId);
  const colors = theme[mode];

  for (const slot of colorSlots) {
    el.style.setProperty(`--theme-color-${kebabCaseSlot(slot)}`, colors[slot]);
  }

  el.style.setProperty('--theme-font-heading-family', theme.typography.heading.fontFamily);
  el.style.setProperty('--theme-font-heading-weight', String(theme.typography.heading.fontWeight));
  el.style.setProperty('--theme-font-body-family', theme.typography.body.fontFamily);
  el.style.setProperty('--theme-font-body-weight', String(theme.typography.body.fontWeight));

  el.style.setProperty('--theme-radius-sm', theme.shape.radiusSm);
  el.style.setProperty('--theme-radius-md', theme.shape.radiusMd);
  el.style.setProperty('--theme-radius-lg', theme.shape.radiusLg);
  el.style.setProperty('--theme-shadow-sm', theme.shape.shadowSm);
  el.style.setProperty('--theme-shadow-md', theme.shape.shadowMd);

  el.dataset.theme = themeId;
  el.dataset.themeMode = mode;
}
