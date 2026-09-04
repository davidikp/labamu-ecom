export const MOCK_PO_TABLE_DATA = [
  {
    poNumber: "PO-202603-0001",
    vendorName: "PT Mitra Sejahtera",
    amount: "IDR 15,000,000",
    createdDate: "2026-03-20",
    status: "Completed",
    statusKey: "completed",
    sBadge: "green",
    subtotal: 15000000,
    lines: [
      {
        id: 1,
        type: "material",
        item: "Standard Wood Frame Support",
        code: "WDF-SUP-01",
        desc: "Standard wood frame support for tables.",
        woRef: "-",
        qty: 150,
        price: 100000,
      }
    ],
    invoices: [
      {
        id: "inv-1-1",
        number: "INV/2026/001",
        date: "2026-03-20",
        terms: "30 days",
        dueDate: "2026-04-15",
        amount: 5000000,
        notes: "Initial batch",
        itemLines: [{ id: 1, qty: 33, unit: "Pcs" }]
      },
      {
        id: "inv-1-2",
        number: "INV/2026/002",
        date: "2026-03-25",
        terms: "30 days",
        dueDate: "2026-04-20",
        amount: 10000000,
        notes: "Final batch",
        itemLines: [{ id: 1, qty: 67, unit: "Pcs" }]
      }
    ],
    payments: [
      { id: "pay-1-1", amount: 5000000, date: "2026-04-10", method: "Bank Transfer", invoiceId: "inv-1-1", itemLines: [{ id: 1, qty: 33 }], proof: "transfer-receipt-001.pdf", addedBy: "Natasha Smith", createdAt: "2026-04-10T09:00:00.000Z" },
      { id: "pay-1-2", amount: 10000000, date: "2026-04-22", method: "Bank Transfer", invoiceId: "inv-1-2", itemLines: [{ id: 1, qty: 67 }], proof: "transfer-receipt-002.pdf", addedBy: "Natasha Smith", createdAt: "2026-04-22T10:30:00.000Z" }
    ]
  },
  {
    poNumber: "PO-202603-0002",
    vendorName: "PT Mitra Sejahtera",
    amount: "IDR 8,500,000",
    createdDate: "2026-03-21",
    status: "Issued",
    statusKey: "issued",
    sBadge: "blue",
    subtotal: 8500000,
    lines: [
      {
        id: 1,
        type: "material",
        item: "Steel Frame Support",
        code: "STL-SUP-02",
        desc: "Heavy-duty steel support frame.",
        woRef: "-",
        qty: 85,
        price: 100000,
      }
    ],
    invoices: [
      {
        id: "inv-2-1",
        number: "INV/2026/003",
        date: "2026-03-25",
        terms: "30 days",
        dueDate: "2026-04-20",
        amount: 3500000,
        notes: "Partial delivery",
        itemLines: [{ id: 1, qty: 23, unit: "Pcs" }]
      },
      {
        id: "inv-2-2",
        number: "INV/2026/004",
        date: "2026-04-05",
        terms: "15 days",
        dueDate: "2026-04-20",
        amount: 5000000,
        notes: "Second delivery",
        itemLines: [{ id: 1, qty: 33, unit: "Pcs" }]
      }
    ],
    payments: [
      { id: "pay-2-1", amount: 2000000, date: "2026-04-18", method: "Bank Transfer", invoiceId: "inv-2-1", itemLines: [{ id: 1, qty: 13 }], proof: "payment_proof_partial.pdf", addedBy: "Natasha Smith", createdAt: "2026-04-18T14:15:00.000Z" }
    ]
  },
  {
    poNumber: "PO-202603-0003",
    vendorName: "Bintang Sejahtera",
    amount: "IDR 22,000,000",
    createdDate: "2026-03-22",
    status: "Waiting for Approval",
    statusKey: "ready_to_send",
    sBadge: "orange",
    subtotal: 22000000,
    lines: [
      {
        id: 1,
        type: "material",
        item: "Luxury Mahogany Support",
        code: "MAH-SUP-03",
        desc: "Luxury mahogany furniture support.",
        woRef: "-",
        qty: 220,
        price: 100000,
      }
    ],
    invoices: [],
    payments: []
  },
  {
    poNumber: "PO-202603-0004",
    vendorName: "PT Cahaya Abadi",
    amount: "IDR 5,250,000",
    createdDate: "2026-03-23",
    status: "Issued",
    statusKey: "issued",
    sBadge: "blue",
    subtotal: 5250000,
    lines: [
      {
        id: 1,
        type: "material",
        item: "Aluminium Frame Support",
        code: "ALU-SUP-01",
        desc: "Structural aluminium support frame.",
        woRef: "-",
        qty: 35,
        price: 150000,
      }
    ],
    invoices: [
      {
        id: "inv-4-1",
        number: "INV/2026/005",
        date: "2026-04-10",
        terms: "30 days",
        dueDate: "2026-05-10",
        amount: 5250000,
        notes: "Full order invoice",
        itemLines: [{ id: 1, qty: 35, unit: "Pcs" }]
      }
    ],
    payments: []
  },
  {
    poNumber: "PO-202603-0005",
    vendorName: "CV Kayu Makmur",
    amount: "IDR 11,000,000",
    createdDate: "2026-03-24",
    status: "Completed",
    statusKey: "completed",
    sBadge: "green",
    subtotal: 11000000,
    lines: [
      {
        id: 1,
        type: "material",
        item: "Premium Teak Wood Planks",
        code: "TEAK-PLK-05",
        desc: "Premium grade seasoned teak wood planks.",
        woRef: "-",
        qty: 110,
        price: 100000,
      }
    ],
    invoices: [
      {
        id: "inv-5-1",
        number: "INV/2026/006",
        date: "2026-03-10",
        terms: "30 days",
        dueDate: "2026-04-05",
        amount: 11000000,
        notes: "Overdue settlement",
        itemLines: [{ id: 1, qty: 73, unit: "Pcs" }]
      }
    ],
    payments: []
  },
  {
    poNumber: "PO-202603-0006",
    vendorName: "PT Sumber Berkah",
    amount: "IDR 7,000,000",
    createdDate: "2026-03-25",
    status: "Canceled",
    statusKey: "rejected",
    sBadge: "red",
    subtotal: 7000000,
    lines: [
      {
        id: 1,
        type: "material",
        item: "Standard Plywood Sheets",
        code: "PLY-STD-02",
        desc: "Standard furniture grade plywood sheets.",
        woRef: "-",
        qty: 70,
        price: 100000,
      }
    ],
    invoices: [],
    payments: []
  },
  {
    poNumber: "PO-202603-0007",
    vendorName: "CV Maju Terus",
    amount: "IDR 47,325,000",
    createdDate: "2026-03-25",
    status: "Completed",
    statusKey: "completed",
    sBadge: "green",
    subtotal: 42325000,
    tax: 4655750,
    fees: 344250,
    lines: [
      {
        id: 1,
        type: "wo",
        item: "Outsourced - Cabinet Premium",
        code: "CAB-PR-9921",
        desc: "Generated from WO-2026-03-025-00008 with assignment WOA-0001. It covers these routing stages:\n- Step 1: Cutting and Everything Else That Follows\n- Step 2: Advanced Assembly",
        woRef: "WO-2026-03-025-00008",
        assignmentId: "WOA-0001",
        outsourceSteps: [1, 2],
        qty: 20,
        price: 1500000,
      },
      {
        id: 2,
        type: "material",
        item: "Aluminium Frame Support",
        code: "ALU-SUP-01",
        desc: "Structural aluminium support frame for premium furniture series.",
        woRef: "-",
        qty: 50,
        price: 246500,
      }
    ],
    invoices: [
      {
        id: "inv-7-1",
        number: "INV/2026/010",
        date: "2026-03-20",
        terms: "30 days",
        dueDate: "2026-04-20",
        amount: 15000000,
        notes: "Fully paid invoice",
        itemLines: [{ id: 1, qty: 10, unit: "Pcs" }]
      },
      {
        id: "inv-7-2",
        number: "INV/2026/011",
        date: "2026-05-01",
        terms: "60 days",
        dueDate: "2026-07-01",
        amount: 12325000,
        notes: "Partially paid, not yet due",
        itemLines: [{ id: 2, qty: 50, unit: "Sheet" }]
      },
      {
        id: "inv-7-3",
        number: "INV/2026/012",
        date: "2026-04-01",
        terms: "15 days",
        dueDate: "2026-04-16",
        amount: 10000000,
        notes: "Overdue, no payment",
        itemLines: [{ id: 1, qty: 6, unit: "Pcs" }]
      },
      {
        id: "inv-7-4",
        number: "INV/2026/013",
        date: "2026-06-01",
        terms: "30 days",
        dueDate: "2026-07-01",
        amount: 10000000,
        notes: "Open, not yet due",
        itemLines: [{ id: 1, qty: 4, unit: "Pcs" }]
      }
    ],
    payments: [
      { id: "pay-7-1", amount: 15000000, date: "2026-04-25", method: "Bank Transfer", invoiceId: "inv-7-1", itemLines: [{ id: 1, qty: 10 }], proof: "payment-proof-inv10.pdf", addedBy: "Natasha Smith", createdAt: "2026-04-25T11:20:00.000Z" },
      { id: "pay-7-2", amount: 5000000, date: "2026-05-15", method: "Bank Transfer", invoiceId: "inv-7-2", itemLines: [{ id: 2, qty: 20 }], proof: "receipt-partial-inv11.pdf", addedBy: "Natasha Smith", createdAt: "2026-05-15T16:45:00.000Z" }
    ]
  },
  {
    poNumber: "PO-202603-0008",
    vendorName: "Bintang Sejahtera",
    amount: "IDR 3,000,000",
    createdDate: "2026-03-26",
    status: "Issued",
    statusKey: "issued",
    sBadge: "blue",
    subtotal: 3000000,
    lines: [
      {
        id: 1,
        type: "wo",
        item: "Outsourced - Cabinet Premium",
        code: "CAB-PR-9921",
        desc: "Generated from WO-2026-03-025-00008 with assignment WOA-0004. It covers these routing stages:\n- Step 2: Advanced Assembly\n- Step 3: Premium Painting",
        woRef: "WO-2026-03-025-00008",
        assignmentId: "WOA-0004",
        outsourceSteps: [2, 3],
        qty: 2,
        price: 1500000,
      }
    ],
    invoices: [],
    payments: []
  },
  {
    poNumber: "PO-202603-0009",
    vendorName: "Bintang Sejahtera",
    amount: "IDR 9,768,000",
    createdDate: "2026-03-27",
    expectedDeliveryDate: "2026-04-10",
    createdBy: "Sari",
    status: "Need Revision",
    statusKey: "need_revision",
    sBadge: "yellow",
    subtotal: 8000000,
    taxRate: 11,
    feeAmount: 0,
    notes: "Please revise unit prices as agreed in the contract amendment.",
    paymentTerms: "Payment within 30 days from invoice date.",
    lines: [
      {
        id: 1,
        type: "material",
        item: "Luxury Mahogany Support",
        code: "MAH-SUP-03",
        desc: "Luxury mahogany furniture support.",
        woRef: "-",
        qty: 40,
        price: 100000,
      },
      {
        id: 2,
        type: "manual",
        item: "Custom Glass Knob",
        code: "KNB-GLS-09",
        desc: "Handcrafted glass knobs for cabinet doors.",
        woRef: "-",
        qty: 80,
        price: 50000,
      }
    ],
    invoices: [],
    payments: []
  },
  {
    poNumber: "PO-202603-0010",
    vendorName: "PT Cahaya Abadi",
    amount: "IDR 17,215,000",
    createdDate: "2026-03-28",
    expectedDeliveryDate: "2026-04-15",
    createdBy: "Joko",
    status: "Draft",
    statusKey: "draft",
    sBadge: "grey",
    subtotal: 15500000,
    taxRate: 11,
    feeAmount: 0,
    notes: "Draft order pending vendor confirmation.",
    paymentTerms: "Payment within 14 days from invoice date.",
    lines: [
      {
        id: 1,
        type: "material",
        item: "Aluminum Profile 6061",
        code: "ALU-6061-01",
        desc: "Aerospace-grade aluminum profile.",
        woRef: "-",
        qty: 100,
        price: 155000,
      }
    ],
    invoices: [],
    payments: []
  },
  {
    poNumber: "PO-202603-0011",
    vendorName: "CV Kayu Makmur",
    amount: "IDR 10,212,000",
    createdDate: "2026-03-29",
    expectedDeliveryDate: "2026-04-20",
    createdBy: "Budi",
    status: "Need Revision",
    statusKey: "need_revision",
    sBadge: "yellow",
    subtotal: 9200000,
    taxRate: 11,
    feeAmount: 0,
    notes: "Revision requested: delivery date needs to be moved up by 5 days.",
    paymentTerms: "Payment within 30 days from invoice date.",
    lines: [
      {
        id: 1,
        type: "material",
        item: "Premium Teak Wood Planks",
        code: "TEAK-PLK-05",
        desc: "Premium grade seasoned teak wood planks.",
        woRef: "-",
        qty: 92,
        price: 100000,
      }
    ],
    invoices: [],
    payments: []
  },
  {
    poNumber: "PO-202603-0012",
    vendorName: "PT Sumber Berkah",
    amount: "IDR 6,660,000",
    createdDate: "2026-03-30",
    expectedDeliveryDate: "2026-04-18",
    createdBy: "Dewi",
    status: "Draft",
    statusKey: "draft",
    sBadge: "grey",
    subtotal: 6000000,
    taxRate: 11,
    feeAmount: 0,
    notes: "Initial draft for raw materials supply.",
    paymentTerms: "Payment within 30 days from invoice date.",
    lines: [
      {
        id: 1,
        type: "material",
        item: "Carbon Steel Sheet 3mm",
        code: "CS-SHT-3MM",
        desc: "High tensile carbon steel sheet.",
        woRef: "-",
        qty: 60,
        price: 100000,
      }
    ],
    invoices: [],
    payments: []
  },
  {
    poNumber: "PO-202603-0013",
    vendorName: "CV Maju Terus",
    amount: "IDR 27,750,000",
    createdDate: "2026-03-31",
    expectedDeliveryDate: "2026-04-25",
    createdBy: "Joko",
    status: "Draft",
    statusKey: "draft",
    sBadge: "grey",
    subtotal: 25000000,
    taxRate: 11,
    feeAmount: 0,
    notes: "Bulk order for Q2 production.",
    paymentTerms: "50% upfront, 50% upon delivery.",
    lines: [
      {
        id: 1,
        type: "material",
        item: "Rubber Seal Strip",
        code: "RBR-SEAL-01",
        desc: "Industrial rubber seal for machinery.",
        woRef: "-",
        qty: 500,
        price: 50000,
      }
    ],
    invoices: [],
    payments: []
  },
  {
    poNumber: "PO-202603-0014",
    vendorName: "PT Mitra Sejahtera",
    amount: "IDR 39,000,000",
    createdDate: "2026-03-31",
    status: "Issued",
    statusKey: "issued",
    sBadge: "blue",
    subtotal: 35000000,
    tax: 3850000,
    fees: 150000,
    lines: [
      {
        id: 1,
        type: "wo",
        item: "Outsourced - Cabinet Premium",
        code: "CAB-PR-9921",
        desc: "Generated from WO-2026-03-025-00008 with assignment WOA-0001. It covers these routing stages:\n- Step 1: Cutting and Everything Else That Follows\n- Step 2: Advanced Assembly",
        woRef: "WO-2026-03-025-00008",
        assignmentId: "WOA-0001",
        outsourceSteps: [1, 2],
        qty: 10,
        price: 1500000,
      },
      {
        id: 2,
        type: "material",
        item: "Steel Frame Support",
        code: "STL-SUP-02",
        desc: "Heavy-duty steel support frame.",
        woRef: "-",
        qty: 150,
        price: 100000,
      },
      {
        id: 3,
        type: "manual",
        item: "Premium Wood Polish",
        code: "MAN-WPOL-01",
        desc: "Special protective coating lacquer.",
        woRef: "-",
        qty: 10,
        price: 500000,
      }
    ],
    invoices: [],
    payments: []
  },
  {
    poNumber: "PO-202603-0099",
    vendorName: "PT Mitra Sejahtera",
    amount: "IDR 50,000,000",
    createdDate: "2026-03-31",
    status: "Draft",
    statusKey: "draft",
    sBadge: "grey",
    lines: [
      {
        id: 1,
        type: "wo",
        item: "Outsourced - Luxury Cabinet Canceled",
        code: "CAB-LUX-CAN",
        desc: "Generated from WO-202603-099 with assignment WOA-0099. It covers these routing stages:\n- Step 1: Cutting\n- Step 2: Assembly",
        woRef: "WO-202603-099",
        assignmentId: "WOA-0099",
        outsourceSteps: [1, 2],
        qty: 50,
        price: 1000000,
      }
    ],
    invoices: [],
    payments: []
  }
];

