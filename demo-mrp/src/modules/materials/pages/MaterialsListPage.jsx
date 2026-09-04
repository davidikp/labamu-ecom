import React, { useEffect, useState } from "react";
import { 
  AddIcon, 
  ChevronDownIcon, 
  Download, 
  Settings, 
  Upload,
  SearchIcon,
  Info,
  Box,
  CheckIcon
} from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { ListStatusCounterCard } from "../../../components/common/ListStatusCounterCard.jsx";
import { Checkbox } from "../../../components/common/Checkbox.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { MaterialCreateDrawer } from "../components/MaterialCreateDrawer.jsx";
import { MaterialUploadModal } from "../components/MaterialUploadModal.jsx";
import { MOCK_MATERIALS_DATA } from "../mock/materialsMocks.js";

export const MaterialsListPage = ({ onNavigate, showSnackbar, t }) => {
  const [materials, setMaterials] = useState(MOCK_MATERIALS_DATA);
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 900
  );

  // Filters
  const [activeFilters, setActiveFilters] = useState({
    category: [],
    classification: [], 
    type: [],
    stockRisk: [],
    status: [],
  });
  const [openFilterKey, setOpenFilterKey] = useState(null);
  const [popoverTriggerRect, setPopoverTriggerRect] = useState(null);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const tableColumns = [
    { label: "Image", key: "image", flex: "0.8", sortable: false },
    { label: "Name", key: "name", flex: "2.5", sortable: true },
    { label: "Category", key: "category", flex: "1.5", sortable: false },
    { label: "ABC Classification", key: "abcClassification", flex: "1.5", sortable: true },
    { label: "Type", key: "type", flex: "1.2", sortable: false },
    { label: "On-Hand Stock", key: "onHandStock", flex: "1.5", sortable: false },
    { label: "Average Cost", key: "averageCost", flex: "1.5", sortable: false },
    { label: "Status", key: "status", flex: "1.2", sortable: false },
  ];

  const abcClassificationCards = [
    { key: "A", label: "A Classification", color: "red-light" },
    { key: "B", label: "B Classification", color: "blue-light" },
    { key: "C", label: "C Classification", color: "green-light" },
  ];

  const abcCounts = abcClassificationCards.reduce((acc, card) => {
    acc[card.key] = materials.filter(
      (row) => row.abcClassification === card.key
    ).length;
    return acc;
  }, {});

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  };

  const toggleClassification = (key) => {
    setActiveFilters((prev) => ({
      ...prev,
      classification: prev.classification.includes(key)
        ? prev.classification.filter((k) => k !== key)
        : [...prev.classification, key],
    }));
  };

  const filteredRows = materials.filter((row) => {
    const matchesSearch =
      !searchQuery ||
      `${row.name} ${row.sku}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeFilters.category.length === 0 || activeFilters.category.includes(row.category);
    const matchesClassification = activeFilters.classification.length === 0 || activeFilters.classification.includes(row.abcClassification);
    const matchesType = activeFilters.type.length === 0 || activeFilters.type.some(label => {
      const typeMap = {
        "Raw Material": "Raw",
        "Semi-Finished Material": "Component",
        "Finished Material": "Consumable"
      };
      return typeMap[label] === row.type;
    });
    const matchesStockRisk = activeFilters.stockRisk.length === 0 || activeFilters.stockRisk.includes(row.stockRisk);
    const matchesStatus = activeFilters.status.length === 0 || activeFilters.status.includes(row.status);

    return matchesSearch && matchesCategory && matchesClassification && matchesType && matchesStockRisk && matchesStatus;
  }).sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1;
    const aVal = a[sortBy] || "";
    const bVal = b[sortBy] || "";
    if (typeof aVal === "string") {
      return aVal.localeCompare(bVal) * direction;
    }
    return (aVal - bVal) * direction;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const visibleRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const availableBodyHeight = Math.max(220, viewportHeight - 412);
  const shouldScroll = visibleRows.length * 72 > availableBodyHeight;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const StockTooltip = ({ content, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
      <div 
        style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        {isVisible && (
          <div style={{
            position: "absolute",
            bottom: "calc(100% + 10px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--neutral-on-surface-primary)",
            color: "var(--neutral-surface-primary)",
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "var(--font-weight-bold)",
            whiteSpace: "nowrap",
            zIndex: 100,
            boxShadow: "var(--elevation-sm)"
          }}>
            {content}
            <div style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              borderWidth: "6px",
              borderStyle: "solid",
              borderColor: "var(--neutral-on-surface-primary) transparent transparent transparent"
            }} />
          </div>
        )}
      </div>
    );
  };

  const getStockWarningIcon = (risk) => {
    const iconColor = "var(--status-red-primary)";
    
    if (risk === "Expired Batches") {
      return (
        <StockTooltip content="Batch is expired">
          <div style={{ display: "flex", color: iconColor }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              {/* Centered Exclamation Mark */}
              <path d="M12 13v3.5" />
              <path d="M12 19h.01" />
            </svg>
          </div>
        </StockTooltip>
      );
    }
    
    if (risk === "Out of Stock") {
      return (
        <StockTooltip content="Out of stock">
          <div style={{ display: "flex", color: iconColor }}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {/* Enlarged Box icon to match calendar weight */}
              <path d="M17 8.5 11 5 5 8.5v7l6 3.5 6-3.5v-7Z" />
              <path d="M5 8.5 11 12 17 8.5" />
              <path d="M11 19v-7" />
              {/* Slightly overlapping Chevrons */}
              <path d="m16 15.5 3.5 3.5 3.5-3.5" />
              <path d="m16 19.5 3.5 3.5 3.5-3.5" />
            </svg>
          </div>
        </StockTooltip>
      );
    }
    
    if (risk === "Low Stock") {
      return (
        <StockTooltip content="Low on stock">
          <div style={{ display: "flex", color: "var(--status-orange-primary)" }}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8.5 11 5 5 8.5v7l6 3.5 6-3.5v-7Z" />
              <path d="M5 8.5 11 12 17 8.5" />
              <path d="M11 19v-7" />
              <path d="m16 15.5 3.5 3.5 3.5-3.5" />
              <path d="m16 19.5 3.5 3.5 3.5-3.5" />
            </svg>
          </div>
        </StockTooltip>
      );
    }
    
    return null;
  };

  const getABCBadge = (classification) => {
    let color = "var(--status-grey-primary)";
    let bg = "var(--status-grey-container)";

    if (classification === "A") {
      color = "var(--status-red-primary)";
      bg = "var(--status-red-container)";
    } else if (classification === "B") {
      color = "var(--feature-brand-primary)";
      bg = "var(--feature-brand-container-lighter)";
    } else if (classification === "C") {
      color = "var(--status-green-primary)";
      bg = "var(--status-green-container)";
    }

    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 12px",
        borderRadius: "var(--radius-full)",
        background: bg,
        width: "fit-content"
      }}>
        <div style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: color
        }} />
        <span style={{
          fontSize: "var(--text-body)",
          fontWeight: "var(--font-weight-bold)",
          color: color
        }}>
          {classification}
        </span>
      </div>
    );
  };

  const formatType = (type) => {
    const typeMap = {
      "Raw": "Raw Material",
      "Component": "Semi-Finished Material",
      "Consumable": "Finished Material"
    };
    return typeMap[type] || type;
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleFilterClick = (key, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverTriggerRect(rect);
    setOpenFilterKey(prev => prev === key ? null : key);
  };

  const toggleFilterValue = (key, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const handleSaveMaterial = (data) => {
    const newMaterial = {
      id: Date.now(),
      name: data.name,
      sku: data.sku || `MAT-${Date.now().toString().slice(-4)}`,
      category: data.category,
      abcClassification: data.abcClassification,
      type: data.materialType === "Raw" ? "Raw" : data.materialType === "Component" ? "Component" : "Consumable",
      image: data.image,
      onHandStock: 0,
      unit: data.uom,
      averageCost: 0,
      status: "Active",
      stockRisk: "Healthy",
      description: data.description
    };

    setMaterials(prev => [newMaterial, ...prev]);
    showSnackbar?.("Material successfully saved", "success");
    setIsCreateDrawerOpen(false);
  };

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
      {/* Header */}
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
          Materials
        </h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="outlined" leftIcon={Upload} onClick={() => setIsUploadModalOpen(true)}>
            Bulk Upload
          </Button>
          <Button variant="outlined" leftIcon={Settings} onClick={() => onNavigate("settings")}>
            Manage
          </Button>
          <Button variant="filled" leftIcon={AddIcon} onClick={() => setIsCreateDrawerOpen(true)}>
            New Material
          </Button>
        </div>
      </div>

      {/* ABC Classification Cards */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {abcClassificationCards.map((card) => (
          <ListStatusCounterCard
            key={card.key}
            label={card.label}
            count={abcCounts[card.key] || 0}
            badgeVariant={card.color}
            active={activeFilters.classification.includes(card.key)}
            onClick={() => toggleClassification(card.key)}
          />
        ))}
      </div>

      {/* Filter & Search Bar Section */}
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
          {/* Filters on the left */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", position: "relative" }}>
            <div onClick={(e) => handleFilterClick("category", e)}>
              <FilterPill
                label="Category"
                active={activeFilters.category.length > 0}
                isOpen={openFilterKey === "category"}
                count={activeFilters.category.length}
              />
            </div>

            <div onClick={(e) => handleFilterClick("type", e)}>
              <FilterPill
                label="Type"
                active={activeFilters.type.length > 0}
                isOpen={openFilterKey === "type"}
                count={activeFilters.type.length}
              />
            </div>

            <div onClick={(e) => handleFilterClick("stockRisk", e)}>
              <FilterPill
                label="Stock Risk Status"
                active={activeFilters.stockRisk.length > 0}
                isOpen={openFilterKey === "stockRisk"}
                count={activeFilters.stockRisk.length}
              />
            </div>

            <div onClick={(e) => handleFilterClick("status", e)}>
              <FilterPill
                label="Status"
                active={activeFilters.status.length > 0}
                isOpen={openFilterKey === "status"}
                count={activeFilters.status.length}
              />
            </div>

            {/* Filter Popovers - Fixed Positioned like PO Page */}
            {openFilterKey && (
              <>
                <div 
                  style={{ position: "fixed", inset: 0, zIndex: 999 }} 
                  onClick={() => setOpenFilterKey(null)} 
                />
                <div
                  style={{
                    position: "fixed",
                    top: popoverTriggerRect ? `${popoverTriggerRect.bottom + 8}px` : "160px",
                    left: popoverTriggerRect ? `${popoverTriggerRect.left}px` : "0",
                    width: "320px",
                    background: "var(--neutral-surface-primary)",
                    border: "1px solid var(--neutral-line-separator-1)",
                    borderRadius: "var(--radius-card)",
                    boxShadow: "var(--elevation-sm)",
                    padding: "16px",
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>
                      {openFilterKey === "category" ? "Category" : 
                       openFilterKey === "type" ? "Type" : 
                       openFilterKey === "stockRisk" ? "Stock Risk Status" : "Status"}
                    </span>
                    <button
                      onClick={() => {
                        setActiveFilters(prev => ({ ...prev, [openFilterKey]: [] }));
                        setOpenFilterKey(null);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--status-red-primary)",
                        cursor: "pointer",
                        fontSize: "var(--text-body)",
                        fontWeight: "var(--font-weight-bold)",
                        padding: 0
                      }}
                    >
                      Remove Filter
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {(openFilterKey === "category" ? ["Raw Material", "Chemicals", "Electronics", "Fasteners"] :
                      openFilterKey === "type" ? ["Raw Material", "Semi-Finished Material", "Finished Material"] :
                      openFilterKey === "stockRisk" ? ["Low Stock", "Out of Stock", "Expired Batches"] :
                      ["Active", "Inactive"]
                    ).map((option) => (
                      <label
                        key={option}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          cursor: "pointer",
                          fontSize: "var(--text-title-3)",
                          color: "var(--neutral-on-surface-primary)"
                        }}
                      >
                        <Checkbox
                          checked={activeFilters[openFilterKey].includes(option)}
                          onChange={() => toggleFilterValue(openFilterKey, option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Search on the right */}
          <TableSearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search materials by name or SKU..."
            width="360px"
          />
        </div>

        {/* Table */}
        <div
          style={{
            height: shouldScroll ? `${availableBodyHeight}px` : "auto",
            maxHeight: "calc(100vh - 412px)",
            overflowX: "auto",
            overflowY: shouldScroll ? "auto" : "visible",
            width: "100%",
          }}
        >
          <div style={{ minWidth: "1100px", width: "100%", display: "flex", flexDirection: "column" }}>
            {/* Table Header */}
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
                    padding: "16px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "var(--text-title-3)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                    cursor: col.sortable ? "pointer" : "default",
                  }}
                >
                  {col.label}
                  {col.sortable && (
                    <ChevronDownIcon
                      size={14}
                      color={sortBy === col.key ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-tertiary)"}
                      style={{
                        transform: sortBy === col.key && sortDirection === "asc" ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Table Body */}
            <div style={{ display: "flex", flexDirection: "column" }}>
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
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--neutral-surface-primary)")}
                >
                  {/* Image Column */}
                  <div style={{ flex: tableColumns[0].flex, padding: "12px" }}>
                    {row.image ? (
                      <img
                        src={row.image}
                        alt={row.name}
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "var(--radius-md)",
                          objectFit: "cover",
                          border: "1px solid var(--neutral-line-separator-1)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "var(--radius-md)",
                          background: "var(--neutral-surface-grey-lighter)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid var(--neutral-line-separator-1)",
                        }}
                      >
                        <Box size={20} color="var(--neutral-on-surface-tertiary)" />
                      </div>
                    )}
                  </div>

                  {/* Name Column */}
                  <div style={{ flex: tableColumns[1].flex, padding: "12px", display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>
                      {row.name}
                    </span>
                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
                      {row.sku}
                    </span>
                  </div>

                  {/* Category */}
                  <div style={{ flex: tableColumns[2].flex, padding: "12px", fontSize: "var(--text-title-3)" }}>
                    {row.category}
                  </div>

                  {/* ABC Classification */}
                  <div style={{ flex: tableColumns[3].flex, padding: "12px" }}>
                    {getABCBadge(row.abcClassification)}
                  </div>

                  {/* Type */}
                  <div style={{ flex: tableColumns[4].flex, padding: "12px", fontSize: "var(--text-title-3)" }}>
                    {formatType(row.type)}
                  </div>

                  {/* On-Hand Stock */}
                  <div style={{ flex: tableColumns[5].flex, padding: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-regular)" }}>
                      {row.onHandStock} {row.unit}
                    </span>
                    {getStockWarningIcon(row.stockRisk)}
                  </div>

                  {/* Average Cost */}
                  <div style={{ flex: tableColumns[6].flex, padding: "12px", fontSize: "var(--text-title-3)" }}>
                    {formatCurrency(row.averageCost)}
                  </div>

                  {/* Status */}
                  <div style={{ flex: tableColumns[7].flex, padding: "12px" }}>
                    <StatusBadge variant={row.status === "Active" ? "green" : "grey"}>
                      {row.status}
                    </StatusBadge>
                  </div>
                </div>
              ))}

              {filteredRows.length === 0 && (
                <div
                  style={{
                    padding: "64px",
                    textAlign: "center",
                    color: "var(--neutral-on-surface-tertiary)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <SearchIcon size={48} />
                  <span style={{ fontSize: "var(--text-title-2)" }}>No materials found.</span>
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
        />
      </div>

      <MaterialCreateDrawer 
        isOpen={isCreateDrawerOpen} 
        onClose={() => setIsCreateDrawerOpen(false)} 
        onSave={handleSaveMaterial}
      />

      <MaterialUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUpload={(file) => {
          console.log("Uploading file:", file);
          showSnackbar?.("Material successfully saved", "success");
        }}
      />
    </div>
  );
};
