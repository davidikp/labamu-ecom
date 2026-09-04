import React, { useEffect, useState } from "react";
import {
  AddIcon,
  Settings,
  Upload,
  SearchNotFoundIllustration,
  Box,
  GridViewIcon,
  ListViewIcon,
} from "../../../components/icons/Icons.jsx";
import { EmptyState } from "../../../ce-ui";
import { Button } from "../../../components/common/Button.jsx";
import { FilterMenu } from "../../../components/molecules/FilterMenu.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { getProducts, subscribeProducts } from "../mock/productsMocks.js";
import { ProductCreateDrawer } from "../components/ProductCreateDrawer.jsx";

export const ProductCatalogPage = ({ onNavigate, showSnackbar, t }) => {
  const tr = (key, fallback) => (t ? t(key, fallback) : fallback);

  const [products, setProducts] = useState(getProducts());
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    category: [],
    status: [],
    source: [],
  });

  useEffect(() => subscribeProducts(setProducts), []);

  const FILTER_OPTIONS = {
    category: Array.from(new Set(products.map((p) => p.category))).sort(),
    status: ["Active", "Inactive"],
    source: ["Standard Catalog", "Bulk Upload"],
  };
  const filterOptions = (key) => FILTER_OPTIONS[key].map((o) => ({ value: o, label: o }));
  const setFilterValues = (key, values) => setActiveFilters((prev) => ({ ...prev, [key]: values }));

  const tableColumns = [
    { label: "Image", key: "image", flex: "0.8" },
    { label: "Product Name", key: "name", flex: "2.5" },
    { label: "SKU", key: "sku", flex: "1.3" },
    { label: "Category", key: "category", flex: "1.3" },
    { label: "Price", key: "price", flex: "1.3" },
    { label: "Lead Time", key: "leadTime", flex: "1.1" },
    { label: "Source", key: "source", flex: "1.3" },
    { label: "Status", key: "status", flex: "1" },
  ];

  const filteredRows = products.filter((row) => {
    const matchesSearch =
      !searchQuery ||
      `${row.name} ${row.sku}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeFilters.category.length === 0 || activeFilters.category.includes(row.category);
    const matchesStatus = activeFilters.status.length === 0 || activeFilters.status.includes(row.status);
    const matchesSource = activeFilters.source.length === 0 || activeFilters.source.includes(row.source);
    return matchesSearch && matchesCategory && matchesStatus && matchesSource;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const visibleRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val || 0);

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: "var(--text-big-title)", fontWeight: "var(--font-weight-bold)" }}>
          {tr("product_catalog.title", "Product Catalog")}
        </h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="outlined" leftIcon={Upload} onClick={() => onNavigate("product_catalog_bulk-upload-list")}>
            Bulk Upload
          </Button>
          <Button variant="outlined" leftIcon={Settings} onClick={() => onNavigate("product_catalog_manage")}>
            Manage
          </Button>
          <Button variant="filled" leftIcon={AddIcon} onClick={() => setIsCreateDrawerOpen(true)}>
            New Product
          </Button>
        </div>
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <FilterMenu
              label="Category"
              multiple
              searchable={false}
              options={filterOptions("category")}
              values={activeFilters.category}
              onChangeMultiple={(values) => setFilterValues("category", values)}
            />
            <FilterMenu
              label="Status"
              multiple
              searchable={false}
              options={filterOptions("status")}
              values={activeFilters.status}
              onChangeMultiple={(values) => setFilterValues("status", values)}
            />
            <FilterMenu
              label="Source"
              multiple
              searchable={false}
              options={filterOptions("source")}
              values={activeFilters.source}
              onChangeMultiple={(values) => setFilterValues("source", values)}
            />

            <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--neutral-line-separator-2)", borderRadius: "8px", overflow: "hidden" }}>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                style={{
                  border: "none",
                  padding: "8px 10px",
                  cursor: "pointer",
                  background: viewMode === "list" ? "var(--feature-brand-container-lighter)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ListViewIcon size={18} color={viewMode === "list" ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-secondary)"} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                style={{
                  border: "none",
                  padding: "8px 10px",
                  cursor: "pointer",
                  background: viewMode === "grid" ? "var(--feature-brand-container-lighter)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <GridViewIcon size={18} color={viewMode === "grid" ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-secondary)"} />
              </button>
            </div>
          </div>

          <TableSearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Products by Name or SKU"
            width="360px"
          />
        </div>

        {/* Table */}
        <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto", overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "1000px", width: "100%", display: "flex", flexDirection: "column" }}>
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
                  style={{
                    flex: col.flex,
                    padding: "16px 12px",
                    fontSize: "var(--text-title-3)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  {col.label}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {visibleRows.map((row) => (
                <div
                  key={row.id}
                  style={{
                    display: "flex",
                    background: "var(--neutral-surface-primary)",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--neutral-surface-primary)")}
                >
                  <div style={{ flex: tableColumns[0].flex, padding: "12px" }}>
                    {row.image ? (
                      <img
                        src={row.image}
                        alt={row.name}
                        style={{ width: "48px", height: "48px", borderRadius: "var(--radius-md)", objectFit: "cover", border: "1px solid var(--neutral-line-separator-1)" }}
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

                  <div style={{ flex: tableColumns[1].flex, padding: "12px", fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>
                    {row.name}
                  </div>

                  <div style={{ flex: tableColumns[2].flex, padding: "12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>
                    {row.sku}
                  </div>

                  <div style={{ flex: tableColumns[3].flex, padding: "12px", fontSize: "var(--text-title-3)" }}>
                    {row.category}
                  </div>

                  <div style={{ flex: tableColumns[4].flex, padding: "12px", fontSize: "var(--text-title-3)" }}>
                    {formatCurrency(row.price)}
                  </div>

                  <div style={{ flex: tableColumns[5].flex, padding: "12px", fontSize: "var(--text-title-3)" }}>
                    {row.leadTime}
                  </div>

                  <div style={{ flex: tableColumns[6].flex, padding: "12px", fontSize: "var(--text-title-3)" }}>
                    {row.source}
                  </div>

                  <div style={{ flex: tableColumns[7].flex, padding: "12px" }}>
                    <StatusBadge variant={row.status === "Active" ? "green" : "grey"}>{row.status}</StatusBadge>
                  </div>
                </div>
              ))}

              {filteredRows.length === 0 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <EmptyState
                    illustration={<SearchNotFoundIllustration />}
                    title="No products found"
                    description="Try adjusting your filters or search keywords."
                  />
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

      <ProductCreateDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onSaved={() => {
          setIsCreateDrawerOpen(false);
          showSnackbar?.("Product successfully saved", "success");
        }}
      />
    </div>
  );
};
