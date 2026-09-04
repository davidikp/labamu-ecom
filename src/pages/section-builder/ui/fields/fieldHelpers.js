/**
 * @module section-builder/ui/fields/fieldHelpers
 * @description Pure helpers shared by SchemaField/SettingsPanel.
 */

/** US-4.3 — counter shows once within 20 chars of the limit. */
export function shouldShowCounter(value, maxLength) {
  if (maxLength == null) return false;
  const length = (value ?? '').length;
  return length >= maxLength - 20;
}

/** US-4.8 — dependsOn: { field, equals } with `equals` as a value or array of values. */
export function isFieldVisible(field, data) {
  if (!field.dependsOn) return true;
  const actual = data?.[field.dependsOn.field];
  const expected = field.dependsOn.equals;
  return Array.isArray(expected) ? expected.includes(actual) : actual === expected;
}

const GROUP_ORDER = ['content', 'media', 'layout', 'color', 'mobile'];

/** Human-readable heading shown above each field group in SettingsPanel
 * (after the first) — group keys themselves (content/media/layout/color/
 * mobile) are internal, not meant for display. */
const GROUP_LABELS = { content: 'Content', media: 'Media', layout: 'Layout', color: 'Color', mobile: 'Mobile' };

export function labelForGroup(group) {
  return GROUP_LABELS[group] ?? group;
}

/**
 * US-4.2 — groups fields into the fixed content → media → layout → color
 * order, omitting empty groups (e.g. no color divider when there are no
 * color fields), regardless of declaration order in the schema.
 */
export function groupFieldsInOrder(fields) {
  const entries = Object.entries(fields);
  return GROUP_ORDER.map((group) => ({
    group,
    fields: entries.filter(([, field]) => (field.group ?? 'content') === group),
  })).filter((g) => g.fields.length > 0);
}
