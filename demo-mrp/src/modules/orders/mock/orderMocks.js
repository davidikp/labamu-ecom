export const MOCK_ORDER_TABLE_DATA = [
  {
    orderNo: "ORD-202604-001",
    quoteNo: "QUO-202604-001",
    customerName: "PT Global Tech",
    plannedStart: "2026-04-10",
    plannedEnd: "2026-04-15",
    createdBy: "John Doe",
    createdAt: "2026-04-01",
    priority: "High",
    pVariant: "red-light",
    status: "In Progress",
    sBadge: "blue",
    orderType: "Customer",
  },
  {
    orderNo: "ORD-202604-002",
    quoteNo: "QUO-202604-002",
    customerName: "CV Maju Jaya",
    plannedStart: "2026-04-12",
    plannedEnd: "2026-04-18",
    createdBy: "Jane Smith",
    createdAt: "2026-04-02",
    priority: "Medium",
    pVariant: "orange-light",
    status: "Confirmed",
    sBadge: "blue",
    orderType: "Internal",
  },
  {
    orderNo: "ORD-202604-003",
    quoteNo: "QUO-202604-003",
    customerName: "Bintang Retail",
    plannedStart: "2026-04-15",
    plannedEnd: "2026-04-20",
    createdBy: "John Doe",
    createdAt: "2026-04-03",
    priority: "Low",
    pVariant: "grey-light",
    status: "Completed",
    sBadge: "green",
    orderType: "Forecast",
  },
  {
    orderNo: "ORD-202604-004",
    quoteNo: "QUO-202604-004",
    customerName: "Indo Furnish",
    plannedStart: "2026-04-18",
    plannedEnd: "2026-04-25",
    createdBy: "Jane Smith",
    createdAt: "2026-04-04",
    priority: "High",
    pVariant: "red-light",
    status: "Canceled",
    sBadge: "red",
    orderType: "Rework",
    canceledMessage: "Supplier unable to fulfill the raw material requirement due to supply chain issues.",
  },
  {
    orderNo: "ORD-202604-005",
    quoteNo: "QUO-202604-005",
    customerName: "PT Sejahtera",
    plannedStart: "2026-04-20",
    plannedEnd: "2026-04-22",
    createdBy: "John Doe",
    createdAt: "2026-04-05",
    priority: "Medium",
    pVariant: "orange-light",
    status: "Not Started",
    sBadge: "grey",
    orderType: "Customer",
  },
  {
    orderNo: "ORD-202604-006",
    quoteNo: "QUO-202604-006",
    customerName: "Tech Solutions",
    plannedStart: "2026-04-22",
    plannedEnd: "2026-04-25",
    createdBy: "Jane Smith",
    createdAt: "2026-04-06",
    priority: "High",
    pVariant: "red-light",
    status: "Waiting for Approval",
    sBadge: "orange",
    orderType: "Internal",
  },
  {
    orderNo: "ORD-202604-007",
    quoteNo: "QUO-202604-007",
    customerName: "Furniture Co",
    plannedStart: "2026-04-25",
    plannedEnd: "2026-04-28",
    createdBy: "John Doe",
    createdAt: "2026-04-07",
    priority: "Low",
    pVariant: "grey-light",
    status: "Need Revision",
    sBadge: "yellow",
    orderType: "Forecast",
    revisionMessage: "Please verify planned start date as it conflicts with public holidays.",
  },
  {
    orderNo: "ORD-202604-008",
    quoteNo: "QUO-202604-008",
    customerName: "Design Studio",
    plannedStart: "2026-04-28",
    plannedEnd: "2026-05-01",
    createdBy: "Jane Smith",
    createdAt: "2026-04-08",
    priority: "Medium",
    pVariant: "orange-light",
    status: "Ready to Ship",
    sBadge: "blue",
    orderType: "Rework",
  },
  {
    orderNo: "ORD-202604-009",
    quoteNo: "QUO-202604-009",
    customerName: "Global Mart",
    plannedStart: "2026-05-01",
    plannedEnd: "2026-05-05",
    createdBy: "John Doe",
    createdAt: "2026-04-09",
    priority: "High",
    pVariant: "red-light",
    status: "On Shipping",
    sBadge: "blue",
    orderType: "Customer",
  },
];

