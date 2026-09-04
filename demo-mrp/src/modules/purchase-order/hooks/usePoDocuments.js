import { useState, useMemo, useCallback, useRef } from "react";
import { MOCK_PO_DOCUMENTS } from "../mock/purchaseOrderMocks";
import {
  validateUploadFile,
  createUploadDocumentRecord,
  formatUploadFileSize,
} from "../../../utils/upload/uploadUtils";

const documentTypeFilterOptions = [
  { value: "invoice", label: "Invoice" },
  { value: "invoice_payment", label: "Invoice Payment" },
  { value: "delivery_note", label: "Delivery Note" },
  { value: "packing_list", label: "Packing List" },
  { value: "quotation_vendor", label: "Quotation (Vendor)" },
  { value: "contract_agreement", label: "Contract / Agreement" },
  { value: "other", label: "Other" },
];

const getDocumentTypeLabel = (documentType) => {
  if (documentType === "invoice") return "Invoice";
  if (documentType === "invoice_payment") return "Invoice Payment";
  if (documentType === "delivery_note") return "Delivery Note";
  if (documentType === "quotation_vendor") return "Quotation (Vendor)";
  if (documentType === "contract") return "Contract / Agreement";
  if (documentType === "contract_agreement") return "Contract / Agreement";
  if (documentType === "packing_list") return "Packing List";
  return "Other";
};

const getNormalizedDocumentType = (documentType) => {
  if (documentType === "contract") return "contract_agreement";
  return documentTypeFilterOptions.some((opt) => opt.value === documentType)
    ? documentType
    : "other";
};

