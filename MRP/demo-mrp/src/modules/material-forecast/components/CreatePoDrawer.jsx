import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, CloseIcon, Plus, Trash2, ChevronDownIcon, CheckIcon, DeleteIcon, Info } from "../../../components/icons/Icons.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { FormField } from "../../../components/molecules/FormField.jsx";
import { InputField } from "../../../components/molecules/InputField.jsx";
import { DateInputControl } from "../../../components/molecules/DateInputControl.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { inputFrameStyle, inputControlStyle, baseInputBorderColor, focusInputFrame, blurInputFrame } from "../../../components/atoms/inputStyles.js";
import { createSyntheticInputEvent } from "../../../utils/upload/uploadUtils.js";
import { formatNumberWithCommas, parseNumberFromCommas } from "../../../utils/format/formatUtils.js";
import { MOCK_VENDORS } from "../../../data/vendors.js";
import { MOCK_VENDOR_LEAD_TIMES, MOCK_PROCUREMENT_STATUS } from "../mock/materialForecastMocks.js";
import { MOCK_MATERIALS_DATA } from "../../materials/mock/materialsMocks.js";
import { MOCK_PO_TABLE_DATA } from "../../purchase-order/mock/purchaseOrderMocks.js";

const BORDER = "1px solid var(--neutral-line-separator-1)";

// Field style matching WorkOrderDetailPage pattern
const fieldStyle = (disabled = false, hasValue = false, hasError = false) => ({
  height: "46px",
  padding: "0 16px",
  width: "100%",
  border: "none",
  background: "transparent",
  ...inputFrameStyle(disabled, hasError),
  ...inputControlStyle(disabled, hasValue),
});

// ── Vendor searchable dropdown ────────────────────────────────────────────────
const VendorSelect = ({ value, onChange, error }) => {
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0, placement: "bottom" });

  const selectedVendor = MOCK_VENDORS.find((v) => v.id === value) || null;
  const committedLabel = selectedVendor?.name || "";
  const filteredOptions = MOCK_VENDORS.filter((v) =>
    !query.trim() || v.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const updatePos = () => {
    if (!triggerRef.current || typeof window === "undefined") return;
    const rect = triggerRef.current.getBoundingClientRect();
    const shouldOpenAbove = window.innerHeight - rect.bottom < 280 + 16 && rect.top > 280 + 16;
    const maxLeft = Math.max(8, window.innerWidth - rect.width - 8);
    setPopoverPos({
      left: Math.min(Math.max(8, rect.left), maxLeft),
      top: shouldOpenAbove ? rect.top - 8 : rect.bottom + 8,
      width: rect.width,
      placement: shouldOpenAbove ? "top" : "bottom",
    });
  };

  const closeMenu = () => { setIsOpen(false); setIsFocused(false); setQuery(committedLabel); };

  useEffect(() => {
    if (!isOpen) return;
    updatePos();
    const handleDown = (e) => {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      closeMenu();
    };
    document.addEventListener("mousedown", handleDown);
    window.addEventListener("resize", updatePos);
    return () => { document.removeEventListener("mousedown", handleDown); window.removeEventListener("resize", updatePos); };
  }, [isOpen, committedLabel]);

  useEffect(() => { if (!isOpen) setQuery(committedLabel); }, [committedLabel, isOpen]);

  const selectOption = (vendor) => { onChange(vendor.id); setQuery(vendor.name); setIsOpen(false); setIsFocused(false); };

  return (
    <FormField label="Vendor Name" required error={error}>
      <div ref={triggerRef} style={{ position: "relative", width: "100%" }}>
        <input
          ref={inputRef}
          value={isOpen ? query : committedLabel}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => { setIsFocused(true); setIsOpen(true); setQuery(committedLabel); }}
          onClick={() => { setIsFocused(true); setIsOpen(true); }}
          onBlur={() => setTimeout(() => {
            if (!menuRef.current?.contains(document.activeElement)) closeMenu();
          }, 120)}
          placeholder="Type to search vendor"
          autoComplete="off"
          style={{
            ...fieldStyle(false, !!committedLabel || !!query, !!error),
            borderColor: error ? "var(--status-red-primary)" : isFocused || isOpen ? "var(--feature-brand-primary)" : baseInputBorderColor,
            boxShadow: isFocused || isOpen ? "0 0 0 3px rgba(0, 104, 255, 0.08)" : "none",
            padding: "0 48px 0 16px",
          }}
        />
        <ChevronDownIcon
          size={20}
          color="var(--neutral-on-surface-secondary)"
          style={{ position: "absolute", right: "16px", top: "50%", transform: `translateY(-50%) ${isOpen ? "rotate(180deg)" : "rotate(0deg)"}`, transition: "transform 0.2s ease", pointerEvents: "none" }}
        />
        {isOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 21019 }} onClick={closeMenu} />
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                left: `${popoverPos.left}px`,
                top: `${popoverPos.top}px`,
                width: `${popoverPos.width}px`,
                transform: popoverPos.placement === "top" ? "translateY(-100%)" : "none",
                background: "var(--neutral-surface-primary)",
                border: "1px solid var(--neutral-line-separator-1)",
                borderRadius: "12px",
                boxShadow: "0px 8px 20px rgba(27, 27, 27, 0.12)",
                overflow: "hidden",
                zIndex: 21020,
                maxHeight: "280px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ overflowY: "auto" }}>
                {filteredOptions.length > 0 ? filteredOptions.map((v, idx) => (
                  <div
                    key={v.id}
                    onClick={() => selectOption(v)}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "var(--neutral-surface-primary)"}
                    style={{
                      borderTop: idx === 0 ? "none" : BORDER, minHeight: "56px", padding: "0 18px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: "12px", cursor: "pointer",
                      fontSize: "var(--text-title-2)", color: "var(--neutral-on-surface-primary)",
                      background: "var(--neutral-surface-primary)",
                    }}
                  >
                    <span>{v.name}</span>
                    {v.id === value && <CheckIcon size={16} color="var(--feature-brand-primary)" />}
                  </div>
                )) : (
                  <div style={{ padding: "16px 18px", textAlign: "center", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-tertiary)" }}>
                    No vendors found
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </FormField>
  );
};

