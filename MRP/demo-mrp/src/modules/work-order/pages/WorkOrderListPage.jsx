import React, { useEffect, useState } from "react";
import { Settings, ChevronDownIcon, SearchNotFoundIllustration } from "../../../components/icons/Icons.jsx";
import { EmptyState } from "../../../ce-ui";
import { Button } from "../../../components/common/Button.jsx";
import { FilterMenu } from "../../../components/molecules/FilterMenu.jsx";
import { ListStatusCounterCard } from "../../../components/common/ListStatusCounterCard.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { AddIcon } from "../../../components/icons/Icons.jsx";
import { MOCK_WO_TABLE_DATA } from "../mock/workOrderMocks.js";
import { WorkOrderCreateDrawer } from "../components/WorkOrderCreateDrawer.jsx";

const cellStyle = (overrides) => ({
  minWidth: 0,
  minHeight: "56px",
  padding: "8px 12px",
  display: "flex",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

const wrapTextStyle = {
  whiteSpace: "normal",
  overflowWrap: "anywhere",
};

export const WorkOrderListPage = ({ onNavigate, t, showSnackbar }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilters, setPriorityFilters] = useState([]);
  const [creatorFilters, setCreatorFilters] = useState([]);
  const [fulfillmentFilters, setFulfillmentFilters] = useState([]);
  const [startDateFilterType, setStartDateFilterType] = useState("all");
  const [startCustomDateFrom, setStartCustomDateFrom] = useState(null);
  const [startCustomDateTo, setStartCustomDateTo] = useState(null);
  const [endDateFilterType, setEndDateFilterType] = useState("all");
  const [endCustomDateFrom, setEndCustomDateFrom] = useState(null);
  const [endCustomDateTo, setEndCustomDateTo] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [sortBy, setSortBy] = useState("wo");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [, forceRefresh] = useState(0);
  const statusCards = [
    {
      key: "not_started",
      label: t("work_order.summary.not_started"),
      badgeVariant: "grey-light",
    },
    {
      key: "ready_to_process",
      label: t("work_order.summary.ready_to_process"),
      badgeVariant: "blue-light",
    },
    {
      key: "in_progress",
      label: t("work_order.summary.in_progress"),
      badgeVariant: "yellow-light",
    },
    {
      key: "completed",
      label: t("work_order.summary.completed"),
      badgeVariant: "green-light",
    },
    {
      key: "cancelled",
      label: t("work_order.summary.cancelled"),
      badgeVariant: "red-light",
    },
  ];
  const tableColumns = [
    { label: "Work Order No.", key: "wo", flex: "1.6", sortable: true },
    { label: "Order No", key: "ord", flex: "1.6", sortable: true },
    { label: "Target", key: "product", flex: "1.4", sortable: true },
    { label: "Qty", key: "qty", flex: "0.6", sortable: false },
    { label: "Priority", key: "priority", flex: "0.8", sortable: false },
    { label: "Planned Date", key: "plannedDate", flex: "1.6", sortable: false },
    { label: "Created By", key: "createdBy", flex: "1", sortable: false },
    { label: "Fulfillment Type", key: "fulfillmentType", flex: "1.2", sortable: false },
    { label: "Costing Status", key: "costingStatus", flex: "1.2", sortable: false },
    { label: "WO Status", key: "status", flex: "1.2", sortable: false },
  ];
  const statusCounts = statusCards.reduce((acc, card) => {
    acc[card.key] = MOCK_WO_TABLE_DATA.filter(
      (row) => row.statusKey === card.key
    ).length;
    return acc;
  }, {});

  const parsedDate = (value) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const referenceNow = new Date("2026-03-31");
  const matchesDateFilter = (rowDateValue, filterType, customDateFrom, customDateTo) => {
    if (filterType === "all") return true;
    const rowDate = parsedDate(rowDateValue);
    if (!rowDate) return false;

    if (filterType === "last7") {
      const start = new Date(referenceNow);
      start.setDate(referenceNow.getDate() - 7);
      return rowDate >= start && rowDate <= referenceNow;
    }
    if (filterType === "last30") {
      const start = new Date(referenceNow);
      start.setDate(referenceNow.getDate() - 30);
      return rowDate >= start && rowDate <= referenceNow;
    }
    if (filterType === "__custom__" && customDateFrom && customDateTo) {
      return rowDate >= customDateFrom && rowDate <= customDateTo;
    }
    return true;
  };
  const priorityOptions = Array.from(
    new Set(MOCK_WO_TABLE_DATA.map((row) => row.priority))
  );
  const creatorOptions = Array.from(
    new Set(MOCK_WO_TABLE_DATA.map((row) => row.createdBy))
  );
  const fulfillmentOptions = [
    { value: "CustomerOrder", label: "Customer Order" },
    { value: "StockBuild", label: "Stock Build" },
  ];
  const toggleMultiFilter = (value, setter) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  };

  const filteredRows = MOCK_WO_TABLE_DATA.filter((row) => {
    const haystack =
      `${row.wo} ${row.ord} ${row.product} ${row.createdBy} ${row.priority}`.toLowerCase();
    const matchesSearch =
      !searchQuery || haystack.includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(row.statusKey);
    const matchesPriority =
      priorityFilters.length === 0 || priorityFilters.includes(row.priority);
    const matchesCreator =
      creatorFilters.length === 0 || creatorFilters.includes(row.createdBy);
    const matchesFulfillment =
      fulfillmentFilters.length === 0 || fulfillmentFilters.includes(row.fulfillmentType);
    const matchesStartDate = matchesDateFilter(row.start, startDateFilterType, startCustomDateFrom, startCustomDateTo);
    const matchesEndDate = matchesDateFilter(row.end, endDateFilterType, endCustomDateFrom, endCustomDateTo);
    return (
      matchesStatus &&
      matchesSearch &&
      matchesPriority &&
      matchesCreator &&
      matchesFulfillment &&
      matchesStartDate &&
      matchesEndDate
    );
  }).sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1;
    const aValue = a[sortBy] || "";
    const bValue = b[sortBy] || "";
    if (typeof aValue === "string") {
      return aValue.localeCompare(bValue) * direction;
    }
    return (aValue - bValue) * direction;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const visibleRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const workOrderTableBodyMaxHeight = "calc(100vh - 412px)";

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedStatuses.join("|"),
    searchQuery,
    priorityFilters.join("|"),
    creatorFilters.join("|"),
    fulfillmentFilters.join("|"),
    startDateFilterType,
    startCustomDateFrom,
    startCustomDateTo,
    endDateFilterType,
    endCustomDateFrom,
    endCustomDateTo,
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
            margin: "0",
            fontSize: "var(--text-big-title)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          {t("work_order.title")}
        </h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="outlined" leftIcon={Settings} onClick={() => onNavigate("settings")}>
            {t("work_order.settings")}
          </Button>
          <Button variant="filled" leftIcon={AddIcon} onClick={() => setIsCreateDrawerOpen(true)}>
            New WO
          </Button>
        </div>
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
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
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
                label="Priority"
                multiple
                searchable={false}
                options={priorityOptions.map((p) => ({ value: p, label: p }))}
                values={priorityFilters}
                onChangeMultiple={setPriorityFilters}
              />
              <FilterMenu
                label="Planned Start Date"
                searchable={false}
                options={[
                  { value: "last7",  label: "Last 7 days" },
                  { value: "last30", label: "Last 30 days" },
                ]}
                value={startDateFilterType}
                onChange={setStartDateFilterType}
                allValue="all"
                customDateEnabled
                customDateFrom={startCustomDateFrom}
                customDateTo={startCustomDateTo}
                onCustomDateChange={(from, to) => {
                  setStartCustomDateFrom(from);
                  setStartCustomDateTo(to);
                }}
              />
              <FilterMenu
                label="Planned End Date"
                searchable={false}
                options={[
                  { value: "last7",  label: "Last 7 days" },
                  { value: "last30", label: "Last 30 days" },
                ]}
                value={endDateFilterType}
                onChange={setEndDateFilterType}
                allValue="all"
                customDateEnabled
                customDateFrom={endCustomDateFrom}
                customDateTo={endCustomDateTo}
                onCustomDateChange={(from, to) => {
                  setEndCustomDateFrom(from);
                  setEndCustomDateTo(to);
                }}
              />
              <FilterMenu
                label="Created By"
                multiple
                searchable={false}
                options={creatorOptions.map((c) => ({ value: c, label: c }))}
                values={creatorFilters}
                onChangeMultiple={setCreatorFilters}
              />
              <FilterMenu
                label="Fulfillment Type"
                multiple
                searchable={false}
                options={fulfillmentOptions}
                values={fulfillmentFilters}
                onChangeMultiple={setFulfillmentFilters}
              />
            </div>
          </div>
          <TableSearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Work Order No"
            width="360px"
          />
        </div>

        <div
          style={{
            maxHeight: workOrderTableBodyMaxHeight,
            overflow: "auto",
            width: "100%",
          }}
        >
          <div
            style={{
              minWidth: "1050px",
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
                    minHeight: "49px",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "var(--text-title-3)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                    cursor: col.sortable ? "pointer" : "default",
                  }}
                >
                  <span style={wrapTextStyle}>
                    {col.label}
                  </span>
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
              {visibleRows.map((row, rIdx) => (
                <div
                  key={rIdx}
                  onClick={() => onNavigate("detail", row)}
                  style={{
                    display: "flex",
                    background: "var(--neutral-surface-primary)",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    transition: "background 0.12s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "var(--neutral-surface-grey-lighter)")
                  }
                  onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    "var(--neutral-surface-primary)")
                  }
                >
                  <div
                    style={cellStyle({
                      flex: tableColumns[0].flex,
                      color: "var(--feature-brand-primary)",
                    })}
                  >
                    <span style={wrapTextStyle}>
                      {row.wo}
                    </span>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[1].flex })}>
                    <span style={wrapTextStyle}>
                      {row.fulfillmentType === "StockBuild" ? "-" : row.ord}
                    </span>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[2].flex, flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: "2px", minHeight: "56px" })}>
                    <span style={{ ...wrapTextStyle, maxWidth: "100%" }}>
                      {row.product}
                    </span>
                    <span
                      style={{
                        fontSize: "var(--text-body)",
                        color: "var(--neutral-on-surface-secondary)",
                        ...wrapTextStyle,
                        maxWidth: "100%",
                      }}
                    >
                      {row.targetType === "Material" ? "Material" : "Product"}
                    </span>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[3].flex })}>
                    {row.qty}
                  </div>
                  <div
                    style={cellStyle({
                      flex: tableColumns[4].flex,
                      color: row.pColor,
                    })}
                  >
                    {row.priority}
                  </div>
                  <div style={cellStyle({ flex: tableColumns[5].flex })}>
                      <span style={wrapTextStyle}>
                      {row.start || row.end ? `${row.start || "-"} → ${row.end || "-"}` : "-"}
                      </span>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[6].flex })}>
                    <span style={wrapTextStyle}>
                      {row.createdBy}
                    </span>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[7].flex })}>
                    {row.fulfillmentType === "StockBuild" ? "Stock Build" : "Customer Order"}
                  </div>
                  <div style={cellStyle({ flex: tableColumns[8].flex })}>
                    <StatusBadge variant={row.costingBadge || "grey-light"}>
                      {row.costingStatus || "Open"}
                    </StatusBadge>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[9].flex })}>
                    <StatusBadge variant={row.sBadge}>{row.status}</StatusBadge>
                  </div>
                </div>
              ))}

              {filteredRows.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <EmptyState
                    illustration={<SearchNotFoundIllustration />}
                    title="No work orders found"
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

      <WorkOrderCreateDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onCreated={(record) => {
          forceRefresh((n) => n + 1);
          onNavigate("detail", record);
          showSnackbar?.("Work order successfully created", "success");
        }}
      />
    </div>
  );
};
