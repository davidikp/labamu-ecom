# Notification Settings & Preferences — English vs Bahasa Indonesia Wording

Extracted from the live source so you can compare and update translations:
- `src/modules/administration/pages/NotificationSettingsPage.jsx` (page chrome)
- `src/modules/notification/pages/NotificationPreferencesPage.jsx` (page chrome)
- `src/data/notification/notificationDefaults.js` (notification catalog — names, descriptions, in-app text, email text)

**Where the gaps are today:**
- Every notification's **in-app message** and **CTA** already has an EN/ID pair.
- The notification's **Name**, admin-facing **Description**, and **Email subject/body** are **English only** — no Bahasa Indonesia version exists in code yet.
- All static page chrome (titles, column headers, buttons, toasts, validation text) on both pages is **English only** — these pages don't run through the app's i18n system (`t()`), so there's no ID string to compare against; any ID copy here is proposed by you.

Rows marked *(not translated)* have no ID counterpart in the codebase — that's the untranslated content to fill in.

---

## 1. Page chrome — Notification Settings

| Element | English | Bahasa Indonesia |
|---|---|---|
| Page title | Notification Settings | *(not translated)* |
| Search placeholder | Search notification, description, or permission | *(not translated)* |
| Column header | Notification | *(not translated)* |
| Column header | Permission | *(not translated)* |
| Column header | In-app | *(not translated)* |
| Column header | Email | *(not translated)* |
| Type badge | Required | *(not translated)* |
| Permission fallback text | No permission mapping | *(not translated)* |
| Reminder field label | Remind before | *(not translated)* |
| Reminder field unit | days | *(not translated)* |
| Reminder validation error | Remind Day must be between {min}-{max} days | *(not translated)* |
| Grouped row name | Receipt Status Updates | *(not translated)* |
| Grouped row description | Outsourced receipt recorded and fully received updates. | *(not translated)* |
| Save toast | Notification settings saved | *(not translated)* |
| Discard toast | Changes discarded | *(not translated)* |
| Toast dismiss button | Okay | *(not translated)* |
| Footer button | Cancel | *(not translated)* |
| Footer button | Save Changes | *(not translated)* |
| Discard modal title | Discard changes? | *(not translated)* |
| Discard modal confirm | Yes, Discard | *(not translated)* |
| Discard modal cancel | Keep Editing | *(not translated)* |

---

## 2. Page chrome — Notification Preferences

| Element | English | Bahasa Indonesia |
|---|---|---|
| Page title | Notification Preferences | *(not translated)* |
| Column header | Notification | *(not translated)* |
| Column header | Permission | *(not translated)* |
| Column header | In-app | *(not translated)* |
| Column header | Email | *(not translated)* |
| Type badge | Required | *(not translated)* |
| Permission fallback text | No permission mapping | *(not translated)* |
| Reminder line (with info icon) | Reminder: {n} day/days before | *(not translated)* |
| Reset button | Set to company default | *(not translated)* |
| Grouped row name | Receipt Status Updates | *(not translated)* |
| Save toast | Notification preferences saved | *(not translated)* |
| Discard toast | Changes discarded | *(not translated)* |
| Toast dismiss button | Okay | *(not translated)* |
| Footer button | Cancel | *(not translated)* |
| Footer button | Save Changes | *(not translated)* |

---

## 3. Module titles & descriptions

These render at the top of the content card for each chip tab, on both pages.

| Module | Title (EN) | Description (EN) | Bahasa Indonesia |
|---|---|---|---|
| approval | Approval | Workflow approval events across RFQ, Quote, Order, Purchase Order, and Custom Product Request. Recipients resolve directly from the approval workflow. | *(not translated)* |
| inventory | Inventory | Stock-level and batch-expiry alerts for materials. Sent to eligible users with Inventory access. | *(not translated)* |
| material_request | Material Request | Material transfer and receipt workflow. Material Preparation permission is used for preparers; Material Receipt for the requester or receiver. | *(not translated)* |
| work_order | Work Order | Work Order deadlines, status changes, new work orders, and outsourced Purchase Order activity. Sent to eligible users with Work Order access. | *(not translated)* |
| custom_product_request | Custom Product Request | Custom Product Request creation. Sent to subscribed users with Custom Product Request access. | *(not translated)* |
| quotes | Quotes | Quote validity reminders and Customer Portal outcomes. Customer Portal events resolve to the portal sender. | *(not translated)* |
| orders | Orders | Order deadlines, status changes, new orders, and linked-invoice payment. Sent to eligible users with Order access. | *(not translated)* |
| invoice | Invoice | Invoice due-date reminders, overdue alerts, Customer Portal outcomes, and payment proof review. Invoice has no internal approval/revision flow. | *(not translated)* |
| purchase_order | Purchase Order | Purchase Order payment and expected-end-date tracking. Sent to subscribed users with Purchase Order access. | *(not translated)* |

