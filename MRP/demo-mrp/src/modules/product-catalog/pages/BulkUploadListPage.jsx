import React, { useEffect, useState } from "react";
import { AddIcon, ChevronLeft, ChevronDownIcon, SearchNotFoundIllustration } from "../../../components/icons/Icons.jsx";
import { EmptyState } from "../../../ce-ui";
import { Button } from "../../../components/common/Button.jsx";
import { FilterMenu } from "../../../components/molecules/FilterMenu.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { getBulkUploads, subscribeBulkUploads } from "../mock/bulkUploadsStore.js";
import { BulkUploadDetailModal } from "../components/BulkUploadDetailModal.jsx";

const STATUS_VARIANT = {
  Mapping: "orange",
  "Normalizing Data": "yellow",
  Review: "grey",
  Processing: "blue",
  Completed: "green",
  Cancelled: "red",
};

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    const datePart = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const timePart = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return `${datePart}; ${timePart}`;
  } catch {
    return iso;
  }
};

export const BulkUploadListPage = ({ onNavigate }) => {
  const [batches, setBatches] = useState(getBulkUploads());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({ status: [] });
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [sortDirection, setSortDirection] = useState(null); // null | "asc" | "desc"

  useEffect(() => subscribeBulkUploads(setBatches), []);

  const toggleCreatedAtSort = () => {
    setSortDirection((prev) => (prev === "desc" ? "asc" : prev === "asc" ? null : "desc"));
  };

  const filteredRows = batches
    .filter((row) => {
      const matchesSearch = !searchQuery || row.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || row.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = activeFilters.status.length === 0 || activeFilters.status.includes(row.status);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortDirection) return 0;
      const diff = new Date(a.createdAt) - new Date(b.createdAt);
      return sortDirection === "asc" ? diff : -diff;
    });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const visibleRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters]);

  const tableColumns = [
    { label: "Upload ID", key: "id", flex: "1.4" },
    { label: "File Name", key: "fileName", flex: "2" },
    { label: "Created At", key: "createdAt", flex: "1.6", sortable: true },
    { label: "Created By", key: "createdBy", flex: "1.4" },
    { label: "Total Data", key: "totalProducts", flex: "1.2" },
    { label: "Status", key: "status", flex: "1.4", minWidth: "160px" },
  ];

  return (
    <div style={{ height: "calc(100vh - 64px)", padding: "24px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px", overflow: "hidden", minHeight: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              marginLeft: "-4px",
            }}
            onClick={() => onNavigate("product_catalog_list")}
          >
            <ChevronLeft size={28} color="var(--neutral-on-surface-primary)" />
            <h1
              style={{
                margin: 0,
                fontSize: "var(--text-large-title)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
              }}
            >
              Bulk Upload
            </h1>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "var(--text-title-3)",
              marginLeft: "32px",
            }}
          >
            <span
              style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }}
              onClick={() => onNavigate("product_catalog_list")}
            >
              Product Catalog
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-secondary)" }}>Bulk Upload</span>
          </div>
        </div>

        <Button variant="filled" leftIcon={AddIcon} onClick={() => onNavigate("product_catalog_bulk-upload-new")}>
          New Upload
        </Button>
      </div>

      <div style={{ background: "var(--neutral-surface-primary)", borderRadius: "var(--radius-card)", border: "1px solid var(--neutral-line-separator-1)", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--neutral-line-separator-2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <FilterMenu
            label="Status"
            multiple
            searchable={false}
            options={["Mapping", "Normalizing Data", "Review", "Processing", "Completed", "Cancelled"].map((s) => ({ value: s, label: s }))}
            values={activeFilters.status}
            onChangeMultiple={(values) => setActiveFilters((prev) => ({ ...prev, status: values }))}
          />
          <TableSearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by File Name or Upload ID"
            width="360px"
          />
        </div>

        <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto", overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "900px", width: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", borderBottom: "1px solid var(--neutral-line-separator-1)", position: "sticky", top: 0, background: "var(--neutral-surface-primary)", zIndex: 20 }}>
              {tableColumns.map((col, idx) => (
                <div
                  key={idx}
                  onClick={col.sortable ? toggleCreatedAtSort : undefined}
                  style={{
                    flex: col.flex,
                    minWidth: col.minWidth,
                    flexShrink: col.minWidth ? 0 : undefined,
                    padding: "16px 12px",
                    fontSize: "var(--text-title-3)",
                    fontWeight: "var(--font-weight-bold)",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    cursor: col.sortable ? "pointer" : "default",
                    userSelect: col.sortable ? "none" : undefined,
                  }}
                >
                  {col.label}
                  {col.sortable && (
                    <ChevronDownIcon
                      size={14}
                      color={sortDirection ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-tertiary)"}
                      style={{
                        transform: sortDirection === "asc" ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {visibleRows.map((row) => (
                <div
                  key={row.id}
                  onClick={() =>
                    row.status === "Review" || row.status === "Mapping" || row.status === "Normalizing Data"
                      ? onNavigate("product_catalog_bulk-upload-new", { resumeDraftId: row.id })
                      : setSelectedBatch(row)
                  }
                  style={{ display: "flex", borderBottom: "1px solid var(--neutral-line-separator-1)", alignItems: "center", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--neutral-surface-primary)")}
                >
                  <div style={{ flex: tableColumns[0].flex, padding: "12px", fontSize: "var(--text-title-3)", color: "var(--feature-brand-primary)" }}>{row.id}</div>
                  <div style={{ flex: tableColumns[1].flex, padding: "12px", fontSize: "var(--text-title-3)" }}>{row.fileName}</div>
                  <div style={{ flex: tableColumns[2].flex, padding: "12px", fontSize: "var(--text-title-3)" }}>{formatDate(row.createdAt)}</div>
                  <div style={{ flex: tableColumns[3].flex, padding: "12px", fontSize: "var(--text-title-3)" }}>{row.createdBy}</div>
                  <div style={{ flex: tableColumns[4].flex, padding: "12px", fontSize: "var(--text-title-3)" }}>{row.totalProducts}</div>
                  <div
                    style={{
                      flex: tableColumns[5].flex,
                      minWidth: tableColumns[5].minWidth,
                      flexShrink: 0,
                      padding: "12px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}
                  >
                    <StatusBadge variant={STATUS_VARIANT[row.status] || "grey"}>{row.status}</StatusBadge>
                  </div>
                </div>
              ))}

              {filteredRows.length === 0 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <EmptyState illustration={<SearchNotFoundIllustration />} title="No uploads found" description="Try adjusting your filters or search keywords." />
                </div>
              )}
            </div>
          </div>
        </div>

        <TablePaginationFooter
          totalRows={filteredRows.length}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          style={{
            background: "var(--neutral-surface-primary)",
            borderBottomLeftRadius: "var(--radius-card)",
            borderBottomRightRadius: "var(--radius-card)",
          }}
        />
      </div>

      <BulkUploadDetailModal isOpen={!!selectedBatch} onClose={() => setSelectedBatch(null)} batch={selectedBatch} />
    </div>
  );
};
