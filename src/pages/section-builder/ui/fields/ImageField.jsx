import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MediaUploadField } from '../../../../ce-ui';
import { resolveMedia, isDanglingReference } from './imageValue';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * US-4.6 / US-9.2 — stores a `{ mediaId }` reference into the shared media
 * library rather than a raw URL (see ui/fields/imageValue.js), so an image
 * used across sections is uploaded once and reused (US-9.2's whole point).
 *
 * Built on ce-ui's MediaUploadField rather than its ImageField: ImageField
 * hardcodes a 1:1 crop on every upload (wrong for hero/16:9-ish images),
 * while MediaUploadField adds files "as-is at their natural ratio" when
 * `imageAspectRatio` is omitted — no forced crop. It also has no built-in
 * type/size validation (only a display hint), so that check is done here in
 * the onAdd/onReplace callbacks, after the file is already in hand.
 */
export default function ImageField({ field, value, onChange, mediaLibrary, onAddMedia, onOpenLibrary }) {
  const { t } = useTranslation();
  const [error, setError] = useState(null);
  const resolved = resolveMedia(value, mediaLibrary);
  const dangling = isDanglingReference(value, mediaLibrary);

  const items = resolved
    ? [{ id: resolved.id, type: 'image', src: resolved.url, name: resolved.filename }]
    : [];

  const acceptPayload = (payload) => {
    if (!ACCEPTED_TYPES.includes(payload.file.type)) {
      setError(t('sectionBuilder:fields.imageField.unsupportedFileType'));
      return null;
    }
    if (payload.file.size > MAX_BYTES) {
      setError(t('sectionBuilder:fields.imageField.fileTooLarge'));
      return null;
    }
    setError(null);
    const id = crypto.randomUUID();
    onAddMedia({
      id,
      filename: payload.name,
      url: payload.src,
      width: null,
      height: null,
      uploadedAt: new Date().toISOString(),
    });
    return id;
  };

  const handleAdd = (payload) => {
    const id = acceptPayload(payload);
    if (id) onChange({ mediaId: id });
  };

  const handleReplace = (_existingId, payload) => {
    const id = acceptPayload(payload);
    if (id) onChange({ mediaId: id });
  };

  return (
    <div>
      <MediaUploadField
        label={field.label}
        items={items}
        maxItems={1}
        maxSizeMB={10}
        onAdd={handleAdd}
        onReplace={handleReplace}
        onRemove={() => onChange(null)}
      />

      {items.length === 0 && (
        <>
          {dangling && <p className="mt-1 text-xs text-amber-600">{t('sectionBuilder:fields.imageField.imageDeleted')}</p>}
          <button
            type="button"
            onClick={() => onOpenLibrary((picked) => onChange({ mediaId: picked.id }))}
            className="mt-1 text-xs text-blue-600 underline"
          >
            {t('sectionBuilder:fields.imageField.chooseFromLibrary')}
          </button>
        </>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {field.helpText && <p className="mt-1 text-xs text-gray-400">{field.helpText}</p>}
    </div>
  );
}