---

## 4. Notification catalog (43 notifications, grouped by module)

Note: in the Work Order tab, `Outsource Purchase Order Receipt Recorded` and `Outsource Purchase Order Fully Received` collapse into one admin row labeled **"Receipt Status Updates"** — but each keeps its own distinct wording below, since both are still generated as separate notifications.

### 4.1 Approval

#### Approval Submission — `approval_submission` · Required
- **Description (EN):** Notifies all assigned approvers when an RFQ, Quote, Order, Purchase Order, or Custom Product Request is submitted for approval. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | [Entity] [Number] needs your approval<br>[Submitter Name] submitted [Entity] [Number] for your approval.<br>CTA: See Detail | [Entity] [Number] memerlukan persetujuan Anda<br>[Submitter Name] mengirim [Entity] [Number] untuk persetujuan Anda.<br>CTA: Lihat Detail |
| Email subject | [Entity] [Number] needs your approval | *(not translated)* |
| Email body | [Submitter Name] submitted [Entity] [Number] for your approval. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Approval Progress Update — `approval_progress_update` · Required
- **Description (EN):** Notifies the latest submitter when an approver completes their review while other approvals are still pending. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | [Entity] [Number] approval progressed<br>[Approver Name] approved [Entity] [Number]. Awaiting remaining approvers.<br>CTA: See Detail | Persetujuan [Entity] [Number] berlanjut<br>[Approver Name] menyetujui [Entity] [Number]. Menunggu approver lainnya.<br>CTA: Lihat Detail |
| Email subject | [Entity] [Number] approval progressed | *(not translated)* |
| Email body | [Approver Name] approved [Entity] [Number]. The request is awaiting the remaining approvers. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Final Approval — `final_approval` · Required
- **Description (EN):** Notifies the latest submitter when all required approvers have approved the record. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | [Entity] [Number] has been approved<br>[Entity] [Number] has received all required approvals.<br>CTA: See Detail | [Entity] [Number] telah disetujui<br>[Entity] [Number] telah menerima seluruh persetujuan yang diperlukan.<br>CTA: Lihat Detail |
| Email subject | [Entity] [Number] has been approved | *(not translated)* |
| Email body | [Entity] [Number] has received all required approvals. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Approval Rejected — `approval_rejected` · Required
- **Description (EN):** Notifies the latest submitter when an approver rejects the record. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | [Entity] [Number] was rejected<br>[Approver Name] rejected [Entity] [Number]. Reason: [Reason].<br>CTA: See Detail | [Entity] [Number] ditolak<br>[Approver Name] menolak [Entity] [Number]. Alasan: [Reason].<br>CTA: Lihat Detail |
| Email subject | [Entity] [Number] was rejected | *(not translated)* |
| Email body | [Approver Name] rejected [Entity] [Number]. Reason: [Reason]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Revision Requested — `revision_requested` · Required
- **Description (EN):** Notifies the latest submitter when an approver requests changes before the record can continue through approval. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | [Entity] [Number] needs revision<br>[Approver Name] requested changes on [Entity] [Number]. Note: [Revision Note].<br>CTA: See Detail | [Entity] [Number] perlu revisi<br>[Approver Name] meminta perubahan pada [Entity] [Number]. Catatan: [Revision Note].<br>CTA: Lihat Detail |
| Email subject | [Entity] [Number] needs revision | *(not translated)* |
| Email body | [Approver Name] requested changes on [Entity] [Number]. Note: [Revision Note]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

### 4.2 Inventory

