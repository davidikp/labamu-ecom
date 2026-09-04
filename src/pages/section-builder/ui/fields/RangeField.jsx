/** US-5.3-style range: optional presets snap the slider, dragging deselects them. */
export default function RangeField({ field, value, onChange }) {
  const current = value ?? field.default ?? field.min;

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">
        {field.label} <span className="text-gray-400">({current}{field.unit ?? ''})</span>
      </label>

      {field.presets && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {field.presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange(preset.value)}
              className={
                'rounded-md border px-2 py-1 text-xs ' +
                (current === preset.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50')
              }
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      <input
        type="range"
        min={field.min}
        max={field.max}
        step={field.step ?? 1}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