export const MOCK_ORDER_MATERIALS_DATA = [
  {
    id: 1,
    name: "Aluminium Sheet 2mm",
    sku: "ALU-SH-2MM",
    uom: "SHT",
    usedIn: [
      { 
        wo: "WO-202604-001", 
        product: "Aluminum Frame X1", 
        productSku: "ALU-FR-X1", 
        image: "https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=100&h=100",
        bom: 60,
        woQty: 50,
        received: 30
      },
      { 
        wo: "WO-202604-005", 
        product: "Aluminum Case B2", 
        productSku: "ALU-CS-B2", 
        image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=100&h=100",
        bom: 40,
        woQty: 35,
        received: 30
      }
    ],
    demand: 100,
    demandBreakdown: { bom: 100, wo: 85 },
    received: 60,
    remaining: 40,
    availableStock: 150,
    status: "Covered",
    sVariant: "green-light",
    incomingPO: 20,
    averageCost: 150000,
    incomingPOBreakdown: [
      { poNo: "PO-202604-001", qty: 10 },
      { poNo: "PO-202604-005", qty: 10 }
    ]
  },
  {
    id: 2,
    name: "Steel Pipe 1/2 inch",
    sku: "STL-PIPE-05",
    uom: "M",
    averageCost: 45000,
    usedIn: [
      { 
        wo: "WO-202604-002", 
        product: "Steel Structure S1", 
        productSku: "STL-STR-S1", 
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=100&h=100",
        bom: 180,
        woQty: 200,
        received: 120
      }
    ],
    demand: 200,
    demandBreakdown: { bom: 180, wo: 200 },
    received: 120,
    remaining: 80,
    availableStock: 45,
    status: "Shortage",
    sVariant: "red-light",
    incomingPO: 50,
    incomingPOBreakdown: [
      { poNo: "PO-202604-002", qty: 50 }
    ]
  },
  {
    id: 3,
    name: "Plastic Granules HDPE",
    sku: "PLAS-HDPE-GR",
    uom: "KG",
    averageCost: 12000,
    usedIn: [
      { 
        wo: "WO-202604-003", 
        product: "Plastic Container C5", 
        productSku: "PLAS-CTR-C5", 
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=100&h=100",
        bom: 500,
        woQty: 450,
        received: 500
      }
    ],
    demand: 500,
    demandBreakdown: { bom: 500, wo: 450 },
    received: 500,
    remaining: 0,
    availableStock: 1200,
    status: "Covered",
    sVariant: "green-light",
    incomingPO: 0,
    incomingPOBreakdown: []
  },
  {
    id: 4,
    name: "Copper Wire 1.5mm",
    sku: "COP-W-15",
    uom: "ROL",
    averageCost: 850000,
    usedIn: [
      { 
        wo: "WO-202604-004", 
        product: "Motor Winding M2", 
        productSku: "MOT-WND-M2", 
        image: "https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=100&h=100",
        bom: 45,
        woQty: 50,
        received: 10
      }
    ],
    demand: 50,
    demandBreakdown: { bom: 45, wo: 50 },
    received: 10,
    remaining: 40,
    availableStock: 0,
    status: "Shortage",
    sVariant: "red-light",
    incomingPO: 30,
    incomingPOBreakdown: [
      { poNo: "PO-202604-004", qty: 30 }
    ]
  },
  {
    id: 5,
    name: "M6 Hex Bolt",
    sku: "FAST-M6-HEX",
    uom: "PCS",
    averageCost: 800,
    usedIn: [
      { 
        wo: "WO-202604-006", 
        product: "Assembly A1", 
        productSku: "ASM-A1", 
        image: null,
        bom: 600,
        woQty: 550,
        received: 600
      },
      { 
        wo: "WO-202604-007", 
        product: "Assembly A2", 
        productSku: "ASM-A2", 
        image: null,
        bom: 400,
        woQty: 350,
        received: 400
      }
    ],
    demand: 1000,
    demandBreakdown: { bom: 1000, wo: 900 },
    received: 1000,
    remaining: 0,
    availableStock: 5000,
    status: "Covered",
    sVariant: "green-light",
    incomingPO: 0,
    incomingPOBreakdown: []
  }
];

export const MOCK_ORDER_PRODUCTS_DATA = [
  {
    id: 1,
    name: "Wooden Chair Frame",
    sku: "WCF-A1",
    image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=100&h=100",
    linkedWO: ["WO-202603-001", "WO-202603-002"],
    linkedMaterial: ["Teak Wood", "Wood Glue", "Sandpaper"],
    orderedQty: 100,
    status: "In Progress",
    sBadge: "yellow"
  },
  {
    id: 2,
    name: "Metal Legs (Black)",
    sku: "ML-B2",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=100&h=100",
    linkedWO: ["WO-202603-003"],
    linkedMaterial: ["Steel Pipe", "Black Powder Coat"],
    orderedQty: 400,
    status: "Ready",
    sBadge: "green"
  },
  {
    id: 3,
    name: "Upholstery Kit (Grey)",
    sku: "UK-G3",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=100&h=100",
    linkedWO: ["WO-202603-004"],
    linkedMaterial: ["Fabric Grey", "Foam", "Staples"],
    orderedQty: 100,
    status: "Not Started",
    sBadge: "grey"
  }
];
