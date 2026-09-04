import React, { useEffect, useState } from "react";
import { AddIcon, ChevronDownIcon, SearchNotFoundIllustration } from "../../../components/icons/Icons.jsx";
import { EmptyState } from "../../../ce-ui";
import { Button } from "../../../components/common/Button.jsx";
import { FilterMenu } from "../../../components/molecules/FilterMenu.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { getBoms } from "../mock/bomMocks.js";
import { bomStatusBadgeVariant } from "../utils/bomUtils.js";
import { cellStyle } from "../components/BomShared.jsx";

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

export const BomListPage = ({ onNavigate, t }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatuses, setFilterStatuses] = useState(["Active"]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const tableColumns = [
    { label: "BOM Name", key: "name", flex: "2.4", sortable: true },
    { label: "Created at", key: "createdAt", flex: "1", sortable: true },
    { label: "Updated at", key: "updatedAt", flex: "1", sortable: true },
    { label: "Status", flex: "1" },
  ];

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  };

  const allRows = getBoms();

  const filteredRows = allRows
    .filter((row) => {
      const matchesStatus = filterStatuses.length === 0 || filterStatuses.includes(row.status);
      const matchesSearch = !searchQuery || row.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (!sortBy) return 0;
      const direction = sortDirection === "asc" ? 1 : -1;
      if (sortBy === "createdAt" || sortBy === "updatedAt") {
        return (new Date(a[sortBy]) - new Date(b[sortBy])) * direction;
      }
      return String(a[sortBy]).localeCompare(String(b[sortBy])) * direction;
    });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const visibleRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatuses.join("|"), searchQuery, rowsPerPage]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  return (
    <div
      style={{
        height: "calc(100vh - 64px)",
        padding: "24px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "var(--text-big-title)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          {t("bill_of_materials.title", "Bill of Materials")}
        </h1>
        <Button variant="filled" leftIcon={AddIcon} onClick={() => onNavigate("create")}>
          {t("bill_of_materials.new", "New BOM")}
        </Button>
      </div>

      <div
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--neutral-line-separator-1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--neutral-line-separator-2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              position: "relative",
            }}
          >
            <FilterMenu
              label="Status"
              multiple
              searchable={false}
              options={STATUS_OPTIONS}
              values={filterStatuses}
              onChangeMultiple={setFilterStatuses}
            />
          </div>

          <TableSearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by BOM Name"
            width="360px"
          />
        </div>

        <div style={{ overflowX: "auto", overflowY: "auto", width: "100%" }}>
          <div style={{ minWidth: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                background: "var(--neutral-surface-primary)",
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                position: "sticky",
                top: 0,
                zIndex: 20,
              }}
            >
              {tableColumns.map((col, idx) => (
                <div
                  key={idx}
                  onClick={() => (col.sortable ? toggleSort(col.key) : undefined)}
                  style={{
                    flex: col.flex,
                    minWidth: 0,
                    height: "49px",
                    padding: "0 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "var(--text-title-3)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                    cursor: col.sortable ? "pointer" : "default",
                  }}
                >
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {col.label}
                  </span>
                  {col.sortable ? (
                    <ChevronDownIcon
                      size={14}
                      color={sortBy === col.key ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-tertiary)"}
                      style={{
                        transform: sortBy === col.key && sortDirection === "asc" ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", flex: filteredRows.length === 0 ? 1 : "0 0 auto" }}>
              {visibleRows.map((row) => (
                <div
                  key={row.id}
                  onClick={() => onNavigate("detail", row)}
                  style={{
                    display: "flex",
                    background: "var(--neutral-surface-primary)",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    transition: "background 0.12s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--neutral-surface-primary)")}
                >
                  <div style={cellStyle({ flex: tableColumns[0].flex, color: "var(--feature-brand-primary)", fontWeight: "var(--font-weight-medium)" })}>
                    {row.name}
                  </div>
                  <div style={cellStyle({ flex: tableColumns[1].flex })}>{row.createdAt}</div>
                  <div style={cellStyle({ flex: tableColumns[2].flex })}>{row.updatedAt}</div>
                  <div style={cellStyle({ flex: tableColumns[3].flex })}>
                    <StatusBadge variant={bomStatusBadgeVariant(row.status)}>{row.status}</StatusBadge>
                  </div>
                </div>
              ))}

              {filteredRows.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <EmptyState
                    illustration={<SearchNotFoundIllustration />}
                    title="No bill of materials found"
                    description="Try adjusting your filters or search keywords."
                  />
                </div>
              ) : null}
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
        />
      </div>
    </div>
  );
};
