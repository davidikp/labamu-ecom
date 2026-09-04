/**
 * @module section-builder/sections/shared/colorUtils
 * @description Tiny color-math helpers for building exact-stop gradients
 * (hero image blend, themed overlay) from a theme's hex color + a recipe's
 * alpha curve — see hero_banner/heroRecipes.js.
 */

/** '#RRGGBB' -> 'rgba(r,g,b,alpha)'. Falls back to the bare hex (opaque) if
 * it can't be parsed, so a bad theme value degrades instead of throwing. */
export function hexToRgba(hex, alpha = 1) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex ?? '');
  if (!match) return hex;
  const int = parseInt(match[1], 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** `stops`: `[{ offset: '0%', alpha: 1 }, ...]` — builds a CSS
 * `linear-gradient(to right, ...)` string from one base hex color at each
 * stop's own alpha, in one place so a gradient's *shape* (stop positions,
 * alpha curve) can live as plain data in a theme/layout recipe instead of a
 * hand-written CSS string per case. */
export function buildLinearGradient(direction, hex, stops) {
  const stopsCss = stops.map((s) => `${hexToRgba(hex, s.alpha)} ${s.offset}`).join(', ');
  return `linear-gradient(${direction}, ${stopsCss})`;
}
