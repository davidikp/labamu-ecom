import React, { useState } from "react";
import { 
  ChevronLeftIcon, 
  EditIcon, 
  Box,
  ImageAssetIcon
} from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { StockBatchesTab } from "../components/StockBatchesTab.jsx";
import { StockTransactionsTab } from "../components/StockTransactionsTab.jsx";
import { MaterialCreateDrawer } from "../components/MaterialCreateDrawer.jsx";
import { MOCK_STOCK_BATCHES } from "../mock/batchesMocks.js";
import { MOCK_STOCK_TRANSACTIONS } from "../mock/transactionsMocks.js";

export const MaterialDetailPage = ({ material, onNavigate, showSnackbar, t }) => {
  const [activeTab, setActiveTab] = useState("stock_batches");
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState(material);
  const [localBatches, setLocalBatches] = useState(MOCK_STOCK_BATCHES);
  const [localTransactions, setLocalTransactions] = useState(MOCK_STOCK_TRANSACTIONS);

  const handleBack = () => {
    if (material?.returnTo) {
      onNavigate(material.returnTo.view, material.returnTo.data);
    } else {
      onNavigate("list");
    }
  };

  if (!material) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <p>Material not found.</p>
        <Button onClick={handleBack}>Back to Previous Page</Button>
      </div>
    );
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const formatType = (type) => {
    const typeMap = {
      "Raw": "Raw Material",
      "Component": "Semi-Finished Material",
      "Consumable": "Finished Material"
    };
    return typeMap[type] || type;
  };

  const getABCBadge = (classification) => {
    let color = "var(--status-red-primary)";
    let bgColor = "var(--status-red-container)";
    if (classification === "B") {
      color = "var(--feature-brand-primary)";
      bgColor = "var(--feature-brand-container-lighter)";
    } else if (classification === "C") {
      color = "var(--status-green-primary)";
      bgColor = "var(--status-green-container)";
    }

    return (
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "100px",
        background: bgColor,
        color: color,
        fontSize: "12px",
        fontWeight: "var(--font-weight-bold)",
        lineHeight: "1",
        whiteSpace: "nowrap"
      }}>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color }} />
        {classification}
      </div>
    );
  };

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
    fontWeight: isActive
      ? "var(--font-weight-bold)"
      : "var(--font-weight-regular)",
    cursor: "pointer",
    transition: "all 0.18s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap"
  });

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

  const DetailField = ({ label, value, fullWidth = false, isABC = false, extraComponent = null }) => (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: "4px",
      gridColumn: fullWidth ? "1 / -1" : "span 1"
    }}>
      <span style={{ 
        fontSize: "var(--text-body)", 
        color: "var(--neutral-on-surface-secondary)",
        fontWeight: "var(--font-weight-regular)"
      }}>
        {label}
      </span>
      {isABC ? (
        <div>
          {getABCBadge(value)}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ 
            fontSize: "var(--text-title-3)", 
            color: "var(--neutral-on-surface-primary)",
            fontWeight: "var(--font-weight-bold)"
          }}>
            {value || "-"}
          </span>
          {extraComponent}
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      height: "calc(100vh - 64px)",
      padding: "24px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      overflowY: "auto"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div 
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginLeft: "-4px" }}
            onClick={handleBack}
          >
            <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
            <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>
              Material Detail
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)", marginLeft: "32px" }}>
            <span 
              style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }}
              onClick={handleBack}
            >
              {material.from === "purchase_order_detail" ? "Purchase Order" : "Materials"}
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>Material Detail</span>
          </div>
        </div>
        <Button variant="outlined" leftIcon={EditIcon} onClick={() => setIsEditDrawerOpen(true)}>
          Edit Material
        </Button>
      </div>

      {/* Overview Card */}
      <div style={{
        background: "var(--neutral-surface-primary)",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--neutral-line-separator-1)",
        padding: "24px",
        display: "flex",
        gap: "32px"
      }}>
        {/* Left: Image Section */}
        <div style={{ width: "320px", flexShrink: 0 }}>
          <div style={{ 
            width: "320px", 
            height: "240px", 
            borderRadius: "var(--radius-md)", 
            overflow: "hidden",
            background: "var(--neutral-surface-grey-lighter)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--neutral-line-separator-2)"
          }}>
            {material.image ? (
              <img 
                src={material.image} 
                alt={material.name} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: "var(--neutral-on-surface-tertiary)" }}>
                <ImageAssetIcon size={48} />
                <span style={{ fontSize: "var(--text-body)" }}>No Image</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Info Section */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h2 style={{ margin: 0, fontSize: "var(--text-headline)", fontWeight: "var(--font-weight-bold)" }}>
              {currentMaterial.name}
            </h2>
            <StatusBadge variant={currentMaterial.status === "Active" ? "green" : "grey"}>
              {currentMaterial.status}
            </StatusBadge>
          </div>

          <div style={{ height: "1px", background: "var(--neutral-line-separator-2)", width: "100%" }} />

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: "24px 32px" 
          }}>
            <DetailField label="SKU" value={currentMaterial.sku} />
            <DetailField label="Category" value={currentMaterial.category} />
            <DetailField label="Type" value={formatType(currentMaterial.type)} />
            
            <DetailField label="ABC Classification" value={currentMaterial.abcClassification} isABC />
            <DetailField label="Unit of Measure" value={currentMaterial.unit} />
            <DetailField 
              label="On-Hand Stock" 
              value={`${currentMaterial.onHandStock} ${currentMaterial.unit}`} 
              extraComponent={getStockWarningIcon(currentMaterial.stockRisk)}
            />
            
            <DetailField label="Average Cost" value={formatCurrency(currentMaterial.averageCost)} />
            
            <DetailField 
              label="Description" 
              value={currentMaterial.description} 
              fullWidth 
            />
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setActiveTab("stock_batches")}
            style={tabButtonStyle(activeTab === "stock_batches")}
          >
            Stock Batches
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("stock_transaction")}
            style={tabButtonStyle(activeTab === "stock_transaction")}
          >
            Stock Transactions
          </button>
        </div>

        <div style={{
          minHeight: "200px"
        }}>
          {activeTab === "stock_batches" ? (
            <StockBatchesTab 
              materialId={currentMaterial.id} 
              localBatches={localBatches}
              setLocalBatches={setLocalBatches}
              localTransactions={localTransactions}
              setLocalTransactions={setLocalTransactions}
              showSnackbar={showSnackbar}
              onNavigate={onNavigate}
              currentMaterial={currentMaterial}
            />
          ) : (
            <StockTransactionsTab 
              materialId={currentMaterial.id} 
              onNavigate={onNavigate} 
              localTransactions={localTransactions}
            />
          )}
        </div>
      </div>

      <MaterialCreateDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        initialData={currentMaterial}
        onSave={(data) => {
          setCurrentMaterial(prev => ({
            ...prev,
            ...data,
            type: data.materialType,
            unit: data.uom,
            onHandStock: prev.onHandStock, // Preserve stock
            averageCost: prev.averageCost // Preserve cost
          }));
          showSnackbar?.("Material successfully saved", "success");
        }}
      />
    </div>
  );
};
