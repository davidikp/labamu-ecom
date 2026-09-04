import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AddIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  MoreVerticalIcon,
  Users,
  FileText,
  Upload,
  Building2,
  CircleDollarSign,
  Box,
} from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { InputField } from "../../../components/molecules/InputField.jsx";
import { RadioButton } from "../../../ce-ui";
import { createBom, updateBom, getBom, resolveMaterialOption, DEFAULT_COGS } from "../mock/bomMocks.js";
import { computeMaterialCost, fieldTotal, formatIDR } from "../utils/bomUtils.js";
import { CostFieldAccordion } from "../components/CostFieldAccordion.jsx";
import { MaterialLineModal } from "../components/MaterialLineModal.jsx";
import { RoutingLineModal } from "../components/RoutingLineModal.jsx";

const COGS_FIELDS = [
  { key: "labour", title: "Labour Cost", icon: Users, description: "Cost of human labour to produce one unit" },
  { key: "packing", title: "Packing Cost", icon: FileText, description: "Cost of packaging this product for delivery" },
  { key: "shipping", title: "Shipping Cost", icon: Upload, description: "Cost of moving goods" },
  { key: "overhead", title: "Overhead Cost", icon: Building2, description: "Indirect factory costs not tied to a task" },
  { key: "other", title: "Other Cost", icon: CircleDollarSign, description: "Additional production cost not covered above" },
];

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

// Stable per-row id for React keys — needed so dragging animates rows into
// place (via CSS transition) instead of remounting them when the array order
// changes, since array index alone isn't a stable identity across reorders.
let routingUidCounter = 1;
const nextRoutingUid = () => `routing-${routingUidCounter++}`;

// Section/field styling matching Purchase Order's create page — see
// modules/purchase-order/pages/PurchaseOrderCreatePage.jsx (pageSectionStyle /
// sectionHeader / rowWrapStyle / fieldLabelCol, defined locally there too).
const pageSectionStyle = {
  background: "var(--neutral-surface-primary)",
  borderRadius: "16px",
  border: "1px solid var(--neutral-line-separator-1)",
  overflow: "hidden",
};

const sectionHeader = (title, right) => (
  <div
    style={{
      padding: "18px 20px 0 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      position: "relative",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div
        style={{
          width: "6px",
          height: "24px",
          borderRadius: "0 4px 4px 0",
          background: "var(--feature-brand-primary)",
          position: "absolute",
          left: 0,
          top: "18px",
        }}
      />
      <span style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
        {title}
      </span>
    </div>
    {right || null}
  </div>
);

const rowWrapStyle = { display: "grid", gridTemplateColumns: "220px minmax(0, 1fr)", gap: "20px", alignItems: "start" };

const fieldLabelCol = (label, required = false) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingTop: "8px" }}>
    <div style={{ display: "flex", alignItems: "flex-start", gap: "4px" }}>
      {required ? <span style={{ color: "var(--status-red-primary)", fontSize: "var(--text-title-3)" }}>*</span> : null}
      <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{label}</span>
    </div>
  </div>
);

// Table styling matching Purchase Order's populated "Purchase Order Lines"
// table (PurchaseOrderCreatePage.jsx) — grid header/rows with a bottom-border
// rule, no separate boxed shell, no row hover state.
const MATERIALS_TABLE_COLUMNS = "minmax(160px, 1.6fr) 120px minmax(100px, 1fr) 100px 120px 90px 130px 120px";
const ROUTING_TABLE_COLUMNS = "40px 60px minmax(140px, 1.4fr) minmax(140px, 1.4fr) 100px 120px";

const tableHeaderRowStyle = (gridTemplateColumns) => ({
  display: "grid",
  gridTemplateColumns,
  gap: "8px",
  padding: "0 16px",
  height: "49px",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
  borderBottom: "1px solid var(--neutral-line-separator-1)",
});

const tableRowStyle = (gridTemplateColumns, isLast) => ({
  display: "grid",
  gridTemplateColumns,
  gap: "8px",
  padding: "0 16px",
  minHeight: "64px",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  borderBottom: isLast ? "none" : "1px solid var(--neutral-line-separator-1)",
});

const rowActionButtonStyle = (color) => ({ color, padding: "0 4px" });

const emptyStateBoxStyle = {
  padding: "40px 24px",
  textAlign: "center",
  color: "var(--neutral-on-surface-tertiary)",
  fontSize: "var(--text-title-3)",
  background: "var(--neutral-surface-primary)",
  border: "1.5px dashed var(--neutral-line-separator-1)",
  borderRadius: "16px",
};

