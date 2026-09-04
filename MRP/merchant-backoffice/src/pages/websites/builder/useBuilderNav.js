import { useState, useCallback } from 'react';

export function useBuilderNav() {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeConfigPanel, setActiveConfigPanel] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewport, setViewport] = useState('desktop');

  const handleStepChange = useCallback((newStep) => {
    if (newStep !== 1) setActiveConfigPanel(null);
    setCurrentStep(newStep);
  }, []);

  return {
    currentStep,
    activeConfigPanel,
    setActiveConfigPanel,
    isSidebarOpen,
    setIsSidebarOpen,
    viewport,
    setViewport,
    handleStepChange,
  };
}
