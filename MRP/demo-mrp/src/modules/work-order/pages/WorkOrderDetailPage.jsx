import React, { useEffect, useRef, useState } from "react";
import { Send, Truck } from "lucide-react";
import { AddIcon, Box, Building2, CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, CircleDollarSign, CloseIcon, DeleteIcon, DocumentIcon, DownloadIcon, EditIcon, FileText, Info, Minus, Plus, Upload, Users } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { Checkbox } from "../../../components/common/Checkbox.jsx";
import { ClampedDescriptionText } from "../../../components/common/ClampedDescriptionText.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { FilterMenu } from "../../../components/molecules/FilterMenu.jsx";
import { ChipTabBar } from "../../../components/molecules/ChipTabBar.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { Card, DateInputControl, DateRangeInputControl, DocumentTypeBadge, FormField, ImageUploadField, InputField, InputGroup, LabelValue, PhoneInputField, ProgressRing, ProofDocumentList, SectionCard, UploadDescriptionCard, UploadDropzone, UnifiedInputShell, focusInputFrame, blurInputFrame } from "../components/WorkOrderDetailWidgets.jsx";
import { Table, TextField } from "../../../ce-ui";
import { Tooltip } from "../../../components/atoms/Tooltip.jsx";
import { MOCK_COMPANY } from "../../../data/company.js";
import { MOCK_VENDORS } from "../../../data/vendors.js";
import { MOCK_PO_TABLE_DATA } from "../../purchase-order/mock/purchaseOrderMocks.js";
import { MOCK_WO_TABLE_DATA } from "../mock/workOrderMocks.js";
import { MOCK_MATERIALS_DATA } from "../../materials/mock/materialsMocks.js";
import { getBom, DEFAULT_COGS, resolveMaterialOption } from "../../bill-of-materials/mock/bomMocks.js";
import { computeMaterialCost, computeTotalCogs, fieldTotal, formatIDR } from "../../bill-of-materials/utils/bomUtils.js";
import { DetailCard, detailTableHeaderRowStyle, detailTableRowStyle } from "../../bill-of-materials/components/BomShared.jsx";
import { getRequests, addRequest, getStockBatchesForSku, REQUEST_STATUS_META } from "../../material-request/mock/materialRequestMocks.js";
import { addBatch } from "../../materials/mock/batchesStore.js";
import { addTransaction } from "../../materials/mock/transactionsStore.js";
import { formatCurrency, formatNumberWithCommas, parseNumberFromCommas } from "../../../utils/format/formatUtils.js";
import { normalizeProofDocuments, createUploadDocumentRecord, validateUploadFile } from "../../../utils/upload/uploadUtils.js";
import { MAX_PROOF_UPLOAD_FILES } from "../../../constants/appConstants.js";
import { buildPoLinkSnapshot } from "../../purchase-order/utils/purchaseOrderDetailUtils.js";
import { downloadVendorReleasePdf } from "../../purchase-order/utils/vendorReleasePdfExport.js";
import {
  baseInputBorderColor,
  fieldStyle,
} from "../../purchase-order/styles/purchaseOrderInputStyles.js";
import { WorkOrderEditDrawer } from "../components/WorkOrderEditDrawer.jsx";

export let activityLogsCache = {};
export let costingLogsCache = {};

let nextActualCostLineId = 1;

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

// Materials table is genuinely BOM-driven: it's computed from the work order's
// linked BOM (getBom(bomId).materials), each material's per-unit quantity scaled
// by the work order's total quantity. This works the same way for both Product
// and Material target-type work orders — the BOM is the BOM either way.
// requestedQty/receivedQty are preserved from any previously-saved WO state (so
// in-progress requests survive a re-render/navigation) and otherwise start at 0.
const initialBomMaterials = (woId, initialData) => {
  const cachedWo = woId ? MOCK_WO_TABLE_DATA.find((w) => w.wo === woId) : null;
  const bomId = initialData?.bomId || cachedWo?.bomId || null;
  const totalQty = Number(initialData?.qty ?? cachedWo?.qty ?? 0) || 0;
  const bom = bomId ? getBom(bomId) : null;
  if (!bom || !Array.isArray(bom.materials)) return [];

  const savedMaterials = initialData?.materials || cachedWo?.materials;

  return bom.materials.map((m, idx) => {
    const saved = Array.isArray(savedMaterials)
      ? savedMaterials.find((sm) => sm.sku === m.sku)
      : null;
    return {
      id: idx + 1,
      type: "BOM",
      name: m.name,
      sku: m.sku,
      requiredQty: (m.quantity || 0) * totalQty,
      requestedQty: saved?.requestedQty || 0,
      receivedQty: saved?.receivedQty || 0,
      unit: m.unit,
    };
  });
};

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

// Same cost fields/logic as the Bill of Materials module's Forecasted COGS
// (see modules/bill-of-materials/pages/BomDetailPage.jsx COGS_FIELDS) — Actual
// COGS on a Work Order tracks the same shape, sourced from the linked BOM.
const ACTUAL_COGS_FIELDS = [
  { key: "labour", title: "Labour Cost", icon: Users, description: "Cost of human labour to produce one unit" },
  { key: "packing", title: "Packing Cost", icon: FileText, description: "Cost of packaging this product for delivery" },
  { key: "shipping", title: "Shipping Cost", icon: Upload, description: "Cost of moving goods" },
  { key: "overhead", title: "Overhead Cost", icon: Building2, description: "Indirect factory costs not tied to a task" },
  { key: "other", title: "Other Cost", icon: CircleDollarSign, description: "Additional production cost not covered above" },
];

// Same palette convention as BomDetailPage's Cost Composition bar — reuse
// design tokens rather than introduce new colors.
const ACTUAL_COST_COMPOSITION_COLORS = {
  material: "var(--feature-brand-primary)",
  labour: "var(--feature-product-primary)",
  packing: "var(--feature-cashier-primary)",
  shipping: "var(--status-yellow-primary)",
  overhead: "var(--neutral-on-surface-secondary)",
  other: "var(--feature-invoice-primary)",
  outsourcing: "var(--status-red-primary)",
};

// Renders a small "X% over/under forecast" pill comparing an actual amount
// against its forecasted (BOM) counterpart. Returns null when there's no
// forecast baseline to compare against (e.g. Outsourcing has none in BOM).
const ActualVsForecastBadge = ({ actual, forecast, style }) => {
  if (!forecast) return null;
  const diffPct = ((actual - forecast) / forecast) * 100;
  const isOver = diffPct > 0.05;
  const isUnder = diffPct < -0.05;
  const color = isOver
    ? "var(--status-red-primary)"
    : isUnder
      ? "var(--status-green-primary)"
      : "var(--status-grey-on-container)";
  const bg = isOver
    ? "var(--status-red-container)"
    : isUnder
      ? "var(--status-green-container)"
      : "var(--status-grey-container)";
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: "600",
        color,
        background: bg,
        padding: "2px 8px",
        borderRadius: "var(--radius-full)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {isOver || isUnder ? (isOver ? "▲" : "▼") + ` ${Math.abs(diffPct).toFixed(1)}% ${isOver ? "over" : "under"} forecast` : "On forecast"}
    </span>
  );
};

const ACTUAL_COST_TABLE_GRID_COLUMNS = "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) 80px";
const MATERIAL_ACTUAL_COST_GRID_COLUMNS =
  "minmax(0, 2fr) minmax(0, 0.7fr) minmax(0, 0.9fr) minmax(0, 0.9fr) minmax(0, 0.9fr) minmax(0, 0.9fr)";
const OUTSOURCING_COST_GRID_COLUMNS =
  "minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1.1fr) minmax(0, 0.8fr) minmax(0, 0.9fr) minmax(0, 0.9fr)";

// Request history for the ongoing work order; other work orders start with none.
const ONGOING_REQUEST_HISTORY = [
  { id: "REQ0129032", date: "26/06/2026; 14:19", by: "Natasha Smith", status: "New Request" },
  { id: "REQ0129031", date: "12/02/2025; 15:00", by: "Anna Jones William Jonat...", status: "New Request" },
  { id: "REQ0129030", date: "10/02/2025; 15:00", by: "Richard Mille", status: "Preparing" },
  { id: "REQ0129029", date: "08/02/2025; 15:00", by: "Abigail Husni", status: "Transferring" },
  { id: "REQ0129028", date: "08/02/2025; 15:00", by: "Zoe Adams", status: "Completed" },
  { id: "REQ0129027", date: "08/02/2025; 15:00", by: "Zoe Adams", status: "Cancelled" },
];

// Completed work order with a fulfilled material request, used to demo the Actual COGS material breakdown.
const COMPLETED_REQUEST_WO = "WO-2024-08-012-00001";
const COMPLETED_REQUEST_HISTORY = [
  { id: "REQ0129020", date: "20/12/2025; 09:30", by: "Naomi", status: "Completed" },
];

// In-progress work order with a partially fulfilled material request, used to demo the Actual COGS
// material breakdown while a request is still being transferred.
const IN_PROGRESS_REQUEST_WO = "WO-202604-007";
const IN_PROGRESS_REQUEST_HISTORY = [
  { id: "REQ0129022", date: "27/04/2026; 09:00", by: "John Doe", status: "Transferring" },
  { id: "REQ0129021", date: "26/04/2026; 10:15", by: "John Doe", status: "Completed" },
];

const initialRequestHistory = (woId) => {
  if (woId === ONGOING_REQUEST_WO) return ONGOING_REQUEST_HISTORY;
  if (woId === COMPLETED_REQUEST_WO) return COMPLETED_REQUEST_HISTORY;
  if (woId === IN_PROGRESS_REQUEST_WO) return IN_PROGRESS_REQUEST_HISTORY;
  return [];
};

const REQUEST_STATUS_VARIANT = {
  "New Request": "blue",
  Preparing: "yellow",
  Transferring: "orange",
  Completed: "green",
  Cancelled: "red",
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
  clearable = false,
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
            padding: clearable && committedValue && !disabled ? "0 76px 0 16px" : "0 48px 0 16px",
            background: disabled
              ? "var(--neutral-surface-grey-lighter)"
              : "var(--neutral-surface-primary)",
            cursor: disabled ? "not-allowed" : "text",
          }}
        />
        {clearable && committedValue && !disabled ? (
          <CloseIcon
            size={16}
            color="var(--neutral-on-surface-secondary)"
            style={{
              position: "absolute",
              right: "44px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onChange?.("");
              setQuery("");
              setIsOpen(false);
              setIsFocused(false);
            }}
          />
        ) : null}
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

const PRIORITY_BADGE_VARIANT = {
  High: "red-light",
  Medium: "yellow-light",
  Low: "grey-light",
};

