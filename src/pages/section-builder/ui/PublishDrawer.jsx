import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { MainBtn, IconBtn } from '../../../ce-ui';
import { PUBLISH_CHECKS, allChecksPass } from '../sections/publishChecks';

/**
 * "Before you publish" — non-blocking (US-8.2): the builder stays usable
 * behind it, so unlike ConfirmDialog this deliberately does NOT trap focus —
 * only Esc-to-close, no Tab cycling restriction. Checks are demo toggles (no
 * real product/payment/domain data source yet); clicking a check's action
 * link flips it to simulate resolving it.
 */
export default function PublishDrawer({ open, checkState, onToggleCheck, onPublishAnyway, onClose }) {
  const { t } = useTranslation();
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div role="region" aria-label="Before you publish" className="fixed inset-y-0 right-0 z-40 w-80 border-l border-gray-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">{t('sectionBuilder:editor.publishDrawer.heading')}</h2>
        <IconBtn icon={<X size={16} />} variant="ghost" size="sm" aria-label={t('sectionBuilder:editor.common.close')} onClick={onClose} />
      </div>

      <div className="space-y-3 p-4">
        {PUBLISH_CHECKS.map((check) => {
          const passed = checkState[check.key];
          return (
            <div key={check.key} className="flex items-start gap-2 rounded-md border border-gray-100 p-2">
              <span className={passed ? 'text-green-600' : 'text-amber-500'}>{passed ? '✓' : '!'}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-800">{check.label}</p>
                {!passed && (
                  <button
                    type="button"
                    onClick={() => onToggleCheck(check.key)}
                    className="text-xs text-blue-600 underline"
                  >
                    {check.actionLabel} →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-x-0 bottom-0 border-t border-gray-100 p-4">
        {!allChecksPass(checkState) && (
          <p className="mb-2 text-xs text-amber-700">{t('sectionBuilder:editor.publishDrawer.warning')}</p>
        )}
        <MainBtn label={t('sectionBuilder:editor.publishDrawer.publishAnyway')} variant="primary" size="md" onClick={onPublishAnyway} className="w-full" />
      </div>
    </div>
  );
}
