import { themes } from './registry';

/**
 * @module section-builder/themes/themeRoster
 * @description Public roster for the Online Store > Themes "Discover"
 * gallery — separate from `themes/registry.js`, which only holds real,
 * fully-validated theme definitions (currently just Xinear). This roster
 * lists every theme the gallery should display, including planned themes
 * that have no implementation yet ("Coming soon" stubs).
 *
 * `previewImage` — a static marketing screenshot (public/assets/templates/
 * <id>/<id>.png), served as-is from the public folder rather than imported
 * as a module asset. Ported from the reference ecom-from-bella project's
 * WebsiteTemplates.jsx theme cards, which use the same images. Present for
 * every roster entry, including the still-`comingSoon` stubs — there's no
 * real theme built for those yet in this app, but the screenshot gives the
 * Discover gallery a real preview instead of a gradient placeholder.
 */
export const THEME_ROSTER = [
  { id: 'xinear', name: 'Xinear', comingSoon: false, previewImage: '/assets/templates/xinear/xinear.png' },
  { id: 'houzez', name: 'Houzez', comingSoon: false, previewImage: '/assets/templates/houzez/houzez.png' },
  { id: 'barger', name: 'Barger', comingSoon: true, previewImage: '/assets/templates/barger/barger.png' },
  { id: 'napoli', name: 'Napoli', comingSoon: true, previewImage: '/assets/templates/napoli/napoli.png' },
  { id: 'local', name: 'Local', comingSoon: true, previewImage: '/assets/templates/local/local.png' },
  { id: 'photostoodio', name: 'PhotoStoodio', comingSoon: true, previewImage: '/assets/templates/photostoodio/photostoodio.png' },
  { id: 'medic', name: 'Medic', comingSoon: true, previewImage: '/assets/templates/medic/medic.png' },
  { id: 'dekor', name: 'Dekor', comingSoon: true, previewImage: '/assets/templates/dekor/dekor.png' },
];

// Dev-time sanity check — every roster entry marked as real (comingSoon:
// false) must have a matching, fully-validated definition in the theme
// registry. Throws loudly at module load so a rename/removal in registry.js
// that isn't mirrored here fails fast instead of silently breaking the
// gallery (e.g. rendering "Add" for a theme applyThemeToElement can't find).
for (const entry of THEME_ROSTER) {
  if (!entry.comingSoon && !themes[entry.id]) {
    throw new Error(
      `themeRoster: "${entry.id}" is listed as available (comingSoon: false) but has no matching entry in themes/registry.js. Known registry themes: ${Object.keys(themes).join(', ')}`
    );
  }
}
