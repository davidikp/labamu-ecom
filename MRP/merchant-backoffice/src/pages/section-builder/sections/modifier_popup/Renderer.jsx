import { memo, useState } from 'react';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle } from '../shared/themedButtonStyle';
import { calculateModifiersTotal, validateModifierSelection } from '../../mocks/modifierPricingMock.js';
import EditableText from '../../ui/EditableText';

// Demo base price, matching Xinear's Figma shoe example (IDR).
const BASE_PRICE = 1499000;

function buildGroups(optionalMax) {
  return [
    {
      id: 'size',
      name: 'Size',
      type: 'required-single',
      maxSelections: 1,
      options: [
        { id: 'size-s', label: 'Small', priceDelta: 0, available: true },
        { id: 'size-m', label: 'Medium', priceDelta: 0, available: true },
        { id: 'size-l', label: 'Large', priceDelta: 50000, available: true },
        { id: 'size-xl', label: 'X-Large', priceDelta: 50000, available: false },
      ],
    },
    {
      id: 'addons',
      name: 'Add-ons',
      type: 'optional-multi',
      maxSelections: optionalMax,
      options: [
        { id: 'addon-laces', label: 'Extra laces', priceDelta: 25000, available: true },
        { id: 'addon-insole', label: 'Premium insole', priceDelta: 75000, available: true },
        { id: 'addon-cleaning', label: 'Cleaning kit', priceDelta: 40000, available: true },
      ],
    },
  ];
}

// Deliberate exception to other renderers' static-preview pattern: a
// modifier popup's whole point is live selection + live pricing, so this
// renderer holds real interactive state (radio/checkbox toggles) instead of
// rendering a non-functional stub.
function ModifierPopupRenderer({ data, theme, onEdit }) {
  const optionalMax = data.optional_max_selections ?? 2;
  const groups = buildGroups(optionalMax);
  const [requiredGroup, optionalGroup] = groups;

  const [selections, setSelections] = useState({ [requiredGroup.id]: [], [optionalGroup.id]: [] });

  const modifiersTotal = calculateModifiersTotal(groups, selections);
  const requiredValidation = validateModifierSelection(requiredGroup, selections[requiredGroup.id]);
  const canAdd = requiredValidation.valid;

  const selectRequired = (optionId) => {
    setSelections((prev) => ({ ...prev, [requiredGroup.id]: [optionId] }));
  };

  const toggleOptional = (optionId) => {
    setSelections((prev) => {
      const current = prev[optionalGroup.id];
      if (current.includes(optionId)) {
        return { ...prev, [optionalGroup.id]: current.filter((id) => id !== optionId) };
      }
      if (current.length >= optionalGroup.maxSelections) return prev;
      return { ...prev, [optionalGroup.id]: [...current, optionId] };
    });
  };

  return (
    <section className="px-6">
      {onEdit ? (
        <EditableText as="h2" className="mb-4 text-2xl font-bold" value={data.heading} placeholder="Product Options" onCommit={(v) => onEdit('heading', v)} />
      ) : (
        <h2 className="mb-4 text-2xl font-bold">{data.heading || 'Product Options'}</h2>
      )}

      <div className="flex max-w-md flex-col gap-6 rounded-md border border-gray-200 p-4">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold">{data.required_group_label || 'Choose an option'}</legend>
          {requiredGroup.options.map((option) => (
            <label
              key={option.id}
              className={`flex items-center justify-between gap-2 text-sm ${option.available ? '' : 'text-gray-400 line-through'}`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name={requiredGroup.id}
                  disabled={!option.available}
                  checked={selections[requiredGroup.id].includes(option.id)}
                  onChange={() => selectRequired(option.id)}
                />
                {option.label} {!option.available && '(Unavailable)'}
              </span>
              {option.priceDelta > 0 && <span>+IDR {option.priceDelta.toLocaleString('id-ID')}</span>}
            </label>
          ))}
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold">{data.optional_group_label || 'Add-ons'}</legend>
          {optionalGroup.options.map((option) => {
            const checked = selections[optionalGroup.id].includes(option.id);
            const maxReached = !checked && selections[optionalGroup.id].length >= optionalGroup.maxSelections;
            return (
              <label key={option.id} className={`flex items-center justify-between gap-2 text-sm ${maxReached ? 'text-gray-400' : ''}`}>
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    disabled={maxReached}
                    checked={checked}
                    onChange={() => toggleOptional(option.id)}
                  />
                  {option.label}
                </span>
                <span>+IDR {option.priceDelta.toLocaleString('id-ID')}</span>
              </label>
            );
          })}
        </fieldset>

        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
          <span className="text-sm opacity-60">Sticky footer</span>
          <span
            style={{
              ...themedButtonStyle(theme.buttons, { primary: resolveColor({ slot: 'primary' }, theme.colors), primaryText: resolveColor({ slot: 'primary_text' }, theme.colors) }),
              opacity: canAdd ? 1 : 0.5,
            }}
            className="w-fit"
          >
            Add to Order – IDR {(BASE_PRICE + modifiersTotal).toLocaleString('id-ID')}
          </span>
        </div>
      </div>
    </section>
  );
}

export default memo(ModifierPopupRenderer);