#### Material Running Low — `material_running_low` · Configurable
- **Description (EN):** Notifies eligible users with Materials access when the available quantity reaches or falls below the configured minimum stock level. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Material [Material Name] is running low<br>Available stock is [Qty] [UOM], at or below the minimum level.<br>CTA: See Detail | Stok Material [Material Name] menipis<br>Stok tersedia adalah [Qty] [UOM], sama dengan atau di bawah batas minimum.<br>CTA: Lihat Detail |
| Email subject | Material [Material Name] is running low | *(not translated)* |
| Email body | Available stock is [Qty] [UOM], at or below the minimum level. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Material Out of Stock — `material_out_of_stock` · Configurable
- **Description (EN):** Notifies eligible users with Materials access when the available quantity reaches zero. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Material [Material Name] is out of stock<br>Available stock has reached 0 [UOM].<br>CTA: See Detail | Material [Material Name] habis<br>Stok tersedia telah mencapai 0 [UOM].<br>CTA: Lihat Detail |
| Email subject | Material [Material Name] is out of stock | *(not translated)* |
| Email body | Material [Material Name] has reached zero available stock. Please review the material and replenishment plan. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Material Expiring Soon — `material_expiring_soon` · Configurable · supports Remind Before
- **Description (EN):** Notifies eligible users with Batches access before a material batch reaches its expiry date, based on the configured reminder timing. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Batch [Batch Number] is expiring soon<br>Batch [Batch Number] for [Material Name] will expire on [Expiry Date].<br>CTA: See Detail | Batch [Batch Number] akan segera kedaluwarsa<br>Batch [Batch Number] untuk [Material Name] akan kedaluwarsa pada [Expiry Date].<br>CTA: Lihat Detail |
| Email subject | Batch [Batch Number] is expiring soon | *(not translated)* |
| Email body | Batch [Batch Number] for [Material Name] will expire on [Expiry Date]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Material Expired — `material_expired` · Configurable
- **Description (EN):** Notifies eligible users with Batches access when a material batch reaches its expiry date. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Batch [Batch Number] has expired<br>Batch [Batch Number] for [Material Name] expired on [Expiry Date].<br>CTA: See Detail | Batch [Batch Number] telah kedaluwarsa<br>Batch [Batch Number] untuk [Material Name] kedaluwarsa pada [Expiry Date].<br>CTA: Lihat Detail |
| Email subject | Batch [Batch Number] has expired | *(not translated)* |
| Email body | Batch [Batch Number] for [Material Name] expired on [Expiry Date]. Please review the remaining quantity and take the required action. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

### 4.3 Material Request

#### Transfer Started — `mr_transfer_started` · Required
- **Description (EN):** Notifies the requester or material receiver when the requested materials have been transferred and are ready for receipt confirmation. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Material Request [MR Number] transfer started<br>[Preparer Name] started the transfer. Please confirm receipt.<br>CTA: See Detail | Transfer Material Request [MR Number] dimulai<br>[Preparer Name] memulai transfer. Silakan konfirmasi penerimaan.<br>CTA: Lihat Detail |
| Email subject | Material Request [MR Number] transfer started | *(not translated)* |
| Email body | [Preparer Name] started the transfer for Material Request [MR Number]. Please confirm receipt. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Receipt Confirmed — `mr_receipt_confirmed` · Required
- **Description (EN):** Notifies the material preparer when the requester or receiver confirms that the materials were received successfully. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Material Request [MR Number] receipt confirmed<br>[Receiver Name] confirmed receipt of Material Request [MR Number].<br>CTA: See Detail | Penerimaan Material Request [MR Number] dikonfirmasi<br>[Receiver Name] mengonfirmasi penerimaan Material Request [MR Number].<br>CTA: Lihat Detail |
| Email subject | Material Request [MR Number] receipt confirmed | *(not translated)* |
| Email body | [Receiver Name] confirmed receipt of Material Request [MR Number]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Receipt Rejected — `mr_receipt_rejected` · Required
- **Description (EN):** Notifies the material preparer when the requester or receiver reports an issue with the received materials. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Material Request [MR Number] receipt rejected<br>[Receiver Name] rejected the receipt. Please resolve the issue.<br>CTA: See Detail | Penerimaan Material Request [MR Number] ditolak<br>[Receiver Name] menolak penerimaan. Silakan selesaikan masalahnya.<br>CTA: Lihat Detail |
| Email subject | Material Request [MR Number] receipt rejected | *(not translated)* |
| Email body | [Receiver Name] rejected the receipt for Material Request [MR Number]. Please resolve the issue. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Material Request Cancelled by Preparer — `mr_cancelled_by_preparer` · Required
- **Description (EN):** Notifies the requester or material receiver when the material preparer cancels the Material Request. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Material Request [MR Number] was cancelled<br>[Preparer Name] cancelled Material Request [MR Number].<br>CTA: See Detail | Material Request [MR Number] dibatalkan<br>[Preparer Name] membatalkan Material Request [MR Number].<br>CTA: Lihat Detail |
| Email subject | Material Request [MR Number] was cancelled | *(not translated)* |
| Email body | [Preparer Name] cancelled Material Request [MR Number]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### New Material Request — `mr_new_material_request` · Configurable (off by default)
- **Description (EN):** Notifies eligible material preparers with access when a new Material Request is created and requires preparation. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | New Material Request [MR Number]<br>[Requester Name] created a new Material Request for [Work Order / Purpose].<br>CTA: See Detail | Material Request baru [MR Number]<br>[Requester Name] membuat Material Request baru untuk [Work Order / Tujuan].<br>CTA: Lihat Detail |
| Email subject | New Material Request [MR Number] | *(not translated)* |
| Email body | [Requester Name] created a new Material Request for [Work Order / Purpose]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

