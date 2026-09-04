import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { remainingParts, pad2 } from './countdownMath';
import BlockStream from '../../ui/BlockStream';
import EditableText from '../../ui/EditableText';

function TimeUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center rounded-md bg-white/20 px-3 py-2">
      <span className="text-xl font-bold tabular-nums">{pad2(value)}</span>
      <span className="text-[10px] uppercase tracking-wide">{label}</span>
    </div>
  );
}

function CountdownTimerRenderer({ data, blocks = [], theme, mediaLibrary, onEdit, blockCtx }) {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const parts = remainingParts(now, data.end_datetime, data.timezone);

  if (parts.expired && data.action_when_expired === 'hide') return null;

  return (
    <section className="relative px-6 text-center">
      <BlockStream
        sectionType="countdown_timer"
        blocks={blocks}
        theme={theme}
        mediaLibrary={mediaLibrary}
        blockCtx={blockCtx}
        className="mb-4 flex flex-col items-center gap-1"
      />
      {parts.expired ? (
        onEdit ? (
          <EditableText
            as="p"
            className="text-base font-medium"
            value={data.custom_expired_message}
            placeholder={t('sectionBuilder:sections.countdownTimer.defaultExpiredMessage')}
            onCommit={(v) => onEdit('custom_expired_message', v)}
          />
        ) : (
          <p className="text-base font-medium">{data.custom_expired_message || t('sectionBuilder:sections.countdownTimer.defaultExpiredMessage')}</p>
        )
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {data.show_days !== false && <TimeUnit value={parts.days} label={t('sectionBuilder:sections.countdownTimer.days')} />}
          {data.show_hours !== false && <TimeUnit value={parts.hours} label={t('sectionBuilder:sections.countdownTimer.hours')} />}
          {data.show_minutes !== false && <TimeUnit value={parts.minutes} label={t('sectionBuilder:sections.countdownTimer.minutes')} />}
          {data.show_seconds !== false && <TimeUnit value={parts.seconds} label={t('sectionBuilder:sections.countdownTimer.seconds')} />}
        </div>
      )}
      {data.show_button && (
        <span className="mt-4 inline-block rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900">
          {onEdit ? (
            <EditableText
              value={data.button_label}
              placeholder={t('sectionBuilder:sections.countdownTimer.defaultButtonText')}
              onCommit={(v) => onEdit('button_label', v)}
            />
          ) : (
            data.button_label || t('sectionBuilder:sections.countdownTimer.defaultButtonText')
          )}
        </span>
      )}
    </section>
  );
}

export default memo(CountdownTimerRenderer);