export const WorkOrderDetailPage = ({ onNavigate, isSidebarCollapsed, initialData, woSettings }) => {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };
  const [mainQty, setMainQty] = useState(initialData?.qty || 100);
  const [product, setProduct] = useState(initialData?.product || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [priority, setPriority] = useState(initialData?.priority || "Medium");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [orderType, setOrderType] = useState(initialData?.orderType || "Internal");
  const [outputs, setOutputs] = useState(
    initialData?.outputs?.length
      ? initialData.outputs
      : initialData?.materialId
        ? [{ isMain: true, materialId: initialData.materialId, name: initialData?.product, sku: initialData?.sku, qty: initialData?.qty }]
        : []
  );
  // Total Output = sum of every output's quantity (main + additional) — drives
  // Actual COGS per-unit math and output-allocation limits below.
  const TOTAL_QTY = outputs.length
    ? outputs.reduce((sum, o) => sum + (Number(o.qty) || 0), 0)
    : mainQty;
  // Routing Stages (and vendor/outsourcing step assignment, which is tied to
  // routing) are driven by the main output quantity alone — additional
  // outputs don't factor into routing progress math.
  const ROUTING_QTY = mainQty;
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("details");
  const [activityLogs, setActivityLogs] = useState(() => {
    if (initialData?.wo && activityLogsCache[initialData.wo]) {
      return activityLogsCache[initialData.wo];
    }
    
    const mockLogs = [];
    const statusKey = initialData?.statusKey || "not_started";
    const startDate = initialData?.start || "2026-03-20";
    
    if (statusKey === "cancelled") {
      mockLogs.push({
        name: "Natasha Smith", email: "natasha@company.com", title: "Cancelled", timestamp: `${startDate} at 14:00`
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

  // Costing Log: separate from the Activity Log — only cost line item
  // add/edit/delete and costing status changes (Ready to Finalize/Confirmed)
  // land here, so Finance/PIC can audit who touched Actual COGS and when
  // without wading through production/operational activity.
  const [costingLogs, setCostingLogs] = useState(() => {
    if (initialData?.wo && costingLogsCache[initialData.wo]) {
      return costingLogsCache[initialData.wo];
    }
    return [];
  });

  useEffect(() => {
    if (initialData?.wo) {
      costingLogsCache[initialData.wo] = costingLogs;
    }
  }, [costingLogs, initialData?.wo]);

  const addCostingLog = (title, desc = undefined) => {
    const d = new Date();
    const isoDate = d.toISOString().split('T')[0];
    const hrs = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    const formattedTimestamp = `${isoDate} at ${hrs}:${mins}`;

    setCostingLogs(prev => [
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
  const isCancelled = woStatus === "cancelled";

  // Costing Status ("Open" → "Ready to Finalize" → "Confirmed") is driven by
  // the global Actual COGS setting (Work Order Settings) — read live here, not
  // snapshotted per WO, so changing it takes effect for every WO immediately.
  const actualCogsMode = woSettings?.actualCogsMode || "disabled";
  const [costingStatus, setCostingStatus] = useState(() => {
    const cached = initialData?.wo ? MOCK_WO_TABLE_DATA.find((w) => w.wo === initialData.wo) : null;
    return initialData?.costingStatus || cached?.costingStatus || "Open";
  });
  const COSTING_BADGE_VARIANT = {
    Open: "grey-light",
    "Ready to Finalize": "blue-light",
    Confirmed: "green-light",
  };
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [readyStartDate, setReadyStartDate] = useState("");
  const [readyEndDate, setReadyEndDate] = useState("");
  const [isStockBuildFormModalOpen, setIsStockBuildFormModalOpen] = useState(false);
  const [isFinalCompleteModalOpen, setIsFinalCompleteModalOpen] = useState(false);
  const [isConfirmCostingModalOpen, setIsConfirmCostingModalOpen] = useState(false);
  const [completedDate, setCompletedDate] = useState(() => {
    const cached = initialData?.wo ? MOCK_WO_TABLE_DATA.find((w) => w.wo === initialData.wo) : null;
    return initialData?.completedDate || cached?.completedDate || null;
  });
  const [postedToStock, setPostedToStock] = useState(() => {
    const cached = initialData?.wo ? MOCK_WO_TABLE_DATA.find((w) => w.wo === initialData.wo) : null;
    return initialData?.postedToStock || cached?.postedToStock || false;
  });
  const [postOutputForm, setPostOutputForm] = useState({ notes: "" });
  // One row per work order output (Main + Additional) for the Confirm Stock
  // Build cost-allocation table: percentage / allocatedCost / unitCost stay
  // in sync with each other (see updateOutputCostRow), storageLocation and
  // expiryDate are per-row since outputs may be stocked separately.
  const [outputCostRows, setOutputCostRows] = useState([]);
  const [postOutputErrors, setPostOutputErrors] = useState({});
  // Snapshot of outputCostRows taken at final confirmation, so the "Confirm
  // Build Detail" tab can show exactly what was submitted even after the
  // in-progress outputCostRows/postOutputForm state resets.
  const [confirmedStockBuild, setConfirmedStockBuild] = useState(() => {
    const cached = initialData?.wo ? MOCK_WO_TABLE_DATA.find((w) => w.wo === initialData.wo) : null;
    return initialData?.confirmedStockBuild || cached?.confirmedStockBuild || null;
  });

  // --- Request Material flow state ---
  const [materials, setMaterials] = useState(() => initialBomMaterials(initialData?.wo, initialData));
  const [requestHistory, setRequestHistory] = useState(() => {
    const cachedWo = initialData?.wo
      ? MOCK_WO_TABLE_DATA.find((w) => w.wo === initialData.wo)
      : null;
    return initialData?.requestHistory || cachedWo?.requestHistory || initialRequestHistory(initialData?.wo);
  });
  // Ongoing work order has prior requests, so the history is available up front.
  // Other work orders only show it after a request is submitted in-session.
  const [hasSubmittedRequest, setHasSubmittedRequest] = useState(
    initialData?.wo === ONGOING_REQUEST_WO || requestHistory.length > 0
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

  // Requested/Received Qty must match whatever the Material Request module
  // currently shows for this WO's requests. "Requested Qty" only counts
  // quantity still sitting in an active (non-terminal) request — once a
  // request reaches Completed/Cancelled it's resolved, so any of it that
  // wasn't actually fulfilled drops back out of "requested" and becomes
  // available to request again (i.e. shortage), rather than sitting there
  // as a permanently-outstanding number. "Received Qty" always reflects
  // however much the module has actually allocated (fulfillableQty),
  // regardless of the request's status.
  const getLiveMaterialRequestTotals = (sku) => {
    const relevantRequests = getRequests().filter((r) =>
      requestHistory.some((rh) => rh.id === r.requestId)
    );
    let requestedQty = 0;
    let receivedQty = 0;
    relevantRequests.forEach((r) => {
      const isActive = r.status !== "completed" && r.status !== "cancelled";
      (r.items || []).forEach((item) => {
        if (item.sku !== sku) return;
        if (isActive) {
          requestedQty += Number(item.requestedQty) || 0;
        }
        const fulfillable = item.allocation?.fulfillableQty;
        if (typeof fulfillable === "number") receivedQty += fulfillable;
      });
    });
    return { requestedQty, receivedQty };
  };

  const remainingForMaterial = (name) => {
    const m = materials.find((mat) => mat.type === "BOM" && mat.name === name);
    if (!m) return null;
    const live = getLiveMaterialRequestTotals(m.sku);
    return Math.max(0, m.requiredQty - live.requestedQty - live.receivedQty);
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
      .filter((m) => m.type === "BOM" && remainingForMaterial(m.name) > 0)
      .map((m) =>
        makeDraftRow({
          type: "BOM",
          materialName: m.name,
          qty: String(remainingForMaterial(m.name)),
        })
      );

  const shortageMaterials = materials.filter(
    (m) => m.type === "BOM" && remainingForMaterial(m.name) > 0
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

  // Maps a requestDraft row field name to the key it's validated/errored under
  // in validateRequestDraft (they don't all match 1:1, e.g. materialName -> material).
  const DRAFT_FIELD_ERROR_KEY = {
    materialName: "material",
    qty: "qty",
    exceedingCategory: "exceedingCategory",
    exceedingReason: "exceeding",
    category: "category",
    reason: "reason",
  };

  const updateDraftRow = (rowId, changes) => {
    setRequestDraft((rows) =>
      rows.map((r) => (r.rowId === rowId ? { ...r, ...changes } : r))
    );
    // Clear stale inline errors for whichever fields the user just edited.
    setRequestErrors((prev) => {
      const next = { ...prev };
      let changed = false;
      Object.keys(changes).forEach((key) => {
        const errorSuffix = DRAFT_FIELD_ERROR_KEY[key];
        if (!errorSuffix) return;
        const errorKey = `${rowId}-${errorSuffix}`;
        if (errorKey in next) {
          delete next[errorKey];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
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

  // Navigate to the material request detail page in the same session (the row
  // lives inside a modal). The history stores the display id (e.g. REQ0129032);
  // the material request store keys it as `requestId`, so resolve to that id.
  const openRequestDetail = (req) => {
    const match = getRequests().find((r) => r.requestId === req.id);
    const id = match ? match.id : req.id;
    // Opened from the Work Order side → default the detail page to the Production POV,
    // and remember this work order so its Back button returns here instead of the list.
    onNavigate("material_request_detail", {
      id,
      pov: "production",
      returnTo: {
        view: "work_order_detail",
        data: initialData,
      },
    });
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
      if (row.qty === "" || isNaN(qtyNum)) {
        errors[`${row.rowId}-qty`] = "Field cannot be empty";
      } else if (qtyNum <= 0) {
        errors[`${row.rowId}-qty`] = "Qty must be greater than 0";
      }
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
        const remaining = mat ? remainingForMaterial(mat.name) : null;
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
  const [isOutsourceStagesExpanded, setIsOutsourceStagesExpanded] = useState(false);
  const outsourceStagesListRef = useRef(null);
  const [outsourceStagesCollapsedHeight, setOutsourceStagesCollapsedHeight] = useState(null);

  // Linked BOM is derived automatically from the work order's own record
  // (seeded bomId) — same BOM whose materials populate the Details tab's
  // Materials section — never user-selectable.
  const cachedWoForCogs = initialData?.wo
    ? MOCK_WO_TABLE_DATA.find((w) => w.wo === initialData.wo)
    : null;
  const actualCogsBomId = initialData?.bomId || cachedWoForCogs?.bomId || null;
  const targetType = initialData?.targetType || cachedWoForCogs?.targetType || "Product";
  const fulfillmentType = initialData?.fulfillmentType || cachedWoForCogs?.fulfillmentType || "CustomerOrder";
  const targetMaterialId = initialData?.materialId || cachedWoForCogs?.materialId || null;
  const targetMaterialObj = targetMaterialId
    ? MOCK_MATERIALS_DATA.find((m) => m.id === targetMaterialId)
    : null;
  const targetMaterialUom = targetMaterialObj?.unit || "unit";
  const [actualCogs, setActualCogs] = useState(() => {
    const savedCogs = initialData?.actualCogs || cachedWoForCogs?.actualCogs;
    if (savedCogs) return savedCogs;
    // Brand-new Actual COGS: seed each cost type's single default line with
    // its linked BOM's forecasted total, so Total Cost per Unit starts out
    // equal to Forecasted Cost per Unit until the user edits it.
    const base = DEFAULT_COGS();
    const linkedBomForDefaults = actualCogsBomId ? getBom(actualCogsBomId) : null;
    if (!linkedBomForDefaults) return base;
    return Object.fromEntries(
      Object.entries(base).map(([key, field]) => {
        const forecastTotal = fieldTotal(linkedBomForDefaults.cogs?.[key]);
        return [key, { ...field, lines: field.lines.map((l) => ({ ...l, amount: forecastTotal })) }];
      })
    );
  });
  // Shared Total Actual COGS, used by both the Actual COGS tab and the
  // Confirm Stock Build modal's cost-allocation table. Outsourcing cost is
  // intentionally left out here (it needs the tab's own vendor-cost rows to
  // compute) — material/labour/packing/shipping/overhead/other cover the
  // common case.
  const linkedBomForCogs = actualCogsBomId ? getBom(actualCogsBomId) : null;
  const materialCostForCogs = requestHistory.length > 0 ? computeMaterialCost(linkedBomForCogs?.materials || []) : 0;
  const totalActualCogsForModal =
    materialCostForCogs +
    fieldTotal(actualCogs.labour) +
    fieldTotal(actualCogs.packing) +
    fieldTotal(actualCogs.shipping) +
    fieldTotal(actualCogs.overhead) +
    fieldTotal(actualCogs.other);

  const [showActualMaterialBreakdown, setShowActualMaterialBreakdown] = useState(true);
  const [expandedActualCostMaterials, setExpandedActualCostMaterials] = useState({});
  const toggleActualCostMaterial = (materialId) =>
    setExpandedActualCostMaterials((prev) => ({ ...prev, [materialId]: !prev[materialId] }));
  const [showActualCostFieldBreakdown, setShowActualCostFieldBreakdown] = useState({});
  const toggleActualCostFieldBreakdown = (key) =>
    setShowActualCostFieldBreakdown((prev) => ({ ...prev, [key]: !prev[key] }));

  // Cost-item rows are view-only by default; adding/editing a row goes
  // through a modal (costItemModal), while delete acts directly on the row.
  const [costItemModal, setCostItemModal] = useState(null);
  const [costItemModalTouched, setCostItemModalTouched] = useState(false);
  const openAddCostItemModal = (key) => {
    setCostItemModal({ key, idx: null, label: "", amount: 0 });
    setCostItemModalTouched(false);
  };
  const openEditCostItemModal = (key, idx) => {
    const line = actualCogs[key].lines[idx];
    setCostItemModal({ key, idx, label: line.label, amount: line.amount });
    setCostItemModalTouched(false);
  };
  const closeCostItemModal = () => setCostItemModal(null);
  const costItemModalErrors = costItemModal
    ? {
        label: costItemModalTouched && !costItemModal.label?.trim(),
        amount:
          costItemModalTouched &&
          (costItemModal.amount === "" || costItemModal.amount === null || Number.isNaN(Number(costItemModal.amount))),
      }
    : { label: false, amount: false };
  const logCostItemChange = (actionTitle, key, label, amount) => {
    const costTypeTitle = ACTUAL_COGS_FIELDS.find((f) => f.key === key)?.title || key;
    const perUnit = TOTAL_QTY > 0 ? Math.round((Number(amount) || 0) / TOTAL_QTY) : 0;
    addCostingLog(
      `${costTypeTitle} ${actionTitle}`,
      `${label} with Total Cost per Unit: ${formatIDR(perUnit)} and Total Cost This WO: ${formatIDR(amount)}`
    );
  };
  const saveCostItemModal = () => {
    if (!costItemModal) return;
    const { key, idx, label, amount } = costItemModal;
    const hasLabel = !!label?.trim();
    const hasAmount = amount !== "" && amount !== null && !Number.isNaN(Number(amount));
    if (!hasLabel || !hasAmount) {
      setCostItemModalTouched(true);
      return;
    }
    const nextLine = { label, amount: Number(amount) || 0 };
    setActualCogs((prev) => {
      const field = prev[key];
      const lines = field.mode === "breakdown" ? field.lines : [];
      const nextLines =
        idx == null
          ? [...lines, { id: `wo-cost-line-${nextActualCostLineId++}`, noForecast: true, ...nextLine }]
          : lines.map((l, i) => (i === idx ? { ...l, ...nextLine } : l));
      return { ...prev, [key]: { ...field, mode: "breakdown", lines: nextLines } };
    });
    logCostItemChange(idx == null ? "Item Added" : "Item Edited", key, nextLine.label, nextLine.amount);
    closeCostItemModal();
  };
  const [deleteCostItemModal, setDeleteCostItemModal] = useState(null);
  const [deleteCostItemReason, setDeleteCostItemReason] = useState("");
  const [deleteCostItemError, setDeleteCostItemError] = useState("");
  const openDeleteCostItemModal = (key, idx) => {
    setDeleteCostItemModal({ key, idx });
    setDeleteCostItemReason("");
    setDeleteCostItemError("");
  };
  const closeDeleteCostItemModal = () => {
    setDeleteCostItemModal(null);
    setDeleteCostItemReason("");
    setDeleteCostItemError("");
  };
  const confirmDeleteCostItem = () => {
    if (!deleteCostItemReason.trim()) {
      setDeleteCostItemError("Reason is required");
      return;
    }
    const { key, idx } = deleteCostItemModal;
    const line = actualCogs[key]?.lines?.[idx];
    setActualCogs((prev) => ({
      ...prev,
      [key]: { ...prev[key], lines: prev[key].lines.filter((_, i) => i !== idx) },
    }));
    if (line) {
      const costTypeTitle = ACTUAL_COGS_FIELDS.find((f) => f.key === key)?.title || key;
      const perUnit = TOTAL_QTY > 0 ? Math.round((Number(line.amount) || 0) / TOTAL_QTY) : 0;
      addCostingLog(
        `${costTypeTitle} Item Deleted`,
        `${line.label} with Total Cost per Unit: ${formatIDR(perUnit)} and Total Cost This WO: ${formatIDR(line.amount)}. Reason: ${deleteCostItemReason.trim()}`
      );
    }
    closeDeleteCostItemModal();
  };

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
                  : woStatus === "cancelled"
                    ? "Cancelled"
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
                  : woStatus === "cancelled"
                    ? "red"
                    : MOCK_WO_TABLE_DATA[woIndex].sBadge,
        start: displayStartDate,
        end: displayEndDate,
        bomId: actualCogsBomId,
        actualCogs,
        costingStatus,
        costingBadge: COSTING_BADGE_VARIANT[costingStatus] || "grey-light",
        completedDate,
        postedToStock,
        requestHistory,
        materials,
        priority,
        pBadge: PRIORITY_BADGE_VARIANT[priority] || "yellow-light",
        notes,
        orderType,
        product,
        sku,
        qty: mainQty,
        outputs,
        confirmedStockBuild,
      };
    }
  }, [vendors, routingStages, outsourceSteps, woStatus, displayStartDate, displayEndDate, actualCogsBomId, actualCogs, costingStatus, completedDate, postedToStock, requestHistory, materials, priority, notes, orderType, product, sku, mainQty, outputs, confirmedStockBuild]);

  const hasStages = routingStages.length > 0;
  const allStagesCompleted =
    hasStages &&
    routingStages.every((stage) => {
      const vendorCompleted = vendors
        .filter((v) => v.name !== "Internal" && v.assignedSteps && v.assignedSteps.includes(stage.step))
        .reduce((acc, v) => acc + (parseInt(v.receivedOutput, 10) || 0), 0);
      return (stage.comp || 0) + vendorCompleted >= ROUTING_QTY;
    });

  // A work order can only complete once no material request is still ongoing —
  // i.e. every request is Completed/Cancelled (or there is no request history).
  // Status lives in the Material Request module's own store and progresses
  // independently, so check the live status rather than the frozen one
  // captured when the request was first made.
  const hasOngoingMaterialRequest = requestHistory.some((r) => {
    const liveRequest = getRequests().find((req) => req.requestId === r.id);
    const liveStatus = liveRequest?.status;
    return liveStatus ? liveStatus !== "completed" && liveStatus !== "cancelled" : true;
  });

  // Requested/Received Qty in the Materials table must match whatever the
  // Material Request module currently shows for this WO's requests — sum
  // requestedQty across every item with this SKU, and receivedQty from
  // however much of it the module has actually allocated (fulfillableQty),
  // rather than trusting a one-time bump made only when the request was
  // first submitted (which never reflected later progress/completion).

  // Completion is purely routing-driven — Costing Status is a separate,
  // parallel track and never blocks the Work Order from completing.
  const canCompleteWorkOrder =
    allStagesCompleted &&
    !hasOngoingMaterialRequest &&
    woStatus !== "completed" &&
    (fulfillmentType !== "StockBuild" || woStatus === "in_progress");

  // When the Actual COGS setting is enabled, once routing stages finish,
  // Costing Status flips to "Ready to Finalize" so Finance/PIC can review and
  // confirm Actual COGS — independently of (and without blocking) the Work
  // Order's own completion.
  useEffect(() => {
    if (
      actualCogsMode === "enabled" &&
      allStagesCompleted &&
      !hasOngoingMaterialRequest &&
      costingStatus === "Open"
    ) {
      setCostingStatus("Ready to Finalize");
    }
  }, [actualCogsMode, allStagesCompleted, hasOngoingMaterialRequest, costingStatus]);

  // Whether this WO ever had any material request activity — drives which
  // completion-confirmation copy shows (see handleOpenFinalCompleteModal).
  const hasNoRecordedMaterialUsage = requestHistory.length === 0;

  // Step 1 for Stock Build: opens the form modal (Quantity/Cost/Storage/etc).
  // Product/Customer Order work orders skip straight to the final confirm
  // step since they have no output-posting form to fill in.
  const openCompleteModal = () => {
    if (fulfillmentType === "StockBuild") {
      const totalOutputQtyAll = outputs.reduce((sum, o) => sum + (Number(o.qty) || 0), 0) || 1;
      const rows = outputs.map((o) => {
        const material = MOCK_MATERIALS_DATA.find((m) => m.id === o.materialId);
        const qty = Number(o.qty) || 0;
        const percentage = (qty / totalOutputQtyAll) * 100;
        const allocatedCost = totalActualCogsForModal * (percentage / 100);
        const unitCost = qty > 0 ? allocatedCost / qty : 0;
        return {
          id: o.materialId,
          materialId: o.materialId,
          name: o.name || material?.name || "-",
          sku: o.sku || material?.sku || "-",
          unit: o.unit || material?.unit || "unit",
          qty,
          percentage: String(Number(percentage.toFixed(2))),
          allocatedCost: String(Math.round(allocatedCost)),
          unitCost: String(Math.round(unitCost)),
          storageLocation: "",
          expiryDate: "",
          averageCost: material?.averageCost ?? null,
        };
      });
      setOutputCostRows(rows);
      setPostOutputForm({ notes: "" });
      setIsStockBuildFormModalOpen(true);
    } else {
      setIsFinalCompleteModalOpen(true);
    }
  };

  // Editing % / Allocated Cost / Unit Cost recalculates the other two so the
  // formula relationship (allocated = total * %, unit = allocated / qty)
  // stays intact no matter which field the user typed into.
  const updateOutputCostRow = (materialId, field, rawValue) => {
    setOutputCostRows((prev) =>
      prev.map((row) => {
        if (row.materialId !== materialId) return row;
        const qty = Number(row.qty) || 0;
        const total = totalActualCogsForModal;
        if (field === "percentage") {
          const pct = Number(rawValue) || 0;
          const allocatedCost = total * (pct / 100);
          const unitCost = qty > 0 ? allocatedCost / qty : 0;
          return { ...row, percentage: rawValue, allocatedCost: String(Math.round(allocatedCost)), unitCost: String(Math.round(unitCost)) };
        }
        if (field === "allocatedCost") {
          const alloc = Number(rawValue) || 0;
          const percentage = total > 0 ? (alloc / total) * 100 : 0;
          const unitCost = qty > 0 ? alloc / qty : 0;
          return { ...row, allocatedCost: rawValue, percentage: String(Number(percentage.toFixed(2))), unitCost: String(Math.round(unitCost)) };
        }
        if (field === "unitCost") {
          const uc = Number(rawValue) || 0;
          const allocatedCost = uc * qty;
          const percentage = total > 0 ? (allocatedCost / total) * 100 : 0;
          return { ...row, unitCost: rawValue, allocatedCost: String(Math.round(allocatedCost)), percentage: String(Number(percentage.toFixed(2))) };
        }
        return { ...row, [field]: rawValue };
      })
    );
  };

  // Live (not just on-confirm) validation for the cost-allocation table:
  // percentages must add up to 100%, and none of the three linked cost
  // fields may be zero. Storage Location stays optional.
  const outputCostPercentageTotal = outputCostRows.reduce((sum, row) => sum + (Number(row.percentage) || 0), 0);
  const outputCostPercentageOver =
    outputCostRows.length > 0 && outputCostPercentageTotal - 100 > 0.5;
  const outputCostPercentageUnder =
    outputCostRows.length > 0 && 100 - outputCostPercentageTotal > 0.5;
  const outputCostPercentageMismatch = outputCostPercentageOver || outputCostPercentageUnder;
  const getOutputCostRowErrors = (row) => ({
    percentage: Number(row.percentage) <= 0 ? "Field must be greater than 0" : "",
    allocatedCost: Number(row.allocatedCost) <= 0 ? "Field must be greater than 0" : "",
    unitCost: Number(row.unitCost) <= 0 ? "Field must be greater than 0" : "",
  });

  // Step 1 -> Step 2 for Stock Build: validates the form, then hands off to
  // the same final "Complete Work Order?" confirmation Product orders use.
  const handleStockBuildFormConfirm = () => {
    const hasFieldErrors = outputCostRows.some((row) => {
      const rowErrors = getOutputCostRowErrors(row);
      return rowErrors.percentage || rowErrors.allocatedCost || rowErrors.unitCost;
    });
    if (hasFieldErrors || outputCostPercentageMismatch) return;
    setIsStockBuildFormModalOpen(false);
    setIsFinalCompleteModalOpen(true);
  };

  // Final step for both flows: actually marks the WO Completed, and for
  // Stock Build also creates the Stock Batch + an "In" Stock Transaction.
  const handleConfirmCosting = () => {
    setCostingStatus("Confirmed");
    addCostingLog(
      "Costing Confirmed",
      "Actual COGS reviewed and confirmed. Cost items are now read-only."
    );
    setIsConfirmCostingModalOpen(false);
  };

  const handleFinalComplete = () => {
    const today = new Date().toISOString().slice(0, 10);

    if (fulfillmentType === "StockBuild") {
      const woId = initialData?.wo;

      outputCostRows.forEach((row, idx) => {
        const qty = Number(row.qty) || 0;
        const costPerUnit = Math.round(Number(row.unitCost) || 0);
        const batchNo = `BN-${today.replace(/-/g, "")}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}-${idx}`;

        addBatch({
          id: `batch-${Date.now()}-${idx}`,
          materialId: row.materialId,
          batchNo,
          initialQty: qty,
          currentQty: qty,
          reservedQty: 0,
          costPerUnit,
          purchaseDate: today,
          expiryDate: row.expiryDate || "",
          expectedDate: today,
          receivedDate: today,
          storageLocation: row.storageLocation,
          vendor: "Internal Production",
          attachments: [],
          status: "Received",
          reference: woId,
          notes: postOutputForm.notes || "",
        });

        addTransaction({
          id: `tx-${Date.now()}-${idx}`,
          materialId: row.materialId,
          date: new Date().toISOString(),
          batchNo,
          type: "In",
          quantity: qty,
          unit: row.unit,
          workOrder: woId,
          product: row.name,
          reason: "Stock Build Output",
          actionBy: "Natasha",
        });

        addActivityLog(
          "Posted Output to Stock",
          `${qty} ${row.unit} of ${row.name} posted to stock batch ${batchNo} (Storage: ${row.storageLocation || "-"}).`
        );
      });

      setPostedToStock(true);
      setConfirmedStockBuild({
        confirmedAt: new Date().toISOString(),
        notes: postOutputForm.notes || "",
        totalActualCogs: totalActualCogsForModal,
        rows: outputCostRows,
      });
    }

    // Finalize any material request that hadn't reached a terminal status yet.
    setRequestHistory((prev) =>
      prev.map((r) =>
        r.status !== "Completed" && r.status !== "Cancelled" ? { ...r, status: "Completed" } : r
      )
    );
    setWoStatus("completed");
    setCompletedDate(today);
    // Actual COGS setting disabled: costing auto-confirms once the WO is
    // done — no separate Finance/PIC review step. When enabled, completion
    // doesn't wait on costing — Costing Status stays whatever it currently is
    // (Open/Ready to Finalize) and gets confirmed independently afterward.
    if (actualCogsMode !== "enabled" && costingStatus !== "Confirmed") {
      setCostingStatus("Confirmed");
      addCostingLog("Costing Confirmed", "Costing auto-confirmed on Work Order completion.");
    }
    addActivityLog("Completed");
    setIsFinalCompleteModalOpen(false);
    setToastMessage(
      fulfillmentType === "StockBuild" ? "Stock build confirmed and posted to stock" : "Work order completed"
    );
    setShowSuccessToast(true);
  };

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
  let previousEffectiveComp = ROUTING_QTY;

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

  const computeReadyToSend = (vendor) => {
    if (!vendor || vendor.name === "Internal" || !vendor.assignedSteps || vendor.assignedSteps.length === 0) {
      return 0;
    }
    const livePo = vendor.poNumber ? MOCK_PO_TABLE_DATA.find((po) => po.poNumber === vendor.poNumber) : null;
    const isPoApproved = (livePo ? (livePo.statusKey === "issued" || livePo.statusKey === "completed") : false) || vendor.isPoApproved;
    if (!isPoApproved) return 0;

    const minStep = Math.min(...vendor.assignedSteps);
    const sentAmt = parseInt(vendor.sentOutput, 10) || 0;
    const assignedAmt = parseInt(vendor.output, 10) || 0;

    const rowIndex = stagesWithTotals.findIndex((r) => r.step === minStep);
    if (rowIndex === -1) return 0;

    const prevCompleted = minStep === 1 ? ROUTING_QTY : (stagesWithTotals[rowIndex - 1]?.effectiveTotalComp || 0);
    const currStage = stagesWithTotals[rowIndex];
    const internalProg = currStage?.prog || 0;
    const internalCompleted = currStage?.comp || 0;

    const vendorsConsumed = vendors
      .filter(v => v.name !== "Internal" && v.assignedSteps?.includes(minStep))
      .reduce((sum, v) => sum + Math.max(parseInt(v.sentOutput, 10) || 0, parseInt(v.receivedOutput, 10) || 0), 0);

    const totalConsumedByOthers = internalProg + internalCompleted + vendorsConsumed;
    const availableToProcess = Math.max(0, prevCompleted - totalConsumedByOthers);

    return Math.max(0, Math.min(availableToProcess, assignedAmt - sentAmt));
  };

  let firstOutsourceStart = 0;
  let isFirstOutsourceCompleted = false;
  if (outsourceSteps.length > 0) {
    const minStep = Math.min(...outsourceSteps);
    const rowIndex = stagesWithTotals.findIndex((r) => r.step === minStep);
    if (rowIndex !== -1) {
      const row = stagesWithTotals[rowIndex];
      const stepTotalPool =
        row.step === 1
          ? ROUTING_QTY
          : stagesWithTotals[rowIndex - 1]?.totalComp || 0;
      firstOutsourceStart = Math.max(
        0,
        stepTotalPool - (row.prog || 0) - (row.totalComp || 0)
      );

      if ((row.totalComp || 0) >= ROUTING_QTY) {
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

      if (proposedTotal > ROUTING_QTY) {
        setAssignedOutputError(
          `Cannot exceed total work order quantity (${ROUTING_QTY} unit). You have ${ROUTING_QTY - currentOtherTotal} unit available.`
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
              const routingName = matchedStage?.route;
              const operationName = matchedStage?.op || matchedStage?.operation;
              if (routingName && operationName) return `Step ${step}: ${routingName} - ${operationName}`;
              if (routingName || operationName) return `Step ${step}: ${routingName || operationName}`;
              return `Step ${step}`;
            });
            const stackedLabels = stageLabels.map((label) => `• ${label}`).join("\n");
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
                  : `${Number(line.qty) || 0} unit`;

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
            const routingName = matchedStage?.route;
            const operationName = matchedStage?.op || matchedStage?.operation;
            if (routingName && operationName) return `Step ${step}: ${routingName} - ${operationName}`;
            if (routingName || operationName) return `Step ${step}: ${routingName || operationName}`;
            return `Step ${step}`;
          });
          const stackedLabels = stageLabels.map((label) => `• ${label}`).join("\n");
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
            receiptId: `RCPT-${String((v.receipts || []).length + 1).padStart(4, "0")}`,
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
            {currentTotalOutput} / {TOTAL_QTY} unit
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
  const internalAssignedOutputErrorMessage = `Minimum is ${editingInternalMinimumOutput} unit due to existing progress.`;
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
        ? ROUTING_QTY
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

  // Measure actual rendered row heights so the collapsed "Allow Outsourced
  // Stages" list clips at exactly 4 full rows + half of the 5th, regardless
  // of how tall each row ends up being (text wrapping, mini bar size, etc).
  useEffect(() => {
    const el = outsourceStagesListRef.current;
    if (!el || outsourceSteps.length <= 4) {
      setOutsourceStagesCollapsedHeight(null);
      return;
    }
    const rows = Array.from(el.children);
    if (rows.length < 5) {
      setOutsourceStagesCollapsedHeight(null);
      return;
    }
    const gap = 12;
    let height = 0;
    for (let i = 0; i < 4; i++) {
      height += rows[i].offsetHeight + gap;
    }
    height += rows[4].offsetHeight / 2;
    setOutsourceStagesCollapsedHeight(height);
  }, [outsourceSteps, vendors, routingStages, woStatus]);

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
              width: "640px",
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
                Material Requests
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
              <div style={{ width: "144px", flexShrink: 0 }}>Type</div>
              <div style={{ flex: "2" }}>Material</div>
              <div style={{ width: "160px", flexShrink: 0 }}>Quantity</div>
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
                    <div style={{ width: "144px", flexShrink: 0 }}>
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
                    <div style={{ flex: "2" }}>
                      <DropdownSelect
                        value={row.materialName}
                        options={materialOptions}
                        placeholder="Select Material"
                        searchable
                        searchPlaceholder="Search material name or SKU"
                        hasError={!!err("material")}
                        fieldHeight="48px"
                        wrapValue
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
                    <div style={{ width: "160px", flexShrink: 0 }}>
                      <InputField
                        type="number"
                        placeholder="Enter qty"
                        value={row.qty}
                        onChange={(e) =>
                          updateDraftRow(row.rowId, { qty: e.target.value })
                        }
                        suffix={unit || undefined}
                        errorState={!!err("qty")}
                      />
                      {err("qty") && <span style={errStyle}>{err("qty")}</span>}
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
                        color={requestDraft.length === 1 ? undefined : "var(--status-red-primary)"}
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
          {shortageMaterials.length > 0 && woStatus !== "completed" ? (
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
            {requestHistory.map((req) => {
              // The Material Request module is the source of truth for status
              // (it progresses independently — New Request → Preparing →
              // Transferring → Completed/Cancelled); look it up live instead of
              // trusting the frozen status captured when the request was made.
              const liveRequest = getRequests().find((r) => r.requestId === req.id);
              const statusMeta = liveRequest ? REQUEST_STATUS_META[liveRequest.status] : null;
              const displayStatus = statusMeta?.label || req.status;
              const displayVariant = statusMeta?.badge || REQUEST_STATUS_VARIANT[req.status] || "grey";
              return (
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
                  <StatusBadge variant={displayVariant}>
                    {displayStatus}
                  </StatusBadge>
                </div>
              </div>
              );
            })}
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
          {!isCancelled && (
            <Button variant="outlined" onClick={() => setIsEditDrawerOpen(true)}>
              Edit Work Order
            </Button>
          )}
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
            {woStatus === "cancelled" ? (
              <StatusBadge variant="red">Cancelled</StatusBadge>
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
              value={
                fulfillmentType === "StockBuild"
                  ? "-"
                  : initialData?.ord || "ORD-248824-20251109-00001"
              }
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
              value={priority}
              badge={{
                variant: PRIORITY_BADGE_VARIANT[priority] || "yellow-light",
                text: priority,
              }}
            />

            <LabelValue label="Created On" value={`2025-12-08; 15:00`} />
            <LabelValue
              label="Fulfillment Type"
              value={fulfillmentType === "StockBuild" ? "Stock Build" : "Customer Order"}
            />
            <LabelValue label="Notes" value={notes || "-"} />
            <LabelValue
              label="Costing Status"
              value={costingStatus}
              badge={{
                variant: COSTING_BADGE_VARIANT[costingStatus] || "grey-light",
                text: costingStatus,
              }}
            />
          </div>
        </Card>

        <Card style={{ gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                fontSize: "var(--text-title-2)",
                fontWeight: "var(--font-weight-bold)",
              }}
            >
              {targetType === "Material" ? "Target Material" : "Target Product"}
            </span>
            <span
              style={{
                fontSize: "var(--text-title-3)",
                color: "var(--neutral-on-surface-secondary)",
              }}
            >
              Total Output: {TOTAL_QTY}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            <div
              style={{
                flex: "1 1 260px",
                minWidth: "220px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                padding: "16px",
                borderRadius: "16px",
                border: "1px solid var(--neutral-line-separator-1)",
                background: "var(--neutral-surface-primary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "12px",
                    border: "1px solid var(--neutral-line-separator-1)",
                    background: "var(--neutral-surface-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Box size={24} color="var(--neutral-on-surface-tertiary)" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "16px",
                        lineHeight: "22px",
                        fontWeight: "var(--font-weight-bold)",
                        color: "var(--neutral-on-surface-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product || "Wooden Chair"}
                    </span>
                    {outputs?.length > 1 ? (
                      <StatusBadge variant="blue-light">Main Output</StatusBadge>
                    ) : null}
                  </div>
                  <span
                    style={{
                      fontSize: "var(--text-title-3)",
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    {sku || "CH-WD-23948"}
                  </span>
                </div>
              </div>
              <span
                style={{
                  fontSize: "var(--text-title-1)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--neutral-on-surface-primary)",
                  whiteSpace: "nowrap",
                }}
              >
                {mainQty} unit
              </span>
            </div>

            {(outputs || [])
              .filter((o) => !o.isMain)
              .map((o, idx) => (
                <div
                  key={o.materialId || idx}
                  style={{
                    flex: "1 1 260px",
                    minWidth: "220px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    padding: "16px",
                    borderRadius: "16px",
                    border: "1px solid var(--neutral-line-separator-1)",
                    background: "var(--neutral-surface-primary)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "12px",
                        border: "1px solid var(--neutral-line-separator-1)",
                        background: "var(--neutral-surface-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Box size={24} color="var(--neutral-on-surface-tertiary)" />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: "16px",
                          lineHeight: "22px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--neutral-on-surface-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {o.name}
                      </span>
                      <span
                        style={{
                          fontSize: "var(--text-title-3)",
                          color: "var(--neutral-on-surface-secondary)",
                        }}
                      >
                        {o.sku || "-"}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "var(--text-title-1)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--neutral-on-surface-primary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {o.qty} {o.unit || "unit"}
                  </span>
                </div>
              ))}
          </div>
        </Card>

        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <ChipTabBar
            tabs={[
              { id: "details", label: "Details" },
              ...(fulfillmentType === "StockBuild" ? [{ id: "additional_output", label: "Additional Output" }] : []),
              { id: "cogs", label: "Actual COGS" },
              ...(confirmedStockBuild ? [{ id: "confirm_build", label: "Confirm Build Detail" }] : []),
              { id: "logs", label: "Logs" },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
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
            {woStatus !== "not_started" && !isCancelled ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {hasSubmittedRequest && woStatus !== "completed" ? (
                  <Button
                    variant="tertiary"
                    onClick={() => setIsHistoryModalOpen(true)}
                  >
                    View Request History
                  </Button>
                ) : null}
                {woStatus !== "completed" ? (
                  <Button
                    variant="outlined"
                    leftIcon={AddIcon}
                    onClick={() => openRequestModal(false)}
                  >
                    Material Request
                  </Button>
                ) : null}
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
              const liveTotals = getLiveMaterialRequestTotals(row.sku);
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
                <div style={{ flex: "1" }}>{`${liveTotals.requestedQty} ${row.unit}`}</div>
                <div style={{ flex: "1" }}>{`${liveTotals.receivedQty} ${row.unit}`}</div>
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
                      Work order was automatically updated on {routingUpdates[0].timestamp} to match receipt {routingUpdates[0].poNumber} from {routingUpdates[0].vendorName} for {routingUpdates[0].qty} unit.
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
                            Auto Adjusted to {update.qty} unit
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
                  const stepTotalPool = row.step === 1 ? ROUTING_QTY : 0;
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
                      ? ROUTING_QTY
                      : stagesWithTotals[i - 1].effectiveTotalComp;
                  const start = Math.max(
                    0,
                    stepTotalPool - (row.prog || 0) - (row.totalComp || 0)
                  );

                  const isHybrid = outsourceSteps.includes(row.step);
                  const progressTarget = isHybrid ? internalOut : ROUTING_QTY;

                  const internalRemaining = Math.max(
                    0,
                    progressTarget - (row.comp || 0) - (row.prog || 0)
                  );
                  const internalStart = Math.min(internalRemaining, start);

                  const displayStart = woStatus === "completed" ? 0 : start;
                  const displayProg = woStatus === "completed" ? 0 : (row.prog || 0);
                  const displayComp = woStatus === "completed" ? ROUTING_QTY : (row.effectiveTotalComp || 0);

                  const progress =
                    woStatus === "completed"
                      ? 100
                      : Math.min(
                          100,
                          Math.round(((row.effectiveTotalComp || 0) / ROUTING_QTY) * 100)
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
                                {woStatus !== "cancelled" && (
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
                                disabled={woStatus === "cancelled"}
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
                        ) : canManage && !isCancelled && woStatus !== "completed" ? (
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
                            {isCancelled
                              ? "Cancelled"
                              : woStatus === "completed" || (row.totalComp || 0) >= ROUTING_QTY
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
              {!isCancelled && (
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
              <div style={{ position: "relative", width: "100%" }}>
                <div
                  ref={outsourceStagesListRef}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    width: "100%",
                    maxHeight:
                      !isOutsourceStagesExpanded && outsourceStagesCollapsedHeight != null
                        ? `${outsourceStagesCollapsedHeight}px`
                        : "none",
                    overflow: "hidden",
                  }}
                >
                  {outsourceSteps.map((stepId) => {
                    const st = routingStages.find((s) => s.step === stepId);
                    if (!st) return null;

                    const stepVendorOutput = vendors
                      .filter((v) => !v.assignedSteps || v.assignedSteps.length === 0 || v.assignedSteps.includes(stepId))
                      .reduce((sum, v) => sum + (parseInt(v.output, 10) || 0), 0);

                    return (
                      <div key={stepId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexShrink: 0 }}>
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

                {!isOutsourceStagesExpanded && outsourceStagesCollapsedHeight != null ? (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: "32px",
                      pointerEvents: "none",
                      background: "linear-gradient(to bottom, rgba(255, 255, 255, 0), var(--neutral-surface-primary))",
                    }}
                  />
                ) : null}
              </div>

              {outsourceSteps.length > 4 ? (
                <Button
                  variant="tertiary"
                  size="small"
                  onClick={() => setIsOutsourceStagesExpanded((prev) => !prev)}
                  style={{ alignSelf: "flex-start", padding: 0 }}
                >
                  {isOutsourceStagesExpanded ? "Show less" : `Show all (${outsourceSteps.length} steps)`}
                </Button>
              ) : null}
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
                  <FilterMenu
                    label="All Vendors"
                    multiple
                    options={Array.from(new Set(vendors.map(v => v.name))).map(name => ({ value: name, label: name }))}
                    values={vendorNameFilters}
                    onChangeMultiple={setVendorNameFilters}
                  />
                  <FilterMenu
                    label="All Statuses"
                    multiple
                    searchable={false}
                    options={[
                      { value: "Not Started", label: "Not Started" },
                      { value: "In Progress", label: "In Progress" },
                      { value: "Partially Received", label: "Partially Received" },
                      { value: "Completed", label: "Completed" },
                      { value: "Cancelled", label: "Cancelled" },
                    ]}
                    values={vendorStatusFilters}
                    onChangeMultiple={setVendorStatusFilters}
                  />
                  <FilterMenu
                    label="All POs"
                    multiple
                    options={[
                      { value: "No PO", label: "Without Purchase Order" },
                      ...Array.from(new Set(vendors.map(v => v.poNumber).filter(Boolean))).map(po => ({ value: po, label: po })),
                    ]}
                    values={vendorPoFilters}
                    onChangeMultiple={setVendorPoFilters}
                  />
                  <FilterMenu
                    label="Included Steps"
                    multiple
                    options={outsourceSteps.map((stepId) => {
                      const st = routingStages.find((s) => s.step === stepId);
                      return { value: stepId, label: st ? `Step ${st.step}: ${st.route} - ${st.op}` : `Step ${stepId}` };
                    })}
                    values={includedStepsFilters}
                    onChangeMultiple={setIncludedStepsFilters}
                  />
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
                    const resolvedVendorStatus = isCancelled
                      ? "Cancelled"
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
                    const resolvedVendorStatus = isCancelled
                      ? "Cancelled"
                      : isInternal
                      ? internalStatusInfo.text
                      : resolveVendorProgressStatus(vendor);
                  const isCompleted = resolvedVendorStatus === "Completed";
                  const livePo = vendor.poNumber ? MOCK_PO_TABLE_DATA.find((po) => po.poNumber === vendor.poNumber) : null;
                  const isPoApproved = (livePo ? (livePo.statusKey === "issued" || livePo.statusKey === "completed") : false) || vendor.isPoApproved;
                  const isVendorInProgress =
                    resolvedVendorStatus === "In Progress";
                  const showEditVendorAction =
                    !isCancelled && (isInternal || (!isVendorInProgress && !isPoApproved));
                  const showRemoveVendorAction =
                    !isCancelled &&
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
                      const prevCompleted = minStep === 1 ? ROUTING_QTY : (stagesWithTotals[rowIndex - 1]?.effectiveTotalComp || 0);
                      const currStage = stagesWithTotals[rowIndex];
                      const internalProg = currStage?.prog || 0;
                      const internalCompleted = currStage?.comp || 0;
                      
                      const vendorsConsumed = vendors
                        .filter(v => v.name !== "Internal" && v.assignedSteps?.includes(minStep))
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
                              {!isCancelled && (
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
                              {isCancelled && "-"}
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
                            <span style={{ color: (() => { const pct = Math.min(100, ((vendor.receivedOutput || 0) / (vendor.output || 1)) * 100); if (pct >= 100) return "var(--status-green-primary)"; if (pct >= 75) return "var(--feature-brand-primary)"; if (pct >= 50) return "var(--status-yellow-primary)"; if (pct >= 25) return "var(--status-orange-primary)"; return "var(--status-red-primary)"; })(), fontWeight: "var(--font-weight-bold)", fontSize: "11px" }}>{vendor.receivedOutput || 0} unit</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "center", flex: 1 }}>
                            <span style={{ fontSize: "10px" }}>Remaining</span>
                            <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "var(--font-weight-bold)", fontSize: "11px" }}>{Math.max(0, (vendor.output || 0) - (vendor.receivedOutput || 0))} unit</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end", flex: 1 }}>
                            <span style={{ fontSize: "10px" }}>Assigned</span>
                            <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "var(--font-weight-bold)", fontSize: "11px" }}>{vendor.output || 0} unit</span>
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

        {activeTab === "additional_output" && fulfillmentType === "StockBuild" && (() => {
          const additionalOutputRows = outputs.filter((o) => !o.isMain);
          return (
            <Card style={{ gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>
                  Additional Output
                </span>
                <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>
                  Secondary outputs co-produced by this work order, alongside the main output.
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <style>{`.wo-additional-output-table table td { height: auto; vertical-align: middle; padding-top: 12px; padding-bottom: 12px; }`}</style>
                <div className="wo-additional-output-table">
                  <Table
                    columns={[
                      {
                        key: "image",
                        header: "",
                        width: 64,
                        render: (_v, row) => {
                          const material = MOCK_MATERIALS_DATA.find((m) => m.id === row.materialId);
                          return material?.image ? (
                            <img
                              src={material.image}
                              alt={row.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "8px",
                                objectFit: "cover",
                                border: "1px solid var(--neutral-line-separator-1)",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "var(--neutral-surface-grey-lighter)",
                                border: "1px solid var(--neutral-line-separator-1)",
                              }}
                            >
                              <Box size={18} color="var(--neutral-on-surface-tertiary)" />
                            </div>
                          );
                        },
                      },
                      {
                        key: "name",
                        header: "Item Name",
                        width: 220,
                        render: (_v, row) => <span style={{ fontWeight: "var(--font-weight-bold)" }}>{row.name || "-"}</span>,
                      },
                      {
                        key: "sku",
                        header: "SKU",
                        width: 160,
                        render: (_v, row) => <span style={{ color: "var(--neutral-on-surface-secondary)" }}>{row.sku || "-"}</span>,
                      },
                      {
                        key: "plannedQty",
                        header: "Planned Qty",
                        width: 140,
                        render: (_v, row) => <span>{row.qty ?? "-"} {row.unit || ""}</span>,
                      },
                      {
                        key: "producedQty",
                        header: "Produced Qty",
                        width: 140,
                        render: (_v, row) => {
                          // Not tracked until the Stock Build is confirmed — after
                          // that, the confirmed row's qty is the produced amount.
                          const confirmedRow = confirmedStockBuild?.rows?.find(
                            (r) => r.materialId === row.materialId
                          );
                          return <span>{confirmedRow ? confirmedRow.qty : 0} {row.unit || ""}</span>;
                        },
                      },
                    ]}
                    data={additionalOutputRows}
                    totalRows={additionalOutputRows.length}
                    showPagination={false}
                    className="!h-auto"
                    selectedRowId={null}
                  />
                </div>
              </div>
            </Card>
          );
        })()}

        {activeTab === "cogs" && (() => {
          const linkedBom = actualCogsBomId ? getBom(actualCogsBomId) : null;
          const materialCost = requestHistory.length > 0 ? computeMaterialCost(linkedBom?.materials || []) : 0;

          const outsourcingVendors = (vendors || []).filter((v) => v.name !== "Internal" && v.assignedSteps?.length);
          const hasOutsourcing = outsourceSteps?.length > 0 && outsourcingVendors.length > 0;
          const outsourcingRows = outsourcingVendors.map((v) => {
            const linkedPo = v.poNumber ? MOCK_PO_TABLE_DATA.find((po) => po.poNumber === v.poNumber) : null;
            const matchedLine =
              linkedPo?.lines?.find((l) => l.woRef === initialData?.wo) || linkedPo?.lines?.[0] || null;
            const unitCost = matchedLine?.price || 0;
            const assignedQty = Number(v.output) || 0;
            const normalizedIncludedSteps = Array.from(
              new Set((v.assignedSteps || []).filter((s) => Number.isFinite(s)))
            ).sort((a, b) => a - b);
            const includedSteps = normalizedIncludedSteps
              .map((step) => {
                const matchedStage = (routingStages || []).find((s) => Number(s.step) === step);
                const routingName = matchedStage?.route;
                const operationName = matchedStage?.op || matchedStage?.operation;
                if (routingName && operationName) return `Step ${step}: ${routingName} - ${operationName}`;
                if (routingName || operationName) return `Step ${step}: ${routingName || operationName}`;
                return `Step ${step}`;
              })
              .map((label) => `• ${label}`)
              .join("\n");
            return {
              id: v.id ?? v.assignmentId ?? v.name,
              vendor: v.name,
              assignmentId: v.assignmentId || "-",
              includedSteps: includedSteps || "-",
              poNumber: v.poNumber || "-",
              assignedQty,
              unitCost,
              subtotal: unitCost * assignedQty,
              rawVendor: v,
            };
          });
          const outsourcingTotal = outsourcingRows.reduce((sum, r) => sum + r.subtotal, 0);

          const compositionSegments = [
            { key: "material", label: "Material Cost", amount: materialCost },
            { key: "labour", label: "Labour Cost", amount: fieldTotal(actualCogs.labour) },
            { key: "packing", label: "Packing Cost", amount: fieldTotal(actualCogs.packing) },
            { key: "shipping", label: "Shipping Cost", amount: fieldTotal(actualCogs.shipping) },
            { key: "overhead", label: "Overhead Cost", amount: fieldTotal(actualCogs.overhead) },
            { key: "other", label: "Other Cost", amount: fieldTotal(actualCogs.other) },
            ...(hasOutsourcing ? [{ key: "outsourcing", label: "Outsourcing Cost", amount: outsourcingTotal }] : []),
          ];
          const totalActualCogs = compositionSegments.reduce((sum, s) => sum + s.amount, 0);
          const totalForecastedCogs = computeTotalCogs(linkedBom);
          const forecastedPerUnit = TOTAL_QTY > 0 ? totalForecastedCogs / TOTAL_QTY : 0;
          const actualPerUnit = TOTAL_QTY > 0 ? totalActualCogs / TOTAL_QTY : 0;

          const editableCostTable = ({ key, title, icon: Icon, description }) => {
            const field = actualCogs[key];
            const lines = field?.lines || [];
            const total = fieldTotal(field);
            const forecastTotal = fieldTotal(linkedBom?.cogs?.[key]);
            const perUnit = TOTAL_QTY > 0 ? total / TOTAL_QTY : 0;
            const forecastPerUnit = TOTAL_QTY > 0 ? forecastTotal / TOTAL_QTY : 0;
            const isBreakdownVisible = !!showActualCostFieldBreakdown[key];
            const atMaxCostItems = lines.length >= 10;
            return (
              <React.Fragment key={key}>
                <div style={{ borderTop: "1px solid var(--neutral-line-separator-2)" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {Icon ? <Icon size={16} color="var(--neutral-on-surface-secondary)" style={{ marginTop: "2px" }} /> : null}
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>{title}</span>
                        {description ? (
                          <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)" }}>{description}</span>
                        ) : null}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                      <span style={{ fontWeight: "bold", fontSize: "16px", color: "var(--neutral-on-surface-primary)" }}>
                        {formatIDR(total)}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <ActualVsForecastBadge actual={total} forecast={forecastTotal} />
                        <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)" }}>
                          {formatIDR(perUnit)} / unit
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Button
                      variant="tertiary"
                      size="small"
                      rightIcon={isBreakdownVisible ? ChevronDownIcon : ChevronRightIcon}
                      onClick={() => toggleActualCostFieldBreakdown(key)}
                      style={{ alignSelf: "flex-start", padding: 0 }}
                    >
                      {isBreakdownVisible ? "Hide Cost Breakdown" : "See Cost Breakdown"}
                    </Button>

                    {isBreakdownVisible ? (
                      <>
                        <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
                          <div style={detailTableHeaderRowStyle(ACTUAL_COST_TABLE_GRID_COLUMNS)}>
                            <span>Cost Item</span>
                            <span>Forecasted Cost per Unit</span>
                            <span>Total Cost per Unit</span>
                            <span>Total Cost This WO</span>
                            <span style={{ textAlign: "right" }}>Actions</span>
                          </div>
                          {lines.length ? (
                            lines.map((line, idx) => (
                              <div key={line.id || idx} style={detailTableRowStyle(ACTUAL_COST_TABLE_GRID_COLUMNS, idx === lines.length - 1)}>
                                <span style={{ fontSize: "var(--text-title-3)" }}>{line.label || "-"}</span>
                                <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                                  {line.noForecast ? "-" : formatIDR(Math.round(forecastPerUnit))}
                                </span>
                                <span style={{ fontSize: "var(--text-title-3)" }}>
                                  {formatIDR(TOTAL_QTY > 0 ? Math.round((Number(line.amount) || 0) / TOTAL_QTY) : 0)}
                                </span>
                                <span style={{ fontSize: "var(--text-title-3)" }}>{formatIDR(line.amount)}</span>
                                <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                                  {costingStatus !== "Confirmed" ? (
                                    <>
                                      <Tooltip content="Edit Cost Item">
                                        <IconButton
                                          icon={EditIcon}
                                          size="small"
                                          color="var(--feature-brand-primary)"
                                          onClick={() => openEditCostItemModal(key, idx)}
                                        />
                                      </Tooltip>
                                      <Tooltip content="Delete Cost Item">
                                        <IconButton
                                          icon={DeleteIcon}
                                          size="small"
                                          color="var(--status-red-primary)"
                                          hoverBackground="#FAE6E8"
                                          onClick={() => openDeleteCostItemModal(key, idx)}
                                        />
                                      </Tooltip>
                                    </>
                                  ) : null}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div
                              style={{
                                padding: "24px",
                                textAlign: "center",
                                color: "var(--neutral-on-surface-tertiary)",
                                fontSize: "var(--text-title-3)",
                                background: "var(--neutral-surface-primary)",
                                border: "1.5px dashed var(--neutral-line-separator-1)",
                                borderRadius: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minHeight: "80px",
                              }}
                            >
                              No cost items added yet.
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                          {costingStatus !== "Confirmed" ? (
                          <Button
                            variant="outlined"
                            size="small"
                            leftIcon={AddIcon}
                            onClick={() => openAddCostItemModal(key)}
                            disabled={atMaxCostItems}
                            style={{ alignSelf: "flex-start" }}
                          >
                            Add Cost Item
                          </Button>
                          ) : null}
                          {atMaxCostItems ? (
                            <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Maximum 10 items</span>
                          ) : null}
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </React.Fragment>
            );
          };

          return (
            <DetailCard title="Actual Cost of Goods Sold">
              <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)", marginTop: "-12px" }}>
                Linked Bill of Materials:{" "}
                <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                  {initialData?.product || "Wooden Chair"} Classic Model BOM
                </span>
              </span>
              {costingStatus === "Confirmed" ? (
                <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)", marginTop: "-12px" }}>
                  Costing has been confirmed. Cost items are read-only.
                </span>
              ) : null}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid var(--neutral-line-separator-1)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>
                    Cost Composition
                  </span>
                  <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)" }}>
                    {formatIDR(totalActualCogs)} total
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    height: "8px",
                    borderRadius: "var(--radius-full)",
                    overflow: "hidden",
                    background: "var(--neutral-surface-grey-lighter)",
                  }}
                >
                  {compositionSegments.map(({ key, amount }) => {
                    const pct = totalActualCogs > 0 ? (amount / totalActualCogs) * 100 : 0;
                    return pct > 0 ? (
                      <div key={key} style={{ width: `${pct}%`, background: ACTUAL_COST_COMPOSITION_COLORS[key] }} />
                    ) : null;
                  })}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                  {compositionSegments.map(({ key, label, amount }) => {
                    const pct = totalActualCogs > 0 ? Math.round((amount / totalActualCogs) * 100) : 0;
                    return (
                      <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: ACTUAL_COST_COMPOSITION_COLORS[key],
                            display: "inline-block",
                          }}
                        />
                        <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)" }}>
                          {label} · {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                  padding: "16px",
                  borderRadius: "12px",
                  background: "var(--neutral-surface-primary)",
                  border: "1px solid var(--neutral-line-separator-1)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)" }}>Forecasted COGS (BOM)</span>
                  <span style={{ fontSize: "16px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>
                    {formatIDR(forecastedPerUnit)} / unit{" "}
                    <span style={{ fontSize: "12px", fontWeight: "normal", color: "var(--neutral-on-surface-secondary)" }}>
                      ({formatIDR(totalForecastedCogs)} for {TOTAL_QTY} unit)
                    </span>
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)" }}>Actual COGS (current)</span>
                  <span style={{ fontSize: "16px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>
                    {formatIDR(actualPerUnit)} / unit{" "}
                    <span style={{ fontSize: "12px", fontWeight: "normal", color: "var(--neutral-on-surface-secondary)" }}>
                      ({formatIDR(totalActualCogs)} for {TOTAL_QTY} unit)
                    </span>
                  </span>
                </div>
                <ActualVsForecastBadge
                  actual={totalActualCogs}
                  forecast={totalForecastedCogs}
                  style={{ fontSize: "13px", padding: "6px 14px" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Box size={16} color="var(--neutral-on-surface-secondary)" />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>
                        Material Cost
                        <StatusBadge variant="grey-light">Auto-calculated</StatusBadge>
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)" }}>
                        Sum of BOM qty × avg stock cost per material
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    <span style={{ fontWeight: "bold", fontSize: "16px", color: "var(--neutral-on-surface-primary)" }}>
                      {formatIDR(materialCost)}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ActualVsForecastBadge actual={materialCost} forecast={computeMaterialCost(linkedBom?.materials || [])} />
                      <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)" }}>
                        {formatIDR(TOTAL_QTY > 0 ? materialCost / TOTAL_QTY : 0)} / unit
                      </span>
                    </div>
                  </div>
                </div>

                {linkedBom?.materials?.length && requestHistory.length > 0 ? (
                  <div style={{ paddingLeft: "24px" }}>
                    <Button
                      variant="tertiary"
                      size="small"
                      rightIcon={showActualMaterialBreakdown ? ChevronDownIcon : ChevronRightIcon}
                      onClick={() => setShowActualMaterialBreakdown((v) => !v)}
                      style={{ alignSelf: "flex-start", padding: 0 }}
                    >
                      {showActualMaterialBreakdown ? "Hide Cost Breakdown" : "See Cost Breakdown"}
                    </Button>
                  </div>
                ) : (
                  <div style={{ paddingLeft: "32px" }}>
                    <div
                      style={{
                        padding: "24px",
                        textAlign: "center",
                        color: "var(--neutral-on-surface-tertiary)",
                        fontSize: "var(--text-title-3)",
                        background: "var(--neutral-surface-primary)",
                        border: "1.5px dashed var(--neutral-line-separator-1)",
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "80px",
                      }}
                    >
                      No cost items added yet.
                    </div>
                  </div>
                )}

                {showActualMaterialBreakdown && linkedBom?.materials?.length && requestHistory.length > 0 ? (
                  <div style={{ paddingLeft: "32px" }}>
                    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
                      <div style={detailTableHeaderRowStyle(MATERIAL_ACTUAL_COST_GRID_COLUMNS)}>
                        <span>Material</span>
                        <span>Type</span>
                        <span>Quantity Used</span>
                        <span>Forecasted Cost per Unit</span>
                        <span>Total Cost per Unit</span>
                        <span style={{ textAlign: "right" }}>Total Cost This WO</span>
                      </div>
                      {linkedBom.materials.map((line, idx) => {
                        const option = resolveMaterialOption(line.materialId);
                        const unitPrice = option?.averageCost || 0;
                        const qty = getLiveMaterialRequestTotals(line.sku).receivedQty;
                        const rowTotal = unitPrice * qty;
                        const perUnit = TOTAL_QTY > 0 ? rowTotal / TOTAL_QTY : 0;
                        const batches = getStockBatchesForSku(line.sku) || [];
                        const batchNo = batches[0]?.batch || `BATCH-${line.materialId}`;
                        const isExpanded = !!expandedActualCostMaterials[line.materialId];
                        const isLast = idx === linkedBom.materials.length - 1;
                        return (
                          <React.Fragment key={line.materialId || idx}>
                            <div style={detailTableRowStyle(MATERIAL_ACTUAL_COST_GRID_COLUMNS, isLast && !isExpanded)}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <div
                                  style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                                  onClick={() => toggleActualCostMaterial(line.materialId)}
                                >
                                  {isExpanded ? (
                                    <ChevronDownIcon size={14} color="var(--neutral-on-surface-secondary)" />
                                  ) : (
                                    <ChevronRightIcon size={14} color="var(--neutral-on-surface-secondary)" />
                                  )}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                  <span style={{ fontSize: "var(--text-title-3)" }}>{line.name}</span>
                                  <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)" }}>{line.sku}</span>
                                </div>
                              </div>
                              <span style={{ fontSize: "var(--text-title-3)" }}>BOM</span>
                              <span style={{ fontSize: "var(--text-title-3)" }}>
                                {qty} {line.unit || ""}
                              </span>
                              <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                                {formatIDR(perUnit)}
                              </span>
                              <span style={{ fontSize: "var(--text-title-3)" }}>{formatIDR(perUnit)}</span>
                              <span style={{ fontSize: "var(--text-title-3)", textAlign: "right" }}>{formatIDR(rowTotal)}</span>
                            </div>
                            {isExpanded ? (
                              <div
                                style={{
                                  ...detailTableRowStyle(MATERIAL_ACTUAL_COST_GRID_COLUMNS, isLast),
                                  background: "var(--neutral-surface-grey-lighter)",
                                }}
                              >
                                <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)", paddingLeft: "22px" }}>
                                  {batchNo}
                                </span>
                                <span />
                                <span style={{ fontSize: "var(--text-title-3)" }}>
                                  {qty} {line.unit || ""}
                                </span>
                                <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                                  -
                                </span>
                                <span style={{ fontSize: "var(--text-title-3)" }}>{formatIDR(perUnit)}</span>
                                <span style={{ fontSize: "var(--text-title-3)", textAlign: "right" }}>{formatIDR(rowTotal)}</span>
                              </div>
                            ) : null}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

              {ACTUAL_COGS_FIELDS.map(editableCostTable)}

              {hasOutsourcing ? (
                <React.Fragment>
                  <div style={{ borderTop: "1px solid var(--neutral-line-separator-2)" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Truck size={16} color="var(--neutral-on-surface-secondary)" style={{ marginTop: "2px" }} />
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>Outsourcing Cost</span>
                          <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)" }}>
                            Cost of routing steps outsourced to external vendors
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                        <span style={{ fontWeight: "bold", fontSize: "16px", color: "var(--neutral-on-surface-primary)" }}>
                          {formatIDR(outsourcingTotal)}
                        </span>
                        <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)" }}>
                          {formatIDR(TOTAL_QTY > 0 ? outsourcingTotal / TOTAL_QTY : 0)} / unit
                        </span>
                      </div>
                    </div>

                    <div style={{ paddingLeft: "24px" }}>
                      <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
                        <div style={detailTableHeaderRowStyle(OUTSOURCING_COST_GRID_COLUMNS)}>
                          <span>Vendor</span>
                          <span>Assignment ID</span>
                          <span>Included Step</span>
                          <span>Purchase Order</span>
                          <span>Assigned Qty</span>
                          <span>Unit Cost</span>
                          <span style={{ textAlign: "right" }}>Subtotal</span>
                        </div>
                        {outsourcingRows.map((row, idx) => (
                          <div key={row.id} style={detailTableRowStyle(OUTSOURCING_COST_GRID_COLUMNS, idx === outsourcingRows.length - 1)}>
                            <span style={{ fontSize: "var(--text-title-3)" }}>{row.vendor}</span>
                            <span style={{ fontSize: "var(--text-title-3)" }}>{row.assignmentId}</span>
                            <div style={{ padding: "12px 0" }}>
                              <ClampedDescriptionText text={row.includedSteps} />
                            </div>
                            {row.poNumber !== "-" ? (
                              <span
                                onClick={() => {
                                  scrollToTop();
                                  onNavigate("po_detail", {
                                    ...buildDummyPoDetailData(row.poNumber, row.rawVendor),
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
                                  fontSize: "var(--text-title-3)",
                                  color: "var(--feature-brand-primary)",
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                }}
                              >
                                {row.poNumber}
                              </span>
                            ) : (
                              <span style={{ fontSize: "var(--text-title-3)" }}>{row.poNumber}</span>
                            )}
                            <span style={{ fontSize: "var(--text-title-3)" }}>{row.assignedQty}</span>
                            <span style={{ fontSize: "var(--text-title-3)" }}>{formatIDR(row.unitCost)}</span>
                            <span style={{ fontSize: "var(--text-title-3)", textAlign: "right" }}>{formatIDR(row.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ) : null}

              <div style={{ borderTop: "1px solid var(--neutral-line-separator-1)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "var(--text-title-1)",
                    fontWeight: "var(--font-weight-black)",
                  }}
                >
                  <span>Total Actual COGS</span>
                  <span>{formatIDR(totalActualCogs)}</span>
                </div>
                <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)", textAlign: "right" }}>
                  {formatIDR(actualPerUnit)} / unit
                </span>
              </div>
            </DetailCard>
          );
        })()}

        {activeTab === "confirm_build" && confirmedStockBuild && (
          <Card style={{ gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>
                Confirm Build Detail
              </span>
              <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>
                Details of each output produced by this work order, and how much of the actual COGS was allocated to it.
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <style>{`.confirmed-build-table table td { height: auto; vertical-align: middle; padding-top: 12px; padding-bottom: 12px; }`}</style>
              <div className="confirmed-build-table">
                <Table
                  columns={[
                    {
                      key: "material",
                      header: "Material",
                      width: 200,
                      render: (_v, row) => {
                        const material = MOCK_MATERIALS_DATA.find((m) => m.id === row.materialId);
                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontWeight: "var(--font-weight-bold)" }}>{row.name}</span>
                            <span
                              style={{
                                fontSize: "var(--text-body)",
                                color: "var(--feature-brand-primary)",
                                cursor: "pointer",
                                textDecoration: "underline",
                              }}
                              onClick={() => {
                                // Use the freshly-synced record (kept in step with local
                                // state by the effect above) rather than the stale
                                // `initialData` prop, so returning here shows the current
                                // status/outputs instead of resetting to how the page
                                // looked when it first mounted.
                                const currentWoRecord =
                                  MOCK_WO_TABLE_DATA.find((w) => w.wo === initialData?.wo) || initialData;
                                onNavigate("material_detail", {
                                  ...(material || { id: row.materialId, sku: row.sku, name: row.name }),
                                  returnTo: { view: "work_order_detail", data: currentWoRecord },
                                });
                              }}
                            >
                              {row.sku}
                            </span>
                          </div>
                        );
                      },
                    },
                    {
                      key: "qty",
                      header: "Produced Qty",
                      width: 100,
                      render: (_v, row) => <span>{row.qty} {row.unit}</span>,
                    },
                    {
                      key: "percentage",
                      header: "Cost Share %",
                      width: 100,
                      render: (_v, row) => <span>{row.percentage}%</span>,
                    },
                    {
                      key: "allocatedCost",
                      header: "Allocated Cost",
                      width: 160,
                      render: (_v, row) => <span>{formatIDR(Number(row.allocatedCost) || 0)}</span>,
                    },
                    {
                      key: "unitCost",
                      header: "Recognised Unit Cost",
                      width: 160,
                      render: (_v, row) => <span>{formatIDR(Number(row.unitCost) || 0)}</span>,
                    },
                    {
                      key: "storageLocation",
                      header: "Storage Location",
                      width: 160,
                      render: (_v, row) => <span>{row.storageLocation || "-"}</span>,
                    },
                    {
                      key: "expiryDate",
                      header: "Expiry Date",
                      width: 140,
                      render: (_v, row) => <span>{row.expiryDate || "-"}</span>,
                    },
                  ]}
                  data={confirmedStockBuild.rows}
                  totalRows={confirmedStockBuild.rows.length}
                  showPagination={false}
                  className="!h-auto"
                  selectedRowId={null}
                />
              </div>
            </div>

            {confirmedStockBuild.notes ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>Notes</span>
                <span style={{ fontSize: "var(--text-title-3)" }}>{confirmedStockBuild.notes}</span>
              </div>
            ) : null}
          </Card>
        )}

        {activeTab === "logs" && (() => {
          const renderLogCard = (title, logs) => (
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
                  {title}
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

                  {logs.length ? (
                    logs.map((log, idx, arr) => (
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
                    ))
                  ) : (
                    <div
                      style={{
                        padding: "24px 0",
                        textAlign: "center",
                        color: "var(--neutral-on-surface-tertiary)",
                        fontSize: "var(--text-title-3)",
                      }}
                    >
                      No entries yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {renderLogCard("Activity Log", activityLogs)}
              {renderLogCard("Costing Log", costingLogs)}
            </div>
          );
        })()}
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

      {canCompleteWorkOrder || (woStatus === "completed" && costingStatus === "Ready to Finalize") ? (
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
            gap: "12px",
            zIndex: 100,
          }}
        >
          {woStatus === "completed" && costingStatus === "Ready to Finalize" ? (
            <Button
              variant="filled"
              size="medium"
              onClick={() => setIsConfirmCostingModalOpen(true)}
            >
              Confirm Costing
            </Button>
          ) : null}
          {canCompleteWorkOrder ? (
            <Button
              variant="filled"
              size="medium"
              onClick={openCompleteModal}
            >
              {fulfillmentType === "StockBuild" ? "Confirm Stock Build" : "Complete"}
            </Button>
          ) : null}
        </div>
      ) : null}

      {isStockBuildFormModalOpen ? (
      <div style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.28)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 13000,
      }}>
        <div style={{ position: "absolute", inset: 0 }} onClick={() => setIsStockBuildFormModalOpen(false)} />
        <div style={{
          position: "relative",
          width: "1200px",
          maxWidth: "calc(100vw - 24px)",
          height: "100vh",
          background: "var(--neutral-surface-primary)",
          boxShadow: "-12px 0 32px rgba(0, 0, 0, 0.08)",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Drawer Header */}
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--neutral-surface-primary)"
          }}>
            <h2 style={{
              margin: 0,
              fontSize: "var(--text-title-1)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)"
            }}>
              Confirm stock build?
            </h2>
            <IconButton
              icon={CloseIcon}
              onClick={() => setIsStockBuildFormModalOpen(false)}
              size="small"
              color="var(--neutral-on-surface-primary)"
            />
          </div>

          {/* Drawer Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>
            The actual output quantity and production cost will be used to update your inventory. Make sure the information is correct before continuing.
          </span>

          <Card style={{ padding: "16px", boxShadow: "none", border: "1px solid var(--neutral-line-separator-1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
                Total Actual COGS
              </span>
              <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)" }}>
                {formatIDR(totalActualCogsForModal)}
              </span>
            </div>
          </Card>

          {outputCostPercentageOver ? (
            <span style={{ fontSize: "12px", color: "var(--status-red-primary)" }}>
              Total cost share % exceeds 100%
            </span>
          ) : null}
          {outputCostPercentageUnder ? (
            <span style={{ fontSize: "12px", color: "var(--status-red-primary)" }}>
              Total cost share % below 100%
            </span>
          ) : null}

          <div style={{ overflowX: "auto" }}>
            <style>{`
              .stock-build-cost-table table td { height: auto; vertical-align: middle; padding-top: 12px; padding-bottom: 12px; }
            `}</style>
            <div className="stock-build-cost-table">
              <Table
                columns={[
                  {
                    key: "material",
                    header: "Material",
                    width: 200,
                    render: (_v, row) => (
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontWeight: "var(--font-weight-bold)" }}>{row.name}</span>
                        <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
                          {row.sku}
                        </span>
                      </div>
                    ),
                  },
                  {
                    key: "qty",
                    header: "Produced Qty",
                    width: 100,
                    render: (_v, row) => (
                      <span>
                        {row.qty} {row.unit}
                      </span>
                    ),
                  },
                  {
                    key: "percentage",
                    header: "Cost Share %",
                    width: 110,
                    render: (_v, row) => {
                      const rowErrors = getOutputCostRowErrors(row);
                      return (
                        <div>
                          <InputField
                            type="number"
                            value={row.percentage}
                            onChange={(e) => updateOutputCostRow(row.materialId, "percentage", e.target.value)}
                            suffix="%"
                            errorState={!!rowErrors.percentage || outputCostPercentageMismatch}
                          />
                          {rowErrors.percentage ? (
                            <span style={{ fontSize: "11px", color: "var(--status-red-primary)" }}>{rowErrors.percentage}</span>
                          ) : null}
                        </div>
                      );
                    },
                  },
                  {
                    key: "allocatedCost",
                    header: "Allocated Cost",
                    width: 160,
                    render: (_v, row) => (
                      <span style={Number(row.allocatedCost) <= 0 ? { color: "var(--status-red-primary)" } : undefined}>
                        {formatIDR(Number(row.allocatedCost) || 0)}
                      </span>
                    ),
                  },
                  {
                    key: "unitCost",
                    header: "Recognised Unit Cost",
                    width: 160,
                    render: (_v, row) => {
                      const rowErrors = getOutputCostRowErrors(row);
                      return (
                        <div>
                          <InputField
                            type="number"
                            value={row.unitCost}
                            onChange={(e) => updateOutputCostRow(row.materialId, "unitCost", e.target.value)}
                            prefix="IDR"
                            errorState={!!rowErrors.unitCost}
                          />
                          {rowErrors.unitCost ? (
                            <span style={{ fontSize: "11px", color: "var(--status-red-primary)" }}>{rowErrors.unitCost}</span>
                          ) : null}
                        </div>
                      );
                    },
                  },
                  {
                    key: "averageCost",
                    header: "Current Avg. Cost",
                    width: 140,
                    render: (_v, row) => (
                      <span>{row.averageCost != null ? formatIDR(row.averageCost) : "-"}</span>
                    ),
                  },
                  {
                    key: "storageLocation",
                    header: "Storage Location",
                    width: 160,
                    render: (_v, row) => (
                      <InputField
                        value={row.storageLocation}
                        onChange={(e) => updateOutputCostRow(row.materialId, "storageLocation", e.target.value)}
                        placeholder="Enter storage location (optional)"
                      />
                    ),
                  },
                  {
                    key: "expiryDate",
                    header: "Expiry Date",
                    width: 160,
                    render: (_v, row) => (
                      <InputField
                        type="date"
                        value={row.expiryDate}
                        onChange={(e) => updateOutputCostRow(row.materialId, "expiryDate", e.target.value)}
                      />
                    ),
                  },
                ]}
                data={outputCostRows}
                totalRows={outputCostRows.length}
                showPagination={false}
                className="!h-auto"
                selectedRowId={null}
              />
            </div>
          </div>
          </div>

          {/* Drawer Footer */}
          <div style={{
            padding: "20px 24px",
            borderTop: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            background: "var(--neutral-surface-primary)"
          }}>
            <Button variant="outlined" size="large" onClick={() => setIsStockBuildFormModalOpen(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button variant="filled" size="large" onClick={handleStockBuildFormConfirm} style={{ flex: 1 }}>
              Confirm
            </Button>
          </div>
        </div>
      </div>
      ) : null}

      <GeneralModal
        isOpen={isFinalCompleteModalOpen}
        onClose={() => setIsFinalCompleteModalOpen(false)}
        title="Complete Work Order?"
        description={
          hasNoRecordedMaterialUsage
            ? "This work order has no recorded material usage. Do you want to proceed with completion?"
            : "This action can't be undone. Actual COGS will be calculated from received materials."
        }
        footer={
          <>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setIsFinalCompleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={handleFinalComplete}
            >
              Complete
            </Button>
          </>
        }
      />

      <GeneralModal
        isOpen={isConfirmCostingModalOpen}
        onClose={() => setIsConfirmCostingModalOpen(false)}
        title="Confirm Costing?"
        description="This action can't be undone. Actual COGS will become read-only once costing is confirmed."
        footer={
          <>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setIsConfirmCostingModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={handleConfirmCosting}
            >
              Confirm
            </Button>
          </>
        }
      />

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
                                    {vendor.output || 0} unit
                                  </div>
                                  <div style={poReferenceTableCellStyle()}>
                                    {vendor.receivedOutput || 0} unit
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
                                    const prevSteps = prev.assignedSteps || [];
                                    const newSteps = prevSteps.includes(step)
                                      ? prevSteps.filter((s) => s !== step)
                                      : [...prevSteps, step];
                                    return { ...prev, assignedSteps: newSteps };
                                  });
                                  setAssignedStepsError("");
                                }}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  disabled={isDisabled}
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
                          
                    const availableQty = Math.max(0, ROUTING_QTY - maxAssignedInConsideredSteps);
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
                              ? `Available: ${availableQty} unit`
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
                          suffix="unit"
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
                              ? `Exceeds available quantity (${availableQty} unit).`
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
                        clearable
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
                      {singleVendorForm.output} unit
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
                  suffix="unit"
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
                  unit
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
                      value={`${selectedSendVendor.sentOutput || 0} / ${selectedSendVendor.output || 0} unit`} 
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
                suffix="unit"
                headerRight={
                  <StatusBadge variant="blue-light">
                    Available: {selectedSendVendor ? computeReadyToSend(selectedSendVendor) : 0} unit
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
                    value={`${receiptHistoryVendor.receivedOutput || 0} / ${receiptHistoryVendor.output || 0} unit`} 
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
                        {assignmentLogTab === "send"
                          ? r.releaseId || "-"
                          : r.receiptId || r.receiptNumber || `RCPT-${String(i + 1).padStart(4, "0")}`}
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          fontWeight: "var(--font-weight-bold)",
                        })}
                      >
                        {r.amount} unit
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
                          <Tooltip content="Export to PDF" position="top">
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
                                    woRef: initialData?.wo || "-",
                                    outsourceSteps: receiptHistoryVendor.assignedSteps || [],
                                    amount: r.amount,
                                    note: r.note || r.notes || "",
                                    item: `Outsourced - ${initialData?.product || "Cabinet Premium"}`,
                                    itemCode: initialData?.sku || "-",
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

      {costItemModal ? (() => {
        const modalLinkedBom = actualCogsBomId ? getBom(actualCogsBomId) : null;
        const modalForecastTotal = fieldTotal(modalLinkedBom?.cogs?.[costItemModal.key]);
        const modalForecastPerUnit = TOTAL_QTY > 0 ? modalForecastTotal / TOTAL_QTY : 0;
        return (
        <GeneralModal
          isOpen={!!costItemModal}
          width="480px"
          title={costItemModal.idx == null ? "Add Cost Item" : "Edit Cost Item"}
          onClose={closeCostItemModal}
          footer={
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
              <Button
                variant="filled"
                size="large"
                style={{ width: "100%" }}
                onClick={saveCostItemModal}
              >
                {costItemModal.idx == null ? "Add Item" : "Save Changes"}
              </Button>
              <Button variant="outlined" size="large" style={{ width: "100%" }} onClick={closeCostItemModal}>
                Cancel
              </Button>
            </div>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "16px 0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-medium)", color: "var(--neutral-on-surface-primary)" }}>
                <span style={{ color: "var(--status-red-primary)" }}>*</span> Cost Item Name
              </label>
              <InputField
                placeholder="e.g. Overtime labour"
                value={costItemModal.label}
                onChange={(e) => setCostItemModal((prev) => ({ ...prev, label: e.target.value }))}
                errorState={costItemModalErrors.label}
              />
              {costItemModalErrors.label ? (
                <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>Field cannot be empty</span>
              ) : null}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-body)", fontWeight: "var(--font-weight-medium)", color: "var(--neutral-on-surface-primary)" }}>
                Forecasted Cost per Unit
                <Tooltip content="The estimated cost per finished unit from the Bill of Materials">
                  <Info size={14} color="var(--neutral-on-surface-secondary)" />
                </Tooltip>
              </label>
              {costItemModal.idx == null ? (
                <InputField type="text" value="-" disabled />
              ) : (
                <InputField type="number" prefix="IDR" value={Math.round(modalForecastPerUnit)} disabled />
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-body)", fontWeight: "var(--font-weight-medium)", color: "var(--neutral-on-surface-primary)" }}>
                <span style={{ color: "var(--status-red-primary)" }}>*</span> Total Cost per Unit
                <Tooltip content="The actual cost allocated to produce one finished unit in this Work Order">
                  <Info size={14} color="var(--neutral-on-surface-secondary)" />
                </Tooltip>
              </label>
              <InputField
                type="number"
                prefix="IDR"
                value={TOTAL_QTY > 0 ? Math.round((Number(costItemModal.amount) || 0) / TOTAL_QTY) : 0}
                onChange={(e) =>
                  setCostItemModal((prev) => ({ ...prev, amount: (Number(e.target.value) || 0) * TOTAL_QTY }))
                }
                errorState={costItemModalErrors.amount}
              />
              {costItemModalErrors.amount ? (
                <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>Field cannot be empty</span>
              ) : null}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-body)", fontWeight: "var(--font-weight-medium)", color: "var(--neutral-on-surface-primary)" }}>
                <span style={{ color: "var(--status-red-primary)" }}>*</span> Total Cost This WO
                <Tooltip content="The total actual cost for this cost item in this Work Order">
                  <Info size={14} color="var(--neutral-on-surface-secondary)" />
                </Tooltip>
              </label>
              <InputField
                type="number"
                prefix="IDR"
                value={costItemModal.amount}
                onChange={(e) => setCostItemModal((prev) => ({ ...prev, amount: e.target.value }))}
                errorState={costItemModalErrors.amount}
              />
              {costItemModalErrors.amount ? (
                <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>Field cannot be empty</span>
              ) : null}
            </div>
          </div>
        </GeneralModal>
        );
      })() : null}

      <GeneralModal
        isOpen={!!deleteCostItemModal}
        onClose={closeDeleteCostItemModal}
        title="Delete Cost Item"
        width="440px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button variant="outlined" size="large" style={{ flex: 1 }} onClick={closeDeleteCostItemModal}>
              Back
            </Button>
            <Button variant="filled" size="large" style={{ flex: 1 }} onClick={confirmDeleteCostItem}>
              Submit
            </Button>
          </div>
        }
      >
        <TextField
          label="Reason"
          required
          multiline
          rows={4}
          maxLength={400}
          showCount
          value={deleteCostItemReason}
          onChange={(e) => {
            setDeleteCostItemReason(e.target.value);
            if (deleteCostItemError) setDeleteCostItemError("");
          }}
          placeholder="Add a reason for deleting this cost item."
          errorText={deleteCostItemError}
          state={deleteCostItemError ? "error" : undefined}
        />
      </GeneralModal>

      <WorkOrderEditDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        workOrder={{
          wo: initialData?.wo,
          ord: initialData?.ord,
          targetType,
          fulfillmentType,
          statusKey: woStatus,
          orderType,
          priority,
          notes,
          start: displayStartDate,
          end: displayEndDate,
          outputs,
          // What's already in progress + completed at the very first routing
          // stage — i.e. everything that has already left the "yet to start"
          // pool, regardless of which downstream stage it's currently at.
          // Total Output can't be edited below this.
          processedQty: (stagesWithTotals[0]?.prog || 0) + (stagesWithTotals[0]?.totalComp || 0),
          processedUnit: outputs.find((o) => o.isMain)?.unit || "unit",
        }}
        onSave={(changes) => {
          setOrderType(changes.orderType);
          setPriority(changes.priority);
          setNotes(changes.notes);
          setDisplayStartDate(changes.start);
          setDisplayEndDate(changes.end);
          // Customer-order work orders don't expose the Main/Additional
          // Output fields, so those keys are omitted — leave the existing
          // product/SKU/qty/outputs untouched rather than clearing them.
          if (changes.outputs) {
            setProduct(changes.product);
            setSku(changes.sku);
            setMainQty(changes.qty);
            setOutputs(changes.outputs);
          }
        }}
      />
    </div>
  );
};
