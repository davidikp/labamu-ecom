
const RAW_MOCK_REPORT_POS = [
  {
    id: "po-1",
    poNumber: "PO-202606-0001",
    vendorName: "PT Sukses Selalu",
    amount: 15000000,
    status: "Issued",
    version: 1,
    createdDate: "2026-06-01",
    invoices: [{ id: "inv-1", number: "INV/SS/001", amount: 15000000, dueDate: "2026-06-25", status: "Unpaid", payments: [] }] // Not Due, Open
  },
  {
    id: "po-2",
    poNumber: "PO-202606-0002",
    vendorName: "CV Maju Terus",
    amount: 10000000,
    status: "Issued",
    version: 2,
    createdDate: "2026-06-02",
    invoices: [{ id: "inv-2", number: "INV/MT/001", amount: 10000000, dueDate: "2026-06-25", status: "Partially Paid", payments: [{ amount: 5000000, date: "2026-06-05" }] }] // Not Due, Partially Paid
  },
  {
    id: "po-3",
    poNumber: "PO-202606-0003",
    vendorName: "PT Bintang Timur",
    amount: 12000000,
    status: "Completed",
    version: 1,
    createdDate: "2026-06-03",
    invoices: [{ id: "inv-3", number: "INV/BT/001", amount: 12000000, dueDate: "2026-06-25", status: "Settled", payments: [{ amount: 12000000, date: "2026-06-05" }] }] // Not Due, Paid
  },
  {
    id: "po-12",
    poNumber: "PO-202606-0012",
    vendorName: "PT Sukses Selalu",
    amount: 18000000,
    status: "Issued",
    version: 2,
    createdDate: "2026-06-04",
    invoices: [{ id: "inv-12", number: "INV/SS/003", amount: 18000000, dueDate: "2026-06-30", status: "Unpaid", payments: [] }] // Not Due, Open (revised)
  },
  {
    id: "po-13",
    poNumber: "PO-202606-0013",
    vendorName: "CV Maju Terus",
    amount: 22000000,
    status: "Completed",
    version: 3,
    createdDate: "2026-06-06",
    invoices: [{ id: "inv-13", number: "INV/MT/003", amount: 22000000, dueDate: "2026-06-22", status: "Settled", payments: [{ amount: 22000000, date: "2026-06-20" }] }] // Paid (revised)
  },
  {
    id: "po-14",
    poNumber: "PO-202606-0014",
    vendorName: "PT Galaksi Jaya",
    amount: 7500000,
    status: "Issued",
    version: 1,
    createdDate: "2026-06-08",
    invoices: [{ id: "inv-14", number: "INV/GJ/002", amount: 7500000, dueDate: "2026-06-29", status: "Partially Paid", payments: [{ amount: 2500000, date: "2026-06-12" }] }] // Not Due, Partially Paid
  },
  {
    id: "po-15",
    poNumber: "PO-202606-0015",
    vendorName: "PT Bintang Timur",
    amount: 13000000,
    status: "Issued",
    version: 2,
    createdDate: "2026-06-10",
    invoices: [{ id: "inv-15", number: "INV/BT/003", amount: 13000000, dueDate: "2026-06-20", status: "Unpaid", payments: [] }] // Late 1-30, Overdue (revised)
  },
  {
    id: "po-16",
    poNumber: "PO-202606-0016",
    vendorName: "CV Kayu Makmur",
    amount: 9500000,
    status: "Issued",
    version: 1,
    createdDate: "2026-06-12",
    invoices: [] // No invoice yet
  },
  {
    id: "po-17",
    poNumber: "PO-202605-0017",
    vendorName: "PT Mitra Sejahtera",
    amount: 16000000,
    status: "Completed",
    version: 1,
    createdDate: "2026-05-28",
    invoices: [{ id: "inv-17", number: "INV/MS/002", amount: 16000000, dueDate: "2026-06-15", status: "Settled", payments: [{ amount: 16000000, date: "2026-06-14" }] }] // Paid
  },
  {
    id: "po-18",
    poNumber: "PO-202605-0018",
    vendorName: "PT Cahaya Abadi",
    amount: 11500000,
    status: "Issued",
    version: 2,
    createdDate: "2026-05-30",
    invoices: [{ id: "inv-18", number: "INV/CA/002", amount: 11500000, dueDate: "2026-06-18", status: "Partially Paid", payments: [{ amount: 4000000, date: "2026-06-10" }] }] // Late 1-30, Partially Paid (revised)
  },
  {
    id: "po-4",
    poNumber: "PO-202605-0004",
    vendorName: "PT Cahaya Abadi",
    amount: 8000000,
    status: "Issued",
    version: 1,
    createdDate: "2026-05-10",
    invoices: [{ id: "inv-4", number: "INV/CA/001", amount: 8000000, dueDate: "2026-05-25", status: "Unpaid", payments: [] }] // Late 1-30, Overdue
  },
  {
    id: "po-5",
    poNumber: "PO-202605-0005",
    vendorName: "CV Kayu Makmur",
    amount: 9000000,
    status: "Issued",
    version: 1,
    createdDate: "2026-05-11",
    invoices: [{ id: "inv-5", number: "INV/KM/001", amount: 9000000, dueDate: "2026-05-25", status: "Partially Paid", payments: [{ amount: 3000000, date: "2026-05-15" }] }] // Late 1-30, Partially Paid
  },
  {
    id: "po-6",
    poNumber: "PO-202605-0006",
    vendorName: "PT Mitra Sejahtera",
    amount: 6000000,
    status: "Completed",
    version: 1,
    createdDate: "2026-05-12",
    invoices: [{ id: "inv-6", number: "INV/MS/001", amount: 6000000, dueDate: "2026-05-25", status: "Settled", payments: [{ amount: 6000000, date: "2026-06-01" }] }] // Late 1-30, Paid
  },
  {
    id: "po-7",
    poNumber: "PO-202604-0007",
    vendorName: "PT Galaksi Jaya",
    amount: 14000000,
    status: "Issued",
    version: 2,
    createdDate: "2026-04-05",
    invoices: [{ id: "inv-7", number: "INV/GJ/001", amount: 14000000, dueDate: "2026-04-20", status: "Unpaid", payments: [] }] // Late 31-60, Overdue (revised)
  },
  {
    id: "po-8",
    poNumber: "PO-202604-0008",
    vendorName: "Bintang Sejahtera",
    amount: 11000000,
    status: "Issued",
    version: 1,
    createdDate: "2026-04-06",
    invoices: [{ id: "inv-8", number: "INV/BS/001", amount: 11000000, dueDate: "2026-04-20", status: "Partially Paid", payments: [{ amount: 5000000, date: "2026-04-10" }] }] // Late 31-60, Partially Paid
  },
  {
    id: "po-9",
    poNumber: "PO-202603-0009",
    vendorName: "PT Sukses Selalu",
    amount: 20000000,
    status: "Issued",
    version: 2,
    createdDate: "2026-03-05",
    invoices: [{ id: "inv-9", number: "INV/SS/002", amount: 20000000, dueDate: "2026-03-20", status: "Unpaid", payments: [] }] // Late 61-90, Overdue (revised)
  },
  {
    id: "po-10",
    poNumber: "PO-202602-0010",
    vendorName: "CV Maju Terus",
    amount: 25000000,
    status: "Issued",
    version: 1,
    createdDate: "2026-02-01",
    invoices: [{ id: "inv-10", number: "INV/MT/002", amount: 25000000, dueDate: "2026-02-15", status: "Unpaid", payments: [] }] // Late 90+, Overdue
  },
  {
    id: "po-11",
    poNumber: "PO-202602-0011",
    vendorName: "PT Bintang Timur",
    amount: 30000000,
    status: "Issued",
    version: 1,
    createdDate: "2026-02-02",
    invoices: [{ id: "inv-11", number: "INV/BT/002", amount: 30000000, dueDate: "2026-02-15", status: "Partially Paid", payments: [{ amount: 10000000, date: "2026-03-01" }] }] // Late 90+, Partially Paid
  },
  {
    id: "po-19",
    poNumber: "PO-202601-0019",
    vendorName: "PT Sukses Selalu",
    amount: 5000000,
    status: "Completed",
    version: 1,
    createdDate: "2026-01-15",
    invoices: [{ id: "inv-19", number: "INV/SS/004", amount: 5000000, dueDate: "2026-01-30", status: "Settled", payments: [{ amount: 5000000, date: "2026-01-28" }] }] // Paid
  },
  {
    id: "po-20",
    poNumber: "PO-202512-0020",
    vendorName: "CV Maju Terus",
    amount: 28000000,
    status: "Issued",
    version: 4,
    createdDate: "2025-12-10",
    invoices: [{ id: "inv-20", number: "INV/MT/004", amount: 28000000, dueDate: "2025-12-25", status: "Unpaid", payments: [] }] // Late 90+, Overdue (heavily revised)
  }
];

export const MOCK_REPORT_POS = RAW_MOCK_REPORT_POS.filter(po => ["Issued", "Completed"].includes(po.status));