### 4.4 Work Order

#### Deadline Approaching — `wo_deadline_approaching` · Configurable · supports Remind Before
- **Description (EN):** Reminds eligible users with access to the related Work Order before its deadline, based on the configured reminder timing. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Work Order [Number] is approaching its deadline<br>The deadline is [Deadline Date]. Current status: [Status].<br>CTA: See Detail | Work Order [Number] mendekati batas waktu<br>Batas waktunya adalah [Deadline Date]. Status saat ini: [Status].<br>CTA: Lihat Detail |
| Email subject | Work Order [Number] is approaching its deadline | *(not translated)* |
| Email body | Work Order [Number] is approaching its deadline on [Deadline Date]. Current status: [Status]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Deadline Overdue — `wo_deadline_overdue` · Configurable
- **Description (EN):** Notifies eligible users with access to the related Work Order when it has passed its deadline and remains unresolved. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Work Order [Number] is overdue<br>The deadline was [Deadline Date]. Current status: [Status].<br>CTA: See Detail | Work Order [Number] terlambat<br>Batas waktunya adalah [Deadline Date]. Status saat ini: [Status].<br>CTA: Lihat Detail |
| Email subject | Work Order [Number] is overdue | *(not translated)* |
| Email body | Work Order [Number] passed its deadline on [Deadline Date] and remains [Status]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Changed to Completed — `wo_changed_to_completed` · Configurable
- **Description (EN):** Notifies eligible users with access to the related Work Order when its status changes to Completed. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Work Order [Number] has been completed<br>The Work Order status changed to Completed.<br>CTA: See Detail | Work Order [Number] telah selesai<br>Status Work Order berubah menjadi Completed.<br>CTA: Lihat Detail |
| Email subject | Work Order [Number] has been completed | *(not translated)* |
| Email body | The Work Order status changed to Completed. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Changed to Cancelled — `wo_changed_to_cancelled` · Configurable
- **Description (EN):** Notifies eligible users with access to the related Work Order when its status changes to Cancelled. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Work Order [Number] was cancelled<br>The Work Order status changed to Cancelled by [Updated By].<br>CTA: See Detail | Work Order [Number] dibatalkan<br>Status Work Order berubah menjadi Cancelled oleh [Updated By].<br>CTA: Lihat Detail |
| Email subject | Work Order [Number] was cancelled | *(not translated)* |
| Email body | The Work Order status changed to Cancelled by [Updated By]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### New Work Order — `wo_new_work_order` · Configurable (off by default)
- **Description (EN):** Notifies eligible users with Work Orders access when a new Work Order is created in Not Started status. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | New Work Order [WO Number]<br>A new Work Order was created for [Product / Order Number] and is currently Not Started.<br>CTA: See Detail | Work Order baru [WO Number]<br>Work Order baru dibuat untuk [Produk / Nomor Order] dan saat ini berstatus Not Started.<br>CTA: Lihat Detail |
| Email subject | New Work Order [WO Number] | *(not translated)* |
| Email body | A new Work Order was created for [Product / Order Number] and is currently Not Started. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Outsource Purchase Order Issued — `wo_outsource_po_issued` · Configurable
- **Description (EN):** Notifies eligible users with access to the related Work Order when a linked Purchase Order is issued to the vendor. A separate notification is generated for each linked Work Order. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Purchase Order [PO Number] for Work Order [WO Number] has been issued<br>The Purchase Order for outsourced Work Order [WO Number] has been issued to [Vendor Name].<br>CTA: See Detail | Purchase Order [PO Number] untuk Work Order [WO Number] telah diterbitkan<br>Purchase Order untuk Work Order outsource [WO Number] telah diterbitkan kepada [Vendor Name].<br>CTA: Lihat Detail |
| Email subject | Purchase Order [PO Number] for Work Order [WO Number] has been issued | *(not translated)* |
| Email body | The Purchase Order for outsourced Work Order [WO Number] has been issued to [Vendor Name]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Outsource Purchase Order Receipt Recorded — `wo_outsource_po_receipt_recorded` · Configurable · grouped under "Receipt Status Updates"
- **Description (EN):** Notifies eligible users with access to the related Work Order when items are received and the Work Order remains partially received. A separate notification is generated for each affected Work Order. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Receipt recorded for Work Order [WO Number]<br>[Received Qty] was received under Purchase Order [PO Number]. Total received for this Work Order: [Cumulative WO Received Qty] of [WO Ordered Qty].<br>CTA: See Detail | Penerimaan dicatat untuk Work Order [WO Number]<br>[Received Qty] diterima melalui Purchase Order [PO Number]. Total diterima untuk Work Order ini: [Cumulative WO Received Qty] dari [WO Ordered Qty].<br>CTA: Lihat Detail |
| Email subject | Receipt recorded for Work Order [WO Number] | *(not translated)* |
| Email body | [Received Qty] was received under Purchase Order [PO Number]. Total received: [Cumulative WO Received Qty] of [WO Ordered Qty]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Outsource Purchase Order Fully Received — `wo_outsource_po_fully_received` · Configurable · grouped under "Receipt Status Updates"
- **Description (EN):** Notifies eligible users with access to the related Work Order when all outsourced items have been received. A separate notification is generated for each completed Work Order. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Work Order [WO Number] has been fully received<br>All outsourced items for Work Order [WO Number] under Purchase Order [PO Number] have been received.<br>CTA: See Detail | Work Order [WO Number] telah diterima seluruhnya<br>Seluruh item outsource untuk Work Order [WO Number] melalui Purchase Order [PO Number] telah diterima.<br>CTA: Lihat Detail |
| Email subject | Work Order [WO Number] has been fully received | *(not translated)* |
| Email body | All outsourced items for Work Order [WO Number] under Purchase Order [PO Number] have been received. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

