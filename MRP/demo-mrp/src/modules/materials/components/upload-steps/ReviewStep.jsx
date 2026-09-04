import React, { useEffect, useState } from "react";
import { AddIcon, DeleteIcon } from "../../../../components/icons/Icons.jsx";
import { Table, TextField } from "../../../../ce-ui";
import { Button } from "../../../../components/common/Button.jsx";
import { IconButton } from "../../../../components/common/IconButton.jsx";
import { Checkbox } from "../../../../components/common/Checkbox.jsx";
import { StatusBadge } from "../../../../components/common/StatusBadge.jsx";
import { DropdownSelect } from "../../../../components/common/DropdownSelect.jsx";
import { TableSearchField } from "../../../../components/table/TableSearchField.jsx";
import { TablePaginationFooter } from "../../../../components/table/TablePaginationFooter.jsx";
import {
  MATERIAL_FIELDS_CONFIG,
  isRowInvalid,
  rowNeedsAttention,
  ABC_CLASSIFICATION_OPTIONS,
  MATERIAL_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from "../../mock/materialFieldsConfig.js";

let blankRowSeq = 0;
const makeBlankRow = () => {
  const row = { __rowId: `blank-${Date.now()}-${++blankRowSeq}` };
  MATERIAL_FIELDS_CONFIG.forEach((f) => { row[f.key] = f.key === "status" ? "Active" : ""; });
  return row;
};

// Per-field column widths (px).
const COLUMN_WIDTH = {
  sku: 180,
  name: 220,
  category: 200,
  abcClassification: 200,
  materialType: 220,
  uom: 160,
  status: 160,
  description: 280,
  stockRisk: 160,
};

const MATERIAL_TYPE_LABEL = {
  Raw: "Raw Material",
  SemiFinished: "Semi-Finished Material",
  Finished: "Finished Material",
};

// Presentational — the page-level fixed footer (Cancel Upload / Save as
// Draft / Input Data) reads `rows` directly via the parent's own state, so
// this step only needs to manage the table's local view state (search,
// filter, selection, pagination) and mutate rows via `onRowsChange`.
// `normalizationStats`, if provided, reflects the just-completed simulated
// AI normalization pass (see MaterialUploadNewPage) — including any rows
// that were skipped mid-process (e.g. the AI ran out of tokens).
// `duplicates` is the result of the last save's duplicate SKU/Name scan
// ({ [rowId]: { sku, name } }), passed down from MaterialUploadNewPage — it
// only updates when the page saves the draft, not on every keystroke here.
export const ReviewStep = ({ rows, onRowsChange, normalizationStats, duplicates }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyInvalid, setShowOnlyInvalid] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  // Defaults to sorting by Name so the table has a stable, predictable order
  // as soon as normalization finishes, rather than raw upload order.
  const [sortKey, setSortKey] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const attentionCount = rows.filter(rowNeedsAttention).length;

  const filteredRows = rows.filter((row) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || ["sku", "name", "category"].some((key) => String(row[key] || "").toLowerCase().includes(query));
    const matchesInvalidFilter = !showOnlyInvalid || rowNeedsAttention(row);
    return matchesSearch && matchesInvalidFilter;
  });

  const sortedRows = sortKey
    ? [...filteredRows].sort((a, b) => {
        const cmp = String(a[sortKey] || "").localeCompare(String(b[sortKey] || ""), undefined, { sensitivity: "base" });
        return sortDirection === "desc" ? -cmp : cmp;
      })
    : filteredRows;

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const visibleRows = sortedRows.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, showOnlyInvalid, sortKey, sortDirection]);

  useEffect(() => {
    // Keep the current page in range whenever the underlying row/filter set
    // shrinks (e.g. after a delete).
    if (currentPage > totalPages) setCurrentPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const updateCell = (rowId, key, value) => {
    onRowsChange(rows.map((r) => {
      if (r.__rowId !== rowId) return r;
      // Clear the "extra text removed" flag once the user edits the field
      // themselves — it's only meant to explain the initial import.
      const { [key]: _cleared, ...restTruncated } = r.__truncatedFields || {};
      return { ...r, [key]: value, __truncatedFields: restTruncated };
    }));
  };

  // Deletes immediately — no confirm step. Safe to do silently because
  // nothing here is persisted to the store until "Save as Draft"/"Import
  // Data" (see MaterialUploadNewPage): navigating away or refreshing
  // beforehand reverts this and every other in-progress Review edit back to
  // the last saved state.
  const deleteRows = (ids) => {
    onRowsChange(rows.filter((r) => !ids.includes(r.__rowId)));
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const addRow = () => {
    onRowsChange([makeBlankRow(), ...rows]);
    // New rows are inserted first — jump back to page 1 so it's visible.
    setSearchQuery("");
    setShowOnlyInvalid(false);
    setCurrentPage(1);
  };

  const data = visibleRows.map((row) => ({ ...row, id: row.__rowId }));

  const stopRowToggle = (e) => e.stopPropagation();

  const columns = [
    ...MATERIAL_FIELDS_CONFIG.map((field) => {
      const header = `${field.required ? "* " : ""}${field.label}`;
      const width = COLUMN_WIDTH[field.key] || 180;

      if (field.key === "abcClassification") {
        return {
          key: field.key,
          header,
          width,
          render: (value, row) => {
            const isUnrecognized = !!row.abcClassification && !ABC_CLASSIFICATION_OPTIONS.includes(row.abcClassification);
            const isEmpty = !String(row.abcClassification || "").trim();
            return (
              <div className="abc-dropdown" onClick={stopRowToggle} onMouseDown={stopRowToggle}>
                <DropdownSelect
                  size="md"
                  value={isUnrecognized ? undefined : row.abcClassification || undefined}
                  placeholder="Select classification"
                  options={ABC_CLASSIFICATION_OPTIONS.map((v) => ({ value: v, label: v }))}
                  onChange={(val) => updateCell(row.__rowId, "abcClassification", val)}
                  state={isUnrecognized || isEmpty ? "error" : "default"}
                  errorText={
                    isEmpty
                      ? "Field cannot be empty"
                      : isUnrecognized
                      ? `“${row.abcClassification}” couldn’t be applied due to its format.`
                      : undefined
                  }
                />
              </div>
            );
          },
        };
      }

      if (field.key === "status") {
        return {
          key: field.key,
          header,
          width,
          render: (value, row) => {
            // Status is never actually blank — it defaults to "Active"
            // wherever rows are produced (normalization, new/blank rows,
            // resumed drafts). This is just a last-resort display fallback.
            const displayStatus = row.status || "Active";
            return (
              <div className="status-dropdown" onClick={stopRowToggle} onMouseDown={stopRowToggle}>
                <DropdownSelect
                  size="md"
                  value={displayStatus}
                  placeholder="Select status"
                  options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
                  onChange={(val) => updateCell(row.__rowId, "status", val)}
                  clearable={false}
                />
              </div>
            );
          },
        };
      }

      if (field.key === "description") {
        return {
          key: field.key,
          header,
          width,
          render: (value, row) => (
            <div onClick={stopRowToggle} onMouseDown={stopRowToggle}>
              <TextField
                size="md"
                multiline
                rows={2}
                showCount
                maxLength={1000}
                value={row.description || ""}
                onChange={(e) => updateCell(row.__rowId, "description", e.target.value)}
              />
            </div>
          ),
        };
      }

      if (field.key === "materialType") {
        return {
          key: field.key,
          header,
          width,
          render: (value, row) => {
            const isUnrecognized = !!row.materialType && !MATERIAL_TYPE_OPTIONS.includes(row.materialType);
            const isEmpty = !String(row.materialType || "").trim();
            return (
              <div className="material-type-dropdown" onClick={stopRowToggle} onMouseDown={stopRowToggle}>
                <DropdownSelect
                  size="md"
                  value={isUnrecognized ? undefined : row.materialType || undefined}
                  placeholder="Select material type"
                  options={MATERIAL_TYPE_OPTIONS.map((v) => ({ value: v, label: MATERIAL_TYPE_LABEL[v] || v }))}
                  onChange={(val) => updateCell(row.__rowId, "materialType", val)}
                  state={isUnrecognized || isEmpty ? "error" : "default"}
                  errorText={
                    isEmpty
                      ? "Field cannot be empty"
                      : isUnrecognized
                      ? `“${row.materialType}” couldn’t be applied due to its format.`
                      : undefined
                  }
                />
              </div>
            );
          },
        };
      }

      return {
        key: field.key,
        header,
        width,
        tooltip: field.helpText,
        // Only SKU and Name are user-sortable — they're the fields people
        // actually scan/search by; everything else stays presentation-order.
        sortable: field.key === "sku" || field.key === "name",
        render: (value, row) => {
          const isEmptyRequired = field.required && !String(row[field.key] || "").trim();
          const isCapped = field.key === "name" || field.key === "category";
          const wasTruncated = !!row.__truncatedFields?.[field.key];
          const isDuplicate = (field.key === "sku" || field.key === "name") && !!duplicates?.[row.__rowId]?.[field.key];
          return (
            <div onClick={stopRowToggle} onMouseDown={stopRowToggle}>
              <TextField
                size="md"
                value={row[field.key] || ""}
                onChange={(e) => updateCell(row.__rowId, field.key, e.target.value)}
                errorText={
                  isEmptyRequired
                    ? "Field cannot be empty"
                    : wasTruncated
                    ? "Max. 100 characters. Extra text removed."
                    : isDuplicate
                    ? (field.key === "sku" ? "Duplicate SKU found in this file" : "Duplicate name found in this file")
                    : undefined
                }
                showCount={isCapped}
                maxLength={isCapped ? 100 : undefined}
              />
            </div>
          );
        },
      };
    }),
    {
      key: "__actions",
      header: "",
      width: 56,
      render: (_, row) => (
        // Top-aligned like every other cell (see td:last-child above), with
        // a top padding tuned so the 32px icon button's center lands at the
        // same height as a 40px field's center (12px + 16px = 28px, matching
        // the field's 8px top padding + half its own 40px height).
        <div onClick={stopRowToggle} onMouseDown={stopRowToggle} style={{ paddingTop: "12px" }}>
          <IconButton icon={DeleteIcon} size="small" color="var(--status-red-primary)" onClick={() => deleteRows([row.__rowId])} />
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "0", flex: 1, minHeight: 0 }}>
      <style>{`
        .mc-review-table table { table-layout: fixed; width: max-content; min-width: 100%; }
        .mc-review-table th, .mc-review-table td { height: auto !important; overflow: hidden; vertical-align: top; display: table-cell !important; }
        .mc-review-table td > div { padding: 8px 0; }
        /* True vertical-align: middle tracks the *row's* full height, which
           drifts taller than a single field whenever a sibling cell wraps
           onto two lines (e.g. an error message) — so instead these two
           columns stay top-aligned like every other cell, with a fixed
           top padding tuned to land the (much shorter) checkbox/icon at the
           same vertical center as a normal field's own rendered height
           (TextField/DropdownSelect size="md" = 40px), not the row's. */
        .mc-review-table td:first-child, .mc-review-table td:last-child {
          vertical-align: top !important;
          text-align: center !important;
        }
        /* Checkbox: 24px tall, no wrapping div — offset directly on the td. */
        .mc-review-table td:first-child { padding-top: 16px !important; }
        .mc-review-table th {
          padding-top: 12px !important;
          padding-bottom: 12px !important;
          /* border-bottom on a sticky <th> can vanish while scrolling under
             border-collapse — a box-shadow paints reliably instead. */
          border-bottom: none !important;
          box-shadow: inset 0 -1px 0 var(--neutral-line-separator-2);
        }
        .mc-review-table { border-radius: var(--radius-card) var(--radius-card) 0 0 !important; }
        .mc-review-table > div:last-child { display: none; }
        .abc-dropdown [aria-label="Clear"] { display: none; }
        .material-type-dropdown [aria-label="Clear"] { display: none; }
      `}</style>

      <div style={{ flex: 1, minHeight: "320px", display: "flex", flexDirection: "column" }}>
        <Table
          className="mc-review-table flex-1 min-h-0"
          columns={columns}
          data={data}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          totalRows={sortedRows.length}
          page={safePage}
          perPage={rowsPerPage}
          onPageChange={setCurrentPage}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={(key, direction) => {
            setSortKey(key);
            setSortDirection(direction);
          }}
          emptyStateTitle="No rows found"
          emptyStateDescription="Try adjusting your search or the needs-attention filter."
          toolbar={
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                    <Checkbox checked={showOnlyInvalid} onChange={(checked) => setShowOnlyInvalid(checked)} />
                    Show only need attention data{attentionCount > 0 ? ` (${attentionCount})` : ""}
                  </label>
                  {normalizationStats && (
                    <>
                      <div style={{ width: "1px", height: "20px", background: "var(--neutral-line-separator-2)" }} />
                      <StatusBadge variant={normalizationStats.skipped > 0 ? "yellow-light" : "green-light"}>
                        {/* Single template-literal string (not split JSX text nodes) so the
                            app's DOM-based ID localization can match it with one regex — see
                            localizationUtils.js's INDONESIAN_DYNAMIC_TEXT. */}
                        {`${normalizationStats.normalized} of ${normalizationStats.total} rows normalized by AI`}
                        {normalizationStats.skipped > 0 ? ` (${normalizationStats.skipped} skipped)` : ""}
                      </StatusBadge>
                    </>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <TableSearchField value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by SKU, Name, or Category" width="320px" />
                  <Button variant="outlined" leftIcon={AddIcon} onClick={addRow}>New Row</Button>
                </div>
              </div>

              {selectedIds.length > 0 && (
                <div
                  style={{
                    margin: "12px -20px -12px",
                    padding: "12px 20px",
                    background: "var(--feature-brand-container)",
                    borderTop: "1px solid var(--neutral-line-separator-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                    {/* Single template-literal string so ID localization can match it as one node. */}
                    {`${selectedIds.length} Selected`}
                  </span>
                  <Button variant="outlined" leftIcon={DeleteIcon} onClick={() => deleteRows(selectedIds)} style={{ borderColor: "var(--status-red-primary)", color: "var(--status-red-primary)" }}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
          }
        />
        {filteredRows.length > 0 && (
          <TablePaginationFooter
            totalRows={filteredRows.length}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            style={{
              background: "var(--neutral-surface-primary)",
              borderBottomLeftRadius: "var(--radius-card)",
              borderBottomRightRadius: "var(--radius-card)",
              border: "1px solid var(--neutral-line-separator-1)",
              borderTop: "none",
            }}
          />
        )}
      </div>
    </div>
  );
};
