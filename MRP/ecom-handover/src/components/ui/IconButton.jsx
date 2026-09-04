import React from 'react';
import { IconBtn } from '../../ce-ui';

/**
 * @component IconButton
 * @description Icon-only button, delegating to ce-ui's IconBtn.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon element (e.g. from Lucide)
 * @param {'primary' | 'secondary' | 'danger' | 'ghost' | 'danger-ghost'} props.variant
 * @param {'lg' | 'md' | 'sm'} props.size
 */
export default function IconButton({
  icon,
  onClick,
  variant = 'ghost',
  size = 'sm',
  disabled = false,
  style = {},
  ...rest
}) {
  return (
    <IconBtn
      icon={icon}
      onClick={onClick}
      variant={variant}
      size={size}
      disabled={disabled}
      style={style}
      {...rest}
    />
  );
}
