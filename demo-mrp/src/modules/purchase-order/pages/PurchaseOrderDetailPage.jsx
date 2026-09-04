import React, { useState, useEffect, useRef, useMemo } from "react";

// Icons
import { ImageAssetIcon, HelpCircle } from "../../../components/icons/Icons.jsx";

// Constants
import {
  FILE_DESCRIPTION_MAX_LENGTH,
  MAX_PROOF_UPLOAD_FILES,
} from "../../../constants/appConstants.js";

// Mock Data
import { MOCK_COMPANY } from "../../../data/company.js";
import {
  MOCK_WO_TABLE_DATA,
} from "../../../modules/work-order/mock/workOrderMocks.js";
import {
  MOCK_PO_DOCUMENTS,
  MOCK_PO_TABLE_DATA,
} from "../../../modules/purchase-order/mock/purchaseOrderMocks.js";
import { MOCK_MATERIALS_DATA } from "../../../modules/materials/mock/materialsMocks.js";
import { MOCK_STOCK_BATCHES } from "../../../modules/materials/mock/batchesMocks.js";
import { MOCK_STOCK_TRANSACTIONS } from "../../../modules/materials/mock/transactionsMocks.js";

// Components
import { usePoDocuments } from "../../../modules/purchase-order/hooks/usePoDocuments.js";
import { usePoReceipts } from "../../../modules/purchase-order/hooks/usePoReceipts.js";
import { usePoInvoices } from "../../../modules/purchase-order/hooks/usePoInvoices.js";
import { usePoVersions } from "../../../modules/purchase-order/hooks/usePoVersions.js";
import { usePoSubmissionFlow } from "../../../modules/purchase-order/hooks/usePoSubmissionFlow.js";
import { usePoDecisionFlow } from "../../../modules/purchase-order/hooks/usePoDecisionFlow.js";
import { DocumentTypeBadge } from "../../../modules/purchase-order/components/DocumentTypeBadge.jsx";
import PoDocumentsTab from "../../../modules/purchase-order/components/detail/PoDocumentsTab.jsx";
import PoReceiptsTab from "../../../modules/purchase-order/components/detail/PoReceiptsTab.jsx";
import PoInvoicePaymentTab from "../../../modules/purchase-order/components/detail/PoInvoicePaymentTab.jsx";
import PoThreeWayMatchTab from "../../../modules/purchase-order/components/detail/PoThreeWayMatchTab.jsx";
import PoDetailHeader from "../../../modules/purchase-order/components/detail/PoDetailHeader.jsx";
import PoDocumentModals from "../../../modules/purchase-order/components/detail/modals/PoDocumentModals.jsx";
import PoReceiptModals from "../../../modules/purchase-order/components/detail/modals/PoReceiptModals.jsx";
import PoInvoiceDetailModals from "../../../modules/purchase-order/components/detail/modals/PoInvoiceDetailModals.jsx";
import PoInvoicePaymentManagementModals from "../../../modules/purchase-order/components/detail/modals/PoInvoicePaymentManagementModals.jsx";
import PoActionValidationModals from "../../../modules/purchase-order/components/detail/modals/PoActionValidationModals.jsx";

// Shared Components
import {
  Button,
  StatusBadge,
  TableSearchField,
  Tooltip,
  LabelValue,
  ProofDocumentList,
  SectionCard,
  Card,
  cellStyle,
  systemTableShellStyle,
  systemTableHeaderCellStyle,
  systemTableCellStyle,
  systemTableEmptyStateStyle,
  poReferenceTableFrameStyle,
  poReferenceTableScrollerStyle,
  poReferenceTableInnerStyle,
  poReferenceTableHeaderRowStyle,
  poReferenceTableRowStyle,
  poReferenceTableHeaderCellStyle,
  poReferenceTableCellStyle,
  poReferenceTableEmptyStateStyle,
  tabButtonStyle
} from "../components/detail/shared/PoDetailSharedComponents.jsx";

// Utils
import {
  buildPoLinkSnapshot,
  ensureCompletedLogIsLatest,
  formatActivityTimestamp,
} from "../../../modules/purchase-order/utils/purchaseOrderDetailUtils.js";
import { buildPurchaseOrderPdfExportData, exportPurchaseOrderPdf } from "../../../modules/purchase-order/utils/purchaseOrderPdfExport.js";
import {
  formatCurrency,
  formatNumberWithCommas,
  parseNumberFromCommas,
} from "../../../utils/format/formatUtils.js";
import {
  formatIsoDateString,
} from "../../../utils/date/dateUtils.js";
import {
  formatUploadFileSize,
  getImageUploadPreviewUrl,
  normalizeProofDocuments,
} from "../../../utils/upload/uploadUtils.js";

// Common UI Components
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Sidebar } from "../../../components/layout/Sidebar.jsx";
import { addWoActivityLog } from "../../work-order/pages/WorkOrderDetailPage.jsx";

