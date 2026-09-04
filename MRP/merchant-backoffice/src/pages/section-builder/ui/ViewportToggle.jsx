import { useTranslation } from 'react-i18next';
import { Smartphone, Tablet, Monitor, MonitorSmartphone, Maximize } from 'lucide-react';
import { BREAKPOINT_ORDER } from '../themes/breakpoints';

const ICONS = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
  largeDesktop: MonitorSmartphone,
  fit: Maximize,
};

/**
 * US-2.1 — switches the canvas reference width; every breakpoint renders the
 * same draft content, so this never triggers a reload. Five presets mirror
 * Easyblocks' device picker (mobile/tablet/desktop/large desktop/fit); `fit`
 * stretches the canvas to the available panel width instead of a fixed px
 * size — see themes/breakpoints.js.
 */
export default function ViewportToggle({ viewport, onChange }) {
  const { t } = useTranslation();
  const OPTIONS = BREAKPOINT_ORDER.map((id) => ({
    value: id,
    label: t(`sectionBuilder:editor.viewportToggle.${id}`),
    Icon: ICONS[id],
  }));
  return (
    <div role="group" aria-label={t('sectionBuilder:editor.viewportToggle.ariaLabel')} className="inline-flex rounded-md border border-gray-200 p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          title={opt.label}
          aria-label={opt.label}
          aria-pressed={viewport === opt.value}
          onClick={() => onChange(opt.value)}
          className={
            'flex items-center justify-center rounded-[5px] p-1.5 transition-colors ' +
            (viewport === opt.value
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-100')
          }
        >
          <opt.Icon size={15} />
        </button>
      ))}
    </div>
  );
}
