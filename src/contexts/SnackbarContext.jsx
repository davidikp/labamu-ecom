import React, { createContext, useContext, useState, useCallback } from 'react';

const SnackbarContext = createContext({
  showSnackbar: () => {},
});

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    isOpen: false,
    message: '',
    variant: 'grey' // 'grey', 'green', 'red'
  });

  const showSnackbar = useCallback((message, variant = 'grey') => {
    setSnackbar({
      isOpen: true,
      message,
      variant
    });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar, snackbar }}>
      {children}
    </SnackbarContext.Provider>
  );
};
