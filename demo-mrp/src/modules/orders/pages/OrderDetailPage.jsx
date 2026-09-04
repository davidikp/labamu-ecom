import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { 
  ChevronLeftIcon, EditIcon, Box, ChevronDownIcon, ChevronUpIcon, 
  UploadIcon, DownloadIcon, Trash2, MoreVerticalIcon, FileIcon, 
  ImageAssetIcon, ListViewIcon, GridViewIcon, SearchIcon, CloseIcon,
  Pencil, DeleteIcon, CloudUploadIcon, Info, TrendingUp, ChevronRightIcon,
  AddIcon
} from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { Checkbox } from "../../../components/common/Checkbox.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { UploadDropzone } from "../../../components/molecules/UploadDropzone.jsx";
import { DocumentTypeBadge } from "../../../modules/purchase-order/components/DocumentTypeBadge.jsx";
import { 
  FILE_DESCRIPTION_MAX_LENGTH, 
  MAX_PROOF_UPLOAD_FILES 
} from "../../../constants/appConstants.js";
import { 
  validateUploadFile,
  createUploadDocumentRecord 
} from "../../../utils/upload/uploadUtils.js";
import { MOCK_WO_TABLE_DATA } from "../../work-order/mock/workOrderMocks.js";
import { MOCK_ORDER_TABLE_DATA, MOCK_ORDER_MATERIALS_DATA, MOCK_ORDER_PRODUCTS_DATA } from "../mock/orderMocks.js";
import { MOCK_PO_TABLE_DATA } from "../../../modules/purchase-order/mock/purchaseOrderMocks.js";
import { TraceabilityTab } from "../components/TraceabilityTab.jsx";
import { DateInputControl } from "../../../modules/purchase-order/components/detail/shared/PoDetailSharedComponents.jsx";


// Mock Data for Attachments (Updated to match PO screenshot)
const MOCK_ATTACHMENTS_DATA = [
  { id: 1, name: "invoice-march-2026.pdf", documentType: "invoice", uploadedBy: "Joko", date: "Mar 20, 2026", size: "2.4 MB", type: "pdf", meta: "Uploaded by Joko on Mar 20, 2026" },
  { id: 2, name: "delivery-note-batch-14.pdf", documentType: "delivery_note", uploadedBy: "Natasha Smith", date: "Mar 20, 2026", size: "1.1 MB", type: "pdf", meta: "Uploaded by Natasha Smith on Mar 20, 2026" },
  { id: 3, name: "vendor-quotation.pdf", documentType: "quotation_vendor", uploadedBy: "Joko", date: "Mar 19, 2026", size: "860 KB", type: "pdf", meta: "Uploaded by Joko on Mar 19, 2026" },
  { id: 4, name: "packing-list-wood-frame.png", documentType: "packing_list", uploadedBy: "Natasha Smith", date: "Mar 18, 2026", size: "540 KB", type: "image", previewUrl: "https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=400&h=400&fit=crop", meta: "Uploaded by Natasha Smith on Mar 18, 2026" },
  { id: 5, name: "manual-x200.pdf", documentType: "other", uploadedBy: "Admin", date: "Mar 15, 2026", size: "15.2 MB", type: "pdf", meta: "Uploaded by Admin on Mar 15, 2026" },
];

const MOCK_INVOICES_DATA = [
  { id: 1, invNo: "INV-2026-001", type: "Down Payment", issueDate: "Mar 01, 2026", dueDate: "Mar 15, 2026", totalDue: 5000000, status: "Paid", sBadge: "green" },
  { id: 2, invNo: "INV-2026-002", type: "Remaining Payment", issueDate: "Mar 10, 2026", dueDate: "Mar 24, 2026", totalDue: 12500000, status: "Issued", sBadge: "blue" },
  { id: 3, invNo: "INV-2026-003", type: "Down Payment", issueDate: "Mar 15, 2026", dueDate: "Mar 29, 2026", totalDue: 3000000, status: "Need Revision", sBadge: "orange" },
  { id: 4, invNo: "INV-2026-004", type: "Down Payment", issueDate: "Mar 18, 2026", dueDate: "Apr 01, 2026", totalDue: 4500000, status: "Void", sBadge: "grey" },
  { id: 5, invNo: "INV-2026-005", type: "Remaining Payment", issueDate: "Mar 20, 2026", dueDate: "Apr 03, 2026", totalDue: 8000000, status: "Canceled", sBadge: "red" },
  { id: 6, invNo: "INV-2026-006", type: "Down Payment", issueDate: "Mar 22, 2026", dueDate: "Apr 05, 2026", totalDue: 2000000, status: "Paid", sBadge: "green" },
];

const Tooltip = ({ content, children, style = {}, checkTruncation = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left + rect.width / 2,
      });
    }
  };

  useEffect(() => {
    if (isVisible) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      style={{
        position: "relative",
        display: "inline-block",
        width: "max-content",
        minWidth: 0,
        ...style,
      }}
      onMouseEnter={() => {
        if (checkTruncation && triggerRef.current) {
          const element = triggerRef.current.firstElementChild;
          if (element) {
            const isTruncated =
              element.scrollHeight > element.clientHeight + 1 ||
              element.scrollWidth > element.clientWidth + 1;
            if (!isTruncated) return;
          }
        }
        setIsVisible(true);
      }}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: coords.top - 8,
              left: coords.left,
              transform: "translate(-50%, -100%)",
              width: "max-content",
              maxWidth: "400px",
              zIndex: 20001,
              whiteSpace: "normal",
              padding: "8px 12px",
              borderRadius: "8px",
              background: "var(--neutral-on-surface-primary)",
              color: "var(--neutral-surface-primary)",
              fontSize: "var(--text-desc)",
              lineHeight: "1.6",
              boxShadow: "var(--elevation-sm)",
              textAlign: "left",
            }}
          >
            {content}
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "6px solid var(--neutral-on-surface-primary)",
              }}
            />
          </div>,
          document.body
        )}
    </div>
  );
};



