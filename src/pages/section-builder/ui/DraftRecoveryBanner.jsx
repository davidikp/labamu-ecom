import { useTranslation } from 'react-i18next';

function timeAgo(isoString, t) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
  if (seconds < 60) return t('sectionBuilder:editor.draftRecoveryBanner.momentsAgo');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t('sectionBuilder:editor.draftRecoveryBanner.minutesAgo', { count: minutes });
  const hours = Math.floor(minutes / 60);
  return t('sectionBuilder:editor.draftRecoveryBanner.hoursAgo', { count: hours });
}

/** US-8.5 — stays until the merchant chooses; does not auto-dismiss. */
export default function DraftRecoveryBanner({ restoredAt, onKeep, onDiscard }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm">
      <span className="text-amber-900">
        {t('sectionBuilder:editor.draftRecoveryBanner.restoredFrom', { time: timeAgo(restoredAt, t) })}
      </span>
      <div className="flex gap-2">
        <button type="button" onClick={onKeep} className="rounded-md border border-amber-300 px-2 py-1 text-xs text-amber-900 hover:bg-amber-100">
          {t('sectionBuilder:editor.draftRecoveryBanner.keepDraft')}
        </button>
        <button type="button" onClick={onDiscard} className="rounded-md border border-amber-300 px-2 py-1 text-xs text-amber-900 hover:bg-amber-100">
          {t('sectionBuilder:editor.draftRecoveryBanner.discardAndLoad')}
        </button>
      </div>
    </div>
  );
}
