import { Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '../../contexts/SnackbarContext';

/**
 * Icon-only "copy this page's URL" button, shared by PagesManagement.jsx's
 * Page List URL column and PageEditor.jsx's Page detail URL handle field so
 * both stay in sync on behavior/feedback.
 */
export default function CopyUrlButton({ url, size = 16 }) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const handleCopy = async (e) => {
    // Stops a click here from also firing a containing row's onRowClick
    // (PagesManagement.jsx's Table navigates into the page editor on row
    // click) — copying the URL shouldn't also navigate away.
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      showSnackbar(t('sectionBuilder:onlineStore.pages.urlCopied', 'Page URL copied'), 'green');
    } catch {
      showSnackbar(t('sectionBuilder:onlineStore.pages.urlCopyFailed', 'Couldn’t copy URL'), 'red');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={t('sectionBuilder:onlineStore.pages.copyUrl', 'Copy URL')}
      title={t('sectionBuilder:onlineStore.pages.copyUrl', 'Copy URL')}
      style={{
        width: 28,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        border: '1px solid #E5E7EB',
        background: '#fff',
        cursor: 'pointer',
        flexShrink: 0,
        color: '#6B7280',
      }}
    >
      <Copy size={size} />
    </button>
  );
}