export const usePoDocuments = ({
  initialDocuments = MOCK_PO_DOCUMENTS,
  initialLogs = [],
  currentStatus = "Draft",
} = {}) => {
  // --- Core State ---
  const [documents, setDocuments] = useState(initialDocuments);
  const [documentActivityLogs, setDocumentActivityLogs] = useState(initialLogs);

  // --- UI State (Search, Filters, View) ---
  const [documentSearch, setDocumentSearch] = useState("");
  const [documentTypeFilters, setDocumentTypeFilters] = useState([]);
  const [documentView, setDocumentView] = useState("list");
  const [showDocumentFilterMenu, setShowDocumentFilterMenu] = useState(false);
  const [documentFilterMenuPosition, setDocumentFilterMenuPosition] = useState({
    top: 0,
    left: 0,
    placement: "bottom",
  });
  const documentFilterTriggerRef = useRef(null);

  // --- Modal & Menu State ---
  const [openDocumentMenuId, setOpenDocumentMenuId] = useState(null);
  const [documentMenuPosition, setDocumentMenuPosition] = useState({
    top: 0,
    left: 0,
    placement: "bottom",
  });
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  // --- Upload State ---
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false);
  const [documentUploadFileName, setDocumentUploadFileName] = useState("");
  const [documentUploadFileSize, setDocumentUploadFileSize] = useState(0);
  const [documentUploadFileObject, setDocumentUploadFileObject] = useState(null);
  const [documentUploadDescription, setDocumentUploadDescription] = useState("");
  const [documentUploadDocumentType, setDocumentUploadDocumentType] = useState("other");
  const [documentUploadError, setDocumentUploadError] = useState("");
  const [documentUploadDescriptionError, setDocumentUploadDescriptionError] = useState("");
  const [documentUploadTypeError, setDocumentUploadTypeError] = useState("");

  // --- Rename/Delete State ---
  const [showRenameDocumentModal, setShowRenameDocumentModal] = useState(false);
  const [renameDocumentValue, setRenameDocumentValue] = useState("");
  const [renameDocumentError, setRenameDocumentError] = useState("");
  const [editDocumentDescriptionValue, setEditDocumentDescriptionValue] = useState("");
  const [editDocumentDescriptionError, setEditDocumentDescriptionError] = useState("");
  const [editDocumentTypeValue, setEditDocumentTypeValue] = useState("other");
  const [showDeleteDocumentModal, setShowDeleteDocumentModal] = useState(false);

  // --- Toast State ---
  const [showDocumentToast, setShowDocumentToast] = useState(false);
  const [documentToastMessage, setDocumentToastMessage] = useState("");
  const [documentToastVariant, setDocumentToastVariant] = useState("success");

  // --- Helpers ---
  const getCurrentLogTimestamp = useCallback(() => {
    const now = new Date();
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const month = months[now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${month} ${day}, ${year} at ${hours}:${minutes}`;
  }, []);

  const resetDocumentUploadState = useCallback(() => {
    setDocumentUploadFileName("");
    setDocumentUploadFileSize(0);
    setDocumentUploadFileObject(null);
    setDocumentUploadDescription("");
    setDocumentUploadDocumentType("other");
    setDocumentUploadError("");
    setDocumentUploadDescriptionError("");
    setDocumentUploadTypeError("");
  }, []);

  const handleDocumentUploadFileSelection = useCallback((files) => {
    const nextFile = files[0];
    if (!nextFile) return;
    const validationMessage = validateUploadFile(nextFile);
    setDocumentUploadFileName(nextFile.name);
    setDocumentUploadFileSize(nextFile.size || 0);
    setDocumentUploadFileObject(nextFile);
    setDocumentUploadError(validationMessage);
  }, []);

  const showToast = useCallback((message, variant = "success") => {
    setDocumentToastVariant(variant);
    setDocumentToastMessage(message);
    setShowDocumentToast(true);
    setTimeout(() => setShowDocumentToast(false), 4000);
  }, []);

  // --- Handlers ---
  const handleUploadDocument = useCallback(() => {
    if (currentStatus === "Canceled") {
      setDocumentUploadError(
        "Documents cannot be uploaded for canceled purchase orders"
      );
      return;
    }
    let hasError = false;
    if (!documentUploadDocumentType) {
      setDocumentUploadTypeError("Field cannot be empty");
      hasError = true;
    } else {
      setDocumentUploadTypeError("");
    }

    if (!documentUploadFileObject || !documentUploadFileName) {
      setDocumentUploadError("Please choose a file");
      hasError = true;
    } else {
      const validationMessage = validateUploadFile(documentUploadFileObject);
      if (validationMessage) {
        setDocumentUploadError(validationMessage);
        hasError = true;
      } else {
        setDocumentUploadError("");
      }
    }

    if (!documentUploadDescription.trim()) {
      setDocumentUploadDescriptionError("Field cannot be empty");
      hasError = true;
    } else {
      setDocumentUploadDescriptionError("");
    }

    if (hasError) return;

    const modifiedLabel = "Mar 31, 2026";
    const newDoc = createUploadDocumentRecord(documentUploadFileObject, {
      id: `doc-${Date.now()}`,
      name: documentUploadFileName,
      description: documentUploadDescription.trim(),
      meta: `Uploaded by Natasha Smith on ${modifiedLabel}`,
      documentType: documentUploadDocumentType,
      modifiedDate: modifiedLabel,
      size: formatUploadFileSize(documentUploadFileSize),
    });

    setDocuments((prev) => [newDoc, ...prev]);
    setDocumentActivityLogs((prev) => [
      {
        name: "Natasha Smith",
        email: "natasha.smith@company.com",
        title: "Document Uploaded",
        desc: newDoc.description
          ? `${newDoc.description} (${newDoc.name})`
          : newDoc.name,
        timestamp: getCurrentLogTimestamp(),
      },
      ...prev,
    ]);
    setShowUploadDocumentModal(false);
    resetDocumentUploadState();
    showToast("Document successfully uploaded");
  }, [
    currentStatus,
    documentUploadDocumentType,
    documentUploadFileObject,
    documentUploadFileName,
    documentUploadDescription,
    documentUploadFileSize,
    resetDocumentUploadState,
    getCurrentLogTimestamp,
    showToast,
  ]);

  const handleConfirmRenameDocument = useCallback(() => {
    const trimmedName = renameDocumentValue.trim();
    const trimmedDescription = editDocumentDescriptionValue.trim();
    let hasError = false;
    if (!trimmedName) {
      setRenameDocumentError("Field cannot be empty");
      hasError = true;
    } else {
      setRenameDocumentError("");
    }

    if (!trimmedDescription) {
      setEditDocumentDescriptionError("Field cannot be empty");
      hasError = true;
    } else {
      setEditDocumentDescriptionError("");
    }

    if (hasError) return;
    if (!selectedDocumentId) return;

    const todayLabel = "Mar 31, 2026";
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === selectedDocumentId
          ? {
            ...doc,
            name: trimmedName,
            description: trimmedDescription,
            documentType: editDocumentTypeValue,
            meta: `Uploaded by Natasha Smith on ${todayLabel}`,
            modifiedDate: todayLabel,
          }
          : doc
      )
    );

    setDocumentActivityLogs((prev) => [
      {
        name: "Natasha Smith",
        email: "natasha.smith@company.com",
        title: "Document Renamed",
        desc: trimmedDescription
          ? `${trimmedName} - ${trimmedDescription}`
          : trimmedName,
        timestamp: getCurrentLogTimestamp(),
      },
      ...prev,
    ]);

    setShowRenameDocumentModal(false);
    setSelectedDocumentId(null);
    setRenameDocumentValue("");
    setEditDocumentDescriptionValue("");
    setEditDocumentTypeValue("other");
    showToast("Document successfully updated");
  }, [
    renameDocumentValue,
    editDocumentDescriptionValue,
    selectedDocumentId,
    editDocumentTypeValue,
    getCurrentLogTimestamp,
    showToast,
  ]);

  const handleConfirmDeleteDocument = useCallback(() => {
    if (!selectedDocumentId) return;
    const targetDoc = documents.find((doc) => doc.id === selectedDocumentId);

    setDocuments((prev) => prev.filter((doc) => doc.id !== selectedDocumentId));
    setDocumentActivityLogs((prev) => [
      {
        name: "Natasha Smith",
        email: "natasha.smith@company.com",
        title: "Document Deleted",
        desc: targetDoc?.name || "Unknown Document",
        timestamp: getCurrentLogTimestamp(),
      },
      ...prev,
    ]);

    setShowDeleteDocumentModal(false);
    setSelectedDocumentId(null);
    showToast("Document successfully deleted");
  }, [selectedDocumentId, documents, getCurrentLogTimestamp, showToast]);

  const handleDocumentAction = useCallback((action, docId = null) => {
    if (docId && (action === "delete" || action === "rename")) {
      const targetDoc = documents.find((doc) => doc.id === docId);
      if (action === "delete") {
        setSelectedDocumentId(docId);
        setShowDeleteDocumentModal(true);
        setOpenDocumentMenuId(null);
        return;
      }
      if (action === "rename") {
        setSelectedDocumentId(docId);
        setRenameDocumentValue(targetDoc?.name || "");
        setEditDocumentDescriptionValue(targetDoc?.description || "");
        setEditDocumentTypeValue(
          targetDoc?.documentType === "contract"
            ? "contract_agreement"
            : targetDoc?.documentType || "other"
        );
        setShowRenameDocumentModal(true);
        setOpenDocumentMenuId(null);
        return;
      }
    }
  }, [documents]);

  const updateDocumentFilterMenuPosition = useCallback(() => {
    if (documentFilterTriggerRef.current) {
      const rect = documentFilterTriggerRef.current.getBoundingClientRect();
      const estimatedHeight = 360;
      const openAbove =
        window.innerHeight - rect.bottom < estimatedHeight + 16 &&
        rect.top > estimatedHeight + 16;
      setDocumentFilterMenuPosition({
        top: openAbove ? rect.top - 8 : rect.bottom + 8,
        left: rect.left,
        placement: openAbove ? "top" : "bottom",
      });
    }
  }, []);

  const openDocumentActionMenu = useCallback((event, docId) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDocumentMenuPosition({
      top: rect.bottom + 6,
      left: rect.right - 200,
      placement: "bottom",
    });
    setOpenDocumentMenuId(docId);
  }, []);

  // --- Derived State ---
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const normalizedSearch = documentSearch.toLowerCase();
      const matchesSearch =
        !documentSearch.trim() ||
        doc.name.toLowerCase().includes(normalizedSearch) ||
        (doc.description || "").toLowerCase().includes(normalizedSearch) ||
        (doc.meta || "").toLowerCase().includes(normalizedSearch) ||
        getDocumentTypeLabel(doc.documentType)
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesType =
        documentTypeFilters.length === 0 ||
        documentTypeFilters.includes(getNormalizedDocumentType(doc.documentType));

      return matchesSearch && matchesType;
    });
  }, [documents, documentSearch, documentTypeFilters]);

  const documentUploadCardFile = useMemo(() => {
    if (!documentUploadFileObject) return null;
    return {
      name: documentUploadFileName,
      size: formatUploadFileSize(documentUploadFileSize),
    };
  }, [documentUploadFileObject, documentUploadFileName, documentUploadFileSize]);

  const toggleDocumentTypeFilter = useCallback((filterKey) => {
    setDocumentTypeFilters((prev) =>
      prev.includes(filterKey)
        ? prev.filter((key) => key !== filterKey)
        : [...prev, filterKey]
    );
  }, []);

  return {
    // Data
    documents,
    setDocuments,
    documentActivityLogs,
    setDocumentActivityLogs,
    filteredDocuments,
    documentTypeFilterOptions,
    getDocumentTypeLabel,
    toggleDocumentTypeFilter,

    // Search & Filter
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

    // Menu & Selection
    openDocumentMenuId,
    setOpenDocumentMenuId,
    documentMenuPosition,
    openDocumentActionMenu,
    selectedDocumentId,
    setSelectedDocumentId,
    handleDocumentAction,

    // Upload
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

    // Rename/Delete
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

    // Toast
    showDocumentToast,
    setShowDocumentToast,
    documentToastMessage,
    documentToastVariant,
    showToast,
  };
};