### 4.5 Custom Product Request

#### New Request — `cpr_new_request` · Configurable (off by default)
- **Description (EN):** Notifies eligible users with Custom Product Requests access when a new Custom Product Request is created and is ready for review or processing. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | New Custom Product Request [Number]<br>Created by [Requester Name] for [Customer Name].<br>CTA: See Detail | Custom Product Request baru [Number]<br>Dibuat oleh [Requester Name] untuk [Customer Name].<br>CTA: Lihat Detail |
| Email subject | New Custom Product Request [Number] | *(not translated)* |
| Email body | Created by [Requester Name] for [Customer Name]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

### 4.6 Quotes

#### Quote Valid Until Reminder — `quote_valid_until_reminder` · Configurable · supports Remind Before
- **Description (EN):** Reminds eligible users with Quotes access before an issued Quote reaches its validity date, based on the configured reminder timing. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Quote [Number] is approaching its validity date<br>The Quote is valid until [Valid Until Date].<br>CTA: See Detail | Quote [Number] mendekati tanggal berakhir<br>Quote berlaku sampai [Valid Until Date].<br>CTA: Lihat Detail |
| Email subject | Quote [Number] is approaching its validity date | *(not translated)* |
| Email body | Quote [Number] is valid until [Valid Until Date]. Please review and follow up before it expires. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Quote Approved by Customer — `quote_approved_by_customer` · Required
- **Description (EN):** Notifies the user who shared the Customer Portal when the customer approves the Quote. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Quote [Number] was approved by the customer<br>[Customer Name] approved Quote [Number] through the Customer Portal.<br>CTA: See Detail | Quote [Number] disetujui oleh pelanggan<br>[Customer Name] menyetujui Quote [Number] melalui Customer Portal.<br>CTA: Lihat Detail |
| Email subject | Quote [Number] was approved by the customer | *(not translated)* |
| Email body | [Customer Name] approved Quote [Number] through the Customer Portal. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Quote Rejected by Customer — `quote_rejected_by_customer` · Required
- **Description (EN):** Notifies the user who shared the Customer Portal when the customer rejects the Quote. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Quote [Number] was rejected by the customer<br>[Customer Name] rejected Quote [Number] through the Customer Portal.<br>CTA: See Detail | Quote [Number] ditolak oleh pelanggan<br>[Customer Name] menolak Quote [Number] melalui Customer Portal.<br>CTA: Lihat Detail |
| Email subject | Quote [Number] was rejected by the customer | *(not translated)* |
| Email body | [Customer Name] rejected Quote [Number] through the Customer Portal. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Quote Revision Requested by Customer — `quote_revision_requested_by_customer` · Required
- **Description (EN):** Notifies the user who shared the Customer Portal when the customer requests changes to the Quote. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Quote [Number] revision requested by the customer<br>[Customer Name] requested changes on Quote [Number] through the Customer Portal.<br>CTA: See Detail | Revisi Quote [Number] diminta oleh pelanggan<br>[Customer Name] meminta perubahan pada Quote [Number] melalui Customer Portal.<br>CTA: Lihat Detail |
| Email subject | Quote [Number] revision requested by the customer | *(not translated)* |
| Email body | [Customer Name] requested changes on Quote [Number] through the Customer Portal. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

