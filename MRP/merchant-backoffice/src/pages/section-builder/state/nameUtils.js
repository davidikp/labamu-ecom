/**
 * @module section-builder/state/nameUtils
 * @description Small naming helpers shared by Online Store flows that need
 * file-download-style de-duplication (e.g. adding a theme named "Horizon"
 * twice should yield "Horizon" then "Horizon (1)").
 */

/**
 * Given the list of names already in use and a desired baseName, returns a
 * name guaranteed not to collide: baseName itself if free, otherwise
 * "baseName (1)", "baseName (2)", … incrementing until one is free.
 * Comparison is case-sensitive exact match.
 *
 * @param {string[]} existingNames
 * @param {string} baseName
 * @returns {string}
 *
 * // getUniqueName(['Horizon'], 'Horizon') -> 'Horizon (1)'
 * // getUniqueName(['Horizon', 'Horizon (1)'], 'Horizon') -> 'Horizon (2)'
 * // getUniqueName(['Tinker'], 'Horizon') -> 'Horizon'
 */
export function getUniqueName(existingNames, baseName) {
  if (!existingNames.includes(baseName)) return baseName;
  let n = 1;
  while (existingNames.includes(`${baseName} (${n})`)) {
    n += 1;
  }
  return `${baseName} (${n})`;
}
