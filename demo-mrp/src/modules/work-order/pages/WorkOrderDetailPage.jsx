import React, { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { AddIcon, Box, Building2, CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronUpIcon, CloseIcon, DeleteIcon, DocumentIcon, DownloadIcon, EditIcon, Info, Minus, Plus } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { Checkbox } from "../../../components/common/Checkbox.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { Card, DateInputControl, DateRangeInputControl, DocumentTypeBadge, FormField, ImageUploadField, InputField, InputGroup, LabelValue, PhoneInputField, ProgressRing, ProofDocumentList, SectionCard, Tooltip, UploadDescriptionCard, UploadDropzone, UnifiedInputShell, focusInputFrame, blurInputFrame } from "../components/WorkOrderDetailWidgets.jsx";
import { MOCK_COMPANY } from "../../../data/company.js";
import { MOCK_VENDORS } from "../../../data/vendors.js";
import { MOCK_PO_TABLE_DATA } from "../../purchase-order/mock/purchaseOrderMocks.js";
import { MOCK_WO_TABLE_DATA } from "../mock/workOrderMocks.js";
import { getRequests, addRequest, getStockBatchesForSku } from "../../material-request/mock/materialRequestMocks.js";
import { formatCurrency, formatNumberWithCommas, parseNumberFromCommas } from "../../../utils/format/formatUtils.js";
import { normalizeProofDocuments, createUploadDocumentRecord, validateUploadFile } from "../../../utils/upload/uploadUtils.js";
import { MAX_PROOF_UPLOAD_FILES } from "../../../constants/appConstants.js";
import { buildPoLinkSnapshot } from "../../purchase-order/utils/purchaseOrderDetailUtils.js";
import { downloadVendorReleasePdf } from "../../purchase-order/utils/vendorReleasePdfExport.js";
import {
  baseInputBorderColor,
  fieldStyle,
} from "../../purchase-order/styles/purchaseOrderInputStyles.js";

export let activityLogsCache = {};

export const addWoActivityLog = (woNumber, title, desc = undefined) => {
  if (!woNumber) return;
  const d = new Date();
  const isoDate = d.toISOString().split('T')[0];
  const hrs = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  const formattedTimestamp = `${isoDate} at ${hrs}:${mins}`;
  
  if (!activityLogsCache[woNumber]) {
    activityLogsCache[woNumber] = [
      {
        name: "Natasha Smith",
        email: "natasha@company.com",
        title: "Created",
        timestamp: `2025-12-08 at 15:00`,
      }
    ];
  }
  
  activityLogsCache[woNumber] = [{
    name: "Natasha Smith",
    email: "natasha@company.com",
    title,
    desc,
    timestamp: formattedTimestamp,
  }, ...activityLogsCache[woNumber]];
};

// --- Request Material flow constants ---
// Work order id that is seeded as an already-ongoing request flow (non-zero
// requested/received quantities + an existing request history). Every other work
// order starts empty (no requests yet).
const ONGOING_REQUEST_WO = "WO-202604-002";

// Fresh BOM materials — nothing requested or received yet.
const EMPTY_BOM_MATERIALS = [
  { id: 1, type: "BOM", name: "Wooden Plank", sku: "WOD-023UDISJJDS", requiredQty: 50, requestedQty: 0, receivedQty: 0, unit: "pcs" },
  { id: 2, type: "BOM", name: "Paint", sku: "PAI-WIQIFQJFJSA", requiredQty: 5, requestedQty: 0, receivedQty: 0, unit: "liter" },
  { id: 3, type: "BOM", name: "Nail", sku: "NAI-9AIF0U092F", requiredQty: 10, requestedQty: 0, receivedQty: 0, unit: "box" },
];

// Ongoing work order: materials already have requested and/or received quantities
// from the existing material requests (see request history).
const ONGOING_BOM_MATERIALS = [
  { id: 1, type: "BOM", name: "Wooden Plank", sku: "WOD-023UDISJJDS", requiredQty: 50, requestedQty: 20, receivedQty: 25, unit: "pcs" },
  { id: 2, type: "BOM", name: "Paint", sku: "PAI-WIQIFQJFJSA", requiredQty: 5, requestedQty: 3, receivedQty: 2, unit: "liter" },
  { id: 3, type: "BOM", name: "Nail", sku: "NAI-9AIF0U092F", requiredQty: 10, requestedQty: 5, receivedQty: 0, unit: "box" },
];

const initialBomMaterials = (woId) =>
  woId === ONGOING_REQUEST_WO ? ONGOING_BOM_MATERIALS : EMPTY_BOM_MATERIALS;

// Catalog of materials available for Non-BOM requests (outside the work order BOM)
const NON_BOM_CATALOG = [
  { name: "Screw", sku: "SCR-100200300", unit: "box" },
  { name: "Glue", sku: "GLU-400500600", unit: "tube" },
  { name: "Varnish", sku: "VAR-700800900", unit: "liter" },
  { name: "Sandpaper", sku: "SND-110220330", unit: "sheet" },
];

const NON_BOM_CATEGORY_OPTIONS = [
  { value: "R&D / Trial run", label: "R&D / Trial run", description: "Testing a new material or process not yet in the standard BOM" },
  { value: "Design change", label: "Design change", description: "Product design was updated and needs a new material" },
  { value: "Material replacement", label: "Material replacement", description: "Original BOM material is unavailable, using a substitute" },
  { value: "Extra finishing", label: "Extra finishing", description: "An additional finishing step was added (e.g. coating, sanding, polishing)" },
  { value: "Production consumable", label: "Production consumable", description: "Item needed to support the production process (e.g. adhesive, abrasive)" },
  { value: "Packaging change", label: "Packaging change", description: "Packaging material changed by buyer or logistics team" },
  { value: "Other", label: "Other" },
];

const EXCEEDING_REASON_OPTIONS = [
  { value: "Material wastage", label: "Material wastage", description: "Some material will be lost during cutting, shaping, or processing" },
  { value: "Quality testing", label: "Quality testing", description: "Extra needed for testing or inspection samples" },
  { value: "Safety buffer", label: "Safety buffer", description: "Keeping extra in case of shortage or delay" },
  { value: "Rework", label: "Rework", description: "Extra needed in case some pieces need to be redone" },
  { value: "Buyer change request", label: "Buyer change request", description: "Customer changed the requirement and needs more material" },
  { value: "Machine setup", label: "Machine setup", description: "Material used during machine calibration before production starts" },
  { value: "Other", label: "Other" },
];

// Request history for the ongoing work order; other work orders start with none.
const ONGOING_REQUEST_HISTORY = [
  { id: "REQ0129032", date: "26/06/2026; 14:19", by: "Natasha Smith", status: "New Request" },
  { id: "REQ0129031", date: "12/02/2025; 15:00", by: "Anna Jones William Jonat...", status: "New Request" },
  { id: "REQ0129030", date: "10/02/2025; 15:00", by: "Richard Mille", status: "Preparing" },
  { id: "REQ0129029", date: "08/02/2025; 15:00", by: "Abigail Husni", status: "Transferring" },
  { id: "REQ0129028", date: "08/02/2025; 15:00", by: "Zoe Adams", status: "Completed" },
  { id: "REQ0129027", date: "08/02/2025; 15:00", by: "Zoe Adams", status: "Canceled" },
];

const initialRequestHistory = (woId) =>
  woId === ONGOING_REQUEST_WO ? ONGOING_REQUEST_HISTORY : [];

const REQUEST_STATUS_VARIANT = {
  "New Request": "blue",
  Preparing: "yellow",
  Transferring: "orange",
  Completed: "green",
  Canceled: "red",
};

const SearchableVendorSelect = ({
  label,
  required = false,
  value = "",
  options = [],
  placeholder = "Type to search or add vendor",
  emptyMessage = "No vendors found",
  disabled = false,
  error = "",
  onChange,
}) => {
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState(value || "");
  const [popoverPos, setPopoverPos] = useState({
    top: 0,
    left: 0,
    width: 0,
    placement: "bottom",
  });

  const selectedOption =
    options.find((option) => String(option.value) === String(value)) || null;
  const committedValue = selectedOption?.label || value || "";
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = options.filter((option) => {
    if (!normalizedQuery) return true;
    return (
      String(option.label).toLowerCase().includes(normalizedQuery) ||
      String(option.value).toLowerCase().includes(normalizedQuery)
    );
  });

  const closeMenu = () => {
    setIsOpen(false);
    setIsFocused(false);
    setQuery(committedValue);
  };

  const updatePopoverPosition = () => {
    if (!triggerRef.current || typeof window === "undefined") return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = rect.width;
    const estimatedHeight = 280;
    const shouldOpenAbove =
      window.innerHeight - rect.bottom < estimatedHeight + 16 &&
      rect.top > estimatedHeight + 16;
    const maxLeft = Math.max(8, window.innerWidth - width - 8);

    setPopoverPos({
      left: Math.min(Math.max(8, rect.left), maxLeft),
      top: shouldOpenAbove ? rect.top - 8 : rect.bottom + 8,
      width,
      placement: shouldOpenAbove ? "top" : "bottom",
    });
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    updatePopoverPosition();

    const handlePointerDown = (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return;
      }
      closeMenu();
    };
    const handleViewportChange = () => updatePopoverPosition();

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen, selectedOption?.label, options.length]);

  useEffect(() => {
    if (!isOpen) {
      setQuery(committedValue);
    }
  }, [committedValue, isOpen]);

  const selectOption = (option) => {
    onChange?.(option.value);
    setQuery(option.label);
    setIsOpen(false);
    setIsFocused(false);
  };

  return (
    <FormField label={label} required={required} error={error}>
      <div
        ref={triggerRef}
        style={{ position: "relative", width: "100%" }}
        onClick={() => {
          if (disabled) return;
          inputRef.current?.focus();
        }}
      >
        <input
          ref={inputRef}
          value={isOpen ? query : committedValue}
          onChange={(e) => {
            if (disabled) return;
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (disabled) return;
            setIsFocused(true);
            setIsOpen(true);
            setQuery(committedValue);
          }}
          onClick={() => {
            if (disabled) return;
            setIsFocused(true);
            setIsOpen(true);
          }}
          onBlur={() => {
            if (disabled) return;
            setTimeout(() => {
              if (!menuRef.current?.contains(document.activeElement)) {
                closeMenu();
              }
            }, 120);
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          style={{
            ...fieldStyle(disabled, !!committedValue || !!query, false),
            borderColor: error 
              ? "var(--status-red-primary)"
              : isFocused || isOpen
                ? "var(--feature-brand-primary)"
                : baseInputBorderColor,
            boxShadow:
              isFocused || isOpen
                ? "0 0 0 3px rgba(0, 104, 255, 0.08)"
                : "none",
            padding: "0 48px 0 16px",
            background: disabled
              ? "var(--neutral-surface-grey-lighter)"
              : "var(--neutral-surface-primary)",
            cursor: disabled ? "not-allowed" : "text",
          }}
        />
        <ChevronDownIcon
          size={20}
          color="var(--neutral-on-surface-secondary)"
          style={{
            position: "absolute",
            right: "16px",
            top: "50%",
            transform: `translateY(-50%) ${isOpen ? "rotate(180deg)" : "rotate(0deg)"}`,
            transition: "transform 0.2s ease",
            pointerEvents: "none",
          }}
        />

        {isOpen && !disabled ? (
          <>
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 10019,
              }}
              onClick={closeMenu}
            />
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                left: `${popoverPos.left}px`,
                top: `${popoverPos.top}px`,
                width: `${popoverPos.width}px`,
                transform:
                  popoverPos.placement === "top" ? "translateY(-100%)" : "none",
                background: "var(--neutral-surface-primary)",
                border: "1px solid var(--neutral-line-separator-1)",
                borderRadius: "12px",
                boxShadow: "0px 8px 20px rgba(27, 27, 27, 0.12)",
                overflow: "hidden",
                zIndex: 10020,
                maxHeight: "280px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ overflowY: "auto" }}>
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => {
                    const isSelected =
                      String(option.value) === String(value);
                    return (
                      <div
                        key={option.value}
                        onClick={() => selectOption(option)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "var(--neutral-surface-grey-lighter)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "var(--neutral-surface-primary)";
                        }}
                        style={{
                          borderTop:
                            index === 0
                              ? "none"
                              : "1px solid var(--neutral-line-separator-1)",
                          minHeight: "56px",
                          padding: "0 18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                          cursor: "pointer",
                          fontSize: "var(--text-title-2)",
                          color: "var(--neutral-on-surface-primary)",
                          background: "var(--neutral-surface-primary)",
                        }}
                      >
                        <span>{option.label}</span>
                        {isSelected ? (
                          <CheckIcon size={16} color="var(--feature-brand-primary)" />
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      padding: "16px 18px",
                      textAlign: "center",
                      fontSize: "var(--text-title-3)",
                      color: "var(--neutral-on-surface-tertiary)",
                      background: "var(--neutral-surface-primary)",
                    }}
                  >
                    {emptyMessage}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </FormField>
  );
};

export const WorkOrderDetailPage = ({ onNavigate, isSidebarCollapsed, initialData }) => {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };
  const TOTAL_QTY = initialData?.qty || 100;
  
  const [activeTab, setActiveTab] = useState("details");
  const [activityLogs, setActivityLogs] = useState(() => {
    if (initialData?.wo && activityLogsCache[initialData.wo]) {
      return activityLogsCache[initialData.wo];
    }
    
    const mockLogs = [];
    const statusKey = initialData?.statusKey || "not_started";
    const startDate = initialData?.start || "2026-03-20";
    
    if (statusKey === "canceled") {
      mockLogs.push({
        name: "Natasha Smith", email: "natasha@company.com", title: "Canceled", timestamp: `${startDate} at 14:00`
      });
    }
    
    if (statusKey === "completed") {
      const endDate = initialData?.end || "2026-04-15";
      mockLogs.push({
        name: "Natasha Smith", email: "natasha@company.com", title: "Completed", timestamp: `${endDate} at 16:00`
      });
    }
    
    if (initialData?.vendors?.length > 0) {
      initialData.vendors.forEach((vendor) => {
        if (vendor.receipts && vendor.receipts.length > 0) {
          vendor.receipts.forEach((receipt) => {
            mockLogs.push({
              name: "Natasha Smith",
              email: "natasha@company.com",
              title: "Assignment Receipt",
              desc: `Received ${receipt.amount} items for ${vendor.assignmentId || vendor.name}`,
              timestamp: `${receipt.date} at 14:00`
            });
          });
        } else if (Number(vendor.receivedOutput) > 0) {
          mockLogs.push({
            name: "Natasha Smith",
            email: "natasha@company.com",
            title: "Assignment Receipt",
            desc: `Received ${vendor.receivedOutput} items for ${vendor.assignmentId || vendor.name}`,
            timestamp: `${vendor.receivedDate || vendor.date} at 14:00`
          });
        }
      });
    }
    
    if (statusKey === "completed" || statusKey === "in_progress") {
      const routingStages = initialData?.routingStages || [];
      const changedStages = routingStages.filter(s => (s.comp || 0) > 0 || (s.prog || 0) > 0);
      
      changedStages.slice().reverse().forEach((s, idx) => {
        mockLogs.push({
          name: "Joko", 
          email: "joko@company.com", 
          title: "Routing Progress Updated", 
          desc: `Step ${s.step} now has ${s.prog || 0} items in progress and ${s.comp || 0} completed`, 
          timestamp: `${startDate} at 10:${String(idx).padStart(2, '0')}`
        });
      });
    }
    
    if (statusKey === "completed" || statusKey === "in_progress" || statusKey === "ready_to_process") {
      mockLogs.push({
        name: "Natasha Smith", email: "natasha@company.com", title: "Ready to Process", timestamp: `${startDate} at 09:00`
      });
    }
    
    const baseCreatedTs = initialData?.createdDate || initialData?.start || "2025-12-08";
    mockLogs.push({
      name: "Natasha Smith", email: "natasha@company.com", title: "Created", timestamp: `${baseCreatedTs} at 08:00`
    });

    // Ongoing work order: record each seeded material request in the activity log.
    // Material requests happen after the WO is ready to process, so any request
    // dated at/before "Ready to Process" is placed just after it (keeping order).
    if (initialData?.wo === ONGOING_REQUEST_WO) {
      const readyDate = new Date(`${startDate} at 09:00`.replace(" at ", "T"));
      ONGOING_REQUEST_HISTORY.forEach((req, i) => {
        const [datePart, timePart] = (req.date || "").split("; ");
        const [dd, mm, yyyy] = (datePart || "").split("/");
        let ts = yyyy && mm && dd ? `${yyyy}-${mm}-${dd} at ${timePart || "00:00"}` : null;
        const tsDate = ts ? new Date(ts.replace(" at ", "T")) : null;
        if (!tsDate || tsDate <= readyDate) {
          // Sit just after ready-to-process; earlier history rows get later minutes.
          const minute = ONGOING_REQUEST_HISTORY.length - i;
          ts = `${startDate} at 09:${String(minute).padStart(2, "0")}`;
        }
        mockLogs.push({
          name: req.by,
          email: `${(req.by || "user").trim().split(" ")[0].toLowerCase()}@company.com`,
          title: "Material Request",
          desc: req.id,
          timestamp: ts,
        });
      });
    }

    return mockLogs.sort((a, b) => new Date(b.timestamp.replace(" at ", "T")) - new Date(a.timestamp.replace(" at ", "T")));
  });

  useEffect(() => {
    if (initialData?.wo) {
      activityLogsCache[initialData.wo] = activityLogs;
    }
  }, [activityLogs, initialData?.wo]);

  const addActivityLog = (title, desc = undefined) => {
    const d = new Date();
    const isoDate = d.toISOString().split('T')[0];
    const hrs = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    const formattedTimestamp = `${isoDate} at ${hrs}:${mins}`;
    
    setActivityLogs(prev => [
      {
        name: "Natasha Smith",
        email: "natasha@company.com",
        title,
        desc,
        timestamp: formattedTimestamp,
      },
      ...prev
    ]);
  };

  const tabButtonStyle = (isActive) => ({
    height: "48px",
    padding: "0 28px",
    borderRadius: "100px",
    border: isActive
      ? "1px solid var(--feature-brand-primary)"
      : "1px solid transparent",
    background: isActive ? "#EAF1FF" : "var(--neutral-surface-primary)",
    color: isActive ? "var(--feature-brand-primary)" : "#7F7F7F",
    fontSize: "var(--text-title-2)",
    fontWeight: isActive
      ? "var(--font-weight-bold)"
      : "var(--font-weight-regular)",
    cursor: "pointer",
    transition: "all 0.18s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
  });

  const [isPlannedDateModalOpen, setIsPlannedDateModalOpen] = useState(false);
  const [editingPlannedDateStep, setEditingPlannedDateStep] = useState(null);
  const [plannedDateForm, setPlannedDateForm] = useState({ start: "", end: "" });

  const [displayStartDate, setDisplayStartDate] = useState(
    initialData?.statusKey === "not_started" ? "" : initialData?.start || ""
  );
  const [displayEndDate, setDisplayEndDate] = useState(
    initialData?.statusKey === "not_started" ? "" : initialData?.end || ""
  );
  const WORK_ORDER_END_DATE = displayEndDate || "2026-01-08";
  const resolveVendorProgressStatus = (vendor) => {
    const rawStatus =
      vendor?.status === "Received"
        ? "Completed"
        : (vendor?.status === "Waiting" ? "Not Started" : vendor?.status || "Not Started");
    if (vendor?.name === "Internal") return rawStatus;

    const assignedOutput = parseInt(vendor?.output || 0, 10) || 0;
    const receivedOutput = parseInt(vendor?.receivedOutput || 0, 10) || 0;

    if (assignedOutput > 0 && receivedOutput >= assignedOutput)
      return "Completed";
    if (receivedOutput > 0) return "Partially Received";
    if (
      rawStatus === "Completed" ||
      rawStatus === "Partially Received" ||
      rawStatus === "In Progress"
    )
      return rawStatus;
    const livePo = vendor?.poNumber ? MOCK_PO_TABLE_DATA.find((po) => po.poNumber === vendor.poNumber) : null;
    const isLivePoApproved = livePo ? (livePo.statusKey === "issued" || livePo.statusKey === "completed") : false;

    if (
      isLivePoApproved ||
      vendor?.isPoApproved ||
      vendor?.poStatus === "Issued" ||
      vendor?.poStatus === "Completed"
    )
      return "In Progress";
    return rawStatus;
  };

  const [outsourceSteps, setOutsourceSteps] = useState(() => {
    const cachedWo3 = initialData?.wo
      ? MOCK_WO_TABLE_DATA.find((w) => w.wo === initialData.wo)
      : null;
    return initialData?.outsourceSteps || cachedWo3?.outsourceSteps || [];
  });
  const [isReadyModalOpen, setIsReadyModalOpen] = useState(false);
  const [isConfirmReadyModalOpen, setIsConfirmReadyModalOpen] = useState(false);
  const [isManageStageModalOpen, setIsManageStageModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);

  const [isSingleVendorModalOpen, setIsSingleVendorModalOpen] = useState(false);
  const [isCreatePoModalOpen, setIsCreatePoModalOpen] = useState(false);
  const [openPoPopoverVendorId, setOpenPoPopoverVendorId] = useState(null);
  const [poPopoverPosition, setPoPopoverPosition] = useState({
    top: 0,
    left: 0,
    placement: "bottom",
  });
  const [selectedVendorForPoAction, setSelectedVendorForPoAction] =
    useState(null);
  const [isSelectExistingPoModalOpen, setIsSelectExistingPoModalOpen] =
    useState(false);
  const [selectedExistingPoNumber, setSelectedExistingPoNumber] = useState("");
  const [isConfirmRemoveModalOpen, setIsConfirmRemoveModalOpen] =
    useState(false);
  const [vendorToRemove, setVendorToRemove] = useState(null);

  const [singleVendorForm, setSingleVendorForm] = useState({
    id: null,
    name: "",
    output: "",
    date: "",
    poNumber: "",
    assignedSteps: [],
  });
  const [assignedOutputError, setAssignedOutputError] = useState("");
  const [assignedStepsError, setAssignedStepsError] = useState("");
  const [vendorNameError, setVendorNameError] = useState("");

  const [createPoForm, setCreatePoForm] = useState({
    poDate: new Date().toISOString().split("T")[0],
    deliveryDate: "",
    currency: "IDR",
    unitPrice: "",
    tax: "",
    fees: "",
    notes: "",
    terms: "",
  });

  const [isViewReceiptHistoryModalOpen, setIsViewReceiptHistoryModalOpen] =
    useState(false);
  const [receiptHistoryVendor, setReceiptHistoryVendor] = useState(null);
  const [isViewAttachmentModalOpen, setIsViewAttachmentModalOpen] =
    useState(false);
  const [attachmentToView, setAttachmentToView] = useState(null);
  const [assignmentLogTab, setAssignmentLogTab] = useState("send");
  
  const [isSendToVendorModalOpen, setIsSendToVendorModalOpen] = useState(false);
  const [selectedSendVendor, setSelectedSendVendor] = useState(null);
  const [sendAmount, setSendAmount] = useState("");
  const [sendNotes, setSendNotes] = useState("");
  const [sendBy, setSendBy] = useState("Natasha Smith");
  const [sendProofDocuments, setSendProofDocuments] = useState([]);
  const [sendProofUploadError, setSendProofUploadError] = useState("");
  const [sendProofDescriptionErrors, setSendProofDescriptionErrors] = useState({});
  const [sendErrors, setSendErrors] = useState({});

  const [stageStart, setStageStart] = useState(0);
  const [stageProg, setStageProg] = useState(0);
  const [stageOriginalProg, setStageOriginalProg] = useState(0);
  const [stageComp, setStageComp] = useState(0);
  const [stageCompInput, setStageCompInput] = useState("0");
  const [stageProgError, setStageProgError] = useState("");
  const [stageCompError, setStageCompError] = useState("");
  const [stageOriginalComp, setStageOriginalComp] = useState(0);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(null);
  const [stageTotalPool, setStageTotalPool] = useState(0);
  const [stageMaxCompletable, setStageMaxCompletable] = useState(0);
  const [
    isManageStageVendorSectionExpanded,
    setIsManageStageVendorSectionExpanded,
  ] = useState(true);

  const [openVendorMenuId, setOpenVendorMenuId] = useState(null);
  const [vendorMenuPosition, setVendorMenuPosition] = useState({
    top: 0,
    right: 0,
    placement: "bottom",
  });

  const getVendorMenuPosition = (triggerRect, menuHeight = 176) => {
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const shouldOpenAbove =
      spaceBelow < menuHeight + 12 && spaceAbove > spaceBelow;

    return {
      top: shouldOpenAbove ? triggerRect.top - 8 : triggerRect.bottom + 8,
      right: window.innerWidth - triggerRect.right,
      placement: shouldOpenAbove ? "top" : "bottom",
    };
  };

  const getPoPopoverPosition = (triggerRect, menuHeight = 96) => {
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const shouldOpenAbove =
      spaceBelow < menuHeight + 12 && spaceAbove > spaceBelow;

  return {
    top: shouldOpenAbove ? triggerRect.top - 8 : triggerRect.bottom + 8,
    left: triggerRect.left,
    placement: shouldOpenAbove ? "top" : "bottom",
  };
};

const getFilterPopoverPosition = (triggerRect, menuHeight = 320) => {
  if (!triggerRect) return { top: "160px", left: "0px", placement: "bottom" };
  const viewportHeight = window.innerHeight;
  const spaceBelow = viewportHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;
  const shouldOpenAbove = spaceBelow < menuHeight + 12 && spaceAbove > spaceBelow;

  return {
    top: shouldOpenAbove ? triggerRect.top - 8 : triggerRect.bottom + 8,
    left: triggerRect.left,
    placement: shouldOpenAbove ? "top" : "bottom",
  };
};

const poReferenceTableFrameStyle = {
  border: "none",
  borderRadius: "0",
  overflow: "hidden",
  width: "100%",
};

const poReferenceTableScrollerStyle = {
  overflowX: "hidden",
  width: "100%",
};

const poReferenceTableInnerStyle = (minWidth = "100%") => ({
  minWidth,
  width: "100%",
  display: "flex",
  flexDirection: "column",
});

const poReferenceTableHeaderRowStyle = (gridTemplateColumns) => ({
  display: "grid",
  gridTemplateColumns,
  gap: "8px",
  padding: "0 16px",
  height: "49px",
  alignItems: "center",
  background: "var(--neutral-surface-primary)",
  borderBottom: "1px solid var(--neutral-line-separator-1)",
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
});

const poReferenceTableRowStyle = (
  gridTemplateColumns,
  isLast = false,
  overrides = {}
) => ({
  display: "grid",
  gridTemplateColumns,
  gap: "8px",
  padding: "0 16px",
  minHeight: "64px",
  alignItems: "center",
  borderBottom: isLast ? "none" : "1px solid var(--neutral-line-separator-1)",
  background: "var(--neutral-surface-primary)",
  ...overrides,
});

const poReferenceTableHeaderCellStyle = (overrides = {}) => ({
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  ...overrides,
});

const poReferenceTableCellStyle = (overrides = {}) => ({
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

const poReferenceTableEmptyStateStyle = {
  padding: "32px",
  textAlign: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-tertiary)",
  background: "var(--neutral-surface-primary)",
};

const [isUploadProofModalOpen, setIsUploadProofModalOpen] = useState(false);
  const [selectedVendorForProof, setSelectedVendorForProof] = useState(null);
  const [proofDate, setProofDate] = useState("");
  const [proofDocuments, setProofDocuments] = useState([]);
  const [proofUploadError, setProofUploadError] = useState("");
  const [proofDescriptionErrors, setProofDescriptionErrors] = useState({});
  const [proofAmount, setProofAmount] = useState("");
  const [proofNote, setProofNote] = useState("");

  const [woStatus, setWoStatus] = useState(
    initialData?.statusKey || "not_started"
  );
  const isCanceled = woStatus === "canceled";
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [readyStartDate, setReadyStartDate] = useState("");
  const [readyEndDate, setReadyEndDate] = useState("");

  // --- Request Material flow state ---
  const [materials, setMaterials] = useState(() => initialBomMaterials(initialData?.wo));
  const [requestHistory, setRequestHistory] = useState(() => initialRequestHistory(initialData?.wo));
  // Ongoing work order has prior requests, so the history is available up front.
  // Other work orders only show it after a request is submitted in-session.
  const [hasSubmittedRequest, setHasSubmittedRequest] = useState(
    initialData?.wo === ONGOING_REQUEST_WO
  );
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [requestDraft, setRequestDraft] = useState([]);
  const [requestErrors, setRequestErrors] = useState({});
  const draftIdRef = useRef(1);

  const makeDraftRow = (overrides = {}) => ({
    rowId: draftIdRef.current++,
    type: "BOM",
    materialName: "",
    qty: "",
    exceedingCategory: "",
    exceedingReason: "",
    category: "",
    reason: "",
    ...overrides,
  });

  const remainingForMaterial = (name) => {
    const m = materials.find((mat) => mat.type === "BOM" && mat.name === name);
    if (!m) return null;
    return Math.max(0, m.requiredQty - m.requestedQty - m.receivedQty);
  };

  const unitForDraftRow = (row) => {
    if (row.type === "BOM") {
      const m = materials.find((mat) => mat.name === row.materialName);
      return m ? m.unit : "";
    }
    const c = NON_BOM_CATALOG.find((item) => item.name === row.materialName);
    return c ? c.unit : "";
  };

  const buildRemainingBomDraft = () =>
    materials
      .filter(
        (m) => m.type === "BOM" && m.requiredQty - m.requestedQty - m.receivedQty > 0
      )
      .map((m) =>
        makeDraftRow({
          type: "BOM",
          materialName: m.name,
          qty: String(m.requiredQty - m.requestedQty - m.receivedQty),
        })
      );

  const shortageMaterials = materials.filter(
    (m) => m.type === "BOM" && m.requiredQty - m.requestedQty - m.receivedQty > 0
  );

  const openRequestModal = (prefillRemaining = false) => {
    const draft = prefillRemaining ? buildRemainingBomDraft() : [];
    setRequestDraft(draft.length ? draft : [makeDraftRow()]);
    setRequestErrors({});
    setIsHistoryModalOpen(false);
    setIsRequestModalOpen(true);
  };

  const applyRemainingBom = () => {
    const draft = buildRemainingBomDraft();
    setRequestDraft(draft.length ? draft : [makeDraftRow()]);
    setRequestErrors({});
  };

  const updateDraftRow = (rowId, changes) => {
    setRequestDraft((rows) =>
      rows.map((r) => (r.rowId === rowId ? { ...r, ...changes } : r))
    );
  };

  const addDraftRow = () =>
    setRequestDraft((rows) => [...rows, makeDraftRow()]);

  const removeDraftRow = (rowId) =>
    setRequestDraft((rows) => rows.filter((r) => r.rowId !== rowId));

  const nextRequestId = () => {
    const latest = requestHistory[0]?.id || "REQ0000000";
    const num = parseInt(latest.replace(/\D/g, ""), 10) || 0;
    return `REQ${String(num + 1).padStart(7, "0")}`;
  };

  // Open the material request detail page in a new tab (the row lives inside a modal,
  // so we avoid replacing the current page). The history stores the display id
  // (e.g. REQ0129032); the material request store keys it as `requestId`. A fresh tab
  // has no navigation state, so we route by the id the detail page resolves with.
  const openRequestDetail = (req) => {
    const match = getRequests().find((r) => r.requestId === req.id);
    const id = match ? match.id : req.id;
    // Opened from the Work Order side → default the detail page to the Production POV.
    window.open(`/material-request/${id}?pov=production`, "_blank", "noopener");
  };

  const formatRequestTimestamp = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy}; ${hh}:${min}`;
  };

  const validateRequestDraft = () => {
    const errors = {};
    requestDraft.forEach((row) => {
      const qtyNum = parseFloat(row.qty);
      if (!row.materialName) errors[`${row.rowId}-material`] = "Field cannot be empty";
      if (row.qty === "" || isNaN(qtyNum) || qtyNum <= 0)
        errors[`${row.rowId}-qty`] = "Field cannot be empty";
      if (row.type === "BOM") {
        const remaining = remainingForMaterial(row.materialName);
        if (remaining != null && qtyNum > remaining) {
          if (!row.exceedingCategory)
            errors[`${row.rowId}-exceedingCategory`] = "Field cannot be empty";
          if (!row.exceedingReason.trim())
            errors[`${row.rowId}-exceeding`] = "Field cannot be empty";
        }
      } else {
        if (!row.category) errors[`${row.rowId}-category`] = "Field cannot be empty";
        if (!row.reason.trim()) errors[`${row.rowId}-reason`] = "Field cannot be empty";
      }
    });
    return errors;
  };

  const submitRequest = () => {
    const errors = validateRequestDraft();
    if (Object.keys(errors).length > 0) {
      setRequestErrors(errors);
      return;
    }

    const newReqId = nextRequestId();
    const timestamp = formatRequestTimestamp();

    // Build a real material request entry so its detail page can be opened.
    const requestItems = requestDraft.map((row) => {
      const qtyNum = parseFloat(row.qty) || 0;
      if (row.type === "BOM") {
        const mat = materials.find((m) => m.type === "BOM" && m.name === row.materialName);
        const remaining = mat
          ? Math.max(0, mat.requiredQty - mat.requestedQty - mat.receivedQty)
          : null;
        const isExceeding = remaining != null && qtyNum > remaining;
        const sku = mat ? mat.sku : "";
        return {
          type: "BOM",
          name: row.materialName,
          sku,
          requestedQty: qtyNum,
          unit: mat ? mat.unit : "",
          availableBatches: getStockBatchesForSku(sku),
          allocation: null,
          ...(isExceeding
            ? { exceedingReason: row.exceedingCategory, exceedingNotes: row.exceedingReason.trim() }
            : {}),
        };
      }
      const cat = NON_BOM_CATALOG.find((c) => c.name === row.materialName);
      const sku = cat ? cat.sku : "";
      return {
        type: "Non-BOM",
        name: row.materialName,
        sku,
        requestedQty: qtyNum,
        unit: cat ? cat.unit : "",
        availableBatches: getStockBatchesForSku(sku),
        allocation: null,
        requestReason: row.category,
        requestNotes: row.reason.trim(),
        justification: row.reason.trim(),
      };
    });

    addActivityLog("Material Request", newReqId);

    addRequest({
      id: newReqId,
      requestId: newReqId,
      requestedDate: timestamp,
      requestedDateRaw: new Date().toISOString().slice(0, 10),
      requestedBy: "Natasha Smith",
      workOrderNo: initialData?.wo || "",
      workOrderShort: initialData?.wo || "",
      status: "new_request",
      items: requestItems,
      logs: [
        { statusKey: "new_request", title: "Request Created", by: "Natasha Smith", timestamp },
      ],
    });

    setMaterials((prev) => {
      let next = [...prev];
      requestDraft.forEach((row) => {
        const qtyNum = parseFloat(row.qty) || 0;
        const idx = next.findIndex(
          (m) => m.type === row.type && m.name === row.materialName
        );
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            requestedQty: next[idx].requestedQty + qtyNum,
          };
        } else if (row.type === "Non-BOM") {
          const cat = NON_BOM_CATALOG.find((c) => c.name === row.materialName);
          next.push({
            id: next.length ? Math.max(...next.map((m) => m.id)) + 1 : 1,
            type: "Non-BOM",
            name: row.materialName,
            sku: cat ? cat.sku : "",
            requiredQty: null,
            requestedQty: qtyNum,
            receivedQty: 0,
            unit: cat ? cat.unit : "",
          });
        }
      });
      return next;
    });

    setRequestHistory((prev) => [
      {
        id: newReqId,
        date: timestamp,
        by: "Natasha Smith",
        status: "New Request",
      },
      ...prev,
    ]);

    setHasSubmittedRequest(true);
    setIsRequestModalOpen(false);
    setRequestDraft([]);
    setRequestErrors({});
    setToastMessage("Material successfully requested");
    setShowSuccessToast(true);
  };

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  const [vendors, setVendors] = useState(() => {
    // First try initialData.vendors (passed from navigation state, e.g. returning from PO create/detail)
    // Then fall back to MOCK_WO_TABLE_DATA so session edits are preserved across navigations
    const cachedWo = initialData?.wo
      ? MOCK_WO_TABLE_DATA.find((w) => w.wo === initialData.wo)
      : null;
    const initList = initialData?.vendors || cachedWo?.vendors || [];
    return initList.map((v) => ({
      ...v,
      receivedOutput:
        v.status === "Completed" || v.status === "Received"
          ? parseInt(v.output, 10)
          : v.receivedOutput || 0,
      status: v.status === "Waiting" ? "Not Started" : resolveVendorProgressStatus(v),
      receipts: (
        v.receipts ||
        (v.attachment
          ? [
            {
              amount: v.receivedOutput || parseInt(v.output, 10),
              date: v.receivedDate,
              attachment: v.attachment,
            },
          ]
          : [])
      ).map((receipt, index) => ({
        ...receipt,
        attachments: normalizeProofDocuments(
          receipt.attachments || receipt.proofDocuments,
          receipt.attachment
        ),
        attachment:
          receipt.attachment ||
          normalizeProofDocuments(
            receipt.attachments || receipt.proofDocuments,
            receipt.attachment
          )[0]?.name ||
          "",
        id: receipt.id || `vendor-receipt-${v.id}-${index}`,
      })),
      sendHistory: (
        v.sendHistory ||
        (v.receipts?.length > 0 || v.attachment
          ? [
            {
              releaseId: `RLS-${Math.floor(1000 + Math.random() * 9000)}`,
              time: "10:00",
              amount: v.output, // sending the full output amount initially
              date: v.startDate || v.receivedDate || v.date || "2026-03-25",
              note: "Materials successfully sent to vendor.",
              sentBy: "Natasha Smith",
              attachments: [
                {
                  id: "send-doc-01",
                  name: "delivery_note.pdf",
                  size: 512000,
                  type: "application/pdf"
                }
              ],
            },
          ]
          : [])
      ),
    }));
  });



  const [vendorSearchQuery, setVendorSearchQuery] = useState("");
  const [vendorNameFilters, setVendorNameFilters] = useState([]);
  const [vendorStatusFilters, setVendorStatusFilters] = useState([]);
  const [vendorPoFilters, setVendorPoFilters] = useState([]);
  const [includedStepsFilters, setIncludedStepsFilters] = useState([]);
  const [openVendorFilterKey, setOpenVendorFilterKey] = useState(null);
  const [vendorPopoverTriggerRect, setVendorPopoverTriggerRect] = useState(null);
  const [includedStepsSearchQuery, setIncludedStepsSearchQuery] = useState("");
  const [vendorNameSearchQuery, setVendorNameSearchQuery] = useState("");
  const [vendorPoSearchQuery, setVendorPoSearchQuery] = useState("");

  const [routingStages, setRoutingStages] = useState(() => {
    const cachedWo2 = initialData?.wo
      ? MOCK_WO_TABLE_DATA.find((w) => w.wo === initialData.wo)
      : null;
    return initialData?.routingStages || cachedWo2?.routingStages || [
      {
        step: 1,
        route: "Production Stage Firstahnders and Quality Control",
        op: "Cutting and Everything Else That Follows",
        prog: 0,
        comp: 0,
      },
      { step: 2, route: "Production Logistics", op: "Advanced Assembly", prog: 0, comp: 0 },
      { step: 3, route: "Cat / Finishing", op: "Premium Painting", prog: 0, comp: 0 },
      { step: 4, route: "Cat / Finishing", op: "High Gloss Polishing", prog: 0, comp: 0 },
      { step: 5, route: "Production Shipping", op: "Final Packing", prog: 0, comp: 0 },
    ];
  });
  const [routingUpdates, setRoutingUpdates] = useState(
    initialData?.routingUpdates || []
  );
  const [isRoutingUpdatesExpanded, setIsRoutingUpdatesExpanded] = useState(false);

  const handlePlannedDateChange = (step, value) => {
    setRoutingStages((prev) =>
      prev.map((stage) =>
        stage.step === step ? { ...stage, plannedDate: value } : stage
      )
    );
  };

  const openPlannedDateModal = (step, existingDate) => {
    setEditingPlannedDateStep(step);
    setPlannedDateForm(existingDate || { start: "", end: "" });
    setIsPlannedDateModalOpen(true);
  };

  const handleSavePlannedDateModal = () => {
    if (editingPlannedDateStep) {
      handlePlannedDateChange(editingPlannedDateStep, plannedDateForm);
    }
    setIsPlannedDateModalOpen(false);
    setEditingPlannedDateStep(null);
  };

  // Session caching: persist vendor/WO changes back to mock data so
  // navigating back from PO Create/Detail restores the latest state.
  useEffect(() => {
    if (!initialData?.wo) return;
    const woIndex = MOCK_WO_TABLE_DATA.findIndex((w) => w.wo === initialData.wo);
    if (woIndex !== -1) {
      MOCK_WO_TABLE_DATA[woIndex] = {
        ...MOCK_WO_TABLE_DATA[woIndex],
        vendors,
        routingStages,
        outsourceSteps,
        statusKey: woStatus,
        status:
          woStatus === "not_started"
            ? "Not Started"
            : woStatus === "ready_to_process"
              ? "Ready to Process"
              : woStatus === "in_progress"
                ? "In Progress"
                : woStatus === "completed"
                  ? "Completed"
                  : woStatus === "canceled"
                    ? "Canceled"
                    : MOCK_WO_TABLE_DATA[woIndex].status,
        sBadge:
          woStatus === "not_started"
            ? "grey"
            : woStatus === "ready_to_process"
              ? "blue"
              : woStatus === "in_progress"
                ? "yellow"
                : woStatus === "completed"
                  ? "green"
                  : woStatus === "canceled"
                    ? "red"
                    : MOCK_WO_TABLE_DATA[woIndex].sBadge,
        start: displayStartDate,
        end: displayEndDate,
      };
    }
  }, [vendors, routingStages, outsourceSteps, woStatus, displayStartDate, displayEndDate]);

  useEffect(() => {
    const currentTotalVendorReceived = vendors
      .filter((v) => v.name !== "Internal")
      .reduce((acc, v) => acc + (parseInt(v.receivedOutput, 10) || 0), 0);

    const hasStages = routingStages.length > 0;
    const allStagesCompleted =
      hasStages &&
      routingStages.every((stage) => {
        const vendorCompleted = vendors
          .filter((v) => v.name !== "Internal" && v.assignedSteps && v.assignedSteps.includes(stage.step))
          .reduce((acc, v) => acc + (parseInt(v.receivedOutput, 10) || 0), 0);
        return (stage.comp || 0) + vendorCompleted >= TOTAL_QTY;
      });

    // A work order can only complete once no material request is still ongoing —
    // i.e. every request is Completed/Canceled (or there is no request history).
    const hasOngoingMaterialRequest = requestHistory.some(
      (r) => r.status !== "Completed" && r.status !== "Canceled"
    );

    if (allStagesCompleted && !hasOngoingMaterialRequest && woStatus !== "completed") {
      setWoStatus("completed");
      addActivityLog("Completed");
    }
  }, [routingStages, outsourceSteps, vendors, TOTAL_QTY, woStatus, requestHistory]);

  const internalVendor = vendors.find((v) => v.name === "Internal");
  const internalOut = parseInt(internalVendor?.output || 0, 10) || 0;

  const totalVendorOutput = vendors.reduce(
    (sum, v) => sum + (parseInt(v.output, 10) || 0),
    0
  );
  const externalOut = totalVendorOutput - internalOut;

  const isVendorsValid = vendors.every(
    (v) =>
      v.name &&
      v.name.trim() !== "" &&
      v.output !== "" &&
      v.date &&
      v.date.trim() !== ""
  );

  const totalVendorReceived = vendors
    .filter((v) => v.name !== "Internal")
    .reduce((acc, v) => acc + (parseInt(v.receivedOutput, 10) || 0), 0);

  const internalStatusInfo = (() => {
    if (internalOut === 0)
      return { text: "Not Started", variant: "grey-light" };
    const maxStep = outsourceSteps.length > 0 ? Math.max(...outsourceSteps) : 0;
    const lastStage = routingStages.find((r) => r.step === maxStep);
    const internalReceived =
      parseInt(internalVendor?.receivedOutput || 0, 10) || 0;

    if (internalReceived >= internalOut && internalOut > 0)
      return { text: "Completed", variant: "green-light" };

    const hasProgress = outsourceSteps.some((step) => {
      const r = routingStages.find((x) => x.step === step);
      return r && ((r.prog || 0) > 0 || (r.comp || 0) > 0);
    });

    if (hasProgress || internalReceived > 0)
      return { text: "In Progress", variant: "yellow-light" };

    return { text: "Not Started", variant: "grey-light" };
  })();

  const stagesWithTotals = [];
  let previousEffectiveComp = TOTAL_QTY;

  routingStages.forEach((row) => {
    const vendorComp = vendors
      .filter((v) => v.name !== "Internal" && v.assignedSteps && v.assignedSteps.includes(row.step))
      .reduce((acc, v) => acc + (parseInt(v.receivedOutput, 10) || 0), 0);

    const rawTotalComp = (row.comp || 0) + vendorComp;
    const effectiveTotalComp = Math.min(rawTotalComp, previousEffectiveComp);
    const pendingQty = rawTotalComp > previousEffectiveComp ? rawTotalComp - previousEffectiveComp : 0;

    stagesWithTotals.push({
      ...row,
      vendorComp,
      totalComp: rawTotalComp,
      effectiveTotalComp,
      pendingQty,
    });

    previousEffectiveComp = effectiveTotalComp;
  });

  let firstOutsourceStart = 0;
  let isFirstOutsourceCompleted = false;
  if (outsourceSteps.length > 0) {
    const minStep = Math.min(...outsourceSteps);
    const rowIndex = stagesWithTotals.findIndex((r) => r.step === minStep);
    if (rowIndex !== -1) {
      const row = stagesWithTotals[rowIndex];
      const stepTotalPool =
        row.step === 1
          ? TOTAL_QTY
          : stagesWithTotals[rowIndex - 1]?.totalComp || 0;
      firstOutsourceStart = Math.max(
        0,
        stepTotalPool - (row.prog || 0) - (row.totalComp || 0)
      );

      if ((row.totalComp || 0) >= TOTAL_QTY) {
        isFirstOutsourceCompleted = true;
      }
    }
  }

  const handleOutsourceToggle = (step) => {
    if (outsourceSteps.includes(step)) {
      setOutsourceSteps(outsourceSteps.filter((s) => s !== step));
    } else {
      setOutsourceSteps([...outsourceSteps, step]);
    }
  };

  const handleOpenAddVendor = () => {
    setSingleVendorForm({
      id: null,
      name: "",
      output: "",
      date: "",
      poNumber: "",
      assignedSteps: [],
    });
    setAssignedOutputError("");
    setAssignedStepsError("");
    setIsSingleVendorModalOpen(true);
  };

  const handleEditVendor = (vendor) => {
    setSingleVendorForm({
      ...vendor,
      poNumber: vendor.poNumber || "",
      lockedVendorName: true,
      assignedSteps: vendor.assignedSteps || [],
    });
    setAssignedOutputError("");
    setAssignedStepsError("");
    setIsSingleVendorModalOpen(true);
  };

  const promptRemoveVendor = (vendor) => {
    setVendorToRemove(vendor);
    setIsConfirmRemoveModalOpen(true);
  };

  const executeRemoveVendor = () => {
    if (vendorToRemove) {
      if (vendorToRemove.poNumber) {
        const poIndex = MOCK_PO_TABLE_DATA.findIndex(po => po.poNumber === vendorToRemove.poNumber);
        if (poIndex !== -1) {
          const existingPo = MOCK_PO_TABLE_DATA[poIndex];
          const lines = existingPo.formData?.lines || existingPo.lines || [];
          const nextLines = lines.filter(l => l.assignmentId !== vendorToRemove.assignmentId);
          MOCK_PO_TABLE_DATA[poIndex] = {
            ...existingPo,
            ...(!existingPo.formData ? { lines: nextLines } : {}),
            formData: existingPo.formData ? {
              ...existingPo.formData,
              lines: nextLines,
            } : undefined,
          };
          
          if (existingPo.versions && existingPo.versions.length > 0) {
            const latestIdx = existingPo.versions.length - 1;
            const latestVersion = existingPo.versions[latestIdx];
            existingPo.versions[latestIdx] = {
              ...latestVersion,
              data: {
                ...latestVersion.data,
                ...(!latestVersion.data.formData ? { lines: nextLines } : {}),
                formData: latestVersion.data.formData ? {
                  ...latestVersion.data.formData,
                  lines: nextLines,
                } : undefined,
              }
            };
          }
        }
      }

      setVendors(vendors.filter((v) => v.id !== vendorToRemove.id));
      addActivityLog("Assignment Removed", `${vendorToRemove.assignmentId} for ${vendorToRemove.name}`);
      setToastMessage("Vendor successfully removed");
      setShowSuccessToast(true);
    }
    setIsConfirmRemoveModalOpen(false);
    setVendorToRemove(null);
  };

  const handleSaveSingleVendor = () => {
    setAssignedOutputError("");
    setAssignedStepsError("");
    setVendorNameError("");
    
    let hasError = false;

    if (!singleVendorForm.name) {
      setVendorNameError("Field cannot be empty");
      hasError = true;
    }

    if (!singleVendorForm.output) {
      setAssignedOutputError("Field cannot be empty");
      hasError = true;
    } else {
      const currentOtherTotal = vendors
        .filter((v) => v.id !== singleVendorForm.id)
        .reduce((sum, v) => sum + (parseInt(v.output, 10) || 0), 0);
      const proposedTotal =
        currentOtherTotal + (parseInt(singleVendorForm.output, 10) || 0);

      if (proposedTotal > TOTAL_QTY) {
        setAssignedOutputError(
          `Cannot exceed total work order quantity (${TOTAL_QTY} pcs). You have ${TOTAL_QTY - currentOtherTotal} pcs available.`
        );
        hasError = true;
      }
    }

    if (!singleVendorForm.assignedSteps || singleVendorForm.assignedSteps.length === 0) {
      setAssignedStepsError("Field cannot be empty");
      hasError = true;
    }

    if (hasError) return;

    if (singleVendorForm.assignedSteps && singleVendorForm.assignedSteps.length > 0) {
      const existingVendorAssignments = vendors.filter(v => v.name === singleVendorForm.name && v.id !== singleVendorForm.id && (v.name === "Internal" || !v.isPoApproved));
      let stepConflict = false;
      for (const assignment of existingVendorAssignments) {
        if (assignment.assignedSteps && assignment.assignedSteps.some(step => singleVendorForm.assignedSteps.includes(step))) {
          stepConflict = true;
          break;
        }
      }
      if (stepConflict) {
        setAssignedStepsError("Selected steps are already assigned to this vendor in another editable assignment.");
        return;
      }
    }

    if (singleVendorForm.name !== "Internal" && singleVendorForm.assignedSteps && singleVendorForm.assignedSteps.length > 1) {
      const sortedSelected = [...singleVendorForm.assignedSteps].sort((a, b) => a - b);
      const sortedAvailable = [...outsourceSteps].sort((a, b) => a - b);
      
      let isSequential = true;
      let startIndex = sortedAvailable.indexOf(sortedSelected[0]);
      
      for (let i = 0; i < sortedSelected.length; i++) {
        if (sortedAvailable[startIndex + i] !== sortedSelected[i]) {
          isSequential = false;
          break;
        }
      }
      
      if (!isSequential) {
        setAssignedStepsError("Selected steps must be sequential based on the allowed outsource steps.");
        return;
      }
    }

    if (editingInternalVendor) {
      const proposedOutput = parseInt(singleVendorForm.output, 10) || 0;
      if (proposedOutput < editingInternalMinimumOutput) {
        setAssignedOutputError(internalAssignedOutputErrorMessage);
        return;
      }
    }

    const fallbackVendorDate =
      singleVendorForm.date || expectedDeliveryDate || WORK_ORDER_END_DATE;
    const normalizedForm = { ...singleVendorForm, date: fallbackVendorDate };

    let finalVendors;
    let logTitle;
    let logDesc;

    const appendLineToExistingPo = (poNumber, vendorAssignment) => {
      const poIndex = MOCK_PO_TABLE_DATA.findIndex(
        (po) => po.poNumber === poNumber
      );
      if (poIndex !== -1) {
        const existingPo = MOCK_PO_TABLE_DATA[poIndex];
        const existingLines = existingPo.formData?.lines || existingPo.lines || [];
        
        const alreadyLinked = existingLines.some(
          (l) => l.assignmentId === vendorAssignment.assignmentId
        );
        if (!alreadyLinked) {
          const normalizedSteps = Array.from(
            new Set((vendorAssignment.assignedSteps || []).filter((s) => Number.isFinite(s)))
          ).sort((a, b) => a - b);
          
          let generatedDescription = `Generated from ${initialData?.wo || "work order"} with assignment ${vendorAssignment.assignmentId}.`;
          if (normalizedSteps.length > 0) {
            const stageLabels = normalizedSteps.map((step) => {
              const matchedStage = (routingStages || []).find(
                (stage) => Number(stage.step) === step
              );
              const operationName = matchedStage?.op || matchedStage?.operation;
              return operationName ? `Step ${step}: ${operationName}` : `Step ${step}`;
            });
            const stackedLabels = stageLabels.map((label) => `- ${label}`).join("\n");
            generatedDescription = `${generatedDescription} It covers these routing stages:\n${stackedLabels}`;
          }

          const newLine = {
            id: `line-${poNumber}-${vendorAssignment.assignmentId}`,
            type: "wo",
            item: `Outsourced - ${initialData?.product || "Cabinet Premium"}`,
            code: initialData?.sku || "-",
            desc: generatedDescription,
            woRef: initialData?.wo || "-",
            assignmentId: vendorAssignment.assignmentId,
            outsourceSteps: normalizedSteps,
            qty: parseInt(vendorAssignment.output || 0, 10) || 1,
            receivedQty: 0,
            price: 0,
            sourceWorkOrderLineId: `generated-work-order-line-${poNumber}-${vendorAssignment.assignmentId}`,
          };
          const nextLines = [...existingLines, newLine];
          
          MOCK_PO_TABLE_DATA[poIndex] = {
            ...existingPo,
            formData: {
              ...(existingPo.formData || {}),
              lines: nextLines,
            },
          };
          
          if (existingPo.versions && existingPo.versions.length > 0) {
            const latestIdx = existingPo.versions.length - 1;
            const latestVersion = existingPo.versions[latestIdx];
            existingPo.versions[latestIdx] = {
              ...latestVersion,
              formData: {
                ...latestVersion.formData,
                lines: nextLines,
              }
            };
          }
        }
      }
    };

    if (normalizedForm.id) {
      logTitle = "Assignment Updated";
      finalVendors = vendors.map((v) => {
        if (v.id === normalizedForm.id) {
          const updatedVendor = {
            ...v,
            ...normalizedForm,
            status: resolveVendorProgressStatus({ ...v, ...normalizedForm }),
          };
          
          logDesc = `${v.assignmentId} for ${normalizedForm.name}\nSteps: ${normalizedForm.assignedSteps ? normalizedForm.assignedSteps.join(", ") : "None"} · Qty: ${normalizedForm.output}`;

          // Link logic: update PO line qty if PO exists
          if (updatedVendor.poNumber && updatedVendor.poDetailData) {
            const nextOutput = parseInt(updatedVendor.output, 10) || 0;
            const updatedPo = { ...updatedVendor.poDetailData };
            if (updatedPo.formData && updatedPo.formData.lines) {
              updatedPo.formData.lines = updatedPo.formData.lines.map((line) => {
                if (line.type === "wo" || line.woRef === initialData?.wo) {
                  return { ...line, qty: nextOutput };
                }
                return line;
              });

              // Recalculate PO total amount
              const lineTotal = updatedPo.formData.lines.reduce(
                (sum, line) => sum + (line.qty * line.price),
                0
              );
              const feeTotal = (updatedPo.formData.feeLines || []).reduce(
                (sum, fee) => sum + (parseInt(fee.amount, 10) || 0),
                0
              );
              const subtotal = lineTotal + feeTotal;
              const taxAmount = subtotal * (updatedPo.formData.tax / 100);
              updatedPo.amount = formatCurrency(subtotal + taxAmount);
              updatedVendor.poDetailData = updatedPo;
            }
          }
          if (updatedVendor.poNumber) {
            appendLineToExistingPo(updatedVendor.poNumber, updatedVendor);
          }
          return updatedVendor;
        }
        return v;
      });
    } else {
      logTitle = "Assignment Created";
      const assignmentId = `WOA-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, "0")}`;
      logDesc = `${assignmentId} for ${normalizedForm.name}\nSteps: ${normalizedForm.assignedSteps ? normalizedForm.assignedSteps.join(", ") : "None"} · Qty: ${normalizedForm.output}`;
      
      finalVendors = [
        ...vendors,
        {
          ...normalizedForm,
          assignmentId,
          id: Date.now() + Math.random(),
          status:
            normalizedForm.name === "Internal" ? "Not Started" : "Not Started",
          receivedOutput: 0,
          isPoApproved: false,
          receipts: [],
        },
      ].map((vendor) =>
        vendor.name === "Internal"
          ? vendor
          : { ...vendor, status: resolveVendorProgressStatus(vendor) }
      );
      
      const createdVendor = finalVendors[finalVendors.length - 1];
      if (createdVendor.poNumber) {
        appendLineToExistingPo(createdVendor.poNumber, createdVendor);
      }
    }

    addActivityLog(logTitle, logDesc);
    setVendors(finalVendors);
    setIsSingleVendorModalOpen(false);
    setToastMessage("Vendor assignment successfully saved");
    setShowSuccessToast(true);
  };

  const handleOpenPoAction = (vendor) => {
    setSelectedVendorForPoAction(vendor);
    setSelectedExistingPoNumber("");
    setOpenVendorMenuId(null);
    setOpenPoPopoverVendorId(
      openPoPopoverVendorId === vendor.id ? null : vendor.id
    );
  };

  const formatRoutingStageOperationName = (step) => {
    const matchedStage = routingStages.find(
      (stage) => Number(stage.step) === Number(step)
    );
    return matchedStage?.op || matchedStage?.operation || `routing step ${step}`;
  };

  const buildOutsourceStageDescription = (steps = []) => {
    const normalizedSteps = Array.from(
      new Set(
        (steps || [])
          .map((step) => Number(step))
          .filter((step) => Number.isFinite(step))
      )
    ).sort((a, b) => a - b);

    if (normalizedSteps.length === 0) return "";
    const stageLabels = normalizedSteps.map((step) => {
      const operationName = formatRoutingStageOperationName(step);
      return operationName.startsWith('routing step') ? `Step ${step}` : `Step ${step}: ${operationName}`;
    });
    return `. It covers these routing stages:\n${stageLabels.map(l => `- ${l}`).join("\n")}`;
  };

  const buildDummyPoDetailData = (poNumber, vendor) => {
    const linkedPoDetail = vendor?.poDetailData || null;
    const basePo =
      linkedPoDetail ||
      MOCK_PO_TABLE_DATA.find((po) => po.poNumber === poNumber) || {
        poNumber,
        vendorName: vendor?.name || "Vendor",
        amount: formatCurrency(
          (parseInt(vendor?.output || 0, 10) || 0) * 250000
        ),
        createdDate: "2026-03-31",
        status: "Draft",
        statusKey: "draft",
        sBadge: "grey-light",
      };

    const vendorDetails = MOCK_VENDORS.find(
      (v) => v.name === (vendor?.name || basePo.vendorName)
    );
    const vendorOutput = parseInt(vendor?.output || 0, 10) || 0;
    const vendorReceivedOutput = Math.min(
      parseInt(vendor?.receivedOutput || 0, 10) || 0,
      vendorOutput || Number.MAX_SAFE_INTEGER
    );
    const isVendorReceiptCompleted =
      vendorOutput > 0 && vendorReceivedOutput >= vendorOutput;
    const resolvedLivePo = vendor?.poNumber ? MOCK_PO_TABLE_DATA.find((po) => po.poNumber === vendor.poNumber) : null;
    const resolvedStatus =
      isVendorReceiptCompleted
        ? "Completed"
        : resolvedLivePo?.status || vendor?.poStatus || (vendor?.isPoApproved ? "Issued" : basePo.status);
    const resolvedBadge =
      isVendorReceiptCompleted
        ? "green"
        : resolvedLivePo?.sBadge || vendor?.poBadge || (vendor?.isPoApproved ? "blue" : basePo.sBadge);
    const resolvedStatusKey =
      isVendorReceiptCompleted
        ? "completed"
        : resolvedLivePo?.statusKey || vendor?.poStatusKey || (vendor?.isPoApproved ? "issued" : basePo.statusKey);
    const assignmentText = vendor?.assignmentId ? ` with assignment ${vendor.assignmentId}` : "";
    const lineDescription = `Generated from ${initialData?.wo || "work order"}${assignmentText}${buildOutsourceStageDescription(outsourceSteps)}`;
    const receiptLogs = (vendor?.receipts || []).map((receipt, index) => ({
      id: `receipt-log-${poNumber}-${index}`,
      receiptNumber:
        receipt.receiptNumber || `RCPT-${String(index + 1).padStart(4, "0")}`,
      date: receipt.date || "-",
      time: receipt.time || "10:24",
      receivedBy: receipt.receivedBy || "Natasha Smith",
      proofDocuments: normalizeProofDocuments(
        receipt.attachments || receipt.proofDocuments,
        receipt.attachment
      ),
      notes: receipt.note || "-",
      items: [
        {
          id: `line-${poNumber}`,
          item: initialData?.product || "Cabinet Premium",
          code: initialData?.sku || "CAB-PR-9921",
          receivedNow: Number(receipt.amount) || 0,
        },
      ],
    }));
    // Always read formData from live MOCK_PO_TABLE_DATA so any newly-injected
    // lines (from handleAttachExistingPo) are reflected immediately.
    const livePo = MOCK_PO_TABLE_DATA.find((po) => po.poNumber === poNumber);
    const baseFormData = livePo?.formData || linkedPoDetail?.formData || basePo.formData || {};
    const resolvedVendorDetails = {
      phone:
        baseFormData.vendorDetails?.phone ||
        vendorDetails?.phone ||
        "08123456789",
      email:
        baseFormData.vendorDetails?.email ||
        vendorDetails?.email ||
        "vendor@email.com",
      address:
        baseFormData.vendorDetails?.address ||
        vendorDetails?.address ||
        "Vendor address",
    };
    const resolvedShipTo = {
      name: baseFormData.shipTo?.name || MOCK_COMPANY.name,
      phone: baseFormData.shipTo?.phone || MOCK_COMPANY.phone,
      email: baseFormData.shipTo?.email || MOCK_COMPANY.email,
      address: baseFormData.shipTo?.address || MOCK_COMPANY.address,
    };
    const resolvedLines =
      baseFormData.lines && baseFormData.lines.length > 0
        ? baseFormData.lines
        : (livePo?.lines && livePo.lines.length > 0
            ? livePo.lines
            : [
                {
                  id: `line-${poNumber}`,
                  type: "wo",
                  item: initialData?.product || "Cabinet Premium",
                  code: initialData?.sku || "CAB-PR-9921",
                  desc: lineDescription,
                  woRef: initialData?.wo || "-",
                  qty: vendorOutput || 1,
                  receivedQty: vendorReceivedOutput,
                  price: 250000,
                  sourceWorkOrderLineId: `generated-work-order-line-${poNumber}`,
                },
              ]);
    const resolvedFeeLines =
      baseFormData.feeLines && baseFormData.feeLines.length > 0
        ? baseFormData.feeLines
        : [{ id: "fee-1", name: "Delivery Fee", amount: 150000 }];
    const resolvedReceiptLogs =
      baseFormData.receiptLogs && baseFormData.receiptLogs.length > 0
        ? baseFormData.receiptLogs
        : receiptLogs;

    return {
      ...basePo,
      status: resolvedStatus,
      sBadge: resolvedBadge,
      statusKey: resolvedStatusKey,
      formData: {
        ...baseFormData,
        vendorName: baseFormData.vendorName || vendor?.name || basePo.vendorName,
        vendorDetails: resolvedVendorDetails,
        poDate: baseFormData.poDate || basePo.createdDate || "2026-03-31",
        deliveryDate: baseFormData.deliveryDate || vendor?.date || "2026-04-10",
        currency: baseFormData.currency || "IDR",
        createdBy: baseFormData.createdBy || basePo.createdBy || "Joko",
        lines: resolvedLines,
        receiptLogs: resolvedReceiptLogs,
        tax: baseFormData.tax ?? 11,
        feeLines: resolvedFeeLines,
        notes:
          baseFormData.notes ||
          "Dummy PO detail generated from outsource detail table click.",
        terms:
          baseFormData.terms || "Payment within 30 days from invoice date.",
        shipTo: resolvedShipTo,
      },
    };
  };

  const handleCreatePoFromVendor = () => {
    if (!selectedVendorForPoAction) return;

    const workOrderReturnData = {
      ...initialData,
      vendors,
      routingStages,
      outsourceSteps,
      statusKey: woStatus,
      status:
        woStatus === "not_started"
          ? "Not Started"
          : woStatus === "ready_to_process"
            ? "Ready to Process"
            : woStatus === "in_progress"
              ? "In Progress"
              : woStatus === "completed"
                ? "Completed"
                : initialData?.status,
      sBadge:
        woStatus === "not_started"
          ? "grey"
          : woStatus === "ready_to_process"
            ? "blue"
            : woStatus === "in_progress"
              ? "yellow"
              : woStatus === "completed"
                ? "green"
                : initialData?.sBadge,
      start: displayStartDate,
      end: displayEndDate,
    };

    setOpenPoPopoverVendorId(null);
    setOpenVendorMenuId(null);
    scrollToTop();
    onNavigate("create", {
      source: "work_order_vendor_assignment",
      vendorData: {
        ...selectedVendorForPoAction,
        ...(MOCK_VENDORS.find(v => v.id === selectedVendorForPoAction.id || v.name === selectedVendorForPoAction.name) || {})
      },
      assignedOutput: selectedVendorForPoAction.output,
      outsourceSteps: selectedVendorForPoAction.assignedSteps || [],
      workOrder: {
        wo: initialData?.wo,
        product: initialData?.product,
        sku: initialData?.sku,
        image: initialData?.image || "",
        assignmentId: selectedVendorForPoAction.assignmentId || "",
      },
      poNumber: selectedVendorForPoAction.poNumber || "",
      returnTo: {
        view: "detail",
        data: workOrderReturnData,
      },
    });
  };

  const handleOpenSelectExistingPo = () => {
    setOpenPoPopoverVendorId(null);
    setSelectedExistingPoNumber("");
    setIsSelectExistingPoModalOpen(true);
  };

  const renderPoPreviewField = (label, value, fullWidth = false) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        minWidth: 0,
        gridColumn: fullWidth ? "1 / -1" : "auto",
      }}
    >
      <span
        style={{
          fontSize: "var(--text-desc)",
          color: "var(--neutral-on-surface-tertiary)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "var(--text-title-3)",
          fontWeight: "var(--font-weight-bold)",
          color: "var(--neutral-on-surface-primary)",
          wordBreak: "break-word",
          whiteSpace: "pre-line",
          overflowWrap: "anywhere",
        }}
      >
        {value === null || value === undefined || value === "" ? "-" : value}
      </span>
    </div>
  );

  const renderPoPreviewContent = (poDetail) => {
    if (!poDetail) return null;
    const formData = poDetail.formData || {};
    const lines = formData.lines || [];
    const feeLines = formData.feeLines || [];
    const currency = formData.currency || "IDR";
    const subtotal = lines.reduce((sum, line) => {
      const qty = parseFloat(line.qty) || 0;
      const price = parseFloat(line.price) || 0;
      return sum + qty * price;
    }, 0);
    const feeTotal = feeLines.reduce((sum, fee) => {
      return sum + (parseFloat(fee.amount) || 0);
    }, 0);
    const taxRate = Number(formData.tax) || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + feeTotal + taxAmount;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: "var(--text-title-2)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
                wordBreak: "break-word",
              }}
            >
              {poDetail.poNumber}
            </span>
            <span
              style={{
                fontSize: "var(--text-body)",
                color: "var(--neutral-on-surface-tertiary)",
              }}
            >
              {poDetail.vendorName}
            </span>
          </div>
          <StatusBadge variant={poDetail.sBadge}>{poDetail.status}</StatusBadge>
        </div>

        <div
          style={{
            background: "var(--neutral-surface-primary)",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-body)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            Purchase Order Information
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            {renderPoPreviewField(
              "PO Date",
              formData.poDate || poDetail.createdDate || "-"
            )}
            {renderPoPreviewField("Expected Delivery Date", formData.deliveryDate || "-")}
            {renderPoPreviewField("Currency", formData.currency || "IDR")}
            {renderPoPreviewField("Created By", formData.createdBy || "Joko")}
          </div>
        </div>

        <div
          style={{
            background: "var(--neutral-surface-primary)",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-body)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            Vendor Information
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            {renderPoPreviewField("Vendor Name", formData.vendorName || poDetail.vendorName)}
            {renderPoPreviewField("Phone Number", formData.vendorDetails?.phone || "-")}
            {renderPoPreviewField(
              "Email address",
              formData.vendorDetails?.email || "-",
              true
            )}
            {renderPoPreviewField(
              "Address",
              formData.vendorDetails?.address || "-",
              true
            )}
          </div>
        </div>

        <div
          style={{
            background: "var(--neutral-surface-primary)",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-body)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            Ship To
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            {renderPoPreviewField("Recipient Name", formData.shipTo?.name || "-")}
            {renderPoPreviewField("Phone Number", formData.shipTo?.phone || "-")}
            {renderPoPreviewField("Email", formData.shipTo?.email || "-")}
            {renderPoPreviewField("Address", formData.shipTo?.address || "-", true)}
          </div>
        </div>

        <div
          style={{
            background: "var(--neutral-surface-primary)",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-body)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            Purchase Order Lines
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {lines.map((line, idx) => {
              const lineSubtotal =
                (parseFloat(line.qty) || 0) * (parseFloat(line.price) || 0);
              const quantityLabel =
                line.type === "material" && line.uom
                  ? `${Number(line.qty) || 0} ${line.uom}`
                  : `${Number(line.qty) || 0} pcs`;

              return (
                <div
                  key={line.id || idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid var(--neutral-line-separator-1)",
                    background: "var(--neutral-surface-primary)",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "var(--text-title-3)",
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--neutral-on-surface-primary)",
                          wordBreak: "break-word",
                        }}
                      >
                        {line.item || "-"}
                      </span>
                      <span
                        style={{
                          fontSize: "var(--text-body)",
                          color: "var(--neutral-on-surface-tertiary)",
                          wordBreak: "break-word",
                        }}
                      >
                        {line.code || "-"}
                      </span>
                    </div>
                    <StatusBadge
                      variant={
                        line.type === "wo"
                          ? "blue-light"
                          : line.type === "material"
                            ? "yellow-light"
                            : "grey-light"
                      }
                    >
                      {line.type === "wo"
                        ? "WO"
                        : line.type === "material"
                          ? "Material"
                          : "Manual"}
                    </StatusBadge>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {renderPoPreviewField("Description", line.desc || "-", true)}
                    {renderPoPreviewField("WO Ref", line.woRef || "-")}
                    {renderPoPreviewField("Quantity", quantityLabel)}
                    {renderPoPreviewField(
                      "Unit Price",
                      formatCurrency(line.price || 0, currency)
                    )}
                    {renderPoPreviewField(
                      "Subtotal",
                      formatCurrency(lineSubtotal, currency)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            background: "var(--neutral-surface-primary)",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-body)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            Summary
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                fontSize: "var(--text-title-3)",
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
                gap: "12px",
                fontSize: "var(--text-title-3)",
              }}
            >
              <span style={{ color: "var(--neutral-on-surface-secondary)" }}>
                Tax ({taxRate}%)
              </span>
              <span style={{ fontWeight: "var(--font-weight-bold)" }}>
                {formatCurrency(taxAmount, currency)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                fontSize: "var(--text-title-3)",
              }}
            >
              <span style={{ color: "var(--neutral-on-surface-secondary)" }}>
                Fees
              </span>
              <span style={{ fontWeight: "var(--font-weight-bold)" }}>
                {formatCurrency(feeTotal, currency)}
              </span>
            </div>
            <div
              style={{ borderTop: "1px solid var(--neutral-line-separator-1)" }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
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
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-body)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            Notes & Terms
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            {renderPoPreviewField("Notes", formData.notes || "-", true)}
            {renderPoPreviewField("Terms", formData.terms || "-", true)}
          </div>
        </div>
      </div>
    );
  };

  const selectedPoDetail = selectedExistingPoNumber
    ? buildDummyPoDetailData(
        selectedExistingPoNumber,
        selectedVendorForPoAction || {}
      )
    : null;


  const handleAttachExistingPo = () => {
    if (!selectedVendorForPoAction || !selectedExistingPoNumber) return;

    // Add a new WO line into the existing PO's formData.lines for this specific assignment
    const poIndex = MOCK_PO_TABLE_DATA.findIndex(
      (po) => po.poNumber === selectedExistingPoNumber
    );
    if (poIndex !== -1) {
      const existingPo = MOCK_PO_TABLE_DATA[poIndex];
      // Get lines from formData if it exists, otherwise from root lines, otherwise empty
      const existingLines = existingPo.formData?.lines || existingPo.lines || [];
      
      // Only add if this assignment doesn't already have a line
      const alreadyLinked = existingLines.some(
        (l) => l.assignmentId === selectedVendorForPoAction.assignmentId
      );
      if (!alreadyLinked) {
        const normalizedSteps = Array.from(
          new Set((selectedVendorForPoAction.assignedSteps || []).filter((s) => Number.isFinite(s)))
        ).sort((a, b) => a - b);
        
        let generatedDescription = `Generated from ${initialData?.wo || "work order"} with assignment ${selectedVendorForPoAction.assignmentId}.`;
        if (normalizedSteps.length > 0) {
          const stageLabels = normalizedSteps.map((step) => {
            const matchedStage = (routingStages || []).find(
              (stage) => Number(stage.step) === step
            );
            const operationName = matchedStage?.op || matchedStage?.operation;
            return operationName ? `Step ${step}: ${operationName}` : `Step ${step}`;
          });
          const stackedLabels = stageLabels.map((label) => `- ${label}`).join("\n");
          generatedDescription = `${generatedDescription} It covers these routing stages:\n${stackedLabels}`;
        }

        const newLine = {
          id: `line-${selectedExistingPoNumber}-${selectedVendorForPoAction.assignmentId}`,
          type: "wo",
          item: `Outsourced - ${initialData?.product || "Cabinet Premium"}`,
          code: initialData?.sku || "-",
          desc: generatedDescription,
          woRef: initialData?.wo || "-",
          assignmentId: selectedVendorForPoAction.assignmentId,
          outsourceSteps: normalizedSteps,
          qty: parseInt(selectedVendorForPoAction.output || 0, 10) || 1,
          receivedQty: 0,
          price: 0,
          sourceWorkOrderLineId: `generated-work-order-line-${selectedExistingPoNumber}-${selectedVendorForPoAction.assignmentId}`,
        };
        const nextLines = [...existingLines, newLine];
        
        MOCK_PO_TABLE_DATA[poIndex] = {
          ...existingPo,
          formData: {
            ...(existingPo.formData || {}),
            lines: nextLines,
          },
        };
        
        // If versions exist, we must also update the latest version so usePoVersions returns the new line
        if (existingPo.versions && existingPo.versions.length > 0) {
          const latestIdx = existingPo.versions.length - 1;
          const latestVersion = existingPo.versions[latestIdx];
          existingPo.versions[latestIdx] = {
            ...latestVersion,
            data: {
              ...latestVersion.data,
              ...(!latestVersion.data.formData ? { lines: nextLines } : {}),
              formData: latestVersion.data.formData ? {
                ...latestVersion.data.formData,
                lines: nextLines,
              } : undefined,
            }
          };
        }
      }
    }

    setVendors((prev) =>
      prev.map((v) => {
        if (v.id !== selectedVendorForPoAction.id) return v;
        const selectedPo = MOCK_PO_TABLE_DATA.find(
          (po) => po.poNumber === selectedExistingPoNumber
        );
        const poDetailData = buildPoLinkSnapshot(
          buildDummyPoDetailData(selectedExistingPoNumber, {
            ...v,
            poNumber: selectedExistingPoNumber,
          })
        );
        const nextVendor = {
          ...v,
          poNumber: selectedExistingPoNumber,
          isPoApproved:
            selectedPo?.statusKey === "issued" ||
            selectedPo?.statusKey === "completed",
          poStatus: poDetailData.status,
          poBadge: poDetailData.sBadge,
          poStatusKey: poDetailData.statusKey,
          poDetailData,
        };
        return {
          ...nextVendor,
          status: resolveVendorProgressStatus(nextVendor),
        };
      })
    );
    

    addActivityLog("Purchase Order Linked", `${selectedExistingPoNumber} linked to assignment ${selectedVendorForPoAction.assignmentId}`);
    setIsSelectExistingPoModalOpen(false);
    setSelectedVendorForPoAction(null);
    setSelectedExistingPoNumber("");
    setToastMessage("Purchase order successfully assigned");
    setShowSuccessToast(true);
  };

  const handleSaveNewPo = () => {
    const generatedPo = `PO-202603-${Math.floor(1000 + Math.random() * 9000)}`;

    const newVendorAssignment = {
      ...singleVendorForm,
      id: Date.now() + Math.random(),
      poNumber: generatedPo,
      status: "Not Started",
      receivedOutput: 0,
      isPoApproved: false,
      receipts: [],
    };

    const newPoData = {
      poNumber: generatedPo,
      vendorName: singleVendorForm.name || "Vendor",
      amount: formatCurrency((parseInt(singleVendorForm.output || 0, 10) || 0) * (createPoForm.unitPrice || 0)),
      createdDate: createPoForm.poDate || new Date().toISOString().split("T")[0],
      status: "Draft",
      statusKey: "draft",
      sBadge: "grey-light",
      formData: {
        vendorName: singleVendorForm.name || "Vendor",
        poDate: createPoForm.poDate,
        deliveryDate: createPoForm.deliveryDate,
        currency: createPoForm.currency,
        createdBy: "Joko",
        lines: [
          {
            id: `line-${generatedPo}-${newVendorAssignment.assignmentId}`,
            type: "wo",
            item: `Outsourced - ${initialData?.product || "Cabinet Premium"}`,
            code: initialData?.sku || "-",
            desc: `Generated from ${initialData?.wo || "work order"} with assignment ${newVendorAssignment.assignmentId}.`,
            woRef: initialData?.wo || "-",
            assignmentId: newVendorAssignment.assignmentId,
            outsourceSteps: Array.from(new Set((newVendorAssignment.assignedSteps || []).filter(s => Number.isFinite(s)))).sort((a,b)=>a-b),
            qty: parseInt(newVendorAssignment.output || 0, 10) || 1,
            receivedQty: 0,
            price: createPoForm.unitPrice || 0,
            sourceWorkOrderLineId: `generated-work-order-line-${generatedPo}-${newVendorAssignment.assignmentId}`,
          }
        ],
        receiptLogs: [],
        tax: 11,
        feeLines: [],
        notes: "Dummy PO detail generated from outsource detail table click.",
        terms: "Payment within 30 days from invoice date.",
        shipTo: {
          name: "Central Warehouse",
          address: "Jl. Industri No. 10, Jakarta",
          phone: "+62 21 555-0199",
        }
      }
    };
    MOCK_PO_TABLE_DATA.push(newPoData);

    let updatedVendors = vendors.filter((v) => v.id !== singleVendorForm.id);
    updatedVendors.push(newVendorAssignment);

    const newInternal = updatedVendors.find((v) => v.name === "Internal");
    const newInternalOut = parseInt(newInternal?.output || 0, 10) || 0;
    const maxStep = outsourceSteps.length > 0 ? Math.max(...outsourceSteps) : 0;
    const lastStage = routingStages.find((r) => r.step === maxStep);

    setVendors(
      updatedVendors.map((v) => {
        if (v.name === "Internal") {
          if (
            newInternalOut > 0 &&
            lastStage &&
            (lastStage.comp || 0) >= newInternalOut
          ) {
            return {
              ...v,
              receivedDate:
                v.receivedDate || new Date().toISOString().split("T")[0],
            };
          } else {
            return { ...v, receivedDate: "" };
          }
        }
        return v;
      })
    );

    addActivityLog("Purchase Order Linked", `${generatedPo} linked to assignment ${newVendorAssignment.assignmentId}`);
    setIsCreatePoModalOpen(false);
    setToastMessage(
      "Purchase order successfully created"
    );
    setShowSuccessToast(true);
  };

  const handleVendorProofFilesSelected = (files) => {
    const incomingFiles = Array.from(files || []);
    if (incomingFiles.length === 0) return;

    let nextError = "";
    setProofDocuments((prev) => {
      const nextDocuments = [...prev];
      incomingFiles.forEach((file) => {
        if (nextDocuments.length >= MAX_PROOF_UPLOAD_FILES) {
          nextError = "Max 3 files, 25MB each";
          return;
        }
        const validationMessage = validateUploadFile(file);
        if (validationMessage) {
          nextError = validationMessage;
          return;
        }
        nextDocuments.push(
          createUploadDocumentRecord(file, { description: "" })
        );
      });
      return nextDocuments;
    });
    setProofDescriptionErrors({});
    setProofUploadError(nextError);
  };

  const updateVendorProofDescription = (docId, value) => {
    setProofDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, description: value } : doc
      )
    );
    setProofUploadError("");
    setProofDescriptionErrors((prev) => ({ ...prev, [docId]: "" }));
  };

  const removeVendorProofDocument = (docId) => {
    setProofDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    setProofDescriptionErrors((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
    setProofUploadError("");
  };

  const handleSendProofFilesSelected = (files) => {
    const incomingFiles = Array.from(files || []);
    if (incomingFiles.length === 0) return;

    let nextError = "";
    setSendProofDocuments((prev) => {
      const nextDocuments = [...prev];
      incomingFiles.forEach((file) => {
        if (nextDocuments.length >= MAX_PROOF_UPLOAD_FILES) {
          nextError = "Max 3 files, 25MB each";
          return;
        }
        const validationMessage = validateUploadFile(file);
        if (validationMessage) {
          nextError = validationMessage;
          return;
        }
        nextDocuments.push(
          createUploadDocumentRecord(file, { description: "" })
        );
      });
      return nextDocuments;
    });
    setSendProofDescriptionErrors({});
    setSendProofUploadError(nextError);
  };

  const updateSendProofDescription = (docId, value) => {
    setSendProofDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, description: value } : doc
      )
    );
    setSendProofUploadError("");
    setSendProofDescriptionErrors((prev) => ({ ...prev, [docId]: "" }));
  };

  const removeSendProofDocument = (docId) => {
    setSendProofDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    setSendProofDescriptionErrors((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
    setSendProofUploadError("");
  };

  const handleSendToVendor = () => {
    const errors = {};
    if (!sendBy) errors.sendBy = "Field cannot be empty";
    if (!sendAmount) errors.sendAmount = "Field cannot be empty";
    if (sendProofDocuments.length === 0) {
      setSendProofUploadError("Field cannot be empty");
    }

    if (Object.keys(errors).length > 0 || sendProofDocuments.length === 0) {
      setSendErrors(errors);
      return;
    }

    const normalizedProofDocuments = sendProofDocuments.map((doc) => ({
      ...doc,
      description: (doc.description || "").trim(),
    }));

    setVendors(
      vendors.map((v) => {
        if (v.id === selectedSendVendor?.id) {
          const addedAmount = parseInt(sendAmount, 10) || 0;
          const currentSent = parseInt(v.sentOutput || 0, 10);
          
          const now = new Date();
          const newSendHistoryRecord = {
            date: now.toISOString().split("T")[0],
            time: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
            releaseId: `RLS-${Math.floor(1000 + Math.random() * 9000)}`,
            amount: addedAmount,
            note: sendNotes,
            sendBy: sendBy,
            attachments: normalizedProofDocuments,
          };

          return {
            ...v,
            sentOutput: currentSent + addedAmount,
            sendHistory: [...(v.sendHistory || []), newSendHistoryRecord],
          };
        }
        return v;
      })
    );

    addActivityLog("Item Released to Vendor", `Sent ${sendAmount} items to ${selectedSendVendor?.name} for assignment ${selectedSendVendor?.assignmentId}`);
    setIsSendToVendorModalOpen(false);
    setSelectedSendVendor(null);
    setSendAmount("");
    setSendNotes("");
    setSendProofDocuments([]);
    setSendErrors({});
    setSendProofUploadError("");
    setToastMessage("Items released to vendor successfully");
    setShowSuccessToast(true);
  };

  const handleReceiveVendor = () => {
    const normalizedProofDocuments = proofDocuments.map((doc) => ({
      ...doc,
      description: (doc.description || "").trim(),
    }));
    const nextDescriptionErrors = {};

    if (!isInternalProof) {
      if (normalizedProofDocuments.length === 0) {
        setProofUploadError("Upload at least one proof document");
        return;
      }

      normalizedProofDocuments.forEach((doc) => {
        if (!doc.description)
          nextDescriptionErrors[doc.id] = "Description is required";
      });

      if (Object.keys(nextDescriptionErrors).length > 0) {
        setProofDescriptionErrors(nextDescriptionErrors);
        setProofUploadError("Add description for each proof document");
        return;
      }
    }

    let logReceivedAmount = 0;
    let logAssignmentId = "";

    setVendors(
      vendors.map((v) => {
        if (v.id === selectedVendorForProof) {
          const addedAmount = parseInt(proofAmount, 10) || 0;
          logReceivedAmount = addedAmount;
          logAssignmentId = v.assignmentId || "";
          
          const newReceipt = {
            amount: addedAmount,
            date: proofDate,
            attachment:
              normalizedProofDocuments[0]?.name || "No Document Provided",
            attachments: normalizedProofDocuments,
            note: proofNote || "-",
          };
          const updatedReceipts = [...(v.receipts || []), newReceipt];
          const newTotalReceived = updatedReceipts.reduce(
            (sum, r) => sum + r.amount,
            0
          );
          const targetOutput = parseInt(v.output, 10) || 0;
          const isFullyReceived =
            newTotalReceived >= targetOutput && targetOutput > 0;
          const newStatus = isFullyReceived
            ? "Completed"
            : "Partially Received";

          return {
            ...v,
            receivedOutput: newTotalReceived,
            status: newStatus,
            receipts: updatedReceipts,
            receivedDate: isFullyReceived ? proofDate : "",
          };
        }
        return v;
      })
    );

    if (logAssignmentId) {
      addActivityLog("Assignment Receipt", `Received ${logReceivedAmount} for ${logAssignmentId}`);
    }
    setIsUploadProofModalOpen(false);
    setProofDocuments([]);
    setProofUploadError("");
    setProofDescriptionErrors({});
    setProofAmount("");
    setProofDate("");
    setProofNote("");
    setToastMessage("Vendor output successfully received");
    setShowSuccessToast(true);
  };

  useEffect(() => {
    const internal = vendors.find((v) => v.name === "Internal");
    if (!internal || internalOut === 0 || outsourceSteps.length === 0) return;

    const maxStep = Math.max(...outsourceSteps);
    const lastStage = routingStages.find((r) => r.step === maxStep);
    const completedAtLastStage = parseInt(lastStage?.comp || 0, 10) || 0;
    const targetReceived = Math.min(internalOut, completedAtLastStage);
    const currentReceived = parseInt(internal.receivedOutput || 0, 10) || 0;

    if (targetReceived <= currentReceived) return;

    const delta = targetReceived - currentReceived;
    const today = new Date().toISOString().split("T")[0];

    setVendors((prev) =>
      prev.map((v) => {
        if (v.name !== "Internal") return v;
        const assignedOutput = parseInt(v.output, 10) || 0;
        const isFullyReceived =
          targetReceived >= assignedOutput && assignedOutput > 0;
        return {
          ...v,
          receivedOutput: targetReceived,
          receivedDate: isFullyReceived ? today : "",
          status: isFullyReceived ? "Completed" : "Partially Received",
          receipts: [
            ...(v.receipts || []),
            {
              amount: delta,
              date: today,
              attachment: "Internal routing completion",
              note: "Work Order-recorded from internal routing completion.",
            },
          ],
        };
      })
    );
  }, [routingStages, outsourceSteps, internalOut]);

  const renderAllocationBar = (currentTotalOutput, variant = "full") => {
    const percentage = Math.min((currentTotalOutput / TOTAL_QTY) * 100, 100);
    const isExceeded = currentTotalOutput > TOTAL_QTY;
    const isFull = currentTotalOutput === TOTAL_QTY;
    const color = isExceeded
      ? "var(--status-red-primary)"
      : isFull
        ? "var(--status-green-primary)"
        : "var(--feature-brand-primary)";

    if (variant === "mini") {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "260px",
          }}
        >
          <div
            style={{
              height: "6px",
              flex: 1,
              background: "var(--neutral-line-separator-2)",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${percentage}%`,
                background: color,
                transition: "all 0.3s ease",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "var(--text-body)",
              fontWeight: "var(--font-weight-bold)",
              color: isExceeded
                ? "var(--status-red-primary)"
                : "var(--neutral-on-surface-primary)",
              whiteSpace: "nowrap",
            }}
          >
            {isExceeded && <span style={{ fontWeight: "normal", marginRight: "4px" }}>Exceeds req. qty</span>}
            {currentTotalOutput} / {TOTAL_QTY} pcs
          </span>
        </div>
      );
    }
    return null;
  };

  const selectedVendorObj = vendors.find(
    (v) => v.id === selectedVendorForProof
  );
  const isInternalProof = selectedVendorObj?.name === "Internal";
  const selectedVendorDetails =
    MOCK_VENDORS.find((v) => v.name === singleVendorForm.name) || {};
  const vendorNameOptions = (() => {
    const baseNames = ["Internal", ...MOCK_VENDORS.map((vendor) => vendor.name)];
    const uniqueNames = Array.from(
      new Set(baseNames.filter((name) => !!name && String(name).trim() !== ""))
    );

    return uniqueNames.map((name) => ({ value: name, label: name }));
  })();
  const editingInternalVendor =
    !!singleVendorForm.id && singleVendorForm.name === "Internal";
  const editingInternalReceivedOutput = editingInternalVendor
    ? vendors.find((v) => v.id === singleVendorForm.id)?.receivedOutput || 0
    : 0;
  const editingInternalProcessedOutput = editingInternalVendor
    ? routingStages
      .filter((s) => outsourceSteps.includes(s.step))
      .reduce((maxProcessed, stage) => {
        const processedCount =
          (parseInt(stage.prog || 0, 10) || 0) +
          (parseInt(stage.comp || 0, 10) || 0);
        return Math.max(maxProcessed, processedCount);
      }, 0)
    : 0;
  const editingInternalMinimumOutput = Math.max(
    editingInternalReceivedOutput,
    editingInternalProcessedOutput
  );
  const internalAssignedOutputErrorMessage = `Minimum is ${editingInternalMinimumOutput} pcs due to existing progress.`;
  const selectedStageData = selectedStage
    ? stagesWithTotals.find(
      (stage) => Number(stage.step) === Number(selectedStage.step)
    ) || selectedStage
    : null;
  const isSelectedStageOutsourced =
    !!selectedStageData && outsourceSteps.includes(selectedStageData.step);
  const selectedStageIndex = selectedStageData
    ? stagesWithTotals.findIndex(
      (stage) => Number(stage.step) === Number(selectedStageData.step)
    )
    : -1;
  const selectedStageAvailablePool =
    selectedStageIndex === -1
      ? 0
      : selectedStageIndex === 0
        ? TOTAL_QTY
        : stagesWithTotals[selectedStageIndex - 1]?.totalComp || 0;
  const selectedStageVendorCompleted = selectedStageData?.vendorComp || 0;
  const selectedStageYetToStart = Math.max(
    0,
    selectedStageAvailablePool -
    (stageProg || 0) -
    ((stageComp || 0) + selectedStageVendorCompleted)
  );
  const internalProgressCapacity = Math.max(0, stageTotalPool - stageComp);
  const internalCompletionCapacity = Math.max(0, stageTotalPool);
  const stepperActionButtonBaseStyle = {
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  };
  const getVendorStatusMeta = (vendor) => {
    if (vendor?.name === "Internal") {
      return {
        text: internalStatusInfo.text,
        variant: internalStatusInfo.variant,
      };
    }

    const resolvedVendorStatus = resolveVendorProgressStatus(vendor);
    return {
      text: resolvedVendorStatus,
      variant:
        resolvedVendorStatus === "Completed"
          ? "green-light"
          : resolvedVendorStatus === "Partially Received"
            ? "blue-light"
            : resolvedVendorStatus === "In Progress"
               ? "yellow-light"
               : "grey-light",
    };
  };
  const poOptions =
    singleVendorForm.name && singleVendorForm.name !== "Internal"
      ? MOCK_PO_TABLE_DATA.filter(
          (po) =>
            po.vendorName === singleVendorForm.name &&
            (po.statusKey === "draft" || po.statusKey === "need_revision")
        ).map((po) => ({ value: po.poNumber, label: po.poNumber }))
      : [];

  const selectedVendorPoDetail = singleVendorForm.poNumber
    ? buildDummyPoDetailData(singleVendorForm.poNumber, singleVendorForm)
    : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 64px)",
        position: "relative",
      }}
    >
      {showSuccessToast ? (
        <div
          style={{
            position: "fixed",
            top: "84px",
            right: "24px",
            background: "var(--status-green-primary)",
            color: "var(--status-green-on-primary)",
            padding: "12px 16px",
            borderRadius: "var(--radius-small)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "var(--elevation-sm)",
            zIndex: 1000,
            minWidth: "350px",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "var(--text-title-3)" }}>
            {toastMessage}
          </span>
          <span
            style={{
              fontWeight: "var(--font-weight-bold)",
              cursor: "pointer",
              fontSize: "var(--text-title-3)",
            }}
            onClick={() => setShowSuccessToast(false)}
          >
            Okay
          </span>
        </div>
      ) : null}

      {/* Request Material drawer */}
      {isRequestModalOpen ? (
        <div
          className="ds-modal-overlay"
          style={{
            "--ds-modal-z-index": 5000,
            justifyContent: "flex-end",
            alignItems: "stretch",
            padding: 0,
          }}
          onClick={() => setIsRequestModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "560px",
              maxWidth: "100%",
              height: "100%",
              background: "var(--neutral-surface-primary)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "var(--elevation-lg)",
            }}
          >
            {/* Drawer header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                flexShrink: 0,
              }}
            >
              <h2 className="ds-modal-title" style={{ margin: 0 }}>
                Request Material
              </h2>
              <IconButton
                icon={CloseIcon}
                size="small"
                onClick={() => setIsRequestModalOpen(false)}
                color="var(--neutral-on-surface-primary)"
              />
            </div>

            {/* Drawer body */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
          {/* Quick Add banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              padding: "16px",
              borderRadius: "var(--radius-medium)",
              background: "var(--feature-brand-container-lighter)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "var(--radius-small)",
                  background: "var(--feature-brand-container-darker)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"
                    fill="#005DE0"
                  />
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  Quick Add Required Materials
                </span>
                <span
                  style={{
                    fontSize: "var(--text-title-3)",
                    color: "var(--neutral-on-surface-secondary)",
                  }}
                >
                  This will replace current selections with all required
                </span>
              </div>
            </div>
            <Button variant="outlined" onClick={applyRemainingBom}>
              Apply Remaining BOM
            </Button>
          </div>

          {/* Draft rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                gap: "12px",
                paddingTop: "8px",
                paddingBottom: "8px",
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                fontWeight: "var(--font-weight-bold)",
                fontSize: "var(--text-title-3)",
                position: "sticky",
                top: "-24px",
                background: "var(--neutral-surface-primary)",
                zIndex: 1,
              }}
            >
              <div style={{ width: "150px", flexShrink: 0 }}>Type</div>
              <div style={{ flex: "1.4" }}>Material</div>
              <div style={{ flex: "1" }}>Quantity</div>
              <div style={{ width: "40px" }} />
            </div>

            {requestDraft.map((row, rowIndex) => {
              const remaining = remainingForMaterial(row.materialName);
              const qtyNum = parseFloat(row.qty);
              const isExceeding =
                row.type === "BOM" &&
                remaining != null &&
                !isNaN(qtyNum) &&
                qtyNum > remaining;
              const materialOptions =
                row.type === "BOM"
                  ? materials
                      .filter((m) => m.type === "BOM")
                      .map((m) => ({ value: m.name, label: m.name, sku: m.sku }))
                  : NON_BOM_CATALOG.map((c) => ({ value: c.name, label: c.name, sku: c.sku }));
              const unit = unitForDraftRow(row);
              const err = (key) => requestErrors[`${row.rowId}-${key}`];
              const errStyle = {
                color: "var(--status-red-primary)",
                fontSize: "12px",
                marginTop: "4px",
                display: "block",
              };
              const reqLabelStyle = { fontSize: "var(--text-title-3)" };
              return (
                <div
                  key={row.rowId}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    paddingBottom: "16px",
                    borderBottom:
                      rowIndex < requestDraft.length - 1
                        ? "1px solid var(--neutral-line-separator-1)"
                        : "none",
                  }}
                >
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ width: "150px", flexShrink: 0 }}>
                      <DropdownSelect
                        value={row.type}
                        options={["BOM", "Non-BOM"]}
                        onChange={(val) =>
                          updateDraftRow(row.rowId, {
                            type: val,
                            materialName: "",
                            qty: "",
                            exceedingCategory: "",
                            exceedingReason: "",
                            category: "",
                            reason: "",
                          })
                        }
                      />
                    </div>
                    <div style={{ flex: "1.4" }}>
                      <DropdownSelect
                        value={row.materialName}
                        options={materialOptions}
                        placeholder="Select Material"
                        searchable
                        searchPlaceholder="Search material name or SKU"
                        hasError={!!err("material")}
                        onChange={(val) =>
                          updateDraftRow(row.rowId, { materialName: val })
                        }
                        renderOption={(option, selected) => (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "left" }}>
                            <span
                              style={{
                                fontSize: "var(--text-title-3)",
                                fontWeight: selected ? "var(--font-weight-bold)" : "var(--font-weight-regular)",
                                color: selected ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-primary)",
                              }}
                            >
                              {option.label}
                            </span>
                            {option.sku && (
                              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
                                {option.sku}
                              </span>
                            )}
                          </div>
                        )}
                      />
                      {err("material") && <span style={errStyle}>{err("material")}</span>}
                    </div>
                    <div style={{ flex: "1" }}>
                      <InputField
                        type="number"
                        placeholder="0"
                        value={row.qty}
                        onChange={(e) =>
                          updateDraftRow(row.rowId, { qty: e.target.value })
                        }
                        suffix={unit || undefined}
                        error={err("qty") || undefined}
                      />
                      {row.type === "BOM" && remaining != null && row.materialName ? (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--neutral-on-surface-tertiary)",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          Remaining: {remaining} {unit}
                        </span>
                      ) : null}
                    </div>
                    <div
                      style={{
                        width: "40px",
                        height: "48px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <IconButton
                        icon={DeleteIcon}
                        disabled={requestDraft.length === 1}
                        onClick={() => removeDraftRow(row.rowId)}
                        color="var(--status-red-primary)"
                      />
                    </div>
                  </div>

                  {/* Exceeding reason (BOM) */}
                  {isExceeding ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        padding: "16px",
                        borderRadius: "var(--radius-medium)",
                        background: "var(--neutral-surface-grey-lighter)",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={reqLabelStyle}>
                          <span style={{ color: "var(--status-red-primary)" }}>*</span>
                          Exceeding Reason
                        </span>
                        <DropdownSelect
                          value={row.exceedingCategory}
                          options={EXCEEDING_REASON_OPTIONS}
                          placeholder="Select Exceeding Reason"
                          hasError={!!err("exceedingCategory")}
                          onChange={(val) =>
                            updateDraftRow(row.rowId, { exceedingCategory: val })
                          }
                          renderOption={(option, selected) => (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "left" }}>
                              <span
                                style={{
                                  fontSize: "var(--text-title-3)",
                                  fontWeight: selected ? "var(--font-weight-bold)" : "var(--font-weight-regular)",
                                  color: selected ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-primary)",
                                }}
                              >
                                {option.label}
                              </span>
                              {option.description && (
                                <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", lineHeight: 1.5 }}>
                                  {option.description}
                                </span>
                              )}
                            </div>
                          )}
                        />
                        {err("exceedingCategory") && <span style={errStyle}>{err("exceedingCategory")}</span>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={reqLabelStyle}>
                            <span style={{ color: "var(--status-red-primary)" }}>*</span>
                            Notes
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--neutral-on-surface-tertiary)",
                            }}
                          >
                            {row.exceedingReason.length}/400
                          </span>
                        </div>
                        <textarea
                          value={row.exceedingReason}
                          maxLength={400}
                          placeholder="Explain why the requested quantity exceeds the remaining BOM quantity"
                          onChange={(e) =>
                            updateDraftRow(row.rowId, { exceedingReason: e.target.value })
                          }
                          style={{
                            minHeight: "80px",
                            padding: "12px 16px",
                            width: "100%",
                            boxSizing: "border-box",
                            resize: "vertical",
                            borderRadius: "var(--radius-small)",
                            background: "var(--neutral-surface-primary)",
                            border: `1px solid ${
                              err("exceeding")
                                ? "var(--status-red-primary)"
                                : "var(--neutral-line-separator-1)"
                            }`,
                            fontSize: "var(--text-title-3)",
                            fontFamily: "inherit",
                          }}
                        />
                        {err("exceeding") && <span style={errStyle}>{err("exceeding")}</span>}
                      </div>
                    </div>
                  ) : null}

                  {/* Justification (Non-BOM) */}
                  {row.type === "Non-BOM" ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        padding: "16px",
                        borderRadius: "var(--radius-medium)",
                        background: "var(--neutral-surface-grey-lighter)",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={reqLabelStyle}>
                          <span style={{ color: "var(--status-red-primary)" }}>*</span>
                          Request Reason
                        </span>
                        <DropdownSelect
                          value={row.category}
                          options={NON_BOM_CATEGORY_OPTIONS}
                          placeholder="Select Request Reason"
                          hasError={!!err("category")}
                          onChange={(val) =>
                            updateDraftRow(row.rowId, { category: val })
                          }
                          renderOption={(option, selected) => (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "left" }}>
                              <span
                                style={{
                                  fontSize: "var(--text-title-3)",
                                  fontWeight: selected ? "var(--font-weight-bold)" : "var(--font-weight-regular)",
                                  color: selected ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-primary)",
                                }}
                              >
                                {option.label}
                              </span>
                              {option.description && (
                                <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", lineHeight: 1.5 }}>
                                  {option.description}
                                </span>
                              )}
                            </div>
                          )}
                        />
                        {err("category") && <span style={errStyle}>{err("category")}</span>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={reqLabelStyle}>
                            <span style={{ color: "var(--status-red-primary)" }}>*</span>
                            Notes
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--neutral-on-surface-tertiary)",
                            }}
                          >
                            {row.reason.length}/400
                          </span>
                        </div>
                        <textarea
                          value={row.reason}
                          maxLength={400}
                          placeholder="Explain why this material is needed outside the BOM"
                          onChange={(e) =>
                            updateDraftRow(row.rowId, { reason: e.target.value })
                          }
                          style={{
                            minHeight: "80px",
                            padding: "12px 16px",
                            width: "100%",
                            boxSizing: "border-box",
                            resize: "vertical",
                            borderRadius: "var(--radius-small)",
                            background: "var(--neutral-surface-primary)",
                            border: `1px solid ${
                              err("reason")
                                ? "var(--status-red-primary)"
                                : "var(--neutral-line-separator-1)"
                            }`,
                            fontSize: "var(--text-title-3)",
                            fontFamily: "inherit",
                          }}
                        />
                        {err("reason") && <span style={errStyle}>{err("reason")}</span>}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}

            <div>
              <Button variant="tertiary" leftIcon={AddIcon} onClick={addDraftRow}>
                Add Material
              </Button>
            </div>
          </div>
            </div>

            {/* Drawer footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--neutral-line-separator-1)",
                flexShrink: 0,
              }}
            >
              <Button
                variant="filled"
                size="large"
                style={{ width: "100%" }}
                onClick={submitRequest}
              >
                Submit Request
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Request Material History modal */}
      <GeneralModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Request Material History"
        width="720px"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {shortageMaterials.length > 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                padding: "16px",
                borderRadius: "var(--radius-medium)",
                background: "#FFEDD5",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Info color="var(--status-orange-primary)" />
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span
                    style={{
                      fontSize: "var(--text-title-2)",
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    {shortageMaterials.length} Materials Shortage
                  </span>
                  <span
                    style={{
                      fontSize: "var(--text-title-3)",
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    You have {shortageMaterials.length} shortage materials from{" "}
                    {requestHistory[0]?.id || ""}
                  </span>
                </div>
              </div>
              <Button variant="outlined" onClick={() => openRequestModal(true)}>
                Request Shortage
              </Button>
            </div>
          ) : null}

          <div
            style={{
              border: "1px solid var(--neutral-line-separator-1)",
              borderRadius: "var(--radius-medium)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "12px 16px",
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                fontWeight: "var(--font-weight-bold)",
                fontSize: "var(--text-title-3)",
              }}
            >
              <div style={{ flex: "1" }}>Request ID</div>
              <div style={{ flex: "1" }}>Requested Date</div>
              <div style={{ flex: "1" }}>Requested By</div>
              <div style={{ flex: "0.7" }}>Status</div>
            </div>
            {requestHistory.map((req) => (
              <div
                key={req.id}
                onClick={() => openRequestDetail(req)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "16px",
                  borderBottom: "1px solid var(--neutral-line-separator-1)",
                  fontSize: "var(--text-title-3)",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
              >
                <div
                  style={{
                    flex: "1",
                    color: "var(--feature-brand-primary)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  {req.id}
                </div>
                <div style={{ flex: "1" }}>{req.date}</div>
                <div
                  style={{
                    flex: "1",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    paddingRight: "8px",
                  }}
                >
                  {req.by}
                </div>
                <div style={{ flex: "0.7" }}>
                  <StatusBadge
                    variant={REQUEST_STATUS_VARIANT[req.status] || "grey"}
                  >
                    {req.status}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GeneralModal>

      <div
        style={{
          padding: "24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          paddingBottom: woStatus === "not_started" ? "100px" : "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "8px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                marginLeft: "-4px",
              }}
              onClick={() => {
                if (initialData?.returnTo) {
                  onNavigate(
                    `purchase_order_${initialData.returnTo.view}`,
                    initialData.returnTo.data
                  );
                } else {
                  onNavigate("list");
                }
              }}
            >
              <ChevronLeftIcon
                size={28}
                color="var(--neutral-on-surface-primary)"
              />
              <h1
                style={{
                  margin: 0,
                  fontSize: "var(--text-large-title)",
                  fontWeight: "var(--font-weight-bold)",
                }}
              >
                Work Order Detail
              </h1>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "var(--text-title-3)",
              }}
            >
              <span
                style={{
                  color: "var(--neutral-on-surface-secondary)",
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (initialData?.returnTo) {
                    onNavigate(
                      `purchase_order_${initialData.returnTo.view}`,
                      initialData.returnTo.data
                    );
                  } else {
                    onNavigate("list");
                  }
                }}
              >
                Work Order
              </span>
              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>
                /
              </span>
              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>
                Work Order Detail
              </span>
            </div>
          </div>
          {!isCanceled && <Button variant="outlined">Edit Work Order</Button>}
        </div>

        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-headline)",
                fontWeight: "var(--font-weight-bold)",
              }}
            >
              {initialData?.wo || "WO-2294824-20251109-00001"}
            </span>
            {woStatus === "not_started" ? (
              <StatusBadge variant="grey">Not Started</StatusBadge>
            ) : null}
            {woStatus === "ready_to_process" ? (
              <StatusBadge variant="blue">Ready to Process</StatusBadge>
            ) : null}
            {woStatus === "in_progress" ? (
              <StatusBadge variant="yellow">In Progress</StatusBadge>
            ) : null}
            {woStatus === "completed" ? (
              <StatusBadge variant="green">Completed</StatusBadge>
            ) : null}
            {woStatus === "canceled" ? (
              <StatusBadge variant="red">Canceled</StatusBadge>
            ) : null}
          </div>
          <div
            style={{ borderTop: "1px solid var(--neutral-line-separator-1)" }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "24px",
            }}
          >
            <LabelValue
              label="Order Number"
              value={initialData?.ord || "ORD-248824-20251109-00001"}
            />
            <LabelValue
              label="Planned Start - End Date"
              value={
                woStatus === "not_started"
                  ? "-"
                  : displayStartDate && displayEndDate
                  ? `${displayStartDate} - ${displayEndDate}`
                  : "Not Set"
              }
            />
            <LabelValue
              label="Actual Start - End Date"
              value={
                woStatus === "not_started"
                  ? "-"
                  : woStatus === "completed"
                  ? `${displayStartDate || "-"} - ${displayEndDate || "-"}`
                  : `${displayStartDate || "-"} - Not Defined`
              }
            />
            <LabelValue
              label="Priority"
              value={initialData?.priority || "Medium"}
              badge={{
                variant: initialData?.pBadge || "yellow-light",
                text: initialData?.priority || "Medium",
              }}
            />

            <LabelValue label="Created On" value={`2025-12-08; 15:00`} />
            <LabelValue label="Notes" value="-" />
          </div>
        </Card>

        <Card style={{ gap: "16px" }}>
          <span
            style={{
              fontSize: "var(--text-title-2)",
              fontWeight: "var(--font-weight-bold)",
            }}
          >
            Target Product
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
              padding: "20px 24px",
              borderRadius: "16px",
              border: "1px solid var(--neutral-line-separator-1)",
              background: "var(--neutral-surface-primary)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                minWidth: 0,
                flex: 1,
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "16px",
                  border: "1px solid var(--neutral-line-separator-1)",
                  background: "var(--neutral-surface-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Box size={28} color="var(--neutral-on-surface-tertiary)" />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: "18px",
                    lineHeight: "26px",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {initialData?.product || "Wooden Chair"}
                </span>
                <span
                  style={{
                    fontSize: "var(--text-title-3)",
                    color: "var(--neutral-on-surface-secondary)",
                  }}
                >
                  SKU: {initialData?.sku || "CH-WD-23948"}
                </span>
              </div>
            </div>
            <span
              style={{
                fontSize: "var(--text-big-title)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
                whiteSpace: "nowrap",
              }}
            >
              {TOTAL_QTY} pcs
            </span>
          </div>
        </Card>

        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <button
            style={tabButtonStyle(activeTab === "details")}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
          <button
            style={tabButtonStyle(activeTab === "logs")}
            onClick={() => setActiveTab("logs")}
          >
            Logs
          </button>
        </div>

        {activeTab === "details" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  Materials
                </span>
                <StatusBadge variant="blue-light">Material Request</StatusBadge>
              </div>
              <span
                style={{
                  fontSize: "var(--text-title-3)",
                  color: "var(--neutral-on-surface-secondary)",
                }}
              >
                BOM Name:{" "}
                <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                  {initialData?.product || "Wooden Chair"} Classic Model BOM
                </span>
              </span>
            </div>
            {woStatus !== "not_started" && !isCanceled ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {hasSubmittedRequest ? (
                  <Button
                    variant="tertiary"
                    onClick={() => setIsHistoryModalOpen(true)}
                  >
                    View Request History
                  </Button>
                ) : null}
                <Button
                  variant="outlined"
                  leftIcon={AddIcon}
                  onClick={() => openRequestModal(false)}
                >
                  Request Material
                </Button>
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                paddingBottom: "12px",
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                fontWeight: "var(--font-weight-bold)",
                fontSize: "var(--text-title-3)",
              }}
            >
              <div style={{ width: "40px" }}>No</div>
              <div style={{ flex: "1" }}>Type</div>
              <div style={{ flex: "1.5" }}>Material</div>
              <div style={{ flex: "1" }}>Required Qty</div>
              <div style={{ flex: "1" }}>Requested Qty</div>
              <div style={{ flex: "1" }}>Received Qty</div>
            </div>
            {materials.map((row, i) => {
              const isBom = row.type === "BOM";
              return (
              <div
                key={row.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "16px 0",
                  borderBottom: "1px solid var(--neutral-line-separator-1)",
                  fontSize: "var(--text-title-3)",
                }}
              >
                <div style={{ width: "40px" }}>{i + 1}</div>
                <div style={{ flex: "1" }}>
                  <StatusBadge variant={isBom ? "blue-light" : "grey-light"}>
                    {row.type}
                  </StatusBadge>
                </div>
                <div
                  style={{
                    flex: "1.5",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span style={{ fontWeight: "var(--font-weight-bold)" }}>
                    {row.name}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "var(--neutral-on-surface-tertiary)",
                    }}
                  >
                    {row.sku}
                  </span>
                </div>
                <div style={{ flex: "1" }}>
                  {isBom ? `${row.requiredQty} ${row.unit}` : "—"}
                </div>
                <div style={{ flex: "1" }}>{`${row.requestedQty} ${row.unit}`}</div>
                <div style={{ flex: "1" }}>{`${row.receivedQty} ${row.unit}`}</div>
              </div>
              );
            })}
          </div>
        </Card>

        <>
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{
                fontSize: "var(--text-title-2)",
                fontWeight: "var(--font-weight-bold)",
              }}
            >
              Routing Stages
            </span>
            {woStatus === "not_started" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-small)",
                  background: "var(--feature-brand-container-darker)",
                  border: "1px solid var(--feature-brand-container-darker)",
                }}
              >
                <Info
                  size={16}
                  strokeWidth={2.1}
                  color="var(--feature-brand-primary)"
                  style={{ flexShrink: 0, marginTop: "2px" }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-title-3)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--neutral-on-surface-primary)",
                      lineHeight: "20px",
                      letterSpacing: "0.0962px",
                    }}
                  >
                    You can now allow outsourcing for selected stages.
                  </span>
                  <span
                    style={{
                      fontSize: "var(--text-title-3)",
                      fontWeight: "var(--font-weight-regular)",
                      color: "var(--neutral-on-surface-primary)",
                      lineHeight: "20px",
                      letterSpacing: "0.0962px",
                    }}
                  >
                    Each selected stage can be handled by external vendors or
                    together with your internal team.
                  </span>
                </div>

              </div>
            ) : null}

            {routingUpdates && routingUpdates.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: routingUpdates.length === 1 ? "0" : "12px",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-small)",
                  background: "var(--feature-brand-container-darker)",
                  border: "1px solid var(--feature-brand-container-darker)",
                  marginTop: "12px",
                }}
              >
                {routingUpdates.length === 1 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Info
                      size={16}
                      strokeWidth={2.1}
                      color="var(--feature-brand-primary)"
                      style={{ flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: "var(--text-title-3)",
                        fontWeight: "var(--font-weight-regular)",
                        color: "var(--neutral-on-surface-primary)",
                        lineHeight: "20px",
                      }}
                    >
                      Work order was automatically updated on {routingUpdates[0].timestamp} to match receipt {routingUpdates[0].poNumber} from {routingUpdates[0].vendorName} for {routingUpdates[0].qty} pcs.
                    </span>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Info
                        size={16}
                        strokeWidth={2.1}
                        color="var(--feature-brand-primary)"
                        style={{ flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontSize: "var(--text-title-3)",
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--neutral-on-surface-primary)",
                          lineHeight: "20px",
                        }}
                      >
                        Routing updates ({routingUpdates.length})
                      </span>
                    </div>
                    <div 
                      style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        gap: "8px", 
                        paddingLeft: "26px",
                        maxHeight: isRoutingUpdatesExpanded ? "154px" : "none",
                        overflowY: isRoutingUpdatesExpanded ? "auto" : "visible"
                      }}
                    >
                      {(isRoutingUpdatesExpanded ? routingUpdates : routingUpdates.slice(0, 3)).map((update, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                          <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                            Auto Adjusted to {update.qty} pcs
                          </span>
                          <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>
                            · {update.timestamp}
                          </span>
                          <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>
                            (Based on receipt {update.poNumber} from {update.vendorName})
                          </span>
                        </div>
                      ))}
                    </div>
                    {routingUpdates.length > 3 && (
                      <div style={{ marginLeft: "22px", marginTop: "4px" }}>
                        <Button
                          variant="tertiary"
                          size="small"
                          rightIcon={isRoutingUpdatesExpanded ? ChevronUpIcon : ChevronDownIcon}
                          onClick={() => setIsRoutingUpdatesExpanded(!isRoutingUpdatesExpanded)}
                        >
                          {isRoutingUpdatesExpanded 
                            ? "View Less" 
                            : `View All ${routingUpdates.length} Updates`}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div
            key={`routing-table-${woStatus}`}
            style={{ display: "flex", flexDirection: "column" }}
          >
            {woStatus === "not_started" ? (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 60px 1.5fr 1.5fr 80px 80px 80px",
                    columnGap: "16px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    fontWeight: "var(--font-weight-bold)",
                    fontSize: "var(--text-title-3)",
                  }}
                >
                  <div style={{ textAlign: "center" }}>Allow Outsourcing</div>
                  <div style={{ paddingLeft: "8px" }}>Step</div>
                  <div>Routing</div>
                  <div>Operation</div>
                  <div>Yet to Start</div>
                  <div>In Progress</div>
                  <div>Completed</div>
                </div>
                {stagesWithTotals.map((row, i) => {
                  const stepTotalPool = row.step === 1 ? TOTAL_QTY : 0;
                  const start = Math.max(
                    0,
                    stepTotalPool - (row.prog || 0) - (row.effectiveTotalComp || 0)
                  );
                  const isChecked = outsourceSteps.includes(row.step);
                  let isDisabled = false;

                  return (
                    <div
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "140px 60px 1.5fr 1.5fr 80px 80px 80px",
                        columnGap: "16px",
                        alignItems: "start",
                        padding: "16px 0",
                        borderBottom: "1px solid var(--neutral-line-separator-1)",
                        fontSize: "var(--text-title-3)",
                      }}
                    >
                      <div
                        style={{
                          height: "32px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Checkbox
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => handleOutsourceToggle(row.step)}
                        />
                      </div>
                      <div style={{ height: "32px", display: "flex", alignItems: "center" }}>{row.step}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ minHeight: "32px", display: "flex", alignItems: "center" }}>
                          <span
                            style={{
                              display: "block",
                              wordBreak: "break-word",
                              width: "100%",
                            }}
                          >
                            {row.route}
                          </span>
                        </div>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ minHeight: "32px", display: "flex", alignItems: "center" }}>
                          <span
                            style={{
                              display: "block",
                              wordBreak: "break-word",
                              width: "100%",
                            }}
                          >
                            {row.op}
                          </span>
                        </div>
                      </div>

                      <div style={{ height: "32px", display: "flex", alignItems: "center" }}>{start}</div>
                      <div style={{ height: "32px", display: "flex", alignItems: "center" }}>{row.prog || 0}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ height: "32px", display: "flex", alignItems: "center" }}>{row.effectiveTotalComp || 0}</div>
                        {row.pendingQty > 0 && (
                          <div style={{ fontSize: '11px', color: 'var(--neutral-on-surface-tertiary)', lineHeight: 1.2 }}>
                            <span>Awaiting Update: {row.pendingQty}</span>
                            <Tooltip 
                              content={
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left", whiteSpace: "normal", maxWidth: "260px" }}>
                                  <span>{row.pendingQty} items have been received from the vendor.</span>
                                  <span>Once this step is updated, the system will automatically mark them as completed.</span>
                                </div>
                              }
                            >
                              <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginLeft: '4px', cursor: 'help', color: 'var(--feature-brand-primary)' }}>
                                <Info size={12} />
                              </span>
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1.5fr 1.5fr 120px 80px 80px 80px 80px 120px",
                    columnGap: "16px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    fontWeight: "var(--font-weight-bold)",
                    fontSize: "var(--text-title-3)",
                  }}
                >
                  <div>Step</div>
                  <div>Routing</div>
                  <div>Operation</div>
                  <div>Planned Date</div>
                  <div>Yet to Start</div>
                  <div>In Progress</div>
                  <div>Completed</div>
                  <div>Progress</div>
                  <div></div>
                </div>
                {stagesWithTotals.map((row, i) => {
                  const stepTotalPool =
                    row.step === 1
                      ? TOTAL_QTY
                      : stagesWithTotals[i - 1].effectiveTotalComp;
                  const start = Math.max(
                    0,
                    stepTotalPool - (row.prog || 0) - (row.totalComp || 0)
                  );

                  const isHybrid = outsourceSteps.includes(row.step);
                  const progressTarget = isHybrid ? internalOut : TOTAL_QTY;

                  const internalRemaining = Math.max(
                    0,
                    progressTarget - (row.comp || 0) - (row.prog || 0)
                  );
                  const internalStart = Math.min(internalRemaining, start);

                  const displayStart = woStatus === "completed" ? 0 : start;
                  const displayProg = woStatus === "completed" ? 0 : (row.prog || 0);
                  const displayComp = woStatus === "completed" ? TOTAL_QTY : (row.effectiveTotalComp || 0);

                  const progress =
                    woStatus === "completed"
                      ? 100
                      : Math.min(
                          100,
                          Math.round(((row.effectiveTotalComp || 0) / TOTAL_QTY) * 100)
                        ) || 0;

                  const isUnlocked =
                    woStatus === "completed" ||
                    row.step === 1 ||
                    (i > 0 && (stagesWithTotals[i - 1]?.totalComp || 0) > 0);

                  const canManage = internalStart > 0 || (row.prog || 0) > 0;

                  return (
                    <div
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "60px 1.5fr 1.5fr 120px 80px 80px 80px 80px 120px",
                        columnGap: "16px",
                        alignItems: "start",
                        padding: "16px 0",
                        borderBottom: "1px solid var(--neutral-line-separator-1)",
                        fontSize: "var(--text-title-3)",
                        color: !isUnlocked
                          ? "var(--neutral-on-surface-tertiary)"
                          : "var(--neutral-on-surface-primary)",
                      }}
                    >
                      <div style={{ height: "32px", display: "flex", alignItems: "center" }}>{row.step}</div>
                      <div
                        style={{
                          minWidth: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <div style={{ minHeight: "32px", display: "flex", alignItems: "center" }}>
                          <span
                            style={{
                              display: "block",
                              wordBreak: "break-word",
                              lineHeight: "1.4",
                              width: "100%",
                            }}
                          >
                            {row.route}
                          </span>
                        </div>
                        {isHybrid && externalOut > 0 ? (
                          <div>
                            <StatusBadge
                              variant={
                                internalOut === 0 ? "orange-light" : "blue-light"
                              }
                            >
                              {internalOut === 0 ? "Outsourced" : "Hybrid"}
                            </StatusBadge>
                          </div>
                        ) : null}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ minHeight: "32px", display: "flex", alignItems: "center" }}>
                          <span
                            style={{
                              display: "block",
                              wordBreak: "break-word",
                              width: "100%",
                            }}
                          >
                            {row.op}
                          </span>
                        </div>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ minHeight: "32px", display: "flex", alignItems: "center" }}>
                          {woStatus === "completed" ? (
                            <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
                              {row.plannedDate && row.plannedDate.start && row.plannedDate.end
                                ? `${row.plannedDate.start} - ${row.plannedDate.end}`
                                : "-"}
                            </span>
                          ) : (
                            row.plannedDate?.start && row.plannedDate?.end ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)" }}>
                                <span>{row.plannedDate.start} - {row.plannedDate.end}</span>
                                {woStatus !== "canceled" && (
                                  <IconButton
                                    icon={EditIcon}
                                    size="small"
                                    title="Edit Planned Date"
                                    onClick={() => openPlannedDateModal(row.step, row.plannedDate)}
                                  />
                                )}
                              </div>
                            ) : (
                              <Button
                                variant="tertiary"
                                size="small"
                                disabled={woStatus === "canceled"}
                                onClick={() => openPlannedDateModal(row.step)}
                                style={{ padding: "0 8px", height: "24px", minHeight: "unset" }}
                              >
                                Add Date
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                      <div style={{ height: "32px", display: "flex", alignItems: "center" }}>{displayStart}</div>
                      <div style={{ height: "32px", display: "flex", alignItems: "center" }}>{displayProg}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ height: "32px", display: "flex", alignItems: "center" }}>{displayComp}</div>
                        {row.pendingQty > 0 && (
                          <div style={{ fontSize: '11px', color: 'var(--neutral-on-surface-tertiary)', lineHeight: 1.2 }}>
                            <span>Awaiting Update: {row.pendingQty}</span>
                            <Tooltip 
                              content={
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left", whiteSpace: "normal", maxWidth: "260px" }}>
                                  <span>{row.pendingQty} items have been received from the vendor.</span>
                                  <span>Once this step is updated, the system will automatically mark them as completed.</span>
                                </div>
                              }
                            >
                              <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginLeft: '4px', cursor: 'help', color: 'var(--feature-brand-primary)' }}>
                                <Info size={12} />
                              </span>
                            </Tooltip>
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          height: "32px",
                        }}
                      >
                        <ProgressRing
                          percentage={progress}
                          color={
                            !isUnlocked
                              ? "var(--neutral-on-surface-tertiary)"
                              : "inherit"
                          }
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          height: "32px",
                        }}
                      >
                        {!isUnlocked ? (
                          <span
                            style={{
                              color: "var(--neutral-on-surface-tertiary)",
                              fontSize: "var(--text-body)",
                              textAlign: "right",
                              lineHeight: "1.2",
                            }}
                          >
                            Waiting Prev Process
                          </span>
                        ) : canManage && !isCanceled && woStatus !== "completed" ? (
                          <Button
                            variant="outlined"
                            size="small"
                            leftIcon={EditIcon}
                            style={{ width: "100px", flexShrink: 0 }}
                            onClick={() => {
                              setSelectedStage(row);
                              setStageStart(internalStart);
                              setStageProg(row.prog || 0);
                              setStageOriginalProg(row.prog || 0);
                              setStageComp(row.comp || 0);
                              setStageOriginalComp(row.comp || 0);
                              setExpectedDeliveryDate(
                                row.expectedDeliveryDate || row.date || null
                              );
                              setStageTotalPool(
                                (row.comp || 0) +
                                (row.prog || 0) +
                                internalStart
                              );
                              setStageMaxCompletable(
                                (row.comp || 0) +
                                (row.prog || 0) +
                                internalStart
                              );
                              setStageCompInput(String(row.comp || 0));
                              setStageProgError("");
                              setStageCompError("");
                              setIsManageStageVendorSectionExpanded(true);
                              setIsManageStageModalOpen(true);
                            }}
                          >
                            Manage
                          </Button>
                        ) : (
                          <span
                            style={{
                              color: "var(--neutral-on-surface-tertiary)",
                              fontSize: "var(--text-body)",
                              textAlign: "right",
                              lineHeight: "1.2",
                            }}
                          >
                            {isCanceled
                              ? "Canceled"
                              : woStatus === "completed" || (row.totalComp || 0) >= TOTAL_QTY
                              ? "Completed"
                              : "Waiting Prev Process"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {outsourceSteps.length > 0 && woStatus !== "not_started" ? (
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  Outsource Detail
                </span>
              </div>
              {!isCanceled && (
                <Button
                  variant="outlined"
                  size="small"
                  leftIcon={AddIcon}
                  onClick={handleOpenAddVendor}
                  disabled={isFirstOutsourceCompleted}
                >
                  Assign Vendor
                </Button>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginTop: "-4px",
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-body)",
                  color: "var(--neutral-on-surface-secondary)",
                }}
              >
                Allow Outsourced Stages
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  width: "100%",
                }}
              >
                {outsourceSteps.map((stepId) => {
                  const st = routingStages.find((s) => s.step === stepId);
                  if (!st) return null;
                  
                  const stepVendorOutput = vendors
                    .filter((v) => !v.assignedSteps || v.assignedSteps.length === 0 || v.assignedSteps.includes(stepId))
                    .reduce((sum, v) => sum + (parseInt(v.output, 10) || 0), 0);

                  return (
                    <div key={stepId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      <span style={{
                        fontSize: "var(--text-title-3)",
                        fontWeight: "var(--font-weight-bold)",
                        color: "var(--neutral-on-surface-primary)",
                      }}>
                        Step {st.step}: {st.route} - {st.op}
                      </span>
                      {renderAllocationBar(stepVendorOutput, "mini")}
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "16px",
                  marginTop: "16px",
                }}
              >
                <div style={{ display: "flex", gap: "12px", alignItems: "center", position: "relative" }}>
                  <div onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setVendorPopoverTriggerRect(rect);
                    setOpenVendorFilterKey(prev => prev === "vendor_name" ? null : "vendor_name");
                  }}>
                    <FilterPill
                      label="All Vendors"
                      active={vendorNameFilters.length > 0}
                      isOpen={openVendorFilterKey === "vendor_name"}
                      count={vendorNameFilters.length}
                    />
                  </div>
                  <div onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setVendorPopoverTriggerRect(rect);
                    setOpenVendorFilterKey(prev => prev === "vendor_status" ? null : "vendor_status");
                  }}>
                    <FilterPill
                      label="All Statuses"
                      active={vendorStatusFilters.length > 0}
                      isOpen={openVendorFilterKey === "vendor_status"}
                      count={vendorStatusFilters.length}
                    />
                  </div>
                  <div onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setVendorPopoverTriggerRect(rect);
                    setOpenVendorFilterKey(prev => prev === "vendor_po" ? null : "vendor_po");
                  }}>
                    <FilterPill
                      label="All POs"
                      active={vendorPoFilters.length > 0}
                      isOpen={openVendorFilterKey === "vendor_po"}
                      count={vendorPoFilters.length}
                    />
                  </div>
                  <div onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setVendorPopoverTriggerRect(rect);
                    setOpenVendorFilterKey(prev => prev === "included_steps" ? null : "included_steps");
                  }}>
                    <FilterPill
                      label="Included Steps"
                      active={includedStepsFilters.length > 0}
                      isOpen={openVendorFilterKey === "included_steps"}
                      count={includedStepsFilters.length}
                    />
                  </div>

                  {openVendorFilterKey ? (() => {
                    const popoverPos = getFilterPopoverPosition(vendorPopoverTriggerRect, 320);
                    return (
                    <>
                      <div
                        style={{ position: "fixed", inset: 0, zIndex: 80 }}
                        onClick={() => setOpenVendorFilterKey(null)}
                      />
                      <div
                        style={{
                          position: "fixed",
                          top: `${popoverPos.top}px`,
                          left: `${popoverPos.left}px`,
                          transform: popoverPos.placement === "top" ? "translateY(-100%)" : "none",
                          width: "360px",
                          background: "var(--neutral-surface-primary)",
                          border: "1px solid var(--neutral-line-separator-1)",
                          borderRadius: "var(--radius-card)",
                          boxShadow: "var(--elevation-sm)",
                          padding: "16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                          zIndex: 1000,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "var(--text-title-2)",
                              fontWeight: "var(--font-weight-bold)",
                            }}
                          >
                            {openVendorFilterKey === "vendor_name"
                              ? "Vendor Name"
                              : openVendorFilterKey === "vendor_status"
                                ? "Status"
                                : openVendorFilterKey === "vendor_po"
                                  ? "Purchase Order"
                                  : "Included Steps"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (openVendorFilterKey === "vendor_name") setVendorNameFilters([]);
                              if (openVendorFilterKey === "vendor_status") setVendorStatusFilters([]);
                              if (openVendorFilterKey === "vendor_po") setVendorPoFilters([]);
                              if (openVendorFilterKey === "included_steps") setIncludedStepsFilters([]);
                              setOpenVendorFilterKey(null);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              color: "var(--status-red-primary)",
                              cursor: "pointer",
                              fontSize: "var(--text-body)",
                              fontWeight: "var(--font-weight-bold)",
                            }}
                          >
                            Remove Filter
                          </button>
                        </div>
                        
                        {openVendorFilterKey === "included_steps" && (
                          <TableSearchField
                            value={includedStepsSearchQuery}
                            onChange={(e) => setIncludedStepsSearchQuery(e.target.value)}
                            placeholder="Search Steps"
                          />
                        )}
                        {openVendorFilterKey === "vendor_name" && (
                          <TableSearchField
                            value={vendorNameSearchQuery}
                            onChange={(e) => setVendorNameSearchQuery(e.target.value)}
                            placeholder="Search Vendor Name"
                          />
                        )}
                        {openVendorFilterKey === "vendor_po" && (
                          <TableSearchField
                            value={vendorPoSearchQuery}
                            onChange={(e) => setVendorPoSearchQuery(e.target.value)}
                            placeholder="Search PO Number"
                          />
                        )}

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            maxHeight: "240px",
                            overflowY: "auto",
                          }}
                        >
                          {(() => {
                            let options = [];
                            let currentFilters = [];
                            let setter = null;

                            if (openVendorFilterKey === "vendor_name") {
                              options = Array.from(new Set(vendors.map(v => v.name))).map(name => ({ value: name, label: name }))
                                .filter(opt => !vendorNameSearchQuery || opt.label.toLowerCase().includes(vendorNameSearchQuery.toLowerCase()));
                              currentFilters = vendorNameFilters;
                              setter = setVendorNameFilters;
                            } else if (openVendorFilterKey === "vendor_status") {
                              options = [
                                { value: "Not Started", label: "Not Started" },
                                { value: "In Progress", label: "In Progress" },
                                { value: "Partially Received", label: "Partially Received" },
                                { value: "Completed", label: "Completed" },
                                { value: "Canceled", label: "Canceled" }
                              ];
                              currentFilters = vendorStatusFilters;
                              setter = setVendorStatusFilters;
                            } else if (openVendorFilterKey === "vendor_po") {
                              const poList = Array.from(new Set(vendors.map(v => v.poNumber).filter(Boolean))).map(po => ({ value: po, label: po }));
                              poList.unshift({ value: "No PO", label: "Without Purchase Order" });
                              options = poList.filter(opt => !vendorPoSearchQuery || opt.label.toLowerCase().includes(vendorPoSearchQuery.toLowerCase()));
                              currentFilters = vendorPoFilters;
                              setter = setVendorPoFilters;
                            } else if (openVendorFilterKey === "included_steps") {
                              options = outsourceSteps.map((stepId) => {
                                const st = routingStages.find((s) => s.step === stepId);
                                return {
                                  value: stepId,
                                  label: st ? `Step ${st.step}: ${st.route} - ${st.op}` : `Step ${stepId}`
                                };
                              }).filter(opt => !includedStepsSearchQuery || opt.label.toLowerCase().includes(includedStepsSearchQuery.toLowerCase()));
                              currentFilters = includedStepsFilters;
                              setter = setIncludedStepsFilters;
                            }

                            return options.map((opt) => (
                              <label
                                key={opt.value}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  cursor: "pointer",
                                  fontSize: "var(--text-title-3)",
                                }}
                              >
                                <Checkbox
                                  checked={currentFilters.includes(opt.value)}
                                  onChange={() => {
                                    setter((prev) =>
                                      prev.includes(opt.value)
                                        ? prev.filter((item) => item !== opt.value)
                                        : [...prev, opt.value]
                                    );
                                  }}
                                />
                                <span>{opt.label}</span>
                              </label>
                            ));
                          })()}
                        </div>
                      </div>
                    </>
                    );
                  })() : null}
                </div>
                <TableSearchField
                  value={vendorSearchQuery}
                  onChange={setVendorSearchQuery}
                  placeholder="Search Assignment ID"
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1fr 1.2fr 2fr 1.2fr 140px",
                  gap: "12px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--neutral-line-separator-1)",
                  fontWeight: "var(--font-weight-bold)",
                  fontSize: "var(--text-title-3)",
                }}
              >
                <div>Vendor Name</div>
                <div>Assignment ID</div>
                <div>Included Steps</div>
                <div>Purchase Order</div>
                <div>Receipt Progress</div>
                <div>Status</div>
                <div></div>
              </div>
              {vendors.length === 0 ? (
                <div
                  style={{
                    padding: "40px 24px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-title-3)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--neutral-on-surface-primary)",
                    }}
                  >
                    No vendor assigned yet
                  </span>
                  <span
                    style={{
                      color: "var(--neutral-on-surface-secondary)",
                      fontSize: "var(--text-body)",
                      width: "80vw",
                      maxWidth: "1600px",
                      lineHeight: "1.5",
                    }}
                  >
                    Add a vendor to assign outsourced output. You can also add
                    Internal from the Add Vendor modal.
                  </span>
                </div>
              ) : (
                (() => {
                  const filteredVendors = vendors.filter((vendor) => {
                    const isInternal = vendor.name === "Internal";
                    const resolvedVendorStatus = isCanceled
                      ? "Canceled"
                      : isInternal
                      ? internalStatusInfo.text
                      : resolveVendorProgressStatus(vendor);

                    if (vendorSearchQuery) {
                      const assignId = isInternal ? "-" : (vendor.assignmentId || "-");
                      if (!assignId.toLowerCase().includes(vendorSearchQuery.toLowerCase())) {
                        return false;
                      }
                    }
                    if (vendorNameFilters.length > 0 && !vendorNameFilters.includes(vendor.name)) {
                      return false;
                    }
                    if (vendorStatusFilters.length > 0 && !vendorStatusFilters.includes(resolvedVendorStatus)) {
                      return false;
                    }
                    if (vendorPoFilters.length > 0) {
                      const hasPoStr = vendor.poNumber ? "With PO" : "Without PO";
                      if (!vendorPoFilters.includes(hasPoStr)) return false;
                    }
                    if (includedStepsFilters.length > 0) {
                      if (!vendor.assignedSteps || !vendor.assignedSteps.some(step => includedStepsFilters.includes(step))) {
                        return false;
                      }
                    }
                    return true;
                  });

                  if (filteredVendors.length === 0) {
                    return (
                      <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--neutral-on-surface-secondary)" }}>
                        No assignments match the selected filters.
                      </div>
                    );
                  }

                  return filteredVendors.map((vendor, i) => {
                    const isInternal = vendor.name === "Internal";
                    const resolvedVendorStatus = isCanceled
                      ? "Canceled"
                      : isInternal
                      ? internalStatusInfo.text
                      : resolveVendorProgressStatus(vendor);
                  const isCompleted = resolvedVendorStatus === "Completed";
                  const livePo = vendor.poNumber ? MOCK_PO_TABLE_DATA.find((po) => po.poNumber === vendor.poNumber) : null;
                  const isPoApproved = (livePo ? (livePo.statusKey === "issued" || livePo.statusKey === "completed") : false) || vendor.isPoApproved;
                  const isVendorInProgress =
                    resolvedVendorStatus === "In Progress";
                  const showEditVendorAction =
                    !isCanceled && (isInternal || (!isVendorInProgress && !isPoApproved));
                  const showRemoveVendorAction =
                    !isCanceled &&
                    !isVendorInProgress &&
                    !(
                      isInternal &&
                      internalStatusInfo.text === "In Progress"
                    ) &&
                    !isCompleted &&
                    ((vendor.receivedOutput || 0) === 0 || isInternal) &&
                    (isInternal || !isPoApproved);
                  const showReceiptHistoryAction =
                    (vendor.receipts && vendor.receipts.length > 0) ||
                    (isVendorInProgress && !isInternal);

                  let dependencyText = null;
                  let readyToSend = 0;
                  if (vendor.assignedSteps && vendor.assignedSteps.length > 0) {
                    const minStep = Math.min(...vendor.assignedSteps);
                    const receivedAmt = parseInt(vendor.receivedOutput, 10) || 0;
                    const sentAmt = parseInt(vendor.sentOutput, 10) || 0;
                    const assignedAmt = parseInt(vendor.output, 10) || 0;
                    
                    const rowIndex = stagesWithTotals.findIndex((r) => r.step === minStep);
                    let availableToProcess = 0;
                    if (rowIndex !== -1) {
                      const prevCompleted = minStep === 1 ? TOTAL_QTY : (stagesWithTotals[rowIndex - 1]?.effectiveTotalComp || 0);
                      const currStage = stagesWithTotals[rowIndex];
                      const internalProg = currStage?.prog || 0;
                      const internalCompleted = currStage?.comp || 0;
                      
                      const vendorsConsumed = vendors
                        .filter(v => v.name !== "Internal" && v.id !== vendor.id && v.assignedSteps?.includes(minStep))
                        .reduce((sum, v) => sum + Math.max(parseInt(v.sentOutput, 10) || 0, parseInt(v.receivedOutput, 10) || 0), 0);
                        
                      const totalConsumedByOthers = internalProg + internalCompleted + vendorsConsumed;
                      availableToProcess = Math.max(0, prevCompleted - totalConsumedByOthers);
                    }
                    
                    if (isPoApproved && !isInternal) {
                      readyToSend = Math.max(0, Math.min(availableToProcess, assignedAmt - sentAmt));
                    }

                    if (readyToSend > 0 && !isInternal) {
                      dependencyText = `Ready to Release: ${readyToSend}`;
                    } else if (sentAmt > receivedAmt && !isCompleted && !isInternal) {
                      dependencyText = `Waiting Receipt: ${sentAmt - receivedAmt}`;
                    } else if (receivedAmt > 0 && !isCompleted && !isInternal) {
                      dependencyText = `Pending Qty to Complete: ${assignedAmt - receivedAmt}`;
                    } else if (!isCompleted && minStep > 1) {
                      if (availableToProcess === 0) {
                        dependencyText = "Waiting Previous Process";
                      } else {
                        dependencyText = `Avail Qty to Process: ${availableToProcess}`;
                      }
                    }
                    
                    if (!isInternal && resolvedVendorStatus === "Not Started") {
                      dependencyText = null;
                    }
                  }

                  return (
                    <div
                      key={vendor.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.2fr 1fr 1fr 1.2fr 2fr 1.2fr 140px",
                        gap: "12px",
                        alignItems: "center",
                        padding: "16px 0",
                        borderBottom:
                          i === vendors.length - 1
                            ? "none"
                            : "1px solid var(--neutral-line-separator-1)",
                        fontSize: "var(--text-title-3)",
                      }}
                    >
                      <div>
                        {vendor.name || "Internal"}
                      </div>
                      
                      <div>
                        {vendor.assignmentId || "-"}
                      </div>
                      
                      <div>
                        {vendor.assignedSteps && vendor.assignedSteps.length > 0 
                          ? [...vendor.assignedSteps].sort((a, b) => a - b).join(", ") 
                          : "-"}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          position: "relative",
                        }}
                      >
                        {!isInternal ? (
                          vendor.poNumber ? (
                            <>
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenVendorMenuId(null);
                                  setOpenPoPopoverVendorId(null);
                                  setSelectedVendorForPoAction(vendor);
                                  scrollToTop();
                                  onNavigate("po_detail", {
                                    ...buildDummyPoDetailData(
                                      vendor.poNumber,
                                      vendor
                                    ),
                                    from: "work_order_detail",
                                    returnTo: {
                                      view: "detail",
                                      data: {
                                        ...initialData,
                                        vendors,
                                        routingStages,
                                        outsourceSteps,
                                        statusKey: woStatus,
                                        start: displayStartDate,
                                        end: displayEndDate,
                                      },
                                    },
                                  });
                                }}
                                style={{
                                  color: "var(--feature-brand-primary)",
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                }}
                              >
                                {vendor.poNumber}
                              </span>
                              {isPoApproved ? (
                                <Tooltip content="PO Approved">
                                  <div
                                    style={{
                                      width: "16px",
                                      height: "16px",
                                      borderRadius: "50%",
                                      background: "var(--status-green-primary)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <CheckIcon size={10} color="white" />
                                  </div>
                                </Tooltip>
                              ) : null}
                            </>
                          ) : (
                            <>
                              {!isCanceled && (
                                <Button
                                  variant="tertiary"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPoPopoverPosition(
                                      getPoPopoverPosition(
                                        e.currentTarget.getBoundingClientRect()
                                      )
                                    );
                                    handleOpenPoAction(vendor);
                                  }}
                                  style={{
                                    padding: 0,
                                    margin: 0,
                                    height: "auto",
                                    minHeight: "unset",
                                  }}
                                >
                                  Add Purchase Order
                                </Button>
                              )}
                              {isCanceled && "-"}
                              {openPoPopoverVendorId === vendor.id &&
                                selectedVendorForPoAction?.id === vendor.id ? (
                                <>
                                  <div
                                    style={{
                                      position: "fixed",
                                      inset: 0,
                                      zIndex: 90,
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenPoPopoverVendorId(null);
                                    }}
                                  />
                                  <div
                                    style={{
                                      position: "fixed",
                                      top: `${poPopoverPosition.top}px`,
                                      left: `${poPopoverPosition.left}px`,
                                      transform:
                                        poPopoverPosition.placement === "top"
                                          ? "translateY(-100%)"
                                          : "none",
                                      background:
                                        "var(--neutral-surface-primary)",
                                      borderRadius: "var(--radius-small)",
                                      boxShadow: "var(--elevation-sm)",
                                      border:
                                        "1px solid var(--neutral-line-separator-1)",
                                      zIndex: 101,
                                      display: "flex",
                                      flexDirection: "column",
                                      minWidth: "180px",
                                      padding: "4px 0",
                                    }}
                                  >
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCreatePoFromVendor();
                                      }}
                                      onMouseEnter={(e) =>
                                      (e.currentTarget.style.background =
                                        "var(--neutral-surface-grey-lighter)")
                                      }
                                      onMouseLeave={(e) =>
                                      (e.currentTarget.style.background =
                                        "transparent")
                                      }
                                      style={{
                                        padding: "12px 16px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        cursor: "pointer",
                                        fontSize: "var(--text-title-3)",
                                        color:
                                          "var(--neutral-on-surface-primary)",
                                      }}
                                    >
                                      <AddIcon size={16} /> Create New PO
                                    </div>
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenSelectExistingPo();
                                      }}
                                      onMouseEnter={(e) =>
                                      (e.currentTarget.style.background =
                                        "var(--neutral-surface-grey-lighter)")
                                      }
                                      onMouseLeave={(e) =>
                                      (e.currentTarget.style.background =
                                        "transparent")
                                      }
                                      style={{
                                        padding: "12px 16px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        cursor: "pointer",
                                        fontSize: "var(--text-title-3)",
                                        color:
                                          "var(--neutral-on-surface-primary)",
                                        borderTop:
                                          "1px solid var(--neutral-line-separator-1)",
                                      }}
                                    >
                                      <DocumentIcon size={16} /> Select Existing
                                      PO
                                    </div>
                                  </div>
                                </>
                              ) : null}
                            </>
                          )
                        ) : (
                          "-"
                        )}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingRight: "16px" }}>
                        <div
                          style={{
                            height: "6px",
                            background: "var(--neutral-surface-grey-lighter)",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              background: (() => {
                                const pct = Math.min(100, ((vendor.receivedOutput || 0) / (vendor.output || 1)) * 100);
                                if (pct >= 100) return "var(--status-green-primary)";
                                if (pct >= 75) return "var(--feature-brand-primary)";
                                if (pct >= 50) return "var(--status-yellow-primary)";
                                if (pct >= 25) return "var(--status-orange-primary)";
                                return "var(--status-red-primary)";
                              })(),
                              width: `${Math.min(100, (((vendor.receivedOutput || 0) / (vendor.output || 1)) * 100))}%`,
                              transition: "width 0.3s ease",
                              borderRadius: "3px",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            color: "var(--neutral-on-surface-tertiary)",
                            width: "100%",
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                            <span style={{ fontSize: "10px" }}>Received</span>
                            <span style={{ color: (() => { const pct = Math.min(100, ((vendor.receivedOutput || 0) / (vendor.output || 1)) * 100); if (pct >= 100) return "var(--status-green-primary)"; if (pct >= 75) return "var(--feature-brand-primary)"; if (pct >= 50) return "var(--status-yellow-primary)"; if (pct >= 25) return "var(--status-orange-primary)"; return "var(--status-red-primary)"; })(), fontWeight: "var(--font-weight-bold)", fontSize: "11px" }}>{vendor.receivedOutput || 0} pcs</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "center", flex: 1 }}>
                            <span style={{ fontSize: "10px" }}>Remaining</span>
                            <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "var(--font-weight-bold)", fontSize: "11px" }}>{Math.max(0, (vendor.output || 0) - (vendor.receivedOutput || 0))} pcs</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end", flex: 1 }}>
                            <span style={{ fontSize: "10px" }}>Assigned</span>
                            <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "var(--font-weight-bold)", fontSize: "11px" }}>{vendor.output || 0} pcs</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
                        {isInternal ? (
                          <StatusBadge variant={internalStatusInfo.variant}>
                            {internalStatusInfo.text}
                          </StatusBadge>
                        ) : (
                          <StatusBadge
                            variant={
                              resolvedVendorStatus === "Completed"
                                ? "green-light"
                                : resolvedVendorStatus === "Partially Received"
                                  ? "blue-light"
                                  : resolvedVendorStatus === "In Progress"
                                    ? "orange-light"
                                    : "grey-light"
                            }
                          >
                            {resolvedVendorStatus}
                          </StatusBadge>
                        )}
                        {dependencyText && (isInternal ? internalStatusInfo.text !== "Completed" : resolvedVendorStatus !== "Completed") && (
                          <span style={{ fontSize: "11px", color: "var(--neutral-on-surface-secondary)", width: "100%", whiteSpace: "nowrap" }}>
                            {dependencyText}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {(resolvedVendorStatus === "In Progress" || resolvedVendorStatus === "Partially Received") && !isInternal && isPoApproved && parseInt(vendor.sentOutput || 0, 10) < parseInt(vendor.output || 0, 10) ? (
                          <Tooltip content="Release to Vendor">
                            <IconButton
                              icon={Send}
                              size="small"
                              title="Release to Vendor"
                              color="var(--feature-brand-primary)"
                              disabled={readyToSend <= 0}
                              hoverBackground="var(--feature-brand-container-lighter)"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSendVendor(vendor);
                                setSendAmount(String(readyToSend));
                                setIsSendToVendorModalOpen(true);
                              }}
                            />
                          </Tooltip>
                        ) : null}

                        {showEditVendorAction ? (
                          <Tooltip content="Edit Details">
                            <IconButton
                              icon={EditIcon}
                              size="small"
                              title="Edit Details"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditVendor(vendor);
                              }}
                            />
                          </Tooltip>
                        ) : null}

                        {showRemoveVendorAction ? (
                          <Tooltip content="Remove Assignment">
                            <IconButton
                              icon={DeleteIcon}
                              size="small"
                              title="Remove Assignment"
                              color="var(--status-red-primary)"
                              hoverBackground="#FAE6E8"
                              onClick={(e) => {
                                e.stopPropagation();
                                promptRemoveVendor(vendor);
                              }}
                            />
                          </Tooltip>
                        ) : null}

                        {showReceiptHistoryAction ? (
                          <Tooltip content="Assignment Log">
                            <IconButton
                              icon={DocumentIcon}
                              size="small"
                              title="Assignment Log"
                              color="var(--feature-brand-primary)"
                              hoverBackground="var(--feature-brand-container-lighter)"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReceiptHistoryVendor(vendor);
                                setIsViewReceiptHistoryModalOpen(true);
                                setAssignmentLogTab("send");
                              }}
                            />
                          </Tooltip>
                        ) : null}
                      </div>
                    </div>
                  );
                });
              })()
              )}
            </div>
          </Card>
        ) : null}
        </>
        </div>
        )}

        {activeTab === "logs" && (
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

                {activityLogs.map((log, idx, arr) => (
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
                        color: "var(--neutral-on-surface-secondary)",
                      }}
                    >
                      {log.email}
                    </div>
                    <div style={{ flex: "2.8" }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
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
                        {log.desc && (
                          <span
                            style={{
                              color: "var(--neutral-on-surface-secondary)",
                              lineHeight: "1.5",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {log.desc}
                          </span>
                        )}
                      </div>
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
        )}
      </div>

      {woStatus === "not_started" ? (
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
          <Button
            variant="filled"
            size="medium"
            onClick={() => {
              setReadyStartDate(displayStartDate || "");
              setReadyEndDate(displayEndDate || "");
              setIsReadyModalOpen(true);
            }}
          >
            Ready to Process
          </Button>
        </div>
      ) : null}

      <GeneralModal
        isOpen={isConfirmRemoveModalOpen && !!vendorToRemove}
        onClose={() => setIsConfirmRemoveModalOpen(false)}
        title="Remove Assignment"
        width="400px"
        description="Are you sure you want to remove this assignment? This action will unassign the vendor from this stage."
        footer={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "100%",
            }}
          >
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={executeRemoveVendor}
            >
              Yes, Remove
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setIsConfirmRemoveModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        }
      />

      <GeneralModal
        isOpen={isReadyModalOpen}
        onClose={() => setIsReadyModalOpen(false)}
        title="Set Planned Date"
        width="400px"
        footer={
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            <Button
              variant="filled"
              size="large"
              disabled={!readyStartDate || !readyEndDate}
              style={{ width: "100%" }}
              onClick={() => {
                setIsReadyModalOpen(false);
                setIsConfirmReadyModalOpen(true);
              }}
            >
              Continue
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setIsReadyModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {(initialData?.orderStart || initialData?.orderEnd) && (
            <div
              style={{
                background: "var(--feature-brand-container-lighter)",
                borderRadius: "var(--radius-small)",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--feature-brand-primary)",
              }}
            >
              <Info size={16} />
              <span style={{ fontSize: "var(--text-body)" }}>
                Order Planned Date:{" "}
                <strong>
                  {initialData?.orderStart || "-"} - {initialData?.orderEnd || "-"}
                </strong>
              </span>
            </div>
          )}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                fontSize: "var(--text-body)",
                fontWeight: "var(--font-weight-regular)",
              }}
            >
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                Planned Start Date
              </span>
            </div>
            <DateInputControl
              value={readyStartDate}
              onChange={(e) => setReadyStartDate(e.target.value)}
              minDate={initialData?.orderStart}
              maxDate={initialData?.orderEnd}
            />
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                fontSize: "var(--text-body)",
                fontWeight: "var(--font-weight-regular)",
              }}
            >
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                Planned Finish Date
              </span>
            </div>
            <DateInputControl
              value={readyEndDate}
              onChange={(e) => setReadyEndDate(e.target.value)}
              minDate={initialData?.orderStart}
              maxDate={initialData?.orderEnd}
            />
          </div>
        </div>
      </GeneralModal>

      <GeneralModal
        isOpen={isConfirmReadyModalOpen}
        onClose={() => setIsConfirmReadyModalOpen(false)}
        title="Confirm Action"
        description={<>Are you sure you want to proceed? <strong>You cannot change the outsourced steps later</strong> after the work order is marked as ready to process.</>}
        footer={
          <>
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                setIsConfirmReadyModalOpen(false);
                setDisplayStartDate(readyStartDate);
                setDisplayEndDate(readyEndDate);
                setWoStatus("ready_to_process");
                setVendors((prev) => prev);
                addActivityLog("Ready to Process");
                setToastMessage("Work order status successfully changed");
                setShowSuccessToast(true);
              }}
            >
              Yes, Proceed
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setIsConfirmReadyModalOpen(false)}
            >
              Cancel
            </Button>
          </>
        }
      />

      {isManageStageModalOpen && selectedStage ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "680px",
              maxWidth: "calc(100vw - 32px)",
              background: "var(--neutral-surface-primary)",
              borderRadius: "var(--radius-card)",
              padding: "64px 32px 32px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              position: "relative",
              boxShadow: "var(--elevation-sm)",
              maxHeight: "90vh",
              overflow: "hidden",
            }}
          >
            <IconButton
              icon={CloseIcon}
              size="large"
              onClick={() => setIsManageStageModalOpen(false)}
              style={{ position: "absolute", top: "16px", right: "16px" }}
              color="var(--neutral-on-surface-primary)"
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                flexShrink: 0,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "var(--text-headline)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--neutral-on-surface-primary)",
                }}
              >
                Manage Routing
              </h2>
              <span
                style={{
                  fontSize: "var(--text-body)",
                  color: "var(--neutral-on-surface-secondary)",
                }}
              >
                Operation: {selectedStageData?.op || selectedStage?.op}
              </span>
            </div>

            <div
              style={{
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              <div
                style={{
                  background: "var(--feature-brand-container-lighter)",
                  borderRadius: "var(--radius-small)",
                  padding: "12px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  color: "var(--feature-brand-primary)",
                }}
              >
                <Info size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                <p
                  style={{
                    margin: 0,
                    fontSize: "var(--text-body)",
                    lineHeight: "1.5",
                  }}
                >
                  Item must be completed in the previous step to become available
                  in the next one. Once Completed, items are locked and cannot be
                  reverted.
                </p>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "12px" }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  Internal Progress
                </span>

                <div
                  style={{
                    border: "1px solid var(--neutral-line-separator-1)",
                    borderRadius: "var(--radius-small)",
                    padding: "12px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-title-3)",
                        color: "var(--neutral-on-surface-primary)",
                      }}
                    >
                      Yet to Start
                    </span>
                    <span
                      style={{
                        fontSize: "var(--text-desc)",
                        color: "var(--neutral-on-surface-tertiary)",
                      }}
                    >
                      Available Pool: {stageStart}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--neutral-on-surface-primary)",
                    }}
                  >
                    {stageStart}
                  </span>
                </div>

                <div
                  style={{
                    border: "1px solid var(--neutral-line-separator-1)",
                    borderRadius: "var(--radius-small)",
                    padding: "12px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-title-3)",
                      color: "var(--neutral-on-surface-primary)",
                    }}
                  >
                    In Progress
                  </span>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <button
                      disabled={stageProg <= 0}
                      onClick={() => {
                        if (stageProgError) setStageProgError("");
                        setStageProg((prev) => {
                          const next = Math.max(0, prev - 1);
                          setStageMaxCompletable(stageOriginalComp + next);
                          return next;
                        });
                        setStageStart((prev) => prev + 1);
                      }}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "var(--radius-small)",
                        background:
                          stageProg <= 0
                            ? "var(--neutral-surface-grey-lighter)"
                            : "transparent",
                        border:
                          stageProg <= 0
                            ? "1px solid transparent"
                            : "1px solid var(--feature-brand-primary)",
                        cursor: stageProg <= 0 ? "not-allowed" : "pointer",
                        opacity: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Minus
                        size={16}
                        color={
                          stageProg <= 0
                            ? "var(--neutral-on-surface-tertiary)"
                            : "var(--feature-brand-primary)"
                        }
                      />
                    </button>
                    <input
                      type="text"
                      value={stageProg === 0 ? "" : formatNumberWithCommas(stageProg)}
                      placeholder="0"
                      onChange={(e) => {
                        let raw = String(e.target.value || "").replace(/,/g, "").replace(/\D/g, "");
                        if (raw.length > 1) {
                          raw = raw.replace(/^0+/, "");
                          if (raw === "") raw = "0";
                        }

                        const nextProg = raw === "" ? 0 : parseInt(raw, 10);
                        if (Number.isNaN(nextProg)) return;

                        if (stageProgError) setStageProgError("");
                        const maxProg = Math.max(0, stageTotalPool - stageComp);
                        const clampedProg = Math.max(
                          0,
                          Math.min(nextProg, maxProg)
                        );
                        const nextStart = Math.max(
                          0,
                          stageTotalPool - stageComp - clampedProg
                        );
                        setStageProg(clampedProg);
                        setStageStart(nextStart);
                        setStageMaxCompletable(
                          stageOriginalComp + clampedProg + nextStart
                        );
                      }}
                      style={{
                        width: "56px",
                        height: "32px",
                        textAlign: "center",
                        fontSize: "var(--text-subtitle-1)",
                        fontWeight: "var(--font-weight-bold)",
                        color:
                          stageProg === 0
                            ? "var(--neutral-on-surface-tertiary)"
                            : "var(--neutral-on-surface-primary)",
                        border: stageProgError
                          ? "1px solid var(--status-red-primary)"
                          : "1px solid var(--neutral-line-separator-1)",
                        borderRadius: "var(--radius-small)",
                        outline: "none",
                        background: "var(--neutral-surface-primary)",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = stageProgError
                          ? "var(--status-red-primary)"
                          : "var(--feature-brand-primary)")}
                      onBlur={(e) =>
                        (e.target.style.borderColor = stageProgError
                          ? "var(--status-red-primary)"
                          : "var(--neutral-line-separator-1)")}
                    />
                    <button
                      disabled={stageStart === 0}
                      onClick={() => {
                        if (stageProgError) setStageProgError("");
                        const nextProg = stageProg + 1;
                        const nextStart = Math.max(0, stageStart - 1);
                        setStageProg(nextProg);
                        setStageStart(nextStart);
                        setStageMaxCompletable(
                          stageOriginalComp + nextProg + nextStart
                        );
                      }}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "var(--radius-small)",
                        background:
                          stageStart === 0
                            ? "var(--neutral-surface-grey-lighter)"
                            : "var(--feature-brand-primary)",
                        border: "1px solid var(--neutral-line-separator-1)",
                        cursor: stageStart === 0 ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Plus
                        size={16}
                        color={
                          stageStart === 0
                            ? "var(--neutral-on-surface-tertiary)"
                            : "var(--neutral-surface-primary)"
                        }
                      />
                    </button>
                  </div>
                </div>
                {stageProgError ? (
                  <span
                    style={{
                      marginTop: "-4px",
                      fontSize: "var(--text-body)",
                      color: "var(--status-red-primary)",
                    }}
                  >
                    {stageProgError}
                  </span>
                ) : null}
              </div>

              <div
                style={{
                  border: "1px solid var(--neutral-line-separator-1)",
                  borderRadius: "var(--radius-small)",
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-3)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  Completed
                </span>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <button
                    disabled={stageComp <= stageOriginalComp}
                    onClick={() => {
                      const nextComp = stageComp - 1;
                      const nextStart = stageStart + 1;
                      setStageComp(nextComp);
                      setStageStart(nextStart);
                      setStageCompInput(String(nextComp));
                      setStageMaxCompletable(
                        stageOriginalComp + nextStart + stageProg
                      );
                      setStageCompError("");
                    }}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "var(--radius-small)",
                      background:
                        stageComp <= stageOriginalComp
                          ? "var(--neutral-surface-grey-lighter)"
                          : "transparent",
                      border:
                        stageComp <= stageOriginalComp
                          ? "1px solid transparent"
                          : "1px solid var(--feature-brand-primary)",
                      cursor:
                        stageComp <= stageOriginalComp
                          ? "not-allowed"
                          : "pointer",
                      opacity: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Minus
                      size={16}
                      color={
                        stageComp <= stageOriginalComp
                          ? "var(--neutral-on-surface-tertiary)"
                          : "var(--feature-brand-primary)"
                      }
                    />
                  </button>
                  <input
                    type="text"
                    value={stageCompInput === "0" ? "" : formatNumberWithCommas(stageCompInput)}
                    placeholder="0"
                    onChange={(e) => {
                      let raw = String(e.target.value || "").replace(/,/g, "").replace(/\D/g, "");
                      if (raw.length > 1) {
                        raw = raw.replace(/^0+/, "");
                        if (raw === "") raw = "0";
                      }

                      setStageCompInput(raw);
                      if (stageCompError) setStageCompError("");

                      const nextComp = raw === "" ? 0 : parseInt(raw, 10);
                      if (!Number.isNaN(nextComp)) {
                        const totalAvailablePool = stageTotalPool;
                        const clampedComp = Math.max(
                          stageOriginalComp,
                          Math.min(nextComp, totalAvailablePool)
                        );
                        setStageComp(clampedComp);
                        const remainder = Math.max(
                          0,
                          totalAvailablePool - clampedComp
                        );
                        const nextProg = Math.min(stageProg, remainder);
                        const nextStart = Math.max(0, remainder - nextProg);
                        setStageProg(nextProg);
                        setStageStart(nextStart);
                      }
                    }}
                    style={{
                      width: "56px",
                      height: "32px",
                      textAlign: "center",
                      fontSize: "var(--text-subtitle-1)",
                      fontWeight: "var(--font-weight-bold)",
                      color:
                        stageCompInput === "" || stageCompInput === "0"
                          ? "var(--neutral-on-surface-tertiary)"
                          : "var(--neutral-on-surface-primary)",
                      border: stageCompError
                        ? "1px solid var(--status-red-primary)"
                        : "1px solid var(--neutral-line-separator-1)",
                      borderRadius: "var(--radius-small)",
                      outline: "none",
                      background: "var(--neutral-surface-primary)",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = stageCompError
                        ? "var(--status-red-primary)"
                        : "var(--feature-brand-primary)")}
                    onBlur={(e) =>
                      (e.target.style.borderColor = stageCompError
                        ? "var(--status-red-primary)"
                        : "var(--neutral-line-separator-1)")}
                  />
                  <button
                    disabled={stageStart === 0 && stageProg === 0}
                    onClick={() => {
                      const nextComp = stageComp + 1;
                      const shouldUseYetToStart = stageStart > 0;
                      const nextStart = shouldUseYetToStart
                        ? stageStart - 1
                        : stageStart;
                      const nextProg = shouldUseYetToStart
                        ? stageProg
                        : Math.max(0, stageProg - 1);
                      setStageComp(nextComp);
                      setStageStart(nextStart);
                      setStageProg(nextProg);
                      setStageCompInput(String(nextComp));
                      setStageMaxCompletable(
                        stageOriginalComp + nextStart + nextProg
                      );
                      setStageCompError("");
                    }}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "var(--radius-small)",
                      background:
                        stageStart === 0 && stageProg === 0
                          ? "var(--neutral-surface-grey-lighter)"
                          : "var(--feature-brand-primary)",
                      border: "1px solid var(--neutral-line-separator-1)",
                      cursor:
                        stageStart === 0 && stageProg === 0
                          ? "not-allowed"
                          : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Plus
                      size={16}
                      color={
                        stageStart === 0 && stageProg === 0
                          ? "var(--neutral-on-surface-tertiary)"
                          : "var(--neutral-surface-primary)"
                      }
                    />
                  </button>
                </div>
              </div>

              {stageCompError ? (
                <span
                  style={{
                    marginTop: "-4px",
                    fontSize: "var(--text-body)",
                    color: "var(--status-red-primary)",
                  }}
                >
                  {stageCompError}
                </span>
              ) : null}

              {isSelectedStageOutsourced ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setIsManageStageVendorSectionExpanded((prev) => !prev)
                    }
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      width: "100%",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-title-2)",
                        fontWeight: "var(--font-weight-bold)",
                        color: "var(--neutral-on-surface-primary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Assigned Vendors ({vendors.length})
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: "1px",
                        background: "var(--neutral-line-separator-1)",
                      }}
                    />
                    <ChevronDownIcon
                      size={18}
                      color="var(--neutral-on-surface-secondary)"
                      style={{
                        transform: isManageStageVendorSectionExpanded
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  </button>
                  {isManageStageVendorSectionExpanded ? (
                    <div style={poReferenceTableFrameStyle}>
                        <div
                          style={{
                            ...poReferenceTableScrollerStyle,
                          }}
                        >
                        <div style={poReferenceTableInnerStyle("100%")}>
                          <div
                            style={{
                              ...poReferenceTableHeaderRowStyle(
                                "1.4fr 1fr 1fr 1.1fr"
                              ),
                              position: "sticky",
                              top: 0,
                              zIndex: 2,
                            }}
                          >
                            <div style={poReferenceTableHeaderCellStyle()}>
                              Vendor Name
                            </div>
                            <div style={poReferenceTableHeaderCellStyle()}>
                              Assigned Output
                            </div>
                            <div style={poReferenceTableHeaderCellStyle()}>
                              Received Output
                            </div>
                            <div style={poReferenceTableHeaderCellStyle()}>
                              Status
                            </div>
                          </div>
                          {(vendors.length > 0 ? vendors : []).map(
                            (vendor, idx) => {
                              const vendorStatusMeta = getVendorStatusMeta(vendor);
                              return (
                                <div
                                  key={vendor.id}
                                  style={poReferenceTableRowStyle(
                                    "1.4fr 1fr 1fr 1.1fr",
                                    idx === vendors.length - 1
                                  )}
                                >
                                  <div
                                    style={poReferenceTableCellStyle({
                                      minWidth: 0,
                                    })}
                                  >
                                    <span
                                      style={{
                                        display: "block",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {vendor.name}
                                    </span>
                                  </div>
                                  <div style={poReferenceTableCellStyle()}>
                                    {vendor.output || 0} pcs
                                  </div>
                                  <div style={poReferenceTableCellStyle()}>
                                    {vendor.receivedOutput || 0} pcs
                                  </div>
                                  <div style={poReferenceTableCellStyle()}>
                                    <StatusBadge variant={vendorStatusMeta.variant}>
                                      {vendorStatusMeta.text}
                                    </StatusBadge>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div style={{ marginTop: "8px", flexShrink: 0 }}>
              <Button
                variant="filled"
                size="large"
                style={{ width: "100%" }}
                onClick={() => {
                  const minComp = stageOriginalComp;
                  const sanitizedCompInput =
                    stageCompInput === "" ? 0 : parseInt(stageCompInput, 10);
                  const maxComp = stageTotalPool;

                  if (Number.isNaN(sanitizedCompInput)) {
                    setStageCompError(
                      "Completed value must be a valid number."
                    );
                    return;
                  }

                  if (sanitizedCompInput < minComp) {
                    setStageCompError(
                      `Completed value cannot be lower than ${minComp}.`
                    );
                    return;
                  }

                  if (sanitizedCompInput > maxComp) {
                    setStageCompError(
                      `Completed value cannot be higher than ${maxComp}.`
                    );
                    return;
                  }


                  const finalStageComp = sanitizedCompInput;
                  const finalStageProg = Math.max(
                    0,
                    Math.min(stageProg, stageTotalPool - finalStageComp)
                  );

                  setRoutingStages((prev) =>
                    prev.map((r) =>
                      r.step === selectedStageData?.step
                        ? { ...r, prog: finalStageProg, comp: finalStageComp }
                        : r
                    )
                  );
                  const stageRef = selectedStageData || selectedStage;
                  addActivityLog(
                    "Routing Progress Updated",
                    `Step ${stageRef?.step} now has ${finalStageProg} items in progress and ${finalStageComp} completed`
                  );
                  setStageComp(finalStageComp);
                  setStageProg(finalStageProg);
                  setStageCompInput(String(finalStageComp));
                  setStageProgError("");
                  setStageCompError("");
                  setIsManageStageModalOpen(false);
                  if (woStatus === "ready_to_process") {
                    setWoStatus("in_progress");
                  }

                  setToastMessage("Routing stage successfully updated");
                  setShowSuccessToast(true);
                }}
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {isSelectExistingPoModalOpen ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: selectedExistingPoNumber ? "900px" : "450px",
              maxWidth: "calc(100vw - 32px)",
              background: "var(--neutral-surface-primary)",
              borderRadius: "var(--radius-card)",
              display: "flex",
              flexDirection: "row",
              position: "relative",
              boxShadow: "var(--elevation-sm)",
              overflow: "hidden",
              maxHeight: "90vh",
              transition: "width 0.3s ease",
            }}
          >
            <IconButton
              icon={CloseIcon}
              size="large"
              onClick={() => setIsSelectExistingPoModalOpen(false)}
              style={{ position: "absolute", top: "16px", right: "16px", zIndex: 2 }}
              color="var(--neutral-on-surface-primary)"
            />
            <div
              style={{
                flex: "1",
                padding: "64px 32px 32px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  position: "relative",
                  minHeight: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "var(--text-headline)",
                    fontWeight: "var(--font-weight-bold)",
                    textAlign: "center",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  Select Existing Purchase Order
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "var(--text-body)",
                      color: "var(--neutral-on-surface-primary)",
                    }}
                  >
                    Vendor Name
                  </span>
                  <span
                    style={{
                      fontSize: "var(--text-title-2)",
                      fontWeight: "bold",
                      color: "var(--neutral-on-surface-primary)",
                    }}
                  >
                    {selectedVendorForPoAction?.name}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label
                    style={{
                      fontSize: "var(--text-body)",
                      fontWeight: "var(--font-weight-regular)",
                      color: "var(--neutral-on-surface-primary)",
                    }}
                  >
                    <span style={{ color: "var(--status-red-primary)" }}>*</span> Purchase Order
                  </label>
                  <DropdownSelect
                    value={selectedExistingPoNumber}
                    onChange={(nextValue) => setSelectedExistingPoNumber(nextValue)}
                    placeholder="Select purchase order"
                    options={MOCK_PO_TABLE_DATA.filter(
                      (po) =>
                        po.vendorName === selectedVendorForPoAction?.name &&
                        ["draft", "need_revision"].includes(po.statusKey)
                    ).map((po) => ({
                      value: po.poNumber,
                      label: `${po.poNumber} (${po.status})`,
                    }))}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "auto",
                  paddingTop: "12px",
                }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  style={{ flex: 1 }}
                  onClick={() => setIsSelectExistingPoModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="filled"
                  size="large"
                  style={{ flex: 1 }}
                  disabled={!selectedExistingPoNumber}
                  onClick={handleAttachExistingPo}
                >
                  Assign PO
                </Button>
              </div>
            </div>

            {selectedExistingPoNumber && (
              <div
                style={{
                  flex: "1",
                  background: "var(--neutral-surface-grey-lighter)",
                  borderLeft: "1px solid var(--neutral-line-separator-1)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "20px 32px",
                    minHeight: "73px",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    background: "var(--neutral-surface-primary)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "var(--text-title-2)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--neutral-on-surface-primary)",
                    }}
                  >
                    Purchase Order Preview
                  </h3>
                </div>

                <div
                  style={{
                    padding: "24px 32px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                    overflowY: "auto",
                    flex: 1,
                  }}
                >
                  {renderPoPreviewContent(selectedPoDetail)}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {isSingleVendorModalOpen ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: singleVendorForm.poNumber ? "900px" : "450px",
              maxWidth: "100vw",
              background: "var(--neutral-surface-primary)",
              display: "flex",
              flexDirection: "row-reverse",
              position: "relative",
              boxShadow: "-4px 0 16px rgba(0,0,0,0.1)",
              height: "100vh",
              transition: "width 0.3s ease",
            }}
          >
            <div
              style={{
                flex: "1",
                display: "flex",
                flexDirection: "column",
                width: singleVendorForm.poNumber ? "450px" : "100%",
                maxWidth: singleVendorForm.poNumber ? "450px" : "100%",
                borderLeft: singleVendorForm.poNumber ? "1px solid var(--neutral-line-separator-1)" : "none",
                background: "var(--neutral-surface-primary)",
              }}
            >
              {/* Drawer Header */}
              <div
                style={{
                  padding: "20px 24px",
                  minHeight: "73px",
                  borderBottom: "1px solid var(--neutral-line-separator-1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "var(--text-title-1)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  {singleVendorForm.id
                    ? "Edit Assigned Vendor"
                    : "Add Assigned Vendor"}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <IconButton
                    icon={CloseIcon}
                    onClick={() => {
                      setAssignedOutputError("");
                      setAssignedStepsError("");
                      setIsSingleVendorModalOpen(false);
                    }}
                    size="small"
                    color="var(--neutral-on-surface-primary)"
                  />
                </div>
              </div>

              <div
                style={{
                  flex: "1",
                  padding: "24px 32px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  overflowY: "auto",
                }}
              >

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <SearchableVendorSelect
                  label="Vendor Name"
                  required
                  value={singleVendorForm.name}
                  disabled={!!singleVendorForm.lockedVendorName}
                  placeholder="Type to search or add vendor"
                  options={vendorNameOptions}
                  error={vendorNameError}
                  onChange={(nextValue) => {
                    setVendorNameError("");
                    setAssignedStepsError("");
                    setSingleVendorForm({
                      ...singleVendorForm,
                      name: nextValue,
                      poNumber: "",
                      poDetailData: null,
                    })
                  }}
                />

                <div style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "2px",
                            fontSize: "var(--text-body)",
                            fontWeight: "var(--font-weight-regular)",
                          }}
                        >
                          <span style={{ color: "var(--status-red-primary)" }}>*</span>
                          <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                            Included Steps
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "var(--text-body)",
                            color: "var(--neutral-on-surface-secondary)",
                            marginTop: "-4px",
                          }}
                        >
                          Please select a sequential range of steps for this vendor assignment.
                        </div>
                        {assignedStepsError && (
                          <div
                            style={{
                              fontSize: "var(--text-body)",
                              color: "var(--status-red-primary)",
                            }}
                          >
                            {assignedStepsError}
                          </div>
                        )}
                      {outsourceSteps.length === 0 ? (
                        <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>
                          No outsourced steps available.
                        </span>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                          {[...outsourceSteps].sort((a, b) => a - b).map((step) => {
                            const stageInfo = routingStages.find((s) => s.step === step);
                            const stepLabel = `Step ${step}${stageInfo ? ` - ${stageInfo.route}` : ""}`;
                            const isChecked = singleVendorForm.assignedSteps?.includes(step) || false;
                            
                            let isDisabled = false;
                            const currentSteps = singleVendorForm.assignedSteps || [];
                            if (currentSteps.length > 0 && !isChecked) {
                              const min = Math.min(...currentSteps);
                              const max = Math.max(...currentSteps);
                              if (step !== min - 1 && step !== max + 1) {
                                isDisabled = true;
                              }
                            }
                            
                            return (
                              <div
                                key={step}
                                style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  gap: "8px", 
                                  cursor: isDisabled ? "not-allowed" : "pointer",
                                  opacity: isDisabled ? 0.5 : 1
                                }}
                                onClick={() => {
                                  if (isDisabled) return;
                                  setSingleVendorForm((prev) => {
                                    const newSteps = !isChecked
                                      ? [...(prev.assignedSteps || []), step]
                                      : (prev.assignedSteps || []).filter((s) => s !== step);
                                    return { ...prev, assignedSteps: newSteps };
                                  });
                                  setAssignedStepsError("");
                                }}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  disabled={isDisabled}
                                  onChange={() => {
                                    if (isDisabled) return;
                                    setSingleVendorForm((prev) => {
                                      const newSteps = !isChecked
                                        ? [...(prev.assignedSteps || []), step]
                                        : (prev.assignedSteps || []).filter((s) => s !== step);
                                      return { ...prev, assignedSteps: newSteps };
                                    });
                                    setAssignedStepsError("");
                                  }}
                                />
                                <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-primary)" }}>
                                  {stepLabel}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      </div>
                    </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {(() => {
                    const stepsToConsider = singleVendorForm.assignedSteps?.length > 0 
                      ? singleVendorForm.assignedSteps 
                      : outsourceSteps;
                      
                    const maxAssignedInConsideredSteps = stepsToConsider.length > 0 
                      ? Math.max(
                          0,
                          ...stepsToConsider.map(stepId => {
                            return vendors
                              .filter((v) => v.id !== singleVendorForm.id && (!v.assignedSteps || v.assignedSteps.length === 0 || v.assignedSteps.includes(stepId)))
                              .reduce((sum, v) => sum + (parseInt(v.output, 10) || 0), 0);
                          })
                        )
                      : vendors
                          .filter((v) => v.id !== singleVendorForm.id)
                          .reduce((sum, v) => sum + (parseInt(v.output, 10) || 0), 0);
                          
                    const availableQty = Math.max(0, TOTAL_QTY - maxAssignedInConsideredSteps);
                    const isExceedingTotal = (parseInt(singleVendorForm.output, 10) || 0) > availableQty;

                    return (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "2px",
                              fontSize: "var(--text-body)",
                              fontWeight: "var(--font-weight-regular)",
                            }}
                          >
                            <span style={{ color: "var(--status-red-primary)" }}>
                              *
                            </span>
                            <span
                              style={{ color: "var(--neutral-on-surface-primary)" }}
                            >
                              Assigned Output
                            </span>
                          </div>
                          <StatusBadge variant="blue-light">
                            {singleVendorForm.assignedSteps && singleVendorForm.assignedSteps.length > 0 
                              ? `Available: ${availableQty} pcs`
                              : `Available: -`}
                          </StatusBadge>
                        </div>
                        <InputGroup
                          type="number"
                          value={singleVendorForm.output}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              if (assignedOutputError) setAssignedOutputError("");
                              setSingleVendorForm({
                                ...singleVendorForm,
                                output: "",
                              });
                            } else {
                              const numValue = parseInt(val, 10);
                              if (!isNaN(numValue) && numValue >= 0) {
                                if (
                                  editingInternalVendor &&
                                  numValue < editingInternalMinimumOutput
                                ) {
                                  setAssignedOutputError(
                                    internalAssignedOutputErrorMessage
                                  );
                                } else if (assignedOutputError) {
                                  setAssignedOutputError("");
                                }
                                setSingleVendorForm((prev) => {
                                  const nextOutput = numValue.toString();
                                  const nextPoDetailData = prev.poNumber
                                    ? buildPoLinkSnapshot(
                                        buildDummyPoDetailData(prev.poNumber, {
                                          ...prev,
                                          output: nextOutput,
                                          poDetailData: null,
                                        })
                                      )
                                    : null;
                                  return {
                                    ...prev,
                                    output: nextOutput,
                                    poDetailData: nextPoDetailData,
                                  };
                                });
                              }
                            }
                          }}
                          placeholder="0"
                          suffix="pcs"
                          hasError={!!assignedOutputError || isExceedingTotal}
                        />
                        {(assignedOutputError || isExceedingTotal) && (
                          <span
                            style={{
                              fontSize: "var(--text-body)",
                              color: "var(--status-red-primary)",
                            }}
                          >
                            {isExceedingTotal
                              ? `Exceeds available quantity (${availableQty} pcs).`
                              : assignedOutputError}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>

                {singleVendorForm.name && singleVendorForm.name !== "Internal" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <SearchableVendorSelect
                        label="Purchase Order (Optional)"
                        value={singleVendorForm.poNumber}
                        placeholder="Select PO"
                        emptyMessage="No Editable Purchase Order Found"
                        disabled={singleVendorForm.name === "Internal"}
                        options={poOptions}
                        onChange={(nextPoNumber) => {
                          const selectedPo = MOCK_PO_TABLE_DATA.find(
                            (po) => po.poNumber === nextPoNumber
                          );
                          const poDetailData = nextPoNumber
                            ? buildPoLinkSnapshot(
                                buildDummyPoDetailData(nextPoNumber, {
                                  ...singleVendorForm,
                                  poNumber: nextPoNumber,
                                  poDetailData: null,
                                })
                              )
                            : null;
                          setSingleVendorForm({
                            ...singleVendorForm,
                            poNumber: nextPoNumber,
                            isPoApproved:
                              selectedPo?.statusKey === "issued" ||
                              selectedPo?.statusKey === "completed",
                            poStatus: poDetailData?.status,
                            poBadge: poDetailData?.sBadge,
                            poStatusKey: poDetailData?.statusKey,
                            poDetailData,
                          });
                        }}
                      />
                      {singleVendorForm.poNumber &&
                        singleVendorForm.status === "Not Started" && (
                          <Button
                            variant="tertiary"
                            style={{
                              padding: "4px 8px",
                              fontSize: "var(--text-desc)",
                              marginTop: "24px",
                              color: "var(--status-red-primary)",
                            }}
                            onClick={() =>
                              setSingleVendorForm({
                                ...singleVendorForm,
                                poNumber: "",
                                isPoApproved: false,
                                poStatus: null,
                                poBadge: null,
                                poStatusKey: null,
                                poDetailData: null,
                              })
                            }
                          >
                            Remove Selection
                          </Button>
                        )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        padding: "12px 14px",
                        background: "var(--feature-brand-container-lighter)",
                        borderRadius: "10px",
                        border: "1px solid var(--feature-brand-container)",
                      }}
                    >
                      <Info
                        size={16}
                        color="var(--feature-brand-primary)"
                        style={{ flexShrink: 0, marginTop: "2px" }}
                      />
                      <span
                        style={{
                          fontSize: "var(--text-desc)",
                          color: "var(--feature-brand-on-container)",
                          lineHeight: "1.5",
                        }}
                      >
                        Select an existing PO if it is already known. If left empty,
                        you can add the PO later.
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              </div>
              <div
                style={{
                  padding: "16px 32px",
                  borderTop: "1px solid var(--neutral-line-separator-1)",
                  display: "flex",
                  gap: "12px",
                  background: "var(--neutral-surface-primary)",
                }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setAssignedOutputError("");
                    setIsSingleVendorModalOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="filled"
                  size="large"
                  style={{ flex: 1 }}
                  onClick={handleSaveSingleVendor}
                >
                  Save
                </Button>
              </div>
            </div>

            {singleVendorForm.poNumber && (
              <div
                style={{
                  flex: "1",
                  background: "var(--neutral-surface-grey-lighter)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "20px 24px",
                    minHeight: "73px",
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    background: "var(--neutral-surface-primary)",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "var(--text-title-1)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--neutral-on-surface-primary)",
                    }}
                  >
                    Purchase Order Preview
                  </h3>
                </div>

                <div
                  style={{
                    padding: "24px 32px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                    overflowY: "auto",
                    flex: 1,
                  }}
                >
                  {renderPoPreviewContent(selectedVendorPoDetail)}
                </div>
              </div>
            )}

          </div>
        </div>
      ) : null}

      {isCreatePoModalOpen ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "900px",
              background: "var(--neutral-surface-primary)",
              borderRadius: "var(--radius-card)",
              display: "flex",
              overflow: "hidden",
              position: "relative",
              boxShadow: "var(--elevation-sm)",
              maxHeight: "90vh",
            }}
          >
            <IconButton
              icon={CloseIcon}
              size="large"
              onClick={() => setIsCreatePoModalOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                zIndex: 10,
              }}
              color="var(--neutral-on-surface-primary)"
            />

            <div
              style={{
                flex: "1.5",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
              }}
            >
              <h2
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "var(--text-headline)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--neutral-on-surface-primary)",
                }}
              >
                Create Purchase Order
              </h2>
              <span
                style={{
                  fontSize: "var(--text-body)",
                  color: "var(--neutral-on-surface-secondary)",
                  marginBottom: "24px",
                }}
              >
                Fill in the details to generate a PO for the outsourced item.
              </span>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <InputField
                    label="PO Date"
                    type="date"
                    value={createPoForm.poDate}
                    onChange={(e) =>
                      setCreatePoForm({
                        ...createPoForm,
                        poDate: e.target.value,
                      })
                    }
                    required
                  />
                  <InputField
                    label="Expected Delivery Date"
                    type="date"
                    value={createPoForm.deliveryDate}
                    onChange={(e) =>
                      setCreatePoForm({
                        ...createPoForm,
                        deliveryDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                        fontSize: "var(--text-body)",
                        fontWeight: "var(--font-weight-regular)",
                      }}
                    >
                      <span style={{ color: "var(--status-red-primary)" }}>
                        *
                      </span>
                      <span
                        style={{ color: "var(--neutral-on-surface-primary)" }}
                      >
                        Currency
                      </span>
                    </div>
                    <div style={{ position: "relative", width: "100%" }}>
                      <DropdownSelect
                        value={createPoForm.currency}
                        onChange={(nextValue) =>
                          setCreatePoForm({
                            ...createPoForm,
                            currency: nextValue,
                          })
                        }
                        options={[
                          { value: "IDR", label: "IDR - Indonesian Rupiah" },
                          { value: "USD", label: "USD - US Dollar" },
                        ]}
                      />
                    </div>
                  </div>
                  <InputField
                    label="Unit Price"
                    type="number"
                    placeholder="0"
                    value={createPoForm.unitPrice}
                    onChange={(e) =>
                      setCreatePoForm({
                        ...createPoForm,
                        unitPrice: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <InputField
                    label="Tax (%)"
                    type="number"
                    placeholder="0"
                    value={createPoForm.tax}
                    onChange={(e) =>
                      setCreatePoForm({ ...createPoForm, tax: e.target.value })
                    }
                  />
                  <InputField
                    label="Additional Fees"
                    type="number"
                    placeholder="0"
                    value={createPoForm.fees}
                    onChange={(e) =>
                      setCreatePoForm({ ...createPoForm, fees: e.target.value })
                    }
                  />
                </div>
                <InputField
                  label="Notes"
                  multiline
                  placeholder="Delivery notes..."
                  value={createPoForm.notes}
                  onChange={(e) =>
                    setCreatePoForm({ ...createPoForm, notes: e.target.value })
                  }
                />
                <InputField
                  label="Terms"
                  multiline
                  placeholder="Payment terms..."
                  value={createPoForm.terms}
                  onChange={(e) =>
                    setCreatePoForm({ ...createPoForm, terms: e.target.value })
                  }
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "24px",
                  paddingTop: "24px",
                  borderTop: "1px solid var(--neutral-line-separator-1)",
                }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  style={{ flex: 1 }}
                  onClick={() => setIsCreatePoModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="filled"
                  size="large"
                  style={{ flex: 1 }}
                  onClick={handleSaveNewPo}
                  disabled={
                    !createPoForm.poDate ||
                    !createPoForm.deliveryDate ||
                    !createPoForm.unitPrice
                  }
                >
                  Save Purchase Order
                </Button>
              </div>
            </div>

            <div
              style={{
                flex: "1",
                background: "var(--neutral-surface-grey-lighter)",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                overflowY: "auto",
                borderLeft: "1px solid var(--neutral-line-separator-1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <DocumentIcon
                  size={20}
                  color="var(--neutral-on-surface-primary)"
                />
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  {initialData?.wo || "WO-2294824-20251109-00001"}
                </span>
              </div>

              <Card style={{ padding: "16px", gap: "12px", boxShadow: "none" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    paddingBottom: "12px",
                  }}
                >
                  <Building2
                    size={16}
                    color="var(--neutral-on-surface-tertiary)"
                  />
                  <span
                    style={{
                      fontSize: "var(--text-title-3)",
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    Vendor Information
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-title-2)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--feature-brand-primary)",
                    }}
                  >
                    {singleVendorForm.name}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--text-body)",
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    {selectedVendorDetails.email || "-"} •{" "}
                    {selectedVendorDetails.phone || "-"}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "var(--text-body)",
                    color: "var(--neutral-on-surface-primary)",
                    background: "var(--neutral-surface-grey-lighter)",
                    padding: "8px",
                    borderRadius: "4px",
                  }}
                >
                  {selectedVendorDetails.address || "-"}
                </div>
              </Card>

              <Card style={{ padding: "16px", gap: "12px", boxShadow: "none" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    paddingBottom: "12px",
                  }}
                >
                  <Info size={16} color="var(--neutral-on-surface-tertiary)" />
                  <span
                    style={{
                      fontSize: "var(--text-title-3)",
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    Order Information
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-body)",
                        color: "var(--neutral-on-surface-secondary)",
                      }}
                    >
                      Est. Received Date
                    </span>
                    <span
                      style={{
                        fontSize: "var(--text-title-3)",
                        fontWeight: "var(--font-weight-bold)",
                      }}
                    >
                      {singleVendorForm.date || "No Date Set"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-body)",
                        color: "var(--neutral-on-surface-secondary)",
                      }}
                    >
                      Product
                    </span>
                    <span
                      style={{
                        fontSize: "var(--text-title-3)",
                        fontWeight: "var(--font-weight-bold)",
                      }}
                    >
                      {initialData?.product || "Wooden Chair"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-body)",
                        color: "var(--neutral-on-surface-secondary)",
                      }}
                    >
                      Assigned Output
                    </span>
                    <span
                      style={{
                        fontSize: "var(--text-title-3)",
                        fontWeight: "var(--font-weight-bold)",
                        color: "var(--feature-brand-primary)",
                      }}
                    >
                      {singleVendorForm.output} pcs
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : null}

      {isUploadProofModalOpen ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "400px",
              background: "var(--neutral-surface-primary)",
              borderRadius: "var(--radius-card)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              position: "relative",
              boxShadow: "var(--elevation-sm)",
            }}
          >
            <IconButton
              icon={CloseIcon}
              size="large"
              onClick={() => {
                setIsUploadProofModalOpen(false);
                setProofDocuments([]);
                setProofUploadError("");
                setProofDescriptionErrors({});
                setProofAmount("");
                setProofDate("");
                setProofNote("");
              }}
              style={{ position: "absolute", top: "16px", right: "16px" }}
              color="var(--neutral-on-surface-primary)"
            />

            <h2
              style={{
                margin: "0",
                fontSize: "var(--text-headline)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
              }}
            >
              Receive Vendor Output
            </h2>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    fontSize: "var(--text-body)",
                    fontWeight: "var(--font-weight-regular)",
                  }}
                >
                  <span style={{ color: "var(--status-red-primary)" }}>*</span>
                  <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                    Received Quantity
                  </span>
                </div>
                <InputGroup
                  type="number"
                  value={proofAmount}
                  onChange={(e) => setProofAmount(e.target.value)}
                  placeholder="0"
                  max={
                    (selectedVendorObj?.output || 0) -
                    (selectedVendorObj?.receivedOutput || 0)
                  }
                  suffix="pcs"
                />
                <span
                  style={{
                    fontSize: "var(--text-desc)",
                    color: "var(--neutral-on-surface-secondary)",
                  }}
                >
                  Remaining to receive:{" "}
                  {(selectedVendorObj?.output || 0) -
                    (selectedVendorObj?.receivedOutput || 0)}{" "}
                  pcs
                </span>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    fontSize: "var(--text-body)",
                    fontWeight: "var(--font-weight-regular)",
                  }}
                >
                  <span style={{ color: "var(--status-red-primary)" }}>*</span>
                  <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                    Received Date
                  </span>
                </div>
                <DateInputControl
                  value={proofDate}
                  onChange={(e) => setProofDate(e.target.value)}
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    fontSize: "var(--text-body)",
                    fontWeight: "var(--font-weight-regular)",
                  }}
                >
                  <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                    Notes
                  </span>
                </div>
                <textarea
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                  placeholder="Add note for this receipt"
                  style={{
                    minHeight: "88px",
                    padding: "12px 16px",
                    width: "100%",
                    resize: "vertical",
                    ...inputFrameStyle(false, false),
                    ...inputControlStyle(false, !!proofNote),
                  }}
                  onFocus={(e) => focusInputFrame(e.currentTarget)}
                  onBlur={(e) => blurInputFrame(e.currentTarget, false, false)}
                />
              </div>

              {!isInternalProof ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                      fontSize: "var(--text-body)",
                      fontWeight: "var(--font-weight-regular)",
                    }}
                  >
                    <span style={{ color: "var(--status-red-primary)" }}>
                      *
                    </span>
                    <span
                      style={{ color: "var(--neutral-on-surface-primary)" }}
                    >
                      Upload Proof Document
                    </span>
                  </div>
                  <UploadDropzone
                    maxFiles={MAX_PROOF_UPLOAD_FILES}
                    multiple
                    error={proofUploadError}
                    onFilesSelected={handleVendorProofFilesSelected}
                  />
                  {proofDocuments.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      {proofDocuments.map((doc) => (
                        <UploadDescriptionCard
                          key={doc.id}
                          file={doc}
                          descriptionRequired
                          descriptionError={proofDescriptionErrors[doc.id]}
                          onDescriptionChange={(value) =>
                            updateVendorProofDescription(doc.id, value)
                          }
                          onRemove={() => removeVendorProofDocument(doc.id)}
                        />
                      ))}
                    </div>
                  ) : null}
                  {proofUploadError ? (
                    <span
                      style={{
                        fontSize: "var(--text-body)",
                        color: "var(--status-red-primary)",
                      }}
                    >
                      {proofUploadError}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <Button
                variant="outlined"
                size="large"
                style={{ flex: 1 }}
                onClick={() => {
                  setIsUploadProofModalOpen(false);
                  setProofDocuments([]);
                  setProofUploadError("");
                  setProofDescriptionErrors({});
                  setProofAmount("");
                  setProofDate("");
                  setProofNote("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                size="large"
                onClick={handleReceiveVendor}
                disabled={
                  isInternalProof
                    ? !proofDate
                    : !proofDate ||
                    proofDocuments.length === 0 ||
                    proofDocuments.some(
                      (doc) => !(doc.description || "").trim()
                    ) ||
                    !proofAmount ||
                    parseInt(proofAmount, 10) <= 0 ||
                    parseInt(proofAmount, 10) >
                    (selectedVendorObj?.output || 0) -
                    (selectedVendorObj?.receivedOutput || 0)
                }
                style={{ flex: 1 }}
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      ) : null}

{isSendToVendorModalOpen && selectedSendVendor ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)", display: "flex", justifyContent: "flex-end", zIndex: 20000 }}>
          <div style={{ position: "absolute", inset: 0 }} onClick={() => {
            setIsSendToVendorModalOpen(false);
            setSelectedSendVendor(null);
            setSendAmount("");
            setSendNotes("");
            setSendProofDocuments([]);
            setSendErrors({});
            setSendProofUploadError("");
          }} />
          <div style={{ position: "relative", width: "600px", background: "var(--neutral-surface-primary)", height: "100%", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px", borderBottom: "1px solid var(--neutral-line-separator-1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Release to Vendor</span>
              </div>
              <IconButton icon={CloseIcon} onClick={() => {
                setIsSendToVendorModalOpen(false);
                setSelectedSendVendor(null);
                setSendAmount("");
                setSendNotes("");
                setSendProofDocuments([]);
                setSendErrors({});
                setSendProofUploadError("");
              }} size="small" color="var(--neutral-on-surface-primary)" />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {selectedSendVendor ? (
                <Card style={{ padding: "16px", boxShadow: "none", border: "1px solid var(--neutral-line-separator-1)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", rowGap: "16px" }}>
                    <LabelValue label="Vendor Name" value={selectedSendVendor.name} />
                    <LabelValue label="Assignment ID" value={selectedSendVendor.assignmentId || "-"} />
                    <LabelValue 
                      label="Included Steps" 
                      value={selectedSendVendor.assignedSteps?.length > 0 ? [...selectedSendVendor.assignedSteps].sort((a, b) => a - b).join(", ") : "-"} 
                    />
                    <LabelValue 
                      label="Purchase Order" 
                      value={selectedSendVendor.poNumber ? (
                        <span 
                          style={{ color: "var(--feature-brand-primary)", textDecoration: "underline", cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/purchase-order/${selectedSendVendor.poNumber}`, "_blank");
                          }}
                        >
                          {selectedSendVendor.poNumber}
                        </span>
                      ) : "-"} 
                    />
                    <LabelValue 
                      label="Released Qty" 
                      value={`${selectedSendVendor.sentOutput || 0} / ${selectedSendVendor.output || 0} pcs`} 
                    />
                  </div>
                </Card>
              ) : null}

              <FormField label="Released by" required error={sendErrors.sendBy}>
                <InputField
                  value="Natasha Smith"
                  disabled
                  onChange={() => {}}
                  placeholder="Enter name"
                  error={sendErrors.sendBy}
                />
              </FormField>

              <InputField
                label="Release Qty"
                required
                type="number"
                value={sendAmount}
                onChange={(e) => {
                  setSendAmount(e.target.value);
                  if (sendErrors.sendAmount) setSendErrors(prev => ({ ...prev, sendAmount: "" }));
                }}
                placeholder="Enter amount"
                error={sendErrors.sendAmount}
                suffix="pcs"
                headerRight={
                  <StatusBadge variant="blue-light">
                    Available: {selectedSendVendor ? Math.max(0, (selectedSendVendor.output || 0) - (selectedSendVendor.sentOutput || 0)) : 0} pcs
                  </StatusBadge>
                }
              />
            </div>

            <InputField
              label="Notes"
              value={sendNotes}
              onChange={(e) => setSendNotes(e.target.value)}
              placeholder="Add any notes here... (optional)"
              maxLength={1000}
              multiline={true}
              headerRight={
                <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>
                  {sendNotes.length} / 1000
                </span>
              }
            />

            <FormField label="Upload Proof Document" required error={sendProofUploadError}>
              <UploadDropzone
                maxFiles={MAX_PROOF_UPLOAD_FILES}
                multiple
                error={sendProofUploadError}
                onFilesSelected={handleSendProofFilesSelected}
              />
              {sendProofDocuments.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                  {sendProofDocuments.map((doc) => (
                    <UploadDescriptionCard
                      key={doc.id}
                      file={doc}
                      descriptionRequired={true}
                      descriptionError={sendProofDescriptionErrors[doc.id]}
                      onDescriptionChange={(value) => updateSendProofDescription(doc.id, value)}
                      onRemove={() => removeSendProofDocument(doc.id)}
                    />
                  ))}
                </div>
              ) : null}
            </FormField>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--neutral-line-separator-1)", background: "var(--neutral-surface-primary)", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  setIsSendToVendorModalOpen(false);
                  setSelectedSendVendor(null);
                  setSendAmount("");
                  setSendNotes("");
                  setSendProofDocuments([]);
                  setSendErrors({});
                  setSendProofUploadError("");
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                size="large"
                onClick={handleSendToVendor}
                style={{ flex: 1 }}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {isViewReceiptHistoryModalOpen && receiptHistoryVendor ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)", display: "flex", justifyContent: "flex-end", zIndex: 20000 }}>
          <div style={{ position: "absolute", inset: 0 }} onClick={() => setIsViewReceiptHistoryModalOpen(false)} />
          <div style={{ position: "relative", width: "960px", background: "var(--neutral-surface-primary)", height: "100%", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px", borderBottom: "1px solid var(--neutral-line-separator-1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Assignment Log</span>
              </div>
              <IconButton icon={CloseIcon} onClick={() => setIsViewReceiptHistoryModalOpen(false)} size="small" color="var(--neutral-on-surface-primary)" />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>

            {receiptHistoryVendor.name !== "Internal" && (
              <Card style={{ padding: "16px", boxShadow: "none", border: "1px solid var(--neutral-line-separator-1)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", rowGap: "16px" }}>
                  <LabelValue label="Vendor Name" value={receiptHistoryVendor.name} />
                  <LabelValue label="Assignment ID" value={receiptHistoryVendor.assignmentId || "-"} />
                  <LabelValue 
                    label="Included Steps" 
                    value={receiptHistoryVendor.assignedSteps?.length > 0 ? [...receiptHistoryVendor.assignedSteps].sort((a, b) => a - b).join(", ") : "-"} 
                  />
                  <LabelValue 
                    label="Purchase Order" 
                    value={receiptHistoryVendor.poNumber ? (
                      <span 
                        style={{ color: "var(--feature-brand-primary)", textDecoration: "underline", cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/purchase-order/${receiptHistoryVendor.poNumber}`, "_blank");
                        }}
                      >
                        {receiptHistoryVendor.poNumber}
                      </span>
                    ) : "-"} 
                  />
                  <LabelValue 
                    label="Receipt Progress" 
                    value={`${receiptHistoryVendor.receivedOutput || 0} / ${receiptHistoryVendor.output || 0} pcs`} 
                  />
                </div>
              </Card>
            )}

            {receiptHistoryVendor.name !== "Internal" && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {[
                  { id: "send", label: "Released to Vendor" },
                  { id: "receipt", label: "Receipt" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setAssignmentLogTab(tab.id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "100px",
                      border: "1px solid",
                      borderColor:
                        assignmentLogTab === tab.id
                          ? "var(--feature-brand-primary)"
                          : "var(--neutral-line-separator-1)",
                      background:
                        assignmentLogTab === tab.id
                          ? "var(--feature-brand-container-lighter)"
                          : "var(--neutral-surface-primary)",
                      color:
                        assignmentLogTab === tab.id
                          ? "var(--feature-brand-primary)"
                          : "var(--neutral-on-surface-secondary)",
                      fontSize: "14px",
                      fontWeight: assignmentLogTab === tab.id ? "600" : "400",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            <div style={poReferenceTableFrameStyle}>
              <div
                style={{
                  ...poReferenceTableScrollerStyle,
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                <div
                  style={poReferenceTableInnerStyle("100%")}
                >
                  <div style={poReferenceTableHeaderRowStyle(assignmentLogTab === "send" ? "120px 120px 80px 1fr 120px 160px 48px" : "120px 120px 80px 1fr 120px 160px")}>
                    <div style={poReferenceTableHeaderCellStyle()}>Date & Time</div>
                    <div style={poReferenceTableHeaderCellStyle()}>{assignmentLogTab === "send" ? "Release ID" : "Receipt ID"}</div>
                    <div style={poReferenceTableHeaderCellStyle()}>{assignmentLogTab === "send" ? "Release Qty" : "Receipt Qty"}</div>
                    <div style={poReferenceTableHeaderCellStyle()}>Notes</div>
                    <div style={poReferenceTableHeaderCellStyle()}>{assignmentLogTab === "send" ? "Released by" : "Received by"}</div>
                    <div style={poReferenceTableHeaderCellStyle()}>Document</div>
                    {assignmentLogTab === "send" && <div style={poReferenceTableHeaderCellStyle()}>Export</div>}
                  </div>

                  {(assignmentLogTab === "send" ? receiptHistoryVendor.sendHistory : receiptHistoryVendor.receipts)?.map((r, i, arr) => (
                    <div
                      key={i}
                      style={poReferenceTableRowStyle(assignmentLogTab === "send" ? "120px 120px 80px 1fr 120px 160px 48px" : "120px 120px 80px 1fr 120px 160px", i === arr.length - 1)}
                    >
                      <div style={poReferenceTableCellStyle()}>
                        {r.date}{r.time ? ` · ${r.time}` : ""}
                      </div>
                      <div style={poReferenceTableCellStyle()}>
                        {assignmentLogTab === "send" ? r.releaseId || "-" : r.receiptId || r.receiptNumber || "-"}
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          fontWeight: "var(--font-weight-bold)",
                        })}
                      >
                        {r.amount} pcs
                      </div>
                      <div style={poReferenceTableCellStyle()}>
                        {r.note || r.notes || "-"}
                      </div>
                      <div style={poReferenceTableCellStyle()}>
                        {assignmentLogTab === "send" ? (r.sendBy || r.sentBy || "Natasha Smith") : (r.receivedBy || "Natasha Smith")}
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                          minWidth: 0
                        })}
                      >
                        <ProofDocumentList
                          documents={
                            r.attachments ||
                            r.proofDocuments ||
                            normalizeProofDocuments([], r.attachment)
                          }
                          onDocumentClick={(doc) => {
                            setToastMessage(
                              `${doc?.name || "Document"} opened`
                            );
                            setShowSuccessToast(true);
                          }}
                        />
                      </div>
                      {assignmentLogTab === "send" && (
                        <div style={poReferenceTableCellStyle({ padding: "12px 0" })}>
                          <Tooltip content="Export PDF" position="top">
                            <IconButton
                              icon={DownloadIcon}
                              size="small"
                              color="var(--feature-brand-primary)"
                              onClick={async () => {
                                try {
                                  const vendorInfo = MOCK_VENDORS.find(v => v.name === receiptHistoryVendor.name) || { name: receiptHistoryVendor.name };
                                  const log = {
                                    releaseId: r.releaseId || "-",
                                    date: r.date || "-",
                                    time: r.time || "",
                                    sendBy: r.sendBy || r.sentBy || "Natasha Smith",
                                    assignmentId: receiptHistoryVendor.assignmentId || "-",
                                    woRef: receiptHistoryVendor.woNumber || "-",
                                    outsourceSteps: receiptHistoryVendor.assignedSteps || [],
                                    amount: r.amount,
                                    note: r.note || r.notes || "",
                                  };
                                  await downloadVendorReleasePdf({ log, poNumber: receiptHistoryVendor.poNumber || "-", vendorInfo, company: MOCK_COMPANY, woRoutingStages: [] });
                                } catch (e) {
                                  setToastMessage("Failed to export PDF");
                                  setShowSuccessToast(true);
                                }
                              }}
                            />
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  ))}
                  {!(assignmentLogTab === "send" ? receiptHistoryVendor.sendHistory : receiptHistoryVendor.receipts)?.length ? (
                    <div style={poReferenceTableEmptyStateStyle}>
                      No {assignmentLogTab === "send" ? "send documentation" : "receipts"} found.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            </div>
          </div>
        </div>
      ) : null}
      {isPlannedDateModalOpen && editingPlannedDateStep ? (() => {
        const stage = routingStages.find(s => s.step === editingPlannedDateStep);
        return (
          <GeneralModal
            isOpen={isPlannedDateModalOpen}
            width="480px"
            title="Add Planned Date"
            onClose={() => setIsPlannedDateModalOpen(false)}
            footer={
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                <Button variant="filled" size="large" style={{ width: "100%" }} onClick={handleSavePlannedDateModal}>
                  Save
                </Button>
                <Button variant="outlined" size="large" style={{ width: "100%" }} onClick={() => setIsPlannedDateModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "16px 0" }}>
              {stage && (
                <div style={{ fontSize: "var(--text-body-strong)", color: "var(--neutral-on-surface-secondary)" }}>
                  Step {stage.step}: {stage.route} - {stage.op}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-medium)", color: "var(--neutral-on-surface-primary)" }}>Date Range</label>
                <DateRangeInputControl
                  value={plannedDateForm}
                  onChange={(e) => setPlannedDateForm(e.target.value)}
                  disabled={false}
                />
              </div>
            </div>
          </GeneralModal>
        );
      })() : null}
    </div>
  );
};