const summaryMetricLabelStyle = { fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" };
const summaryMetricValueStyle = { fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-secondary)" };
const summaryTotalLabelStyle = { fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" };
const summaryTotalValueStyle = { fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-black)", color: "var(--neutral-on-surface-primary)" };

export const BomCreatePage = ({ onNavigate, initialData, isSidebarCollapsed }) => {
  // A direct/refreshed URL load synthesizes a placeholder initialData with the URL
  // segment as `id` (e.g. id: "create") — only treat this as an edit if that id
  // actually resolves to a real BOM record.
  const existingBom = initialData?.id ? getBom(initialData.id) : null;
  const isEdit = Boolean(existingBom);
  const source = existingBom || (isEdit ? initialData : null);

  const [name, setName] = useState(source?.name || "");
  const [description, setDescription] = useState(source?.description || "");
  const [status, setStatus] = useState(source?.status || "Active");
  const [materials, setMaterials] = useState(
    source?.materials?.length ? source.materials.map((m) => ({ materialId: m.materialId, quantity: m.quantity })) : []
  );
  const [routing, setRouting] = useState(
    source?.routing?.length ? source.routing.map((r) => ({ ...r, _uid: nextRoutingUid() })) : []
  );
  const [cogs, setCogs] = useState(source?.cogs || DEFAULT_COGS());
  const [cogsCollapsed, setCogsCollapsed] = useState(false);

  const [materialModal, setMaterialModal] = useState(null); // { index } | { index: null } for add
  const [routingModal, setRoutingModal] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [invalidCogsLineIds, setInvalidCogsLineIds] = useState(new Set());

  // Custom (non-native) drag for Routing rows: a floating card follows the
  // cursor while a grey placeholder box — sized to the real row — marks the
  // drop position in the list. Native HTML5 drag-and-drop can't render both
  // at once (the browser owns the drag-ghost image), so this is done by hand
  // with mouse events instead.
  const [dragState, setDragState] = useState(null); // { index, grabOffsetY, mouseY, rect }
  const routingListRef = useRef(null);
  const ROUTING_ROW_HEIGHT = 65; // row minHeight (64px) + 1px border

  const updateCogsField = (key, nextField) => setCogs((prev) => ({ ...prev, [key]: nextField }));

  const saveMaterialLine = (line) => {
    setMaterials((prev) =>
      materialModal.index == null ? [...prev, line] : prev.map((l, i) => (i === materialModal.index ? line : l))
    );
    setMaterialModal(null);
  };

  const removeMaterialLine = (idx) => {
    setMaterials((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveRoutingLine = (line) => {
    setRouting((prev) =>
      routingModal.index == null
        ? [...prev, { ...line, _uid: nextRoutingUid() }]
        : prev.map((l, i) => (i === routingModal.index ? { ...line, _uid: l._uid } : l))
    );
    setRoutingModal(null);
  };

  const removeRoutingLine = (idx) => {
    setRouting((prev) => prev.filter((_, i) => i !== idx));
  };

  const reorderRouting = (fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    setRouting((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  const hoverIndexForMouseY = (mouseY) => {
    if (!routingListRef.current) return dragState?.index ?? 0;
    const top = routingListRef.current.getBoundingClientRect().top;
    const rawIndex = Math.round((mouseY - top) / ROUTING_ROW_HEIGHT);
    return Math.max(0, Math.min(routing.length - 1, rawIndex));
  };

  const handleRoutingDragHandleMouseDown = (e, idx) => {
    e.preventDefault();
    const rowEl = routingListRef.current?.children[idx];
    if (!rowEl) return;
    const rect = rowEl.getBoundingClientRect();
    setDragState({ index: idx, grabOffsetY: e.clientY - rect.top, mouseY: e.clientY, left: rect.left, width: rect.width });
  };

  useEffect(() => {
    if (!dragState) return undefined;
    const handleMouseMove = (e) => setDragState((prev) => (prev ? { ...prev, mouseY: e.clientY } : prev));
    const handleMouseUp = () => {
      setDragState((prev) => {
        if (prev) {
          const targetIndex = hoverIndexForMouseY(prev.mouseY);
          reorderRouting(prev.index, targetIndex);
        }
        return null;
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragState?.index]);

  const dragHoverIndex = dragState ? hoverIndexForMouseY(dragState.mouseY) : null;
  const draggedRoutingLine = dragState ? routing[dragState.index] : null;

  const resolvedMaterials = materials
    .filter((line) => line.materialId)
    .map((line) => {
      const option = resolveMaterialOption(line.materialId);
      return {
        materialId: line.materialId,
        name: option?.name || "Unknown Material",
        sku: option?.sku || "-",
        category: option?.category || "-",
        abcClassification: option?.abcClassification || "-",
        type: option?.type || "-",
        unit: option?.unit || "-",
        quantity: Number(line.quantity) || 0,
      };
    });

  const materialCost = computeMaterialCost(resolvedMaterials);
  const totalCogs =
    materialCost +
    COGS_FIELDS.reduce((sum, { key }) => sum + fieldTotal(cogs[key]), 0);

  const nameError = showErrors && !name.trim() ? "Field cannot be empty" : null;
  const materialsError = showErrors && materials.length === 0 ? "Please add at least one material" : null;
  const routingError = showErrors && routing.length === 0 ? "Please add at least one routing step" : null;

  const cogsLinesValid = COGS_FIELDS.every(({ key }) => {
    const field = cogs[key];
    if (field?.mode !== "breakdown") return true;
    return (field.lines || []).every((l) => l.label?.trim());
  });
  const canSave = name.trim().length > 0 && materials.length > 0 && routing.length > 0 && cogsLinesValid;

  const handleCancel = () => onNavigate(isEdit ? "detail" : "list", existingBom);

  const handleSave = () => {
    if (!canSave) {
      setShowErrors(true);
      const invalidIds = new Set();
      COGS_FIELDS.forEach(({ key }) => {
        const field = cogs[key];
        if (field?.mode !== "breakdown") return;
        (field.lines || []).forEach((l) => {
          if (!l.label?.trim()) invalidIds.add(l.id);
        });
      });
      setInvalidCogsLineIds(invalidIds);
      return;
    }
    const payload = {
      name: name.trim(),
      description,
      status,
      materials: resolvedMaterials,
      routing: routing.map(({ _uid, ...r }, idx) => ({ ...r, step: idx + 1 })),
      cogs,
    };
    const saved = isEdit ? updateBom(existingBom.id, payload) : createBom(payload);
    onNavigate("detail", saved);
  };

  const pageTitle = isEdit ? "Edit Bill of Materials" : "Add New Bill of Materials";

  return (
    <div style={{ paddingBottom: "108px" }}>
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginLeft: "-4px" }}
            onClick={handleCancel}
          >
            <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
            <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>
              {pageTitle}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)" }}>
            <span
              style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }}
              onClick={() => onNavigate("list")}
            >
              Bill of Materials
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>{pageTitle}</span>
          </div>
        </div>

        <div style={pageSectionStyle}>
          {sectionHeader("Bill of Materials Information")}
          <div style={{ padding: "18px 20px 20px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={rowWrapStyle}>
              {fieldLabelCol("BOM Name", true)}
              <div>
                <InputField
                  placeholder="e.g. European Working Desk"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  showCounter
                  errorState={!!nameError}
                />
                {nameError ? (
                  <div style={{ color: "var(--status-red-primary)", fontSize: "var(--text-body)", marginTop: "4px" }}>
                    {nameError}
                  </div>
                ) : null}
              </div>
            </div>
            <div style={rowWrapStyle}>
              {fieldLabelCol("Status")}
              <div style={{ display: "flex", alignItems: "center", gap: "24px", paddingTop: "8px" }}>
                {STATUS_OPTIONS.map((opt) => (
                  <RadioButton
                    key={opt.value}
                    label={opt.label}
                    checked={status === opt.value}
                    onChange={() => setStatus(opt.value)}
                  />
                ))}
              </div>
            </div>
            <div style={rowWrapStyle}>
              {fieldLabelCol("Description")}
              <InputField
                multiline
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                showCounter
              />
            </div>
          </div>
        </div>

        <div style={pageSectionStyle}>
          {sectionHeader(
            "Materials",
            <Button variant="tertiary" size="small" leftIcon={AddIcon} onClick={() => setMaterialModal({ index: null })}>
              Add Material
            </Button>
          )}
          {materialsError ? (
            <div style={{ padding: "4px 20px 0 20px", color: "var(--status-red-primary)", fontSize: "var(--text-body)" }}>
              {materialsError}
            </div>
          ) : null}
          <div style={{ padding: "18px 20px 20px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {materials.length ? (
              <div style={{ overflowX: "auto", width: "100%" }}>
                <div style={{ minWidth: "760px" }}>
                  <div style={tableHeaderRowStyle(MATERIALS_TABLE_COLUMNS)}>
                    <span>Material Name</span>
                    <span>SKU</span>
                    <span>Category</span>
                    <span>Type</span>
                    <span>Average Cost</span>
                    <span>Quantity</span>
                    <span>Subtotal</span>
                    <span style={{ textAlign: "right" }}>Actions</span>
                  </div>
                  {materials.map((line, idx) => {
                    const option = resolveMaterialOption(line.materialId);
                    const averageCost = option?.averageCost || 0;
                    const subtotal = averageCost * Number(line.quantity || 0);
                    return (
                      <div key={idx} style={tableRowStyle(MATERIALS_TABLE_COLUMNS, idx === materials.length - 1)}>
                        <span>{option?.name || "Unknown Material"}</span>
                        <span>{option?.sku || "-"}</span>
                        <span>{option?.category || "-"}</span>
                        <span>{option?.type || "-"}</span>
                        <span>{formatIDR(averageCost)}</span>
                        <span>{line.quantity}</span>
                        <span>{formatIDR(subtotal)}</span>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <Button
                            variant="tertiary"
                            size="small"
                            style={rowActionButtonStyle("var(--feature-brand-primary)")}
                            onClick={() => setMaterialModal({ index: idx })}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="tertiary"
                            size="small"
                            style={rowActionButtonStyle("var(--status-red-primary)")}
                            onClick={() => removeMaterialLine(idx)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={emptyStateBoxStyle}>No materials added yet. Click "Add Material" to get started.</div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-title-3)" }}>
              <span style={summaryMetricLabelStyle}>Material Cost (auto-calculated from selected materials)</span>
              <span style={summaryMetricValueStyle}>{formatIDR(materialCost)}</span>
            </div>
          </div>
        </div>

        <div style={pageSectionStyle}>
          {sectionHeader(
            "Routing",
            <Button variant="tertiary" size="small" leftIcon={AddIcon} onClick={() => setRoutingModal({ index: null })}>
              Add Routing
            </Button>
          )}
          {routingError ? (
            <div style={{ padding: "4px 20px 0 20px", color: "var(--status-red-primary)", fontSize: "var(--text-body)" }}>
              {routingError}
            </div>
          ) : null}
          <div style={{ padding: "18px 20px 20px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {routing.length ? (
              <div style={{ overflowX: "auto", width: "100%" }}>
                <div style={{ minWidth: "700px" }}>
                  <div style={tableHeaderRowStyle(ROUTING_TABLE_COLUMNS)}>
                    <span />
                    <span>Step</span>
                    <span>Routing Name</span>
                    <span>Operation Name</span>
                    <span>Hours</span>
                    <span style={{ textAlign: "right" }}>Actions</span>
                  </div>
                  <div ref={routingListRef}>
                    {(() => {
                      let displayRows = routing.map((line, idx) => ({ line, idx }));
                      if (dragState) {
                        displayRows = displayRows.filter((r) => r.idx !== dragState.index);
                        const insertAt = Math.min(dragHoverIndex, displayRows.length);
                        displayRows.splice(insertAt, 0, { placeholder: true });
                      }
                      return displayRows.map((row, displayIdx) => {
                        const isLastDisplayRow = displayIdx === displayRows.length - 1;
                        if (row.placeholder) {
                          return (
                            <div
                              key="drop-placeholder"
                              style={{
                                ...tableRowStyle(ROUTING_TABLE_COLUMNS, isLastDisplayRow),
                                background: "var(--neutral-surface-grey-lighter)",
                                border: "1.5px dashed var(--neutral-line-separator-1)",
                                borderRadius: "8px",
                              }}
                            />
                          );
                        }
                        const { line, idx } = row;
                        return (
                          <div
                            key={line._uid}
                            style={{
                              ...tableRowStyle(ROUTING_TABLE_COLUMNS, isLastDisplayRow),
                              transition: "background 0.15s ease",
                            }}
                          >
                            <div
                              onMouseDown={(e) => handleRoutingDragHandleMouseDown(e, idx)}
                              style={{ cursor: "grab", display: "flex", alignItems: "center" }}
                            >
                              <MoreVerticalIcon size={16} color="var(--neutral-on-surface-tertiary)" />
                            </div>
                            <span>{idx + 1}</span>
                            <span>{line.name}</span>
                            <span>{line.operation}</span>
                            <span>{line.hours} hours</span>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <Button
                                variant="tertiary"
                                size="small"
                                style={rowActionButtonStyle("var(--feature-brand-primary)")}
                                onClick={() => setRoutingModal({ index: idx })}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="tertiary"
                                size="small"
                                style={rowActionButtonStyle("var(--status-red-primary)")}
                                onClick={() => removeRoutingLine(idx)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <div style={emptyStateBoxStyle}>No routing steps added yet. Click "Add Routing" to get started.</div>
            )}

            {dragState && draggedRoutingLine && typeof document !== "undefined"
              ? createPortal(
                  <div
                    style={{
                      position: "fixed",
                      top: dragState.mouseY - dragState.grabOffsetY,
                      left: dragState.left + 16,
                      width: dragState.width - 16,
                      zIndex: 10000,
                      pointerEvents: "none",
                      ...tableRowStyle(ROUTING_TABLE_COLUMNS, true),
                      background: "var(--neutral-surface-primary)",
                      border: "1px solid var(--neutral-line-separator-1)",
                      borderRadius: "8px",
                      boxShadow: "0px 8px 20px rgba(0,0,0,0.18)",
                    }}
                  >
                    <MoreVerticalIcon size={16} color="var(--neutral-on-surface-tertiary)" />
                    <span>{dragState.index + 1}</span>
                    <span>{draggedRoutingLine.name}</span>
                    <span>{draggedRoutingLine.operation}</span>
                    <span>{draggedRoutingLine.hours} hours</span>
                    <div />
                  </div>,
                  document.body
                )
              : null}
          </div>
        </div>

        <div style={{ ...pageSectionStyle, borderRadius: "24px" }}>
          {sectionHeader(
            "Forecasted Cost of Goods Sold",
            <div style={{ cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => setCogsCollapsed((v) => !v)}>
              <ChevronDownIcon
                size={20}
                color="var(--neutral-on-surface-primary)"
                style={{ transform: cogsCollapsed ? "rotate(0deg)" : "rotate(180deg)" }}
              />
            </div>
          )}
          {!cogsCollapsed ? (
            <div style={{ padding: "18px 20px 20px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Box size={16} color="var(--neutral-on-surface-secondary)" style={{ marginTop: "2px" }} />
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
                <span style={{ fontWeight: "bold", fontSize: "16px", color: "var(--neutral-on-surface-primary)" }}>
                  {formatIDR(materialCost)}
                </span>
              </div>
              {COGS_FIELDS.map(({ key, title, icon, isNew, description: fieldDescription }) => (
                <React.Fragment key={key}>
                  <div style={{ borderTop: "1px solid var(--neutral-line-separator-1)" }} />
                  <CostFieldAccordion
                    icon={icon}
                    title={title}
                    description={fieldDescription}
                    isNew={isNew}
                    field={cogs[key]}
                    onChange={(nextField) => updateCogsField(key, nextField)}
                    invalidLineIds={invalidCogsLineIds}
                  />
                </React.Fragment>
              ))}
              <div style={{ borderTop: "1px solid var(--neutral-line-separator-1)" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={summaryTotalLabelStyle}>Total Forecasted COGS</span>
                <span style={summaryTotalValueStyle}>{formatIDR(totalCogs)} / Unit</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: isSidebarCollapsed ? "82px" : "286px",
          right: 0,
          transition: "left 0.2s ease",
          background: "var(--neutral-surface-primary)",
          borderTop: "1px solid var(--neutral-line-separator-1)",
          padding: "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 100,
        }}
      >
        <Button size="medium" variant="tertiary" onClick={handleCancel} style={{ color: "var(--status-red-primary)" }}>
          Cancel
        </Button>
        <Button size="medium" variant="filled" onClick={handleSave}>
          Save
        </Button>
      </div>

      {materialModal ? (
        <MaterialLineModal
          isOpen
          onClose={() => setMaterialModal(null)}
          onSave={saveMaterialLine}
          initialLine={materialModal.index != null ? materials[materialModal.index] : null}
        />
      ) : null}

      {routingModal ? (
        <RoutingLineModal
          isOpen
          onClose={() => setRoutingModal(null)}
          onSave={saveRoutingLine}
          initialLine={routingModal.index != null ? routing[routingModal.index] : null}
        />
      ) : null}
    </div>
  );
};
