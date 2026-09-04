import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { Snackbar as CeSnackbar } from '../../ce-ui';

const VARIANT_MAP = {
  grey: 'default',
  green: 'success',
  red: 'error',
};

const Snackbar = () => {
  const { t } = useTranslation('common');
  const { snackbar, hideSnackbar } = useSnackbar();
  const { isOpen, message, variant } = snackbar;

  if (!isOpen) return null;

  return (
    <CeSnackbar
      message={message}
      variant={VARIANT_MAP[variant] || 'default'}
      action={{ label: t('action.oke'), onClick: hideSnackbar }}
      onClose={hideSnackbar}
      duration={4000}
      className="!top-[72px] !right-6 !bottom-auto !left-auto !translate-x-0"
    />
  );
};

export default Snackbar;
