import React, { useState, useEffect, useRef } from "react";
import {
  useNavigate,
  useLocation,
  useParams,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  Check,
  ChevronRight,
  Info,
} from "./components/icons/Icons.jsx";

import { PurchaseOrderListPage } from "./modules/purchase-order/pages/PurchaseOrderListPage.jsx";
import { PurchaseOrderDetailPage } from "./modules/purchase-order/pages/PurchaseOrderDetailPage.jsx";
import { PurchaseOrderCreatePage } from "./modules/purchase-order/pages/PurchaseOrderCreatePage.jsx";
import { PurchaseOrderSettingsPage } from "./modules/purchase-order/pages/PurchaseOrderSettingsPage.jsx";
import { WorkOrderListPage } from "./modules/work-order/pages/WorkOrderListPage.jsx";
import { WorkOrderDetailPage } from "./modules/work-order/pages/WorkOrderDetailPage.jsx";
import { OrderListPage } from "./modules/orders/pages/OrderListPage.jsx";
import { OrderDetailPage } from "./modules/orders/pages/OrderDetailPage.jsx";
import { OrderSettingsPage } from "./modules/orders/pages/OrderSettingsPage.jsx";
import { UserManagementPage } from "./modules/administration/pages/UserManagementPage.jsx";
import { NotificationSettingsPage } from "./modules/administration/pages/NotificationSettingsPage.jsx";
import { MaterialsListPage } from "./modules/materials/pages/MaterialsListPage.jsx";
import { MaterialDetailPage } from "./modules/materials/pages/MaterialDetailPage.jsx";
import { MaterialManagePage } from "./modules/materials/pages/MaterialManagePage.jsx";
import { MaterialRequestListPage } from "./modules/material-request/pages/MaterialRequestListPage.jsx";
import { MaterialRequestDetailPage } from "./modules/material-request/pages/MaterialRequestDetailPage.jsx";
import { MaterialForecastPage } from "./modules/material-forecast/pages/MaterialForecastPage.jsx";
import { MaterialForecastEmptyPage } from "./modules/material-forecast/pages/MaterialForecastEmptyPage.jsx";
import { IncomingPOPage } from "./modules/material-forecast/pages/IncomingPOPage.jsx";
import { DemandUrgencyDetailPage } from "./modules/material-forecast/pages/DemandUrgencyDetailPage.jsx";
import { MaterialPlanningSettingsPage } from "./modules/material-forecast/pages/MaterialPlanningSettingsPage.jsx";
import { ProcurementAPReportPage } from "./modules/analytics/pages/ProcurementAPReportPage.jsx";
import { POReportPage } from "./modules/analytics/pages/POReportPage.jsx";
import { VendorLiabilityReportPage } from "./modules/analytics/pages/VendorLiabilityReportPage.jsx";
import { APAgingReportPage } from "./modules/analytics/pages/APAgingReportPage.jsx";
import { DEFAULT_SYSTEM_NOTIFICATIONS } from "./data/notification/systemNotifications.js";
import { cloneNotificationSettings } from "./data/notification/notificationDefaults.js";
import {
  applyDomLocalization,
  getTranslation,
  LOCALIZABLE_ATTRIBUTES,
} from "./utils/localization/localizationUtils.js";
import { Sidebar } from "./components/layout/Sidebar.jsx";
import { TopHeader } from "./components/layout/TopHeader.jsx";

// --- MOCK DATA ---

const TRANSLATIONS = {
  en: {
    sidebar: {
      dashboard: "Dashboard",
      product: "Product",
      product_catalog: "Product Catalog",
      custom_product_request: "Custom Product Request",
      sales: "Sales",
      request_for_quotes: "Request for Quotes",
      quotes: "Quotes",
      orders: "Orders",
      invoices: "Invoices",
      customers: "Customers",
      resources: "Resources",
      material_request: "Material Request",
      procurement: "Procurement",
      material_forecast: "Material Planning",
      manufacturing: "Manufacturing",
      analytics: "Analytics",
      reports: "Reports",
      financing: "Domestic Financing",
      work_order: "Work Order",
      purchase_order: "Purchase Order",
      bill_of_materials: "Bill of Materials",
      routing: "Routing",
      administration: "Administration",
      user_management: "User Management",
      fx_management: "FX Management",
      notification_settings: "Notification Settings",
      company_settings: "Company Settings",
      labamu_staff: "Labamu Staff",
      user_guide: "User Guide",
      materials: "Materials",
      vendors: "Vendors",
      financial_report: "Financial Report",
      inventory_report: "Inventory Report",
      sales_funnel_report: "Sales Funnel Report",
      work_order_monitoring: "Work Order Monitoring",
      procurement_ap_report: "Procurement & AP Report",
    },
    role: {
      owner: "Owner",
    },
    message: {
      under_construction: "This module is under construction",
    },
    work_order: {
      title: "Work Order",
      settings: "Settings",
      summary: {
        not_started: "Not Started",
        ready_to_process: "Ready to Process",
        in_progress: "In Progress",
        completed: "Completed",
        canceled: "Canceled",
      },
    },
    purchase_order: {
      title: "Purchase Order",
      settings: "Settings",
      new: "New PO",
    },
  },
  id: {
    sidebar: {
      dashboard: "Dasbor",
      product: "Produk",
      product_catalog: "Katalog Produk",
      custom_product_request: "Permintaan Produk Kustom",
      sales: "Penjualan",
      request_for_quotes: "Permintaan Penawaran",
      quotes: "Penawaran",
      orders: "Pesanan",
      invoices: "Invoice",
      customers: "Pelanggan",
      resources: "Sumber Daya",
      material_request: "Permintaan Material",
      procurement: "Pengadaan",
      material_forecast: "Perencanaan Material",
      manufacturing: "Manufaktur",
      analytics: "Analitik",
      reports: "Laporan",
      financing: "Pembiayaan Domestik",
      work_order: "Perintah Kerja",
      purchase_order: "Purchase Order",
      bill_of_materials: "Daftar Material",
      routing: "Rute Produksi",
      administration: "Administrasi",
      user_management: "Manajemen Pengguna",
      fx_management: "Manajemen FX",
      notification_settings: "Pengaturan Notifikasi",
      company_settings: "Pengaturan Perusahaan",
      labamu_staff: "Staf Labamu",
      user_guide: "Panduan Pengguna",
      materials: "Material",
      vendors: "Vendor",
      financial_report: "Laporan Keuangan",
      inventory_report: "Laporan Inventaris",
      sales_funnel_report: "Laporan Sales Funnel",
      work_order_monitoring: "Monitoring Perintah Kerja",
      procurement_ap_report: "Laporan Pengadaan & Utang Usaha",
    },
    role: {
      owner: "Pemilik",
    },
    message: {
      under_construction: "Modul ini sedang dalam pengembangan",
    },
    work_order: {
      title: "Perintah Kerja",
      settings: "Pengaturan",
      summary: {
        not_started: "Belum Dimulai",
        ready_to_process: "Siap Diproses",
        in_progress: "Sedang Berjalan",
        completed: "Selesai",
        canceled: "Dibatalkan",
      },
    },
    purchase_order: {
      title: "Purchase Order",
      settings: "Pengaturan",
      new: "PO Baru",
    },
  },
};

