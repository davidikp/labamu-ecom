import { Dropdown } from '../../../../ce-ui';

export default function SelectField({ field, value, onChange }) {
  return (
    <Dropdown
      label={field.label}
      options={field.options}
      value={value ?? field.default}
      onChange={onChange}
      size="md"
    />
  );
}
