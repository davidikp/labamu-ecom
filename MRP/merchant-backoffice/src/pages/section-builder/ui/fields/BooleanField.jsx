import { Toggle } from '../../../../ce-ui';

export default function BooleanField({ field, value, onChange }) {
  const checked = value ?? field.default ?? false;

  return (
    <div className="flex items-center justify-between gap-2 text-sm text-gray-700">
      <span>{field.label}</span>
      <Toggle checked={checked} onChange={onChange} size="small" />
    </div>
  );
}
