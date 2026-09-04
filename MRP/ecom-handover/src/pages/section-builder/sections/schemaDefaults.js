/**
 * @module section-builder/sections/schemaDefaults
 * @description Builds a `data` object from a schema's declared field
 * defaults (component design rule #2 — "every component must be useful on
 * day one"). Must be called when a section/global entity is *created*, not
 * just referenced by the settings panel — a field with no default written
 * into `data` resolves as "nothing set at all" at render time (e.g.
 * ui/fields/colorValue.js falls back to black), not as its schema default.
 */
export function defaultsForSchema(schema) {
  return Object.fromEntries(
    // structuredClone so an array/object default (e.g. collection_list's
    // `collections`) isn't the same shared reference handed to every new
    // section built from this schema — without it, two sections created
    // from the same default would alias one array, and RepeaterField's
    // `onChange([...items, newItem])` on one would leave the other still
    // pointing at the original, now-stale reference.
    Object.entries(schema).map(([key, field]) => [key, field.default != null ? structuredClone(field.default) : null])
  );
}