### 4.7 Orders

#### Order Deadline Approaching — `order_deadline_approaching` · Configurable · supports Remind Before
- **Description (EN):** Reminds eligible users with access to the related Order before its deadline, based on the configured reminder timing. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Order [Number] is approaching its deadline<br>The deadline is [Deadline Date]. Current status: [Status].<br>CTA: See Detail | Order [Number] mendekati batas waktu<br>Batas waktunya adalah [Deadline Date]. Status saat ini: [Status].<br>CTA: Lihat Detail |
| Email subject | Order [Number] is approaching its deadline | *(not translated)* |
| Email body | Order [Number] is approaching its deadline on [Deadline Date]. Current status: [Status]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Order Deadline Overdue — `order_deadline_overdue` · Configurable
- **Description (EN):** Notifies eligible users with access to the related Order when it has passed its deadline and remains unresolved. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Order [Number] is overdue<br>The deadline was [Deadline Date]. Current status: [Status].<br>CTA: See Detail | Order [Number] terlambat<br>Batas waktunya adalah [Deadline Date]. Status saat ini: [Status].<br>CTA: Lihat Detail |
| Email subject | Order [Number] is overdue | *(not translated)* |
| Email body | Order [Number] passed its deadline on [Deadline Date] and remains [Status]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Changed to Completed — `order_changed_to_completed` · Configurable
- **Description (EN):** Notifies eligible users with access to the related Order when its status changes to Completed. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Order [Number] has been completed<br>The Order status changed to Completed.<br>CTA: See Detail | Order [Number] telah selesai<br>Status Order berubah menjadi Completed.<br>CTA: Lihat Detail |
| Email subject | Order [Number] has been completed | *(not translated)* |
| Email body | The Order status changed to Completed. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Changed to Cancelled — `order_changed_to_cancelled` · Configurable
- **Description (EN):** Notifies eligible users with access to the related Order when its status changes to Cancelled. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Order [Number] was cancelled<br>The Order status changed to Cancelled by [Updated By].<br>CTA: See Detail | Order [Number] dibatalkan<br>Status Order berubah menjadi Cancelled oleh [Updated By].<br>CTA: Lihat Detail |
| Email subject | Order [Number] was cancelled | *(not translated)* |
| Email body | The Order status changed to Cancelled by [Updated By]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### New Order — `order_new_order` · Configurable (off by default)
- **Description (EN):** Notifies eligible users with Orders access when a new Order is created in Not Started status. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | New Order [Order Number]<br>A new Order was created for [Customer Name] and is currently Not Started.<br>CTA: See Detail | Order baru [Order Number]<br>Order baru dibuat untuk [Customer Name] dan saat ini berstatus Not Started.<br>CTA: Lihat Detail |
| Email subject | New Order [Order Number] | *(not translated)* |
| Email body | A new Order was created for [Customer Name] and is currently Not Started. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Order Invoice Paid — `order_invoice_paid` · Configurable
- **Description (EN):** Notifies eligible users with access to the related Order when a linked Invoice is fully paid. Partial payments do not trigger this notification. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Invoice [Invoice Number] for Order [Order Number] has been paid<br>The invoice payment has been completed. Paid amount: [Paid Amount].<br>CTA: See Detail | Invoice [Invoice Number] untuk Order [Order Number] telah dibayar<br>Pembayaran invoice telah selesai. Jumlah dibayar: [Paid Amount].<br>CTA: Lihat Detail |
| Email subject | Invoice [Invoice Number] for Order [Order Number] has been paid | *(not translated)* |
| Email body | Invoice [Invoice Number] linked to Order [Order Number] has been paid. Paid amount: [Paid Amount]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

