import React from 'react';
import { TextField } from '../../../../ce-ui';

const InputField = React.memo(({ label, value, onChange, placeholder, isTextarea }) => (
  <div style={{ marginBottom: '16px' }}>
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      multiline={isTextarea}
      rows={isTextarea ? 3 : undefined}
      size="lg"
    />
  </div>
));

export default InputField;
