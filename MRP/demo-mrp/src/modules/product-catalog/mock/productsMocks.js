// Product Catalog mock store — a simple module-level array + pub-sub
// subscribe pattern (mirrors modules/materials/mock/batchesStore.js's
// module-level store, minus the localStorage persistence since seed data
// here doesn't need to survive a reload for the demo).
let seq = 0;
const nextId = () => `prod-${Date.now()}-${++seq}`;

export const MOCK_PRODUCTS_DATA = [
  {
    id: "prod-001",
    image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&q=80&w=300&h=300",
    name: "Teak Wooden Board 120cm",
    sku: "WBD-TEAK-120",
    category: "Wooden Boards",
    price: 850000,
    leadTime: "10 Days",
    source: "Standard Catalog",
    status: "Active",
  },
  {
    id: "prod-002",
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=300&h=300",
    name: "Mahogany Serving Tray Large",
    sku: "TRY-MHG-L01",
    category: "Trays",
    price: 320000,
    leadTime: "7 Days",
    source: "Standard Catalog",
    status: "Active",
  },
  {
    id: "prod-003",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=300&h=300",
    name: "Acacia Wood Bowl Set (3pcs)",
    sku: "BWL-ACA-SET3",
    category: "Bowls",
    price: 410000,
    leadTime: "12 Days",
    source: "Standard Catalog",
    status: "Active",
  },
  {
    id: "prod-004",
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&q=80&w=300&h=300",
    name: "Carved Wooden Vase Medium",
    sku: "VSE-CRV-M02",
    category: "Vases",
    price: 275000,
    leadTime: "14 Days",
    source: "Standard Catalog",
    status: "Active",
  },
  {
    id: "prod-005",
    image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&q=80&w=300&h=300",
    name: "Rustic Wooden Cutting Board",
    sku: "CTB-RST-01",
    category: "Wooden Boards",
    price: 145000,
    leadTime: "5 Days",
    source: "Standard Catalog",
    status: "Active",
  },
  {
    id: "prod-006",
    image: "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?auto=format&fit=crop&q=80&w=300&h=300",
    name: "Round Wooden Tray Natural Finish",
    sku: "TRY-RND-N03",
    category: "Trays",
    price: 210000,
    leadTime: "8 Days",
    source: "Standard Catalog",
    status: "Active",
  },
  {
    id: "prod-007",
    image: "https://images.unsplash.com/photo-1610555356070-d0efb6505e63?auto=format&fit=crop&q=80&w=300&h=300",
    name: "Mango Wood Salad Bowl",
    sku: "BWL-MNG-01",
    category: "Bowls",
    price: 190000,
    leadTime: "9 Days",
    source: "Standard Catalog",
    status: "Active",
  },
  {
    id: "prod-008",
    image: "https://images.unsplash.com/photo-1610375461369-d613b564f4c1?auto=format&fit=crop&q=80&w=300&h=300",
    name: "Tall Wooden Floor Vase",
    sku: "VSE-TLL-04",
    category: "Vases",
    price: 560000,
    leadTime: "16 Days",
    source: "Standard Catalog",
    status: "Active",
  },
  {
    id: "prod-009",
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=300&h=300",
    name: "Pine Wood Panel Board 200cm",
    sku: "WBD-PINE-200",
    category: "Wooden Boards",
    price: 620000,
    leadTime: "11 Days",
    source: "Standard Catalog",
    status: "Active",
  },
  {
    id: "prod-010",
    image: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&q=80&w=300&h=300",
    name: "Rectangular Serving Tray Set",
    sku: "TRY-RCT-SET2",
    category: "Trays",
    price: 380000,
    leadTime: "10 Days",
    source: "Standard Catalog",
    status: "Active",
  },
  {
    id: "prod-011",
    image: "https://images.unsplash.com/photo-1610375229028-c4b1e1e1a9d3?auto=format&fit=crop&q=80&w=300&h=300",
    name: "Sheesham Wood Fruit Bowl",
    sku: "BWL-SHS-05",
    category: "Bowls",
    price: 235000,
    leadTime: "9 Days",
    source: "Standard Catalog",
    status: "Active",
  },
  {
    id: "prod-012",
    image: "https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?auto=format&fit=crop&q=80&w=300&h=300",
    name: "Hand-Carved Decorative Vase",
    sku: "VSE-DEC-06",
    category: "Vases",
    price: 445000,
    leadTime: "18 Days",
    source: "Standard Catalog",
    status: "Active",
  },
];

let products = MOCK_PRODUCTS_DATA.map((p) => ({ ...p }));
const listeners = new Set();

const notify = () => listeners.forEach((fn) => fn(products));

export const getProducts = () => products;

export const subscribeProducts = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

// Appends normalized bulk-upload rows to the catalog so the list page
// visibly grows after a successful upload. Accepts rows shaped like the
// normalized rows built by the Bulk Upload Review step (keyed by the
// product field keys from productFieldsConfig.js).
export const addProducts = (rows = []) => {
  const newProducts = rows.map((row) => ({
    id: nextId(),
    image: null,
    name: row.name || "Untitled Product",
    sku: row.sku || `SKU-${Date.now().toString().slice(-6)}-${++seq}`,
    category: row.categoryName || "Uncategorized",
    price: Number(row.sellingPrice) || 0,
    leadTime: row.leadTime || "-",
    source: "Bulk Upload",
    status: "Active",
  }));
  products = [...newProducts, ...products];
  notify();
  return newProducts;
};
