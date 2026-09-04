import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BlockStream from '../../ui/BlockStream';
import { isWithinSchedule } from '../shared/scheduleWindow';

function PromotionalBannerRenderer({ data, blocks = [], theme, mediaLibrary, blockCtx, isBuilder }) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);
  // Checked once at mount (a promo banner doesn't need live per-second ticking
  // like the countdown timer) — a fresh page load re-evaluates it anyway.
  const [now] = useState(() => Date.now());
  const sideBySide = data.layout === 'side_by_side';
  const outsideSchedule = data.enable_scheduling && !isWithinSchedule(now, data.schedule_start, data.schedule_end);

  if (dismissed) return null;
  // Outside its scheduled window the banner is hidden on the live storefront,
  // but stays visible (dimmed) in the builder so it can still be edited.
  if (outsideSchedule && !isBuilder) return null;

  return (
    <section
      className={`flex flex-wrap items-center gap-3 px-6 ${sideBySide ? 'justify-between' : 'flex-col justify-center text-center'} ${outsideSchedule ? 'opacity-40' : ''}`}
    >
      <div className={`relative flex items-center gap-2 ${sideBySide ? '' : 'flex-col'}`}>
        {data.icon && <span className="text-lg">{data.icon}</span>}
        <BlockStream
          sectionType="promotional_banner"
          blocks={blocks}
          theme={theme}
          mediaLibrary={mediaLibrary}
          blockCtx={blockCtx}
          className={`flex flex-wrap items-center gap-2 ${sideBySide ? '' : 'flex-col'}`}
        />
      </div>
      {data.show_dismiss_button && (
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setDismissed(true)} className="text-lg leading-none opacity-70" aria-label={t('sectionBuilder:editor.common.close')}>
            ×
          </button>
        </div>
      )}
    </section>
  );
}

export default memo(PromotionalBannerRenderer);
