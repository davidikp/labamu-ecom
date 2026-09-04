import React from 'react';
import { MainBtn } from '../../ce-ui';

/**
 * @component Button
 * @description Legacy Labamu Button API, delegating to ce-ui's MainBtn.
 *
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'tertiary' | 'danger' | 'danger-outline'} props.variant - Visual style
 * @param {'main' | 'medium' | 'small'} props.size - Dimension tier
 * @param {React.ReactNode} props.leftIcon - Optional icon element (e.g. from Lucide)
 * @param {React.ReactNode} props.rightIcon - Optional icon element
 */

// tertiary has no ce-ui equivalent (transparent bg/border); falls back to secondary.
const VARIANT_MAP = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'secondary',
  danger: 'danger-fill',
  'danger-outline': 'danger',
};

const SIZE_MAP = {
  main: 'lg',
  medium: 'md',
  small: 'sm',
};

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  leftIcon,
  rightIcon,
  width = 'auto',
  disabled = false,
  style = {},
}) {
  return (
    <MainBtn
      label={children}
      onClick={onClick}
      variant={VARIANT_MAP[variant] || 'primary'}
      size={SIZE_MAP[size] || 'md'}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      disabled={disabled}
      style={{ width, ...style }}
    />
  );
}