### 4.8 Invoice

#### Due Date Approaching — `invoice_due_date_approaching` · Configurable · supports Remind Before
- **Description (EN):** Reminds eligible users with Invoices access before an unpaid Invoice reaches its due date, based on the configured reminder timing. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Invoice [Number] is approaching its due date<br>The due date is [Due Date]. Outstanding amount: [Amount] [Currency].<br>CTA: See Detail | Invoice [Number] mendekati tanggal jatuh tempo<br>Tanggal jatuh tempo adalah [Due Date]. Sisa tagihan: [Amount] [Currency].<br>CTA: Lihat Detail |
| Email subject | Invoice [Number] is approaching its due date | *(not translated)* |
| Email body | Invoice [Number] is approaching its due date on [Due Date]. Outstanding amount: [Amount] [Currency]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Invoice Overdue — `invoice_overdue` · Configurable
- **Description (EN):** Notifies eligible users with Invoices access when an unpaid Invoice has passed its due date. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Invoice [Number] is overdue<br>The invoice was due on [Due Date]. Outstanding amount: [Amount] [Currency].<br>CTA: See Detail | Invoice [Number] terlambat<br>Invoice jatuh tempo pada [Due Date]. Sisa tagihan: [Amount] [Currency].<br>CTA: Lihat Detail |
| Email subject | Invoice [Number] is overdue | *(not translated)* |
| Email body | Invoice [Number] passed its due date on [Due Date]. Outstanding amount: [Amount] [Currency]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Invoice Approved by Customer — `invoice_approved_by_customer` · Required
- **Description (EN):** Notifies the Invoice owner or Customer Portal sender when the customer approves the Invoice. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Invoice [Number] was approved by the customer<br>[Customer Name] approved Invoice [Number] through the Customer Portal.<br>CTA: See Detail | Invoice [Number] disetujui oleh pelanggan<br>[Customer Name] menyetujui Invoice [Number] melalui Customer Portal.<br>CTA: Lihat Detail |
| Email subject | Invoice [Number] was approved by the customer | *(not translated)* |
| Email body | [Customer Name] approved Invoice [Number] through the Customer Portal. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Invoice Rejected by Customer — `invoice_rejected_by_customer` · Required
- **Description (EN):** Notifies the Invoice owner or Customer Portal sender when the customer rejects the Invoice. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Invoice [Number] was rejected by the customer<br>[Customer Name] rejected Invoice [Number] through the Customer Portal.<br>CTA: See Detail | Invoice [Number] ditolak oleh pelanggan<br>[Customer Name] menolak Invoice [Number] melalui Customer Portal.<br>CTA: Lihat Detail |
| Email subject | Invoice [Number] was rejected by the customer | *(not translated)* |
| Email body | [Customer Name] rejected Invoice [Number] through the Customer Portal. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Invoice Revision Requested by Customer — `invoice_revision_requested_by_customer` · Required
- **Description (EN):** Notifies the Invoice owner or Customer Portal sender when the customer requests changes to the Invoice. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Invoice [Number] revision requested by the customer<br>[Customer Name] requested changes on Invoice [Number] through the Customer Portal.<br>CTA: See Detail | Revisi Invoice [Number] diminta oleh pelanggan<br>[Customer Name] meminta perubahan pada Invoice [Number] melalui Customer Portal.<br>CTA: Lihat Detail |
| Email subject | Invoice [Number] revision requested by the customer | *(not translated)* |
| Email body | [Customer Name] requested changes on Invoice [Number] through the Customer Portal. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Payment Proof Submitted — `invoice_payment_proof_submitted` · Required
- **Description (EN):** Notifies the Invoice owner or responsible reviewer when a customer uploads payment proof through the Customer Portal. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Payment proof submitted for Invoice [Number]<br>[Customer Name] submitted payment proof for Invoice [Number]. Please review.<br>CTA: See Detail | Bukti pembayaran dikirim untuk Invoice [Number]<br>[Customer Name] mengirim bukti pembayaran untuk Invoice [Number]. Silakan tinjau.<br>CTA: Lihat Detail |
| Email subject | Payment proof submitted for Invoice [Number] | *(not translated)* |
| Email body | [Customer Name] submitted payment proof for Invoice [Number]. Please review. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Payment Proof Rejected — `invoice_payment_proof_rejected` · Required
- **Description (EN):** Notifies the customer when their payment proof is rejected and must be uploaded again. *(not translated)*
- Note: this is the one notification whose CTA is **not** the standard "See Detail" — it uses a custom re-upload CTA, already translated.

