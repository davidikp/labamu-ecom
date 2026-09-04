/**
 * MOCK IMPLEMENTATION — no backend exists yet for this logic (as of
 * 2026-08-14). This defines the request/response contract a real API
 * should implement. Replace the function body with a real fetch() call
 * when the backend is ready; keep the exported function signature stable
 * so call sites don't change.
 */

/**
 * @typedef {object} ModifierOption
 * @property {string} id
 * @property {string} label
 * @property {number} priceDelta - added to the base price when selected
 * @property {boolean} available
 */

/**
 * @typedef {object} ModifierGroup
 * @property {string} id
 * @property {string} name
 * @property {'required-single'|'optional-multi'} type
 * @property {number} maxSelections - only meaningful for 'optional-multi'
 * @property {ModifierOption[]} options
 */

/**
 * Validates a selection made within a single modifier group.
 * - 'required-single': exactly 1 option selected, and it must be available.
 * - 'optional-multi': 0..maxSelections options selected, all must be available.
 *
 * @param {ModifierGroup} group
 * @param {string[]} selectedOptionIds
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateModifierSelection(group, selectedOptionIds) {
  const optionsById = new Map(group.options.map((opt) => [opt.id, opt]));

  const unknownId = selectedOptionIds.find((id) => !optionsById.has(id));
  if (unknownId) {
    return { valid: false, error: `Option "${unknownId}" does not belong to group "${group.name}"` };
  }

  const unavailable = selectedOptionIds.find((id) => !optionsById.get(id).available);
  if (unavailable) {
    return { valid: false, error: `Option "${unavailable}" is not available` };
  }

  if (group.type === 'required-single') {
    if (selectedOptionIds.length !== 1) {
      return { valid: false, error: `Group "${group.name}" requires exactly 1 selection, got ${selectedOptionIds.length}` };
    }
    return { valid: true };
  }

  if (group.type === 'optional-multi') {
    if (selectedOptionIds.length > group.maxSelections) {
      return { valid: false, error: `Group "${group.name}" allows at most ${group.maxSelections} selections, got ${selectedOptionIds.length}` };
    }
    return { valid: true };
  }

  return { valid: false, error: `Unknown group type "${group.type}"` };
}

/**
 * Sums the priceDelta of every selected option across all modifier groups.
 *
 * @param {ModifierGroup[]} groups
 * @param {Record<string, string[]>} selectionsByGroupId - { [groupId]: selectedOptionIds }
 * @returns {number}
 */
export function calculateModifiersTotal(groups, selectionsByGroupId) {
  return groups.reduce((total, group) => {
    const selectedIds = selectionsByGroupId[group.id] || [];
    const optionsById = new Map(group.options.map((opt) => [opt.id, opt]));
    const groupTotal = selectedIds.reduce((sum, id) => sum + (optionsById.get(id)?.priceDelta || 0), 0);
    return total + groupTotal;
  }, 0);
}

/**
 * Calculates the total for a single order line, including modifiers,
 * multiplied by quantity.
 *
 * @param {number} basePrice
 * @param {number} quantity
 * @param {ModifierGroup[]} groups
 * @param {Record<string, string[]>} selectionsByGroupId
 * @returns {number}
 */
export function calculateOrderLineTotal(basePrice, quantity, groups, selectionsByGroupId) {
  return (basePrice + calculateModifiersTotal(groups, selectionsByGroupId)) * quantity;
}
