# Notification Email Wording — With "Hi [Name]," Greeting

Wording-only reference for the Notification System - Expansion & Preferences PRD email content. Each email body now opens with a **"Hi [Recipient Name],"** greeting line, consistent with the Greeting rule in Section 4.5.1 of the PRD:

> "Use the recipient display name when available. Fall back to a neutral greeting when the name is unavailable."

Fallback for missing names: **"Hi there,"**

No code or notification-catalog logic is changed here — this is wording only.

---

## 6.2 Inventory

### 1. Material Running Low
- **Subject:** Material [Material Name] is running low
- **Body:**
  Hi [Recipient Name],
  Available stock is [Qty] [UOM], at or below the minimum level.
- **CTA:** See Detail

### 2. Material Out of Stock
- **Subject:** Material [Material Name] is out of stock
- **Body:**
  Hi [Recipient Name],
  Material [Material Name] has reached zero available stock. Please review the material and replenishment plan.
- **CTA:** See Detail

### 3. Material Expiring Soon
- **Subject:** Batch [Batch Number] is expiring soon
- **Body:**
  Hi [Recipient Name],
  Batch [Batch Number] for [Material Name] will expire on [Expiry Date].
- **CTA:** See Detail

### 4. Material Expired
- **Subject:** Batch [Batch Number] has expired
- **Body:**
  Hi [Recipient Name],
  Batch [Batch Number] for [Material Name] expired on [Expiry Date]. Please review the remaining quantity and take the required action.
- **CTA:** See Detail

---

## 6.3 Material Request

### 5. New Material Request
- **Subject:** New Material Request [MR Number]
- **Body:**
  Hi [Recipient Name],
  [Requester Name] created a new Material Request for [Work Order / Purpose].
- **CTA:** See Detail

---

## 6.4 Work Order

### 6. Deadline Approaching
- **Subject:** Work Order [Number] is approaching its deadline
- **Body:**
  Hi [Recipient Name],
  Work Order [Number] is approaching its deadline on [Deadline Date]. Current status: [Status].
- **CTA:** See Detail

### 7. Changed to Completed
- **Subject:** Work Order [Number] has been completed
- **Body:**
  Hi [Recipient Name],
  The Work Order status changed to Completed.
- **CTA:** See Detail

### 8. Changed to Cancelled
- **Subject:** Work Order [Number] was cancelled
- **Body:**
  Hi [Recipient Name],
  The Work Order status changed to Cancelled by [Updated By].
- **CTA:** See Detail

### 9. New Work Order
- **Subject:** New Work Order [WO Number]
- **Body:**
  Hi [Recipient Name],
  A new Work Order was created for [Product / Order Number] and is currently Not Started.
- **CTA:** See Detail

### 10. Outsource Purchase Order Issued
- **Subject:** Purchase Order [PO Number] for Work Order [WO Number] has been issued
- **Body:**
  Hi [Recipient Name],
  The Purchase Order for outsourced Work Order [WO Number] has been issued to [Vendor Name].
- **CTA:** See Detail

### 11. Outsource Purchase Order Receipt Recorded
- **Subject:** Receipt recorded for Work Order [WO Number]
- **Body:**
  Hi [Recipient Name],
  [Received Qty] was received under Purchase Order [PO Number]. Total received: [Cumulative WO Received Qty] of [WO Ordered Qty].
- **CTA:** See Detail

### 12. Outsource Purchase Order Fully Received
- **Subject:** Work Order [WO Number] has been fully received
- **Body:**
  Hi [Recipient Name],
  All outsourced items for Work Order [WO Number] under Purchase Order [PO Number] have been received.
- **CTA:** See Detail

---

## 6.5 Custom Product Request

### 13. New Request
- **Subject:** New Custom Product Request [Number]
- **Body:**
  Hi [Recipient Name],
  Created by [Requester Name] for [Customer Name].
- **CTA:** See Detail

---

## 6.6 Quotes

### 14. Quote Valid Until Reminder
- **Subject:** Quote [Number] is approaching its validity date
- **Body:**
  Hi [Recipient Name],
  Quote [Number] is valid until [Valid Until Date]. Please review and follow up before it expires.
- **CTA:** See Detail

---

## 6.7 Orders

### 15. Order Deadline Approaching
- **Subject:** Order [Number] is approaching its deadline
- **Body:**
  Hi [Recipient Name],
  Order [Number] is approaching its deadline on [Deadline Date]. Current status: [Status].
- **CTA:** See Detail

### 16. Order Deadline Overdue
- **Subject:** Order [Number] is overdue
- **Body:**
  Hi [Recipient Name],
  Order [Number] passed its deadline on [Deadline Date] and remains [Status].
- **CTA:** See Detail

### 17. Changed to Completed
- **Subject:** Order [Number] has been completed
- **Body:**
  Hi [Recipient Name],
  The Order status changed to Completed.
- **CTA:** See Detail

### 18. Changed to Cancelled
- **Subject:** Order [Number] was cancelled
- **Body:**
  Hi [Recipient Name],
  The Order status changed to Cancelled by [Updated By].
- **CTA:** See Detail

### 19. New Order
- **Subject:** New Order [Order Number]
- **Body:**
  Hi [Recipient Name],
  A new Order was created for [Customer Name] and is currently Not Started.
- **CTA:** See Detail

### 20. Order Invoice Paid
- **Subject:** Invoice [Invoice Number] for Order [Order Number] has been paid
- **Body:**
  Hi [Recipient Name],
  Invoice [Invoice Number] linked to Order [Order Number] has been paid. Paid amount: [Paid Amount].
- **CTA:** See Detail

---

## 6.8 Invoice

### 21. Due Date Approaching
- **Subject:** Invoice [Number] is approaching its due date
- **Body:**
  Hi [Recipient Name],
  Invoice [Number] is approaching its due date on [Due Date]. Outstanding amount: [Amount] [Currency].
- **CTA:** See Detail

### 22. Invoice Overdue
- **Subject:** Invoice [Number] is overdue
- **Body:**
  Hi [Recipient Name],
  Invoice [Number] passed its due date on [Due Date]. Outstanding amount: [Amount] [Currency].
- **CTA:** See Detail

---

## 6.9 Purchase Order

### 23. Payment Overdue
- **Subject:** Payment for Purchase Order [Number] is overdue
- **Body:**
  Hi [Recipient Name],
  Payment for Purchase Order [Number] passed its due date on [Due Date]. Outstanding amount: [Amount] [Currency].
- **CTA:** See Detail

### 24. Expected End Date Approaching
- **Subject:** Purchase Order [Number] is approaching its expected end date
- **Body:**
  Hi [Recipient Name],
  Purchase Order [Number] is approaching its expected end date on [Expected End Date]. Current status: [Status].
- **CTA:** See Detail

### 25. Expected End Date Overdue
- **Subject:** Purchase Order [Number] is overdue
- **Body:**
  Hi [Recipient Name],
  Purchase Order [Number] passed its expected end date on [Expected End Date] and remains [Status].
- **CTA:** See Detail
