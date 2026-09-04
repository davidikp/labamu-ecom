export const MOCK_STOCK_TRANSACTIONS = [
  {
    id: "tx-001",
    materialId: "mat-001",
    date: "2024-03-05T14:33:00",
    batchNo: "BN-202403-001",
    type: "In",
    quantity: 100,
    unit: "pcs",
    workOrder: "WO-202403-005",
    product: "Aluminium Frame 2.0",
    reason: "Purchase Receipt",
    actionBy: "John Doe"
  },
  {
    id: "tx-002",
    materialId: "mat-001",
    date: "2024-03-06T10:15:00",
    batchNo: "BN-202403-001",
    type: "Out",
    quantity: -15,
    unit: "pcs",
    workOrder: "WO-202403-012",
    product: "Aluminium Frame 2.0",
    reason: "Production Issue",
    actionBy: "Jane Smith"
  },
  {
    id: "tx-003",
    materialId: "mat-001",
    date: "2024-03-07T09:00:00",
    batchNo: "BN-202403-002",
    type: "In",
    quantity: 50,
    unit: "pcs",
    workOrder: null,
    product: "-",
    reason: "Manual Adjustment",
    actionBy: "Admin User"
  },
  {
    id: "tx-004",
    materialId: "mat-001",
    date: "2024-03-08T16:45:00",
    batchNo: "BN-202403-001",
    type: "Adjustment",
    quantity: -5,
    unit: "pcs",
    workOrder: null,
    product: "-",
    reason: "Damaged Stock",
    actionBy: "John Doe"
  },
  {
    id: "tx-005",
    materialId: "mat-001",
    date: "2024-03-09T11:20:00",
    batchNo: "BN-202403-001",
    type: "Write Off",
    quantity: -2,
    unit: "pcs",
    workOrder: null,
    product: "-",
    reason: "Expired",
    actionBy: "Jane Smith"
  }
];
