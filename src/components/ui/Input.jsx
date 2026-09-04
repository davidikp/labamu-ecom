import React, { useState, useEffect, useRef } from 'react';
import { TextField } from '../../ce-ui';

/**
 * @component Input
 * @description Legacy Labamu Input API, delegating to ce-ui's TextField.
 *
 * @param {Object} props
 * @param {string} props.label - Optional label displayed above the input
 * @param {string} props.error - Optional error message displayed below the input
 * @param {boolean} props.required - If true, adds a red asterisk next to the label
 * @param {number} props.maxLength - Optional max character limit
 */

function formatNpwp(value) {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').substring(0, 15);
  let res = '';
  if (digits.length > 0) res += digits.substring(0, 2);
  if (digits.length > 2) res += '.' + digits.substring(2, 5);
  if (digits.length > 5) res += '.' + digits.substring(5, 8);
  if (digits.length > 8) res += '.' + digits.substring(8, 9);
  if (digits.length > 9) res += '-' + digits.substring(9, 12);
  if (digits.length > 12) res += '.' + digits.substring(12, 15);
  return res;
}

const Input = ({ label, error, required, style, maxLength, value, onChange, onBlur, format, ...props }) => {
  const initVal = (value !== undefined && value !== null) ? (format === 'npwp' ? formatNpwp(value) : value) : '';

  // Local state buffer to prevent cursor jumping and per-keystroke validation
  const [localValue, setLocalValue] = useState(() => initVal);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      const nextVal = (value !== undefined && value !== null) ? (format === 'npwp' ? formatNpwp(value) : value) : '';
      setLocalValue(nextVal);
      prevValueRef.current = value;
    }
  }, [value]);

  const handleInput = (e) => {
    let nextVal = e.target.value;
    if (format === 'npwp') {
      nextVal = formatNpwp(nextVal);
    }
    setLocalValue(nextVal);
  };

  const handleBlur = (e) => {
    let finalVal = localValue;
    if (format === 'pad3' && finalVal) {
      finalVal = finalVal.replace(/\D/g, '').slice(0, 3).padStart(3, '0');
      setLocalValue(finalVal);
    }

    if (onChange) {
      onChange({ target: { value: finalVal } });
    }
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <TextField
      label={label}
      required={required}
      errorText={error}
      maxLength={maxLength}
      value={localValue}
      onChange={handleInput}
      onBlur={handleBlur}
      style={style}
      {...props}
    />
  );
};

export default Input;
