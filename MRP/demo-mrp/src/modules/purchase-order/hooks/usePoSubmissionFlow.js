import { useState, useCallback, useMemo } from "react";
import { MOCK_WO_TABLE_DATA } from "../../../modules/work-order/mock/workOrderMocks";

export const usePoSubmissionFlow = ({
  formData,
  initialData,
  mockLines,
  currentStatus,
  poApprovalSettings,
  createdDate,
  currencyLabel,
}) => {
  // --- Modal Visibility State ---
  const [showSubmitGuardModal, setShowSubmitGuardModal] = useState(false);
  const [showZeroPriceWarningModal, setShowZeroPriceWarningModal] = useState(false);
  const [showDetailSubmitConfirmModal, setShowDetailSubmitConfirmModal] = useState(false);
  const [showFutureDateBlocker, setShowFutureDateBlocker] = useState(false);
  const [showCancelledWOBlocker, setShowCancelledWOBlocker] = useState(false);
  const [cancelledWOsFound, setCancelledWOsFound] = useState([]);

  // --- Validation Helpers ---
  const validateDetailRequiredInfo = useCallback(() => {
    const missing = [];
    if (!(formData?.vendorName || initialData?.vendorName))
      missing.push("Vendor");
    if (!createdDate || createdDate === "-") missing.push("Purchase Order Date");
    if (!currencyLabel || currencyLabel === "-") missing.push("Currency");
    if (!mockLines || mockLines.length === 0) missing.push("Purchase Order Lines");
    return missing;
  }, [formData, initialData, createdDate, currencyLabel, mockLines]);

  // --- Handlers ---
  const handleDetailSubmitClick = useCallback(() => {
    const missingFields = validateDetailRequiredInfo();
    if (missingFields.length > 0) {
      setShowSubmitGuardModal(true);
      return;
    }

    // Check if PO date is in the future
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const dateToCheck = createdDate || formData?.createdDate;
    
    if (dateToCheck > todayString) {
      setShowFutureDateBlocker(true);
      return;
    }

    // Check for cancelled work orders
    const cancelledWOLines = mockLines.filter((line) => {
      if (line.type !== "wo") return false;
      const woData = MOCK_WO_TABLE_DATA.find((w) => w.wo === line.woRef);
      return woData && woData.status === "Cancelled";
    });

    if (cancelledWOLines.length > 0) {
      const cancelledWoNumbers = Array.from(
        new Set(cancelledWOLines.map((l) => l.woRef))
      );
      setCancelledWOsFound(cancelledWoNumbers);
      setShowCancelledWOBlocker(true);
      return;
    }
    
    const hasZeroPriceItem = mockLines.some(line => (parseFloat(line.price) || 0) === 0);
    if (hasZeroPriceItem) {
      setShowZeroPriceWarningModal(true);
    } else {
      setShowDetailSubmitConfirmModal(true);
    }
  }, [validateDetailRequiredInfo, createdDate, formData?.createdDate, mockLines]);

  const closeAllModals = useCallback(() => {
    setShowSubmitGuardModal(false);
    setShowZeroPriceWarningModal(false);
    setShowDetailSubmitConfirmModal(false);
    setShowFutureDateBlocker(false);
    setShowCancelledWOBlocker(false);
  }, []);

  return {
    // Modal State
    showSubmitGuardModal,
    setShowSubmitGuardModal,
    showZeroPriceWarningModal,
    setShowZeroPriceWarningModal,
    showDetailSubmitConfirmModal,
    setShowDetailSubmitConfirmModal,
    showFutureDateBlocker,
    setShowFutureDateBlocker,
    showCancelledWOBlocker,
    setShowCancelledWOBlocker,
    cancelledWOsFound,

    // Handlers
    handleDetailSubmitClick,
    closeAllModals,
    validateDetailRequiredInfo,
  };
};