const UploadDescriptionCard = ({
  file,
  onRemove,
  onDescriptionChange,
  descriptionRequired = false,
  descriptionError = "",
  hideDescriptionField = false,
}) => (
  <div
    style={{
      border: "1px solid var(--neutral-line-separator-1)",
      borderRadius: "24px",
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: "18px",
      background: "var(--neutral-surface-primary)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          minWidth: 0,
        }}
      >
        <DocumentTypeBadge fileName={file?.name} type={file?.type} />
        <span
          style={{
            fontSize: "var(--text-title-3)",
            lineHeight: "20px",
            letterSpacing: "0.09625px",
            fontWeight: "var(--font-weight-regular)",
            color: "var(--neutral-on-surface-primary)",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {file?.name || "-"}
        </span>
      </div>
      {onRemove ? (
        <Button variant="danger" size="small" onClick={onRemove}>
          Remove
        </Button>
      ) : null}
    </div>

    {!hideDescriptionField ? (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-regular)", color: "var(--neutral-on-surface-primary)" }}>
            File Description {descriptionRequired && <span style={{ color: "var(--status-red-primary)" }}>*</span>}
          </span>
          <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>
            {(file?.description || "").length}/{FILE_DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
        <input 
          type="text"
          value={file?.description || ""}
          onChange={(e) => onDescriptionChange?.(e.target.value)}
          placeholder="Enter File Description"
          style={{
            height: "48px",
            border: descriptionError ? "1px solid var(--status-red-primary)" : "1px solid var(--neutral-line-separator-1)",
            borderRadius: "8px",
            padding: "0 16px",
            fontSize: "var(--text-subtitle-1)",
            color: "var(--neutral-on-surface-primary)",
            outline: "none"
          }}
        />
        {descriptionError && <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>{descriptionError}</span>}
      </div>
    ) : null}
  </div>
);

const LabelValue = ({ label, value, badge, gridColumn, isClickable, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", gridColumn }}>
      <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {badge ? (
          <StatusBadge variant={badge.variant}>{badge.text}</StatusBadge>
        ) : (
          <span 
            onClick={isClickable ? onClick : undefined}
            onMouseEnter={() => isClickable && setIsHovered(true)}
            onMouseLeave={() => isClickable && setIsHovered(false)}
            style={{ 
              fontSize: "var(--text-title-3)", 
              fontWeight: "var(--font-weight-bold)", 
              color: isClickable ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-primary)",
              cursor: isClickable ? "pointer" : "default",
              textDecoration: isClickable && isHovered ? "underline" : "none"
            }}
          >
            {value || "-"}
          </span>
        )}
      </div>
    </div>
  );
};

const tabButtonStyle = (isActive) => ({
  height: "48px",
  padding: "0 28px",
  borderRadius: "100px",
  border: isActive
    ? "1px solid var(--feature-brand-primary)"
    : "1px solid var(--neutral-line-separator-1)",
  background: isActive ? "#EAF1FF" : "var(--neutral-surface-primary)",
  color: isActive ? "var(--feature-brand-primary)" : "#7F7F7F",
  fontSize: "var(--text-title-2)",
  fontWeight: isActive
    ? "var(--font-weight-bold)"
    : "var(--font-weight-regular)",
  cursor: "pointer",
  transition: "all 0.18s ease",
  boxShadow: "none",
});





const WorkOrderTab = ({ orderNo, orderStatus, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterTriggerRect, setFilterTriggerRect] = useState(null);

  const [hoveredSku, setHoveredSku] = useState(null);
  const [hoveredWo, setHoveredWo] = useState(null);

  let rawData = MOCK_WO_TABLE_DATA.filter(wo => wo.ord === orderNo);
  if (rawData.length === 0) {
    rawData = MOCK_WO_TABLE_DATA.slice(0, 15).map(wo => ({
      ...wo,
      ord: orderNo
    }));
  }

  const filteredData = React.useMemo(() => {
    let result = [...rawData];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(wo => 
        wo.wo.toLowerCase().includes(q) ||
        wo.product.toLowerCase().includes(q) ||
        wo.sku.toLowerCase().includes(q)
      );
    }
    if (statusFilter.length > 0) {
      result = result.filter(wo => statusFilter.includes(wo.status));
    }
    return result;
  }, [rawData, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const visibleData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const statusOptions = [...new Set(rawData.map(wo => wo.status))];

  const handleFilterToggle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFilterTriggerRect(rect);
    setIsFilterOpen(!isFilterOpen);
  };

  const toggleStatus = (status) => {
    setStatusFilter(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const gridTemplate = "2.5fr 1.5fr 0.8fr 1.1fr 1.1fr 1.1fr";
  const rowHeight = 64; 
  const maxBodyHeight = rowHeight * 5; 

  return (
    <div style={{ width: "100%", background: "var(--neutral-surface-primary)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", gap: "16px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div onClick={handleFilterToggle}>
            <FilterPill label="Status" count={statusFilter.length} active={statusFilter.length > 0} isOpen={isFilterOpen} />
          </div>
          {isFilterOpen && (
            <>
              {createPortal(<div style={{ position: "fixed", inset: 0, zIndex: 14000 }} onClick={() => setIsFilterOpen(false)} />, document.body)}
              {createPortal(
                <div style={{
                  position: "fixed",
                  top: `${filterTriggerRect.bottom + 8}px`,
                  left: `${filterTriggerRect.left}px`,
                  width: "240px",
                  background: "var(--neutral-surface-primary)",
                  border: "1px solid var(--neutral-line-separator-1)",
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  padding: "16px",
                  zIndex: 14001,
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>Status</span>
                    <button onClick={() => { setStatusFilter([]); setIsFilterOpen(false); }} style={{ background: "none", border: "none", color: "var(--status-red-primary)", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Remove Filter</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {statusOptions.map(opt => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
                        <Checkbox checked={statusFilter.includes(opt)} onChange={() => toggleStatus(opt)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>,
                document.body
              )}
            </>
          )}
        </div>
        <TableSearchField value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search WO Number, Product, SKU" width="320px" />
      </div>
      <div style={{ height: "1px", background: "var(--neutral-line-separator-1)", width: "100%" }} />
      <div style={{ width: "100%", overflowX: "auto" }}>
        <div style={{ minWidth: "1000px", width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: gridTemplate, borderBottom: "1px solid var(--neutral-line-separator-1)", background: "var(--neutral-surface-primary)", alignItems: "center" }}>
            <div style={{ padding: "16px 12px 16px 24px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Product</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>WO Number</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Ordered Qty</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Planned Start</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Planned End</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Status</div>
          </div>
          <div style={{ display: "block", maxHeight: `${maxBodyHeight}px`, overflowY: "auto", width: "100%" }}>
            {visibleData.length > 0 ? visibleData.map((wo, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: gridTemplate, height: `${rowHeight}px`, alignItems: "center", borderBottom: "1px solid var(--neutral-line-separator-1)", transition: "background 0.2s ease", cursor: "default", width: "100%" }}>
                <div style={{ padding: "0 12px 0 24px", display: "flex", alignItems: "center", gap: "12px", overflow: "hidden" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--neutral-surface-grey-lighter)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Box size={20} color="var(--neutral-on-surface-tertiary)" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0, width: "100%" }}>
                    <Tooltip content={wo.product} checkTruncation={true} style={{ width: "100%" }}>
                      <span style={{ 
                        fontSize: "var(--text-title-3)", 
                        fontWeight: "var(--font-weight-bold)", 
                        color: "var(--neutral-on-surface-primary)", 
                        whiteSpace: "nowrap", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis",
                        display: "block"
                      }}>
                        {wo.product}
                      </span>
                    </Tooltip>
                    <span onClick={(e) => { e.stopPropagation(); onNavigate("product_detail", { sku: wo.sku }); }} onMouseEnter={() => setHoveredSku(`${wo.wo}-${idx}`)} onMouseLeave={() => setHoveredSku(null)} style={{ fontSize: "var(--text-body)", color: "var(--feature-brand-primary)", cursor: "pointer", textDecoration: hoveredSku === `${wo.wo}-${idx}` ? "underline" : "none" }}>{wo.sku}</span>
                  </div>
                </div>
                <div style={{ padding: "0 12px", overflow: "hidden", display: "flex" }}>
                  {["Not Started", "Waiting for Approval", "Need Revision"].includes(orderStatus) ? (
                    <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-tertiary)" }}>-</span>
                  ) : (
                    <Tooltip content={wo.wo} checkTruncation={true} style={{ width: "100%" }}>
                      <span 
                        onClick={(e) => { e.stopPropagation(); onNavigate("wo_detail", { woNo: wo.wo }); }} 
                        onMouseEnter={() => setHoveredWo(`${wo.wo}-${idx}`)} 
                        onMouseLeave={() => setHoveredWo(null)} 
                        style={{ 
                          fontSize: "var(--text-title-3)", 
                          fontWeight: "var(--font-weight-regular)", 
                          color: "var(--feature-brand-primary)", 
                          cursor: "pointer", 
                          textDecoration: hoveredWo === `${wo.wo}-${idx}` ? "underline" : "none", 
                          whiteSpace: "nowrap", 
                          overflow: "hidden", 
                          textOverflow: "ellipsis",
                          display: "block"
                        }}
                      >
                        {wo.wo}
                      </span>
                    </Tooltip>
                  )}
                </div>
                <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{wo.qty}</div>
                <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{wo.start || "-"}</div>
                <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{wo.end || "-"}</div>
                <div style={{ padding: "0 12px" }}><StatusBadge variant={wo.sBadge}>{wo.status}</StatusBadge></div>
              </div>
            )) : <div style={{ padding: "40px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)" }}>No results found.</div>}
          </div>
        </div>
      </div>
      <div style={{ padding: "0 4px" }}>
        <TablePaginationFooter currentPage={currentPage} totalPages={totalPages} rowsPerPage={rowsPerPage} totalRows={filteredData.length} onPageChange={setCurrentPage} onRowsPerPageChange={setRowsPerPage} />
      </div>
    </div>
  );
};

const InvoicesTab = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterTriggerRect, setFilterTriggerRect] = useState(null);

  const [hoveredInv, setHoveredInv] = useState(null);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val).replace("Rp", "Rp ");
  };

  const filteredData = React.useMemo(() => {
    let result = [...MOCK_INVOICES_DATA];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(inv => inv.invNo.toLowerCase().includes(q));
    }
    if (statusFilter.length > 0) {
      result = result.filter(inv => statusFilter.includes(inv.status));
    }
    return result;
  }, [searchQuery, statusFilter]);

  const metrics = useMemo(() => {
    const total = filteredData.reduce((acc, inv) => acc + inv.totalDue, 0);
    const paid = filteredData.filter(inv => inv.status === "Paid").reduce((acc, inv) => acc + inv.totalDue, 0);
    return {
      totalInvoice: total,
      totalPaid: paid,
      totalOutstanding: total - paid
    };
  }, [filteredData]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const visibleData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const statusOptions = ["Paid", "Issued", "Void", "Canceled", "Need Revision"];

  const handleFilterToggle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFilterTriggerRect(rect);
    setIsFilterOpen(!isFilterOpen);
  };

  const toggleStatus = (status) => {
    setStatusFilter(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const gridTemplate = "2fr 1.5fr 1.2fr 1.2fr 1.5fr 1.2fr";
  const rowHeight = 64;
  const maxBodyHeight = rowHeight * 5;

  return (
    <div style={{ width: "100%", background: "var(--neutral-background-primary)", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
        {[
          { label: "Total Invoice", value: metrics.totalInvoice, icon: <TrendingUp /> },
          { label: "Total Paid", value: metrics.totalPaid, icon: <Box /> },
          { label: "Total Outstanding", value: metrics.totalOutstanding, icon: <Info /> }
        ].map((card, idx) => (
          <div key={idx} style={{ 
            background: "var(--neutral-surface-primary)", 
            borderRadius: "16px", 
            padding: "20px", 
            border: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "92px"
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontSize: "13px", color: "var(--neutral-on-surface-tertiary)", fontWeight: "500" }}>{card.label}</div>
              <div style={{ fontSize: "16px", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{formatCurrency(card.value)}</div>
            </div>
            <div style={{ 
              width: "36px", 
              height: "36px", 
              borderRadius: "50%", 
              background: "#F5F5F5", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              flexShrink: 0
            }}>
              {React.cloneElement(card.icon, { size: 18, color: "var(--neutral-on-surface-secondary)" })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        background: "var(--neutral-surface-primary)", 
        borderRadius: "var(--radius-card)", 
        border: "1px solid var(--neutral-line-separator-1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", gap: "16px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div onClick={handleFilterToggle}>
              <FilterPill label="Status" count={statusFilter.length} active={statusFilter.length > 0} isOpen={isFilterOpen} />
            </div>
            {isFilterOpen && (
              <>
                {createPortal(<div style={{ position: "fixed", inset: 0, zIndex: 14000 }} onClick={() => setIsFilterOpen(false)} />, document.body)}
                {createPortal(
                  <div style={{
                    position: "fixed",
                    top: `${filterTriggerRect.bottom + 8}px`,
                    left: `${filterTriggerRect.left}px`,
                    width: "240px",
                    background: "var(--neutral-surface-primary)",
                    border: "1px solid var(--neutral-line-separator-1)",
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    padding: "16px",
                    zIndex: 14001,
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>Status</span>
                      <button onClick={() => { setStatusFilter([]); setIsFilterOpen(false); }} style={{ background: "none", border: "none", color: "var(--status-red-primary)", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Remove Filter</button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {statusOptions.map(opt => (
                        <label key={opt} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
                          <Checkbox checked={statusFilter.includes(opt)} onChange={() => toggleStatus(opt)} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>,
                  document.body
                )}
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <TableSearchField value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Invoice Number" width="320px" />
            <Button variant="filled" leftIcon={AddIcon} onClick={() => {}}>
              Add Invoice
            </Button>
          </div>
        </div>
      <div style={{ height: "1px", background: "var(--neutral-line-separator-1)", width: "100%" }} />
      <div style={{ width: "100%", overflowX: "auto" }}>
        <div style={{ minWidth: "1000px", width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: gridTemplate, borderBottom: "1px solid var(--neutral-line-separator-1)", background: "var(--neutral-surface-primary)", alignItems: "center" }}>
            <div style={{ padding: "16px 12px 16px 24px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Invoice Number</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Type</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Issue Date</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Due Date</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Total Due</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Status</div>
          </div>
          <div style={{ display: "block", maxHeight: `${maxBodyHeight}px`, overflowY: "auto", width: "100%" }}>
            {visibleData.length > 0 ? visibleData.map((inv, idx) => {
              const [isRowHovered, setIsRowHovered] = useState(false);
              return (
                <div 
                  key={idx} 
                  onClick={() => onNavigate("invoice_detail", { invNo: inv.invNo })}
                  onMouseEnter={() => setIsRowHovered(true)}
                  onMouseLeave={() => setIsRowHovered(false)}
                  style={{ 
                    display: "grid", 
                    gridTemplateColumns: gridTemplate, 
                    height: `${rowHeight}px`, 
                    alignItems: "center", 
                    borderBottom: "1px solid var(--neutral-line-separator-1)", 
                    transition: "background 0.2s ease", 
                    cursor: "pointer", 
                    width: "100%",
                    background: isRowHovered ? "var(--neutral-surface-grey-lighter)" : "transparent"
                  }}
                >
                  <div style={{ padding: "0 12px 0 24px", overflow: "hidden" }}>
                    <span onMouseEnter={() => setHoveredInv(inv.id)} onMouseLeave={() => setHoveredInv(null)} style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--feature-brand-primary)", cursor: "pointer", textDecoration: hoveredInv === inv.id ? "underline" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{inv.invNo}</span>
                  </div>
                  <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{inv.type}</div>
                  <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{inv.issueDate}</div>
                  <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{inv.dueDate}</div>
                  <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{formatCurrency(inv.totalDue)}</div>
                  <div style={{ padding: "0 12px" }}><StatusBadge variant={inv.sBadge}>{inv.status}</StatusBadge></div>
                </div>
              );
            }) : <div style={{ padding: "40px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)" }}>No results found.</div>}
          </div>
        </div>
      </div>
      <div style={{ padding: "0 4px" }}>
        <TablePaginationFooter currentPage={currentPage} totalPages={totalPages} rowsPerPage={rowsPerPage} totalRows={filteredData.length} onPageChange={setCurrentPage} onRowsPerPageChange={setRowsPerPage} />
      </div>
      </div>
    </div>
  );
};

const AttachmentsTab = ({ onNavigate, showSnackbar }) => {
  const [attachments, setAttachments] = useState(MOCK_ATTACHMENTS_DATA);
  const [view, setView] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterTriggerRect, setFilterTriggerRect] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuTriggerRect, setMenuTriggerRect] = useState(null);
  const MAX_ATTACHMENTS = 10;
  const isLimitReached = attachments.length >= MAX_ATTACHMENTS;

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Modal Form States
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadError, setUploadError] = useState("");

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [uploadDescriptionError, setUploadDescriptionError] = useState("");
  const [editNameError, setEditNameError] = useState("");
  const [editDescriptionError, setEditDescriptionError] = useState("");

  const filteredData = React.useMemo(() => {
    let result = [...attachments];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(doc => (doc.title || doc.name).toLowerCase().includes(q));
    }
    return result;
  }, [attachments, searchQuery]);

  const documentTypeOptions = [
    { value: "invoice", label: "Invoice" },
    { value: "delivery_note", label: "Delivery Note" },
    { value: "packing_list", label: "Packing List" },
    { value: "quotation_vendor", label: "Quotation (Vendor)" },
    { value: "contract_agreement", label: "Contract / Agreement" },
    { value: "other", label: "Other" },
  ];

  const getDocumentTypeLabel = (type) => documentTypeOptions.find(opt => opt.value === type)?.label || "Other";

  const getDocumentPreview = (doc, compact = false) => {
    const radius = compact ? "12px" : "0px";
    if (doc.type === "image" && doc.previewUrl) {
      return <img src={doc.previewUrl} alt={doc.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: radius, display: "block" }} />;
    }
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: radius, background: "var(--neutral-surface-grey-lighter)" }}>
        <DocumentTypeBadge fileName={doc.name} type={doc.type} size={compact ? "small" : "preview"} />
      </div>
    );
  };

  const handleFilterToggle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFilterTriggerRect(rect);
    setIsFilterOpen(!isFilterOpen);
  };

  const resetUploadState = () => {
    setUploadFile(null);
    setUploadDescription("");
    setUploadError("");
    setUploadDescriptionError("");
  };

  const handleUpload = () => {
    let hasError = false;
    if (!uploadFile) {
      setUploadError("Please choose a file");
      hasError = true;
    } else {
      setUploadError("");
    }
    if (!uploadDescription.trim()) {
      setUploadDescriptionError("Field cannot be empty");
      hasError = true;
    } else {
      setUploadDescriptionError("");
    }
    if (hasError) return;
    
    const newDoc = {
      id: Date.now(),
      name: uploadFile.name,
      title: uploadFile.name.split('.')[0],
      description: uploadDescription,
      documentType: "other",
      uploadedBy: "Joko",
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      size: `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`,
      type: uploadFile.type.includes('pdf') ? 'pdf' : 'image',
      meta: `Uploaded by Joko on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    };

    setAttachments(prev => [newDoc, ...prev]);
    setShowUploadModal(false);
    resetUploadState();
    showSnackbar?.("Document successfully uploaded");
  };

  const handleEdit = () => {
    let hasError = false;
    if (!editName.trim()) {
      setEditNameError("Field cannot be empty");
      hasError = true;
    } else {
      setEditNameError("");
    }
    if (!editDescription.trim()) {
      setEditDescriptionError("Field cannot be empty");
      hasError = true;
    } else {
      setEditDescriptionError("");
    }
    if (hasError) return;

    setAttachments(prev => prev.map(doc => 
      doc.id === selectedDocId 
        ? { ...doc, title: editName.trim(), description: editDescription.trim() } 
        : doc
    ));
    setShowEditModal(false);
    showSnackbar?.("Document successfully updated");
  };

  const handleDelete = () => {
    if (selectedDocId === null) return;
    setAttachments(prev => prev.filter(doc => doc.id !== selectedDocId));
    setShowDeleteModal(false);
    setSelectedDocId(null);
    showSnackbar?.("Document successfully deleted", "black");
  };

  const gridTemplate = "2.2fr 1.2fr 1fr 0.9fr 132px";
  const rowHeight = 72;

  return (
    <div style={{ width: "100%", background: "var(--neutral-surface-primary)", display: "flex", flexDirection: "column" }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", gap: "16px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* Removed Document Type Filter */}
        </div>
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <TableSearchField value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search documents" width="320px" />
          <div style={{ display: "flex", border: "1px solid var(--neutral-line-separator-1)", borderRadius: "12px", overflow: "hidden", background: "white" }}>
            <button onClick={() => setView("list")} style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: view === "list" ? "#EAF1FF" : "white", cursor: "pointer" }}>
              <ListViewIcon size={18} color={view === "list" ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-tertiary)"} />
            </button>
            <button onClick={() => setView("grid")} style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", borderLeft: "1px solid var(--neutral-line-separator-1)", background: view === "grid" ? "#EAF1FF" : "white", cursor: "pointer" }}>
              <GridViewIcon size={18} color={view === "grid" ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-tertiary)"} />
            </button>
          </div>
          <Button 
            variant="filled" 
            leftIcon={UploadIcon} 
            disabled={isLimitReached}
            onClick={() => { resetUploadState(); setShowUploadModal(true); }}
          >
            Upload
          </Button>
        </div>
      </div>

      <div style={{ height: "1px", background: "var(--neutral-line-separator-1)", width: "100%" }} />

      <div style={{ padding: "0" }}>
        {isLimitReached && (
          <div style={{ 
            margin: "20px 24px 0", 
            display: "flex", 
            alignItems: "flex-start", 
            gap: "12px", 
            padding: "12px 16px", 
            borderRadius: "12px", 
            background: "var(--feature-brand-container-lighter)", 
            border: "1px solid var(--feature-brand-container-darker)" 
          }}>
            <Info size={16} strokeWidth={2.1} color="var(--feature-brand-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <span style={{ fontSize: "var(--text-title-3)", color: "var(--feature-brand-primary)", lineHeight: "1.5" }}>
              This order already has {MAX_ATTACHMENTS} documents attached. Remove a document before uploading a new one.
            </span>
          </div>
        )}
        {view === "list" ? (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <div style={{ minWidth: "1000px", width: "100%" }}>
              <div style={{ display: "grid", gridTemplateColumns: gridTemplate, borderBottom: "1px solid var(--neutral-line-separator-1)", background: "var(--neutral-surface-primary)", alignItems: "center" }}>
                <div style={{ padding: "16px 12px 16px 24px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Name</div>
                <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Uploaded By</div>
                <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Date Modified</div>
                <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>File Size</div>
                <div style={{ padding: "16px 24px 16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", textAlign: "right" }}>Action</div>
              </div>
              <div style={{ display: "block", maxHeight: "360px", overflowY: "auto", width: "100%" }}>
                {filteredData.length > 0 ? filteredData.map((doc, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: gridTemplate, height: `${rowHeight}px`, alignItems: "center", borderBottom: "1px solid var(--neutral-line-separator-1)", transition: "background 0.2s ease", cursor: "pointer", width: "100%", background: "white" }}>
                    <div style={{ padding: "0 12px 0 24px", display: "flex", alignItems: "center", gap: "12px", overflow: "hidden" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0, overflow: "hidden" }}>{getDocumentPreview(doc, true)}</div>
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.title || doc.name.split('.')[0]}</span>
                        <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</span>
                      </div>
                    </div>
                    <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{doc.uploadedBy}</div>
                    <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{doc.date}</div>
                    <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{doc.size}</div>
                    <div style={{ padding: "0 24px 0 12px", display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                      <Tooltip content="Download"><IconButton icon={DownloadIcon} size="small" onClick={() => { showSnackbar?.("Document successfully downloaded"); }} /></Tooltip>
                      <Tooltip content="Edit"><IconButton icon={EditIcon} size="small" onClick={() => { setSelectedDocId(doc.id); setEditName(doc.title || doc.name.split('.')[0]); setEditDescription(doc.description || ""); setShowEditModal(true); }} /></Tooltip>
                      <Tooltip content="Delete"><IconButton icon={DeleteIcon} size="small" color="var(--status-red-primary)" hoverBackground="#FAE6E8" onClick={() => { setSelectedDocId(doc.id); setShowDeleteModal(true); }} /></Tooltip>
                    </div>
                  </div>
                )) : <div style={{ padding: "40px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)" }}>No documents added</div>}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "16px", padding: "20px 24px" }}>
            {filteredData.length > 0 ? filteredData.map((doc) => (
              <div key={doc.id} style={{ border: "1px solid var(--neutral-line-separator-1)", borderRadius: "16px", background: "var(--neutral-surface-primary)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ height: "152px", overflow: "hidden" }}>{getDocumentPreview(doc, false)}</div>
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "flex-start", position: "relative" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", lineHeight: "1.5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.title || doc.name.split('.')[0]}</span>
                      <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", lineHeight: "1.4", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</span>
                    </div>
                    <IconButton 
                      icon={MoreVerticalIcon} 
                      size="small" 
                      color="var(--neutral-on-surface-secondary)" 
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuTriggerRect(rect);
                        setOpenMenuId(openMenuId === doc.id ? null : doc.id);
                      }} 
                    />
                    {openMenuId === doc.id && (
                      <>
                        {createPortal(
                          <div 
                            style={{ position: "fixed", inset: 0, zIndex: 100 }} 
                            onClick={() => setOpenMenuId(null)} 
                          />,
                          document.body
                        )}
                        {createPortal(
                          <div style={{
                            position: "fixed",
                            top: `${menuTriggerRect.bottom + 8}px`,
                            left: `${menuTriggerRect.right - 160}px`,
                            width: "160px",
                            background: "var(--neutral-surface-primary)",
                            border: "1px solid var(--neutral-line-separator-1)",
                            borderRadius: "12px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                            zIndex: 101,
                            padding: "6px",
                            display: "flex",
                            flexDirection: "column"
                          }}>
                            {[
                              { label: "Download", icon: <DownloadIcon size={16} />, color: "var(--neutral-on-surface-primary)", onClick: () => {
                                showSnackbar?.("Document successfully downloaded");
                                setOpenMenuId(null);
                              }},
                              { label: "Edit", icon: <EditIcon size={16} />, color: "var(--neutral-on-surface-primary)", onClick: () => {
                                setSelectedDocId(doc.id);
                                setEditName(doc.title || doc.name.split('.')[0]);
                                setEditDescription(doc.description || "");
                                setShowEditModal(true);
                                setOpenMenuId(null);
                              }},
                              { label: "Delete", icon: <Trash2 size={16} />, color: "var(--status-red-primary)", onClick: () => {
                                setSelectedDocId(doc.id);
                                setShowDeleteModal(true);
                                setOpenMenuId(null);
                              }}
                            ].map((opt, i, arr) => (
                              <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); opt.onClick?.(); }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  padding: "10px 12px",
                                  borderRadius: i === 0 ? "8px 8px 0 0" : i === arr.length - 1 ? "0 0 8px 8px" : "0",
                                  border: "none",
                                  borderBottom: i < arr.length - 1 ? "1px solid var(--neutral-line-separator-2)" : "none",
                                  background: "none",
                                  cursor: "pointer",
                                  textAlign: "left",
                                  width: "100%",
                                  transition: "background 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                              >
                                {React.cloneElement(opt.icon, { color: opt.color })}
                                <span style={{ fontSize: "13px", color: opt.color, fontWeight: "500" }}>{opt.label}</span>
                              </button>
                            ))}
                          </div>,
                          document.body
                        )}
                      </>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>Uploaded by: {doc.uploadedBy}</span>
                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>Date modified: {doc.date}</span>
                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>File size: {doc.size}</span>
                  </div>
                </div>
              </div>
            )) : <div style={{ gridColumn: "1 / -1", padding: "48px 24px", textAlign: "center", color: "var(--neutral-on-surface-secondary)" }}>No documents added</div>}
          </div>
        )}
      </div>

      {/* Modals - REPLICATED FROM PO DETAIL */}
      <GeneralModal
        isOpen={showUploadModal}
        onClose={() => { setShowUploadModal(false); resetUploadState(); }}
        title="Upload Document"
        width="640px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button variant="outlined" size="large" style={{ flex: 1 }} onClick={() => { setShowUploadModal(false); resetUploadState(); }}>Cancel</Button>
            <Button variant="filled" size="large" style={{ flex: 1 }} onClick={handleUpload}>Upload</Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "var(--text-body)" }}>
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>Document Upload</span>
            </div>
            <UploadDropzone 
              maxFiles={1} 
              disabled={!!uploadFile} 
              onFilesSelected={(files) => { setUploadFile(files[0]); setUploadError(validateUploadFile(files[0])); }} 
              error={uploadError}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
              allowedText="Allowed formats (PDF, DOC, XLSX, JPG, JPEG, PNG, WebP)"
            />
            {uploadError && (
              <span
                style={{
                  fontSize: "var(--text-body)",
                  color: "var(--status-red-primary)",
                  marginTop: "2px",
                }}
              >
                {uploadError}
              </span>
            )}
          </div>
          {uploadFile && <UploadDescriptionCard file={{name: uploadFile.name, type: uploadFile.type, description: uploadDescription}} onRemove={resetUploadState} onDescriptionChange={setUploadDescription} descriptionRequired={true} descriptionError={uploadDescriptionError} />}
        </div>
      </GeneralModal>

      <GeneralModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Document"
        width="640px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button variant="outlined" size="large" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="filled" size="large" style={{ flex: 1 }} onClick={handleEdit}>Save</Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-primary)" }}>
              Document Name <span style={{ color: "var(--status-red-primary)" }}>*</span>
            </span>
            <input type="text" value={editName} onChange={(e) => { setEditName(e.target.value); if (editNameError) setEditNameError(""); }} placeholder="Enter document name" style={{ height: "48px", border: editNameError ? "1px solid var(--status-red-primary)" : "1px solid var(--neutral-line-separator-1)", borderRadius: "8px", padding: "0 16px", outline: "none" }} />
            {editNameError && <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>{editNameError}</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-primary)" }}>
                File Description <span style={{ color: "var(--status-red-primary)" }}>*</span>
              </span>
              <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>{editDescription.length}/{FILE_DESCRIPTION_MAX_LENGTH}</span>
            </div>
            <input type="text" value={editDescription} onChange={(e) => { setEditDescription(e.target.value); if (editDescriptionError) setEditDescriptionError(""); }} placeholder="Enter File Description" maxLength={FILE_DESCRIPTION_MAX_LENGTH} style={{ height: "48px", border: editDescriptionError ? "1px solid var(--status-red-primary)" : "1px solid var(--neutral-line-separator-1)", borderRadius: "8px", padding: "0 16px", outline: "none" }} />
            {editDescriptionError && <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>{editDescriptionError}</span>}
          </div>
        </div>
      </GeneralModal>

      <GeneralModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Document?"
        width="376px"
        centeredHeader
        description="This document will be permanently removed from the order."
        footer={
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            <Button variant="filled" size="large" style={{ width: "100%" }} onClick={handleDelete}>Yes, Delete</Button>
            <Button variant="outlined" size="large" style={{ width: "100%" }} onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          </div>
        }
      />
    </div>
  );
};

const POPreview = ({ po }) => {
  if (!po) return null;

  return (
    <div style={{ width: "440px", background: "#F9FAFB", borderLeft: "1px solid var(--neutral-line-separator-1)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "40px 24px 20px", display: "flex", alignItems: "center", background: "white", flexShrink: 0 }}>
        <span style={{ fontSize: "18px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Purchase Order Preview</span>
      </div>
      
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto", flex: 1 }}>
        {/* PO Header area */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "18px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>{po.poNumber}</span>
            <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-tertiary)" }}>{po.vendorName}</span>
          </div>
          <StatusBadge variant={
            po.status === "Draft" ? "grey" : 
            po.status === "Need Revision" ? "yellow" : 
            po.status === "Issued" ? "green" : "grey"
          }>
            {po.status}
          </StatusBadge>
        </div>

        {/* Purchase Order Information */}
        <div style={{ background: "white", padding: "20px", borderRadius: "16px", border: "1px solid var(--neutral-line-separator-1)", display: "flex", flexDirection: "column", gap: "20px" }}>
          <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Purchase Order Information</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>PO Date</span>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>{po.createdDate}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Expected Delivery Date</span>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>{po.expectedDelivery || "2026-04-10"}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Currency</span>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>IDR</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Created By</span>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Joko</span>
            </div>
          </div>
        </div>

        {/* Vendor Information */}
        <div style={{ background: "white", padding: "20px", borderRadius: "16px", border: "1px solid var(--neutral-line-separator-1)", display: "flex", flexDirection: "column", gap: "20px" }}>
          <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Vendor Information</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Vendor Name</span>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>{po.vendorName}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Phone Number</span>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>08123456789</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Email address</span>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>contact@mitra.com</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Address</span>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)", lineHeight: "1.4" }}>Jl. Sudirman No.1, Jakarta Pusat, 10220</span>
            </div>
          </div>
        </div>

        {/* Purchase Order Lines */}
        <div style={{ background: "white", padding: "20px", borderRadius: "16px", border: "1px solid var(--neutral-line-separator-1)", display: "flex", flexDirection: "column", gap: "20px" }}>
          <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Purchase Order Lines</span>
          <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid var(--neutral-line-separator-1)", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Cabinet Premium</span>
                <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>CAB-PR-9921</span>
              </div>
              <div style={{ padding: "2px 8px", background: "rgba(0, 107, 255, 0.1)", color: "#006BFF", fontSize: "11px", fontWeight: "bold", borderRadius: "4px" }}>WO</div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--neutral-on-surface-tertiary)" }}>Description</span>
              <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)", lineHeight: "1.4" }}>
                Generated from WO-2026-03-025-00008 including Advanced Assembly, Premium Painting
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "11px", color: "var(--neutral-on-surface-tertiary)" }}>WO Ref</span>
                <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>WO-2026-03-025-00008</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "11px", color: "var(--neutral-on-surface-tertiary)" }}>Quantity</span>
                <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>1 pcs</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "11px", color: "var(--neutral-on-surface-tertiary)" }}>Unit Price</span>
                <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>IDR 250,000</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "11px", color: "var(--neutral-on-surface-tertiary)" }}>Subtotal</span>
                <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>IDR 250,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div style={{ background: "white", padding: "20px", borderRadius: "16px", border: "1px solid var(--neutral-line-separator-1)", display: "flex", flexDirection: "column", gap: "16px" }}>
          <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Summary</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "var(--neutral-on-surface-tertiary)" }}>Subtotal</span>
              <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>IDR 250,000</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "var(--neutral-on-surface-tertiary)" }}>Tax (11%)</span>
              <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>IDR 27,500</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "var(--neutral-on-surface-tertiary)" }}>Fees</span>
              <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>IDR 150,000</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid var(--neutral-line-separator-1)" }}>
              <span style={{ fontSize: "18px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Total</span>
              <span style={{ fontSize: "18px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>IDR 427,500</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div style={{ background: "white", padding: "20px", borderRadius: "16px", border: "1px solid var(--neutral-line-separator-1)", display: "flex", flexDirection: "column", gap: "16px" }}>
          <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Notes & Terms</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--neutral-on-surface-tertiary)" }}>Notes</span>
              <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)", lineHeight: "1.4" }}>Dummy PO detail generated from outsource detail table click.</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--neutral-on-surface-tertiary)" }}>Terms</span>
              <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Payment within 30 days from invoice date.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NewPOModal = ({ isOpen, onClose, selectedMaterials, onNavigate, showSnackbar, onAddSuccess, initialData }) => {
  const [poOption, setPoOption] = useState("create");
  const [selectedPO, setSelectedPO] = useState("");
  const [poError, setPoError] = useState("");
  const [purchaseQtys, setPurchaseQtys] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPoOption("create");
      setSelectedPO("");
      setPoError("");
      
      if (selectedMaterials.length > 0) {
        const initialQtys = {};
        selectedMaterials.forEach(m => {
          initialQtys[m.id] = Math.max(0, m.remaining - m.availableStock - (m.incomingPO || 0));
        });
        setPurchaseQtys(initialQtys);
      }
    }
  }, [isOpen, selectedMaterials]);

  const handleQtyChange = (id, val) => {
    setPurchaseQtys(prev => ({ ...prev, [id]: val }));
  };

  const validateAndSubmit = () => {
    if (poOption === "select" && !selectedPO) {
      setPoError("Field cannot be empty");
      return;
    }
    setPoError("");

    const hasZero = selectedMaterials.some(m => !purchaseQtys[m.id] || Number(purchaseQtys[m.id]) === 0);
    if (hasZero) {
      setShowConfirmModal(true);
    } else {
      processSubmit();
    }
  };

  const processSubmit = () => {
    const activeMaterials = selectedMaterials.filter(m => purchaseQtys[m.id] && Number(purchaseQtys[m.id]) > 0);
    
    if (poOption === "create") {
      onNavigate("/purchase-order/create", { 
        source: "order_detail_material_add",
        returnTo: {
          view: "detail",
          data: { ...(initialData || {}), activeTab: "materials", orderNo: initialData?.orderNo || initialData?.id }
        },
        materials: activeMaterials.map(m => ({
          ...m,
          purchaseQty: Number(purchaseQtys[m.id]),
          price: m.averageCost || m.price || 0
        }))
      });
      onClose();
    } else {
      const addedData = activeMaterials.map(m => ({
        id: m.id,
        qty: Number(purchaseQtys[m.id])
      }));
      
      // Update the mock data to include these lines in the target PO
      const poToUpdate = MOCK_PO_TABLE_DATA.find(po => po.poNumber === selectedPO);
      if (poToUpdate) {
        if (!poToUpdate.lines) poToUpdate.lines = [];
        activeMaterials.forEach(m => {
          poToUpdate.lines.push({
            id: `line-${Date.now()}-${m.id}`,
            type: "material",
            item: m.name || m.item,
            code: m.sku || m.code,
            qty: Number(purchaseQtys[m.id]),
            price: m.averageCost || m.price || 0,
            uom: m.uom || m.unit
          });
        });
      }
      
      if (onAddSuccess) {
        onAddSuccess(addedData);
      }
      
      onNavigate("po_detail", { 
        poNumber: selectedPO,
        from: "order_detail",
        returnTo: {
          view: "detail",
          data: { ...(initialData || {}), activeTab: "materials", orderNo: initialData?.orderNo || initialData?.id }
        }
      });

      if (showSnackbar) {
        showSnackbar("Material successfully added to purchase order", "success");
      }
      
      onClose();
    }
  };

  const poOptions = MOCK_PO_TABLE_DATA
    .filter(po => po.status === "Draft")
    .map(po => ({ value: po.poNumber, label: `${po.poNumber} - ${po.vendorName}` }));

  const showPreview = poOption === "select" && selectedPO;

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      width={showPreview ? "1080px" : "640px"}
      noPadding={true}
    >
      <div style={{ display: "flex", height: "80vh" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "64px 24px 24px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "20px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Add New Purchase Order</span>
          </div>

          <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { id: "create", title: "Create New PO", desc: "Create a new draft PO using selected material lines." },
                { id: "select", title: "Select Existing PO", desc: "Append selected materials into an existing editable PO." }
              ].map(opt => (
                <div 
                  key={opt.id}
                  onClick={() => {
                    setPoOption(opt.id);
                    setSelectedPO("");
                    setPoError("");
                  }}
                  style={{ 
                    padding: "24px", 
                    borderRadius: "20px", 
                    border: `1.5px solid ${poOption === opt.id ? "#006BFF" : "#E5E7EB"}`,
                    background: poOption === opt.id ? "rgba(0, 107, 255, 0.05)" : "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ 
                    width: "22px", 
                    height: "22px", 
                    borderRadius: "50%", 
                    border: `1.5px solid ${poOption === opt.id ? "#006BFF" : "#D1D5DB"}`, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                    background: "white"
                  }}>
                    {poOption === opt.id && <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#006BFF" }} />}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "16px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>{opt.title}</span>
                    <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-tertiary)", lineHeight: "1.4" }}>{opt.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {poOption === "select" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)" }}>
                  <span style={{ color: "var(--feature-brand-red-primary)" }}>*</span> Purchase Order
                </span>
                <DropdownSelect 
                  value={selectedPO}
                  onChange={(val) => { setSelectedPO(val); setPoError(""); }}
                  options={poOptions}
                  placeholder="Select Purchase Order"
                  hasError={!!poError}
                  fieldHeight="44px"
                  borderRadius="12px"
                  showDivider={true}
                />
                {poError && (
                  <span style={{ fontSize: "12px", color: "var(--status-red-primary)", marginTop: "-4px" }}>{poError}</span>
                )}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", borderBottom: "1px solid var(--neutral-line-separator-1)", padding: "12px 0", gap: "16px" }}>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Material</span>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Shortage Qty</span>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Qty to Purchase</span>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column" }}>
                {selectedMaterials.map(m => (
                  <div key={m.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", padding: "16px 0", borderBottom: "1px solid var(--neutral-line-separator-1)", alignItems: "center", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>{m.name}</span>
                      <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>{m.sku}</span>
                    </div>
                    <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)" }}>{Math.max(0, m.remaining - m.availableStock - (m.incomingPO || 0))} {m.uom}</span>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "0", 
                      border: "1px solid var(--neutral-line-separator-1)", 
                      borderRadius: "10px", 
                      padding: "0 12px",
                      width: "120px",
                      height: "40px"
                    }}>
                      <input 
                        type="number"
                        value={purchaseQtys[m.id] || 0}
                        onChange={(e) => handleQtyChange(m.id, e.target.value)}
                        style={{ 
                          flex: 1,
                          height: "100%",
                          border: "none", 
                          textAlign: "left",
                          fontSize: "14px",
                          outline: "none",
                          color: "var(--neutral-on-surface-primary)",
                          background: "transparent",
                          minWidth: 0
                        }}
                      />
                      <span style={{ fontSize: "13px", color: "var(--neutral-on-surface-tertiary)", flexShrink: 0 }}>{m.uom}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ padding: "20px 24px", background: "white", display: "flex", gap: "12px", flexShrink: 0 }}>
            <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
            <Button variant="filled" size="large" onClick={validateAndSubmit} style={{ flex: 1 }}>Submit</Button>
          </div>
        </div>

        {showPreview && <POPreview po={MOCK_PO_TABLE_DATA.find(po => po.poNumber === selectedPO)} />}
      </div>

      <GeneralModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Submission"
        width="420px"
        description="Some materials have a quantity of 0 and won’t be included in this purchase order. Do you want to continue?"
        descriptionStyle={{ fontSize: "14px" }}
        footer={
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", marginTop: "24px" }}>
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                setShowConfirmModal(false);
                processSubmit();
              }}
            >
              Continue
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
          </div>
        }
      />
    </GeneralModal>
  );
};

const EditOrderModal = ({ isOpen, onClose, orderData, onSave }) => {
  const [poNo, setPoNo] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [plannedStart, setPlannedStart] = useState("");
  const [plannedEnd, setPlannedEnd] = useState("");
  const [remarks, setRemarks] = useState("");

  const [isFocusedOrderNo, setIsFocusedOrderNo] = useState(false);
  const [isFocusedRemarks, setIsFocusedRemarks] = useState(false);

  useEffect(() => {
    if (isOpen && orderData) {
      setPoNo(orderData.poNo || "");
      setPriority(orderData.priority || "Normal");
      setPlannedStart(orderData.plannedStart || "");
      setPlannedEnd(orderData.plannedEnd || "");
      setRemarks(orderData.remarks || "");
    }
  }, [isOpen, orderData]);

  const handleSubmit = () => {
    onSave({
      poNo,
      priority,
      plannedStart,
      plannedEnd,
      remarks
    });
    onClose();
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Order Information"
      width="640px"
      footer={
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <Button variant="outlined" size="large" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="filled" size="large" style={{ flex: 1 }} onClick={handleSubmit}>
            Save Changes
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Purchase Order Number */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "14px", fontWeight: "var(--font-weight-regular)", color: "var(--neutral-on-surface-primary)" }}>
            Purchase Order Number
          </label>
          <input
            type="text"
            value={poNo}
            onChange={(e) => setPoNo(e.target.value)}
            onFocus={() => setIsFocusedOrderNo(true)}
            onBlur={() => setIsFocusedOrderNo(false)}
            placeholder="Enter Purchase Order Number"
            style={{
              height: "44px",
              border: `1px solid ${isFocusedOrderNo ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-1)"}`,
              boxShadow: isFocusedOrderNo ? "0 0 0 3px rgba(0, 104, 255, 0.08)" : "none",
              borderRadius: "12px",
              padding: "0 16px",
              fontSize: "var(--text-subtitle-1)",
              color: "var(--neutral-on-surface-primary)",
              outline: "none",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease"
            }}
          />
        </div>

        {/* Priority */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "14px", fontWeight: "var(--font-weight-regular)", color: "var(--neutral-on-surface-primary)" }}>
            Priority
          </label>
          <DropdownSelect
            value={priority}
            onChange={(val) => setPriority(val)}
            options={[
              { value: "Low", label: "Low" },
              { value: "Normal", label: "Normal" },
              { value: "High", label: "High" }
            ]}
            placeholder="Select Priority"
            fieldHeight="44px"
            borderRadius="12px"
          />
        </div>

        {/* Planned Start & End Dates as 2 separate fields using our DateInputControl picker */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: "var(--font-weight-regular)", color: "var(--neutral-on-surface-primary)" }}>
              Planned Start Date
            </label>
            <DateInputControl
              value={plannedStart}
              onChange={(e) => setPlannedStart(e.target.value)}
              placeholder="yyyy-mm-dd"
              fieldHeight="44px"
              borderRadius="12px"
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: "var(--font-weight-regular)", color: "var(--neutral-on-surface-primary)" }}>
              Planned End Date
            </label>
            <DateInputControl
              value={plannedEnd}
              onChange={(e) => setPlannedEnd(e.target.value)}
              placeholder="yyyy-mm-dd"
              fieldHeight="44px"
              borderRadius="12px"
            />
          </div>
        </div>

        {/* Remarks with 1000 char max counter */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: "14px", fontWeight: "var(--font-weight-regular)", color: "var(--neutral-on-surface-primary)" }}>
              Remarks
            </label>
            <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>
              {(remarks || "").length}/1000
            </span>
          </div>
          <textarea
            value={remarks}
            onChange={(e) => {
              if (e.target.value.length <= 1000) {
                setRemarks(e.target.value);
              }
            }}
            onFocus={() => setIsFocusedRemarks(true)}
            onBlur={() => setIsFocusedRemarks(false)}
            placeholder="Enter remarks..."
            style={{
              height: "120px",
              border: `1px solid ${isFocusedRemarks ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-1)"}`,
              boxShadow: isFocusedRemarks ? "0 0 0 3px rgba(0, 104, 255, 0.08)" : "none",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "var(--text-subtitle-1)",
              color: "var(--neutral-on-surface-primary)",
              outline: "none",
              resize: "none",
              fontFamily: "inherit",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease"
            }}
          />
        </div>
      </div>
    </GeneralModal>
  );
};

const CancelOrderModal = ({ isOpen, onClose, onSubmit }) => {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setComment("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!comment.trim()) {
      setError("Field cannot be empty");
      return;
    }
    onSubmit(comment);
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setError("");
      }}
      title="Cancel Order"
      width="440px"
      footer={
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <Button
            variant="outlined"
            size="large"
            style={{ flex: 1 }}
            onClick={() => {
              onClose();
              setError("");
            }}
          >
            Back
          </Button>
          <Button
            variant="danger-filled"
            size="large"
            style={{ flex: 1 }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ color: "var(--status-red-primary)", fontSize: "var(--text-body)" }}>*</span>
              <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                Cancellation Reason
              </span>
            </div>
            <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>
              {comment.length}/400
            </span>
          </div>
          <textarea
            value={comment}
            maxLength={400}
            onChange={(e) => {
              setComment(e.target.value);
              if (error) setError("");
            }}
            placeholder="Add a reason for canceling this order."
            style={{
              minHeight: "120px",
              border: error
                ? "1px solid var(--status-red-primary)"
                : "1px solid var(--neutral-line-separator-2)",
              borderRadius: "12px",
              padding: "12px 16px",
              background: "var(--neutral-surface-primary)",
              fontSize: "var(--text-subtitle-1)",
              color: "var(--neutral-on-surface-primary)",
              width: "100%",
              outline: "none",
              fontFamily: "inherit",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          {error && (
            <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>
              {error}
            </span>
          )}
        </div>
      </div>
    </GeneralModal>
  );
};

const UpdateStatusModal = ({ isOpen, onClose, currentStatus, onSubmit }) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus, isOpen]);

  const handleSubmit = () => {
    onSubmit(selectedStatus);
  };

  const statusOptions = [
    { value: "Confirmed", label: "Confirmed" },
    { value: "In Progress", label: "In Progress" },
    { value: "Ready to Ship", label: "Ready to Ship" },
    { value: "On Shipping", label: "On Shipping" }
  ];

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Order Status"
      width="440px"
      footer={
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <Button variant="outlined" size="large" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="filled" size="large" style={{ flex: 1 }} onClick={handleSubmit}>
            Save Changes
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "14px", fontWeight: "var(--font-weight-regular)", color: "var(--neutral-on-surface-primary)" }}>
            Select Status
          </label>
          <DropdownSelect
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            options={statusOptions}
            placeholder="Select Status"
            fieldHeight="44px"
            borderRadius="12px"
          />
        </div>
      </div>
    </GeneralModal>
  );
};

const AskRevisionModal = ({ isOpen, onClose, onSubmit }) => {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setComment("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!comment.trim()) {
      setError("Field cannot be empty");
      return;
    }
    onSubmit(comment);
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setError("");
      }}
      title="Ask for Revision"
      width="440px"
      footer={
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <Button
            variant="outlined"
            size="large"
            style={{ flex: 1 }}
            onClick={() => {
              onClose();
              setError("");
            }}
          >
            Back
          </Button>
          <Button
            variant="filled"
            size="large"
            style={{ flex: 1 }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ color: "var(--status-red-primary)", fontSize: "var(--text-body)" }}>*</span>
              <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                Revision Reason
              </span>
            </div>
            <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>
              {comment.length}/400
            </span>
          </div>
          <textarea
            value={comment}
            maxLength={400}
            onChange={(e) => {
              setComment(e.target.value);
              if (error) setError("");
            }}
            placeholder="Add a comment or note for the revision."
            style={{
              minHeight: "120px",
              border: error
                ? "1px solid var(--status-red-primary)"
                : "1px solid var(--neutral-line-separator-2)",
              borderRadius: "12px",
              padding: "12px 16px",
              background: "var(--neutral-surface-primary)",
              fontSize: "var(--text-subtitle-1)",
              color: "var(--neutral-on-surface-primary)",
              width: "100%",
              outline: "none",
              fontFamily: "inherit",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          {error && (
            <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>
              {error}
            </span>
          )}
        </div>
      </div>
    </GeneralModal>
  );
};

const ApproveConfirmationModal = ({ isOpen, onClose, onSubmit, requireComment }) => {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setComment("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (requireComment && !comment.trim()) {
      setError("Field cannot be empty");
      return;
    }
    onSubmit(comment);
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setError("");
      }}
      title="Approve Order?"
      width="440px"
      footer={
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <Button
            variant="outlined"
            size="large"
            style={{ flex: 1 }}
            onClick={() => {
              onClose();
              setError("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            size="large"
            style={{ flex: 1 }}
            onClick={handleSubmit}
          >
            Yes, Approve
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {requireComment && <span style={{ color: "var(--status-red-primary)", fontSize: "var(--text-body)" }}>*</span>}
              <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                Approval Reason
              </span>
            </div>
            <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>
              {comment.length}/400
            </span>
          </div>
          <textarea
            value={comment}
            maxLength={400}
            onChange={(e) => {
              setComment(e.target.value);
              if (error) setError("");
            }}
            placeholder="Add a comment or note for the approval."
            style={{
              minHeight: "120px",
              border: error
                ? "1px solid var(--status-red-primary)"
                : "1px solid var(--neutral-line-separator-2)",
              borderRadius: "12px",
              padding: "12px 16px",
              background: "var(--neutral-surface-primary)",
              fontSize: "var(--text-subtitle-1)",
              color: "var(--neutral-on-surface-primary)",
              width: "100%",
              outline: "none",
              fontFamily: "inherit",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          {error && (
            <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>
              {error}
            </span>
          )}
        </div>
      </div>
    </GeneralModal>
  );
};

const CompleteConfirmationModal = ({ isOpen, onClose, onSubmit }) => {
  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Mark Order as Completed?"
      width="400px"
      description="Once this order is marked as completed, its information can no longer be edited."
      footer={
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <Button variant="outlined" size="large" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="filled" size="large" style={{ flex: 1 }} onClick={onSubmit}>
            Yes, Confirm
          </Button>
        </div>
      }
    />
  );
};

const SubmitConfirmationModal = ({ isOpen, onClose, onSubmit }) => {
  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Order?"
      width="400px"
      description="Are you sure you want to submit this order?"
      footer={
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <Button variant="outlined" size="large" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="filled" size="large" style={{ flex: 1 }} onClick={onSubmit}>
            Yes, Submit
          </Button>
        </div>
      }
    />
  );
};

const MaterialsTab = ({ orderNo, onNavigate, showSnackbar, initialData }) => {
  const [materialsData, setMaterialsData] = useState(MOCK_ORDER_MATERIALS_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterTriggerRect, setFilterTriggerRect] = useState(null);
  const [showBreakdownDrawer, setShowBreakdownDrawer] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [drawerTab, setDrawerTab] = useState("Calculation");
  const [expandedDemand, setExpandedDemand] = useState(false);
  const [expandedIncomingPO, setExpandedIncomingPO] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [isNewPOModalOpen, setIsNewPOModalOpen] = useState(false);
  const [selectionError, setSelectionError] = useState("");

  const [hoveredSku, setHoveredSku] = useState(null);

  const handleAddMaterialsToPO = (addedItems) => {
    setMaterialsData(prev => prev.map(m => {
      const added = addedItems.find(item => String(item.id) === String(m.id));
      if (added) {
        return {
          ...m,
          incomingPO: (m.incomingPO || 0) + added.qty,
          incomingPOBreakdown: [
            ...(m.incomingPOBreakdown || []),
            { poNo: "PO-NEW", qty: added.qty }
          ]
        };
      }
      return m;
    }));
    setSelectedRowIds([]);
  };

  const metrics = useMemo(() => {
    return {
      totalMaterials: materialsData.length,
      shortageItems: materialsData.filter(m => m.status === "Shortage" && (m.remaining - m.availableStock) > 0).length,
      totalShortageQty: materialsData.filter(m => m.status === "Shortage").reduce((acc, m) => acc + Math.max(0, m.remaining - m.availableStock), 0),
      incomingPoQty: materialsData.reduce((acc, m) => acc + (m.incomingPO || 0), 0)
    };
  }, [materialsData]);

  const filteredData = useMemo(() => {
    let result = [...materialsData];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q)
      );
    }
    if (statusFilter.length > 0) {
      result = result.filter(m => statusFilter.includes(m.status));
    }
    return result;
  }, [searchQuery, statusFilter, materialsData]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const visibleData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const statusOptions = ["Shortage", "Covered"];

  const handleFilterToggle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFilterTriggerRect(rect);
    setIsFilterOpen(!isFilterOpen);
  };

  const toggleStatus = (status) => {
    setStatusFilter(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const handleRowClick = (material) => {
    setSelectedMaterial(material);
    setShowBreakdownDrawer(true);
  };

  const gridTemplate = "48px 2fr 2fr 1.5fr 1fr 1fr";
  const rowHeight = 72;

  return (
    <div style={{ width: "100%", background: "var(--neutral-background-primary)", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
        {[
          { label: "Total Materials", value: metrics.totalMaterials, icon: <Box /> },
          { label: "Shortage Items", value: metrics.shortageItems, icon: <Info /> },
          { label: "Total Shortage Qty", value: metrics.totalShortageQty, icon: <TrendingUp /> },
          { label: "Incoming PO Qty", value: metrics.incomingPoQty, icon: <UploadIcon /> }
        ].map((card, idx) => (
          <div key={idx} style={{ 
            background: "var(--neutral-surface-primary)", 
            borderRadius: "16px", 
            padding: "20px", 
            border: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "92px"
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontSize: "13px", color: "var(--neutral-on-surface-tertiary)", fontWeight: "500" }}>{card.label}</div>
              <div style={{ fontSize: "16px", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{card.value}</div>
            </div>
            <div style={{ 
              width: "36px", 
              height: "36px", 
              borderRadius: "50%", 
              background: "#F5F5F5", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              flexShrink: 0
            }}>
              {React.cloneElement(card.icon, { size: 18, color: "var(--neutral-on-surface-secondary)" })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        background: "var(--neutral-surface-primary)", 
        borderRadius: "var(--radius-card)", 
        border: "1px solid var(--neutral-line-separator-1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", gap: "16px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div onClick={handleFilterToggle}>
              <FilterPill label="Status" count={statusFilter.length} active={statusFilter.length > 0} isOpen={isFilterOpen} />
            </div>
            {isFilterOpen && (
              <>
                {createPortal(<div style={{ position: "fixed", inset: 0, zIndex: 14000 }} onClick={() => setIsFilterOpen(false)} />, document.body)}
                {createPortal(
                  <div style={{
                    position: "fixed",
                    top: `${filterTriggerRect.bottom + 8}px`,
                    left: `${filterTriggerRect.left}px`,
                    width: "240px",
                    background: "var(--neutral-surface-primary)",
                    border: "1px solid var(--neutral-line-separator-1)",
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    padding: "16px",
                    zIndex: 14001,
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>Status</span>
                      <button onClick={() => { setStatusFilter([]); setIsFilterOpen(false); }} style={{ background: "none", border: "none", color: "var(--status-red-primary)", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Remove Filter</button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {statusOptions.map(opt => (
                        <label key={opt} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
                          <Checkbox checked={statusFilter.includes(opt)} onChange={() => toggleStatus(opt)} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>,
                  document.body
                )}
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", position: "relative" }}>
            <TableSearchField value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Material Name, SKU" width="320px" />
            <div style={{ position: "relative" }}>
              <Button 
                variant="filled" 
                leftIcon={AddIcon} 
                onClick={() => {
                  if (selectedRowIds.length === 0) {
                    setSelectionError("Select a material first before add new purchase order.");
                  } else {
                    setSelectionError("");
                    setIsNewPOModalOpen(true);
                  }
                }}
              >
                New PO
              </Button>
            </div>
          </div>
        </div>

        {selectionError && (
          <div style={{ 
            padding: "0 24px 16px 24px",
            marginTop: "-8px"
          }}>
            <span style={{ color: "var(--status-red-primary)", fontSize: "12px" }}>
              {selectionError}
            </span>
          </div>
        )}

        <div style={{ height: "1px", background: "var(--neutral-line-separator-1)", width: "100%" }} />

        <div style={{ width: "100%", overflowX: "auto" }}>
          <div style={{ minWidth: "1000px", width: "100%" }}>
            <div style={{ display: "grid", gridTemplateColumns: gridTemplate, borderBottom: "1px solid var(--neutral-line-separator-1)", background: "var(--neutral-surface-primary)", alignItems: "center" }}>
              <div style={{ padding: "16px 12px 16px 24px", display: "flex", justifyContent: "center" }}>
                <Checkbox 
                  checked={selectedRowIds.length === visibleData.length && visibleData.length > 0} 
                  onChange={() => {
                    if (selectedRowIds.length === visibleData.length) {
                      setSelectedRowIds([]);
                    } else {
                      setSelectedRowIds(visibleData.map(m => m.id));
                    }
                  }} 
                />
              </div>
              <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Material</div>
              <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Used In</div>
              <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Progress</div>
              <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Available Stock</div>
              <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Status</div>
            </div>
            <div>
              {visibleData.length > 0 ? visibleData.map((m, idx) => {
                return (
                  <div 
                    key={idx} 
                    onMouseEnter={() => setHoveredSku(m.sku)}
                    onMouseLeave={() => setHoveredSku(null)}
                    onClick={() => handleRowClick(m)}
                    style={{ 
                      display: "grid", 
                      gridTemplateColumns: gridTemplate, 
                      minHeight: `${rowHeight}px`, 
                      alignItems: "center", 
                      borderBottom: "1px solid var(--neutral-line-separator-1)", 
                      transition: "background 0.2s ease", 
                      cursor: "pointer", 
                      width: "100%",
                      background: hoveredSku === m.sku ? "var(--neutral-surface-grey-lighter)" : "transparent"
                    }}
                  >
                    <div 
                      style={{ padding: "12px 12px 12px 24px", display: "flex", justifyContent: "center" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox 
                        checked={selectedRowIds.includes(m.id)} 
                        onChange={() => {
                          setSelectedRowIds(prev => 
                            prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id]
                          );
                        }} 
                      />
                    </div>
                    <div 
                      style={{ padding: "12px 12px 12px 0", display: "flex", alignItems: "center", gap: "12px" }}
                    >
                      <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--neutral-surface-grey-lighter)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Box size={20} color="var(--neutral-on-surface-tertiary)" />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</span>
                        <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>{m.sku}</span>
                      </div>
                    </div>
                    <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      {m.usedIn.map((use, uIdx) => (
                        <div key={uIdx} style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                          {use.product} <span style={{ color: "var(--neutral-on-surface-tertiary)", fontWeight: "var(--font-weight-regular)" }}>({use.wo})</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ height: "8px", background: "#F5F5F5", borderRadius: "100px", overflow: "hidden", width: "100%" }}>
                        <div style={{
                          height: "100%",
                          width: `${(m.received / m.demand) * 100}%`,
                          background: "#52BD44",
                          borderRadius: "100px",
                        }} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                        <div>
                          <div style={{ fontSize: "10px", color: "var(--neutral-on-surface-tertiary)", marginBottom: "2px" }}>Received</div>
                          <div style={{ fontSize: "12px", fontWeight: "var(--font-weight-bold)", color: "#52BD44" }}>{m.received} {m.uom}</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "10px", color: "var(--neutral-on-surface-tertiary)", marginBottom: "2px" }}>Remaining</div>
                          <div style={{ fontSize: "12px", fontWeight: "var(--font-weight-bold)", color: m.remaining > 0 ? "var(--status-red-primary)" : "var(--neutral-on-surface-primary)" }}>{m.remaining} {m.uom}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "10px", color: "var(--neutral-on-surface-tertiary)", marginBottom: "2px" }}>Demand</div>
                          <div style={{ fontSize: "12px", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{m.demand} {m.uom}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: "12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-regular)", color: "var(--neutral-on-surface-primary)" }}>{m.availableStock} {m.uom}</div>
                    <div style={{ padding: "12px" }}>
                      <StatusBadge variant={m.sVariant}>
                        {m.status === "Shortage" ? `${m.status}: ${Math.max(0, m.remaining - m.availableStock)} ${m.uom}` : m.status}
                      </StatusBadge>
                    </div>
                  </div>
                );
              }) : <div style={{ padding: "40px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)" }}>No results found.</div>}
            </div>
          </div>
        </div>
        <div style={{ padding: "0 4px" }}>
          <TablePaginationFooter 
            currentPage={currentPage} 
            totalPages={totalPages} 
            rowsPerPage={rowsPerPage} 
            totalRows={filteredData.length} 
            onPageChange={setCurrentPage} 
            onRowsPerPageChange={setRowsPerPage}
            renderLeftActions={() => (
              <Button variant="outlined" size="small" leftIcon={DownloadIcon} onClick={() => {}}>Download</Button>
            )}
          />
        </div>
      </div>

      {showBreakdownDrawer && selectedMaterial && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)", display: "flex", justifyContent: "flex-end", zIndex: 20000 }} onClick={() => setShowBreakdownDrawer(false)}>
          <div style={{ position: "absolute", inset: 0 }} onClick={() => setShowBreakdownDrawer(false)} />
          <div style={{ width: "800px", height: "100%", background: "var(--neutral-surface-primary)", position: "relative", display: "flex", flexDirection: "column", animation: "slideInRight 0.3s ease-out" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--neutral-line-separator-1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Material Breakdown</h2>
              <IconButton icon={CloseIcon} onClick={() => setShowBreakdownDrawer(false)} size="small" color="var(--neutral-on-surface-primary)" />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--neutral-surface-grey-lighter)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Box size={24} color="var(--neutral-on-surface-tertiary)" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "var(--text-title-3)", fontWeight: "bold" }}>{selectedMaterial.name}</span>
                    <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-tertiary)" }}>{selectedMaterial.sku}</span>
                  </div>
                </div>
                <StatusBadge variant={selectedMaterial.sVariant}>
                  {selectedMaterial.status === "Shortage" ? `${selectedMaterial.status}: ${Math.max(0, selectedMaterial.remaining - selectedMaterial.availableStock)} ${selectedMaterial.uom}` : selectedMaterial.status}
                </StatusBadge>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
                {["Calculation", "Work Orders"].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setDrawerTab(tab)}
                    style={{
                      ...tabButtonStyle(drawerTab === tab),
                      height: "36px",
                      padding: "0 16px",
                      fontSize: "14px"
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div>
                {drawerTab === "Calculation" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div 
                            style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            onClick={() => setExpandedDemand(!expandedDemand)}
                          >
                            {expandedDemand ? <ChevronDownIcon size={16} color="var(--neutral-on-surface-tertiary)" /> : <ChevronRightIcon size={16} color="var(--neutral-on-surface-tertiary)" />}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>Demand</span>
                            <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Total material quantity needed across all work orders</span>
                          </div>
                        </div>
                        <span style={{ fontWeight: "bold", fontSize: "16px", color: "var(--neutral-on-surface-primary)" }}>
                          {Math.max(selectedMaterial.demandBreakdown?.bom || 0, selectedMaterial.demandBreakdown?.wo || 0) || selectedMaterial.demand} {selectedMaterial.uom}
                        </span>
                      </div>
                      {expandedDemand && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "32px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "center" }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ color: "var(--neutral-on-surface-primary)" }}>Required in BOM</span>
                              <span style={{ fontSize: "11px", color: "var(--neutral-on-surface-tertiary)" }}>Quantity required based on the BOM calculation</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {selectedMaterial.demandBreakdown?.bom >= (selectedMaterial.demandBreakdown?.wo || 0) && (
                                <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)", fontStyle: "italic" }}>Marked as demand (largest)</span>
                              )}
                              <span style={{ fontWeight: "bold", color: "var(--neutral-on-surface-secondary)" }}>{selectedMaterial.demandBreakdown?.bom || 0} {selectedMaterial.uom}</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "center" }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ color: "var(--neutral-on-surface-primary)" }}>Requested in WO</span>
                              <span style={{ fontSize: "11px", color: "var(--neutral-on-surface-tertiary)" }}>Quantity requested in active work orders</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {selectedMaterial.demandBreakdown?.wo > (selectedMaterial.demandBreakdown?.bom || 0) && (
                                <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)", fontStyle: "italic" }}>Marked as demand (largest)</span>
                              )}
                              <span style={{ fontWeight: "bold", color: "var(--neutral-on-surface-secondary)" }}>{selectedMaterial.demandBreakdown?.wo || 0} {selectedMaterial.uom}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", marginLeft: "24px" }}>
                        <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>Received by Production</span>
                        <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Quantity already issued to the production floor</span>
                      </div>
                      <span style={{ fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>{selectedMaterial.received} {selectedMaterial.uom}</span>
                    </div>
                    <div style={{ position: "relative", height: "1px", background: "var(--neutral-line-separator-1)", margin: "4px 0" }}>
                      <span style={{ position: "absolute", right: "-12px", top: "-11px", fontWeight: "bold", fontSize: "20px", lineHeight: "1" }}>-</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", marginLeft: "24px" }}>
                        <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>Remaining</span>
                        <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Quantity still needed to complete production demand</span>
                      </div>
                      <span style={{ fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>{selectedMaterial.remaining} {selectedMaterial.uom}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", marginLeft: "24px" }}>
                        <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>Available Stock</span>
                        <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Quantity currently available in warehouse stock</span>
                      </div>
                      <span style={{ fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>{selectedMaterial.availableStock} {selectedMaterial.uom}</span>
                    </div>
                    <div style={{ position: "relative", height: "1px", background: "var(--neutral-line-separator-1)", margin: "4px 0" }}>
                      <span style={{ position: "absolute", right: "-12px", top: "-11px", fontWeight: "bold", fontSize: "20px", lineHeight: "1" }}>-</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", marginLeft: "24px" }}>
                        <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>Stock Balance</span>
                        <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Additional quantity needed after current stock is calculated</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)", fontStyle: "italic" }}>
                          {selectedMaterial.remaining - selectedMaterial.availableStock > 0 ? "Shortage" : "Covered"}
                        </span>
                        <span style={{ fontWeight: "bold", color: selectedMaterial.remaining - selectedMaterial.availableStock > 0 ? "var(--status-red-primary)" : "var(--status-green-primary)" }}>
                          {selectedMaterial.remaining - selectedMaterial.availableStock} {selectedMaterial.uom}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {selectedMaterial.incomingPOBreakdown?.length > 0 ? (
                            <div 
                              style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                              onClick={() => setExpandedIncomingPO(!expandedIncomingPO)}
                            >
                              {expandedIncomingPO ? <ChevronDownIcon size={16} color="var(--neutral-on-surface-tertiary)" /> : <ChevronRightIcon size={16} color="var(--neutral-on-surface-tertiary)" />}
                            </div>
                          ) : (
                            <div style={{ width: "16px" }} />
                          )}
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>Incoming PO</span>
                            <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Quantity expected to arrive from open purchase orders</span>
                          </div>
                        </div>
                        <span style={{ fontWeight: "bold", color: "var(--feature-brand-primary)" }}>
                          {(selectedMaterial.incomingPOBreakdown || []).reduce((acc, po) => acc + po.qty, 0)} {selectedMaterial.uom}
                        </span>
                      </div>
                      {expandedIncomingPO && selectedMaterial.incomingPOBreakdown?.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "32px" }}>
                          {selectedMaterial.incomingPOBreakdown.map((po, idx) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                              <span 
                                style={{ 
                                  color: "var(--feature-brand-primary)",
                                  cursor: "pointer",
                                  fontWeight: "bold"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                                onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                                onClick={() => onNavigate("po_detail", { poNumber: po.poNo })}
                              >
                                {po.poNo}
                              </span>
                              <span style={{ fontWeight: "bold", color: "var(--neutral-on-surface-secondary)" }}>{po.qty} {selectedMaterial.uom}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr 1fr 1fr 1fr", borderBottom: "1px solid var(--neutral-line-separator-1)", padding: "12px 0", gap: "16px" }}>
                      <div style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>Work Order No</div>
                      <div style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>Product</div>
                      <div style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>Required in BOM</div>
                      <div style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>Requested in WO</div>
                      <div style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>Received</div>
                    </div>
                    {selectedMaterial.usedIn.map((use, idx) => (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr 1fr 1fr 1fr", borderBottom: "1px solid var(--neutral-line-separator-1)", padding: "16px 0", gap: "16px", alignItems: "center" }}>
                        <div 
                          style={{ fontSize: "14px", fontWeight: "bold", color: "var(--feature-brand-primary)", cursor: "pointer", transition: "text-decoration 0.2s" }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                        >
                          {use.wo}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "4px", background: "var(--neutral-surface-grey-lighter)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                            {use.image ? <img src={use.image} alt={use.product} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Box size={16} color="var(--neutral-on-surface-tertiary)" />}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                            <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{use.product}</span>
                            <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>{use.productSku}</span>
                          </div>
                        </div>
                        <div style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)" }}>{use.bom} {selectedMaterial.uom}</div>
                        <div style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)" }}>{use.woQty} {selectedMaterial.uom}</div>
                        <div style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)", fontWeight: "normal" }}>{use.received} {selectedMaterial.uom}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <NewPOModal 
        isOpen={isNewPOModalOpen} 
        onClose={() => setIsNewPOModalOpen(false)}
        selectedMaterials={materialsData.filter(m => selectedRowIds.includes(m.id))}
        onNavigate={onNavigate}
        showSnackbar={showSnackbar}
        onAddSuccess={handleAddMaterialsToPO}
        initialData={initialData}
      />
    </div>
  );
};

export const OrderDetailPage = ({ onNavigate, initialData, showSnackbar, isSidebarCollapsed, orderApprovalSettings }) => {
  const [activeTab, setActiveTab] = useState(initialData?.activeTab || "products");

  const [orderData, setOrderData] = useState(initialData || {});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const allWorkOrdersCompleted = React.useMemo(() => {
    let rawData = MOCK_WO_TABLE_DATA.filter(wo => wo.ord === orderData.orderNo);
    if (rawData.length === 0) {
      rawData = MOCK_WO_TABLE_DATA.slice(0, 15).map(wo => ({
        ...wo,
        ord: orderData.orderNo
      }));
    }
    return rawData.length > 0 && rawData.every(wo => wo.status === "Completed");
  }, [orderData.orderNo]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Completed":
        return "green";
      case "Confirmed":
      case "In Progress":
      case "Ready to Ship":
      case "On Shipping":
        return "blue";
      case "Canceled":
        return "red";
      case "Waiting for Approval":
        return "orange";
      case "Need Revision":
        return "yellow";
      default:
        return "grey";
    }
  };

  const handleUpdateStatus = (nextStatus, additionalFields = {}) => {
    const targetOrderIndex = MOCK_ORDER_TABLE_DATA.findIndex(o => o.orderNo === orderData.orderNo);
    const sBadge = getStatusBadgeVariant(nextStatus);

    if (targetOrderIndex !== -1) {
      MOCK_ORDER_TABLE_DATA[targetOrderIndex] = {
        ...MOCK_ORDER_TABLE_DATA[targetOrderIndex],
        status: nextStatus,
        sBadge,
        ...additionalFields
      };
    }

    setOrderData(prev => ({
      ...prev,
      status: nextStatus,
      sBadge,
      ...additionalFields
    }));

    if (showSnackbar) {
      showSnackbar("Order status successfully updated", "success");
    }
  };

  useEffect(() => {
    if (initialData) {
      setOrderData(initialData);
    }
  }, [initialData]);

  // Logs Dynamic Logic
  const approvalEnabled = orderApprovalSettings?.isApprovalActive || false;
  const requestedBy = orderData?.createdBy || "Joko";
  const requestedAt = orderData?.createdAt || "2026-03-25";
  const approverList = [
    { id: 1, name: "Admin", email: "admin@company.com" }
  ];

  const getApprovalRowStatus = () => {
    switch (orderData?.status) {
      case "Waiting for Approval":
      case "Not Started":
        return { text: "Pending", variant: "grey-light" };
      case "Need Revision":
        return { text: "Needs Revision", variant: "orange" };
      case "Canceled":
        return { text: "Rejected", variant: "red" };
      default:
        return { text: "Approved", variant: "green" };
    }
  };

  const getApprovalRowComment = () => {
    if (orderData?.status === "Need Revision") return orderData?.revisionMessage || "Please revise the order.";
    if (orderData?.status === "Canceled") return orderData?.canceledMessage || "Order has been canceled.";
    return "-";
  };

  const dynamicActivityLogs = React.useMemo(() => {
    const logs = [];

    if (orderData?.status === "Completed") {
      logs.push({
        name: "System",
        email: "-",
        title: "Completed",
        timestamp: `${orderData?.plannedEnd || "2026-05-05"} at 16:00`
      });
    }

    if (orderData?.status === "On Shipping" || orderData?.status === "Completed") {
      logs.push({
        name: "System",
        email: "-",
        title: "On Shipping",
        timestamp: `${orderData?.plannedStart || "2026-05-01"} at 10:00`
      });
    }

    if (orderData?.status === "Ready to Ship" || orderData?.status === "On Shipping" || orderData?.status === "Completed") {
      logs.push({
        name: "System",
        email: "-",
        title: "Ready to Ship",
        timestamp: `${orderData?.createdAt || "2026-04-01"} at 14:00`
      });
    }

    if (
      orderData?.status === "Confirmed" ||
      orderData?.status === "In Progress" ||
      orderData?.status === "Ready to Ship" ||
      orderData?.status === "On Shipping" ||
      orderData?.status === "Completed"
    ) {
      const approveLog = {
        name: approverList[0]?.name || "Approver",
        email: approverList[0]?.email || "-",
        title: "Approved",
        timestamp: `${orderData?.createdAt || "2026-04-01"} at 09:30`
      };
      if (orderData?.approveMessage) approveLog.desc = orderData.approveMessage;
      logs.push(approveLog);
    }

    if (orderData?.status === "Need Revision") {
      const revLog = {
        name: approverList[0]?.name || "Approver",
        email: approverList[0]?.email || "-",
        title: "Ask for Revision",
        timestamp: `${orderData?.createdAt || "2026-04-01"} at 09:30`
      };
      if (orderData?.revisionMessage) revLog.desc = orderData.revisionMessage;
      logs.push(revLog);
    }

    if (orderData?.status === "Canceled") {
      const cancelLog = {
        name: approverList[0]?.name || "Approver",
        email: approverList[0]?.email || "-",
        title: "Canceled",
        timestamp: `${orderData?.createdAt || "2026-04-01"} at 09:30`
      };
      if (orderData?.canceledMessage) cancelLog.desc = orderData.canceledMessage;
      logs.push(cancelLog);
    }

    logs.push({
      name: orderData?.createdBy || "User",
      email: "-", 
      title: "Submitted",
      timestamp: `${orderData?.createdAt || "2026-04-01"} at 09:00`
    });

    return logs;
  }, [orderData]);

  const handleSaveOrderDetails = (updatedFields) => {
    // 1. Update mock database array so changes persist globally across list / detail page navigation
    const targetOrderIndex = MOCK_ORDER_TABLE_DATA.findIndex(o => o.orderNo === orderData.orderNo);
    if (targetOrderIndex !== -1) {
      const p = updatedFields.priority;
      const pVariant = p === "High" ? "red-light" : (p === "Normal" || p === "Medium") ? "orange-light" : "grey-light";
      
      MOCK_ORDER_TABLE_DATA[targetOrderIndex] = {
        ...MOCK_ORDER_TABLE_DATA[targetOrderIndex],
        poNo: updatedFields.poNo,
        priority: p,
        pVariant,
        plannedStart: updatedFields.plannedStart,
        plannedEnd: updatedFields.plannedEnd,
        remarks: updatedFields.remarks
      };
    }

    // 2. Update local state to trigger a re-render immediately
    setOrderData(prev => {
      const p = updatedFields.priority;
      const pVariant = p === "High" ? "red-light" : (p === "Normal" || p === "Medium") ? "orange-light" : "grey-light";
      return {
        ...prev,
        poNo: updatedFields.poNo,
        priority: p,
        pVariant,
        plannedStart: updatedFields.plannedStart,
        plannedEnd: updatedFields.plannedEnd,
        remarks: updatedFields.remarks
      };
    });

    if (showSnackbar) {
      showSnackbar("Order details successfully updated", "success");
    }
  };

  const shipmentCode = orderData.shipmentCode || `SHP-${orderData.orderNo?.split('-').slice(1).join('-') || "202604-001"}`;

  const tabs = [
    { key: "products", label: "Products" },
    { key: "materials", label: "Materials" },
    { key: "traceability", label: "Traceability" },
    { key: "invoices", label: "Invoices" },
    { key: "attachments", label: "Attachments" },
    { key: "logs", label: "Logs" },
  ];

  const handleBackNavigation = () => onNavigate("list");

  return (
    <div style={{ padding: "24px 24px 100px 24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header & Breadcrumb */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              cursor: "pointer",
              marginLeft: "-4px" 
            }}
            onClick={handleBackNavigation}
          >
            <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
            <h1 style={{ 
              margin: 0, 
              fontSize: "var(--text-large-title)", 
              fontWeight: "var(--font-weight-bold)" 
            }}>
              Order Detail
            </h1>
          </div>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            fontSize: "var(--text-title-3)",
            marginLeft: "32px" 
          }}>
            <span 
              onClick={handleBackNavigation} 
              style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }}
            >
              Orders
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>Order Detail</span>
          </div>
        </div>
        {orderData.status !== "Completed" && orderData.status !== "Canceled" && (
          <Button variant="outlined" leftIcon={EditIcon} onClick={() => setIsEditModalOpen(true)}>
            Edit Order
          </Button>
        )}
      </div>

      {/* Revision or Cancellation Comment Section */}
      {(orderData.status === "Need Revision" || orderData.status === "Canceled") && (
        <div
          style={{
            border: `1px solid ${
              orderData.status === "Need Revision" ? "#F5B342" : "#E04B45"
            }`,
            background:
              orderData.status === "Need Revision" ? "#F8EFDF" : "#F8E6E8",
            borderRadius: "16px",
            padding: "20px 24px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <Info
            size={16}
            strokeWidth={2.1}
            color={
              orderData.status === "Need Revision"
                ? "var(--status-orange-primary)"
                : "var(--status-red-primary)"
            }
            style={{ flexShrink: 0, marginTop: "2px" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{
                fontSize: "var(--text-title-2)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
              }}
            >
              {orderData.status === "Need Revision"
                ? "Revision Requested"
                : "Order Canceled"}
            </span>
            <span
              style={{
                fontSize: "var(--text-title-3)",
                color: "var(--neutral-on-surface-primary)",
                lineHeight: "1.6",
              }}
            >
              {orderData.status === "Need Revision"
                ? orderData.revisionMessage || "Please revise the order information."
                : orderData.canceledMessage || "This order has been canceled."}
            </span>
          </div>
        </div>
      )}

      {/* Order Information Section */}
      <div style={{ 
        background: "var(--neutral-surface-primary)", 
        borderRadius: "var(--radius-card)", 
        border: "1px solid var(--neutral-line-separator-1)",
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "24px 24px 16px 24px" 
        }}>
          <span style={{ 
            fontSize: "var(--text-headline)", 
            fontWeight: "var(--font-weight-bold)",
            color: "var(--neutral-on-surface-primary)"
          }}>
            {orderData.orderNo || "ORD-000000"}
          </span>
          <StatusBadge variant={orderData.sBadge || "grey"}>{orderData.status || "Draft"}</StatusBadge>
        </div>
        
        <div style={{ margin: "0 24px", height: "1px", background: "var(--neutral-line-separator-1)" }} />

        <div style={{ 
          padding: "24px",
          display: "grid", 
          gridTemplateColumns: "repeat(4, 1fr)", 
          gap: "24px 32px" 
        }}>
          {/* Row 1 */}
          <LabelValue 
            label="Quote No" 
            value={orderData.quoteNo} 
            isClickable={true} 
            onClick={() => onNavigate("quote_detail", { quoteNo: orderData.quoteNo })} 
          />
          <LabelValue label="Purchase Order No" value={orderData.poNo || "-"} />
          <LabelValue label="Created By" value={orderData.createdBy} />
          <LabelValue label="Priority" badge={{ text: orderData.priority, variant: orderData.pVariant }} />

          {/* Row 2 */}
          <LabelValue label="Planned Start Date" value={orderData.plannedStart} />
          <LabelValue label="Planned End Date" value={orderData.plannedEnd} />
          <LabelValue label="Actual Start Date" value={orderData.actualStart || "-"} />
          <LabelValue label="Actual End Date" value={orderData.actualEnd || "-"} />

          {/* Row 3 */}
          <LabelValue label="Customer Name" value={orderData.customerName} />
          <LabelValue 
            label="Shipment Code" 
            value={shipmentCode} 
            isClickable={true} 
            onClick={() => onNavigate("shipment_detail", { shipmentCode })} 
          />
          <LabelValue label="Remarks" value={orderData.remarks || "-"} gridColumn="span 2" />
        </div>
      </div>

      {/* Tab Chips */}
      <div style={{ 
        display: "flex", 
        gap: "12px", 
        alignItems: "center" 
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={tabButtonStyle(activeTab === tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ 
        background: ["materials", "invoices", "traceability", "logs"].includes(activeTab) ? "transparent" : "var(--neutral-surface-primary)", 
        borderRadius: ["materials", "invoices", "traceability", "logs"].includes(activeTab) ? "0" : "var(--radius-card)", 
        border: ["materials", "invoices", "traceability", "logs"].includes(activeTab) ? "none" : "1px solid var(--neutral-line-separator-1)",
        overflow: "hidden"
      }}>
        {activeTab === "products" && (
          <WorkOrderTab orderNo={orderData.orderNo} orderStatus={orderData.status} onNavigate={onNavigate} />
        )}
        {activeTab === "materials" && (
          <MaterialsTab 
            orderNo={orderData.orderNo} 
            onNavigate={onNavigate} 
            showSnackbar={showSnackbar}
            initialData={initialData}
          />
        )}
        {activeTab === "traceability" && (
          <TraceabilityTab onNavigate={onNavigate} showSnackbar={showSnackbar} />
        )}
        {activeTab === "invoices" && (
          <InvoicesTab onNavigate={onNavigate} />
        )}
        {activeTab === "attachments" && (
          <AttachmentsTab onNavigate={onNavigate} showSnackbar={showSnackbar} />
        )}
        {activeTab === "logs" && (
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
        )}
      </div>
      <EditOrderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        orderData={orderData}
        onSave={handleSaveOrderDetails}
      />
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onSubmit={(reason) => {
          handleUpdateStatus("Canceled", { canceledMessage: reason });
          setIsCancelModalOpen(false);
        }}
      />
      <AskRevisionModal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        onSubmit={(reason) => {
          handleUpdateStatus("Need Revision", { revisionMessage: reason });
          setIsRevisionModalOpen(false);
        }}
      />
      <ApproveConfirmationModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        requireComment={orderApprovalSettings?.requireComment}
        onSubmit={(reason) => {
          handleUpdateStatus("Confirmed", { approveMessage: reason });
          setIsApproveModalOpen(false);
        }}
      />
      <UpdateStatusModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        currentStatus={orderData.status}
        onSubmit={(nextStatus) => {
          handleUpdateStatus(nextStatus);
          setIsUpdateModalOpen(false);
        }}
      />
      <CompleteConfirmationModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onSubmit={() => {
          handleUpdateStatus("Completed");
          setIsCompleteModalOpen(false);
        }}
      />
      <SubmitConfirmationModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={() => {
          handleUpdateStatus(approvalEnabled ? "Waiting for Approval" : "Confirmed");
          setIsSubmitModalOpen(false);
        }}
      />

      {/* Sticky Bottom Action Footer */}
      {orderData.status !== "Completed" && orderData.status !== "Canceled" && (
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
            gap: "16px",
            zIndex: 100,
          }}
        >
          {orderData.status === "Waiting for Approval" ? (
            <>
              {/* Reject (Secondary Red) */}
              <Button
                size="large"
                variant="outlined"
                onClick={() => setIsCancelModalOpen(true)}
                style={{ color: "var(--status-red-primary)", borderColor: "var(--status-red-primary)" }}
              >
                Reject
              </Button>

              {/* Ask for Revision (Secondary Outlined) */}
              <Button
                size="large"
                variant="outlined"
                onClick={() => setIsRevisionModalOpen(true)}
              >
                Ask for Revision
              </Button>

              {/* Approve (Primary) */}
              <Button
                size="large"
                variant="filled"
                onClick={() => setIsApproveModalOpen(true)}
              >
                Approve
              </Button>
            </>
          ) : (
            <>
              {/* Cancel Order (Secondary Red Button) */}
              <Button
                size="large"
                variant="outlined"
                onClick={() => setIsCancelModalOpen(true)}
                style={{ color: "var(--status-red-primary)", borderColor: "var(--status-red-primary)" }}
              >
                Cancel Order
              </Button>

              {/* Submit Order (Primary Button) for Draft / Not Started / Need Revision */}
              {["Draft", "Not Started", "Need Revision"].includes(orderData.status) && (
                <Button
                  size="large"
                  variant="filled"
                  onClick={() => setIsSubmitModalOpen(true)}
                >
                  Submit Order
                </Button>
              )}

              {/* Update Status (Secondary Button) */}
              {["Confirmed", "In Progress", "Ready to Ship", "On Shipping"].includes(orderData.status) && (
                <Button
                  size="large"
                  variant="outlined"
                  onClick={() => setIsUpdateModalOpen(true)}
                >
                  Update Status
                </Button>
              )}

              {/* Mark as Complete (Primary Button) */}
              {allWorkOrdersCompleted && (
                <Button
                  size="large"
                  variant="filled"
                  onClick={() => setIsCompleteModalOpen(true)}
                >
                  Mark as Complete
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
