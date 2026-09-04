import { SITE_TEMPLATES } from './siteTemplates';
import { defaultTheme } from './defaultTheme';

// Per-key comparison rather than JSON.stringify equality — object key
// insertion order can legitimately differ (e.g. defaultTheme's colors are
// built from theme-settings-schema.json's field order, not the literal
// property order written in siteTemplates.js), and the draft's theme may
// carry extra keys (schema additions) the template doesn't define. Only the
// keys the template actually specifies need to match.
function matchesSubset(subset, full) {
  if (!subset || !full) return false;
  return Object.entries(subset).every(([key, value]) => full[key] === value);
}

/**
 * @module section-builder/state/inferActiveTemplate
 * @description Best-effort backfill for drafts that predate the
 * `activeTemplateId` field — a site edited before ever visiting Online
 * Store > Theme (or created directly via createFreshState) has no recorded
 * active template even though its colors/typography may already match one.
 * Matches the draft's current theme against SITE_TEMPLATES so the gallery
 * can mark the currently-used theme active on first view instead of always
 * showing nothing as active. Returns null for a genuinely custom/default
 * theme that doesn't match any known template.
 */
export function inferActiveTemplateId(theme) {
  const match = SITE_TEMPLATES.find(
    (template) => matchesSubset(template.theme.colors, theme?.colors) && matchesSubset(template.theme.typography, theme?.typography)
  );
  return match?.id ?? null;
}

/** True when a theme's colors/typography are still the untouched schema
 * defaults (state/defaultTheme.js) — i.e. no preset, template, or manual
 * edit has ever been applied. */
export function isDefaultTheme(theme) {
  return matchesSubset(defaultTheme.colors, theme?.colors) && matchesSubset(defaultTheme.typography, theme?.typography);
}
