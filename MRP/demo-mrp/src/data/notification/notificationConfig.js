// Central configuration for the simulated notification system.
// Everything here is in-memory demo data — no backend.

// The fixed "logged in" user for the demo. Natasha is also a configured
// approver on every module, so she receives both submission requests (as an
// approver) and outcome notifications (as the latest submitter).
export const CURRENT_USER = {
  id: "user-1",
  name: "Natasha Smith",
  email: "natasha.smith@labamu.com",
  role: "Owner",
};

// Roster of demo users that can act as approvers / submitters / customers.
export const NOTIFICATION_USERS = [
  CURRENT_USER,
  { id: "user-2", name: "Joko", email: "joko@labamu.com", role: "Procurement Admin" },
  { id: "user-3", name: "Naomi", email: "naomi@labamu.com", role: "Finance Manager" },
  { id: "user-4", name: "Budi Santoso", email: "budi.santoso@labamu.com", role: "Production Planner" },
];

export const getUserById = (id) =>
  NOTIFICATION_USERS.find((u) => u.id === id) || null;
export const getUserByName = (name) =>
  NOTIFICATION_USERS.find((u) => u.name === name) || null;

// Module metadata: label (bilingual), route prefix used for CTA links, and a
// tag colour token used by the in-app panel chips.
export const NOTIFICATION_MODULES = {
  rfq: {
    key: "rfq",
    label: { en: "RFQ", id: "RFQ" },
    noun: { en: "RFQ", id: "RFQ" },
    route: "request-for-quotes",
    color: "#6366F1",
  },
  quote: {
    key: "quote",
    label: { en: "Quote", id: "Penawaran" },
    noun: { en: "Quote", id: "Quote" },
    route: "quotes",
    color: "#0EA5E9",
  },
  order: {
    key: "order",
    label: { en: "Order", id: "Order" },
    noun: { en: "Order", id: "Order" },
    route: "orders",
    color: "#4F70E2",
  },
  purchase_order: {
    key: "purchase_order",
    label: { en: "Purchase Order", id: "Purchase Order" },
    noun: { en: "Purchase Order", id: "Purchase Order" },
    route: "purchase-order",
    color: "#16A34A",
  },
  custom_product_request: {
    key: "custom_product_request",
    label: { en: "Custom Product Request", id: "Custom Product Request" },
    noun: { en: "Custom Product Request", id: "Custom Product Request" },
    route: "custom-product-request",
    color: "#A855F7",
  },
  invoice: {
    key: "invoice",
    label: { en: "Invoice", id: "Invoice" },
    noun: { en: "Invoice", id: "Invoice" },
    route: "invoices",
    color: "#FF9100",
  },
  material_request: {
    key: "material_request",
    label: { en: "Material Request", id: "Permintaan Material" },
    noun: { en: "material request", id: "permintaan material" },
    route: "material-request",
    color: "#0D9488",
  },
  inventory: {
    key: "inventory",
    label: { en: "Inventory", id: "Inventory" },
    noun: { en: "Material", id: "Material" },
    route: "materials",
    color: "#DC2626",
  },
  work_order: {
    key: "work_order",
    label: { en: "Work Order", id: "Work Order" },
    noun: { en: "Work Order", id: "Work Order" },
    route: "work-order",
    color: "#F59E0B",
  },
  product_catalog: {
    key: "product_catalog",
    label: { en: "Product Catalog", id: "Katalog Produk" },
    noun: { en: "Bulk Upload", id: "Bulk Upload" },
    route: "product-catalog/bulk-upload-list",
    color: "#782AAE",
  },
  material_bulk_upload: {
    key: "material_bulk_upload",
    label: { en: "Materials", id: "Material" },
    noun: { en: "Bulk Upload", id: "Bulk Upload" },
    route: "materials/bulk-upload-list",
    color: "#0D9488",
  },
};

// Default approver lists per module. Natasha is everywhere so the demo always
// has a notification to show for the current user; Joko is a second approver so
// the "all must approve" multi-approver path can be demonstrated.
const APPROVER_NATASHA = { ...CURRENT_USER };
const APPROVER_JOKO = NOTIFICATION_USERS[1];

export const DEFAULT_MODULE_APPROVERS = {
  rfq: [APPROVER_NATASHA, APPROVER_JOKO],
  quote: [APPROVER_NATASHA, APPROVER_JOKO],
  order: [APPROVER_NATASHA, APPROVER_JOKO],
  purchase_order: [APPROVER_NATASHA, APPROVER_JOKO],
  custom_product_request: [APPROVER_NATASHA, APPROVER_JOKO],
  invoice: [APPROVER_NATASHA, APPROVER_JOKO],
};

// Resolve the effective approver list for a module: prefer approvers configured
// in the module's Approval Settings, otherwise fall back to the demo defaults.
export const resolveApprovers = (moduleKey, configuredApprovers) => {
  if (Array.isArray(configuredApprovers) && configuredApprovers.length > 0) {
    return configuredApprovers.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      role: a.role,
    }));
  }
  return DEFAULT_MODULE_APPROVERS[moduleKey] || [];
};

// Build the CTA link to an entity detail page for a given module.
export const buildEntityRoute = (moduleKey, entityId) => {
  const mod = NOTIFICATION_MODULES[moduleKey];
  if (!mod) return "/";
  if (!entityId) return `/${mod.route}`;
  return `/${mod.route}/${encodeURIComponent(entityId)}`;
};
