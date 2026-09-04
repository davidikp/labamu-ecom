import SelectField from './SelectField';
import RangeField from './RangeField';
import BooleanField from './BooleanField';
import FontPickerField from './FontPickerField';
import PaletteColorField from './PaletteColorField';

const THEME_FIELD_COMPONENTS = {
  select: SelectField,
  range: RangeField,
  boolean: BooleanField,
  font_picker: FontPickerField,
  color: PaletteColorField,
};

/** Dispatcher for theme-panel fields — a separate set of components from
 * section fields (SchemaField) because theme colors are raw hex values,
 * not slot references. */
export default function ThemeSchemaField({ field, value, onChange }) {
  const Component = THEME_FIELD_COMPONENTS[field.type];
  if (!Component) return null;
  return <Component field={field} value={value} onChange={onChange} />;
}
