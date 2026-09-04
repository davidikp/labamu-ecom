import React, { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EditIcon,
  Box,
  Users,
  FileText,
  Upload,
  Building2,
  CircleDollarSign,
} from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { LabelValue } from "../../../components/molecules/LabelValue.jsx";
import { getBom, resolveMaterialOption } from "../mock/bomMocks.js";
import {
  bomStatusBadgeVariant,
  computeMaterialCost,
  computeTotalCogs,
  fieldTotal,
  formatIDR,
} from "../utils/bomUtils.js";
import { AbcClassificationBadge, DetailCard, detailTableHeaderRowStyle, detailTableRowStyle } from "../components/BomShared.jsx";
import { CostFieldAccordion } from "../components/CostFieldAccordion.jsx";
import { ChipTabBar } from "../../../components/molecules/ChipTabBar.jsx";

const DETAIL_TABS = [
  { id: "materials", label: "Materials" },
  { id: "routing", label: "Routing" },
  { id: "cogs", label: "Forecasted COGS" },
];

const COGS_FIELDS = [
  { key: "labour", title: "Labour Cost", icon: Users, description: "Cost of human labour to produce one unit" },
  { key: "packing", title: "Packing Cost", icon: FileText, description: "Cost of packaging this product for delivery" },
  { key: "shipping", title: "Shipping Cost", icon: Upload, description: "Cost of moving goods" },
  { key: "overhead", title: "Overhead Cost", icon: Building2, description: "Indirect factory costs not tied to a task" },
  { key: "other", title: "Other Cost", icon: CircleDollarSign, description: "Additional production cost not covered above" },
];

// Colors reuse existing design tokens rather than introducing new ones —
// see styles/tokens.css for the --feature-*/--status-* palette.
const COST_COMPOSITION_COLORS = {
  material: "var(--feature-brand-primary)",
  labour: "var(--feature-product-primary)",
  packing: "var(--feature-cashier-primary)",
  shipping: "var(--status-yellow-primary)",
  overhead: "var(--neutral-on-surface-secondary)",
  other: "var(--feature-invoice-primary)",
};

const MATERIALS_GRID_COLUMNS = "minmax(200px, 2fr) minmax(120px, 1fr) 160px 100px 120px 120px 120px";
const MATERIAL_COST_BREAKDOWN_GRID_COLUMNS = "minmax(200px, 2fr) 140px 140px 140px";
const ROUTING_GRID_COLUMNS = "60px minmax(200px, 2.5fr) minmax(120px, 1fr) 100px";

