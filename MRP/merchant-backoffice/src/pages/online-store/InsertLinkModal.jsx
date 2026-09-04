import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Popup, TextField } from '../../ce-ui';

// Accepts bare domains ("example.com") as well as full URLs, same leniency
// `window.prompt` had — but `new URL()` alone isn't enough of a guardrail:
// the WHATWG URL parser happily accepts a single bare word like "asdkjhasd"
// as a "valid" single-label hostname. Requiring a dot (or localhost/an IP)
// in the host catches the actually-invalid input the PRD's negative case
// means, without rejecting real single-word intranet hosts too aggressively.
function isValidUrl(value) {
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  let url;
  try {
    url = new URL(withScheme);
  } catch {
    return false;
  }
  if (!['http:', 'https:'].includes(url.protocol)) return false;
  const host = url.hostname;
  const looksLikeDomain = host.includes('.');
  const looksLikeIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  return host === 'localhost' || looksLikeDomain || looksLikeIp;
}

/**
 * Rich Text Editor — Insert Link. Built on ce-ui's shared `Popup` (same
 * dialog primitive as the rest of this app) instead of a bespoke overlay —
 * replaces the earlier `window.prompt`, a browser-native dialog that
 * couldn't be styled/localized. Opened with `existingUrl` set, it doubles
 * as the "edit or remove the existing link" surface (Popup's secondary
 * action slot becomes "Remove link" in that case).
 */
export default function InsertLinkModal({ open, existingUrl, onApply, onRemove, onClose }) {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setUrl(existingUrl || '');
      setError(null);
    }
  }, [open, existingUrl]);

  const handleApply = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!isValidUrl(trimmed)) {
      setError(t('sectionBuilder:onlineStore.pageEditor.linkInvalidUrl', 'Enter a valid URL.'));
      return;
    }
    onApply(trimmed);
    onClose();
  };

  return (
    <Popup
      open={open}
      onClose={onClose}
      platform="tablet"
      align="left"
      title={
        existingUrl
          ? t('sectionBuilder:onlineStore.pageEditor.linkEditHeading', 'Edit link')
          : t('sectionBuilder:onlineStore.pageEditor.linkInsertHeading', 'Insert link')
      }
      primaryAction={{
        label: existingUrl
          ? t('sectionBuilder:onlineStore.pageEditor.linkUpdate', 'Update link')
          : t('sectionBuilder:onlineStore.pageEditor.linkInsert', 'Insert link'),
        onClick: handleApply,
        disabled: !url.trim(),
      }}
      secondaryAction={
        existingUrl
          ? {
              label: t('sectionBuilder:onlineStore.pageEditor.linkRemove', 'Remove link'),
              onClick: () => {
                onRemove();
                onClose();
              },
            }
          : undefined
      }
    >
      <TextField
        autoFocus
        label={t('sectionBuilder:onlineStore.pageEditor.linkUrlLabel', 'Link URL')}
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setError(null);
        }}
        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
        placeholder="https://example.com"
        errorText={error}
        size="md"
      />
    </Popup>
  );
}
