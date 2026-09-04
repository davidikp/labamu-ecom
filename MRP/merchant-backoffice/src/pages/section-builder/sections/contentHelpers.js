/**
 * @module section-builder/sections/contentHelpers
 * @description US-3.7's "non-default content" check, used to decide whether
 * deleting a section needs confirmation. Until Phase 9 gives every section a
 * real `schema.js` with field defaults, this is approximated as "the section
 * has any data at all" — TODO(Phase 9): compare each field against its
 * schema default instead of against emptiness.
 */
export function hasNonDefaultContent(section) {
  if (!section?.data) return false;
  return Object.values(section.data).some((value) => {
    if (value == null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  });
}
