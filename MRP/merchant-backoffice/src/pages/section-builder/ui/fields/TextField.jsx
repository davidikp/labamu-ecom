import { TextField as CeTextField } from '../../../../ce-ui';
import { shouldShowCounter } from './fieldHelpers';

/**
 * US-4.3 — character counter that appears only within 20 chars of the
 * limit is builder-specific behavior ce-ui's own `showCount` doesn't do
 * (it always shows the count when maxLength is set), so it's kept as a
 * sibling element rather than passed through as `showCount`.
 */
export default function TextField({ field, value, onChange }) {
  const current = value ?? '';
  const showCounter = shouldShowCounter(current, field.maxLength);
  const atLimit = field.maxLength != null && current.length >= field.maxLength;

  return (
    <div>
      <CeTextField
        label={field.label}
        value={current}
        maxLength={field.maxLength}
        multiline={field.type === 'textarea'}
        rows={field.type === 'textarea' ? 3 : undefined}
        onChange={(e) => onChange(e.target.value)}
        size="md"
      />
      {showCounter && (
        <p className={'mt-1 text-right text-xs ' + (atLimit ? 'text-red-600' : 'text-gray-400')}>
          {current.length}/{field.maxLength}
        </p>
      )}
    </div>
  );
}
