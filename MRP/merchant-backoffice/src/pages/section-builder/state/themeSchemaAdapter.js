import rawSchema from './theme-settings-schema.json';

/**
 * @module section-builder/state/themeSchemaAdapter
 * @description Thin, pure adapter over theme-settings-schema.json for the
 * Phase 4 theme panel. `favicon_and_meta` is intentionally excluded — it's
 * out of this phase's scope (not one of Epic 5's stories).
 */
const THEME_PANEL_GROUP_ORDER = ['typography', 'colors', 'buttons', 'layout', 'product_cards'];

export function getThemePanelGroups() {
  return THEME_PANEL_GROUP_ORDER.map((key) => ({ key, ...rawSchema.groups[key] }));
}

export function getGroupSchema(groupKey) {
  return rawSchema.groups[groupKey];
}

export { rawSchema };
