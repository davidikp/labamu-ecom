import React, { useState } from "react";
import {
  Box,
  Building2,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleDollarSign,
  DocumentIcon,
  EditIcon,
  FileText,
  Info,
  Upload,
  Users,
} from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { ChipTabBar } from "../../../components/molecules/ChipTabBar.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { AbcClassificationBadge, DetailCard, LabelValue, detailTableHeaderRowStyle, detailTableRowStyle } from "../../bill-of-materials/components/BomShared.jsx";
import { CostFieldAccordion } from "../../bill-of-materials/components/CostFieldAccordion.jsx";
import { formatIDR, computeMaterialCost, fieldTotal } from "../../bill-of-materials/utils/bomUtils.js";
import { resolveMaterialOption, DEFAULT_COGS } from "../../bill-of-materials/mock/bomMocks.js";
import {
  getCpr,
  CPR_STATUS_META,
  decideCprApproval,
  requestCprReEvaluation,
  saveCprProductDetail,
  addEngineeringNote,
} from "../mock/customProductRequestMocks.js";

const COGS_FIELDS = [
  { key: "labour", title: "Labour Cost", icon: Users, description: "Cost of human labour to produce one unit" },
  { key: "packing", title: "Packing Cost", icon: FileText, description: "Cost of packaging this product for delivery" },
  { key: "shipping", title: "Shipping Cost", icon: Upload, description: "Cost of moving goods" },
  { key: "overhead", title: "Overhead Cost", icon: Building2, description: "Indirect factory costs not tied to a task" },
  { key: "other", title: "Other Cost", icon: CircleDollarSign, description: "Additional production cost not covered above" },
];

const MATERIAL_COST_BREAKDOWN_GRID_COLUMNS = "minmax(200px, 2fr) 140px 140px 140px";
const MATERIALS_GRID_COLUMNS = "minmax(200px, 2fr) minmax(120px, 1fr) 160px 100px 120px 120px 120px";
const ROUTING_GRID_COLUMNS = "60px minmax(200px, 2.5fr) minmax(120px, 1fr) 100px";
const SALES_PRICE_GRID_COLUMNS = "1fr 1fr";

const dashedEmptyStateStyle = {
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
};

const ATTACHMENT_COLORS = {
  pdf: { bg: "var(--status-red-primary)", label: "PDF" },
  xls: { bg: "var(--status-green-primary)", label: "XLS" },
  file: { bg: "var(--neutral-on-surface-tertiary)", label: "FILE" },
};

const AttachmentRow = ({ attachment }) => {
  const meta = ATTACHMENT_COLORS[attachment.type] || ATTACHMENT_COLORS.file;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "6px",
          background: meta.bg,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "9px",
          fontWeight: "var(--font-weight-bold)",
          flexShrink: 0,
        }}
      >
        {meta.label}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)" }}>
          {attachment.name}
        </span>
        <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>
          {attachment.filename}
        </span>
      </div>
    </div>
  );
};

const CprInformationTab = ({ cpr }) => (
  <DetailCard
    title={cpr.cprNumber}
    rightAction={<StatusBadge variant={CPR_STATUS_META[cpr.status]?.badge || "grey"}>{cpr.status}</StatusBadge>}
  >
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
      <LabelValue label="RFQ Number" value={<span style={{ color: "var(--feature-brand-primary)" }}>{cpr.rfqNumber}</span>} />
      <LabelValue label="Customer Name" value={cpr.customerName} />
      <LabelValue label="Created By" value={cpr.createdBy} />
      <LabelValue label="Created Date" value={cpr.createdDate} />
      <LabelValue label="Requested Product Name" value={cpr.requestedProductName} />
      <LabelValue label="Requested Quantity" value={`${cpr.requestedQuantity} units`} />
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-tertiary)" }}>Product Notes</span>
      <span style={{ fontSize: "var(--text-title-2)", color: "var(--neutral-on-surface-primary)" }}>
        {cpr.productNotes || "-"}
      </span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-tertiary)" }}>Attachments</span>
      {cpr.attachments?.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {cpr.attachments.map((a, idx) => (
            <AttachmentRow key={idx} attachment={a} />
          ))}
        </div>
      ) : (
        <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-tertiary)" }}>
          No attachments
        </span>
      )}
    </div>
  </DetailCard>
);

