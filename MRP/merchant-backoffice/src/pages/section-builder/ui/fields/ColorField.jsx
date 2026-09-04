import { SWATCH_SLOT_ORDER, resolveColor, isSlotReference } from './colorValue';

/**
 * US-4.4 — palette swatches above a hex input. Clicking a swatch stores a
 * slot reference; typing a hex stores a literal override and deselects the
 * swatch. `palette` is the current theme.colors object.
 */
export default function ColorField({ field, value, onChange, palette }) {
  const hex = resolveColor(value, palette);
  const activeSlot = isSlotReference(value) ? value.slot : null;

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">{field.label}</label>

      <div className="mb-2 flex flex-wrap gap-1.5">
        {SWATCH_SLOT_ORDER.map((slot) => (
          <button
            key={slot}
            type="button"
            title={slot}
            onClick={() => onChange({ slot })}
            style={{ backgroundColor: palette?.[slot] ?? '#fff' }}
            className={
              'h-6 w-6 rounded-full border border-gray-200 ' +
              (activeSlot === slot ? 'ring-2 ring-blue-500 ring-offset-1' : '')
            }
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange({ hex: e.target.value })}
          className="h-8 w-8 shrink-0 cursor-pointer rounded border border-gray-200 p-0"
        />
        <input
          type="text"
          value={hex}
          onChange={(e) => onChange({ hex: e.target.value })}
          className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm uppercase focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>
    </div>
  );
}
