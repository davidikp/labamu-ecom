import { xinearTheme } from './xinear';
import { houzezTheme } from './houzez';

/**
 * @module section-builder/themes/registry
 * @description Lookup table for all storefront themes. Add new theme
 * definitions here as they're built.
 */
export const themes = {
  xinear: xinearTheme,
  houzez: houzezTheme,
};

/**
 * @param {string} id
 * @returns {object} the theme definition
 */
export function getTheme(id) {
  const theme = themes[id];
  if (!theme) {
    throw new Error(`getTheme: unknown theme id "${id}". Known themes: ${Object.keys(themes).join(', ')}`);
  }
  return theme;
}