| | EN | ID |
|---|---|---|
| In-app | Payment proof for Invoice [Number] was rejected<br>Your payment proof for Invoice [Number] was rejected. Reason: [Reason]. Please re-upload.<br>CTA: See Detail | Bukti pembayaran untuk Invoice [Number] ditolak<br>Bukti pembayaran Anda untuk Invoice [Number] ditolak. Alasan: [Reason]. Silakan unggah ulang.<br>CTA: Lihat Detail |
| Email subject | Payment proof for Invoice [Number] was rejected | *(not translated)* |
| Email body | Your payment proof for Invoice [Number] was rejected. Reason: [Reason]. Please re-upload the payment proof. | *(not translated)* |
| Email CTA | Re-upload payment proof | Unggah ulang bukti pembayaran |

### 4.9 Purchase Order

#### Payment Overdue — `po_payment_overdue` · Configurable
- **Description (EN):** Notifies eligible users with Purchase Orders access when a Purchase Order remains unpaid after its payment due date. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Payment for Purchase Order [Number] is overdue<br>The payment due date was [Due Date]. Outstanding amount: [Amount] [Currency].<br>CTA: See Detail | Pembayaran Purchase Order [Number] terlambat<br>Tanggal jatuh tempo pembayaran adalah [Due Date]. Sisa pembayaran: [Amount] [Currency].<br>CTA: Lihat Detail |
| Email subject | Payment for Purchase Order [Number] is overdue | *(not translated)* |
| Email body | Payment for Purchase Order [Number] passed its due date on [Due Date]. Outstanding amount: [Amount] [Currency]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Expected End Date Approaching — `po_expected_end_date_approaching` · Configurable · supports Remind Before
- **Description (EN):** Reminds eligible users with Purchase Orders access before a Purchase Order reaches its expected end date, based on the configured reminder timing. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Purchase Order [Number] is approaching its expected end date<br>The expected end date is [Expected End Date]. Current status: [Status].<br>CTA: See Detail | Purchase Order [Number] mendekati tanggal selesai yang diperkirakan<br>Tanggal selesai yang diharapkan adalah [Expected End Date]. Status saat ini: [Status].<br>CTA: Lihat Detail |
| Email subject | Purchase Order [Number] is approaching its expected end date | *(not translated)* |
| Email body | Purchase Order [Number] is approaching its expected end date on [Expected End Date]. Current status: [Status]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

#### Expected End Date Overdue — `po_expected_end_date_overdue` · Configurable
- **Description (EN):** Notifies eligible users with Purchase Orders access when a Purchase Order remains incomplete after its expected end date. *(not translated)*

| | EN | ID |
|---|---|---|
| In-app | Purchase Order [Number] is overdue against its expected end date<br>The expected end date was [Expected End Date]. Current status: [Status].<br>CTA: See Detail | Purchase Order [Number] melewati tanggal selesai yang diharapkan<br>Tanggal selesai yang diharapkan adalah [Expected End Date]. Status saat ini: [Status].<br>CTA: Lihat Detail |
| Email subject | Purchase Order [Number] is overdue | *(not translated)* |
| Email body | Purchase Order [Number] passed its expected end date on [Expected End Date] and remains [Status]. | *(not translated)* |
| Email CTA | See Detail | Lihat Detail |

---

## Notice — inconsistency found while extracting

`po_expected_end_date_overdue`'s **email subject** ("Purchase Order [Number] is overdue") drops the "against its expected end date" qualifier that both the in-app title and email body keep — worth deciding whether to align the subject wording (in either language) while you're in here.
