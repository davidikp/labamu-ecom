import { useTranslation } from 'react-i18next';
import { Dropdown } from '../../../../ce-ui';

/**
 * US-5.1 — curated font list with a live sample below. No real Google Fonts
 * loading happens here (no network access from this environment/CSP) —
 * TODO(Phase 9+/backend): inject the actual @font-face / <link> tags so the
 * fonts render as intended rather than falling back silently.
 *
 * ce-ui's Dropdown has no option-grouping concept, so the serif/sans-serif
 * category grouping the native <select> used is dropped in favor of
 * `searchable` — findability by typing covers the same need for a 10-item
 * list.
 */
export default function FontPickerField({ field, value, onChange }) {
  const { t } = useTranslation();
  const current = value ?? field.default;

  return (
    <div>
      <Dropdown
        label={field.label}
        options={field.options}
        value={current}
        onChange={onChange}
        searchable
        size="md"
      />
      <p className="mt-2 rounded-md bg-gray-50 p-2 text-sm" style={{ fontFamily: current }}>
        {t('sectionBuilder:fields.fontPickerField.sampleText')}
      </p>
      {field.helpText && <p className="mt-1 text-xs text-gray-400">{field.helpText}</p>}
    </div>
  );
}
