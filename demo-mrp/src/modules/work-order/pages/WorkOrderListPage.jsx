import React, { useEffect, useState } from "react";
import { Settings, ChevronDownIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { Checkbox } from "../../../components/common/Checkbox.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { ListStatusCounterCard } from "../../../components/common/ListStatusCounterCard.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { DateRangeInputControl } from "../components/DateRangeInputControl.jsx";
import { MOCK_WO_TABLE_DATA } from "../mock/workOrderMocks.js";

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

export const WorkOrderListPage = ({ onNavigate, t }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFilterKey, setOpenFilterKey] = useState(null);
  const [priorityFilters, setPriorityFilters] = useState([]);
  const [creatorFilters, setCreatorFilters] = useState([]);
  const [startDateFilterType, setStartDateFilterType] = useState("all");
  const [startDateRange, setStartDateRange] = useState({ start: "", end: "" });
  const [endDateFilterType, setEndDateFilterType] = useState("all");
  const [endDateRange, setEndDateRange] = useState({ start: "", end: "" });
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [popoverTriggerRect, setPopoverTriggerRect] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [sortBy, setSortBy] = useState("wo");
  const [sortDirection, setSortDirection] = useState("desc");
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
      key: "canceled",
      label: t("work_order.summary.canceled"),
      badgeVariant: "red-light",
    },
  ];
  const tableColumns = [
    { label: "Work Order No.", key: "wo", flex: "1.6", sortable: true },
    { label: "Order Number", key: "ord", flex: "1.6", sortable: true },
    { label: "Product", key: "product", flex: "1.4", sortable: true },
    { label: "Qty", key: "qty", flex: "0.6", sortable: false },
    { label: "Priority", key: "priority", flex: "0.8", sortable: false },
    { label: "Planned Start Date", key: "start", flex: "1.2", sortable: false },
    { label: "Planned End Date", key: "end", flex: "1.2", sortable: false },
    { label: "Created By", key: "createdBy", flex: "1", sortable: false },
    { label: "Status", key: "status", flex: "1.2", sortable: false },
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
  const matchesDateFilter = (rowDateValue, filterType, customRange) => {
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
    if (filterType === "custom" && customRange.start && customRange.end) {
      const start = parsedDate(customRange.start);
      const end = parsedDate(customRange.end);
      if (start && end) return rowDate >= start && rowDate <= end;
      return false;
    }
    return true;
  };
  const priorityOptions = Array.from(
    new Set(MOCK_WO_TABLE_DATA.map((row) => row.priority))
  );
  const creatorOptions = Array.from(
    new Set(MOCK_WO_TABLE_DATA.map((row) => row.createdBy))
  );
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
    const matchesStartDate = matchesDateFilter(
      row.start,
      startDateFilterType,
      startDateRange
    );
    const matchesEndDate = matchesDateFilter(
      row.end,
      endDateFilterType,
      endDateRange
    );
    return (
      matchesStatus &&
      matchesSearch &&
      matchesPriority &&
      matchesCreator &&
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
    startDateFilterType,
    startDateRange.start,
    startDateRange.end,
    endDateFilterType,
    endDateRange.start,
    endDateRange.end,
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
        <Button variant="outlined" leftIcon={Settings}>
          {t("work_order.settings")}
        </Button>
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
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setPopoverTriggerRect(rect);
                  setOpenFilterKey((prev) => (prev === "priority" ? null : "priority"));
                }}
              >
                <FilterPill
                  label="Priority"
                  active={priorityFilters.length > 0}
                  isOpen={openFilterKey === "priority"}
                  count={priorityFilters.length}
                />
              </div>
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setPopoverTriggerRect(rect);
                  setOpenFilterKey((prev) => (prev === "start" ? null : "start"));
                }}
              >
                <FilterPill
                  label="Planned Start Date"
                  active={startDateFilterType !== "all"}
                  isOpen={openFilterKey === "start"}
                  count={startDateFilterType !== "all" ? 1 : 0}
                />
              </div>
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setPopoverTriggerRect(rect);
                  setOpenFilterKey((prev) => (prev === "end" ? null : "end"));
                }}
              >
                <FilterPill
                  label="Planned End Date"
                  active={endDateFilterType !== "all"}
                  isOpen={openFilterKey === "end"}
                  count={endDateFilterType !== "all" ? 1 : 0}
                />
              </div>
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setPopoverTriggerRect(rect);
                  setOpenFilterKey((prev) => (prev === "creator" ? null : "creator"));
                }}
              >
                <FilterPill
                  label="Created By"
                  active={creatorFilters.length > 0}
                  isOpen={openFilterKey === "creator"}
                  count={creatorFilters.length}
                />
              </div>

              {openFilterKey ? (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 80 }}
                    onClick={() => setOpenFilterKey(null)}
                  />
                  <div
                    style={{
                      position: "fixed",
                      top: popoverTriggerRect ? `${popoverTriggerRect.bottom + 8}px` : "160px",
                      left: popoverTriggerRect ? `${popoverTriggerRect.left}px` : "0",
                      width: "360px",
                      background: "var(--neutral-surface-primary)",
                      border: "1px solid var(--neutral-line-separator-1)",
                      borderRadius: "var(--radius-card)",
                      boxShadow: "var(--elevation-sm)",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      zIndex: 1000,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "var(--text-title-2)",
                          fontWeight: "var(--font-weight-bold)",
                        }}
                      >
                        {openFilterKey === "priority"
                          ? "Priority"
                          : openFilterKey === "creator"
                            ? "Created By"
                            : openFilterKey === "start"
                              ? "Planned Start Date"
                              : "Planned End Date"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (openFilterKey === "priority") {
                            setPriorityFilters([]);
                          }
                          if (openFilterKey === "creator") {
                            setCreatorFilters([]);
                          }
                          if (openFilterKey === "start") {
                            setStartDateFilterType("all");
                            setStartDateRange({ start: "", end: "" });
                          }
                          if (openFilterKey === "end") {
                            setEndDateFilterType("all");
                            setEndDateRange({ start: "", end: "" });
                          }
                          setOpenFilterKey(null);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          color: "var(--status-red-primary)",
                          cursor: "pointer",
                          fontSize: "var(--text-body)",
                          fontWeight: "var(--font-weight-bold)",
                        }}
                      >
                        Remove Filter
                      </button>
                    </div>

                    {openFilterKey === "priority" || openFilterKey === "creator" ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        {(openFilterKey === "priority"
                          ? priorityOptions
                          : creatorOptions
                        ).map((option) => {
                          const currentList = openFilterKey === "priority" ? priorityFilters : creatorFilters;
                          const setter = openFilterKey === "priority" ? setPriorityFilters : setCreatorFilters;
                          return (
                            <label
                              key={option}
                              onClick={() => {
                                setter((prev) =>
                                  prev.includes(option)
                                    ? prev.filter((item) => item !== option)
                                    : [...prev, option]
                                );
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                cursor: "pointer",
                                fontSize: "var(--text-title-3)",
                              }}
                            >
                              <Checkbox
                                checked={currentList.includes(option)}
                                onChange={() => {
                                  setter(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]);
                                }}
                              />
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        {[
                          { key: "all", label: "All" },
                          { key: "last7", label: "Last 7 days" },
                          { key: "last30", label: "Last 30 days" },
                          { key: "custom", label: "Custom date" },
                        ].map((option) => {
                          const activeValue = openFilterKey === "start" ? startDateFilterType : endDateFilterType;
                          const setter = openFilterKey === "start" ? setStartDateFilterType : setEndDateFilterType;
                          return (
                            <label
                              key={option.key}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                cursor: "pointer",
                                fontSize: "var(--text-title-3)",
                              }}
                            >
                              <input
                                type="radio"
                                checked={activeValue === option.key}
                                onChange={() => setter(option.key)}
                              />
                              <span>{option.label}</span>
                            </label>
                          );
                        })}

                        {(openFilterKey === "start" ? startDateFilterType : endDateFilterType) === "custom" && (
                          <DateRangeInputControl
                            value={openFilterKey === "start" ? startDateRange : endDateRange}
                            onChange={(e) => {
                              const setter = openFilterKey === "start" ? setStartDateRange : setEndDateRange;
                              setter(e.target.value);
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
          <TableSearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search work order number"
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
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {row.wo}
                    </span>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[1].flex })}>
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {row.ord}
                    </span>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[2].flex })}>
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {row.product}
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
                      <span
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                      {row.start || "-"}
                      </span>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[6].flex })}>
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {row.end || "-"}
                    </span>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[7].flex })}>
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {row.createdBy}
                    </span>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[8].flex })}>
                    <StatusBadge variant={row.sBadge}>{row.status}</StatusBadge>
                  </div>
                </div>
              ))}

              {filteredRows.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    padding: "32px",
                    textAlign: "center",
                    color: "var(--neutral-on-surface-tertiary)",
                    fontSize: "var(--text-title-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  No work orders found.
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
