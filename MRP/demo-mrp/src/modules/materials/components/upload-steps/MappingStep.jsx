import React from "react";
import { Table } from "../../../../ce-ui";
import { Info } from "../../../../components/icons/Icons.jsx";
import { Tooltip } from "../../../../components/atoms/Tooltip.jsx";
import { StatusBadge } from "../../../../components/common/StatusBadge.jsx";
import { DropdownSelect } from "../../../../components/common/DropdownSelect.jsx";
import { ClampedDescriptionText } from "../../../../components/common/ClampedDescriptionText.jsx";
import { MATERIAL_FIELDS_CONFIG, NOT_MAPPED } from "../../mock/materialFieldsConfig.js";

// Presentational/controlled: `mapping` and `recommendation` are owned by the
// parent page so the fixed "Normalize and Review" / "Cancel Upload" footer
// buttons (rendered by the page, not this step) can read/act on the same
// state. `recommendation` is a one-time snapshot computed when the file was
// analyzed — it stays fixed even if the user later changes a Source Column
// selection, since it's meant to show what the AI originally matched.
export const MappingStep = ({ headers, rows = [], mapping, recommendation, onMappingChange, missingRequired = [] }) => {
  const headerOptions = [
    { value: NOT_MAPPED, label: "— Not mapped —" },
    ...headers.map((h) => ({ value: h, label: h })),
  ];

  const data = MATERIAL_FIELDS_CONFIG.map((field) => ({ id: field.key, field }));

  // The example is a live sample pulled from the first uploaded row under
  // whichever source column is currently mapped — not the static example on
  // the material field config — so it updates as the user changes a mapping.
  const getSampleValue = (sourceColumn) => {
    if (!sourceColumn || sourceColumn === NOT_MAPPED) return "—";
    const sampleRow = rows.find((r) => r[sourceColumn] != null && String(r[sourceColumn]).trim() !== "");
    const value = sampleRow ? sampleRow[sourceColumn] : rows[0]?.[sourceColumn];
    return value != null && String(value).trim() !== "" ? String(value) : "—";
  };

  const columns = [
    {
      key: "field",
      header: "Material Field",
      width: 260,
      render: (_, row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "12px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "var(--text-title-3)" }}>{row.field.label}</span>
            {row.field.required && <StatusBadge variant="blue-light">Required</StatusBadge>}
            {row.field.helpText && (
              <Tooltip content={row.field.helpText}>
                <span style={{ display: "inline-flex", cursor: "help", color: "var(--neutral-on-surface-tertiary)" }}>
                  <Info size={14} />
                </span>
              </Tooltip>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "sourceColumn",
      header: "Source Column",
      render: (_, row) => {
        const mappedValue = mapping[row.field.key] ?? NOT_MAPPED;
        const isMissing = missingRequired.includes(row.field.key);
        return (
          // "not-mapped-select" (see the .mc-mapping-table style block below)
          // greys the trigger's label text back to the placeholder color —
          // NOT_MAPPED is passed through as a real `value` so the open menu
          // still highlights "— Not mapped —" as selected, but the closed
          // field should still read as empty.
          <div style={{ padding: "8px 0" }} className={mappedValue === NOT_MAPPED ? "not-mapped-select" : undefined}>
            <DropdownSelect
              value={mappedValue}
              options={headerOptions}
              onChange={(val) => onMappingChange(row.field.key, val === "" ? NOT_MAPPED : val)}
              hasError={isMissing}
              errorText={isMissing ? "Field cannot be empty" : undefined}
              placeholder="— Not mapped —"
            />
          </div>
        );
      },
    },
    {
      key: "example",
      header: "Example Value",
      width: 200,
      render: (_, row) => {
        const mappedValue = mapping[row.field.key] ?? NOT_MAPPED;
        const sample = getSampleValue(mappedValue);
        return (
          <div style={{ padding: "12px 0" }}>
            {row.field.key === "description" ? (
              <ClampedDescriptionText text={sample} style={{ color: "var(--neutral-on-surface-primary)" }} />
            ) : (
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>{sample}</span>
            )}
          </div>
        );
      },
    },
    {
      key: "recommendation",
      header: "AI Recommendation",
      width: 240,
      render: (_, row) => {
        const recommended = recommendation[row.field.key] ?? NOT_MAPPED;
        return (
          <div style={{ padding: "12px 0" }}>
            <span style={{ color: "var(--neutral-on-surface-primary)" }}>
              {recommended === NOT_MAPPED ? "No match found" : `Matched to "${recommended}"`}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "24px 0", flex: 1, minHeight: 0 }}>
      <style>{`
        .mc-mapping-table > div:last-child { display: none; }
        .mc-mapping-table th, .mc-mapping-table td { height: auto !important; vertical-align: top !important; }
        .mc-mapping-table th {
          padding-top: 12px !important;
          padding-bottom: 12px !important;
          /* border-bottom on a sticky <th> can vanish while scrolling under
             border-collapse — a box-shadow paints reliably instead. */
          border-bottom: none !important;
          box-shadow: inset 0 -1px 0 var(--neutral-line-separator-2);
        }
        /* NOT_MAPPED is a real selected value (so the open menu highlights
           it), but the closed field should still look empty/unset. */
        .not-mapped-select [role="button"] span.text-ellipsis {
          color: var(--neutral-on-surface-tertiary) !important;
        }
      `}</style>
      <div
        style={{
          background: "var(--feature-brand-container-lighter)",
          borderRadius: "12px",
          padding: "16px 20px",
          margin: "0 24px",
          display: "flex",
          gap: "16px",
          alignItems: "flex-start",
        }}
      >
        <div style={{ marginTop: "2px" }}>
          <Info size={20} color="var(--feature-brand-primary)" />
        </div>
        <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
          Your file columns have been mapped automatically. Review the mappings before continuing.
        </span>
      </div>

      <div style={{ height: "calc(100vh - 480px)", minHeight: "280px" }}>
        <Table className="mc-mapping-table" columns={columns} data={data} showPagination={false} selectedRowId={null} />
      </div>
    </div>
  );
};