export const MOCK_ACTIVITIES = [
  {
    date: "2026-03-22 10:30",
    user: "Natasha Smith",
    action: "Approved Purchase Order",
  },
  {
    date: "2026-03-21 14:00",
    user: "Joko",
    action: "Submitted Purchase Order for Approval",
  },
  {
    date: "2026-03-21 13:45",
    user: "Joko",
    action: "Created Purchase Order Draft",
  },
];

export const MOCK_PO_DOCUMENTS = [
  {
    id: "doc-1",
    name: "invoice-march-2026.pdf",
    description: "March invoice",
    meta: "Uploaded by Joko on Mar 20, 2026",
    type: "pdf",
    documentType: "invoice",
    size: "2.4 MB",
  },
  {
    id: "doc-2",
    name: "delivery-note-batch-14.pdf",
    description: "Delivery note for batch 14",
    meta: "Uploaded by Natasha Smith on Mar 20, 2026",
    type: "pdf",
    documentType: "delivery_note",
    size: "1.1 MB",
  },
  {
    id: "doc-3",
    name: "vendor-quotation.pdf",
    description: "Vendor quotation comparison",
    meta: "Uploaded by Joko on Mar 19, 2026",
    type: "pdf",
    documentType: "quotation_vendor",
    size: "860 KB",
  },
  {
    id: "doc-4",
    name: "packing-list-wood-frame.png",
    description: "Packing list for wood frame order",
    meta: "Uploaded by Natasha Smith on Mar 18, 2026",
    type: "image",
    documentType: "packing_list",
    size: "540 KB",
  },
];