const MODULE_TO_ROUTE = {
  work_order: "work-order",
  purchase_order: "purchase-order",
  orders: "orders",
  materials: "materials",
  material_request: "material-request",
  analytics: "analytics",
  administration: "administration",
  user_management: "user-management",
  notification_settings: "notification-settings",
  user_guide: "user-guide",
  material_forecast: "material-planning",
  procurement_ap_report: "procurement-ap-report",
  po_report: "po-report",
  vendor_liability_report: "vendor-liability-report",
  ap_aging_report: "ap-aging-report"
};

const ROUTE_TO_MODULE = Object.fromEntries(
  Object.entries(MODULE_TO_ROUTE).map(([k, v]) => [v, k])
);


// --- DESIGN SYSTEM ---
const LabamuStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@600;700&family=Lato:ital,wght@0,400;0,600;0,700;0,900;1,400&display=swap');

    :root {
      --font-family-base: 'Lato', sans-serif;
      --font-family-display: 'Inter', sans-serif;

      --neutral-background-primary: #F5F5F7;
      --neutral-surface-primary: #FFFFFF;
      --neutral-surface-grey-lighter: #F4F4F4;
      --neutral-surface-grey-darker: #E9E9E9;
      --neutral-surface-reverse: #7E7E7E;

      --neutral-on-surface-primary: #282828;
      --neutral-on-surface-secondary: #7E7E7E;
      --neutral-on-surface-tertiary: #A9A9A9;
      --neutral-on-surface-reverse: #FFFFFF;
      --neutral-on-surface-blue: #006BFF;

      --neutral-line-separator-1: #E9E9E9;
      --neutral-line-separator-2: #D4D4D4;
      --neutral-line-outline: #E9E9E9;
      --neutral-line-border: #E9E9E9;
      --neutral-line-scroller: #E9E9E9;

      --feature-brand-primary: #006BFF;
      --feature-brand-on-primary: #FFFFFF;
      --feature-brand-container: #E6F0FF;
      --feature-brand-container-darker: #E6F0FF;
      --feature-brand-container-lighter: #F3F7FE;
      --feature-brand-on-container: #005DE0;

      --feature-cashier-primary: #26C3BB;
      --feature-cashier-container: #E9F9F8;
      --feature-product-primary: #782AAE;
      --feature-product-container: #F2EAF7;
      --feature-invoice-primary: #FF9100;
      --feature-invoice-container: #FFF4E6;

      --status-grey-primary: #A9A9A9;
      --status-grey-on-primary: #FFFFFF;
      --status-grey-container: #E9E9E9;
      --status-grey-on-container: #535353;

      --status-green-primary: #54A73F;
      --status-green-on-primary: #FFFFFF;
      --status-green-container: #EEF6EC;
      --status-green-on-container: #52A33E;

      --status-yellow-primary: #F2CE17;
      --status-yellow-on-primary: #FFFFFF;
      --status-yellow-container: #FEFAE8;
      --status-yellow-on-container: #E0B20C;

      --status-orange-primary: #FF9100;
      --status-orange-on-primary: #FFFFFF;
      --status-orange-container: #FFF4E6;
      --status-orange-on-container: #E07F00;

      --status-red-primary: #D0021B;
      --status-red-on-primary: #FFFFFF;
      --status-red-container: #FAE6E8;
      --status-red-on-container: #D0021B;

      --text-display-large: 52px;
      --text-large-title: 26px;
      --text-big-title: 24px;
      --text-headline: 20px;
      --text-title-1: 18px;
      --text-title-2: 16px;
      --text-title-3: 14px;
      --text-subtitle-1: 16px;
      --text-subtitle-2: 14px;
      --text-body: 12px;
      --text-desc: 10px;
      
      --font-weight-regular: 400;
      --font-weight-semi-bold: 600;
      --font-weight-bold: 700;
      --font-weight-black: 900;

      --spacing-xx-sm: 4px;
      --spacing-x-sm: 8px;
      --spacing-sm: 12px;
      --spacing-md: 16px;
      --spacing-big: 20px;
      --spacing-x-big: 24px;
      --spacing-xx-big: 28px;
      --spacing-xxx-big: 32px;
      --spacing-lg: 40px;
      --spacing-x-lg: 48px;
      --spacing-xx-lg: 64px;

      --radius-full: 100px;
      --radius-2xl: 24px;
      --radius-xl: 16px;
      --radius-lg: 12px;
      --radius-md: 8px;
      --radius-sm: 4px;

      --radius: var(--radius-lg);
      --radius-button: var(--radius-lg);
      --radius-card: var(--radius-xl);
      --radius-input: 10px;
      --radius-medium: var(--radius-lg);
      --radius-small: var(--radius-md);
      --radius-xxs: var(--radius-sm);

      --elevation-sm: 0px 4px 12px rgba(0, 0, 0, 0.12);
      --elevation-sticky: 0px -3px 10px rgba(0, 0, 0, 0.04);
    }

    * {
      box-sizing: border-box;
      font-family: var(--font-family-base);
    }

    body {
      margin: 0;
      padding: 0;
      background-color: var(--neutral-background-primary);
      color: var(--neutral-on-surface-primary);
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }
    
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: var(--neutral-line-separator-2);
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--neutral-on-surface-tertiary);
    }

    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
    }
    input[type=number] {
      -moz-appearance: textfield;
    }

    .sidebar-flyout-item {
      transition: background 0.2s ease, color 0.2s ease;
    }

    .sidebar-flyout-item:hover {
      background: var(--feature-brand-container-lighter) !important;
      color: var(--feature-brand-primary) !important;
    }
  `}</style>
);

const ModuleRenderer = ({
  location,
  onNavigate,
  t,
  isSidebarCollapsed,
  poApprovalSettings,
  setPoApprovalSettings,
  orderApprovalSettings,
  setOrderApprovalSettings,
  showPoSnackbar,
  notificationSettings,
  setNotificationSettings,
  systemNotifications,
  setSystemNotifications,
  handleModuleChange,
  materialPlanningSettings,
  setMaterialPlanningSettings,
}) => {
  const { module: moduleRoute, id, subview } = useParams();
  const activeModule = ROUTE_TO_MODULE[moduleRoute] || moduleRoute?.replace(/-/g, '_');
  const viewState = { view: (id || "list").replace(/-/g, '_'), data: location.state };

  if (subview === "edit") {
    viewState.view = "create";
  }

  if (id && !viewState.data) {
    viewState.data = { id, poNumber: id, wo: id, material: { sku: id } };
  }

  const isSpecialView = ["list", "create", "settings", "manage"].includes(viewState.view) || 
                        activeModule === "analytics" || 
                        activeModule === "administration" ||
                        activeModule === "material_forecast" ||
                        activeModule === "procurement_ap_report" ||
                        activeModule === "po_report" ||
                        activeModule === "vendor_liability_report" ||
                        activeModule === "ap_aging_report";

  if (id && !isSpecialView && !subview) {
    viewState.view = "detail";
  } else if (viewState.view === "manage" && activeModule === "materials") {
    viewState.view = "settings";
  }

  if (activeModule === "procurement_ap_report") {
    if (viewState.view === "po_report") {
      return <POReportPage onNavigate={onNavigate} t={t} />;
    }
    if (viewState.view === "vendor_liability_report") {
      return <VendorLiabilityReportPage onNavigate={onNavigate} t={t} />;
    }
    if (viewState.view === "ap_aging_report") {
      return <APAgingReportPage onNavigate={onNavigate} t={t} />;
    }
    return <ProcurementAPReportPage onNavigate={onNavigate} />;
  }

  if (activeModule === "user_guide") {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#F5F6FA",
          height: "100%",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "40px 32px 80px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            width: "100%",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1A1D23", margin: 0 }}>
              User Guide
            </h1>
            <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>
              Complete step-by-step guide to using Labamu Manufacturing (MRP)
            </p>
          </div>

          {/* Intro Callout */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "16px 20px",
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
            }}
          >
            <Info size={18} color="#6B7280" style={{ flexShrink: 0, marginTop: "2px" }} />
            <span style={{ color: "#374151", fontSize: "14px", lineHeight: "1.6" }}>
              This guide walks you through the entire manufacturing workflow, from setup to production tracking. You can plan, produce, and monitor efficiently.
            </span>
          </div>

          {/* Step 1 */}
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", border: "2px solid #4F70E2", flexShrink: 0, padding: "4px" }}>
                <Check size={14} color="#4F70E2" />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1A1D23", margin: 0 }}>Step 1: Getting Started</h2>
            </div>
            <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "-8px", margin: 0 }}>Set up your account and understand the basics.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#1A1D23" }}>What you need to know:</span>
              <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px", color: "#4B5563", margin: 0, fontSize: "14px" }}>
                <li>MRP is automatically available once your business is activated for the Manufacturing app on Labamu.</li>
                <li>It connects directly with <b>Products</b>, <b>Materials</b>, <b>BOM (Bill of Materials)</b>, and <b>Routing</b>.</li>
                <li>Each production order follows this flow:</li>
              </ul>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", padding: "12px 16px", background: "#F0F7FF", borderRadius: "10px" }}>
                {["Material Planning", "RFQ", "Quotes", "Order", "Work Order", "Production Tracking", "Completion"].map((pill, idx, arr) => (
                  <React.Fragment key={idx}>
                    <span style={{ background: "#4F70E2", color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>{pill}</span>
                    {idx < arr.length - 1 && <span style={{ color: "#9CA3AF" }}><ChevronRight size={14} /></span>}
                  </React.Fragment>
                ))}
              </div>
              <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px", color: "#4B5563", margin: 0, fontSize: "14px" }}>
                <li>Ensure your master data (Products, Materials, BOM, and Routing) is uploaded before creating an Order.</li>
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", border: "2px solid #4F70E2", flexShrink: 0, padding: "4px" }}>
                <Check size={14} color="#4F70E2" />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1A1D23", margin: 0 }}>Step 2: Manage Materials & Batches</h2>
            </div>
            <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "-8px", margin: 0 }}>Define all raw materials or components used in your production.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#1A1D23" }}>How to Create Materials:</span>
              <ol style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px", color: "#4B5563", margin: 0, fontSize: "14px" }}>
                <li>Navigate to <b>Manufacturing → Materials</b> in the sidebar.</li>
                <li>Click <b>New Material</b>.</li>
                <li>Fill in the details:
                  <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px", fontSize: "13px" }}>
                    <li><b>SKU</b> – Auto-generated if left empty.</li>
                    <li><b>Material Name</b> – (Mandatory) e.g., <i>Steel Plate 2mm</i>.</li>
                    <li><b>Category</b> – (Mandatory) e.g., <i>Metal</i>, <i>Plastic</i>.</li>
                    <li><b>ABC Classification</b> – (Mandatory) A = High Value, B = Medium, C = Low.</li>
                    <li><b>Material Type</b> – (Mandatory) Raw Material, Sub Material, or Consumable.</li>
                    <li><b>Unit of Measure</b> – (Mandatory) e.g., <i>pcs</i>, <i>kg</i>, <i>mL</i>.</li>
                  </ul>
                </li>
                <li>Click <b>Save</b>.</li>
              </ol>
              <div style={{ padding: "16px 18px", background: "#EFF6FF", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#1A1D23" }}>How to Create Batches:</span>
                <p style={{ fontSize: "13px", color: "#4B5563", margin: 0 }}>Track stock quantity, expiry, and vendor details for each material via the <b>Stock Batches</b> tab.</p>
              </div>
            </div>
          </div>

          {/* Step 3 & 4 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1A1D23", margin: 0 }}>Step 3: Create Routing</h3>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>Define sequence of operations (e.g. Cutting → Assembly → QA).</p>
              <ol style={{ fontSize: "13px", color: "#4B5563", paddingLeft: "20px" }}>
                <li>Go to <b>Manufacturing → Routing</b>.</li>
                <li>Click <b>Add Stage</b>.</li>
                <li>Enter Name & Save.</li>
              </ol>
            </div>
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1A1D23", margin: 0 }}>Step 4: Create BOM</h3>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>Connect materials and routing steps into a production recipe.</p>
              <ol style={{ fontSize: "13px", color: "#4B5563", paddingLeft: "20px" }}>
                <li>Go to <b>Bill of Materials</b>.</li>
                <li>Assign Materials & Stages.</li>
                <li>View calculated COGS.</li>
              </ol>
            </div>
          </div>

          {/* Step 5 */}
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", border: "2px solid #4F70E2", flexShrink: 0, padding: "4px" }}>
                <Check size={14} color="#4F70E2" />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1A1D23", margin: 0 }}>Step 5: Create Products</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "14px", color: "#4B5563", margin: 0 }}>Define finished goods that will be produced using your BOMs.</p>
              <div style={{ padding: "14px 16px", background: "#FFF4F4", borderRadius: "10px", border: "1px solid #FFCDD2", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <Info size={16} color="#B91C1C" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span style={{ fontSize: "13px", color: "#B91C1C", fontWeight: "500" }}><b>Critical:</b> Products <u>must</u> have an attached BOM to be used in RFQs, Quotes, or Orders.</span>
              </div>
            </div>
          </div>

          {/* Step 6 & 7 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1A1D23", margin: 0 }}>Step 6: Create RFQ</h3>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>Request procurement from suppliers. Manage up to 5 PICs per request.</p>
            </div>
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1A1D23", margin: 0 }}>Step 7: Manage Quotes</h3>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>Create customer quotes with multi-PIC support, T&C, and payment terms.</p>
            </div>
          </div>

          {/* Execution: Orders & Work Orders */}
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", border: "2px solid #4F70E2", flexShrink: 0, padding: "4px" }}>
                <Check size={14} color="#4F70E2" />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1A1D23", margin: 0 }}>Execution: Orders & Work Orders</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ padding: "16px", background: "#F8F9FB", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#4F70E2", background: "#EFF6FF", padding: "2px 8px", borderRadius: "4px", alignSelf: "flex-start" }}>Step 8</span>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#1A1D23" }}>Manage Orders</span>
                <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>Confirm orders and track planned vs actual dates. Manage shipment codes for tracking.</p>
              </div>
              <div style={{ padding: "16px", background: "#F8F9FB", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#4F70E2", background: "#EFF6FF", padding: "2px 8px", borderRadius: "4px", alignSelf: "flex-start" }}>Step 9</span>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#1A1D23" }}>Work Order</span>
                <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>Allocate materials and track routing progress. Production results update inventory.</p>
              </div>
            </div>
          </div>

          {/* Step 10 & Settings */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1A1D23", margin: 0 }}>Step 10: Invoicing</h3>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>Create repayment or down payment invoices directly from Orders or Finance menu.</p>
            </div>
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#6366F1", margin: 0 }}>Admin Settings</h3>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>Manage <b>User Permissions</b>, Groups, and <b>FX Exchange Rates</b> for multi-currency support.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeModule === "work_order") {
    if (viewState.view === "list") {
      return (
        <WorkOrderListPage
          onNavigate={onNavigate}
          t={t}
        />
      );
    }
    if (viewState.view === "detail") {
      return (
        <WorkOrderDetailPage
          key={(viewState.data?.wo || "work-order-detail") + (viewState.data?._navVersion ? `-${viewState.data._navVersion}` : "")}
          onNavigate={onNavigate}
          isSidebarCollapsed={isSidebarCollapsed}
          initialData={viewState.data}
        />
      );
    }
    // PurchaseOrderCreatePage is also used by WorkOrder
    if (viewState.view === "create") {
      return (
        <PurchaseOrderCreatePage
          key={
            viewState.data?.poNumber ||
            viewState.data?.workOrder?.wo ||
            "purchase-order-create"
          }
          onNavigate={onNavigate}
          isSidebarCollapsed={isSidebarCollapsed}
          initialData={viewState.data}
          poApprovalSettings={poApprovalSettings}
          showPoSnackbar={showPoSnackbar}
        />
      );
    }
    if (viewState.view === "po_detail") {
      return (
        <PurchaseOrderDetailPage
          key={(typeof viewState.data === "string" ? viewState.data : viewState.data?.poNumber) || "purchase-order-detail"}
          onNavigate={onNavigate}
          initialData={viewState.data}
          poApprovalSettings={poApprovalSettings}
          isSidebarCollapsed={isSidebarCollapsed}
          showPoSnackbar={showPoSnackbar}
        />
      );
    }
  }
  if (activeModule === "purchase_order") {
    if (viewState.view === "list") {
      return (
        <PurchaseOrderListPage
          onNavigate={onNavigate}
          t={t}
        />
      );
    }
    if (viewState.view === "settings") {
      return (
        <PurchaseOrderSettingsPage
          onNavigate={onNavigate}
          isSidebarCollapsed={isSidebarCollapsed}
          poApprovalSettings={poApprovalSettings}
          onSaveSettings={(settings) => {
            setPoApprovalSettings(settings);
            showPoSnackbar("Purchase order settings successfully saved", "success");
            onNavigate("list");
          }}
        />
      );
    }
    if (viewState.view === "create") {
      return (
        <PurchaseOrderCreatePage
          key={
            viewState.data?.poNumber ||
            viewState.data?.workOrder?.wo ||
            "purchase-order-create"
          }
          onNavigate={onNavigate}
          isSidebarCollapsed={isSidebarCollapsed}
          initialData={viewState.data}
          poApprovalSettings={poApprovalSettings}
          showPoSnackbar={showPoSnackbar}
        />
      );
    }
    if (viewState.view === "detail" || viewState.view === "po_detail") {
      return (
        <PurchaseOrderDetailPage
          key={viewState.data?.poNumber || viewState.view || "purchase-order-detail"}
          onNavigate={onNavigate}
          initialData={viewState.data}
          poApprovalSettings={poApprovalSettings}
          isSidebarCollapsed={isSidebarCollapsed}
          showPoSnackbar={showPoSnackbar}
        />
      );
    }
  }
  if (activeModule === "material_forecast") {
    if (viewState.view === "settings") {
      return (
        <MaterialPlanningSettingsPage
          onNavigate={onNavigate}
          isSidebarCollapsed={isSidebarCollapsed}
          settings={materialPlanningSettings}
          onSaveSettings={(s) => {
            setMaterialPlanningSettings(s);
            showPoSnackbar("Material planning settings saved", "success");
            onNavigate("list");
          }}
        />
      );
    }
    if (viewState.view === "counter_detail") {
      if (viewState.data?.title === "Incoming PO") {
        return <IncomingPOPage onNavigate={onNavigate} />;
      }
      if (["Overdue", "Urgent", "This Week"].includes(viewState.data?.title)) {
        return <DemandUrgencyDetailPage onNavigate={onNavigate} statusType={viewState.data.title} showPoSnackbar={showPoSnackbar} />;
      }
      return (
        <MaterialForecastEmptyPage
          onNavigate={onNavigate}
          title={viewState.data?.title}
        />
      );
    }
    return (
      <MaterialForecastPage
        onNavigate={onNavigate}
        t={t}
        showPoSnackbar={showPoSnackbar}
        materialPlanningSettings={materialPlanningSettings}
      />
    );
  }
  if (activeModule === "orders") {
    if (viewState.view === "list") {
      return (
        <OrderListPage
          onNavigate={onNavigate}
          t={t}
        />
      );
    }
    if (viewState.view === "settings") {
      return (
        <OrderSettingsPage
          onNavigate={onNavigate}
          isSidebarCollapsed={isSidebarCollapsed}
          orderApprovalSettings={orderApprovalSettings}
          onSaveSettings={(settings) => {
            setOrderApprovalSettings(settings);
            showPoSnackbar("Order settings successfully saved", "success");
            onNavigate("list");
          }}
        />
      );
    }
    if (viewState.view === "detail") {
      return (
        <OrderDetailPage
          onNavigate={onNavigate}
          isSidebarCollapsed={isSidebarCollapsed}
          initialData={viewState.data}
          showSnackbar={showPoSnackbar}
          orderApprovalSettings={orderApprovalSettings}
        />
      );
    }
  }
  if (activeModule === "user_management" || (activeModule === "administration" && viewState.view === "user_management")) {
    return (
      <UserManagementPage
        isSidebarCollapsed={isSidebarCollapsed}
      />
    );
  }
  if (activeModule === "notification_settings" || (activeModule === "administration" && viewState.view === "notification_settings")) {
    return (
      <NotificationSettingsPage
        isSidebarCollapsed={isSidebarCollapsed}
        notificationSettings={notificationSettings}
        onSaveNotificationSettings={(settings) =>
          setNotificationSettings(settings)
        }
      />
    );
  }
  if (activeModule === "material_request") {
    if (viewState.view === "list") {
      return <MaterialRequestListPage onNavigate={onNavigate} t={t} />;
    }
    return (
      <MaterialRequestDetailPage
        key={viewState.data?.id || id || "material-request-detail"}
        onNavigate={onNavigate}
        isSidebarCollapsed={isSidebarCollapsed}
        initialData={viewState.data}
        requestId={id}
        showSnackbar={showPoSnackbar}
      />
    );
  }
  if (activeModule === "materials") {
    if (viewState.view === "list") {
      return (
        <MaterialsListPage
          onNavigate={onNavigate}
          showSnackbar={showPoSnackbar}
          t={t}
        />
      );
    }
    if (viewState.view === "settings" || viewState.view === "manage") {
      return (
        <MaterialManagePage
          onNavigate={onNavigate}
          showSnackbar={showPoSnackbar}
          t={t}
        />
      );
    }
    if (viewState.view !== "list") {
      return (
        <MaterialDetailPage
          material={viewState.data}
          onNavigate={onNavigate}
          showSnackbar={showPoSnackbar}
          t={t}
        />
      );
    }
  }

  return (
    <div
      style={{
        padding: "24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <span
        style={{
          color: "var(--neutral-on-surface-tertiary)",
          fontSize: "var(--text-title-2)",
        }}
      >
        {t("message.under_construction")}
      </span>
    </div>
  );
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const appRootRef = useRef(null);
  const isApplyingLocalizationRef = useRef(false);
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return "en";
    const storedLanguage = window.localStorage.getItem("labamu-language");
    return storedLanguage === "id" ? "id" : "en";
  });
  const [poApprovalSettings, setPoApprovalSettings] = useState({
    isApprovalActive: false,
    requireComment: false,
    approvers: [],
  });
  const [materialPlanningSettings, setMaterialPlanningSettings] = useState({
    urgencyDaysInAdvance: 5,
  });
  const [orderApprovalSettings, setOrderApprovalSettings] = useState({
    isApprovalActive: false,
    requireComment: false,
    approvers: [],
  });
  const [notificationSettings, setNotificationSettings] = useState(() =>
    cloneNotificationSettings()
  );
  const [systemNotifications, setSystemNotifications] = useState(
    DEFAULT_SYSTEM_NOTIFICATIONS
  );
  const [poSnackbar, setPoSnackbar] = useState({ open: false, message: "", variant: "success" });
  
  const showPoSnackbar = (message, variant = "success") => {
    setPoSnackbar({ open: true, message, variant });
    setTimeout(() => setPoSnackbar({ open: false, message: "", variant: "success" }), 3000);
  };

  const t = (key, fallback = "") =>
    getTranslation(TRANSLATIONS, language, key, fallback);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language === "id" ? "id" : "en";
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("labamu-language", language);
    }
  }, [language]);

  useEffect(() => {
    const rootNode = document.body;
    if (!rootNode || typeof MutationObserver === "undefined") return undefined;

    const runLocalization = () => {
      if (isApplyingLocalizationRef.current) return;
      isApplyingLocalizationRef.current = true;

      try {
        applyDomLocalization(rootNode, language);
      } finally {
        isApplyingLocalizationRef.current = false;
      }
    };

    runLocalization();

    const observer = new MutationObserver(() => {
      runLocalization();
    });

    observer.observe(rootNode, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: LOCALIZABLE_ATTRIBUTES,
    });

    return () => observer.disconnect();
  }, [language]);

  const onNavigate = (view, data = null, options = {}) => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    if (!view) return;

    // Handle string-based legacy navigation
    if (typeof view === "string") {
      if (view.startsWith("work_order_")) {
        const subView = view.replace("work_order_", "");
        const path = subView === "list" ? "/work-order" : `/work-order/${subView}`;
        navigate(path, { state: data, ...options });
        return;
      }
      if (view.startsWith("purchase_order_")) {
        const subView = view.replace("purchase_order_", "");
        const path = subView === "list" ? "/purchase-order" : `/purchase-order/${subView}`;
        navigate(path, { state: data, ...options });
        return;
      }
      if (view.startsWith("materials_") || view === "material_detail") {
        let subView = view.startsWith("materials_") ? view.replace("materials_", "") : "detail";
        if (subView === "settings") subView = "manage";
        const path = subView === "list" ? "/materials" : (subView === "detail" ? `/materials/${data?.sku || "detail"}` : `/materials/${subView}`);
        navigate(path, { state: data, ...options });
        return;
      }
      if (view.startsWith("analytics_")) {
        const subView = view.replace("analytics_", "");
        if (["po_report", "vendor_liability_report", "ap_aging_report"].includes(subView)) {
          navigate(`/procurement-ap-report/${subView.replace(/_/g, "-")}`, { state: data, ...options });
        } else {
          const route = MODULE_TO_ROUTE[view] || MODULE_TO_ROUTE[subView] || subView.replace(/_/g, '-');
          navigate(`/${route}`, { state: data, ...options });
        }
        return;
      }

      // Contextual navigation
      const pathParts = location.pathname.split("/").filter(Boolean);
      const currentModuleRoute = pathParts[0];
      
      if (view === "list") {
        navigate(`/${currentModuleRoute}`, { state: data, ...options });
        return;
      }
      if (view === "detail" || view === "po_detail") {
        let id = "detail";
        let targetModule = currentModuleRoute;

        if (view === "po_detail" && data?.poNumber) {
          id = data.poNumber;
          targetModule = "purchase-order";
        } else if (data?.wo && typeof data.wo === "string" && data.wo.startsWith("WO-")) {
          id = data.wo;
          targetModule = "work-order";
        } else if (data?.poNumber && typeof data.poNumber === "string" && data.poNumber.startsWith("PO-")) {
          id = data.poNumber;
          targetModule = "purchase-order";
        } else if (data?.orderNo && typeof data.orderNo === "string" && data.orderNo.startsWith("ORD-")) {
          id = data.orderNo;
          targetModule = "orders";
        } else if (data?.ord && typeof data.ord === "string" && data.ord.startsWith("ORD-")) {
          id = data.ord;
          targetModule = "orders";
        } else {
          id = (data?.orderNo || data?.sku || data?.poNumber || data?.wo || data?.id || "detail");
          if (typeof id === "string" && id.startsWith("PO-")) {
            targetModule = "purchase-order";
          } else if (typeof id === "string" && id.startsWith("ORD-")) {
            targetModule = "orders";
          } else if (typeof id === "string" && id.startsWith("WO-")) {
            targetModule = "work-order";
          }
        }
        
        navigate(`/${targetModule}/${id}`, { state: data, ...options });
        return;
      }
      if (view === "create" || view === "settings") {
        const id = data?.poNumber || data?.wo || data?.sku || data?.id;
        if (view === "create" && id) {
          navigate(`/${currentModuleRoute}/${id}/edit`, { state: data, ...options });
        } else {
          const subRoute = (view === "settings" && currentModuleRoute === "materials") ? "manage" : view;
          navigate(`/${currentModuleRoute}/${subRoute}`, { state: data, ...options });
        }
        return;
      }
    }
    
    // Fallback or explicit path
    navigate(view, { state: data, ...options });
  };

  const handleModuleChange = (moduleId) => {
    const route = MODULE_TO_ROUTE[moduleId];
    if (route) {
      navigate(`/${route}`);
    } else if (moduleId.startsWith("analytics_")) {
      const subRoute = moduleId.replace("analytics_", "").replace(/_/g, '-');
      if (["po-report", "vendor-liability-report", "ap-aging-report"].includes(subRoute)) {
        navigate(`/procurement-ap-report/${subRoute}`);
      } else {
        navigate(`/${subRoute}`);
      }
    } else {
      // Direct moduleId as route if not mapped
      navigate(`/${moduleId.replace(/_/g, '-')}`);
    }
  };

  const pathParts = location.pathname.split("/").filter(Boolean);
  const currentModuleRoute = pathParts[0] || "work-order";
  const currentActiveModule = ROUTE_TO_MODULE[currentModuleRoute] || currentModuleRoute.replace(/-/g, '_');
  const currentView = (pathParts[1] || "list").replace(/-/g, '_');

  return (
    <div
      ref={appRootRef}
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#F5F5F7",
      }}
    >
      <LabamuStyles />
      <div style={{ display: "flex", flex: 1, width: "100%" }}>
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          activeModule={
            ["procurement_ap_report", "po_report", "vendor_liability_report", "ap_aging_report"].includes(currentActiveModule)
              ? "analytics"
              : currentActiveModule
          }
          viewState={{
            view: ["procurement_ap_report", "po_report", "vendor_liability_report", "ap_aging_report"].includes(currentActiveModule)
              ? "procurement_ap_report"
              : currentView
          }}
          onModuleChange={handleModuleChange}
          language={language}
          onLanguageChange={setLanguage}
          t={t}
        />

        <div
          style={{
            marginLeft: isSidebarCollapsed ? "82px" : "286px",
            transition: "margin-left 0.2s ease",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            minWidth: 0,
            paddingTop: "64px",
          }}
        >
          <TopHeader
            t={t}
            isSidebarCollapsed={isSidebarCollapsed}
            notificationSettings={notificationSettings}
            notifications={systemNotifications}
            onNotificationsChange={setSystemNotifications}
            onOpenNotificationSettings={() => handleModuleChange("notification_settings")}
          />
          {poSnackbar.open && (
            <div
              style={{
                position: "fixed",
                top: "84px",
                right: "24px",
                background:
                  poSnackbar.variant === "error"
                    ? "var(--status-red-primary)"
                    : poSnackbar.variant === "black"
                    ? "var(--neutral-on-surface-primary)"
                    : "var(--status-green-primary)",
                color:
                  poSnackbar.variant === "error" || poSnackbar.variant === "black"
                    ? "#FFFFFF"
                    : "var(--status-green-on-primary)",
                padding: "12px 16px",
                borderRadius: "var(--radius-small)",
                boxShadow: "var(--elevation-sm)",
                zIndex: 20000,
                display: "flex",
                alignItems: "center",
                gap: "12px",
                justifyContent: "space-between",
                minWidth: "320px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "var(--text-body)", lineHeight: "1.5" }}>
                  {poSnackbar.message}
                </span>
              </div>
              <button
                type="button"
                data-no-localize
                translate="no"
                style={{
                  border: "none",
                  background: "transparent",
                  fontWeight: "var(--font-weight-bold)",
                  cursor: "pointer",
                  fontSize: "var(--text-body)",
                  fontFamily: "inherit",
                  lineHeight: "1.5",
                  color:
                    poSnackbar.variant === "error" || poSnackbar.variant === "black"
                      ? "#FFFFFF"
                      : "var(--status-green-on-primary)",
                  padding: 0,
                }}
                onClick={() => setPoSnackbar({ ...poSnackbar, open: false })}
              >
                Okay
              </button>
            </div>
          )}
          <Routes>
            <Route path="/" element={<Navigate to="/work-order" replace />} />
            <Route path="/:module" element={
              <ModuleRenderer
                location={location}
                onNavigate={onNavigate}
                t={t}
                isSidebarCollapsed={isSidebarCollapsed}
                poApprovalSettings={poApprovalSettings}
                setPoApprovalSettings={setPoApprovalSettings}
                orderApprovalSettings={orderApprovalSettings}
                setOrderApprovalSettings={setOrderApprovalSettings}
                showPoSnackbar={showPoSnackbar}
                notificationSettings={notificationSettings}
                setNotificationSettings={setNotificationSettings}
                systemNotifications={systemNotifications}
                setSystemNotifications={setSystemNotifications}
                handleModuleChange={handleModuleChange}
                materialPlanningSettings={materialPlanningSettings}
                setMaterialPlanningSettings={setMaterialPlanningSettings}
              />
            } />
            <Route path="/:module/:id" element={
              <ModuleRenderer
                location={location}
                onNavigate={onNavigate}
                t={t}
                isSidebarCollapsed={isSidebarCollapsed}
                poApprovalSettings={poApprovalSettings}
                setPoApprovalSettings={setPoApprovalSettings}
                orderApprovalSettings={orderApprovalSettings}
                setOrderApprovalSettings={setOrderApprovalSettings}
                showPoSnackbar={showPoSnackbar}
                notificationSettings={notificationSettings}
                setNotificationSettings={setNotificationSettings}
                systemNotifications={systemNotifications}
                setSystemNotifications={setSystemNotifications}
                handleModuleChange={handleModuleChange}
                materialPlanningSettings={materialPlanningSettings}
                setMaterialPlanningSettings={setMaterialPlanningSettings}
              />
            } />
            <Route path="/:module/:id/:subview" element={
              <ModuleRenderer
                location={location}
                onNavigate={onNavigate}
                t={t}
                isSidebarCollapsed={isSidebarCollapsed}
                poApprovalSettings={poApprovalSettings}
                setPoApprovalSettings={setPoApprovalSettings}
                orderApprovalSettings={orderApprovalSettings}
                setOrderApprovalSettings={setOrderApprovalSettings}
                showPoSnackbar={showPoSnackbar}
                notificationSettings={notificationSettings}
                setNotificationSettings={setNotificationSettings}
                systemNotifications={systemNotifications}
                setSystemNotifications={setSystemNotifications}
                handleModuleChange={handleModuleChange}
                materialPlanningSettings={materialPlanningSettings}
                setMaterialPlanningSettings={setMaterialPlanningSettings}
              />
            } />
            <Route path="*" element={
              <div style={{ padding: "40px", textAlign: "center" }}>
                <h2>404 - Page Not Found</h2>
                <button onClick={() => navigate("/")}>Go Home</button>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
}

// =============================
// PURCHASE ORDER STATUS LOGIC (REVISED)
// =============================

// Determine if NO remaining qty across all items
const isNoRemainingQty = (items = []) => {
  if (!items.length) return false;
  return items.every((item) => {
    const ordered = Number(item.orderedQty || 0);
    const received = Number(item.receivedQty || 0);
    const remaining = Math.max(ordered - received, 0);
    return remaining === 0 && ordered > 0;
  });
};

// Resolve PO status based on remaining qty
const resolvePurchaseOrderStatus = (po) => {
  if (!po) return "Draft";

  // Keep terminal states
  if (po.status === "Canceled") return "Canceled";
  if (po.status === "Completed") return "Completed";

  // Core rule: no remaining qty → Completed
  if (po.status === "Issued" && isNoRemainingQty(po.items)) {
    return "Completed";
  }

  return po.status;
};

// Hook this after receipt confirmation
const handleConfirmReceipt = ({ po, receivePayload, setPO }) => {
  const updatedItems = po.items.map((item) => {
    const incoming = Number(receivePayload[item.id] || 0);
    const newReceived = Number(item.receivedQty || 0) + incoming;

    return {
      ...item,
      receivedQty: newReceived,
      remainingQty: Math.max(Number(item.orderedQty || 0) - newReceived, 0),
    };
  });

  const updatedPO = {
    ...po,
    items: updatedItems,
  };

  const nextStatus = resolvePurchaseOrderStatus(updatedPO);

  setPO({
    ...updatedPO,
    status: nextStatus,
  });
};