export const BomDetailPage = ({ onNavigate, initialData }) => {
  const bom = (initialData?.id && getBom(initialData.id)) || initialData;
  const [showMaterialBreakdown, setShowMaterialBreakdown] = useState(true);
  const [activeTab, setActiveTab] = useState("materials");

  if (!bom) {
    return (
      <div style={{ padding: "24px" }}>
        <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>Bill of Materials not found.</span>
      </div>
    );
  }

  const materialCost = computeMaterialCost(bom.materials);
  const totalCogs = computeTotalCogs(bom);

  return (
    <div
      style={{
        padding: "24px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginLeft: "-4px" }}
            onClick={() => onNavigate("list")}
          >
            <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
            <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>
              BOM Detail
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
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>BOM Detail</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="outlined" leftIcon={EditIcon} onClick={() => onNavigate("create", bom)}>
            Edit
          </Button>
        </div>
      </div>

      <div
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "16px",
          border: "1px solid var(--neutral-line-separator-1)",
          overflow: "visible",
        }}
      >
        <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{ fontSize: "var(--text-headline)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}
            >
              {bom.name}
            </span>
          </div>
          <StatusBadge variant={bomStatusBadgeVariant(bom.status)}>{bom.status}</StatusBadge>
        </div>
        <div style={{ margin: "0 24px", borderTop: "1px solid var(--neutral-line-separator-1)" }} />
        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
            <LabelValue label="Description" value={bom.description || "-"} />
          </div>
        </div>
      </div>

      <ChipTabBar tabs={DETAIL_TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "materials" ? (
      <DetailCard title="Materials">
        <div style={{ overflowX: bom.materials?.length ? "auto" : "hidden", width: "100%" }}>
          <div style={{ minWidth: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
            {bom.materials?.length ? (
              <div style={detailTableHeaderRowStyle(MATERIALS_GRID_COLUMNS)}>
                <span>Material</span>
                <span>Category</span>
                <span>ABC Classification</span>
                <span>Type</span>
                <span>Average Cost</span>
                <span>Quantity</span>
                <span style={{ textAlign: "right" }}>Subtotal</span>
              </div>
            ) : null}

            {bom.materials?.length ? (
              bom.materials.map((line, idx) => {
                const option = resolveMaterialOption(line.materialId);
                const averageCost = option?.averageCost || 0;
                const subtotal = averageCost * Number(line.quantity || 0);
                return (
                  <div key={idx} style={detailTableRowStyle(MATERIALS_GRID_COLUMNS, idx === bom.materials.length - 1)}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "var(--text-title-3)" }}>{line.name}</span>
                      <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>{line.sku}</span>
                    </div>
                    <span style={{ fontSize: "var(--text-title-3)" }}>{line.category}</span>
                    <AbcClassificationBadge classification={line.abcClassification} />
                    <span style={{ fontSize: "var(--text-title-3)" }}>{line.type}</span>
                    <span style={{ fontSize: "var(--text-title-3)" }}>{formatIDR(averageCost)}</span>
                    <span style={{ fontSize: "var(--text-title-3)" }}>
                      {line.quantity} {line.unit || ""}
                    </span>
                    <span style={{ fontSize: "var(--text-title-3)", textAlign: "right" }}>{formatIDR(subtotal)}</span>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "32px 24px", textAlign: "center", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-tertiary)" }}>
                No materials added to this BOM.
              </div>
            )}
          </div>
        </div>
      </DetailCard>
      ) : null}

      {activeTab === "routing" ? (
      <DetailCard title="Routing">
        <div style={{ overflowX: bom.routing?.length ? "auto" : "hidden", width: "100%" }}>
          <div style={{ minWidth: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
            {bom.routing?.length ? (
              <div style={detailTableHeaderRowStyle(ROUTING_GRID_COLUMNS)}>
                <span>Step</span>
                <span>Routing</span>
                <span>Operation</span>
                <span style={{ textAlign: "right" }}>Hours</span>
              </div>
            ) : null}

            {bom.routing?.length ? (
              bom.routing.map((step, idx) => (
                <div key={idx} style={detailTableRowStyle(ROUTING_GRID_COLUMNS, idx === bom.routing.length - 1)}>
                  <span style={{ fontSize: "var(--text-title-3)" }}>{step.step}</span>
                  <span style={{ fontSize: "var(--text-title-3)" }}>{step.name}</span>
                  <span style={{ fontSize: "var(--text-title-3)" }}>{step.operation || "-"}</span>
                  <span style={{ fontSize: "var(--text-title-3)", textAlign: "right" }}>{step.hours} hours</span>
                </div>
              ))
            ) : (
              <div style={{ padding: "32px 24px", textAlign: "center", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-tertiary)" }}>
                No routing steps added to this BOM.
              </div>
            )}
          </div>
        </div>
      </DetailCard>
      ) : null}

      {activeTab === "cogs" ? (
      <DetailCard title="Forecasted Cost of Goods Sold">
        {(() => {
          const compositionSegments = [
            { key: "material", label: "Material Cost", amount: materialCost },
            { key: "labour", label: "Labour Cost", amount: fieldTotal(bom.cogs?.labour) },
            { key: "packing", label: "Packing Cost", amount: fieldTotal(bom.cogs?.packing) },
            { key: "shipping", label: "Shipping Cost", amount: fieldTotal(bom.cogs?.shipping) },
            { key: "overhead", label: "Overhead Cost", amount: fieldTotal(bom.cogs?.overhead) },
            { key: "other", label: "Other Cost", amount: fieldTotal(bom.cogs?.other) },
          ];
          return (
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
                  {formatIDR(totalCogs)} total
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
                  const pct = totalCogs > 0 ? (amount / totalCogs) * 100 : 0;
                  return pct > 0 ? (
                    <div key={key} style={{ width: `${pct}%`, background: COST_COMPOSITION_COLORS[key] }} />
                  ) : null;
                })}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                {compositionSegments.map(({ key, label, amount }) => {
                  const pct = totalCogs > 0 ? Math.round((amount / totalCogs) * 100) : 0;
                  return (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: COST_COMPOSITION_COLORS[key],
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
          );
        })()}

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
            <span style={{ fontWeight: "bold", fontSize: "16px", color: "var(--neutral-on-surface-primary)" }}>
              {formatIDR(materialCost)}
            </span>
          </div>

          <div style={{ paddingLeft: "24px" }}>
            <Button
              variant="tertiary"
              size="small"
              rightIcon={showMaterialBreakdown ? ChevronDownIcon : ChevronRightIcon}
              onClick={() => setShowMaterialBreakdown((v) => !v)}
              style={{ alignSelf: "flex-start", padding: 0 }}
            >
              {showMaterialBreakdown ? "Hide Cost Breakdown" : "See Cost Breakdown"}
            </Button>
          </div>

          {showMaterialBreakdown ? (
            <div style={{ paddingLeft: "32px" }}>
              {!bom.materials?.length ? (
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
              ) : (
              <div style={{ overflowX: "auto", width: "100%" }}>
                <div style={{ minWidth: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={detailTableHeaderRowStyle(MATERIAL_COST_BREAKDOWN_GRID_COLUMNS)}>
                    <span>Material</span>
                    <span>Average Cost</span>
                    <span>Quantity</span>
                    <span style={{ textAlign: "right" }}>Subtotal</span>
                  </div>
                  {bom.materials?.map((line, idx) => {
                    const option = resolveMaterialOption(line.materialId);
                    const unitPrice = option?.averageCost || 0;
                    const subtotal = unitPrice * Number(line.quantity || 0);
                    return (
                      <div
                        key={idx}
                        style={detailTableRowStyle(MATERIAL_COST_BREAKDOWN_GRID_COLUMNS, idx === bom.materials.length - 1)}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "var(--text-title-3)" }}>{line.name}</span>
                          <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)" }}>{line.sku}</span>
                        </div>
                        <span style={{ fontSize: "var(--text-title-3)" }}>{formatIDR(unitPrice)}</span>
                        <span style={{ fontSize: "var(--text-title-3)" }}>
                          {line.quantity} {line.unit || ""}
                        </span>
                        <span style={{ fontSize: "var(--text-title-3)", textAlign: "right" }}>{formatIDR(subtotal)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              )}
            </div>
          ) : null}
        </div>

        {COGS_FIELDS.map(({ key, title, icon, isNew, description }) => (
          <React.Fragment key={key}>
            <div style={{ borderTop: "1px solid var(--neutral-line-separator-2)" }} />
            <CostFieldAccordion icon={icon} title={title} description={description} isNew={isNew} field={bom.cogs?.[key]} readOnly />
          </React.Fragment>
        ))}

        <div style={{ borderTop: "1px solid var(--neutral-line-separator-1)" }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "var(--text-title-1)",
            fontWeight: "var(--font-weight-black)",
          }}
        >
          <span>Total Forecasted COGS</span>
          <span>{formatIDR(totalCogs)} / Unit</span>
        </div>
      </DetailCard>
      ) : null}
    </div>
  );
};
