import { Link2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IconBtn, Tooltip } from '../../ce-ui';
import { useSnackbar } from '../../contexts/SnackbarContext';

/**
 * Icon-only "copy this page's URL" button, shared by PagesManagement.jsx's
 * Page List URL column and PageEditor.jsx's Page detail URL handle field so
 * both stay in sync on behavior/feedback. Built on ce-ui's own IconBtn +
 * Tooltip (same pairing ThemeGalleryCards.jsx's rename Save/Cancel actions
 * use) rather than a bespoke `<button>`, so an icon-only control here reads
 * as the same design system as everywhere else it's used.
 */
export default function CopyUrlButton({ url, size = 16 }) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const label = t('sectionBuilder:onlineStore.pages.copyUrl', 'Copy Page URL');

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

  // ce-ui's IconBtn "secondary" variant hovers to a fully solid brand-color
  // fill *and* flips the icon to white (its synced Tailwind
  // hover:enabled:bg-lb-brand + hover:enabled:text-lb-surface) — fine for a
  // primary-ish action, but this is a minor, low-emphasis control that
  // should hover the same subtle way the topbar's own secondary buttons do
  // (Layout.jsx's "Edit website"/"View storefront", via ce-ui MainBtn's
  // secondary variant: a light brand-tinted background with the icon
  // staying brand-blue, not a full fill with a white icon). Both background
  // and color are set directly on the element (not a CSS class) since an
  // inline `style` always wins over IconBtn's synced Tailwind hover classes
  // regardless of specificity — same technique Layout.jsx's own
  // profile-menu buttons use for their hover tint.
  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = 'var(--lb-brand-light)';
    e.currentTarget.style.color = 'var(--lb-brand)';
  };
  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = '';
    e.currentTarget.style.color = '';
  };

  return (
    <Tooltip content={label}>
      <IconBtn
        type="button"
        icon={<Link2 size={size} />}
        variant="secondary"
        size="sm"
        onClick={handleCopy}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={label}
      />
    </Tooltip>
  );
}
