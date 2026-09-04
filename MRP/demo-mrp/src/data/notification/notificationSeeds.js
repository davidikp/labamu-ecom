// Comprehensive mock seed data — one entry per notification trigger in the
// catalog, so every notification + Todo + email can be reviewed on load.
//
// Each entry: { module, trigger, ctx }.
//   - For "submitted" events, `submitterName` is another teammate (the current
//     user receives it as a configured approver).
//   - For outcome events, omit `submitterName` so it defaults to the current
//     user (they are the latest submitter and the recipient).
//   - Customer / material-request names, reasons and notes are sample values.
//
// The NotificationSeeder injects the current user as the personal recipient
// (submitter / PIC / requester / preparer / WO creator) and a staggered
// timestamp, then builds the records directly (bypassing the 60s dedupe).

export const SEED_NOTIFICATION_EVENTS = [
  // ---- RFQ ----
  { module: "rfq", trigger: "submitted", ctx: { entityId: "RFQ-202606-001", submitterName: "Budi Santoso" } },
  { module: "rfq", trigger: "one_approved", ctx: { entityId: "RFQ-202606-002", approverName: "Joko" } },
  { module: "rfq", trigger: "all_approved", ctx: { entityId: "RFQ-202606-003" } },
  { module: "rfq", trigger: "rejected", ctx: { entityId: "RFQ-202606-004", approverName: "Joko", reason: "Supplier list incomplete — add at least 2 more vendors" } },
  { module: "rfq", trigger: "need_revision", ctx: { entityId: "RFQ-202606-005", approverName: "Joko", note: "Update the target delivery date to next month" } },

  // ---- Quote (internal approval) ----
  { module: "quote", trigger: "submitted", ctx: { entityId: "QUO-202606-001", submitterName: "Sarah Johnson" } },
  { module: "quote", trigger: "one_approved", ctx: { entityId: "QUO-202606-002", approverName: "Joko" } },
  { module: "quote", trigger: "all_approved", ctx: { entityId: "QUO-202606-003" } },
  { module: "quote", trigger: "rejected", ctx: { entityId: "QUO-202606-004", approverName: "Joko", reason: "Margin is below the approved threshold" } },
  { module: "quote", trigger: "need_revision", ctx: { entityId: "QUO-202606-005", approverName: "Joko", note: "Add the payment terms and T&C section" } },

  // ---- Quote (customer approval, any-one-wins) ----
  { module: "quote", trigger: "customer_approved", ctx: { entityId: "QUO-202606-010", customerPicName: "Andi Wijaya", customerCompany: "PT Global Tech" } },
  { module: "quote", trigger: "customer_rejected", ctx: { entityId: "QUO-202606-011", customerPicName: "Andi Wijaya", customerCompany: "PT Global Tech", reason: "Budget not approved this quarter" } },
  { module: "quote", trigger: "customer_revision", ctx: { entityId: "QUO-202606-012", customerPicName: "Andi Wijaya", customerCompany: "PT Global Tech", note: "Please reduce the quantity to 80 units" } },

  // ---- Order ----
  { module: "order", trigger: "submitted", ctx: { entityId: "ORD-202606-001", submitterName: "Sarah Johnson" } },
  { module: "order", trigger: "one_approved", ctx: { entityId: "ORD-202606-002", approverName: "Joko" } },
  { module: "order", trigger: "all_approved", ctx: { entityId: "ORD-202606-003" } },
  { module: "order", trigger: "rejected", ctx: { entityId: "ORD-202606-004", approverName: "Joko", reason: "Customer credit is on hold" } },
  { module: "order", trigger: "need_revision", ctx: { entityId: "ORD-202606-005", approverName: "Joko", note: "Confirm the planned start date with production" } },

  // ---- Purchase Order ----
  { module: "purchase_order", trigger: "submitted", ctx: { entityId: "PO-202606-001", submitterName: "Budi Santoso" } },
  { module: "purchase_order", trigger: "one_approved", ctx: { entityId: "PO-202606-002", approverName: "Joko" } },
  { module: "purchase_order", trigger: "all_approved", ctx: { entityId: "PO-202606-003" } },
  { module: "purchase_order", trigger: "wo_cross_module", ctx: { entityId: "PO-202606-003", workOrderNo: "WO-202606-0001", vendorName: "CV Mitra Jahit" } },
  { module: "purchase_order", trigger: "rejected", ctx: { entityId: "PO-202606-004", approverName: "Joko", reason: "Vendor quotation has expired" } },
  { module: "purchase_order", trigger: "need_revision", ctx: { entityId: "PO-202606-005", approverName: "Joko", note: "Re-check unit prices against the latest RFQ" } },

  // ---- Custom Product Request ----
  { module: "custom_product_request", trigger: "submitted", ctx: { entityId: "CPR-202606-001", submitterName: "Sarah Johnson" } },
  { module: "custom_product_request", trigger: "one_approved", ctx: { entityId: "CPR-202606-002", approverName: "Joko" } },
  { module: "custom_product_request", trigger: "all_approved", ctx: { entityId: "CPR-202606-003" } },
  { module: "custom_product_request", trigger: "rejected", ctx: { entityId: "CPR-202606-004", approverName: "Joko", reason: "Design is not feasible with current tooling" } },
  { module: "custom_product_request", trigger: "need_revision", ctx: { entityId: "CPR-202606-005", approverName: "Joko", note: "Provide the material spec sheet" } },

  // ---- Invoice (customer approval + payment proof) ----
  { module: "invoice", trigger: "customer_approved", ctx: { entityId: "INV-202606-001", customerPicName: "Andi Wijaya", customerCompany: "PT Global Tech" } },
  { module: "invoice", trigger: "customer_rejected", ctx: { entityId: "INV-202606-002", customerPicName: "Andi Wijaya", customerCompany: "PT Global Tech", reason: "Amount does not match the PO" } },
  { module: "invoice", trigger: "customer_revision", ctx: { entityId: "INV-202606-003", customerPicName: "Andi Wijaya", customerCompany: "PT Global Tech", note: "Please split this into two invoices" } },
  { module: "invoice", trigger: "proof_uploaded", ctx: { entityId: "INV-202606-004", customerPicName: "Andi Wijaya", customerCompany: "PT Global Tech" } },
  { module: "invoice", trigger: "proof_rejected", ctx: { entityId: "INV-202606-005", customerPicName: "Andi Wijaya", customerEmail: "andi.wijaya@globaltech.com", reason: "The proof is blurry and the amount is unreadable" } },

  // ---- Material Request ----
  { module: "material_request", trigger: "transfer_started", ctx: { entityId: "MR-202606-001", preparerName: "Joko", workOrderNo: "WO-202606-0001" } },
  { module: "material_request", trigger: "receipt_confirmed", ctx: { entityId: "MR-202606-002", requesterName: "Joko" } },
  { module: "material_request", trigger: "receipt_rejected", ctx: { entityId: "MR-202606-003", requesterName: "Joko", reason: "Quantity received is short by 5 units" } },
  { module: "material_request", trigger: "cancelled_by_preparer", ctx: { entityId: "MR-202606-004", preparerName: "Joko" } },
  { module: "material_request", trigger: "new_material_request", ctx: { entityId: "MR-202606-006", number: "MR-202606-006", requesterName: "Budi Santoso", workOrderNo: "WO-202606-0002" } },

  // ---- Inventory ----
  { module: "inventory", trigger: "material_running_low", ctx: { entityId: "MAT-0012", materialName: "Kain Katun Combed 30s", qty: 18, uom: "kg" } },
  { module: "inventory", trigger: "material_out_of_stock", ctx: { entityId: "MAT-0027", materialName: "Benang Jahit Polyester", uom: "roll" } },
  { module: "inventory", trigger: "material_expiring_soon", ctx: { entityId: "BATCH-0091", batchNumber: "BATCH-0091", materialName: "Lem Kain Khusus", expiryDate: "12 Jul 2026" } },
  { module: "inventory", trigger: "material_expired", ctx: { entityId: "BATCH-0088", batchNumber: "BATCH-0088", materialName: "Pewarna Kain", expiryDate: "20 Jun 2026" } },

  // ---- Work Order ----
  { module: "work_order", trigger: "deadline_approaching", ctx: { entityId: "WO-202606-0003", number: "WO-202606-0003", deadlineDate: "5 Aug 2026", status: "In Progress" } },
  { module: "work_order", trigger: "changed_to_completed", ctx: { entityId: "WO-202606-0004", number: "WO-202606-0004" } },
  { module: "work_order", trigger: "changed_to_cancelled", ctx: { entityId: "WO-202606-0005", number: "WO-202606-0005", updatedBy: "Budi Santoso" } },
  { module: "work_order", trigger: "new_work_order", ctx: { entityId: "WO-202606-0006", number: "WO-202606-0006", productOrOrder: "ORD-202606-006" } },
  { module: "work_order", trigger: "outsource_po_issued", ctx: { entityId: "WO-202606-0007", number: "WO-202606-0007", poNumber: "PO-202606-007", vendorName: "CV Mitra Jahit" } },
  { module: "work_order", trigger: "outsource_po_receipt_recorded", ctx: { entityId: "WO-202606-0007", number: "WO-202606-0007", poNumber: "PO-202606-007", receivedQty: "40 pcs", cumulativeQty: "40 pcs", orderedQty: "100 pcs" } },
  { module: "work_order", trigger: "outsource_po_fully_received", ctx: { entityId: "WO-202606-0008", number: "WO-202606-0008", poNumber: "PO-202606-008" } },

  // ---- Custom Product Request (new request) ----
  { module: "custom_product_request", trigger: "new_request", ctx: { entityId: "CPR-202606-006", number: "CPR-202606-006", requesterName: "Sarah Johnson", customerCompany: "PT Global Tech" } },

  // ---- Quote (valid-until reminder) ----
  { module: "quote", trigger: "valid_until_reminder", ctx: { entityId: "QUO-202606-013", validUntilDate: "10 Aug 2026" } },

  // ---- Order (operational) ----
  { module: "order", trigger: "deadline_approaching", ctx: { entityId: "ORD-202606-006", deadlineDate: "3 Aug 2026", status: "In Production" } },
  { module: "order", trigger: "deadline_overdue", ctx: { entityId: "ORD-202606-007", deadlineDate: "25 Jul 2026", status: "In Production" } },
  { module: "order", trigger: "changed_to_completed", ctx: { entityId: "ORD-202606-008" } },
  { module: "order", trigger: "changed_to_cancelled", ctx: { entityId: "ORD-202606-009", updatedBy: "Joko" } },
  { module: "order", trigger: "new_order", ctx: { entityId: "ORD-202606-010", customerCompany: "PT Global Tech" } },
  { module: "order", trigger: "invoice_paid", ctx: { entityId: "ORD-202606-003", invoiceNumber: "INV-202606-006", paidAmount: "Rp 45.000.000" } },

  // ---- Invoice (operational) ----
  { module: "invoice", trigger: "due_date_approaching", ctx: { entityId: "INV-202606-007", dueDate: "8 Aug 2026", amount: "12.500.000", currency: "IDR" } },
  { module: "invoice", trigger: "overdue", ctx: { entityId: "INV-202606-008", dueDate: "20 Jul 2026", amount: "8.750.000", currency: "IDR" } },

  // ---- Purchase Order (operational) ----
  { module: "purchase_order", trigger: "payment_overdue", ctx: { entityId: "PO-202606-009", dueDate: "22 Jul 2026", amount: "30.000.000", currency: "IDR" } },
  { module: "purchase_order", trigger: "expected_end_date_approaching", ctx: { entityId: "PO-202606-010", expectedEndDate: "6 Aug 2026", status: "Issued" } },
  { module: "purchase_order", trigger: "expected_end_date_overdue", ctx: { entityId: "PO-202606-011", expectedEndDate: "26 Jul 2026", status: "Issued" } },
];
