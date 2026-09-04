import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TriangleAlert } from 'lucide-react';
import { Popup } from '../../ce-ui';

// Loose but deliberate: only accepts an <iframe ...> tag with a src, so a
// pasted <script> or plain text is rejected rather than silently embedded.
const IFRAME_SRC_RE = /<iframe[^>]*\ssrc=["']([^"']+)["'][^>]*><\/iframe>|<iframe[^>]*\ssrc=["']([^"']+)["'][^>]*\/>/i;

export function extractIframeSrc(snippet) {
  const match = String(snippet || '').match(IFRAME_SRC_RE);
  return match ? match[1] || match[2] : null;
}

/**
 * Rich Text Editor — Insert Video. Built on ce-ui's shared `Popup`. Accepts
 * a pasted iframe embed snippet (the PRD's flow — no upload/transcoding
 * pipeline in this demo) and doubles as the edit surface when a video
 * already exists in the content: opened with `existingSrc` set, it offers
 * Replace (primary) / Remove (secondary) instead of Insert.
 */
export default function InsertVideoModal({ open, existingSrc, onInsert, onRemove, onClose }) {
  const { t } = useTranslation();
  const [snippet, setSnippet] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setSnippet(existingSrc ? `<iframe src="${existingSrc}"></iframe>` : '');
      setError(null);
    }
  }, [open, existingSrc]);

  const handleInsert = () => {
    if (!snippet.trim()) return;
    const src = extractIframeSrc(snippet);
    if (!src) {
      setError(t('sectionBuilder:onlineStore.pageEditor.videoInvalidSnippet', 'That doesn’t look like a valid embed snippet. Paste the full <iframe> code.'));
      return;
    }
    onInsert(src);
    onClose();
  };

  return (
    <Popup
      open={open}
      onClose={onClose}
      platform="tablet"
      align="left"
      title={
        existingSrc
          ? t('sectionBuilder:onlineStore.pageEditor.videoEditHeading', 'Edit embedded video')
          : t('sectionBuilder:onlineStore.pageEditor.videoInsertHeading', 'Insert video')
      }
      primaryAction={{
        label: existingSrc
          ? t('sectionBuilder:onlineStore.pageEditor.videoReplace', 'Replace video')
          : t('sectionBuilder:onlineStore.pageEditor.videoInsert', 'Insert video'),
        onClick: handleInsert,
        disabled: !snippet.trim(),
      }}
      secondaryAction={
        existingSrc
          ? {
              label: t('sectionBuilder:onlineStore.pageEditor.videoRemove', 'Remove video'),
              onClick: () => {
                onRemove();
                onClose();
              },
            }
          : undefined
      }
    >
      <label className="mb-1.5 block text-xs font-medium text-lb-on-surface-2">
        {t('sectionBuilder:onlineStore.pageEditor.videoSnippetLabel', 'Embed snippet')}
      </label>
      <textarea
        autoFocus
        rows={4}
        value={snippet}
        onChange={(e) => {
          setSnippet(e.target.value);
          setError(null);
        }}
        placeholder='<iframe src="https://www.youtube.com/embed/…"></iframe>'
        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs text-gray-800 outline-none focus:border-[#006BFF]"
      />
      {error && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          <TriangleAlert size={14} />
          {error}
        </div>
      )}
    </Popup>
  );
}