export const PurchaseOrderDetailPage = ({
  onNavigate,
  initialData,
  poApprovalSettings,
  isSidebarCollapsed = false,
  showPoSnackbar,
}) => {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  const navigateWithReset = (cb, ...args) => {
    scrollToTop();
    cb(...args);
  };
  const pageTopRef = useRef(null);
  const [localPoData, setLocalPoData] = useState(() => {
    const pNum =
      typeof initialData === "string" ? initialData : initialData?.poNumber;
    if (pNum) {
      const mockMatch = MOCK_PO_TABLE_DATA.find((p) => p.poNumber === pNum);
      if (
        typeof initialData === "object" &&
        initialData !== null &&
        (initialData.formData || initialData.receiptLines)
      ) {
        const merged = mockMatch ? { ...mockMatch, ...initialData } : initialData;
        // Prefer the live mock's formData lines — they include any newly-injected assignment lines
        if (mockMatch?.formData?.lines?.length) {
          return {
            ...merged,
            formData: {
              ...merged.formData,
              lines: mockMatch.formData.lines,
            },
          };
        }
        return merged;
      }
      return mockMatch || initialData;
    }
    return initialData;
  });

  const [returnData, setReturnData] = useState(() => initialData?.returnTo || null);

  useEffect(() => {
    if (initialData?.returnTo) {
      setReturnData(initialData.returnTo);
    }
  }, [initialData]);

  useEffect(() => {
    const pNum =
      typeof initialData === "string" ? initialData : initialData?.poNumber;
    if (pNum) {
      const mockMatch = MOCK_PO_TABLE_DATA.find((p) => p.poNumber === pNum);
      if (
        typeof initialData === "object" &&
        initialData !== null &&
        (initialData.formData || initialData.receiptLines)
      ) {
        const merged = mockMatch ? { ...mockMatch, ...initialData } : initialData;
        // Prefer the live mock's formData lines — they include any newly-injected assignment lines
        if (mockMatch?.formData?.lines?.length) {
          setLocalPoData({
            ...merged,
            formData: {
              ...merged.formData,
              lines: mockMatch.formData.lines,
            },
          });
        } else {
          setLocalPoData(merged);
        }
      } else {
        setLocalPoData(mockMatch || initialData);
      }
    } else {
      setLocalPoData(initialData);
    }
  }, [initialData]);

  const {
    versions,
    latestVersionNum,
    selectedVersionNum,
    setSelectedVersionNum,
    isVersionMenuOpen,
    setIsVersionMenuOpen,
    displayVersionNum,
    isHistoricalVersion,
    displayData,
    handleVersionChange,
  } = usePoVersions({ basePoData: localPoData });

  const poNumber = typeof initialData === 'string' ? initialData : (initialData?.poNumber || "PO-202603-0001");
  const [currentStatus, setCurrentStatus] = useState(
    displayData?.status || "Draft"
  );
  const [currentBadge, setCurrentBadge] = useState(
    displayData?.sBadge || "grey"
  );
  const formData = displayData?.formData || null;
  useEffect(() => {
    if (displayData) {
      setCurrentStatus(displayData.status || "Draft");
      setCurrentBadge(displayData.sBadge || "grey");
    }
  }, [displayData]);

  const hasDraftData = !!formData;
  const currency = hasDraftData ? formData?.currency || "IDR" : "IDR";
  const displayValue = (value, fallback = "-") => {
    if (value === undefined || value === null) return fallback;
    if (typeof value === "string" && value.trim() === "") return fallback;
    return value;
  };
  const createdDate = hasDraftData
    ? displayValue(formData?.poDate)
    : displayData?.createdDate || "2026-03-20";

  const mockLines = useMemo(() => {
    const lines = hasDraftData
      ? (formData?.lines || []).map((line, index) => ({
        ...line,
        id: line.id || `po-line-${index}`,
        item: line.item || `Item ${index + 1}`,
        sku: line.sku || "-",
        qty: parseFloat(line.qty) || 0,
        price: parseFloat(line.price) || 0,
      }))
      : displayData?.lines || [];

    return [...lines].sort((a, b) => {
      const typeWeight = { wo: 1, material: 2, manual: 3 };
      const aType = typeWeight[a.type] || 99;
      const bType = typeWeight[b.type] || 99;
      if (aType !== bType) return aType - bType;

      const aRef = a.woRef && a.woRef !== "-" ? a.woRef : "";
      const bRef = b.woRef && b.woRef !== "-" ? b.woRef : "";
      if (aRef < bRef) return -1;
      if (aRef > bRef) return 1;
      return 0;
    });
  }, [hasDraftData, formData, displayData]);

  const subtotal = useMemo(() => {
    return mockLines.reduce((sum, line) => sum + (line.qty || 0) * (line.price || 0), 0);
  }, [mockLines]);

  const tax = useMemo(() => {
    if (hasDraftData) {
      const taxRate = parseFloat(formData?.taxRate) || 0;
      return subtotal * (taxRate / 100);
    }
    return displayData?.tax || 0;
  }, [hasDraftData, formData, subtotal, displayData]);

  const fees = useMemo(() => {
    if (hasDraftData) {
      return (formData?.feeLines || []).reduce(
        (sum, fee) => sum + (parseFloat(fee.amount) || 0),
        0
      );
    }
    return displayData?.fees || 0;
  }, [hasDraftData, formData, displayData]);

  const total = subtotal + tax + fees;

  const summaryFeeRows = useMemo(() => {
    if (hasDraftData) {
      return (formData?.feeLines || []).length > 0
        ? (formData?.feeLines || []).map((fee, index) => ({
            id: fee.id || `summary-fee-${index}`,
            name: displayValue(fee.name, `Fee ${index + 1}`),
            amount: parseFloat(fee.amount) || 0,
          }))
        : [{ id: "summary-fee-default", name: "Fees", amount: fees }];
    }
    return [{ id: "summary-fee-default", name: "Fees", amount: fees }];
  }, [hasDraftData, formData, fees, displayValue]);
  const [showActionToast, setShowActionToast] = useState(false);
  const [actionToastMessage, setActionToastMessage] = useState("");
  const [actionToastVariant, setActionToastVariant] = useState("success");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (isHistoricalVersion && activeTab !== "details") {
      setActiveTab("details");
    }
  }, [isHistoricalVersion, activeTab]);
  const initialDocuments = useMemo(() => displayData?.attachments || displayData?.formData?.documents || MOCK_PO_DOCUMENTS, [displayData]);
  const {
    documents,
    setDocuments,
    documentActivityLogs,
    setDocumentActivityLogs,
    filteredDocuments,
    documentTypeFilterOptions,
    getDocumentTypeLabel,
    toggleDocumentTypeFilter,
    documentSearch,
    setDocumentSearch,
    documentTypeFilters,
    setDocumentTypeFilters,
    documentView,
    setDocumentView,
    showDocumentFilterMenu,
    setShowDocumentFilterMenu,
    documentFilterMenuPosition,
    documentFilterTriggerRef,
    updateDocumentFilterMenuPosition,
    openDocumentMenuId,
    setOpenDocumentMenuId,
    documentMenuPosition,
    openDocumentActionMenu,
    selectedDocumentId,
    setSelectedDocumentId,
    handleDocumentAction,
    showUploadDocumentModal,
    setShowUploadDocumentModal,
    documentUploadFileName,
    documentUploadFileSize,
    documentUploadFileObject,
    documentUploadDescription,
    setDocumentUploadDescription,
    documentUploadDocumentType,
    setDocumentUploadDocumentType,
    documentUploadError,
    documentUploadDescriptionError,
    documentUploadTypeError,
    documentUploadCardFile,
    resetDocumentUploadState,
    handleDocumentUploadFileSelection,
    handleUploadDocument,
    showRenameDocumentModal,
    setShowRenameDocumentModal,
    renameDocumentValue,
    setRenameDocumentValue,
    renameDocumentError,
    setRenameDocumentError,
    editDocumentDescriptionValue,
    setEditDocumentDescriptionValue,
    editDocumentDescriptionError,
    editDocumentTypeValue,
    setEditDocumentTypeValue,
    handleConfirmRenameDocument,
    showDeleteDocumentModal,
    setShowDeleteDocumentModal,
    handleConfirmDeleteDocument,
    showDocumentToast,
    setShowDocumentToast,
    documentToastMessage,
    documentToastVariant,
    showToast,
  } = usePoDocuments({
    initialDocuments,
    initialLogs: [],
    currentStatus,
  });
  const initialReceiptLines = useMemo(() => {
    const lines = displayData?.receiptLines || 
      displayData?.formData?.receiptLines || 
      displayData?.lines || 
      displayData?.formData?.lines || 
      [];
    return [...lines].sort((a, b) => {
      const typeWeight = { wo: 1, material: 2, manual: 3 };
      const aType = typeWeight[a.type] || 99;
      const bType = typeWeight[b.type] || 99;
      if (aType !== bType) return aType - bType;

      const aRef = a.woRef && a.woRef !== "-" ? a.woRef : "";
      const bRef = b.woRef && b.woRef !== "-" ? b.woRef : "";
      if (aRef < bRef) return -1;
      if (aRef > bRef) return 1;
      return 0;
    });
  }, [displayData]);
  const initialReceiptLogs = useMemo(() => displayData?.receiptLogs || displayData?.formData?.receiptLogs || [], [displayData]);

  const {
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
    showConfirmReceiptModal,
    setShowConfirmReceiptModal,
    showAdjustWoModal,
    setShowAdjustWoModal,
    showAutoAdjustWoMessage,
    setShowAutoAdjustWoMessage,
    isReceiptFullyReceived,
    canConfirmReceipt,
    receiptActivityLogs,
    groupedReceiptLogs,
    updateReceiptLine,
    handleReceiptProofFilesSelected,
    updateReceiptProofDescription,
    removeReceiptProofDocument,
    handleReceiptConfirmClick,
    handleContinueFromAdjustWo,
    resetReceiptState,
  } = usePoReceipts({
    initialLines: initialReceiptLines,
    initialLogs: initialReceiptLogs,
    currentStatus,
    currentBadge,
    poNumber,
    vendorName: initialData?.vendorName,
  });

  const initialInvoices = useMemo(() => displayData?.invoices || [], [displayData]);
  const initialPayments = useMemo(() => displayData?.payments || [], [displayData]);
  const initialInvoiceLogs = useMemo(() => [], []);

  const {
    invoices,
    setInvoices,
    payments,
    setPayments,
    invoicePaymentLogs,
    setInvoicePaymentLogs,
    invoiceSearch,
    setInvoiceSearch,
    invoiceRowsPerPage,
    setInvoiceRowsPerPage,
    invoiceCurrentPage,
    setInvoiceCurrentPage,
    activeInvoiceTab,
    setActiveInvoiceTab,
    expandedInvoiceItems,
    setExpandedInvoiceItems,
    expandedInvoicePayments,
    setExpandedInvoicePayments,
    showInvoiceDetailDrawer,
    setShowInvoiceDetailDrawer,
    selectedInvoiceForDetail,
    setSelectedInvoiceForDetail,
    showPaymentHistoryModal,
    setShowPaymentHistoryModal,
    selectedInvoiceForHistory,
    setSelectedInvoiceForHistory,
    showAddInvoiceDrawer,
    setShowAddInvoiceDrawer,
    showAddPaymentDrawer,
    setShowAddPaymentDrawer,
    selectedInvoiceForPayment,
    setSelectedInvoiceForPayment,
    showDeleteInvoiceConfirm,
    setShowDeleteInvoiceConfirm,
    showVoidConfirmModal,
    setShowVoidConfirmModal,
    paymentToVoid,
    setPaymentToVoid,
    addInvoiceFormData,
    setAddInvoiceFormData,
    paymentFormData,
    setPaymentFormData,
    formErrors,
    setFormErrors,
    paymentFormErrors,
    setPaymentFormErrors,
    isEditingInvoice,
    setIsEditingInvoice,
    autoPrefillInvoice,
    setAutoPrefillInvoice,
    autoPrefillPayment,
    setAutoPrefillPayment,
    getInvoiceMetrics,
    getAgingStatus,
    getInvoiceStatus,
    addInvoicePaymentLog,
    totalInvoiced,
    totalPaid,
    outstandingAmount,
    paidRatio,
    overdueAmount,
    poInvoicedRatio,
    poGap,
    calculatedDueDate,
    simulateInvoiceOcr,
    simulatePaymentOcr,
    handleEditInvoice,
    handleAddInvoice,
    handleDeleteInvoice,
    handleAddPayment,
    handleVoidPayment,
    showExceedConfirmModal,
    setShowExceedConfirmModal,
    showItemQtyExceedConfirmModal,
    setShowItemQtyExceedConfirmModal,
    exceededItems,
    saveInvoice,
    checkPoValueAndSave,
    deleteInvoiceReason,
    setDeleteInvoiceReason,
    deleteInvoiceReasonError,
    setDeleteInvoiceReasonError,
    voidPaymentReason,
    setVoidPaymentReason,
    voidPaymentReasonError,
    setVoidPaymentReasonError,
  } = usePoInvoices({
    initialInvoices,
    initialPayments,
    initialLogs: initialInvoiceLogs,
    mockLines,
    currency,
    poTotal: total,
    poNumber,
    vendorName: initialData?.vendorName,
    showToast,
    onAddDocument: (doc) => setDocuments((prev) => [doc, ...prev]),
  });

  const [threeWaysMatchCurrentPage, setThreeWaysMatchCurrentPage] = useState(1);
  const [threeWaysMatchRowsPerPage, setThreeWaysMatchRowsPerPage] = useState(25);

  const getCurrentLogTimestamp = () => {
    return formatActivityTimestamp(new Date());
  };

  // Redundant toast logic removed, now handled by showPoSnackbar in PurchaseOrderCreatePage
  useEffect(() => {
    if (initialData?.showDraftToast) {
      if (pageTopRef.current) {
        pageTopRef.current.scrollIntoView({ behavior: "auto", block: "start" });
      } else if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    }
  }, [initialData]);

  const vendorInfo = hasDraftData
    ? {
      name: displayValue(formData?.vendorName),
      phone: displayValue(formData?.vendorDetails?.phone),
      email: displayValue(formData?.vendorDetails?.email),
      address: displayValue(formData?.vendorDetails?.address),
    }
    : {
      name: initialData?.vendorName || "PT Mitra Sejahtera",
      phone: "08123456789",
      email: "contact@mitra.com",
      address: "Jl. Sudirman No.1, Jakarta Pusat, 10220",
    };

  const shipToInfo = hasDraftData
    ? {
      name: displayValue(formData?.shipTo?.name),
      phone: displayValue(formData?.shipTo?.phone),
      email: displayValue(formData?.shipTo?.email),
      address: displayValue(formData?.shipTo?.address),
    }
    : {
      name: "Labamu Manufacturing",
      phone: "+62 21 555 1234",
      email: "procurement@labamu.com",
      address:
        "Jl. Industri Utama Kav 9, South Tangerang, Banten, Indonesia 15320",
    };


  const threeWaysMatchData = useMemo(() => {
    const linesToProcess = [...mockLines];
    const allKnownLines = new Map();

    if (versions && versions.length > 0) {
      versions.forEach(v => {
        (v.data?.lines || []).forEach(l => {
          if (!allKnownLines.has(l.id)) allKnownLines.set(l.id, l);
        });
      });
    }
    if (initialData?.lines) {
      initialData.lines.forEach(l => {
        if (!allKnownLines.has(l.id)) allKnownLines.set(l.id, l);
      });
    }
    if (localPoData?.lines) {
      localPoData.lines.forEach(l => {
        if (!allKnownLines.has(l.id)) allKnownLines.set(l.id, l);
      });
    }

    allKnownLines.forEach((origLine) => {
      if (!mockLines.find(l => l.id === origLine.id)) {
        const hasInvoice = invoices.some(inv => (inv.itemLines || []).some(il => String(il.id) === String(origLine.id) || String(il.id) === `l${origLine.id}`));
        if (hasInvoice) {
          if (!linesToProcess.find(l => l.id === origLine.id)) {
            linesToProcess.push({
              ...origLine,
              qty: 0,
              isDeleted: true
            });
          }
        }
      }
    });

    return linesToProcess.map((line) => {
      const receiptLine = receiptLines.find((rl) => rl.id === line.id);
      const receivedQty = receiptLine ? receiptLine.receivedQty : 0;

      let invoicedQty = 0;
      invoices.forEach((inv) => {
        (inv.itemLines || []).forEach((il) => {
          const ilIdStr = String(il.id);
          if (ilIdStr === String(line.id) || ilIdStr === `l${line.id}`) {
            invoicedQty += Number(il.qty) || 0;
          }
        });
      });

      return {
        ...line,
        receivedQty,
        invoicedQty,
      };
    });
  }, [mockLines, receiptLines, invoices, initialData, versions, localPoData]);
  const detailNotes = hasDraftData
    ? displayValue(formData?.notes)
    : "Please ensure all items are packaged securely to prevent damage during transit. Deliveries are only accepted between 08:00 AM and 04:00 PM on weekdays.";
  const detailTerms = hasDraftData
    ? displayValue(formData?.terms)
    : "Payment within 30 days from invoice date. Vendor must deliver goods according to the agreed schedule and quantity.";
  const currencyLabel = hasDraftData
    ? formData?.currency === "USD"
      ? "USD - US Dollar"
      : formData?.currency === "IDR"
        ? "IDR - Indonesian Rupiah"
        : displayValue(formData?.currency)
    : "IDR - Indonesian Rupiah";
  const expectedDeliveryDate = hasDraftData
    ? displayValue(formData?.deliveryDate)
    : "2026-04-10";





  const computePaymentStatus = (invList, payList) => {
    if (!invList || invList.length === 0) return "Unpaid";
    const today = new Date();
    let allPaid = true;
    let anyOverdue = false;
    let anyPartial = false;
    for (const inv of invList) {
      const paid = payList.filter(p => !p.isVoid && p.invoiceId === inv.id).reduce((s, p) => s + (p.amount || 0), 0);
      const outstanding = Math.max((inv.amount || 0) - paid, 0);
      const isOverdue = new Date(inv.dueDate) < today && outstanding > 0;
      if (outstanding > 0) allPaid = false;
      if (isOverdue) anyOverdue = true;
      if (paid > 0 && outstanding > 0) anyPartial = true;
    }
    if (allPaid) return "Paid";
    if (anyOverdue) return "Overdue";
    if (anyPartial) return "Partially Paid";
    return "Unpaid";
  };

  const showHeaderEdit =
    currentStatus === "Draft" || currentStatus === "Need Revision";
  const showHeaderExportPdf =
    currentStatus === "Completed" ||
    currentStatus === "Waiting for Approval" ||
    currentStatus === "Issued" ||
    currentStatus === "Canceled";
  const showFooterSubmit =
    currentStatus === "Draft" || currentStatus === "Need Revision";
  const showFooterApprovalActions = currentStatus === "Waiting for Approval";
  const hasReceiptHistory =
    receiptLogs.some((log) => !!log.receiptNumber) ||
    (formData?.receiptLogs || []).some((log) => !!log.receiptNumber);
  const showFooterIssuedCancel =
    currentStatus === "Issued" && !hasReceiptHistory;
  const resolvePoStatusKey = (status) => {
    if (status === "Waiting for Approval") return "ready_to_send";
    if (status === "Issued") return "issued";
    if (status === "Completed") return "completed";
    if (status === "Need Revision") return "need_revision";
    if (status === "Canceled") return "rejected";
    return "draft";
  };
  const {
    showSubmitGuardModal,
    setShowSubmitGuardModal,
    showZeroPriceWarningModal,
    setShowZeroPriceWarningModal,
    showDetailSubmitConfirmModal,
    setShowDetailSubmitConfirmModal,
    showFutureDateBlocker,
    setShowFutureDateBlocker,
    showCanceledWOBlocker,
    setShowCanceledWOBlocker,
    canceledWOsFound,
    handleDetailSubmitClick,
    closeAllModals,
    validateDetailRequiredInfo,
  } = usePoSubmissionFlow({
    formData: displayData?.formData,
    initialData,
    mockLines,
    currentStatus,
    poApprovalSettings,
    createdDate,
    currencyLabel,
  });
  const {
    isDecisionModalOpen,
    setIsDecisionModalOpen,
    decisionType,
    setDecisionType,
    decisionComment,
    setDecisionComment,
    decisionError,
    setDecisionError,
    revisionMessage,
    setRevisionMessage,
    canceledMessage,
    setCanceledMessage,
    approvalComment,
    setApprovalComment,
    approvalCommentRequired,
    openDecisionModal,
    closeDecisionModal,
    getDecisionMeta,
  } = usePoDecisionFlow({
    poApprovalSettings,
    currentStatus,
  });
  const buildCurrentPoSnapshot = (overrides = {}) => {
    const snapshotStatus = overrides.status || currentStatus;
    const snapshotStatusKey =
      overrides.statusKey || resolvePoStatusKey(snapshotStatus);
    const snapshotBadge = overrides.sBadge || currentBadge;
    const snapshotReceiptLogs = overrides.receiptLogs || receiptLogs;
    const snapshotDocuments = overrides.documents || documents;
    const snapshotReceiptLines = overrides.receiptLines || receiptLines;
    const receiptLineMap = new Map(
      (snapshotReceiptLines || []).map((line) => [line.id, line])
    );
    const snapshotLines = (mockLines || []).map((line) => {
      const receiptLine = receiptLineMap.get(line.id);
      return {
        ...line,
        receivedQty: receiptLine
          ? Number(receiptLine.receivedQty || 0)
          : Number(line.receivedQty || 0),
      };
    });

    return buildPoLinkSnapshot({
      poNumber,
      vendorName: vendorInfo.name !== "-" ? vendorInfo.name : initialData?.vendorName || "",
      amount: formatCurrency(total, currency),
      createdDate,
      status: snapshotStatus,
      statusKey: snapshotStatusKey,
      sBadge: snapshotBadge,
      formData: {
        ...(formData || {}),
        vendorName: vendorInfo.name !== "-" ? vendorInfo.name : "",
        vendorDetails: {
          phone: vendorInfo.phone !== "-" ? vendorInfo.phone : "",
          email: vendorInfo.email !== "-" ? vendorInfo.email : "",
          address: vendorInfo.address !== "-" ? vendorInfo.address : "",
        },
        poDate: createdDate !== "-" ? createdDate : "",
        deliveryDate: expectedDeliveryDate ?? "",
        currency,
        shipTo: {
          name: shipToInfo.name !== "-" ? shipToInfo.name : "",
          phone: shipToInfo.phone !== "-" ? shipToInfo.phone : "",
          email: shipToInfo.email !== "-" ? shipToInfo.email : "",
          address: shipToInfo.address !== "-" ? shipToInfo.address : "",
        },
        lines: snapshotLines,
        tax: hasDraftData ? formData?.tax || 0 : 11,
        feeLines: hasDraftData ? formData?.feeLines || [] : [],
        notes: detailNotes !== "-" ? detailNotes : "",
        terms: detailTerms !== "-" ? detailTerms : "",
        receiptLogs: snapshotReceiptLogs,
        documents: snapshotDocuments,
      },
    });
  };

  const clearLinkedWorkOrderVendorPo = (sourceData) => {
    if (!sourceData) return sourceData;

    return {
      ...sourceData,
      vendors: (sourceData.vendors || []).map((vendor) =>
        vendor.poNumber === poNumber
          ? {
              ...vendor,
              poNumber: "",
              isPoApproved: false,
              poStatus: "",
              poBadge: "",
              poStatusKey: "",
              poDetailData: null,
              status: "Waiting",
              receivedOutput: 0,
              receivedDate: "",
              receipts: [],
            }
          : vendor
      ),
    };
  };

  const handlePoAction = (message) => {
    setActionToastVariant("success");
    setActionToastMessage(message);
    setShowActionToast(true);
    setTimeout(() => setShowActionToast(false), 4000);
  };

  const handleExportPdf = async () => {
    if (isExportingPdf || typeof window === "undefined") return;

    const approvedByName = approvalEnabled
      ? approverList[0]?.name || "Approver"
      : "System";

    const exportData = buildPurchaseOrderPdfExportData({
      poNumber,
      createdDate,
      expectedDeliveryDate,
      currency,
      currencyLabel,
      createdBy: requestedBy,
      vendorInfo,
      shipToInfo,
      lines: mockLines,
      subtotal,
      taxRate: hasDraftData ? formData?.tax || 0 : 11,
      summaryFeeRows,
      total,
      notes: detailNotes !== "-" ? detailNotes : "",
      terms: detailTerms !== "-" ? detailTerms : "",
      requestedBy,
      approvedBy: approvedByName,
      approvalEnabled,
      currentStatus,
      company: MOCK_COMPANY,
    });

    setIsExportingPdf(true);
    try {
      await exportPurchaseOrderPdf({ data: exportData });
    } catch (error) {
      console.error("Failed to export purchase order PDF", error);
      setActionToastVariant("error");
      setActionToastMessage(
        "Unable to export Purchase Order PDF. Please try again."
      );
      setShowActionToast(true);
      setTimeout(() => setShowActionToast(false), 4000);
    } finally {
      setIsExportingPdf(false);
    }
  };


  const getApprovedVendorReturnState = (vendor) => {
    const assignedQty = Number(vendor?.output || 0);
    const receivedQty = Number(vendor?.receivedOutput || 0);

    return {
      ...vendor,
      isPoApproved: true,
      status:
        assignedQty > 0 && receivedQty >= assignedQty
          ? "Completed"
          : receivedQty > 0
            ? "Partially Received"
            : "In Progress",
    };
  };

  const syncPoToStockBatches = (action, payload = {}) => {
    const vendorName = vendorInfo.name;
    const poDate = createdDate;
    const expectedDate = expectedDeliveryDate;
    const targetLines = payload.customLines || mockLines;

    targetLines.forEach(line => {
      // Find matching material
      const material = MOCK_MATERIALS_DATA.find(m => m.sku === line.code || m.name === line.item);
      if (!material) return;

      const batchId = `batch-${poNumber}-${line.id}`;
      if (action === 'issue') {
        // Create new batch
        const newBatch = {
          id: batchId,
          materialId: material.id,
          batchNo: `BN-${poNumber.replace('PO-', '')}-${line.id}`,
          initialQty: Number(line.qty) || 0,
          currentQty: 0,
          reservedQty: 0,
          costPerUnit: Number(line.price) || 0,
          purchaseDate: poDate,
          expectedDate: expectedDate,
          receivedDate: "",
          storageLocation: "",
          vendor: vendorName,
          status: "Requested",
          poRef: poNumber,
          attachments: 0
        };
        const existing = MOCK_STOCK_BATCHES.find(b => b.id === batchId);
        if (!existing) {
          MOCK_STOCK_BATCHES.push(newBatch);
        } else {
          existing.initialQty = Number(line.qty) || 0;
          existing.costPerUnit = Number(line.price) || 0;
          existing.vendor = vendorName;
          existing.purchaseDate = poDate;
          existing.expectedDate = expectedDate;
        }
      } else if (action === 'receipt') {
        const batch = MOCK_STOCK_BATCHES.find(b => b.id === batchId);
        if (batch) {
          const receivedNow = payload.receivedNowMap?.[line.id] || 0;
          batch.currentQty += Number(receivedNow);
          if (batch.currentQty > 0) {
            batch.status = "Received";
          }

          // Record transaction
          if (receivedNow > 0) {
            const timestamp = new Date().toISOString();
            const txId = `tx-${Date.now()}-${line.id}`;
            const newTx = {
              id: txId,
              materialId: material.id,
              date: timestamp,
              batchNo: batch.batchNo,
              type: "In",
              quantity: Number(receivedNow),
              unit: material.unit || "pcs",
              workOrder: null,
              product: "-",
              reason: `Received from ${poNumber}`,
              actionBy: receiptReceivedBy || "Admin User"
            };
            MOCK_STOCK_TRANSACTIONS.push(newTx);
          }
        }
      } else if (action === 'complete') {
        const batch = MOCK_STOCK_BATCHES.find(b => b.id === batchId);
        if (batch) {
          batch.status = "Received";
          batch.receivedDate = payload.completedDate || new Date().toISOString().split('T')[0];
        }
      }
    });
  };

  const handleConfirmDetailSubmit = () => {
    const approvalOn = !!poApprovalSettings?.isApprovalActive;
    const nextStatus = approvalOn ? "Waiting for Approval" : "Issued";
    const nextBadge = approvalOn ? "orange" : "blue";
    const nextStatusKey = resolvePoStatusKey(nextStatus);
    const nextPoSnapshot = buildCurrentPoSnapshot({
      status: nextStatus,
      statusKey: nextStatusKey,
      sBadge: nextBadge,
    });

    setCurrentStatus(nextStatus);
    setCurrentBadge(nextBadge);
    
    // Persist to mock data
    const poIndex = MOCK_PO_TABLE_DATA.findIndex(p => p.poNumber === poNumber);
    if (poIndex !== -1) {
      MOCK_PO_TABLE_DATA[poIndex] = {
        ...MOCK_PO_TABLE_DATA[poIndex],
        ...nextPoSnapshot,
        status: nextStatus,
        statusKey: nextStatusKey,
        sBadge: nextBadge
      };
      setLocalPoData(MOCK_PO_TABLE_DATA[poIndex]);
    }

    if (nextStatus === "Issued") {
      syncPoToStockBatches("issue");
    }

    updateMockWoDataWithPoStatus({
      status: nextStatus,
      statusKey: nextStatusKey,
      sBadge: nextBadge,
      receiptLogs: receiptLogs, // assuming it's available, otherwise passing empty is fine since no new logs
    });
    
    setShowDetailSubmitConfirmModal(false);

    if (
      initialData?.from === "work_order_detail" &&
      returnData?.data
    ) {
      const updatedReturnData = {
        ...returnData.data,
        vendors: (returnData.data.vendors || []).map((vendor) =>
          vendor.poNumber === poNumber
            ? {
                ...vendor,
                ...(!approvalOn ? getApprovedVendorReturnState(vendor) : {}),
                poStatus: nextStatus,
                poBadge: nextBadge,
                poStatusKey: nextStatusKey,
                poDetailData: nextPoSnapshot,
              }
            : vendor
        ),
      };

      setReturnData({
        ...returnData,
        data: updatedReturnData,
      });
    }

    handlePoAction(
      approvalOn
        ? "Purchase order successfully submitted"
        : "Purchase order successfully approved"
    );
  };

  const handleEditPo = () => {
    scrollToTop();
    onNavigate("create", {
      source: "edit_purchase_order",
      poNumber,
      status: currentStatus,
      sBadge: currentBadge,
      ...(initialData?.from ? { from: initialData.from } : {}),
      ...(initialData?.returnTo ? { returnTo: initialData.returnTo } : {}),
      ...(initialData?.from === "work_order_detail"
        ? {
          workOrder: {
            wo:
              initialData?.returnTo?.data?.wo ||
              mockLines.find((line) => line.type === "wo")?.woRef ||
              "-",
            product:
              initialData?.returnTo?.data?.product ||
              mockLines.find((line) => line.type === "wo")?.item ||
              "",
            sku:
              initialData?.returnTo?.data?.sku ||
              mockLines.find((line) => line.type === "wo")?.code ||
              "",
            image:
              initialData?.returnTo?.data?.image ||
              mockLines.find((line) => line.type === "wo")?.image ||
              "",
            assignmentId:
              mockLines.find((line) => line.type === "wo")?.assignmentId ||
              "",
          },
          assignedOutput:
            mockLines.find((line) => line.type === "wo")?.qty || 0,
          outsourceSteps: initialData?.returnTo?.data?.outsourceSteps || [],
        }
        : {}),
      formData: {
        vendorName: vendorInfo.name !== "-" ? vendorInfo.name : "",
        vendorDetails: {
          phone: vendorInfo.phone !== "-" ? vendorInfo.phone : "",
          email: vendorInfo.email !== "-" ? vendorInfo.email : "",
          address: vendorInfo.address !== "-" ? vendorInfo.address : "",
        },
        poDate: createdDate !== "-" ? createdDate : "",
        deliveryDate: expectedDeliveryDate ?? "",
        currency: hasDraftData ? formData?.currency : "IDR",
        shipTo: {
          name: shipToInfo.name !== "-" ? shipToInfo.name : "",
          phone: shipToInfo.phone !== "-" ? shipToInfo.phone : "",
          email: shipToInfo.email !== "-" ? shipToInfo.email : "",
          address: shipToInfo.address !== "-" ? shipToInfo.address : "",
        },
        lines: mockLines,
        tax: hasDraftData ? formData?.tax || 0 : 11,
        feeLines: hasDraftData ? formData?.feeLines || [] : [],
        notes: detailNotes !== "-" ? detailNotes : "",
        terms: detailTerms !== "-" ? detailTerms : "",
      },
    });
  };

  const handleRevisePo = () => {
    scrollToTop();
    let logsToPass = [...receiptLogs];
    const hasApprovedLog = logsToPass.some(
      (l) => l.title === "Approved" || (l.title || "").startsWith("Revised to Version")
    );
    if (!hasApprovedLog && currentStatus === "Issued") {
      logsToPass.push({
        name: approvalEnabled ? approverList[0]?.name || "Approver" : "System",
        email: approvalEnabled ? approverList[0]?.email || "-" : "-",
        title: "Approved",
        desc: approvalComment || "",
        timestamp: `${createdDate} at 16:30`,
      });
    }

    onNavigate("create", {
      source: "revise_purchase_order",
      poNumber,
      status: currentStatus,
      sBadge: currentBadge,
      ...(initialData?.from ? { from: initialData.from } : {}),
      ...(initialData?.returnTo ? { returnTo: initialData.returnTo } : {}),
      ...(initialData?.from === "work_order_detail"
        ? {
          workOrder: {
            wo:
              initialData?.returnTo?.data?.wo ||
              mockLines.find((line) => line.type === "wo")?.woRef ||
              "-",
            product:
              initialData?.returnTo?.data?.product ||
              mockLines.find((line) => line.type === "wo")?.item ||
              "",
            sku:
              initialData?.returnTo?.data?.sku ||
              mockLines.find((line) => line.type === "wo")?.code ||
              "",
            image:
              initialData?.returnTo?.data?.image ||
              mockLines.find((line) => line.type === "wo")?.image ||
              "",
            assignmentId:
              mockLines.find((line) => line.type === "wo")?.assignmentId ||
              "",
          },
          assignedOutput:
            mockLines.find((line) => line.type === "wo")?.qty || 0,
          outsourceSteps: initialData?.returnTo?.data?.outsourceSteps || [],
        }
        : {}),
      formData: {
        vendorName: vendorInfo.name !== "-" ? vendorInfo.name : "",
        vendorDetails: {
          phone: vendorInfo.phone !== "-" ? vendorInfo.phone : "",
          email: vendorInfo.email !== "-" ? vendorInfo.email : "",
          address: vendorInfo.address !== "-" ? vendorInfo.address : "",
        },
        poDate: createdDate !== "-" ? createdDate : "",
        deliveryDate: expectedDeliveryDate ?? "",
        currency: hasDraftData ? formData?.currency : "IDR",
        shipTo: {
          name: shipToInfo.name !== "-" ? shipToInfo.name : "",
          phone: shipToInfo.phone !== "-" ? shipToInfo.phone : "",
          email: shipToInfo.email !== "-" ? shipToInfo.email : "",
          address: shipToInfo.address !== "-" ? shipToInfo.address : "",
        },
        lines: mockLines,
        tax: hasDraftData ? formData?.tax || 0 : 11,
        feeLines: hasDraftData ? formData?.feeLines || [] : [],
        notes: detailNotes !== "-" ? detailNotes : "",
        terms: detailTerms !== "-" ? detailTerms : "",
        documents: documents || [],
        invoices: invoices || [],
        payments: payments || [],
        invoicePaymentLogs: invoicePaymentLogs || [],
        receiptLogs: logsToPass,
      },
    });
  };


  const updateMockWoDataWithPoStatus = (statusInfo) => {
    MOCK_WO_TABLE_DATA.forEach(wo => {
      let hasChanges = false;
      const nextVendors = (wo.vendors || []).map(v => {
        if (v.poNumber === poNumber) {
          hasChanges = true;
          const isApproved = statusInfo.status === "Issued" || statusInfo.status === "Completed";
          return {
            ...v,
            ...(isApproved ? getApprovedVendorReturnState(v) : {}),
            isPoApproved: isApproved,
            poStatus: statusInfo.status,
            poBadge: statusInfo.sBadge,
            poStatusKey: statusInfo.statusKey,
            poDetailData: buildCurrentPoSnapshot({
              status: statusInfo.status,
              statusKey: statusInfo.statusKey,
              sBadge: statusInfo.sBadge,
              receiptLogs: statusInfo.receiptLogs,
              revisionMessage: statusInfo.revisionMessage,
              canceledMessage: statusInfo.canceledMessage,
            }),
          };
        }
        return v;
      });
      if (hasChanges) {
        wo.vendors = nextVendors;
      }
    });
  };

  const handleSubmitDecision = () => {
    const meta = getDecisionMeta();
    const trimmedComment = decisionComment.trim();
    if (meta.mandatory && !trimmedComment) {
      setDecisionError("Field cannot be empty");
      return;
    }

    if (decisionType === "cancel") {
      setCurrentStatus("Canceled");
      setCurrentBadge("red");
      setCanceledMessage(trimmedComment);
      setRevisionMessage("");
      setApprovalComment("");

      const log = {
        name: "Natasha Smith",
        email: "natasha.smith@company.com",
        title: "Canceled",
        desc: trimmedComment || "",
        timestamp: formatActivityTimestamp(new Date()),
      };
      const nextReceiptLogs = [log, ...receiptLogs];
      setReceiptLogs(nextReceiptLogs);

      const nextStatusKey = resolvePoStatusKey("Canceled");
      const poIndex = MOCK_PO_TABLE_DATA.findIndex(p => p.poNumber === poNumber);
      if (poIndex !== -1) {
        MOCK_PO_TABLE_DATA[poIndex] = {
          ...MOCK_PO_TABLE_DATA[poIndex],
          ...displayData,
          status: "Canceled",
          statusKey: nextStatusKey,
          sBadge: "red",
          receiptLogs: nextReceiptLogs,
          canceledMessage: trimmedComment,
        };
        setLocalPoData(MOCK_PO_TABLE_DATA[poIndex]);
      }

      updateMockWoDataWithPoStatus({
        status: "Canceled",
        statusKey: nextStatusKey,
        sBadge: "red",
        receiptLogs: nextReceiptLogs,
        canceledMessage: trimmedComment,
      });

      if (
        currentStatus === "Issued" &&
        !hasReceiptHistory &&
        initialData?.from === "work_order_detail" &&
        returnData?.data
      ) {
        setReturnData({
          ...returnData,
          data: clearLinkedWorkOrderVendorPo(returnData.data),
        });
      }

      handlePoAction("Purchase order successfully canceled");
    } else if (decisionType === "revision") {
      setCurrentStatus("Need Revision");
      setCurrentBadge("yellow");
      setRevisionMessage(trimmedComment);
      setCanceledMessage("");
      setApprovalComment("");

      const log = {
        name: "Natasha Smith",
        email: "natasha.smith@company.com",
        title: "Revision Requested",
        desc: trimmedComment || "",
        timestamp: formatActivityTimestamp(new Date()),
      };
      const nextReceiptLogs = [log, ...receiptLogs];
      setReceiptLogs(nextReceiptLogs);

      const nextStatusKey = resolvePoStatusKey("Need Revision");
      const poIndex = MOCK_PO_TABLE_DATA.findIndex(p => p.poNumber === poNumber);
      if (poIndex !== -1) {
        MOCK_PO_TABLE_DATA[poIndex] = {
          ...MOCK_PO_TABLE_DATA[poIndex],
          ...displayData,
          status: "Need Revision",
          statusKey: nextStatusKey,
          sBadge: "yellow",
          receiptLogs: nextReceiptLogs,
          revisionMessage: trimmedComment,
        };
        setLocalPoData(MOCK_PO_TABLE_DATA[poIndex]);
      }

      updateMockWoDataWithPoStatus({
        status: "Need Revision",
        statusKey: nextStatusKey,
        sBadge: "yellow",
        receiptLogs: nextReceiptLogs,
        revisionMessage: trimmedComment,
      });

      if (
        initialData?.from === "work_order_detail" &&
        returnData?.data
      ) {
        const nextPoSnapshot = buildCurrentPoSnapshot({
          status: "Need Revision",
          statusKey: nextStatusKey,
          sBadge: "yellow",
          receiptLogs: nextReceiptLogs,
          revisionMessage: trimmedComment,
        });
        const updatedReturnData = {
          ...returnData.data,
          vendors: (returnData.data.vendors || []).map((vendor) =>
            vendor.poNumber === poNumber
              ? {
                  ...vendor,
                  poStatus: "Need Revision",
                  poBadge: "yellow",
                  poStatusKey: nextStatusKey,
                  poDetailData: nextPoSnapshot,
                }
              : vendor
          ),
        };

        setReturnData({
          ...returnData,
          data: updatedReturnData,
        });
      }

      handlePoAction("Purchase order revision successfully requested");
    } else {
      setCurrentStatus("Issued");
      setCurrentBadge("blue");
      syncPoToStockBatches("issue", { customLines: mockLines });
      setRevisionMessage("");
      setCanceledMessage("");
      setApprovalComment(trimmedComment);

      const versionNum = latestVersionNum;
      const logTitle = versionNum > 1 ? `Revised to Version ${versionNum}.0` : "Approved";

      const approvalLog = {
        name: "Natasha Smith",
        email: "natasha.smith@company.com",
        title: logTitle,
        desc: trimmedComment || "",
        timestamp: formatActivityTimestamp(new Date()),
      };
      const nextReceiptLogs = [approvalLog, ...receiptLogs];
      setReceiptLogs(nextReceiptLogs);

      const poIndex = MOCK_PO_TABLE_DATA.findIndex(p => p.poNumber === poNumber);
      if (poIndex !== -1) {
        MOCK_PO_TABLE_DATA[poIndex] = {
          ...MOCK_PO_TABLE_DATA[poIndex],
          ...displayData,
          status: "Issued",
          statusKey: resolvePoStatusKey("Issued"),
          sBadge: "blue",
          receiptLogs: nextReceiptLogs
        };
        setLocalPoData(MOCK_PO_TABLE_DATA[poIndex]);
      }

      updateMockWoDataWithPoStatus({
        status: "Issued",
        statusKey: resolvePoStatusKey("Issued"),
        sBadge: "blue",
        receiptLogs: nextReceiptLogs,
      });

      if (
        initialData?.from === "work_order_detail" &&
        returnData?.data
      ) {
        const approvedPoSnapshot = buildCurrentPoSnapshot({
          status: "Issued",
          statusKey: resolvePoStatusKey("Issued"),
          sBadge: "blue",
          receiptLogs: nextReceiptLogs,
        });
        const updatedReturnData = {
          ...returnData.data,
          vendors: (returnData.data.vendors || []).map((vendor) =>
            vendor.poNumber === poNumber
              ? {
                  ...vendor,
                  ...getApprovedVendorReturnState(vendor),
                  poStatus: "Issued",
                  poBadge: "blue",
                  poStatusKey: resolvePoStatusKey("Issued"),
                  poDetailData: approvedPoSnapshot,
                }
              : vendor
          ),
        };

        setReturnData({
          ...returnData,
          data: updatedReturnData,
        });
      }

      handlePoAction("Purchase order successfully approved");
    }

    setIsDecisionModalOpen(false);
    setDecisionType(null);
    setDecisionComment("");
    setDecisionError("");
  };

  const handleBackNavigation = () => {
    const activeReturnTo = returnData || initialData?.returnTo;
    if (initialData?.from === "work_order_detail" && activeReturnTo) {
      const nextStatusKey = resolvePoStatusKey(currentStatus);
      const nextPoSnapshot = buildCurrentPoSnapshot({
        status: currentStatus,
        statusKey: nextStatusKey,
        sBadge: currentBadge,
      });

      // Prefer returnData.data (has updated receivedOutput/routingStages from receipt submissions)
      // Fall back to activeReturnTo.data if returnData hasn't been updated yet
      const baseWoData = returnData?.data || activeReturnTo.data || {};

      const nextReturnData = {
        ...baseWoData,
        vendors: (baseWoData.vendors || []).map((vendor) => {
          if (vendor.poNumber !== poNumber) return vendor;
          const isApprovedStatus =
            currentStatus === "Issued" || currentStatus === "Completed";
          return {
            ...vendor,
            ...(isApprovedStatus ? getApprovedVendorReturnState(vendor) : {}),
            isPoApproved: isApprovedStatus,
            poStatus: currentStatus,
            poBadge: currentBadge,
            poStatusKey: nextStatusKey,
            poDetailData: nextPoSnapshot,
          };
        }),
      };
      onNavigate(activeReturnTo.view || "detail", { ...nextReturnData, _navVersion: Date.now() });
      return;
    }
    if (initialData?.from === "order_detail" && activeReturnTo) {
      onNavigate(activeReturnTo.view || "detail", activeReturnTo.data);
      return;
    }
    if (initialData?.from === "material_detail" && activeReturnTo) {
      onNavigate(activeReturnTo.view, activeReturnTo.data);
      return;
    }
    onNavigate("list");
  };


  const approvalEnabled = !!poApprovalSettings?.isApprovalActive;
  const approverList = poApprovalSettings?.approvers?.length
    ? poApprovalSettings.approvers
    : [
      {
        id: "default-approver",
        name: "Natasha Smith",
        email: "natasha.smith@company.com",
        position: "Owner",
      },
    ];
  const requestedBy = "Joko";
  const requestedAt = createdDate;

  const getApprovalRowStatus = () => {
    if (currentStatus === "Issued" || currentStatus === "Completed")
      return { text: "Approved", variant: "green-light" };
    if (currentStatus === "Canceled")
      return { text: "Rejected", variant: "red-light" };
    if (currentStatus === "Need Revision")
      return { text: "Ask for Revision", variant: "yellow-light" };
    return { text: "Pending", variant: "grey-light" };
  };

  const getApprovalRowComment = () => {
    if (currentStatus === "Need Revision") return revisionMessage || "-";
    if (currentStatus === "Canceled") return canceledMessage || "-";
    if (currentStatus === "Issued" || currentStatus === "Completed")
      return approvalComment || "-";
    return "-";
  };

  const baseActivityLogs = [
    {
      name: "Joko",
      email: "joko@company.com",
      title: "Created",
      desc: "",
      timestamp: `${createdDate} at 14:30`,
    },
  ];

  const statusActivityLogs = (() => {
    if (currentStatus === "Waiting for Approval") {
      return [
        {
          name: "Joko",
          email: "joko@company.com",
          title: "Submitted",
          desc: "",
          timestamp: `${createdDate} at 15:15`,
        },
      ];
    }

    if (currentStatus === "Need Revision") {
      return [
        {
          name: approverList[0]?.name || "Approver",
          email: approverList[0]?.email || "-",
          title: "Ask for Revision",
          desc: revisionMessage || "-",
          timestamp: `${createdDate} at 16:30`,
        },
        {
          name: "Joko",
          email: "joko@company.com",
          title: "Submitted",
          desc: "",
          timestamp: `${createdDate} at 15:15`,
        },
      ];
    }

    if (currentStatus === "Issued") {
      const hasDynamicApproval = receiptLogs.some((l) => l.title === "Approved");
      const logs = [];
      if (!hasDynamicApproval) {
        logs.push({
          name: approvalEnabled
            ? approverList[0]?.name || "Approver"
            : "System",
          email: approvalEnabled ? approverList[0]?.email || "-" : "-",
          title: "Approved",
          desc: approvalComment || "",
          timestamp: `${createdDate} at 16:30`,
        });
      }
      logs.push({
        name: "Joko",
        email: "joko@company.com",
        title: "Submitted",
        desc: "",
        timestamp: `${createdDate} at 15:15`,
      });
      return logs;
    }

    if (currentStatus === "Canceled") {
      return [
        {
          name: approverList[0]?.name || "Approver",
          email: approverList[0]?.email || "-",
          title: "Canceled",
          desc: canceledMessage || "-",
          timestamp: `${createdDate} at 16:30`,
        },
        {
          name: "Joko",
          email: "joko@company.com",
          title: "Submitted",
          desc: "",
          timestamp: `${createdDate} at 15:15`,
        },
      ];
    }

    if (currentStatus === "Completed") {
      return [
        {
          name: "System",
          email: "-",
          title: "Completed",
          desc: "All ordered items have been fully received.",
          timestamp: `${createdDate} at 17:30`,
        },
        {
          name: approvalEnabled
            ? approverList[0]?.name || "Approver"
            : "System",
          email: approvalEnabled ? approverList[0]?.email || "-" : "-",
          title: "Approved",
          desc: approvalComment || "",
          timestamp: `${createdDate} at 16:30`,
        },
        {
          name: "Joko",
          email: "joko@company.com",
          title: "Submitted",
          desc: "",
          timestamp: `${createdDate} at 15:15`,
        },
      ];
    }

    return [];
  })();


  const dynamicActivityLogs = ensureCompletedLogIsLatest(
    [
      ...statusActivityLogs,
      ...receiptActivityLogs,
      ...invoicePaymentLogs,
      ...documentActivityLogs,
      ...baseActivityLogs,
    ],
    currentStatus
  );




  const handleSubmitReceipt = () => {
    const submittedAt = new Date();
    const submittedDate = submittedAt.toISOString().slice(0, 10);
    const submittedTime = submittedAt.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const affectedLines = receiptLines.filter(
      (line) => (Number(line.receiveNow) || 0) > 0
    );
    const normalizedReceiptNotes = receiptNotes.trim() || "-";
    const normalizedProofDocuments = receiptProofDocuments.map((doc) => ({
      ...doc,
      description: (doc.description || "").trim(),
    }));
    const nextProofDescriptionErrors = {};

    if (normalizedProofDocuments.length === 0) {
      setReceiptProofUploadError("Upload at least one proof document");
      return;
    }

    normalizedProofDocuments.forEach((doc) => {
      if (!doc.description) {
        nextProofDescriptionErrors[doc.id] = "Field cannot be empty";
      }
    });

    if (Object.keys(nextProofDescriptionErrors).length > 0) {
      setReceiptProofDescriptionErrors(nextProofDescriptionErrors);
      const firstErrorId = Object.keys(nextProofDescriptionErrors)[0];
      setTimeout(() => {
        const element = document.getElementById(firstErrorId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return;
    }

    const nextReceiptLines = receiptLines.map((line) => {
      const receivedNow = Number(line.receiveNow) || 0;
      return {
        ...line,
        receivedQty: line.receivedQty + receivedNow,
        receiveNow: "",
      };
    });

    const nextReceiptEntry = {
      id: `receipt-log-${Date.now()}`,
      receiptNumber: `RCPT-${String(receiptLogs.length + 1).padStart(4, "0")}`,
      date: submittedDate,
      time: submittedTime,
      receivedBy: receiptReceivedBy || "-",
      proofDocuments: normalizedProofDocuments,
      notes: normalizedReceiptNotes,
      items: affectedLines.map((line) => ({
        id: line.id,
        item: line.item,
        code: line.code || "-",
        receivedNow: Number(line.receiveNow) || 0,
      })),
    };
    const nextReceiptLogs = [nextReceiptEntry, ...receiptLogs];

    setReceiptLines(nextReceiptLines);
    setReceiptLogs(nextReceiptLogs);
    
    const receivedNowMap = {};
    affectedLines.forEach(line => {
      receivedNowMap[line.id] = Number(line.receiveNow) || 0;
      
      // Update Work Order Mock based on assignmentId
      if (line.type === "wo" && line.woRef && line.woRef !== "-" && line.assignmentId) {
        const wo = MOCK_WO_TABLE_DATA.find(w => w.wo === line.woRef);
        if (wo && wo.vendors) {
          const vendor = wo.vendors.find(v => v.assignmentId === line.assignmentId);
          if (vendor) {
            const receivedNow = Number(line.receiveNow) || 0;
            vendor.receivedOutput = (Number(vendor.receivedOutput) || 0) + receivedNow;
            if (!vendor.receipts) vendor.receipts = [];
            vendor.receipts.push({
              amount: receivedNow,
              date: submittedDate,
              attachment: normalizedProofDocuments[0]?.file?.name || normalizedProofDocuments[0]?.name || "proof.pdf",
              note: normalizedReceiptNotes,
            });
            if (vendor.receivedOutput >= Number(vendor.output)) {
              vendor.status = "Completed";
              vendor.receivedDate = submittedDate;
            } else if (vendor.receivedOutput > 0) {
              vendor.status = "Partially Received";
            }
            addWoActivityLog(line.woRef, "Assignment Receipt", `Received ${receivedNow} items for ${line.assignmentId}`);
          }
        }
      }
    });
    syncPoToStockBatches("receipt", { receivedNowMap });
    
    resetReceiptState();

    const allRemainingQtyZero =
      nextReceiptLines.length > 0 &&
      nextReceiptLines.every((line) => {
        const remainingQty = Math.max(
          (Number(line.orderedQty) || 0) - (Number(line.receivedQty) || 0),
          0
        );
        return remainingQty === 0;
      });
    const workOrderReceivedNow = affectedLines.reduce(
      (sum, line) =>
        line.type === "wo" || (line.woRef && line.woRef !== "-")
          ? sum + (Number(line.receiveNow) || 0)
          : sum,
      0
    );

    const nextPoStatus = allRemainingQtyZero ? "Completed" : currentStatus;
    const nextPoBadge = allRemainingQtyZero ? "green" : currentBadge;
    
    if (allRemainingQtyZero) {
      syncPoToStockBatches("complete", { completedDate: submittedDate });
    }
    const nextPoStatusKey = allRemainingQtyZero
      ? "completed"
      : initialData?.statusKey || "issued";

    const nextPoSnapshot = buildCurrentPoSnapshot({
      status: nextPoStatus,
      statusKey: nextPoStatusKey,
      sBadge: nextPoBadge,
      receiptLogs: nextReceiptLogs,
      receiptLines: nextReceiptLines,
    });

    const poIndex = MOCK_PO_TABLE_DATA.findIndex(p => p.poNumber === poNumber);
    if (poIndex !== -1) {
      MOCK_PO_TABLE_DATA[poIndex] = {
        ...MOCK_PO_TABLE_DATA[poIndex],
        ...nextPoSnapshot,
        status: nextPoStatus,
        statusKey: nextPoStatusKey,
        sBadge: nextPoBadge,
        receiptLogs: nextReceiptLogs,
        receiptLines: nextReceiptLines
      };
      setLocalPoData(MOCK_PO_TABLE_DATA[poIndex]);
    }

    setCurrentStatus(nextPoStatus);
    setCurrentBadge(nextPoBadge);

    if (
      initialData?.from === "work_order_detail" &&
      returnData?.data
    ) {
      const woData = returnData.data;
      let nextRoutingStages = [...(woData.routingStages || [])];
      let nextRoutingUpdates = [...(woData.routingUpdates || [])];

      if (showAutoAdjustWoMessage && workOrderReceivedNow > 0) {
        const totalExternalReceived = (woData.vendors || []).reduce((sum, v) => {
          if (v.poNumber === poNumber) {
            const currentReceived = Number(v.receivedOutput || 0);
            const vReceivedNow = affectedLines.reduce((s, l) => {
              if (l.type === "wo" && l.assignmentId === v.assignmentId) {
                return s + (Number(l.receiveNow) || 0);
              }
              return s;
            }, 0);
            return sum + currentReceived + vReceivedNow;
          }
          if (v.name !== "Internal") {
            return sum + Number(v.receivedOutput || 0);
          }
          return sum;
        }, 0);

        const outsourceSteps = woData.outsourceSteps || [];
        if (outsourceSteps.length > 0) {
          const minStep = Math.min(...outsourceSteps);
          const stageIndex = nextRoutingStages.findIndex((s) => s.step === minStep);
          
          if (stageIndex > 0) {
            nextRoutingStages = nextRoutingStages.map((stage, idx) => {
              if (idx < stageIndex) {
                const currentComp = Number(stage.totalComp || stage.comp || 0);
                if (currentComp < totalExternalReceived) {
                   return {
                     ...stage,
                     comp: totalExternalReceived,
                     totalComp: totalExternalReceived
                   };
                }
              }
              return stage;
            });

            const now = new Date();
            const formattedDate = now.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }).replace(",", "");

            nextRoutingUpdates.push({
              qty: totalExternalReceived,
              timestamp: formattedDate,
              poNumber: poNumber,
              vendorName: initialData?.vendorName || "Vendor A",
              fullDate: now.toISOString(),
            });
          }
        }
      }

      const updatedReturnData = {
        ...woData,
        vendors: (woData.vendors || []).map((vendor) => {
          if (vendor.poNumber !== poNumber) return vendor;

          const vendorReceivedNow = affectedLines.reduce((s, l) => {
            if (l.type === "wo" && l.assignmentId === vendor.assignmentId) {
              return s + (Number(l.receiveNow) || 0);
            }
            return s;
          }, 0);

          const vendorOutput = Number(vendor.output || 0);
          const currentVendorReceived = Number(vendor.receivedOutput || 0);

          const nextVendorReceived =
            vendorReceivedNow > 0
              ? vendorOutput > 0
                ? Math.min(
                  vendorOutput,
                  currentVendorReceived + vendorReceivedNow
                )
                  : currentVendorReceived + vendorReceivedNow
              : currentVendorReceived;

          const vendorFullyReceived =
            vendorOutput > 0 && nextVendorReceived >= vendorOutput;

          const nextVendorReceipt =
            vendorReceivedNow > 0
              ? {
                id: `receipt-log-${Date.now()}`,
                receiptNumber: nextReceiptEntry.receiptNumber,
                amount: vendorReceivedNow,
                date: submittedDate,
                time: submittedTime,
                receivedBy: receiptReceivedBy || "Natasha Smith",
                note: normalizedReceiptNotes,
                attachments: normalizedProofDocuments,
              }
              : null;

          return {
            ...vendor,
            receivedOutput: nextVendorReceived,
            isPoApproved:
              nextPoStatus === "Issued" || nextPoStatus === "Completed"
                ? true
                : vendor.isPoApproved,
            poStatus: nextPoStatus,
            poBadge: nextPoBadge,
            poStatusKey: nextPoStatusKey,
            poDetailData: nextPoSnapshot,
            status:
              vendorReceivedNow > 0 || nextVendorReceived > 0
                ? vendorFullyReceived
                  ? "Completed"
                  : "Partially Received"
                : vendor.status,
            receivedDate:
              vendorReceivedNow > 0
                ? vendorFullyReceived
                  ? submittedDate
                  : vendor.receivedDate || ""
                : vendor.receivedDate,
            receipts: nextVendorReceipt
              ? [...(vendor.receipts || []), nextVendorReceipt]
              : vendor.receipts || [],
          };
        }),
      };

      updatedReturnData.routingStages = nextRoutingStages;
      updatedReturnData.routingUpdates = nextRoutingUpdates;

      setReturnData({
        ...returnData,
        data: updatedReturnData,
      });
    }

    setActionToastMessage("Receipt successfully confirmed");
    setShowActionToast(true);
    setTimeout(() => setShowActionToast(false), 4000);
  };


  return (
    <div
      ref={pageTopRef}
      style={{
        padding: "24px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        paddingBottom:
          showFooterSubmit || showFooterApprovalActions || showFooterIssuedCancel
            ? "100px"
            : "24px",
        position: "relative",
        background: "#F5F5F7",
      }}
    >
      {showActionToast || showDocumentToast ? (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            background: showDocumentToast
              ? (documentToastVariant === "dark" ? "var(--neutral-on-surface-primary)" : "var(--status-green-primary)")
              : actionToastVariant === "error"
                ? "var(--status-red-primary)"
                : "var(--status-green-primary)",
            color: showDocumentToast
              ? "var(--neutral-on-surface-reverse)"
              : actionToastVariant === "error"
                ? "var(--status-red-on-primary)"
                : "var(--status-green-on-primary)",
            padding: "12px 16px",
            borderRadius: "var(--radius-small)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "var(--elevation-sm)",
            zIndex: 15000,
            minWidth: "320px",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "var(--text-title-3)" }}>
            {showDocumentToast ? documentToastMessage : actionToastMessage}
          </span>
          <span
            data-no-localize
            translate="no"
            style={{
              fontWeight: "var(--font-weight-bold)",
              cursor: "pointer",
              fontSize: "var(--text-title-3)",
            }}
            onClick={() => {
              setShowActionToast(false);
              setShowDocumentToast(false);
            }}
          >
            Okay
          </span>
        </div>
      ) : null}

      <PoDetailHeader
        poNumber={poNumber}
        currentStatus={currentStatus}
        currentBadge={currentBadge}
        displayVersionNum={displayVersionNum}
        latestVersionNum={latestVersionNum}
        versions={versions}
        isVersionMenuOpen={isVersionMenuOpen}
        activeTab={activeTab}
        isHistoricalVersion={isHistoricalVersion}
        isExportingPdf={isExportingPdf}
        initialData={initialData}
        createdDate={createdDate}
        actualCreatedDate={displayData?.createdDate || createdDate}
        expectedDeliveryDate={expectedDeliveryDate}
        currencyLabel={currencyLabel}
        paymentStatus={computePaymentStatus(invoices, payments)}
        revisionMessage={revisionMessage}
        canceledMessage={canceledMessage}
        showHeaderEdit={showHeaderEdit}
        showHeaderExportPdf={showHeaderExportPdf}
        handleBackNavigation={handleBackNavigation}
        handleEditPo={handleEditPo}
        handleExportPdf={handleExportPdf}
        setIsVersionMenuOpen={setIsVersionMenuOpen}
        setSelectedVersionNum={handleVersionChange}
        setActiveTab={setActiveTab}
        handleRevisePo={handleRevisePo}
        openDecisionModal={openDecisionModal}
      />

      {activeTab === "details" ? (
        <>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div
              style={{
                background: "var(--neutral-surface-primary)",
                borderRadius: "16px",
                border: "1px solid var(--neutral-line-separator-1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "24px 24px 0 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  Vendor Information
                </span>
              </div>
              <div
                style={{
                  padding: "20px 24px 24px 24px",
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "24px",
                }}
              >
                <LabelValue label="Vendor Name" value={vendorInfo.name} />
                <LabelValue label="Phone Number" value={vendorInfo.phone} />
                <LabelValue label="Email" value={vendorInfo.email} />
                <LabelValue label="Address" value={vendorInfo.address} />
              </div>
            </div>

            <div
              style={{
                background: "var(--neutral-surface-primary)",
                borderRadius: "16px",
                border: "1px solid var(--neutral-line-separator-1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "24px 24px 0 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  Recipient Information
                </span>
              </div>
              <div
                style={{
                  padding: "20px 24px 24px 24px",
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "24px",
                }}
              >
                <LabelValue label="Recipient Name" value={shipToInfo.name} />
                <LabelValue label="Phone Number" value={shipToInfo.phone} />
                <LabelValue label="Email" value={shipToInfo.email} />
                <LabelValue label="Address" value={shipToInfo.address} />
              </div>
            </div>

            <div
              style={{
                background: "var(--neutral-surface-primary)",
                borderRadius: "16px",
                border: "1px solid var(--neutral-line-separator-1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "24px 24px 0 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  Purchase Order Lines
                </span>
              </div>
              <div style={{ padding: "20px 24px 24px 24px" }}>
                <div
                  style={{
                    border: "none",
                    borderRadius: "0",
                    overflow: "hidden",
                    width: "100%",
                  }}
                >
                  <div style={{ overflowX: mockLines.length > 0 ? "auto" : "hidden", width: "100%" }}>
                      <div
                        style={{
                          minWidth: "100%",
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                      {mockLines.length > 0 && (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "76px minmax(140px, 1.2fr) minmax(160px, 1.8fr) minmax(140px, 1.2fr) 60px 110px 110px",
                            gap: "8px",
                            padding: "0 16px",
                            height: "49px",
                            alignItems: "center",
                            background: "var(--neutral-surface-primary)",
                            position: "relative",
                            width: "100%",
                            boxSizing: "border-box",
                            fontSize: "var(--text-title-3)",
                            fontWeight: "var(--font-weight-bold)",
                            color: "var(--neutral-on-surface-primary)",
                          }}
                        >
                          <span>Type</span>
                          <span>Item</span>
                          <span style={{ paddingRight: "24px" }}>Description</span>
                          <span>WO Ref & Assignment</span>
                          <span style={{ textAlign: "left" }}>Qty</span>
                          <span style={{ textAlign: "right" }}>Unit Price</span>
                          <span style={{ textAlign: "right" }}>Subtotal</span>
                          <div
                            aria-hidden="true"
                            style={{
                              position: "absolute",
                              left: 0,
                              right: 0,
                              bottom: 0,
                              height: "1px",
                              background: "var(--neutral-line-separator-1)",
                              pointerEvents: "none",
                            }}
                          />
                        </div>
                      )}

                      {mockLines.length > 0 ? (
                        mockLines.map((line, idx) => {
                          const isWO = line.type === "wo";
                          const lineSubtotal =
                            (parseFloat(line.qty) || 0) *
                            (parseFloat(line.price) || 0);
                          const quantityLabel =
                            line.type === "material" && line.uom
                              ? `${displayValue(line.qty, 0)} ${line.uom}`
                              : displayValue(line.qty, 0);
                          return (
                            <div
                              key={line.id}
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "76px minmax(140px, 1.2fr) minmax(160px, 1.8fr) minmax(140px, 1.2fr) 60px 110px 110px",
                                gap: "8px",
                                padding: "0 16px",
                                minHeight: "64px",
                                alignItems: "center",
                                background: "var(--neutral-surface-primary)",
                                position: "relative",
                                width: "100%",
                                borderBottom:
                                  idx === mockLines.length - 1
                                    ? "none"
                                    : "1px solid var(--neutral-line-separator-1)",
                                boxSizing: "border-box",
                              }}
                            >
                              <div>
                                <StatusBadge
                                  variant={
                                    isWO
                                      ? "blue-light"
                                      : line.type === "material"
                                        ? "yellow-light"
                                        : "grey-light"
                                  }
                                >
                                  {isWO
                                    ? "WO"
                                    : line.type === "material"
                                      ? "Material"
                                      : "Manual"}
                                </StatusBadge>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  padding: "8px 0",
                                  minWidth: 0
                                }}
                              >
                                <div
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "8px",
                                    background:
                                      "var(--neutral-surface-grey-lighter)",
                                    border:
                                      "1px solid var(--neutral-line-separator-1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    overflow: "hidden",
                                  }}
                                >
                                  {line.image && getImageUploadPreviewUrl(line.image) ? (
                                    <img
                                      src={getImageUploadPreviewUrl(line.image)}
                                      alt={line.item}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    <ImageAssetIcon
                                      size={20}
                                      color="var(--neutral-on-surface-tertiary)"
                                    />
                                  )}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0, padding: "12px 0" }}>
                                  <span
                                    style={{
                                      display: "block",
                                      fontSize: "var(--text-title-3)",
                                      fontWeight: "var(--font-weight-bold)",
                                      color: "var(--neutral-on-surface-primary)",
                                      wordBreak: "break-word"
                                    }}
                                  >
                                    {displayValue(line.item)}
                                  </span>
                                  <span
                                    style={{
                                      display: "block",
                                      fontSize: "var(--text-title-3)",
                                      color: line.type === "manual" ? "var(--neutral-on-surface-secondary)" : "var(--feature-brand-primary)",
                                      textDecoration: line.type === "manual" ? "none" : "underline",
                                      cursor: line.type === "manual" ? "default" : "pointer",
                                      wordBreak: "break-word"
                                    }}
                                    onClick={() => {
                                      if (line.type === "manual") return;
                                      const materialData = MOCK_MATERIALS_DATA.find(m => m.sku === line.code) || {
                                        id: `mock-${line.code}`,
                                        name: line.item,
                                        sku: line.code,
                                        description: line.desc || "-",
                                        category: line.type === 'wo' ? "Work Order" : "Raw Material",
                                        status: "Active",
                                        type: line.type === 'wo' ? "Component" : "Raw",
                                        unit: "Pcs",
                                        onHandStock: 0,
                                        averageCost: line.price || 0
                                      };
                                      onNavigate("materials_detail", {
                                        ...materialData,
                                        from: "purchase_order_detail",
                                        returnTo: {
                                          view: "purchase_order_detail",
                                          data: poNumber
                                        }
                                      });
                                    }}
                                  >
                                    {displayValue(line.code)}
                                  </span>
                                </div>
                              </div>
                              <div style={{ minWidth: 0, padding: "16px 0", paddingRight: "24px" }}>
                                <span
                                  style={{
                                    display: "block",
                                    fontSize: "var(--text-title-3)",
                                    color: "var(--neutral-on-surface-secondary)",
                                    lineHeight: "1.4",
                                    wordBreak: "break-word",
                                    whiteSpace: "pre-wrap"
                                  }}
                                >
                                  {displayValue(line.desc)}
                                </span>
                              </div>
                              <div style={{ minWidth: 0, padding: "12px 0", paddingRight: "16px" }}>
                                <span
                                  onClick={() => {
                                    if (!line.woRef || line.woRef === "-")
                                      return;
                                    const woData = MOCK_WO_TABLE_DATA.find(
                                      (w) => w.wo === line.woRef
                                    );
                                    if (woData) {
                                      onNavigate("work_order_detail", {
                                        ...woData,
                                        from: "purchase_order_detail",
                                        returnTo: {
                                          view: "detail",
                                          data: poNumber,
                                        },
                                      });
                                    }
                                  }}
                                  style={{
                                    display: "block",
                                    fontSize: "var(--text-title-3)",
                                    color:
                                      line.woRef && line.woRef !== "-"
                                        ? "var(--feature-brand-primary)"
                                        : "var(--neutral-on-surface-primary)",
                                    textDecoration:
                                      line.woRef && line.woRef !== "-"
                                        ? "underline"
                                        : "none",
                                    cursor:
                                      line.woRef && line.woRef !== "-"
                                        ? "pointer"
                                        : "default",
                                    whiteSpace: "normal",
                                    wordBreak: "break-all",
                                  }}
                                >
                                  {displayValue(line.woRef)}
                                </span>
                                {line.assignmentId && line.assignmentId !== "-" && (
                                  <div style={{ marginTop: "4px", width: "100%", lineHeight: "1.4" }}>
                                    <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)", whiteSpace: "normal", wordBreak: "break-word" }}>
                                      Assignment: <span style={{ color: "var(--feature-brand-primary)", textDecoration: "underline", cursor: "pointer" }}>{line.assignmentId}</span>
                                    </span>
                                    {line.outsourceSteps && line.outsourceSteps.length > 0 && (
                                      <span style={{ display: "inline-flex", alignItems: "center", marginLeft: "4px", verticalAlign: "-2px" }}>
                                      <Tooltip 
                                        content={
                                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
                                            {line.outsourceSteps.map(step => {
                                              const woData = MOCK_WO_TABLE_DATA.find(w => w.wo === line.woRef);
                                              const stage = woData?.routingStages?.find(s => s.step === step);
                                              return <div key={step}>Step {step}: {stage ? `${stage.route} - ${stage.op}` : "Unknown Stage"}</div>;
                                            })}
                                          </div>
                                        } 
                                        position="top"
                                      >
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                          <HelpCircle size={14} color="var(--neutral-on-surface-tertiary)" style={{ cursor: "pointer" }} />
                                        </div>
                                      </Tooltip>
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div
                                style={{
                                  textAlign: "left",
                                  fontSize: "var(--text-title-3)",
                                  color: "var(--neutral-on-surface-primary)",
                                }}
                                title={quantityLabel}
                              >
                                {quantityLabel}
                              </div>
                              <div
                                style={{
                                  textAlign: "right",
                                  fontSize: "var(--text-title-3)",
                                  color: "var(--neutral-on-surface-primary)",
                                }}
                              >
                                {formatCurrency(line.price, currency)}
                              </div>
                              <div
                                style={{
                                  textAlign: "right",
                                  fontSize: "var(--text-title-3)",
                                  fontWeight: "var(--font-weight-bold)",
                                  color: "var(--neutral-on-surface-primary)",
                                }}
                              >
                                {formatCurrency(lineSubtotal, currency)}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div
                          style={{
                            padding: "48px 24px",
                            textAlign: "center",
                            color: "var(--neutral-on-surface-tertiary)",
                            fontSize: "var(--text-title-3)",
                            background: "var(--neutral-surface-primary)",
                            border: "1.5px dashed var(--neutral-line-separator-1)",
                            borderRadius: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: "120px",
                          }}
                        >
                          No purchase order lines added.
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            <div
              style={{
                background: "var(--neutral-surface-primary)",
                borderRadius: "16px",
                border: "1px solid var(--neutral-line-separator-1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "24px 24px 0 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  Summary
                </span>
              </div>
              <div
                style={{
                  padding: "20px 24px 24px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "var(--text-title-3)",
                  gap: "16px",
                }}
              >
                <span style={{ color: "var(--neutral-on-surface-secondary)" }}>
                  Subtotal
                </span>
                <span style={{ fontWeight: "var(--font-weight-bold)" }}>
                  {formatCurrency(subtotal, currency)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "var(--text-title-3)",
                  gap: "16px",
                }}
              >
                <span style={{ color: "var(--neutral-on-surface-secondary)" }}>
                  Tax ({formData ? Number(formData.tax) || 0 : 11}%)
                </span>
                <span style={{ fontWeight: "var(--font-weight-bold)" }}>
                  {formatCurrency(tax, currency)}
                </span>
              </div>
              {summaryFeeRows.map((fee) => (
                <div
                  key={fee.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    fontSize: "var(--text-title-3)",
                  }}
                >
                  <span
                    style={{
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    {fee.name}
                  </span>
                  <span style={{ fontWeight: "var(--font-weight-bold)" }}>
                    {formatCurrency(fee.amount, currency)}
                  </span>
                </div>
              ))}
              <div
                style={{
                  borderTop: "1px solid var(--neutral-line-separator-1)",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "var(--text-title-1)",
                  fontWeight: "var(--font-weight-black)",
                }}
              >
                <span>Total</span>
                <span>{formatCurrency(total, currency)}</span>
              </div>
            </div>
          </div>

            <div
              style={{
                background: "var(--neutral-surface-primary)",
                borderRadius: "16px",
                border: "1px solid var(--neutral-line-separator-1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "24px 24px 0 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  Notes & Terms
                </span>
              </div>
              <div
                style={{
                  padding: "20px 24px 24px 24px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px 40px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-body)",
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    Notes
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "var(--text-title-3)",
                      color: "var(--neutral-on-surface-primary)",
                      lineHeight: "1.6",
                    }}
                  >
                    {detailNotes}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-body)",
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    Terms
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "var(--text-title-3)",
                      color: "var(--neutral-on-surface-primary)",
                      lineHeight: "1.6",
                    }}
                  >
                    {detailTerms}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : activeTab === "invoices" ? (
        <PoInvoicePaymentTab
          outstandingAmount={outstandingAmount}
          currency={currency}
          total={total}
          poInvoicedRatio={poInvoicedRatio}
          totalInvoiced={totalInvoiced}
          totalPaid={totalPaid}
          poGap={poGap}
          overdueAmount={overdueAmount}
          invoiceSearch={invoiceSearch}
          currentStatus={currentStatus}
          invoices={invoices}
          invoiceCurrentPage={invoiceCurrentPage}
          invoiceRowsPerPage={invoiceRowsPerPage}
          setInvoiceSearch={setInvoiceSearch}
          setShowAddInvoiceDrawer={setShowAddInvoiceDrawer}
          setSelectedInvoiceForDetail={setSelectedInvoiceForDetail}
          setActiveInvoiceTab={setActiveInvoiceTab}
          setShowInvoiceDetailDrawer={setShowInvoiceDetailDrawer}
          setExpandedInvoiceItems={setExpandedInvoiceItems}
          setExpandedInvoicePayments={setExpandedInvoicePayments}
          setInvoiceCurrentPage={setInvoiceCurrentPage}
          setInvoiceRowsPerPage={setInvoiceRowsPerPage}
          getInvoiceMetrics={getInvoiceMetrics}
          getAgingStatus={getAgingStatus}
          getInvoiceStatus={getInvoiceStatus}
        />
      ) : activeTab === "3-ways-match" ? (
        <PoThreeWayMatchTab
          threeWaysMatchData={threeWaysMatchData}
          threeWaysMatchCurrentPage={threeWaysMatchCurrentPage}
          threeWaysMatchRowsPerPage={threeWaysMatchRowsPerPage}
          setThreeWaysMatchCurrentPage={setThreeWaysMatchCurrentPage}
          setThreeWaysMatchRowsPerPage={setThreeWaysMatchRowsPerPage}
          getImageUploadPreviewUrl={getImageUploadPreviewUrl}
        />
      ) : activeTab === "documents" ? (
        <PoDocumentsTab
          documentFilterTriggerRef={documentFilterTriggerRef}
          showDocumentFilterMenu={showDocumentFilterMenu}
          setShowDocumentFilterMenu={setShowDocumentFilterMenu}
          documentTypeFilters={documentTypeFilters}
          setDocumentTypeFilters={setDocumentTypeFilters}
          documentFilterMenuPosition={documentFilterMenuPosition}
          documentTypeFilterOptions={documentTypeFilterOptions}
          documentSearch={documentSearch}
          setDocumentSearch={setDocumentSearch}
          documentView={documentView}
          setDocumentView={setDocumentView}
          currentStatus={currentStatus}
          documents={documents}
          filteredDocuments={filteredDocuments}
          openDocumentMenuId={openDocumentMenuId}
          setOpenDocumentMenuId={setOpenDocumentMenuId}
          documentMenuPosition={documentMenuPosition}
          updateDocumentFilterMenuPosition={updateDocumentFilterMenuPosition}
          toggleDocumentTypeFilter={toggleDocumentTypeFilter}
          resetDocumentUploadState={resetDocumentUploadState}
          setShowUploadDocumentModal={setShowUploadDocumentModal}
          handleDocumentAction={handleDocumentAction}
          openDocumentActionMenu={openDocumentActionMenu}
          getDocumentTypeLabel={getDocumentTypeLabel}
        />
      ) : activeTab === "receipt" ? (
        <PoReceiptsTab
          receiptLines={receiptLines}
          receiptErrors={receiptErrors}
          groupedReceiptLogs={groupedReceiptLogs}
          canConfirmReceipt={canConfirmReceipt}
          initialData={initialData}
          handleReceiptConfirmClick={handleReceiptConfirmClick}
          updateReceiptLine={updateReceiptLine}
          onNavigate={onNavigate}
          showToast={showToast}
          displayValue={displayValue}
        />
      ) : activeTab === "logs" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {approvalEnabled ? (
            <div
              style={{
                background: "var(--neutral-surface-primary)",
                borderRadius: "16px",
                border: "1px solid var(--neutral-line-separator-1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "24px 24px 0 24px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  Approval Logs
                </span>
              </div>
              <div style={{ padding: "24px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "24px",
                    marginBottom: "28px",
                  }}
                >
                  <LabelValue label="Requested By" value={requestedBy} />
                  <LabelValue label="Requested At" value={requestedAt} />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      display: "flex",
                      paddingBottom: "12px",
                      borderBottom: "1px solid var(--neutral-line-separator-1)",
                      fontWeight: "var(--font-weight-bold)",
                      fontSize: "var(--text-title-3)",
                      color: "var(--neutral-on-surface-primary)",
                    }}
                  >
                    <div style={{ flex: "1.1" }}>Approvers</div>
                    <div style={{ width: "140px" }}>Status</div>
                    <div style={{ flex: "2.4" }}>Comments</div>
                  </div>
                  {approverList.map((approver, idx) => {
                    const rowStatus = getApprovalRowStatus();
                    const showApproved =
                      currentStatus === "Issued" ||
                      currentStatus === "Completed";
                    const showRejected = currentStatus === "Canceled";
                    const showPending = !showApproved && !showRejected;
                    const thisStatus =
                      idx === 0
                        ? rowStatus
                        : { text: "Pending", variant: "grey-light" };
                    const thisComment =
                      idx === 0 ? getApprovalRowComment() : "-";
                    return (
                      <div
                        key={approver.id || idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "18px 0 10px 0",
                          fontSize: "var(--text-title-3)",
                          borderBottom:
                            idx === approverList.length - 1
                              ? "none"
                              : "1px solid var(--neutral-line-separator-1)",
                        }}
                      >
                        <div
                          style={{
                            flex: "1.1",
                            color: "var(--neutral-on-surface-primary)",
                          }}
                        >
                          {approver.name}
                        </div>
                        <div style={{ width: "140px" }}>
                          <StatusBadge variant={thisStatus.variant}>
                            {thisStatus.text}
                          </StatusBadge>
                        </div>
                        <div
                          style={{
                            flex: "2.4",
                            color: "var(--neutral-on-surface-secondary)",
                            lineHeight: "1.5",
                          }}
                        >
                          {thisComment}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          <div
            style={{
              background: "var(--neutral-surface-primary)",
              borderRadius: "16px",
              border: "1px solid var(--neutral-line-separator-1)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "24px 24px 0 24px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-title-2)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--neutral-on-surface-primary)",
                }}
              >
                Activity Logs
              </span>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    paddingBottom: "12px",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    fontWeight: "var(--font-weight-bold)",
                    fontSize: "var(--text-title-3)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  <div style={{ flex: "1.1" }}>Name</div>
                  <div style={{ flex: "1.9" }}>Email</div>
                  <div style={{ flex: "2.8" }}>Activity</div>
                  <div style={{ width: "190px" }}>Timestamp</div>
                </div>

                {dynamicActivityLogs.map((log, idx, arr) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      padding: "16px 0",
                      borderBottom:
                        idx === arr.length - 1
                          ? "none"
                          : "1px solid var(--neutral-line-separator-1)",
                      fontSize: "var(--text-title-3)",
                    }}
                  >
                    <div
                      style={{
                        flex: "1.1",
                        color: "var(--neutral-on-surface-primary)",
                      }}
                    >
                      {log.name}
                    </div>
                    <div
                      style={{
                        flex: "1.9",
                        color: "var(--neutral-on-surface-primary)",
                      }}
                    >
                      {log.email}
                    </div>
                    <div
                      style={{
                        flex: "2.8",
                        display: "flex",
                        flexDirection: "column",
                        gap: log.desc ? "6px" : "0",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--neutral-on-surface-primary)",
                        }}
                      >
                        {log.title}
                      </span>
                      {log.desc ? (
                        <span
                          style={{
                            color: "var(--neutral-on-surface-secondary)",
                            lineHeight: "1.5",
                          }}
                        >
                          {log.desc}
                        </span>
                      ) : null}
                    </div>
                    <div
                      style={{
                        width: "190px",
                        color: "var(--neutral-on-surface-secondary)",
                      }}
                    >
                      {log.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Card
          style={{
            padding: "32px",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "260px",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-title-2)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            {activeTab === "receipt" ? "Receipt" : "Documents"}
          </span>
          <span
            style={{
              fontSize: "var(--text-title-3)",
              color: "var(--neutral-on-surface-secondary)",
            }}
          >
            Content for this tab will be added next.
          </span>
        </Card>
      )}

      {!isHistoricalVersion &&
      (showFooterSubmit ||
        showFooterApprovalActions ||
        showFooterIssuedCancel) ? (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: isSidebarCollapsed ? "82px" : "286px",
            transition: "left 0.2s ease",
            right: 0,
            background: "var(--neutral-surface-primary)",
            borderTop: "1px solid var(--neutral-line-separator-1)",
            padding: "12px 24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            {showFooterSubmit ? (
              <Button
                size="medium"
                variant="filled"
                onClick={handleDetailSubmitClick}
              >
                Submit PO
              </Button>
            ) : null}
            {showFooterApprovalActions ? (
              <>
                <Button
                  size="medium"
                  variant="danger"
                  onClick={() => openDecisionModal("cancel")}
                >
                  Cancel PO
                </Button>
                <Button
                  size="medium"
                  variant="outlined"
                  onClick={() => openDecisionModal("revision")}
                >
                  Ask for Revision
                </Button>
                <Button
                  size="medium"
                  variant="filled"
                  onClick={() => openDecisionModal("approve")}
                >
                  Approve
                </Button>
              </>
            ) : null}
            {showFooterIssuedCancel ? (
              <>
                <Button
                  size="medium"
                  variant="danger"
                  onClick={() => openDecisionModal("cancel")}
                >
                  Cancel PO
                </Button>
                <Button
                  size="medium"
                  variant="outlined"
                  onClick={handleRevisePo}
                >
                  Revise PO
                </Button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      <PoActionValidationModals
        showSubmitGuardModal={showSubmitGuardModal}
        setShowSubmitGuardModal={setShowSubmitGuardModal}
        validateDetailRequiredInfo={validateDetailRequiredInfo}
        showZeroPriceWarningModal={showZeroPriceWarningModal}
        setShowZeroPriceWarningModal={setShowZeroPriceWarningModal}
        setShowDetailSubmitConfirmModal={setShowDetailSubmitConfirmModal}
        showDetailSubmitConfirmModal={showDetailSubmitConfirmModal}
        poApprovalSettings={poApprovalSettings}
        handleConfirmDetailSubmit={handleConfirmDetailSubmit}
        showFutureDateBlocker={showFutureDateBlocker}
        setShowFutureDateBlocker={setShowFutureDateBlocker}
        handleEditPo={handleEditPo}
        isDecisionModalOpen={isDecisionModalOpen}
        setIsDecisionModalOpen={setIsDecisionModalOpen}
        decisionType={decisionType}
        decisionComment={decisionComment}
        setDecisionComment={setDecisionComment}
        decisionError={decisionError}
        setDecisionError={setDecisionError}
        getDecisionMeta={getDecisionMeta}
        handleSubmitDecision={handleSubmitDecision}
        showCanceledWOBlocker={showCanceledWOBlocker}
        setShowCanceledWOBlocker={setShowCanceledWOBlocker}
        canceledWOsFound={canceledWOsFound}
        closeDecisionModal={closeDecisionModal}
      />

      <PoDocumentModals
        showUploadDocumentModal={showUploadDocumentModal}
        setShowUploadDocumentModal={setShowUploadDocumentModal}
        resetDocumentUploadState={resetDocumentUploadState}
        handleUploadDocument={handleUploadDocument}
        documentUploadDocumentType={documentUploadDocumentType}
        setDocumentUploadDocumentType={setDocumentUploadDocumentType}
        documentUploadTypeError={documentUploadTypeError}
        handleDocumentUploadFileSelection={handleDocumentUploadFileSelection}
        documentUploadFileObject={documentUploadFileObject}
        documentUploadError={documentUploadError}
        documentUploadCardFile={documentUploadCardFile}
        documentUploadDescription={documentUploadDescription}
        setDocumentUploadDescription={setDocumentUploadDescription}
        documentUploadDescriptionError={documentUploadDescriptionError}
        showRenameDocumentModal={showRenameDocumentModal}
        setShowRenameDocumentModal={setShowRenameDocumentModal}
        setSelectedDocumentId={setSelectedDocumentId}
        setRenameDocumentValue={setRenameDocumentValue}
        setRenameDocumentError={setRenameDocumentError}
        setEditDocumentDescriptionValue={setEditDocumentDescriptionValue}
        setEditDocumentTypeValue={setEditDocumentTypeValue}
        handleConfirmRenameDocument={handleConfirmRenameDocument}
        renameDocumentValue={renameDocumentValue}
        renameDocumentError={renameDocumentError}
        editDocumentDescriptionValue={editDocumentDescriptionValue}
        editDocumentDescriptionError={editDocumentDescriptionError}
        editDocumentTypeValue={editDocumentTypeValue}
        FILE_DESCRIPTION_MAX_LENGTH={FILE_DESCRIPTION_MAX_LENGTH}
        showDeleteDocumentModal={showDeleteDocumentModal}
        setShowDeleteDocumentModal={setShowDeleteDocumentModal}
        handleConfirmDeleteDocument={handleConfirmDeleteDocument}
      />

      <PoReceiptModals
        receiptLines={receiptLines}
        showAdjustWoModal={showAdjustWoModal}
        setShowAdjustWoModal={setShowAdjustWoModal}
        handleContinueFromAdjustWo={handleContinueFromAdjustWo}
        showConfirmReceiptModal={showConfirmReceiptModal}
        setShowConfirmReceiptModal={setShowConfirmReceiptModal}
        showAutoAdjustWoMessage={showAutoAdjustWoMessage}
        receiptReceivedBy={receiptReceivedBy}
        setReceiptReceivedBy={setReceiptReceivedBy}
        receiptNotes={receiptNotes}
        setReceiptNotes={setReceiptNotes}
        handleSubmitReceipt={handleSubmitReceipt}
        receiptProofDocuments={receiptProofDocuments}
        setReceiptProofDocuments={setReceiptProofDocuments}
        receiptProofUploadError={receiptProofUploadError}
        setReceiptProofUploadError={setReceiptProofUploadError}
        receiptProofDescriptionErrors={receiptProofDescriptionErrors}
        setReceiptProofDescriptionErrors={setReceiptProofDescriptionErrors}
        MAX_PROOF_UPLOAD_FILES={MAX_PROOF_UPLOAD_FILES}
        handleReceiptProofFilesSelected={handleReceiptProofFilesSelected}
        updateReceiptProofDescription={updateReceiptProofDescription}
        removeReceiptProofDocument={removeReceiptProofDocument}
      />



      <PoInvoiceDetailModals
        showPaymentHistoryModal={showPaymentHistoryModal}
        setShowPaymentHistoryModal={setShowPaymentHistoryModal}
        selectedInvoiceForHistory={selectedInvoiceForHistory}
        formatCurrency={formatCurrency}
        currency={currency}
        getInvoiceMetrics={getInvoiceMetrics}
        systemTableShellStyle={systemTableShellStyle}
        systemTableHeaderCellStyle={systemTableHeaderCellStyle}
        systemTableCellStyle={systemTableCellStyle}
        systemTableEmptyStateStyle={systemTableEmptyStateStyle}
        showInvoiceDetailDrawer={showInvoiceDetailDrawer}
        setShowInvoiceDetailDrawer={setShowInvoiceDetailDrawer}
        selectedInvoiceForDetail={selectedInvoiceForDetail}
        handleEditInvoice={handleEditInvoice}
        getInvoiceStatus={getInvoiceStatus}
        getAgingStatus={getAgingStatus}
        activeInvoiceTab={activeInvoiceTab}
        setActiveInvoiceTab={setActiveInvoiceTab}
        mockLines={mockLines}
        formatIsoDateString={formatIsoDateString}
        setPaymentToVoid={setPaymentToVoid}
        setShowVoidConfirmModal={setShowVoidConfirmModal}
        setShowDeleteInvoiceConfirm={setShowDeleteInvoiceConfirm}
        setSelectedInvoiceForPayment={setSelectedInvoiceForPayment}
        setPaymentFormData={setPaymentFormData}
        paymentFormData={paymentFormData}
        setShowAddPaymentDrawer={setShowAddPaymentDrawer}
      />

      <PoInvoicePaymentManagementModals
        showAddInvoiceDrawer={showAddInvoiceDrawer}
        setShowAddInvoiceDrawer={setShowAddInvoiceDrawer}
        isEditingInvoice={isEditingInvoice}
        setIsEditingInvoice={setIsEditingInvoice}
        setShowInvoiceDetailDrawer={setShowInvoiceDetailDrawer}
        setFormErrors={setFormErrors}
        formErrors={formErrors}
        autoPrefillInvoice={autoPrefillInvoice}
        setAutoPrefillInvoice={setAutoPrefillInvoice}
        addInvoiceFormData={addInvoiceFormData}
        setAddInvoiceFormData={setAddInvoiceFormData}
        simulateInvoiceOcr={simulateInvoiceOcr}
        calculatedDueDate={calculatedDueDate}
        currency={currency}
        formatNumberWithCommas={formatNumberWithCommas}
        parseNumberFromCommas={parseNumberFromCommas}
        mockLines={mockLines}
        handleAddInvoice={handleAddInvoice}
        showAddPaymentDrawer={showAddPaymentDrawer}
        setShowAddPaymentDrawer={setShowAddPaymentDrawer}
        selectedInvoiceForPayment={selectedInvoiceForPayment}
        paymentFormErrors={paymentFormErrors}
        setPaymentFormErrors={setPaymentFormErrors}
        autoPrefillPayment={autoPrefillPayment}
        setAutoPrefillPayment={setAutoPrefillPayment}
        paymentFormData={paymentFormData}
        setPaymentFormData={setPaymentFormData}
        simulatePaymentOcr={simulatePaymentOcr}
        getInvoiceMetrics={getInvoiceMetrics}
        handleAddPayment={handleAddPayment}
        showDeleteInvoiceConfirm={showDeleteInvoiceConfirm}
        setShowDeleteInvoiceConfirm={setShowDeleteInvoiceConfirm}
        handleDeleteInvoice={handleDeleteInvoice}
        showVoidConfirmModal={showVoidConfirmModal}
        setShowVoidConfirmModal={setShowVoidConfirmModal}
        paymentToVoid={paymentToVoid}
        formatCurrency={formatCurrency}
        handleVoidPayment={handleVoidPayment}
        showExceedConfirmModal={showExceedConfirmModal}
        setShowExceedConfirmModal={setShowExceedConfirmModal}
        showItemQtyExceedConfirmModal={showItemQtyExceedConfirmModal}
        setShowItemQtyExceedConfirmModal={setShowItemQtyExceedConfirmModal}
        exceededItems={exceededItems}
        saveInvoice={saveInvoice}
        checkPoValueAndSave={checkPoValueAndSave}
        deleteInvoiceReason={deleteInvoiceReason}
        setDeleteInvoiceReason={setDeleteInvoiceReason}
        deleteInvoiceReasonError={deleteInvoiceReasonError}
        setDeleteInvoiceReasonError={setDeleteInvoiceReasonError}
        voidPaymentReason={voidPaymentReason}
        setVoidPaymentReason={setVoidPaymentReason}
        voidPaymentReasonError={voidPaymentReasonError}
        setVoidPaymentReasonError={setVoidPaymentReasonError}
      />

      {/* Add Payment Drawer */}

      {/* Invoice Detail Drawer */}


    </div>
  );
};