// ── Material dropdown ─────────────────────────────────────────────────────────
const MaterialSelect = ({ value, onChange, error }) => {
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0, placement: "bottom" });

  const selected = MOCK_MATERIALS_DATA.find((m) => m.id === value) || null;

  const updatePos = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const shouldOpenAbove = window.innerHeight - rect.bottom < 280 && rect.top > 280;
    const maxLeft = Math.max(8, window.innerWidth - rect.width - 8);
    setPopoverPos({ left: Math.min(Math.max(8, rect.left), maxLeft), top: shouldOpenAbove ? rect.top - 8 : rect.bottom + 8, width: rect.width, placement: shouldOpenAbove ? "top" : "bottom" });
  };

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    updatePos();
    const handleDown = (e) => {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      closeMenu();
    };
    document.addEventListener("mousedown", handleDown);
    window.addEventListener("resize", updatePos);
    return () => { document.removeEventListener("mousedown", handleDown); window.removeEventListener("resize", updatePos); };
  }, [isOpen]);

  return (
    <FormField label="Material" required error={error}>
      <div ref={triggerRef} style={{ position: "relative", width: "100%" }}>
        <div
          onClick={() => setIsOpen((o) => !o)}
          style={{
            ...inputFrameStyle(false, !!error),
            height: "46px", padding: "0 48px 0 16px",
            display: "flex", alignItems: "center", cursor: "pointer",
            borderColor: error ? "var(--status-red-primary)" : isOpen ? "var(--feature-brand-primary)" : baseInputBorderColor,
            boxShadow: isOpen ? "0 0 0 3px rgba(0, 104, 255, 0.08)" : "none",
            boxSizing: "border-box",
          }}
        >
          <span style={{ fontSize: "var(--text-subtitle-1)", color: selected ? "var(--neutral-on-surface-primary)" : "var(--neutral-on-surface-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selected ? `${selected.name} (${selected.sku})` : "Select material..."}
          </span>
        </div>
        <ChevronDownIcon
          size={20}
          color="var(--neutral-on-surface-secondary)"
          style={{ position: "absolute", right: "16px", top: "50%", transform: `translateY(-50%) ${isOpen ? "rotate(180deg)" : ""}`, transition: "transform 0.2s ease", pointerEvents: "none" }}
        />
        {isOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 21019 }} onClick={closeMenu} />
            <div
              ref={menuRef}
              style={{
                position: "fixed", left: `${popoverPos.left}px`, top: `${popoverPos.top}px`, width: `${popoverPos.width}px`,
                transform: popoverPos.placement === "top" ? "translateY(-100%)" : "none",
                background: "var(--neutral-surface-primary)", border: BORDER, borderRadius: "12px",
                boxShadow: "0px 8px 20px rgba(27,27,27,0.12)", overflow: "hidden", zIndex: 21020, maxHeight: "280px",
                display: "flex", flexDirection: "column",
              }}
            >
              <div style={{ overflowY: "auto" }}>
                {MOCK_MATERIALS_DATA.map((m, idx) => (
                  <div
                    key={m.id}
                    onClick={() => { onChange(m.id); closeMenu(); }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "var(--neutral-surface-primary)"}
                    style={{
                      borderTop: idx === 0 ? "none" : BORDER, minHeight: "56px", padding: "0 18px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: "12px", cursor: "pointer",
                      fontSize: "var(--text-title-2)", color: "var(--neutral-on-surface-primary)",
                      background: "var(--neutral-surface-primary)",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span>{m.name}</span>
                      <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>{m.sku}</span>
                    </div>
                    {m.id === value && <CheckIcon size={16} color="var(--feature-brand-primary)" />}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </FormField>
  );
};

// ── Urgency helpers ───────────────────────────────────────────────────────────

const URGENCY_LABELS = {
  overdue:   "Late PO",
  urgent:    "Urgent",
  this_week: "Order This Week",
};

const URGENCY_COLORS = {
  overdue:   "var(--status-red-primary)",
  urgent:    "var(--status-orange-primary)",
  this_week: "var(--feature-brand-primary)",
};

const URGENCY_BG = {
  overdue:   "var(--status-red-container)",
  urgent:    "var(--status-orange-container, #FFF3E0)",
  this_week: "var(--feature-brand-container)",
};

const getFastestVendor = (sku) => {
  if (!sku) return null;
  const vendors = MOCK_VENDOR_LEAD_TIMES.filter((v) => v.sku === sku);
  if (!vendors.length) return null;
  return vendors.reduce((a, b) => a.leadTimeDays <= b.leadTimeDays ? a : b);
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const generatePoNumber = () => {
  const now = new Date();
  return `PO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(1000 + Math.random() * 9000))}`;
};

const emptyLine = () => ({
  id: Date.now() + Math.random(),
  materialId: "", materialName: "", materialSku: "", materialUnit: "",
  qty: "", unitPrice: "", description: "", locked: false,
});

const emptyFee = () => ({ id: Date.now() + Math.random(), name: "", amount: "" });

const summaryLabelStyle = { fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" };
const summaryValueStyle = { fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-secondary)" };
const totalLabelStyle = { fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" };
const totalValueStyle = { fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-black)", color: "var(--neutral-on-surface-primary)" };

// ── Main component ────────────────────────────────────────────────────────────
const getUrgencyBanner = (urgencyStatus, sku) => {
  const p = sku ? MOCK_PROCUREMENT_STATUS[sku] : null;

  if (urgencyStatus === "overdue") {
    const body = p ? (
      <span style={{ fontSize: "var(--text-body)", lineHeight: "1.6" }}>
        Ordering now will delay{" "}
        <strong>{(p.affectedWoIds || []).join(", ") || "affected work orders"}</strong>{" "}
        by an estimated <strong>{p.delayDays} day{p.delayDays !== 1 ? "s" : ""}</strong> due to fastest vendor lead time of{" "}
        <strong>{p.fastestLeadTimeDays} days ({p.fastestVendor})</strong>.
      </span>
    ) : (
      <span style={{ fontSize: "var(--text-body)", lineHeight: "1.6" }}>
        Ordering now will delay delivery beyond the planned work order start date. Place this PO immediately and notify the relevant teams to minimize schedule impact.
      </span>
    );
    return { bg: "var(--status-red-container)", iconColor: "var(--status-red-primary)", title: "Late PO — Delivery at Risk", body };
  }

  if (urgencyStatus === "urgent") {
    const body = p ? (
      <span style={{ fontSize: "var(--text-body)", lineHeight: "1.6" }}>
        Only <strong>{p.bufferDays} day{p.bufferDays !== 1 ? "s" : ""}</strong> left to order on time.
        {" "}Place this PO by <strong>{p.orderByDate}</strong> using the fastest vendor{" "}
        <strong>{p.fastestVendor}</strong> (lead time: {p.fastestLeadTimeDays} days).
        {" "}Missing this window means stock arrives after demand on <strong>{p.demandDate}</strong>.
      </span>
    ) : (
      <span style={{ fontSize: "var(--text-body)", lineHeight: "1.6" }}>
        Only a few days remain to order on time. Select the fastest available vendor and confirm the delivery date to avoid stock arriving after the planned work order start date.
      </span>
    );
    return { bg: "var(--status-orange-container, #FFF3E0)", iconColor: "var(--status-orange-primary)", title: "Urgent — Order Window Closing", body };
  }

  if (urgencyStatus === "this_week") {
    const body = p ? (
      <span style={{ fontSize: "var(--text-body)", lineHeight: "1.6" }}>
        Place this PO by <strong>{p.orderByDateAvg}</strong> to meet demand on{" "}
        <strong>{p.demandDate}</strong>.
        {" "}Average vendor lead time is <strong>{p.avgLeadTimeDays} days</strong>.
        {" "}Ordering from <strong>{p.fastestVendor}</strong> ({p.fastestLeadTimeDays} days) gives the most buffer.
      </span>
    ) : (
      <span style={{ fontSize: "var(--text-body)", lineHeight: "1.6" }}>
        This PO should be placed this week to meet the planned work order start date. Ordering from the fastest vendor gives the most buffer.
      </span>
    );
    return { bg: "var(--feature-brand-container)", iconColor: "var(--feature-brand-primary)", title: "Order This Week", body };
  }

  return null;
};

export const CreatePoDrawer = ({ isOpen, onClose, onBack, showBack = false, initialMaterial = null, initialMaterials = null, showPoSnackbar, materialSku = null, urgencyStatus = null }) => {
  const [vendorId, setVendorId] = useState("");
  const [vendorError, setVendorError] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryDateError, setDeliveryDateError] = useState("");
  const [lines, setLines] = useState([]);
  const [lineErrors, setLineErrors] = useState({});
  const [tax, setTax] = useState("11");
  const [feeLines, setFeeLines] = useState([emptyFee()]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setVendorId(""); setVendorError("");
    setDeliveryDate(""); setDeliveryDateError("");
    setLineErrors({}); setShowConfirm(false);
    setTax("11"); setFeeLines([emptyFee()]);

    if (initialMaterials && initialMaterials.length > 0) {
      // Group by SKU so multiple WOs using the same material become one line
      const grouped = [];
      initialMaterials.forEach((item) => {
        const key = item.sku || item.materialName;
        const existing = grouped.find((g) => g.key === key);
        if (existing) {
          existing.woEntries.push({ woId: item.woId, needToBuy: item.needToBuy, urgencyStatus: item.urgencyStatus });
          existing.totalNeedToBuy += item.needToBuy || 0;
        } else {
          grouped.push({
            key,
            sku: item.sku,
            materialName: item.materialName,
            totalNeedToBuy: item.needToBuy || 0,
            woEntries: [{ woId: item.woId, needToBuy: item.needToBuy, urgencyStatus: item.urgencyStatus }],
          });
        }
      });
      setLines(grouped.map((g, idx) => {
        const mat = MOCK_MATERIALS_DATA.find((m) => m.sku === g.sku || m.name === g.materialName);
        const avgCost = mat?.averageCost;
        return {
          id: `locked-${idx}`,
          materialId: mat?.id || "",
          materialName: g.materialName || mat?.name || "",
          materialSku: g.sku || mat?.sku || "",
          materialUnit: mat?.unit || "",
          qty: g.totalNeedToBuy ? formatNumberWithCommas(g.totalNeedToBuy) : "",
          unitPrice: avgCost ? formatNumberWithCommas(avgCost) : "",
          description: "",
          locked: true,
          woEntries: g.woEntries,
        };
      }));
    } else if (initialMaterial) {
      const mat = MOCK_MATERIALS_DATA.find((m) => m.sku === initialMaterial.sku || m.name === initialMaterial.materialName);
      const avgCost = mat?.averageCost;
      setLines([{
        id: "locked",
        materialId: mat?.id || "",
        materialName: initialMaterial.materialName || mat?.name || "",
        materialSku: initialMaterial.sku || mat?.sku || "",
        materialUnit: mat?.unit || "",
        qty: initialMaterial.needToBuy ? formatNumberWithCommas(initialMaterial.needToBuy) : "",
        unitPrice: avgCost ? formatNumberWithCommas(avgCost) : "",
        description: "",
        locked: true,
        woEntries: initialMaterial.woId
          ? [{ woId: initialMaterial.woId, needToBuy: initialMaterial.needToBuy || 0, urgencyStatus: initialMaterial.urgencyStatus || urgencyStatus }]
          : null,
      }]);
    } else {
      setLines([emptyLine()]);
    }
  }, [isOpen, initialMaterial, initialMaterials]);

  const updateLine = (id, field, value) => {
    setLines((prev) => prev.map((l) => l.id === id ? { ...l, [field]: value } : l));
    setLineErrors((e) => { const n = { ...e }; delete n[`${id}_${field}`]; return n; });
  };

  const handleMaterialSelect = (lineId, matId) => {
    const mat = MOCK_MATERIALS_DATA.find((m) => m.id === matId);
    setLines((prev) => prev.map((l) =>
      l.id === lineId ? { ...l, materialId: matId, materialName: mat?.name || "", materialSku: mat?.sku || "", materialUnit: mat?.unit || "" } : l
    ));
    setLineErrors((e) => { const n = { ...e }; delete n[`${lineId}_materialId`]; return n; });
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (id) => setLines((prev) => prev.filter((l) => l.id !== id));

  const validate = () => {
    let valid = true;
    if (!vendorId) { setVendorError("Field cannot be empty"); valid = false; }
    if (!deliveryDate) { setDeliveryDateError("Field cannot be empty"); valid = false; }
    const errs = {};
    lines.forEach((l) => {
      if (!l.materialId) { errs[`${l.id}_materialId`] = "Field cannot be empty"; valid = false; }
      if (!l.qty || parseNumberFromCommas(l.qty) <= 0) { errs[`${l.id}_qty`] = "Field cannot be empty"; valid = false; }
      if (!l.unitPrice || parseNumberFromCommas(l.unitPrice) <= 0) { errs[`${l.id}_unitPrice`] = "Field cannot be empty"; valid = false; }
    });
    setLineErrors(errs);
    return valid;
  };

  const handleSubmitClick = () => { if (validate()) setShowConfirm(true); };

  const handleConfirm = () => {
    const vendor = MOCK_VENDORS.find((v) => v.id === vendorId);
    const subtotal = lines.reduce((sum, l) => sum + (parseNumberFromCommas(l.unitPrice) || 0) * (parseNumberFromCommas(l.qty) || 0), 0);
    const taxAmount = subtotal * ((parseFloat(tax) || 0) / 100);
    const feesAmount = feeLines.reduce((sum, f) => sum + (parseNumberFromCommas(f.amount) || 0), 0);
    const total = subtotal + taxAmount + feesAmount;

    MOCK_PO_TABLE_DATA.unshift({
      poNumber: generatePoNumber(),
      vendorName: vendor?.name || "",
      amount: `IDR ${formatNumberWithCommas(Math.round(total))}`,
      createdDate: new Date().toISOString().split("T")[0],
      status: "Waiting for Approval", statusKey: "waiting_for_approval", sBadge: "orange",
      subtotal,
      lines: lines.map((l, idx) => ({
        id: idx + 1, type: "material", item: l.materialName, code: l.materialSku,
        desc: l.description, woRef: "-",
        qty: parseNumberFromCommas(l.qty),
        price: parseNumberFromCommas(l.unitPrice),
      })),
      invoices: [], payments: [],
    });

    setShowConfirm(false);
    onClose();
    if (showPoSnackbar) showPoSnackbar("Purchase order successfully added", "success");
  };

  const selectedVendor = MOCK_VENDORS.find((v) => v.id === vendorId) || null;

  const subtotal = lines.reduce((sum, l) => sum + (parseNumberFromCommas(l.unitPrice) || 0) * (parseNumberFromCommas(l.qty) || 0), 0);
  const taxAmount = subtotal * ((parseFloat(tax) || 0) / 100);
  const feesAmount = feeLines.reduce((sum, f) => sum + (parseNumberFromCommas(f.amount) || 0), 0);
  const total = subtotal + taxAmount + feesAmount;

  return (
    <>
      {/* Backdrop — separate from panel so panel has no transform ancestor */}
      <div
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)",
          zIndex: 21000,
          opacity: isOpen ? 1 : 0,
          transition: "opacity 0.2s ease-in-out",
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={onClose}
      />

      {/* Drawer panel — NO transform so position:fixed children work correctly */}
      <div
        style={{
          position: "fixed", top: 0, right: isOpen ? "0" : "-450px", width: "450px",
          height: "100%", background: "var(--neutral-surface-primary)",
          display: "flex", flexDirection: "column",
          zIndex: 21001,
          transition: "right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "-4px 0 16px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px", minHeight: "73px", borderBottom: BORDER, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {showBack && <IconButton icon={ChevronLeft} onClick={onBack} size="small" color="var(--neutral-on-surface-primary)" />}
            <h2 style={{ margin: 0, fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
              Create Purchase Order
            </h2>
          </div>
          {!showBack && <IconButton icon={CloseIcon} onClick={onClose} size="small" color="var(--neutral-on-surface-primary)" />}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Vendor */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <VendorSelect
              value={vendorId}
              onChange={(id) => {
                setVendorId(id);
                setVendorError("");
                const sku = materialSku || initialMaterial?.sku;
                const vendor = MOCK_VENDORS.find((v) => v.id === id);
                if (sku && vendor) {
                  const lt = MOCK_VENDOR_LEAD_TIMES.find((l) => l.sku === sku && l.vendor === vendor.name);
                  if (lt) {
                    const d = new Date();
                    d.setDate(d.getDate() + lt.leadTimeDays);
                    setDeliveryDate(d.toISOString().split("T")[0]);
                    setDeliveryDateError("");
                  }
                }
              }}
              error={vendorError}
            />
            {selectedVendor && (
              <div style={{ padding: "14px 16px", borderRadius: "10px", background: "var(--neutral-surface-primary)", border: BORDER, display: "flex", flexDirection: "column", gap: "8px" }}>
                <InfoRow label="Phone" value={selectedVendor.phone} />
                <InfoRow label="Email" value={selectedVendor.email} />
                <InfoRow label="Address" value={selectedVendor.address} />
              </div>
            )}
          </div>

          {/* Delivery Date */}
          <FormField label="Expected Delivery Date" required error={deliveryDateError}>
            <DateInputControl
              value={deliveryDate}
              onChange={(e) => { setDeliveryDate(e.target.value); setDeliveryDateError(""); }}
              hasError={!!deliveryDateError}
            />
          </FormField>

          {/* Material Lines */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-semi-bold)", color: "var(--neutral-on-surface-primary)" }}>
              Materials
            </span>

            {lines.map((line, idx) => (
              <div key={line.id} style={{ padding: "20px", border: BORDER, borderRadius: "10px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-semi-bold)", color: "var(--neutral-on-surface-secondary)" }}>
                    Item {idx + 1}
                  </span>
                  {!line.locked && lines.length > 1 && (
                    <IconButton icon={Trash2} size="small" color="var(--status-red-primary)" onClick={() => removeLine(line.id)} />
                  )}
                </div>

                {/* Material */}
                {line.locked ? (
                  <>
                    <InputField
                      label="Material"
                      required
                      value={line.materialSku ? `${line.materialName} (${line.materialSku})` : line.materialName}
                      disabled
                    />
                    {/* WO list + recommended vendor info box */}
                    {(line.woEntries?.length > 0 || getFastestVendor(line.materialSku)) && (() => {
                      const fastest = getFastestVendor(line.materialSku);
                      return (
                        <div style={{ border: BORDER, borderRadius: "10px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                          {line.woEntries?.map((entry, eIdx) => {
                            const status = entry.urgencyStatus || urgencyStatus;
                            const color = URGENCY_COLORS[status];
                            const bg = URGENCY_BG[status];
                            const label = URGENCY_LABELS[status];
                            return (
                              <div key={eIdx} style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-semi-bold)", color: "var(--neutral-on-surface-primary)" }}>
                                  {entry.woId}
                                </span>
                                <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>·</span>
                                <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-primary)" }}>
                                  Need to Buy {entry.needToBuy}
                                </span>
                                {label && (
                                  <>
                                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>·</span>
                                    <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-semi-bold)", color, background: bg, padding: "1px 8px", borderRadius: "6px" }}>
                                      {label}
                                    </span>
                                  </>
                                )}
                              </div>
                            );
                          })}
                          {fastest && (
                            <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", marginTop: line.woEntries?.length ? "4px" : 0 }}>
                              Recommended vendor:{" "}
                              <span style={{ fontWeight: "var(--font-weight-semi-bold)", color: "var(--neutral-on-surface-primary)" }}>{fastest.vendor}</span>
                              {" "}({fastest.leadTimeDays}-day lead time)
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <MaterialSelect
                    value={line.materialId}
                    onChange={(matId) => handleMaterialSelect(line.id, matId)}
                    error={lineErrors[`${line.id}_materialId`]}
                  />
                )}

                {/* Qty + Unit Price */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <FormField label="Quantity" required error={lineErrors[`${line.id}_qty`]}>
                      <div
                        style={{
                          ...inputFrameStyle(false, !!lineErrors[`${line.id}_qty`]),
                          height: "46px", padding: "0 16px", display: "flex", alignItems: "center",
                          gap: "8px", boxSizing: "border-box",
                          borderColor: lineErrors[`${line.id}_qty`] ? "var(--status-red-primary)" : baseInputBorderColor,
                        }}
                        onFocus={(e) => focusInputFrame(e.currentTarget)}
                        onBlur={(e) => blurInputFrame(e.currentTarget, false, !!lineErrors[`${line.id}_qty`])}
                      >
                        <input
                          type="text"
                          placeholder="0"
                          value={line.qty}
                          onChange={(e) => {
                            const raw = parseNumberFromCommas(e.target.value);
                            updateLine(line.id, "qty", raw !== "" && !isNaN(raw) ? formatNumberWithCommas(raw) : "");
                          }}
                          style={{ flex: 1, height: "100%", border: "none", outline: "none", background: "transparent", ...inputControlStyle(false, !!line.qty) }}
                        />
                        {line.materialUnit && (
                          <span style={{ fontSize: "var(--text-subtitle-1)", color: "var(--neutral-on-surface-secondary)", whiteSpace: "nowrap" }}>
                            {line.materialUnit}
                          </span>
                        )}
                      </div>
                    </FormField>
                  </div>

                  <div style={{ flex: 1 }}>
                    <FormField label="Unit Price" required error={lineErrors[`${line.id}_unitPrice`]}>
                      <div
                        style={{
                          ...inputFrameStyle(false, !!lineErrors[`${line.id}_unitPrice`]),
                          height: "46px", padding: "0 16px", display: "flex", alignItems: "center",
                          gap: "8px", boxSizing: "border-box",
                          borderColor: lineErrors[`${line.id}_unitPrice`] ? "var(--status-red-primary)" : baseInputBorderColor,
                        }}
                        onFocus={(e) => focusInputFrame(e.currentTarget)}
                        onBlur={(e) => blurInputFrame(e.currentTarget, false, !!lineErrors[`${line.id}_unitPrice`])}
                      >
                        <span style={{ fontSize: "var(--text-subtitle-1)", color: "var(--neutral-on-surface-secondary)", whiteSpace: "nowrap" }}>IDR</span>
                        <input
                          type="text"
                          placeholder="0"
                          value={line.unitPrice}
                          onChange={(e) => {
                            const raw = parseNumberFromCommas(e.target.value);
                            updateLine(line.id, "unitPrice", raw !== "" && !isNaN(raw) ? formatNumberWithCommas(raw) : "");
                          }}
                          style={{ flex: 1, height: "100%", border: "none", outline: "none", background: "transparent", ...inputControlStyle(false, !!line.unitPrice) }}
                        />
                      </div>
                    </FormField>
                  </div>
                </div>

                {/* Description — textarea with inline counter */}
                <FormField
                  label="Description"
                  headerRight={`${(line.description || "").length}/1000`}
                >
                  <textarea
                    placeholder="Optional description"
                    value={line.description}
                    onChange={(e) => updateLine(line.id, "description", e.target.value)}
                    maxLength={1000}
                    style={{
                      minHeight: "88px", padding: "12px 16px", width: "100%",
                      resize: "vertical", border: "none", background: "transparent",
                      ...inputFrameStyle(false, false),
                      outline: "none", fontSize: "var(--text-subtitle-1)",
                      color: "var(--neutral-on-surface-primary)",
                      fontFamily: "inherit", boxSizing: "border-box",
                    }}
                    onFocus={(e) => focusInputFrame(e.currentTarget)}
                    onBlur={(e) => blurInputFrame(e.currentTarget, false, false)}
                  />
                </FormField>
              </div>
            ))}

            <button
              onClick={addLine}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                padding: "10px 16px", borderRadius: "10px",
                border: "1px dashed var(--neutral-line-separator-2)",
                background: "transparent", cursor: "pointer",
                fontSize: "var(--text-body)", color: "var(--feature-brand-primary)",
                fontFamily: "inherit", fontWeight: "var(--font-weight-semi-bold)", width: "100%",
              }}
            >
              <Plus size={16} />
              Add Material
            </button>
          </div>

          {/* Summary card */}
          <div style={{ border: BORDER, borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Subtotal */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={summaryLabelStyle}>Subtotal</span>
              <span style={summaryValueStyle}>IDR {formatNumberWithCommas(Math.round(subtotal))}</span>
            </div>

            {/* Tax */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={summaryLabelStyle}>Tax</span>
                <div
                  style={{
                    ...inputFrameStyle(false, false),
                    height: "46px", display: "flex", alignItems: "center",
                    padding: "0 16px", gap: "4px", width: "96px", boxSizing: "border-box",
                  }}
                  onFocus={(e) => focusInputFrame(e.currentTarget)}
                  onBlur={(e) => blurInputFrame(e.currentTarget, false, false)}
                >
                  <input
                    type="text"
                    value={tax}
                    onChange={(e) => setTax(e.target.value.replace(/[^0-9.]/g, ""))}
                    style={{ flex: 1, border: "none", outline: "none", background: "transparent", ...inputControlStyle(false, !!tax), textAlign: "right" }}
                  />
                  <span style={{ fontSize: "var(--text-subtitle-1)", color: "var(--neutral-on-surface-secondary)" }}>%</span>
                </div>
              </div>
              <span style={summaryValueStyle}>IDR {formatNumberWithCommas(Math.round(taxAmount))}</span>
            </div>

            {/* Fee lines */}
            {feeLines.map((fee) => (
              <div key={fee.id} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0px" }}>
                  <div
                    style={{ ...inputFrameStyle(false, false), height: "46px", display: "flex", alignItems: "center", padding: "0 16px", gap: "8px", boxSizing: "border-box" }}
                    onFocus={(e) => focusInputFrame(e.currentTarget)}
                    onBlur={(e) => blurInputFrame(e.currentTarget, false, false)}
                  >
                    <input
                      type="text"
                      placeholder="Fee name"
                      value={fee.name}
                      maxLength={40}
                      onChange={(e) => setFeeLines((prev) => prev.map((f) => f.id === fee.id ? { ...f, name: e.target.value } : f))}
                      style={{ flex: 1, border: "none", outline: "none", background: "transparent", ...inputControlStyle(false, !!fee.name) }}
                    />
                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {fee.name.length}/40
                    </span>
                  </div>
                </div>
                <div
                  style={{ ...inputFrameStyle(false, false), height: "46px", display: "flex", alignItems: "center", padding: "0 16px", gap: "8px", width: "130px", flexShrink: 0, boxSizing: "border-box" }}
                  onFocus={(e) => focusInputFrame(e.currentTarget)}
                  onBlur={(e) => blurInputFrame(e.currentTarget, false, false)}
                >
                  <span style={{ fontSize: "var(--text-subtitle-1)", color: "var(--neutral-on-surface-secondary)", flexShrink: 0 }}>IDR</span>
                  <input
                    type="text"
                    placeholder="0"
                    value={fee.amount}
                    onChange={(e) => {
                      const raw = parseNumberFromCommas(e.target.value);
                      setFeeLines((prev) => prev.map((f) => f.id === fee.id ? { ...f, amount: raw !== "" && !isNaN(raw) ? formatNumberWithCommas(raw) : "" } : f));
                    }}
                    style={{ flex: 1, border: "none", outline: "none", background: "transparent", ...inputControlStyle(false, !!fee.amount), textAlign: "right", minWidth: 0 }}
                  />
                </div>
                <div style={{ paddingTop: "7px" }}>
                  <IconButton
                    icon={DeleteIcon}
                    size="small"
                    color={feeLines.length === 1 ? "var(--neutral-on-surface-tertiary)" : "var(--status-red-primary)"}
                    disabled={feeLines.length === 1}
                    onClick={() => setFeeLines((prev) => prev.filter((f) => f.id !== fee.id))}
                  />
                </div>
              </div>
            ))}

            {feeLines.length < 5 && (
              <Button
                variant="tertiary"
                size="small"
                leftIcon={Plus}
                onClick={() => setFeeLines((prev) => [...prev, emptyFee()])}
                style={{ alignSelf: "flex-start", paddingLeft: 0 }}
              >
                Add Fee
              </Button>
            )}
          </div>
        </div>

        {/* Sticky footer — total + submit only */}
        <div style={{ borderTop: BORDER, flexShrink: 0, padding: "16px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={totalLabelStyle}>Total</span>
            <span style={totalValueStyle}>IDR {formatNumberWithCommas(Math.round(total))}</span>
          </div>
          <Button variant="filled" size="large" style={{ width: "100%" }} onClick={handleSubmitClick}>
            Submit PO
          </Button>
        </div>
      </div>

      {/* Confirmation modal */}
      <GeneralModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Submit PO?"
        width="376px"
        description="This PO will be automatically approved upon submission."
        zIndex={22000}
        footer={
          <>
            <Button size="large" style={{ width: "100%" }} onClick={handleConfirm}>
              Yes, Submit
            </Button>
            <Button variant="outlined" size="large" style={{ width: "100%" }} onClick={() => setShowConfirm(false)}>
              Keep Editing
            </Button>
          </>
        }
      />
    </>
  );
};

const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", gap: "8px", fontSize: "var(--text-body)" }}>
    <span style={{ color: "var(--neutral-on-surface-secondary)", minWidth: "64px" }}>{label}</span>
    <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "var(--font-weight-semi-bold)" }}>{value || "—"}</span>
  </div>
);
