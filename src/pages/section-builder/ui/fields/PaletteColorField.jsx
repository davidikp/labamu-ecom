/**
 * Plain hex color editor for the theme palette itself (US-5.2) — distinct
 * from section ColorField, which picks a *reference* to one of these slots
 * rather than setting a raw hex value.
 */
export default function PaletteColorField({ field, value, onChange }) {
  const hex = value ?? field.default;

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 shrink-0 cursor-pointer rounded border border-gray-200 p-0"
        />
        <div className="min-w-0 flex-1">
          <label className="block text-xs font-medium text-gray-700">{field.label}</label>
          <input
            type="text"
            value={hex}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm uppercase focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
      </div>
      {field.helpText && <p className="mt-1 text-xs text-gray-400">{field.helpText}</p>}
    </div>
  );
}
