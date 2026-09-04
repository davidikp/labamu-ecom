/**
 * @module section-builder/ui/fields/imageValue
 * @description Image fields store a reference `{ mediaId }` into the media
 * library (US-9.2), mirroring the color slot-reference model (US-4.4) —
 * not a raw URL. If the referenced item was deleted, resolution simply
 * returns null; ImageField distinguishes "never set" from "was deleted" by
 * checking whether `value.mediaId` is present but unresolvable.
 */
export function resolveMedia(value, mediaLibrary) {
  if (!value?.mediaId) return null;
  return mediaLibrary?.find((m) => m.id === value.mediaId) ?? null;
}

export function isDanglingReference(value, mediaLibrary) {
  return Boolean(value?.mediaId) && resolveMedia(value, mediaLibrary) === null;
}