const DimGroup = ({ title, dims }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
    <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)" }}>{title}</span>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
      <LabelValue label="Height" value={dims?.height ? `${dims.height} cm` : "-"} />
      <LabelValue label="Width" value={dims?.width ? `${dims.width} cm` : "-"} />
      <LabelValue label="Length" value={dims?.length ? `${dims.length} cm` : "-"} />
    </div>
  </div>
);

const CprProductDetailsTab = ({ cpr }) => {
  const detail = cpr.productDetail || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <DetailCard>
        <div style={{ display: "flex", gap: "32px" }}>
          <div style={{ width: "320px", flexShrink: 0 }}>
            <div
              style={{
                width: "320px",
                height: "240px",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                background: "var(--neutral-surface-grey-lighter)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--neutral-line-separator-2)",
              }}
            >
              {detail.images?.length ? (
                <img src={detail.images[0]?.previewUrl || detail.images[0]?.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <DocumentIcon size={48} color="var(--neutral-on-surface-tertiary)" />
                  <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>No Image</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              {detail.productName ? (
                <h2 style={{ margin: 0, fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)" }}>{detail.productName}</h2>
              ) : (
                <h2 style={{ margin: 0, fontStyle: "italic", color: "var(--neutral-on-surface-tertiary)", fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-medium)" }}>
                  unknown product name
                </h2>
              )}
              <StatusBadge variant="grey-light">{detail.status || "Inactive"}</StatusBadge>
            </div>
            <div style={{ height: "1px", background: "var(--neutral-line-separator-2)" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px 32px" }}>
              <LabelValue label="SKU" value={detail.sku || "-"} />
              <LabelValue label="Category" value={detail.category || "-"} />
              <div style={{ gridColumn: "1 / -1" }}>
                <LabelValue label="Description" value={detail.description || "-"} />
              </div>
            </div>
          </div>
        </div>
      </DetailCard>

      <DetailCard title="Product Specifications">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          <LabelValue label="Primary Material" value={detail.specification?.primaryMaterial || "-"} />
          <LabelValue label="Finishing" value={detail.specification?.finishing || "-"} />
          <LabelValue label="Weight (kg)" value={detail.specification?.weight || "-"} />
        </div>
      </DetailCard>

      <DetailCard title="Dimensions">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          <DimGroup title="Finished Product Dimensions" dims={detail.finishedDimensions} />
          <DimGroup title="Packed Dimensions" dims={detail.packedDimensions} />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)" }}>Container Capacity</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              <LabelValue label="20ft" value={detail.containerCapacity?.["20ft"] || "-"} />
              <LabelValue label="40ft" value={detail.containerCapacity?.["40ft"] || "-"} />
              <LabelValue label="40ft HC" value={detail.containerCapacity?.["40ftHc"] || "-"} />
            </div>
          </div>
        </div>
      </DetailCard>

      <DetailCard title="BOM Information">
        <LabelValue label="BOM Name" value={detail.bom?.name || "-"} />
        <LabelValue label="BOM Description" value={detail.bom?.description || "-"} />
      </DetailCard>

      <DetailCard title="Materials">
        <div style={{ overflowX: detail.bom?.materials?.length ? "auto" : "hidden", width: "100%" }}>
          <div style={{ minWidth: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
            {detail.bom?.materials?.length ? (
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

            {detail.bom?.materials?.length ? (
              detail.bom.materials.map((line, idx) => {
                const option = resolveMaterialOption(line.materialId);
                const averageCost = option?.averageCost || 0;
                const subtotal = averageCost * Number(line.quantity || 0);
                return (
                  <div key={idx} style={detailTableRowStyle(MATERIALS_GRID_COLUMNS, idx === detail.bom.materials.length - 1)}>
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
              <div style={dashedEmptyStateStyle}>No materials added yet.</div>
            )}
          </div>
        </div>
      </DetailCard>

      <DetailCard title="Routing">
        <div style={{ overflowX: detail.bom?.routing?.length ? "auto" : "hidden", width: "100%" }}>
          <div style={{ minWidth: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
            {detail.bom?.routing?.length ? (
              <div style={detailTableHeaderRowStyle(ROUTING_GRID_COLUMNS)}>
                <span>Step</span>
                <span>Routing</span>
                <span>Operation</span>
                <span style={{ textAlign: "right" }}>Hours</span>
              </div>
            ) : null}

            {detail.bom?.routing?.length ? (
              detail.bom.routing.map((step, idx) => (
                <div key={idx} style={detailTableRowStyle(ROUTING_GRID_COLUMNS, idx === detail.bom.routing.length - 1)}>
                  <span style={{ fontSize: "var(--text-title-3)" }}>{step.step}</span>
                  <span style={{ fontSize: "var(--text-title-3)" }}>{step.name}</span>
                  <span style={{ fontSize: "var(--text-title-3)" }}>{step.operation || "-"}</span>
                  <span style={{ fontSize: "var(--text-title-3)", textAlign: "right" }}>{step.hours} hours</span>
                </div>
              ))
            ) : (
              <div style={dashedEmptyStateStyle}>No routing information added yet.</div>
            )}
          </div>
        </div>
      </DetailCard>

      <DetailCard title="Pricing & Logistics">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <LabelValue label="Bill of Materials" value={detail.bom?.name || "-"} />
          <LabelValue label="Base Price" value={detail.basePrice ? formatIDR(detail.basePrice) : "-"} />
          <LabelValue label="Lead Time" value={detail.leadTime?.value ? `${detail.leadTime.value} ${detail.leadTime.unit}` : "-"} />
          <LabelValue label="Selling Price" value={detail.sellingPrice ? formatIDR(detail.sellingPrice) : "-"} />
        </div>
      </DetailCard>

      <DetailCard title="Sales Price List">
        <div style={{ overflowX: detail.salesPriceList?.length ? "auto" : "hidden", width: "100%" }}>
          <div style={{ minWidth: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
            {detail.salesPriceList?.length ? (
              <div style={detailTableHeaderRowStyle(SALES_PRICE_GRID_COLUMNS)}>
                <span>Currency</span>
                <span>Selling Price</span>
              </div>
            ) : null}

            {detail.salesPriceList?.length ? (
              detail.salesPriceList.map((p, idx) => (
                <div key={idx} style={detailTableRowStyle(SALES_PRICE_GRID_COLUMNS, idx === detail.salesPriceList.length - 1)}>
                  <span style={{ fontSize: "var(--text-title-3)" }}>{p.currency}</span>
                  <span style={{ fontSize: "var(--text-title-3)" }}>{formatIDR(p.sellingPrice)}</span>
                </div>
              ))
            ) : (
              <div style={dashedEmptyStateStyle}>No sales price list added yet.</div>
            )}
          </div>
        </div>
      </DetailCard>
    </div>
  );
};

const CprCogsTab = ({ cpr }) => {
  const detail = cpr.productDetail || {};
  const materials = detail.bom?.materials || [];
  const cogs = { ...DEFAULT_COGS(), ...detail.cogs };
  const materialCost = computeMaterialCost(materials);
  const totalCogs =
    materialCost + fieldTotal(cogs.labour) + fieldTotal(cogs.packing) + fieldTotal(cogs.shipping) + fieldTotal(cogs.overhead) + fieldTotal(cogs.other);
  const [showMaterialBreakdown, setShowMaterialBreakdown] = useState(true);

  return (
    <DetailCard title="Forecasted COGS">
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
            {!materials.length ? (
              <div style={dashedEmptyStateStyle}>No cost items added yet.</div>
            ) : (
              <div style={{ overflowX: "auto", width: "100%" }}>
                <div style={{ minWidth: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={detailTableHeaderRowStyle(MATERIAL_COST_BREAKDOWN_GRID_COLUMNS)}>
                    <span>Material</span>
                    <span>Average Cost</span>
                    <span>Quantity</span>
                    <span style={{ textAlign: "right" }}>Subtotal</span>
                  </div>
                  {materials.map((line, idx) => {
                    const option = resolveMaterialOption(line.materialId);
                    const unitPrice = option?.averageCost || 0;
                    const subtotal = unitPrice * Number(line.quantity || 0);
                    return (
                      <div key={idx} style={detailTableRowStyle(MATERIAL_COST_BREAKDOWN_GRID_COLUMNS, idx === materials.length - 1)}>
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

        {COGS_FIELDS.map(({ key, title, icon, description }) => (
          <React.Fragment key={key}>
            <div style={{ borderTop: "1px solid var(--neutral-line-separator-2)" }} />
            <CostFieldAccordion icon={icon} title={title} description={description} field={cogs[key]} readOnly />
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
      </div>
    </DetailCard>
  );
};

const CprLogsTab = ({ cpr, onAddNote }) => {
  const [noteText, setNoteText] = useState("");
  const approvers = cpr.logs?.approvers || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <DetailCard title="Approval Logs">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <LabelValue label="Requested By" value={cpr.logs?.requestedBy} />
          <LabelValue label="Requested At" value={cpr.logs?.requestedAt || "-"} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 2fr",
              gap: "12px",
              padding: "0 0 12px 0",
              borderBottom: "1px solid var(--neutral-line-separator-1)",
              fontSize: "var(--text-title-3)",
              fontWeight: "var(--font-weight-bold)",
            }}
          >
            <span>Approvers</span>
            <span>Status</span>
            <span>Comments</span>
          </div>
          {approvers.map((a, idx) => (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1fr 2fr",
                gap: "12px",
                padding: "12px 0",
                borderBottom: idx === approvers.length - 1 ? "none" : "1px solid var(--neutral-line-separator-1)",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)" }}>{a.name}</span>
                <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>{a.role}</span>
              </div>
              <div>
                <StatusBadge
                  variant={a.status === "Approved" ? "green-light" : a.status === "Rejected" ? "red-light" : "yellow-light"}
                >
                  {a.status}
                </StatusBadge>
              </div>
              <span style={{ fontSize: "var(--text-title-3)" }}>{a.comments || "-"}</span>
            </div>
          ))}
        </div>
      </DetailCard>

      <DetailCard title="Activity Logs">
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.4fr 1fr 1fr",
              gap: "12px",
              padding: "0 0 12px 0",
              borderBottom: "1px solid var(--neutral-line-separator-1)",
              fontSize: "var(--text-title-3)",
              fontWeight: "var(--font-weight-bold)",
            }}
          >
            <span>Name</span>
            <span>Email</span>
            <span>Activity</span>
            <span>Timestamp</span>
          </div>
          {(cpr.logs?.activity || []).slice().reverse().map((entry, idx, arr) => (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.4fr 1fr 1fr",
                gap: "12px",
                padding: "12px 0",
                borderBottom: idx === arr.length - 1 ? "none" : "1px solid var(--neutral-line-separator-1)",
                fontSize: "var(--text-title-3)",
              }}
            >
              <span>{entry.name}</span>
              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>{entry.email}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontWeight: "var(--font-weight-bold)" }}>{entry.activity}</span>
                {entry.description ? (
                  <span style={{ color: "var(--neutral-on-surface-secondary)" }}>{entry.description}</span>
                ) : null}
              </div>
              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>{entry.timestamp}</span>
            </div>
          ))}
        </div>
      </DetailCard>

      <DetailCard title="Engineering Notes">
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add a notes"
          style={{
            width: "100%",
            minHeight: "80px",
            borderRadius: "8px",
            border: "1px solid var(--neutral-line-separator-1)",
            padding: "12px",
            fontSize: "var(--text-title-3)",
            fontFamily: "inherit",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="filled"
            size="small"
            disabled={!noteText.trim()}
            onClick={() => {
              if (!noteText.trim()) return;
              onAddNote(noteText.trim());
              setNoteText("");
            }}
          >
            Submit
          </Button>
        </div>
        {cpr.logs?.engineeringNotes?.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {cpr.logs.engineeringNotes.slice().reverse().map((n, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "var(--text-title-3)" }}>{n.note}</span>
                <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>
                  {n.author} · {n.timestamp}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-tertiary)" }}>
            No engineering notes yet. Be the first to add a note!
          </span>
        )}
      </DetailCard>
    </div>
  );
};

const TABS = [
  { id: "cpr_information", label: "CPR Information" },
  { id: "product_details", label: "Product Details" },
  { id: "cogs", label: "Forecasted COGS" },
  { id: "logs", label: "Logs" },
];

// Latest activity entry matching one of the given labels — used to surface the
// most recent revision/rejection/re-evaluation comment in the status banner.
const findLatestActivity = (activity = [], labels) =>
  activity.slice().reverse().find((entry) => labels.includes(entry.activity));

const STATUS_BANNERS = {
  "Need Revision": {
    title: "Revision Required",
    color: "var(--status-yellow-primary)",
    bg: "var(--status-yellow-container)",
    labels: ["Ask for Revision"],
  },
  "Need Re-Evaluation": {
    title: "Re-Evaluation Comment",
    color: "var(--status-orange-primary)",
    bg: "var(--status-orange-container)",
    labels: ["Re-Evaluation Requested"],
  },
  Rejected: {
    title: "Rejection Comment",
    color: "var(--status-red-primary)",
    bg: "var(--status-red-container)",
    labels: ["Rejected"],
  },
};

const StatusBanner = ({ cpr }) => {
  const config = STATUS_BANNERS[cpr.status];
  if (!config) return null;
  const entry = findLatestActivity(cpr.logs?.activity, config.labels);
  if (!entry?.description) return null;
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        padding: "16px 20px",
        borderRadius: "12px",
        background: config.bg,
        border: `1px solid ${config.color}`,
      }}
    >
      <Info size={20} color={config.color} style={{ flexShrink: 0, marginTop: "2px" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
          {config.title}
        </span>
        <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>{entry.description}</span>
      </div>
    </div>
  );
};

const DECISION_META = {
  approve: { title: "Approve CPR", mandatory: false, confirmLabel: "Approve" },
  reject: { title: "Reject CPR", mandatory: true, confirmLabel: "Reject" },
  revision: { title: "Ask for Revision", mandatory: true, confirmLabel: "Send" },
  reevaluate: { title: "Request Re-Evaluation", mandatory: true, confirmLabel: "Send" },
};

export const CustomProductRequestDetailPage = ({ onNavigate, initialData, isSidebarCollapsed }) => {
  const [activeTab, setActiveTab] = useState("cpr_information");
  const [decisionType, setDecisionType] = useState(null); // "approve" | "reject" | "revision" | "reevaluate" | null
  const [decisionComment, setDecisionComment] = useState("");
  const [decisionError, setDecisionError] = useState("");
  const cpr = getCpr(initialData?.cprNumber) || initialData;

  if (!cpr) return null;

  const refresh = () => onNavigate("detail", getCpr(cpr.cprNumber));

  const handleAddNote = (note) => {
    addEngineeringNote(cpr.cprNumber, { author: "Natasha Smith", note, timestamp: "just now" });
    refresh();
  };

  const openDecision = (type) => {
    setDecisionType(type);
    setDecisionComment("");
    setDecisionError("");
  };

  const confirmDecision = () => {
    const meta = DECISION_META[decisionType];
    const trimmed = decisionComment.trim();
    if (meta.mandatory && !trimmed) {
      setDecisionError("Please add a comment before continuing.");
      return;
    }
    if (decisionType === "reevaluate") {
      requestCprReEvaluation(cpr.cprNumber, trimmed);
    } else {
      decideCprApproval(cpr.cprNumber, { decision: decisionType, comment: trimmed });
    }
    setDecisionType(null);
    refresh();
  };

  const handleSubmitCpr = () => {
    saveCprProductDetail(cpr.cprNumber, { productDetail: cpr.productDetail, submit: true });
    refresh();
  };

  const headerAction = (() => {
    if (cpr.status === "Completed") {
      return (
        <Button variant="outlined" leftIcon={DocumentIcon} onClick={() => setActiveTab("product_details")}>
          View Product
        </Button>
      );
    }
    if (["Draft", "Need Revision", "Need Re-Evaluation"].includes(cpr.status)) {
      return (
        <Button variant="outlined" leftIcon={EditIcon} onClick={() => onNavigate("create", cpr)}>
          Edit CPR
        </Button>
      );
    }
    return null;
  })();

  const showFillFooter = cpr.status === "New";
  const showSubmitFooter = ["Draft", "Need Revision", "Need Re-Evaluation"].includes(cpr.status);
  const showApprovalFooter = cpr.status === "Submitted";
  const showReEvaluateFooter = cpr.status === "Rejected";
  const hasFooter = showFillFooter || showSubmitFooter || showApprovalFooter || showReEvaluateFooter;

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px", paddingBottom: hasFooter ? "104px" : "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginLeft: "-4px" }}
            onClick={() => onNavigate("list")}
          >
            <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
            <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>
              Customer Product Request Detail
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)" }}>
            <span style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }} onClick={() => onNavigate("list")}>
              Custom Product Request
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>Customer Product Request Detail</span>
          </div>
        </div>
        {headerAction}
      </div>

      <StatusBanner cpr={cpr} />

      <ChipTabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {activeTab === "cpr_information" ? <CprInformationTab cpr={cpr} /> : null}
        {activeTab === "product_details" ? <CprProductDetailsTab cpr={cpr} /> : null}
        {activeTab === "cogs" ? <CprCogsTab cpr={cpr} /> : null}
        {activeTab === "logs" ? <CprLogsTab cpr={cpr} onAddNote={handleAddNote} /> : null}
      </div>

      {hasFooter ? (
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
            justifyContent: "flex-end",
            gap: "12px",
            zIndex: 100,
          }}
        >
          {showFillFooter ? (
            <Button variant="filled" size="large" onClick={() => onNavigate("create", cpr)}>
              Fill CPR Detail
            </Button>
          ) : null}
          {showSubmitFooter ? (
            <Button variant="filled" size="large" onClick={handleSubmitCpr}>
              Submit
            </Button>
          ) : null}
          {showApprovalFooter ? (
            <>
              <Button variant="danger" size="large" onClick={() => openDecision("reject")}>
                Reject
              </Button>
              <Button variant="outlined" size="large" onClick={() => openDecision("revision")}>
                Ask for Revision
              </Button>
              <Button variant="filled" size="large" onClick={() => openDecision("approve")}>
                Approve
              </Button>
            </>
          ) : null}
          {showReEvaluateFooter ? (
            <Button variant="filled" size="large" onClick={() => openDecision("reevaluate")}>
              Re-Evaluate
            </Button>
          ) : null}
        </div>
      ) : null}

      {decisionType ? (
        <GeneralModal
          isOpen
          onClose={() => setDecisionType(null)}
          title={DECISION_META[decisionType].title}
          width="480px"
          footer={
            <>
              <Button variant="tertiary" onClick={() => setDecisionType(null)}>
                Cancel
              </Button>
              <Button variant="filled" onClick={confirmDecision}>
                {DECISION_META[decisionType].confirmLabel}
              </Button>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "var(--text-title-3)" }}>
              Comment {DECISION_META[decisionType].mandatory ? <span style={{ color: "var(--status-red-primary)" }}>*</span> : "(optional)"}
            </span>
            <textarea
              value={decisionComment}
              onChange={(e) => {
                setDecisionComment(e.target.value);
                setDecisionError("");
              }}
              placeholder="Add a comment"
              style={{
                width: "100%",
                minHeight: "100px",
                borderRadius: "8px",
                border: `1px solid ${decisionError ? "var(--status-red-primary)" : "var(--neutral-line-separator-1)"}`,
                padding: "12px",
                fontSize: "var(--text-title-3)",
                fontFamily: "inherit",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
            {decisionError ? (
              <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>{decisionError}</span>
            ) : null}
          </div>
        </GeneralModal>
      ) : null}
    </div>
  );
};
