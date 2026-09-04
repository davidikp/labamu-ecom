import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  EditIcon,
  SearchIcon,
  Plus
} from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { Checkbox } from "../../../components/common/Checkbox.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { FormField, InputField } from "../../../components/index.js";

const tabButtonStyle = (isActive) => ({
  height: "48px",
  padding: "0 28px",
  borderRadius: "100px",
  border: isActive
    ? "1px solid var(--feature-brand-primary)"
    : "1px solid transparent",
  background: isActive ? "#EAF1FF" : "var(--neutral-surface-primary)",
  color: isActive ? "var(--feature-brand-primary)" : "#7F7F7F",
  fontSize: "var(--text-title-2)",
  fontWeight: "var(--font-weight-regular)",
  cursor: "pointer",
  transition: "all 0.18s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap"
});

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



const RadioGroup = ({ options, value, onChange }) => (
  <div style={{ display: "flex", gap: "24px", marginTop: "4px" }}>
    {options.map((opt) => (
      <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
        <div 
          onClick={() => onChange(opt.value)}
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: `2px solid ${value === opt.value ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-2)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease"
          }}
        >
          {value === opt.value && (
            <div style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "var(--feature-brand-primary)"
            }} />
          )}
        </div>
        <span style={{ fontSize: "var(--text-subtitle-1)", color: "var(--neutral-on-surface-primary)" }}>
          {opt.label}
        </span>
      </label>
    ))}
  </div>
);

const MOCK_CATEGORIES = [
  { id: 1, name: "Raw Material", description: "Primary materials used in production", status: "Active" },
  { id: 2, name: "Chemicals", description: "Chemical reagents and substances", status: "Active" },
  { id: 3, name: "Electronics", description: "Electronic components and circuits", status: "Active" },
  { id: 4, name: "Fasteners", description: "Screws, bolts, and other fasteners", status: "Inactive" },
  { id: 5, name: "Packaging", description: "Materials for product packaging", status: "Active" },
];

const MOCK_UOMS = [
  { id: 1, name: "Kilogram", alias: "KG", status: "Active" },
  { id: 2, name: "Piece", alias: "PCS", status: "Active" },
  { id: 3, name: "Liter", alias: "L", status: "Active" },
  { id: 4, name: "Meter", alias: "M", status: "Inactive" },
  { id: 5, name: "Box", alias: "BOX", status: "Active" },
];

export const MaterialManagePage = ({ onNavigate, showSnackbar, t }) => {
  const [activeTab, setActiveTab] = useState("Category");
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterTriggerRect, setFilterTriggerRect] = useState(null);

  // Data states
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [uoms, setUoms] = useState(MOCK_UOMS);

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isUomModalOpen, setIsUomModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("Add"); // "Add" or "Edit"
  const [selectedId, setSelectedId] = useState(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", status: "Active" });
  const [uomForm, setUomForm] = useState({ name: "", alias: "", status: "Active" });
  
  // Error states
  const [categoryErrors, setCategoryErrors] = useState({});
  const [uomErrors, setUomErrors] = useState({});

  const handleFilterClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFilterTriggerRect(rect);
    setIsFilterOpen(!isFilterOpen);
  };

  const toggleStatusFilter = (status) => {
    setStatusFilter(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const filteredData = (activeTab === "Category" ? categories : uoms).filter(item => {
    const nameVal = item.name || "";
    const descVal = activeTab === "Category" ? (item.description || "") : (item.alias || "");
    
    const matchesSearch = nameVal.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          descVal.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(item.status);
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) {
      setCategoryErrors({ name: "Field cannot be empty" });
      return;
    }

    if (modalMode === "Add") {
      const newCategory = {
        id: Date.now(),
        ...categoryForm,
        status: "Active"
      };
      setCategories(prev => [newCategory, ...prev]);
    } else {
      setCategories(prev => prev.map(c => c.id === selectedId ? { ...c, ...categoryForm } : c));
    }

    showSnackbar?.("Category successfully saved", "success");
    setIsCategoryModalOpen(false);
    setCategoryForm({ name: "", description: "", status: "Active" });
    setCategoryErrors({});
    setSelectedId(null);
  };

  const handleSaveUom = () => {
    if (!uomForm.name.trim()) {
      setUomErrors({ name: "Field cannot be empty" });
      return;
    }

    if (modalMode === "Add") {
      const newUom = {
        id: Date.now(),
        ...uomForm,
        status: "Active"
      };
      setUoms(prev => [newUom, ...prev]);
    } else {
      setUoms(prev => prev.map(u => u.id === selectedId ? { ...u, ...uomForm } : u));
    }

    showSnackbar?.("UOM successfully saved", "success");
    setIsUomModalOpen(false);
    setUomForm({ name: "", alias: "", status: "Active" });
    setUomErrors({});
    setSelectedId(null);
  };

  const handleEditCategory = (category) => {
    setModalMode("Edit");
    setSelectedId(category.id);
    setCategoryForm({ name: category.name, description: category.description, status: category.status });
    setCategoryErrors({});
    setIsCategoryModalOpen(true);
  };

  const handleEditUom = (uom) => {
    setModalMode("Edit");
    setSelectedId(uom.id);
    setUomForm({ name: uom.name, alias: uom.alias, status: uom.status });
    setUomErrors({});
    setIsUomModalOpen(true);
  };

  const categoryColumns = [
    { label: "Category Name", flex: "2" },
    { label: "Description", flex: "3" },
    { label: "Status", flex: "1" },
    { label: "", flex: "1" },
  ];

  const uomColumns = [
    { label: "UOM Name", flex: "2" },
    { label: "UOM Alias", flex: "2" },
    { label: "Status", flex: "1" },
    { label: "", flex: "1" },
  ];

  const columns = activeTab === "Category" ? categoryColumns : uomColumns;

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-background-primary)",
      height: "100%",
      overflowY: "auto",
      padding: "24px"
    }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "12px", 
                cursor: "pointer",
                marginLeft: "-4px"
              }}
              onClick={() => onNavigate("list")}
            >
              <ChevronLeft size={28} color="var(--neutral-on-surface-primary)" />
              <h1 style={{ 
                margin: 0, 
                fontSize: "var(--text-large-title)", 
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
              }}>
                Manage Material
              </h1>
            </div>
            
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              fontSize: "var(--text-title-3)",
              marginLeft: "32px"
            }}>
              <span 
                style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }}
                onClick={() => onNavigate("list")}
              >
                Materials
              </span>
              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
              <span style={{ color: "var(--neutral-on-surface-secondary)" }}>Manage Material</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <Button variant="outlined" leftIcon={Plus} onClick={() => { 
              setModalMode("Add");
              setCategoryForm({ name: "", description: "", status: "Active" });
              setIsCategoryModalOpen(true); 
              setCategoryErrors({}); 
            }}>
              Add Category
            </Button>
            <Button variant="outlined" leftIcon={Plus} onClick={() => { 
              setModalMode("Add");
              setUomForm({ name: "", alias: "", status: "Active" });
              setIsUomModalOpen(true); 
              setUomErrors({}); 
            }}>
              Add UOM
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "24px" }}>
          {["Category", "Unit of Measurement"].map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
                setSearchQuery("");
                setStatusFilter([]);
              }}
              style={tabButtonStyle(activeTab === tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Card */}
      <div style={{ 
        background: "var(--neutral-surface-primary)", 
        borderRadius: "16px", 
        border: "1px solid var(--neutral-line-separator-1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* Table Toolbar */}
        <div style={{ 
          padding: "16px 20px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          borderBottom: "1px solid var(--neutral-line-separator-2)" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
            <div onClick={handleFilterClick}>
              <FilterPill 
                label="Status" 
                active={statusFilter.length > 0} 
                isOpen={isFilterOpen} 
                count={statusFilter.length}
              />
            </div>

            {isFilterOpen && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 999 }} onClick={() => setIsFilterOpen(false)} />
                <div style={{
                  position: "fixed",
                  top: filterTriggerRect ? `${filterTriggerRect.bottom + 8}px` : "160px",
                  left: filterTriggerRect ? `${filterTriggerRect.left}px` : "0",
                  width: "240px",
                  background: "var(--neutral-surface-primary)",
                  border: "1px solid var(--neutral-line-separator-1)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "var(--elevation-sm)",
                  padding: "16px",
                  zIndex: 1000,
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>Status</span>
                    <button
                      onClick={() => setStatusFilter([])}
                      style={{ background: "none", border: "none", color: "var(--status-red-primary)", cursor: "pointer", fontSize: "var(--text-body)", fontWeight: "var(--font-weight-bold)" }}
                    >
                      Clear
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {["Active", "Inactive"].map(status => (
                      <label key={status} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                        <Checkbox checked={statusFilter.includes(status)} onChange={() => toggleStatusFilter(status)} />
                        <span style={{ fontSize: "var(--text-title-3)" }}>{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <TableSearchField 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            style={{ width: "320px" }}
          />
        </div>

        {/* Table */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Table Header */}
          <div style={{ display: "flex", background: "var(--neutral-surface-primary)", borderBottom: "1px solid var(--neutral-line-separator-1)" }}>
            {columns.map((col, idx) => (
              <div key={idx} style={{ 
                flex: col.flex, 
                padding: "0 12px", 
                height: "49px", 
                display: "flex", 
                alignItems: "center" 
              }}>
                <span style={{ 
                  fontSize: "var(--text-title-3)", 
                  fontWeight: "var(--font-weight-bold)", 
                  color: "var(--neutral-on-surface-primary)"
                }}>
                  {col.label}
                </span>
              </div>
            ))}
          </div>

          {/* Table Body */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {paginatedData.length > 0 ? paginatedData.map((row) => (
              <div 
                key={row.id} 
                style={{ 
                  display: "flex", 
                  borderBottom: "1px solid var(--neutral-line-separator-1)",
                  transition: "background 0.1s ease"
                }}
              >
                {activeTab === "Category" ? (
                  <>
                    <div style={cellStyle({ flex: columns[0].flex })}>{row.name}</div>
                    <div style={cellStyle({ flex: columns[1].flex })}>{row.description || "-"}</div>
                  </>
                ) : (
                  <>
                    <div style={cellStyle({ flex: columns[0].flex })}>{row.name}</div>
                    <div style={cellStyle({ flex: columns[1].flex })}>{row.alias || "-"}</div>
                  </>
                )}
                <div style={cellStyle({ flex: columns[2].flex })}>
                  <StatusBadge variant={row.status === "Active" ? "green" : "grey"}>
                    {row.status}
                  </StatusBadge>
                </div>
                <div style={cellStyle({ flex: columns[3].flex, justifyContent: "flex-end" })}>
                  <Button variant="outlined" leftIcon={EditIcon} onClick={() => {
                    if (activeTab === "Category") handleEditCategory(row);
                    else handleEditUom(row);
                  }}>
                    Edit
                  </Button>
                </div>
              </div>
            )) : (
              <div style={{ 
                padding: "64px 24px", 
                textAlign: "center", 
                color: "var(--neutral-on-surface-tertiary)", 
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px"
              }}>
                <SearchIcon size={48} />
                <span>No results found.</span>
              </div>
            )}
          </div>
        </div>

        {/* Pagination Footer */}
        <TablePaginationFooter
          totalRows={filteredData.length}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add/Edit Category Modal */}
      <GeneralModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={modalMode === "Add" ? "Add Category" : "Edit Category"}
        width="480px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button variant="outlined" size="large" onClick={() => setIsCategoryModalOpen(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button variant="filled" size="large" onClick={handleSaveCategory} style={{ flex: 1 }}>
              Save
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <InputField 
            label="Name" 
            required
            headerRight={`${categoryForm.name.length}/100`}
            error={categoryErrors.name}
            value={categoryForm.name}
            onChange={(e) => { 
              setCategoryForm({ ...categoryForm, name: e.target.value });
              if (e.target.value.trim()) setCategoryErrors(prev => ({ ...prev, name: null }));
            }}
            placeholder="Enter category name"
            maxLength={100}
          />
          
          <InputField 
            label="Description" 
            headerRight={`${categoryForm.description.length}/1000`}
            multiline={true}
            value={categoryForm.description}
            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            placeholder="Enter category description"
            maxLength={1000}
          />

          {modalMode === "Edit" && (
            <FormField label="Status">
              <RadioGroup 
                options={[{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }]}
                value={categoryForm.status}
                onChange={(val) => setCategoryForm({ ...categoryForm, status: val })}
              />
            </FormField>
          )}
        </div>
      </GeneralModal>

      {/* Add/Edit UOM Modal */}
      <GeneralModal
        isOpen={isUomModalOpen}
        onClose={() => setIsUomModalOpen(false)}
        title={modalMode === "Add" ? "Add Unit of Measurements" : "Edit Unit of Measurements"}
        width="480px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button variant="outlined" size="large" onClick={() => setIsUomModalOpen(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button variant="filled" size="large" onClick={handleSaveUom} style={{ flex: 1 }}>
              Save
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <InputField 
            label="Name" 
            required
            headerRight={`${uomForm.name.length}/100`}
            error={uomErrors.name}
            value={uomForm.name}
            onChange={(e) => {
              setUomForm({ ...uomForm, name: e.target.value });
              if (e.target.value.trim()) setUomErrors(prev => ({ ...prev, name: null }));
            }}
            placeholder="e.g. Kilogram, Piece, Meter"
            maxLength={100}
          />

          <InputField 
            label="UOM Alias" 
            headerRight={`${uomForm.alias.length}/100`}
            value={uomForm.alias}
            onChange={(e) => setUomForm({ ...uomForm, alias: e.target.value })}
            placeholder="e.g. kg, pcs, m"
            maxLength={100}
          />

          {modalMode === "Edit" && (
            <FormField label="Status">
              <RadioGroup 
                options={[{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }]}
                value={uomForm.status}
                onChange={(val) => setUomForm({ ...uomForm, status: val })}
              />
            </FormField>
          )}
        </div>
      </GeneralModal>
    </div>
  );
};
