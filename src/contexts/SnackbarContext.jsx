import React, { createContext, useContext, useState, useCallback } from 'react';

const SnackbarContext = createContext({
  showSnackbar: () => {},
});

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    isOpen: false,
    message: '',
    variant: 'grey', // 'grey', 'green', 'red'
    id: 0
  });

  const showSnackbar = useCallback((message, variant = 'grey') => {
    setSnackbar((prev) => ({
      isOpen: true,
      message,
      variant,
      // Bumped on every call (even back-to-back ones while already open,
      // e.g. "Installing theme..." handing off to "Draft theme successfully
      // saved") so the rendered Snackbar can key off it and remount —
      // otherwise its own internal auto-dismiss timer (see ui/Snackbar.jsx)
      // just keeps counting down from the first message shown instead of
      // giving each new message its own full duration on screen.
      id: prev.id + 1
    }));
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
