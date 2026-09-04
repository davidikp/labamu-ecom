/**
 * @module section-builder/sections/mediaHelpers
 * @description US-9.3's filename search and US-9.4's in-use check.
 */
export function matchesSearch(item, query) {
  if (!query) return true;
  return item.filename.toLowerCase().includes(query.trim().toLowerCase());
}

function usesMedia(entity, mediaId) {
  return Boolean(entity?.data && Object.values(entity.data).some((v) => v?.mediaId === mediaId));
}

/** Returns the section/global type labels currently referencing this media item. */
export function findUsages(state, mediaId) {
  const usages = [];
  if (usesMedia(state.header, mediaId)) usages.push('header');
  if (usesMedia(state.footer, mediaId)) usages.push('footer');
  for (const page of state.pages) {
    for (const section of page.sections) {
      if (usesMedia(section, mediaId)) usages.push(section.type);
    }
  }
  return usages;
}

export function isMediaInUse(state, mediaId) {
  return findUsages(state, mediaId).length > 0;
}
