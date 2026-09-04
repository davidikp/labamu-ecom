import { Smartphone, Tablet, Monitor, MonitorSmartphone, Maximize } from 'lucide-react';
import { BREAKPOINT_ORDER } from '../../themes/breakpoints';
import { resolveResponsiveValue } from '../../state/resolveResponsive';

const ICONS = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
  largeDesktop: MonitorSmartphone,
  fit: Maximize,
};

/**
 * Wraps any field control for a `responsive: true` schema field (Phase 1 of
 * the Easyblocks-inspired responsive work, see themes/breakpoints.js). The
 * field editor always edits the value for whichever breakpoint the canvas is
 * currently showing — same convention Easyblocks uses (the device picker
 * doubles as the responsive-field breakpoint picker). A small tab strip lets
 * the merchant jump to another breakpoint without changing the canvas.
 *
 * Storage shape: `{ $res: true, [breakpointId]: value, ... }` once at least
 * one breakpoint override has been set; a field that's never been edited
 * responsively stays a plain scalar (see resolveResponsiveValue).
 */
export default function ResponsiveFieldWrapper({ viewport, value, onChange, children }) {
  const activeBreakpoint = viewport && BREAKPOINT_ORDER.includes(viewport) ? viewport : 'desktop';
  const isResponsive = value && typeof value === 'object' && value.$res;
  const resolvedValue = resolveResponsiveValue(value, activeBreakpoint);

  const handleChange = (nextValue) => {
    // First edit under a non-base breakpoint promotes the field to `$res`
    // shape, seeding every breakpoint with today's plain value so nothing
    // else changes visually until the merchant overrides another tier.
    const base = isResponsive ? value : { $res: true, mobile: value };
    onChange({ ...base, [activeBreakpoint]: nextValue });
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-end gap-0.5">
        {BREAKPOINT_ORDER.map((bp) => {
          const Icon = ICONS[bp];
          const hasOverride = isResponsive && bp in value;
          return (
            <span
              key={bp}
              title={bp}
              className={
                'flex h-4 w-4 items-center justify-center rounded ' +
                (bp === activeBreakpoint
                  ? 'text-blue-600'
                  : hasOverride
                    ? 'text-gray-500'
                    : 'text-gray-300')
              }
            >
              <Icon size={11} />
            </span>
          );
        })}
      </div>
      {children(resolvedValue, handleChange)}
    </div>
  );
}
