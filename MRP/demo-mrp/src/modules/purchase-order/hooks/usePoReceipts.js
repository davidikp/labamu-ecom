import { useState, useMemo, useCallback, useEffect } from "react";
import {
  buildReceiptStateFromLines,
  buildReceiptActivityLogs,
} from "../utils/purchaseOrderDetailUtils";
import { normalizeProofDocuments } from "../../../utils/upload/uploadUtils";
import { MOCK_WO_TABLE_DATA } from "../../../modules/work-order/mock/workOrderMocks";

export const usePoReceipts = ({
  initialLines = [],
  initialLogs = [],
  currentStatus = "Draft",
  currentBadge = "grey",
  poNumber = "",
  vendorName = "",
} = {}) => {
  // --- Receipt State ---
  const [receiptLines, setReceiptLines] = useState([]);
  const [receiptLogs, setReceiptLogs] = useState([]);
  const [receiptReceivedBy, setReceiptReceivedBy] = useState("Natasha Smith");
  const [receiptNotes, setReceiptNotes] = useState("");
  const [receiptErrors, setReceiptErrors] = useState({});
  const [receiptProofDocuments, setReceiptProofDocuments] = useState([]);
  const [receiptProofUploadError, setReceiptProofUploadError] = useState("");
  const [receiptProofDescriptionErrors, setReceiptProofDescriptionErrors] = useState({});

  // --- Modal Visibility State ---
  const [showConfirmReceiptModal, setShowConfirmReceiptModal] = useState(false);
  const [showAdjustWoModal, setShowAdjustWoModal] = useState(false);
  const [showAutoAdjustWoMessage, setShowAutoAdjustWoMessage] = useState(false);

  // Initialize from displayData or initial props
  useEffect(() => {
    const { receiptLines: lines, receiptLogs: logs } = buildReceiptStateFromLines(
      initialLines,
      currentStatus,
      initialLogs
    );
    setReceiptLines(lines);
    setReceiptLogs(logs);
  }, [initialLines, initialLogs, currentStatus]);

  // --- Derived State ---
  const isReceiptFullyReceived = useMemo(() =>
    receiptLines.length > 0 &&
    receiptLines.every((line) => {
      const remainingQty = Math.max(
        (Number(line.orderedQty) || 0) - (Number(line.receivedQty) || 0),
        0
      );
      return remainingQty === 0;
    }), [receiptLines]);

  const canConfirmReceipt = useMemo(() => 
    currentStatus === "Issued" && !isReceiptFullyReceived,
    [currentStatus, isReceiptFullyReceived]
  );

  const receiptActivityLogs = useMemo(() => 
    buildReceiptActivityLogs(receiptLogs),
    [receiptLogs]
  );

  const groupedReceiptLogs = useMemo(() => {
    return receiptLogs.reduce((acc, log) => {
      // Skip activity logs from being rendered in the receipt logs table
      if (log.title && log.title !== "Receipt Confirmed") {
        return acc;
      }
      
      const key = log.receiptNumber || log.id;
      const existing = acc.find((entry) => entry.receiptNumber === key);
      const normalizedProofDocuments = normalizeProofDocuments(
        log.proofDocuments || log.attachments,
        log.proof
      );
      if (existing) {
        existing.items = [...(existing.items || []), ...(log.items || [])];
        existing.proofDocuments = [
          ...(existing.proofDocuments || []),
          ...normalizedProofDocuments,
        ];
        return acc;
      }
      acc.push({ ...log, receiptNumber: key, proofDocuments: normalizedProofDocuments });
      return acc;
    }, []);
  }, [receiptLogs]);

  // --- Handlers ---
  const updateReceiptLine = useCallback((lineId, value) => {
    setReceiptLines((prev) =>
      prev.map((line) =>
        line.id === lineId ? { ...line, receiveNow: value } : line
      )
    );
    setReceiptErrors((prev) => ({ ...prev, [lineId]: "", _global: "" }));
  }, []);

  const handleReceiptProofFilesSelected = useCallback((files) => {
    const incomingFiles = Array.from(files || []);
    if (incomingFiles.length === 0) return;

    const newDocs = incomingFiles.map((file) => ({
      id: `proof-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      fileObject: file,
      description: "",
    }));

    setReceiptProofDocuments((prev) => [...prev, ...newDocs]);
    setReceiptProofUploadError("");
  }, []);

  const updateReceiptProofDescription = useCallback((docId, value) => {
    setReceiptProofDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, description: value } : doc
      )
    );
    setReceiptProofUploadError("");
    setReceiptProofDescriptionErrors((prev) => ({ ...prev, [docId]: "" }));
  }, []);

  const removeReceiptProofDocument = useCallback((docId) => {
    setReceiptProofDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    setReceiptProofDescriptionErrors((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
    setReceiptProofUploadError("");
  }, []);

  const handleReceiptConfirmClick = useCallback(() => {
    const nextErrors = {};
    let hasValue = false;
    let totalReceiveNow = 0;
    let isWoAdjustmentNeeded = false;

    receiptLines.forEach((line) => {
      const receiveNow = Number(line.receiveNow) || 0;
      if (receiveNow < 0) {
        nextErrors[line.id] = "Value cannot be negative";
      } else if (receiveNow > 0) {
        hasValue = true;
        totalReceiveNow += receiveNow;
        const ordered = Number(line.orderedQty) || 0;
        const received = Number(line.receivedQty) || 0;
        if (received + receiveNow > ordered) {
          nextErrors[line.id] = "Quantity exceeds remaining";
        } else if (line.assignmentId && line.assignmentId !== "-" && line.woRef && line.woRef !== "-") {
          const woData = MOCK_WO_TABLE_DATA.find((w) => w.wo === line.woRef);
          if (woData && woData.vendors) {
            const vendor = woData.vendors.find(v => v.assignmentId === line.assignmentId);
            if (vendor) {
              const vendorSentOutput = (vendor.sendHistory || []).reduce(
                (sum, sh) => sum + (Number(sh.amount) || 0),
                0
              );
              const vendorReceivedOutput = Number(vendor.receivedOutput) || 0;
              const availToReceive = Math.max(0, vendorSentOutput - vendorReceivedOutput);
              if (vendorSentOutput === 0) {
                nextErrors[line.id] = "Items must be released to vendor before receipt";
              } else if (receiveNow > availToReceive) {
                nextErrors[line.id] = "Quantity exceeds avail to receive";
              }
            }
          }
        }

        // Work Order Adjustment Check
        if (line.type === "wo" || (line.woRef && line.woRef !== "-")) {
          const woData = MOCK_WO_TABLE_DATA.find((w) => w.wo === line.woRef);
          if (woData && woData.routingStages) {
            const routingStages = woData.routingStages;
            const currentTotalReceived = (woData.vendors || []).reduce(
              (sum, v) => sum + (Number(v.receivedOutput) || 0),
              0
            );
            const totalAfterThisReceipt = currentTotalReceived + receiveNow;
            
            const outsourceSteps = woData.outsourceSteps || [];
            if (outsourceSteps.length > 0) {
              const minStep = Math.min(...outsourceSteps);
              const stageIndex = routingStages.findIndex((s) => s.step === minStep);
              if (stageIndex > 0) {
                const prevStage = routingStages[stageIndex - 1];
                const prevComp = Number(prevStage.totalComp || prevStage.comp || 0);
                if (prevComp < totalAfterThisReceipt) {
                  isWoAdjustmentNeeded = true;
                }
              }
            }
          }
        }
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setReceiptErrors(nextErrors);
      return;
    }

    if (!hasValue) {
      setReceiptErrors({ _global: "Fill at least one Receive Now field to proceed" });
      return;
    }

    setReceiptProofUploadError("");
    setReceiptProofDescriptionErrors({});
    
    if (isWoAdjustmentNeeded) {
      setShowAdjustWoModal(true);
    } else {
      setShowAutoAdjustWoMessage(false);
      setShowConfirmReceiptModal(true);
    }
  }, [receiptLines, initialLines]);

  const handleContinueFromAdjustWo = useCallback(() => {
    setShowAdjustWoModal(false);
    setShowAutoAdjustWoMessage(true);
    setShowConfirmReceiptModal(true);
  }, []);

  const resetReceiptState = useCallback(() => {
    setReceiptProofDocuments([]);
    setReceiptProofUploadError("");
    setReceiptProofDescriptionErrors({});
    setReceiptNotes("");
    setShowConfirmReceiptModal(false);
    setShowAutoAdjustWoMessage(false);
  }, []);

  return {
    // State
    receiptLines,
    setReceiptLines,
    receiptLogs,
    setReceiptLogs,
    receiptReceivedBy,
    setReceiptReceivedBy,
    receiptNotes,
    setReceiptNotes,
    receiptErrors,
    setReceiptErrors,
    receiptProofDocuments,
    setReceiptProofDocuments,
    receiptProofUploadError,
    setReceiptProofUploadError,
    receiptProofDescriptionErrors,
    setReceiptProofDescriptionErrors,

    // Modal State
    showConfirmReceiptModal,
    setShowConfirmReceiptModal,
    showAdjustWoModal,
    setShowAdjustWoModal,
    showAutoAdjustWoMessage,
    setShowAutoAdjustWoMessage,

    // Derived
    isReceiptFullyReceived,
    canConfirmReceipt,
    receiptActivityLogs,
    groupedReceiptLogs,

    // Handlers
    updateReceiptLine,
    handleReceiptProofFilesSelected,
    updateReceiptProofDescription,
    removeReceiptProofDocument,
    handleReceiptConfirmClick,
    handleContinueFromAdjustWo,
    resetReceiptState,
  };
};
