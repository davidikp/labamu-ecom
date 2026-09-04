import React, { useEffect, useState } from "react";
import { ChevronDownIcon, SearchNotFoundIllustration } from "../../../components/icons/Icons.jsx";
import { EmptyState } from "../../../ce-ui";
import { FilterMenu } from "../../../components/molecules/FilterMenu.jsx";
import { ListStatusCounterCard } from "../../../components/common/ListStatusCounterCard.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { getRequests, REQUEST_STATUS_META } from "../mock/materialRequestMocks.js";

const cellStyle = (overrides) => ({
  minWidth: 0,
  height: "56px",
  padding: "0 12px",
  display: "flex",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

const ellipsis = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export const MaterialRequestListPage = ({ onNavigate }) => {
  // Read the store fresh on mount so session status changes are reflected.
  const rows = getRequests();

  const [searchQuery, setSearchQuery] = useState("");
  const [requesterFilters, setRequesterFilters] = useState([]);
  const [dateFilterType, setDateFilterType] = useState("all");
  const [customDateFrom, setCustomDateFrom] = useState(null);
  const [customDateTo, setCustomDateTo] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("requestedDateRaw");
  const [sortDirection, setSortDirection] = useState("desc");

  const statusCards = Object.entries(REQUEST_STATUS_META).map(([key, meta]) => ({
    key,
    label: meta.label,
    badgeVariant: meta.badgeVariant,
  }));

  const tableColumns = [
    { label: "Request ID", key: "requestId", flex: "1.2", sortable: false },
    { label: "Work Order No.", key: "workOrderShort", flex: "1.4", sortable: false },
    { label: "Total Item", key: "totalItemType", flex: "1", sortable: false },
    { label: "Requested By", key: "requestedBy", flex: "1.2", sortable: false },
    { label: "Requested Date", key: "requestedDateRaw", flex: "1.4", sortable: true },
    { label: "Status", key: "status", flex: "1", sortable: true },
  ];

  const statusCounts = statusCards.reduce((acc, card) => {
    acc[card.key] = rows.filter((row) => row.status === card.key).length;
    return acc;
  }, {});

  const requesterOptions = Array.from(new Set(rows.map((row) => row.requestedBy)));

  const parsedDate = (value) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const referenceNow = new Date("2026-03-31");
  const matchesDateFilter = (rowDateValue) => {
    if (dateFilterType === "all") return true;
    const rowDate = parsedDate(rowDateValue);
    if (!rowDate) return false;
    if (dateFilterType === "last7" || dateFilterType === "last30") {
      const start = new Date(referenceNow);
      start.setDate(referenceNow.getDate() - (dateFilterType === "last7" ? 7 : 30));
      return rowDate >= start && rowDate <= referenceNow;
    }
    if (dateFilterType === "__custom__" && customDateFrom && customDateTo) {
      return rowDate >= customDateFrom && rowDate <= customDateTo;
    }
    return true;
  };

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  };

  const filteredRows = rows
    .map((row) => ({ ...row, totalItemType: row.items.length }))
    .filter((row) => {
      const haystack =
        `${row.requestId} ${row.requestedBy} ${row.workOrderShort} ${row.workOrderNo}`.toLowerCase();
      const matchesSearch = !searchQuery || haystack.includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(row.status);
      const matchesRequester =
        requesterFilters.length === 0 || requesterFilters.includes(row.requestedBy);
      const matchesDate = matchesDateFilter(row.requestedDateRaw);
      return matchesSearch && matchesStatus && matchesRequester && matchesDate;
    })
    .sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      const aValue = a[sortBy] || "";
      const bValue = b[sortBy] || "";
      if (typeof aValue === "string") return aValue.localeCompare(bValue) * direction;
      return (aValue - bValue) * direction;
    });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const visibleRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedStatuses.join("|"),
    searchQuery,
    requesterFilters.join("|"),
    dateFilterType,
    customDateFrom,
    customDateTo,
    rowsPerPage,
    sortBy,
    sortDirection,
  ]);

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "var(--text-big-title)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          Material Request
        </h1>
      </div>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {statusCards.map((card) => (
          <ListStatusCounterCard
            key={card.key}
            label={card.label}
            count={statusCounts[card.key] || 0}
            badgeVariant={card.badgeVariant}
            active={selectedStatuses.includes(card.key)}
            onClick={() =>
              setSelectedStatuses((prev) =>
                prev.includes(card.key)
                  ? prev.filter((s) => s !== card.key)
                  : [...prev, card.key]
              )
            }
          />
        ))}
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
              label="Requested Date"
              searchable={false}
              options={[
                { value: "last7", label: "Last 7 days" },
                { value: "last30", label: "Last 30 days" },
              ]}
              value={dateFilterType}
              onChange={setDateFilterType}
              allValue="all"
              customDateEnabled
              customDateFrom={customDateFrom}
              customDateTo={customDateTo}
              onCustomDateChange={(from, to) => {
                setCustomDateFrom(from);
                setCustomDateTo(to);
              }}
            />

            <FilterMenu
              label="Requested By"
              searchable
              options={requesterOptions.map((name) => ({ value: name, label: name }))}
              values={requesterFilters}
              onChangeMultiple={setRequesterFilters}
              multiple
              allValue="all"
            />
          </div>

          <TableSearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Request ID or Work Order No"
            width="360px"
          />
        </div>

        <div style={{ maxHeight: "calc(100vh - 412px)", overflow: "auto", width: "100%" }}>
          <div
            style={{
              minWidth: "900px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
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
                  onClick={() => col.sortable && toggleSort(col.key)}
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
                  <span style={ellipsis}>{col.label}</span>
                  {col.sortable && (
                    <ChevronDownIcon
                      size={14}
                      color={
                        sortBy === col.key
                          ? "var(--feature-brand-primary)"
                          : "var(--neutral-on-surface-tertiary)"
                      }
                      style={{
                        transform:
                          sortBy === col.key && sortDirection === "asc"
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: filteredRows.length === 0 ? 1 : "0 0 auto",
              }}
            >
              {visibleRows.map((row) => {
                const meta = REQUEST_STATUS_META[row.status];
                return (
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
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "var(--neutral-surface-primary)")
                    }
                  >
                    <div
                      style={cellStyle({
                        flex: tableColumns[0].flex,
                        color: "var(--feature-brand-primary)",
                      })}
                    >
                      <span style={ellipsis}>{row.requestId}</span>
                    </div>
                    <div style={cellStyle({ flex: tableColumns[1].flex })}>
                      <span style={ellipsis}>{row.workOrderShort}</span>
                    </div>
                    <div style={cellStyle({ flex: tableColumns[2].flex })}>{row.totalItemType}</div>
                    <div style={cellStyle({ flex: tableColumns[3].flex })}>
                      <span style={ellipsis}>{row.requestedBy}</span>
                    </div>
                    <div style={cellStyle({ flex: tableColumns[4].flex })}>
                      <span style={ellipsis}>{row.requestedDate}</span>
                    </div>
                    <div style={cellStyle({ flex: tableColumns[5].flex })}>
                      <StatusBadge variant={meta?.badge || "grey"}>{meta?.label}</StatusBadge>
                    </div>
                  </div>
                );
              })}

              {filteredRows.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <EmptyState
                    illustration={<SearchNotFoundIllustration />}
                    title="No material requests found"
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
