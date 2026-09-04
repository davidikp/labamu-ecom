import { useTranslation } from 'react-i18next';
import { contrastRatio, MIN_CONTRAST_RATIO } from './contrast';

/** US-4.5 — warning only, never blocks publishing. */
export default function ContrastBadge({ hexA, hexB }) {
  const { t } = useTranslation();
  const ratio = contrastRatio(hexA, hexB);
  const passes = ratio >= MIN_CONTRAST_RATIO;

  return (
    <p
      className={
        'mt-1 text-xs font-medium ' + (passes ? 'text-green-700' : 'text-red-600')
      }
    >
      {ratio.toFixed(1)}:1 — {passes ? t('sectionBuilder:fields.contrastBadge.good') : t('sectionBuilder:fields.contrastBadge.low')}
    </p>
  );
}
