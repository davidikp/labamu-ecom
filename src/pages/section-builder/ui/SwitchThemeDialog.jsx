import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Popup } from '../../../ce-ui';

/**
 * Theme-switch choice dialog (Online Store > Theme) — unlike ConfirmDialog's
 * single confirm/cancel, switching themes on an already-seeded site has two
 * meaningfully different outcomes, so this offers both as equal-weight
 * choices instead of picking one as "primary": ce-ui's Popup only supports a
 * primaryAction/secondaryAction pair, so both choices are rendered as
 * clickable cards in `children` and Popup's own actions are used for Cancel
 * only.
 */
export default function SwitchThemeDialog({ open, templateName, onKeepContent, onStartFresh, onCancel }) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  return (
    <Popup
      open={open}
      onClose={onCancel}
      title={t('sectionBuilder:templates.gallery.switchChoiceTitle', { name: templateName })}
      description={t('sectionBuilder:templates.gallery.switchChoiceDescription')}
      platform="desktop"
      secondaryAction={{ label: t('sectionBuilder:editor.common.cancel'), onClick: onCancel }}
    >
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onKeepContent}
          className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-[#006BFF] hover:bg-blue-50"
        >
          <p className="text-sm font-semibold text-gray-900">{t('sectionBuilder:templates.gallery.switchChoiceKeepContent')}</p>
          <p className="mt-1 text-xs text-gray-500">{t('sectionBuilder:templates.gallery.switchChoiceKeepContentDescription')}</p>
        </button>
        <button
          type="button"
          onClick={onStartFresh}
          className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-[#006BFF] hover:bg-blue-50"
        >
          <p className="text-sm font-semibold text-gray-900">{t('sectionBuilder:templates.gallery.switchChoiceStartFresh')}</p>
          <p className="mt-1 text-xs text-gray-500">{t('sectionBuilder:templates.gallery.switchChoiceStartFreshDescription')}</p>
        </button>
      </div>
    </Popup>
  );
}
