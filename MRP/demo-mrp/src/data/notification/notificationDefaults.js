// Company Notification Settings catalog.
//
// Matches "Notification System - Expansion & Preferences" (Remind Before
// revision): notifications grouped BY MODULE, each Required or Configurable,
// with independent In-app / Email channels and read-only metadata (description,
// recipient, permission mapping, Todo eligibility). The six "approaching"
// notifications additionally carry a company-configured Remind Before (days).
//
// In-memory demo data — no backend. Bahasa Indonesia copy follows house style:
// "Anda" (never kamu/-mu) and "Material" (never "Bahan Baku"). CTA wording is
// standard: "See Detail" (EN) / "Lihat Detail" (ID).
//
// Module title/description, rule description, and email subject/body are
// bilingual ({ en, id }) — resolve with a language-aware helper (see
// `pickLocalized` below) rather than reading the field directly.

const SEE_DETAIL = { en: "See Detail", id: "Lihat Detail" };

// Resolve a bilingual `{ en, id }` field for the given language, falling back
// to English. Also accepts a plain string for backward compatibility.
export const pickLocalized = (value, language) => {
  if (value == null) return value;
  if (typeof value === "string") return value;
  return value[language] ?? value.en ?? value;
};

export const NOTIFICATION_TYPES = {
  required: "required",
  configurable: "configurable",
};

// Reminder-timing (Remind Before) defaults and bounds.
export const DEFAULT_REMIND_BEFORE_DAYS = 7;
export const MIN_REMIND_BEFORE_DAYS = 1;
export const MAX_REMIND_BEFORE_DAYS = 90;

// The nine modules, in display order (PRD acceptance criterion #2).
export const DEFAULT_NOTIFICATION_SETTINGS = [
  {
    id: "approval",
    title: { en: "Approval", id: "Persetujuan" },
    description: {
      en: "Workflow approval events across RFQ, Quote, Order, Purchase Order, and Custom Product Request. Recipients resolve directly from the approval workflow.",
      id: "Alur persetujuan untuk Permintaan Penawaran, Penawaran, Pesanan, Purchase Order, dan Permintaan Produk Khusus. Penerima notifikasi ditentukan langsung berdasarkan alur persetujuan.",
    },
    items: [
      {
        id: "approval_submission",
        name: "Approval Submission",
        description: {
          en: "Notifies all assigned approvers when an RFQ, Quote, Order, Purchase Order, or Custom Product Request is submitted for approval.",
          id: "Memberi tahu seluruh approver yang ditugaskan ketika Permintaan Penawaran, Penawaran, Pesanan, Purchase Order, atau Permintaan Produk Khusus diajukan untuk persetujuan.",
        },
        trigger: "Submitted for approval",
        type: "required",
        recipient: "Configured approver",
        permission: null,
        todo: "Needs your approval",
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "[Entity] [Number] needs your approval\n[Submitter Name] submitted [Entity] [Number] for your approval.\nCTA: See Detail",
            id: "[Entity] [Number] memerlukan persetujuan Anda\n[Submitter Name] mengirim [Entity] [Number] untuk persetujuan Anda.\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "[Entity] [Number] needs your approval",
              id: "[Entity] [Number] memerlukan persetujuan Anda",
            },
            body: {
              en: "[Submitter Name] submitted [Entity] [Number] for your approval.",
              id: "[Submitter Name] mengajukan [Entity] [Number] untuk persetujuan Anda.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "approval_progress_update",
        name: "Approval Progress Update",
        description: {
          en: "Notifies the latest submitter when an approver completes their review while other approvals are still pending.",
          id: "Memberi tahu pengaju terakhir ketika salah satu approver menyelesaikan peninjauannya, sementara persetujuan dari approver lainnya masih menunggu.",
        },
        trigger: "One approver approves",
        type: "required",
        recipient: "Latest submitter",
        permission: null,
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "[Entity] [Number] approval progressed\n[Approver Name] approved [Entity] [Number]. Awaiting remaining approvers.\nCTA: See Detail",
            id: "Persetujuan [Entity] [Number] berlanjut\n[Approver Name] menyetujui [Entity] [Number]. Menunggu approver lainnya.\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "[Entity] [Number] approval progressed",
              id: "Persetujuan [Entity] [Number] berlanjut",
            },
            body: {
              en: "[Approver Name] approved [Entity] [Number]. The request is awaiting the remaining approvers.",
              id: "[Approver Name] menyetujui [Entity] [Number]. Permintaan sedang menunggu persetujuan dari approver lainnya.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "final_approval",
        name: "Final Approval",
        description: {
          en: "Notifies the latest submitter when all required approvers have approved the record.",
          id: "Memberi tahu pengaju terakhir ketika seluruh approver yang diperlukan telah menyetujui data.",
        },
        trigger: "All approvers approve",
        type: "required",
        recipient: "Latest submitter",
        permission: null,
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "[Entity] [Number] has been approved\n[Entity] [Number] has received all required approvals.\nCTA: See Detail",
            id: "[Entity] [Number] telah disetujui\n[Entity] [Number] telah menerima seluruh persetujuan yang diperlukan.\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "[Entity] [Number] has been approved",
              id: "[Entity] [Number] telah disetujui",
            },
            body: {
              en: "[Entity] [Number] has received all required approvals.",
              id: "[Entity] [Number] telah menerima seluruh persetujuan yang diperlukan.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "approval_rejected",
        name: "Approval Rejected",
        description: {
          en: "Notifies the latest submitter when an approver rejects the record.",
          id: "Memberi tahu pengaju terakhir ketika salah satu approver menolak data.",
        },
        trigger: "Rejected",
        type: "required",
        recipient: "Latest submitter",
        permission: null,
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "[Entity] [Number] was rejected\n[Approver Name] rejected [Entity] [Number]. Reason: [Reason].\nCTA: See Detail",
            id: "[Entity] [Number] ditolak\n[Approver Name] menolak [Entity] [Number]. Alasan: [Reason].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "[Entity] [Number] was rejected",
              id: "[Entity] [Number] ditolak",
            },
            body: {
              en: "[Approver Name] rejected [Entity] [Number]. Reason: [Reason].",
              id: "[Approver Name] menolak [Entity] [Number]. Alasan: [Reason].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "revision_requested",
        name: "Revision Requested",
        description: {
          en: "Notifies the latest submitter when an approver requests changes before the record can continue through approval.",
          id: "Memberi tahu pengaju terakhir ketika approver meminta perubahan sebelum data dapat melanjutkan proses persetujuan.",
        },
        trigger: "Needs revision",
        type: "required",
        recipient: "Latest submitter",
        permission: null,
        todo: "Needs revision",
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "[Entity] [Number] needs revision\n[Approver Name] requested changes on [Entity] [Number]. Note: [Revision Note].\nCTA: See Detail",
            id: "[Entity] [Number] perlu revisi\n[Approver Name] meminta perubahan pada [Entity] [Number]. Catatan: [Revision Note].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "[Entity] [Number] needs revision",
              id: "[Entity] [Number] perlu revisi",
            },
            body: {
              en: "[Approver Name] requested changes on [Entity] [Number]. Note: [Revision Note].",
              id: "[Approver Name] meminta perubahan pada [Entity] [Number]. Catatan: [Revision Note].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
    ],
  },
  {
    id: "inventory",
    title: { en: "Inventory", id: "Inventaris" },
    description: {
      en: "Stock-level and batch-expiry alerts for materials. Sent to eligible users with Inventory access.",
      id: "Peringatan stok material dan kedaluwarsa batch. Dikirim kepada pengguna yang memiliki Izin Akses Inventaris.",
    },
    items: [
      {
        id: "material_running_low",
        name: "Material Running Low",
        description: {
          en: "Notifies eligible users with Materials access when the available quantity reaches or falls below the configured minimum stock level.",
          id: "Memberi tahu pengguna yang memiliki Izin Akses Materials ketika jumlah stok tersedia mencapai atau berada di bawah batas minimum yang telah dikonfigurasi.",
        },
        trigger: "Stock reaches minimum",
        type: "configurable",
        recipient: "Eligible users with Inventory access",
        permission: "Materials",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: false },
        content: {
          inApp: {
            en: "Material [Material Name] is running low\nAvailable stock is [Qty] [UOM], at or below the minimum level.\nCTA: See Detail",
            id: "Stok Material [Material Name] menipis\nStok tersedia adalah [Qty] [UOM], sama dengan atau di bawah batas minimum.\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Material [Material Name] is running low",
              id: "Stok Material [Material Name] menipis",
            },
            body: {
              en: "Available stock is [Qty] [UOM], at or below the minimum level.",
              id: "Stok tersedia adalah [Qty] [UOM], sama dengan atau di bawah batas minimum.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "material_out_of_stock",
        name: "Material Out of Stock",
        description: {
          en: "Notifies eligible users with Materials access when the available quantity reaches zero.",
          id: "Memberi tahu pengguna yang memiliki Izin Akses Materials ketika jumlah stok tersedia mencapai nol.",
        },
        trigger: "Stock reaches zero",
        type: "configurable",
        recipient: "Eligible users with Inventory access",
        permission: "Materials",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Material [Material Name] is out of stock\nAvailable stock has reached 0 [UOM].\nCTA: See Detail",
            id: "Material [Material Name] habis\nStok tersedia telah mencapai 0 [UOM].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Material [Material Name] is out of stock",
              id: "Material [Material Name] habis",
            },
            body: {
              en: "Material [Material Name] has reached zero available stock. Please review the material and replenishment plan.",
              id: "Material [Material Name] telah mencapai stok nol. Silakan tinjau material dan rencana pengisian ulang.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "material_expiring_soon",
        name: "Material Expiring Soon",
        description: {
          en: "Notifies eligible users with Batches access before a material batch reaches its expiry date, based on the configured reminder timing.",
          id: "Memberi tahu pengguna yang memiliki Izin Akses Batches sebelum batch material mencapai tanggal kedaluwarsa, sesuai waktu pengingat yang telah dikonfigurasi.",
        },
        trigger: "Configured number of days before the batch expiry date",
        type: "configurable",
        recipient: "Eligible users with Inventory access",
        permission: "Batches",
        todo: null,
        groupId: null,
        remindBefore: DEFAULT_REMIND_BEFORE_DAYS,
        reminderTarget: "expiry date",
        defaults: { inApp: true, email: false },
        content: {
          inApp: {
            en: "Batch [Batch Number] is expiring soon\nBatch [Batch Number] for [Material Name] will expire on [Expiry Date].\nCTA: See Detail",
            id: "Batch [Batch Number] akan segera kedaluwarsa\nBatch [Batch Number] untuk [Material Name] akan kedaluwarsa pada [Expiry Date].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Batch [Batch Number] is expiring soon",
              id: "Batch [Batch Number] akan segera kedaluwarsa",
            },
            body: {
              en: "Batch [Batch Number] for [Material Name] will expire on [Expiry Date].",
              id: "Batch [Batch Number] untuk [Material Name] akan kedaluwarsa pada [Expiry Date].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "material_expired",
        name: "Material Expired",
        description: {
          en: "Notifies eligible users with Batches access when a material batch reaches its expiry date.",
          id: "Memberi tahu pengguna yang memiliki Izin Akses Batches ketika batch material mencapai tanggal kedaluwarsa.",
        },
        trigger: "Batch expires",
        type: "configurable",
        recipient: "Eligible users with Inventory access",
        permission: "Batches",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Batch [Batch Number] has expired\nBatch [Batch Number] for [Material Name] expired on [Expiry Date].\nCTA: See Detail",
            id: "Batch [Batch Number] telah kedaluwarsa\nBatch [Batch Number] untuk [Material Name] kedaluwarsa pada [Expiry Date].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Batch [Batch Number] has expired",
              id: "Batch [Batch Number] telah kedaluwarsa",
            },
            body: {
              en: "Batch [Batch Number] for [Material Name] expired on [Expiry Date]. Please review the remaining quantity and take the required action.",
              id: "Batch [Batch Number] untuk [Material Name] kedaluwarsa pada [Expiry Date]. Silakan tinjau sisa kuantitas dan lakukan tindakan yang diperlukan.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
    ],
  },
  {
    id: "material_request",
    title: { en: "Material Request", id: "Permintaan Material" },
    description: {
      en: "Material transfer and receipt workflow. Material Preparation permission is used for preparers; Material Receipt for the requester or receiver.",
      id: "Alur transfer dan penerimaan material. Izin Akses Persiapan Material digunakan untuk penyiap material, sedangkan Izin Akses Penerimaan Material digunakan untuk pemohon atau penerima.",
    },
    items: [
      {
        id: "mr_transfer_started",
        name: "Transfer Started",
        description: {
          en: "Notifies the requester or material receiver when the requested materials have been transferred and are ready for receipt confirmation.",
          id: "Memberi tahu pemohon atau penerima material ketika material yang diminta telah ditransfer dan siap untuk dikonfirmasi penerimaannya.",
        },
        trigger: "Transfer started",
        type: "required",
        recipient: "Requester / material receiver",
        permission: "Material Receipt",
        todo: "Confirm receipt",
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Material Request [MR Number] transfer started\n[Preparer Name] started the transfer. Please confirm receipt.\nCTA: See Detail",
            id: "Transfer Material Request [MR Number] dimulai\n[Preparer Name] memulai transfer. Silakan konfirmasi penerimaan.\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Material Request [MR Number] transfer started",
              id: "Transfer Material Request [MR Number] dimulai",
            },
            body: {
              en: "[Preparer Name] started the transfer for Material Request [MR Number]. Please confirm receipt.",
              id: "[Preparer Name] memulai transfer untuk Material Request [MR Number]. Silakan konfirmasi penerimaan.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "mr_receipt_confirmed",
        name: "Receipt Confirmed",
        description: {
          en: "Notifies the material preparer when the requester or receiver confirms that the materials were received successfully.",
          id: "Memberi tahu penyiap material ketika pemohon atau penerima mengonfirmasi bahwa material telah diterima dengan baik.",
        },
        trigger: "Receipt confirmed",
        type: "required",
        recipient: "Material preparer",
        permission: "Material Preparation",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Material Request [MR Number] receipt confirmed\n[Receiver Name] confirmed receipt of Material Request [MR Number].\nCTA: See Detail",
            id: "Penerimaan Material Request [MR Number] dikonfirmasi\n[Receiver Name] mengonfirmasi penerimaan Material Request [MR Number].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Material Request [MR Number] receipt confirmed",
              id: "Penerimaan Material Request [MR Number] dikonfirmasi",
            },
            body: {
              en: "[Receiver Name] confirmed receipt of Material Request [MR Number].",
              id: "[Receiver Name] mengonfirmasi penerimaan Material Request [MR Number].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "mr_receipt_rejected",
        name: "Receipt Rejected",
        description: {
          en: "Notifies the material preparer when the requester or receiver reports an issue with the received materials.",
          id: "Memberi tahu penyiap material ketika pemohon atau penerima melaporkan masalah pada material yang diterima.",
        },
        trigger: "Receipt rejected",
        type: "required",
        recipient: "Material preparer",
        permission: "Material Preparation",
        todo: "Resolve issue",
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Material Request [MR Number] receipt rejected\n[Receiver Name] rejected the receipt. Please resolve the issue.\nCTA: See Detail",
            id: "Penerimaan Material Request [MR Number] ditolak\n[Receiver Name] menolak penerimaan. Silakan selesaikan masalahnya.\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Material Request [MR Number] receipt rejected",
              id: "Penerimaan Material Request [MR Number] ditolak",
            },
            body: {
              en: "[Receiver Name] rejected the receipt for Material Request [MR Number]. Please resolve the issue.",
              id: "[Receiver Name] menolak penerimaan untuk Material Request [MR Number]. Silakan selesaikan masalahnya.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "mr_cancelled_by_preparer",
        name: "Material Request Cancelled by Preparer",
        description: {
          en: "Notifies the requester or material receiver when the material preparer cancels the Material Request.",
          id: "Memberi tahu pemohon atau penerima material ketika penyiap material membatalkan Material Request.",
        },
        trigger: "Cancelled by preparer",
        type: "required",
        recipient: "Requester / material receiver",
        permission: "Material Receipt",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Material Request [MR Number] was cancelled\n[Preparer Name] cancelled Material Request [MR Number].\nCTA: See Detail",
            id: "Material Request [MR Number] dibatalkan\n[Preparer Name] membatalkan Material Request [MR Number].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Material Request [MR Number] was cancelled",
              id: "Material Request [MR Number] dibatalkan",
            },
            body: {
              en: "[Preparer Name] cancelled Material Request [MR Number].",
              id: "[Preparer Name] membatalkan Material Request [MR Number].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "mr_new_material_request",
        name: "New Material Request",
        description: {
          en: "Notifies eligible material preparers with access when a new Material Request is created and requires preparation.",
          id: "Memberi tahu penyiap material yang memiliki akses ketika Material Request baru dibuat dan memerlukan persiapan.",
        },
        trigger: "New Material Request is created",
        type: "configurable",
        recipient: "Eligible material preparers with access",
        permission: "Material Preparation",
        todo: null,
        groupId: null,
        // Off by default (PRD System Rules).
        defaults: { enabled: false, inApp: true, email: false },
        content: {
          inApp: {
            en: "New Material Request [MR Number]\n[Requester Name] created a new Material Request for [Work Order / Purpose].\nCTA: See Detail",
            id: "Material Request baru [MR Number]\n[Requester Name] membuat Material Request baru untuk [Work Order / Tujuan].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "New Material Request [MR Number]",
              id: "Material Request baru [MR Number]",
            },
            body: {
              en: "[Requester Name] created a new Material Request for [Work Order / Purpose].",
              id: "[Requester Name] membuat Material Request baru untuk [Work Order / Tujuan].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
    ],
  },
  {
    id: "work_order",
    title: { en: "Work Order", id: "Work Order" },
    description: {
      en: "Work Order deadlines, status changes, new work orders, and outsourced Purchase Order activity. Sent to eligible users with Work Order access.",
      id: "Pengingat batas waktu, perubahan status, Work Order baru, dan aktivitas Purchase Order outsource. Dikirim kepada pengguna yang memiliki Izin Akses Work Order.",
    },
    items: [
      {
        id: "wo_deadline_approaching",
        name: "Deadline Approaching",
        description: {
          en: "Reminds eligible users with access to the related Work Order before its deadline, based on the configured reminder timing.",
          id: "Mengingatkan pengguna yang memiliki akses ke Work Order terkait sebelum batas waktunya, sesuai waktu pengingat yang telah dikonfigurasi.",
        },
        trigger: "Configured reminder date before deadline",
        type: "configurable",
        recipient: "Eligible users with Work Orders access",
        permission: "Work Orders",
        todo: null,
        groupId: null,
        remindBefore: DEFAULT_REMIND_BEFORE_DAYS,
        reminderTarget: "deadline",
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Work Order [Number] is approaching its deadline\nThe deadline is [Deadline Date]. Current status: [Status].\nCTA: See Detail",
            id: "Work Order [Number] mendekati batas waktu\nBatas waktunya adalah [Deadline Date]. Status saat ini: [Status].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Work Order [Number] is approaching its deadline",
              id: "Work Order [Number] mendekati batas waktu",
            },
            body: {
              en: "Work Order [Number] is approaching its deadline on [Deadline Date]. Current status: [Status].",
              id: "Work Order [Number] mendekati batas waktu pada [Deadline Date]. Status saat ini: [Status].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "wo_deadline_overdue",
        name: "Deadline Overdue",
        description: {
          en: "Notifies eligible users with access to the related Work Order when it has passed its deadline and remains unresolved.",
          id: "Memberi tahu pengguna yang memiliki akses ke Work Order terkait ketika telah melewati batas waktu dan belum diselesaikan.",
        },
        trigger: "Deadline passed",
        type: "configurable",
        recipient: "Eligible users with Work Orders access",
        permission: "Work Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Work Order [Number] is overdue\nThe deadline was [Deadline Date]. Current status: [Status].\nCTA: See Detail",
            id: "Work Order [Number] terlambat\nBatas waktunya adalah [Deadline Date]. Status saat ini: [Status].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Work Order [Number] is overdue",
              id: "Work Order [Number] terlambat",
            },
            body: {
              en: "Work Order [Number] passed its deadline on [Deadline Date] and remains [Status].",
              id: "Work Order [Number] melewati batas waktu pada [Deadline Date] dan tetap berstatus [Status].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "wo_changed_to_completed",
        name: "Changed to Completed",
        description: {
          en: "Notifies eligible users with access to the related Work Order when its status changes to Completed.",
          id: "Memberi tahu pengguna yang memiliki akses ke Work Order terkait ketika statusnya berubah menjadi Completed.",
        },
        trigger: "Status changes to Completed",
        type: "configurable",
        recipient: "Eligible users with Work Orders access",
        permission: "Work Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: false },
        content: {
          inApp: {
            en: "Work Order [Number] has been completed\nThe Work Order status changed to Completed.\nCTA: See Detail",
            id: "Work Order [Number] telah selesai\nStatus Work Order berubah menjadi Completed.\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Work Order [Number] has been completed",
              id: "Work Order [Number] telah selesai",
            },
            body: {
              en: "The Work Order status changed to Completed.",
              id: "Status Work Order berubah menjadi Completed.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "wo_changed_to_cancelled",
        name: "Changed to Cancelled",
        description: {
          en: "Notifies eligible users with access to the related Work Order when its status changes to Cancelled.",
          id: "Memberi tahu pengguna yang memiliki akses ke Work Order terkait ketika statusnya berubah menjadi Cancelled.",
        },
        trigger: "Status changes to Cancelled",
        type: "configurable",
        recipient: "Eligible users with Work Orders access",
        permission: "Work Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: false },
        content: {
          inApp: {
            en: "Work Order [Number] was cancelled\nThe Work Order status changed to Cancelled by [Updated By].\nCTA: See Detail",
            id: "Work Order [Number] dibatalkan\nStatus Work Order berubah menjadi Cancelled oleh [Updated By].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Work Order [Number] was cancelled",
              id: "Work Order [Number] dibatalkan",
            },
            body: {
              en: "The Work Order status changed to Cancelled by [Updated By].",
              id: "Status Work Order berubah menjadi Cancelled oleh [Updated By].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "wo_new_work_order",
        name: "New Work Order",
        description: {
          en: "Notifies eligible users with Work Orders access when a new Work Order is created in Not Started status.",
          id: "Memberi tahu pengguna yang memiliki Izin Akses Work Orders ketika Work Order baru dibuat dengan status Not Started.",
        },
        trigger: "Work Order is created with status Not Started",
        type: "configurable",
        recipient: "Eligible users with Work Orders access",
        permission: "Work Orders",
        todo: null,
        groupId: null,
        // Off by default (PRD System Rules).
        defaults: { enabled: false, inApp: true, email: false },
        content: {
          inApp: {
            en: "New Work Order [WO Number]\nA new Work Order was created for [Product / Order Number] and is currently Not Started.\nCTA: See Detail",
            id: "Work Order baru [WO Number]\nWork Order baru dibuat untuk [Produk / Nomor Order] dan saat ini berstatus Not Started.\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "New Work Order [WO Number]",
              id: "Work Order baru [WO Number]",
            },
            body: {
              en: "A new Work Order was created for [Product / Order Number] and is currently Not Started.",
              id: "Work Order baru dibuat untuk [Produk / Nomor Order] dan saat ini berstatus Not Started.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "wo_outsource_po_issued",
        name: "Outsource Purchase Order Issued",
        description: {
          en: "Notifies eligible users with access to the related Work Order when a linked Purchase Order is issued to the vendor. A separate notification is generated for each linked Work Order.",
          id: "Memberi tahu pengguna yang memiliki akses ke Work Order terkait ketika Purchase Order yang terkait diterbitkan kepada vendor. Notifikasi terpisah dibuat untuk setiap Work Order yang terkait.",
        },
        trigger:
          "A Purchase Order containing one or more outsourced Work Orders changes to Issued (one notification per linked Work Order)",
        type: "configurable",
        recipient: "Eligible users with access to the related Work Order",
        permission: "Work Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Purchase Order [PO Number] for Work Order [WO Number] has been issued\nThe Purchase Order for outsourced Work Order [WO Number] has been issued to [Vendor Name].\nCTA: See Detail",
            id: "Purchase Order [PO Number] untuk Work Order [WO Number] telah diterbitkan\nPurchase Order untuk Work Order outsource [WO Number] telah diterbitkan kepada [Vendor Name].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Purchase Order [PO Number] for Work Order [WO Number] has been issued",
              id: "Purchase Order [PO Number] untuk Work Order [WO Number] telah diterbitkan",
            },
            body: {
              en: "The Purchase Order for outsourced Work Order [WO Number] has been issued to [Vendor Name].",
              id: "Purchase Order untuk Work Order outsource [WO Number] telah diterbitkan kepada [Vendor Name].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "wo_outsource_po_receipt_recorded",
        name: "Outsource Purchase Order Receipt Recorded",
        description: {
          en: "Notifies eligible users with access to the related Work Order when items are received and the Work Order remains partially received. A separate notification is generated for each affected Work Order.",
          id: "Memberi tahu pengguna yang memiliki akses ke Work Order terkait ketika barang diterima dan Work Order masih berstatus diterima sebagian. Notifikasi terpisah dibuat untuk setiap Work Order yang terdampak.",
        },
        trigger:
          "A receipt transaction is recorded for an outsourced Work Order that remains partially received",
        type: "configurable",
        recipient: "Eligible users with access to the related Work Order",
        permission: "Work Orders",
        todo: null,
        // Grouped admin toggle: "Receipt Status Updates" (PRD §6.9).
        groupId: "wo_receipt_status",
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Receipt recorded for Work Order [WO Number]\n[Received Qty] was received under Purchase Order [PO Number]. Total received for this Work Order: [Cumulative WO Received Qty] of [WO Ordered Qty].\nCTA: See Detail",
            id: "Penerimaan dicatat untuk Work Order [WO Number]\n[Received Qty] diterima melalui Purchase Order [PO Number]. Total diterima untuk Work Order ini: [Cumulative WO Received Qty] dari [WO Ordered Qty].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Receipt recorded for Work Order [WO Number]",
              id: "Penerimaan dicatat untuk Work Order [WO Number]",
            },
            body: {
              en: "[Received Qty] was received under Purchase Order [PO Number]. Total received: [Cumulative WO Received Qty] of [WO Ordered Qty].",
              id: "[Received Qty] diterima melalui Purchase Order [PO Number]. Total diterima: [Cumulative WO Received Qty] dari [WO Ordered Qty].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "wo_outsource_po_fully_received",
        name: "Outsource Purchase Order Fully Received",
        description: {
          en: "Notifies eligible users with access to the related Work Order when all outsourced items have been received. A separate notification is generated for each completed Work Order.",
          id: "Memberi tahu pengguna yang memiliki akses ke Work Order terkait ketika seluruh item outsource telah diterima. Notifikasi terpisah dibuat untuk setiap Work Order yang selesai.",
        },
        trigger:
          "A receipt transaction brings an outsourced Work Order to its total ordered quantity",
        type: "configurable",
        recipient: "Eligible users with access to the related Work Order",
        permission: "Work Orders",
        todo: null,
        groupId: "wo_receipt_status",
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Work Order [WO Number] has been fully received\nAll outsourced items for Work Order [WO Number] under Purchase Order [PO Number] have been received.\nCTA: See Detail",
            id: "Work Order [WO Number] telah diterima seluruhnya\nSeluruh item outsource untuk Work Order [WO Number] melalui Purchase Order [PO Number] telah diterima.\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Work Order [WO Number] has been fully received",
              id: "Work Order [WO Number] telah diterima seluruhnya",
            },
            body: {
              en: "All outsourced items for Work Order [WO Number] under Purchase Order [PO Number] have been received.",
              id: "Seluruh item outsource untuk Work Order [WO Number] melalui Purchase Order [PO Number] telah diterima.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
    ],
  },
  {
    id: "custom_product_request",
    title: { en: "Custom Product Request", id: "Permintaan Produk Khusus" },
    description: {
      en: "Custom Product Request creation. Sent to subscribed users with Custom Product Request access.",
      id: "Pembuatan Permintaan Produk Khusus. Dikirim kepada pengguna yang berlangganan dan memiliki Izin Akses Permintaan Produk Khusus.",
    },
    items: [
      {
        id: "cpr_new_request",
        name: "New Request",
        description: {
          en: "Notifies eligible users with Custom Product Requests access when a new Custom Product Request is created and is ready for review or processing.",
          id: "Memberi tahu pengguna yang memiliki Izin Akses Custom Product Requests ketika Custom Product Request baru dibuat dan siap untuk ditinjau atau diproses.",
        },
        trigger: "New request",
        type: "configurable",
        recipient: "Subscribed users with CPR access",
        permission: "Custom Product Requests",
        todo: null,
        groupId: null,
        // Off by default (PRD System Rules).
        defaults: { enabled: false, inApp: true, email: false },
        content: {
          inApp: {
            en: "New Custom Product Request [Number]\nCreated by [Requester Name] for [Customer Name].\nCTA: See Detail",
            id: "Custom Product Request baru [Number]\nDibuat oleh [Requester Name] untuk [Customer Name].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "New Custom Product Request [Number]",
              id: "Custom Product Request baru [Number]",
            },
            body: {
              en: "Created by [Requester Name] for [Customer Name].",
              id: "Dibuat oleh [Requester Name] untuk [Customer Name].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
    ],
  },
  {
    id: "quotes",
    title: { en: "Quotes", id: "Penawaran" },
    description: {
      en: "Quote validity reminders and Customer Portal outcomes. Customer Portal events resolve to the portal sender.",
      id: "Pengingat masa berlaku Penawaran dan aktivitas Portal Pelanggan. Notifikasi Portal Pelanggan dikirim kepada pengguna yang membagikan Portal Pelanggan.",
    },
    items: [
      {
        id: "quote_valid_until_reminder",
        name: "Quote Valid Until Reminder",
        description: {
          en: "Reminds eligible users with Quotes access before an issued Quote reaches its validity date, based on the configured reminder timing.",
          id: "Mengingatkan pengguna yang memiliki Izin Akses Quotes sebelum Quote yang diterbitkan mencapai tanggal berakhir masa berlakunya, sesuai waktu pengingat yang telah dikonfigurasi.",
        },
        trigger: "Configured reminder date before valid-until date",
        type: "configurable",
        recipient: "Subscribed users with Quote access",
        permission: "Quotes",
        todo: null,
        groupId: null,
        remindBefore: DEFAULT_REMIND_BEFORE_DAYS,
        reminderTarget: "valid-until date",
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Quote [Number] is approaching its validity date\nThe Quote is valid until [Valid Until Date].\nCTA: See Detail",
            id: "Quote [Number] mendekati tanggal berakhir\nQuote berlaku sampai [Valid Until Date].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Quote [Number] is approaching its validity date",
              id: "Quote [Number] mendekati tanggal berakhir",
            },
            body: {
              en: "Quote [Number] is valid until [Valid Until Date]. Please review and follow up before it expires.",
              id: "Quote [Number] berlaku sampai [Valid Until Date]. Silakan tinjau dan tindak lanjuti sebelum masa berlakunya habis.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "quote_approved_by_customer",
        name: "Quote Approved by Customer",
        description: {
          en: "Notifies the user who shared the Customer Portal when the customer approves the Quote.",
          id: "Memberi tahu pengguna yang membagikan Customer Portal ketika pelanggan menyetujui Quote.",
        },
        trigger: "Customer approves Quote through Customer Portal",
        type: "required",
        recipient: "Customer Portal sender",
        permission: "Quotes",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Quote [Number] was approved by the customer\n[Customer Name] approved Quote [Number] through the Customer Portal.\nCTA: See Detail",
            id: "Quote [Number] disetujui oleh pelanggan\n[Customer Name] menyetujui Quote [Number] melalui Customer Portal.\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Quote [Number] was approved by the customer",
              id: "Quote [Number] disetujui oleh pelanggan",
            },
            body: {
              en: "[Customer Name] approved Quote [Number] through the Customer Portal.",
              id: "[Customer Name] menyetujui Quote [Number] melalui Customer Portal.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "quote_rejected_by_customer",
        name: "Quote Rejected by Customer",
        description: {
          en: "Notifies the user who shared the Customer Portal when the customer rejects the Quote.",
          id: "Memberi tahu pengguna yang membagikan Customer Portal ketika pelanggan menolak Quote.",
        },
        trigger: "Customer rejects Quote through Customer Portal",
        type: "required",
        recipient: "Customer Portal sender",
        permission: "Quotes",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Quote [Number] was rejected by the customer\n[Customer Name] rejected Quote [Number] through the Customer Portal.\nCTA: See Detail",
            id: "Quote [Number] ditolak oleh pelanggan\n[Customer Name] menolak Quote [Number] melalui Customer Portal.\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Quote [Number] was rejected by the customer",
              id: "Quote [Number] ditolak oleh pelanggan",
            },
            body: {
              en: "[Customer Name] rejected Quote [Number] through the Customer Portal.",
              id: "[Customer Name] menolak Quote [Number] melalui Customer Portal.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "quote_revision_requested_by_customer",
        name: "Quote Revision Requested by Customer",
        description: {
          en: "Notifies the user who shared the Customer Portal when the customer requests changes to the Quote.",
          id: "Memberi tahu pengguna yang membagikan Customer Portal ketika pelanggan meminta perubahan pada Quote.",
        },
        trigger: "Customer requests changes through Customer Portal",
        type: "required",
        recipient: "Customer Portal sender",
        permission: "Quotes",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Quote [Number] revision requested by the customer\n[Customer Name] requested changes on Quote [Number] through the Customer Portal.\nCTA: See Detail",
            id: "Revisi Quote [Number] diminta oleh pelanggan\n[Customer Name] meminta perubahan pada Quote [Number] melalui Customer Portal.\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Quote [Number] revision requested by the customer",
              id: "Revisi Quote [Number] diminta oleh pelanggan",
            },
            body: {
              en: "[Customer Name] requested changes on Quote [Number] through the Customer Portal.",
              id: "[Customer Name] meminta perubahan pada Quote [Number] melalui Customer Portal.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
    ],
  },
  {
    id: "orders",
    title: { en: "Orders", id: "Pesanan" },
    description: {
      en: "Order deadlines, status changes, new orders, and linked-invoice payment. Sent to eligible users with Order access.",
      id: "Pengingat batas waktu, perubahan status, Pesanan baru, dan pembayaran Faktur yang terkait. Dikirim kepada pengguna yang memiliki Izin Akses Pesanan.",
    },
    items: [
      {
        id: "order_deadline_approaching",
        name: "Order Deadline Approaching",
        description: {
          en: "Reminds eligible users with access to the related Order before its deadline, based on the configured reminder timing.",
          id: "Mengingatkan pengguna yang memiliki akses ke Order terkait sebelum batas waktunya, sesuai waktu pengingat yang telah dikonfigurasi.",
        },
        trigger: "Configured reminder date before deadline",
        type: "configurable",
        recipient: "Eligible users with Orders access",
        permission: "Orders",
        todo: null,
        groupId: null,
        remindBefore: DEFAULT_REMIND_BEFORE_DAYS,
        reminderTarget: "deadline",
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Order [Number] is approaching its deadline\nThe deadline is [Deadline Date]. Current status: [Status].\nCTA: See Detail",
            id: "Order [Number] mendekati batas waktu\nBatas waktunya adalah [Deadline Date]. Status saat ini: [Status].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Order [Number] is approaching its deadline",
              id: "Order [Number] mendekati batas waktu",
            },
            body: {
              en: "Order [Number] is approaching its deadline on [Deadline Date]. Current status: [Status].",
              id: "Order [Number] mendekati batas waktu pada [Deadline Date]. Status saat ini: [Status].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "order_deadline_overdue",
        name: "Order Deadline Overdue",
        description: {
          en: "Notifies eligible users with access to the related Order when it has passed its deadline and remains unresolved.",
          id: "Memberi tahu pengguna yang memiliki akses ke Order terkait ketika telah melewati batas waktu dan belum diselesaikan.",
        },
        trigger: "Deadline passed",
        type: "configurable",
        recipient: "Eligible users with Orders access",
        permission: "Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Order [Number] is overdue\nThe deadline was [Deadline Date]. Current status: [Status].\nCTA: See Detail",
            id: "Order [Number] terlambat\nBatas waktunya adalah [Deadline Date]. Status saat ini: [Status].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Order [Number] is overdue",
              id: "Order [Number] terlambat",
            },
            body: {
              en: "Order [Number] passed its deadline on [Deadline Date] and remains [Status].",
              id: "Order [Number] melewati batas waktu pada [Deadline Date] dan tetap berstatus [Status].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "order_changed_to_completed",
        name: "Changed to Completed",
        description: {
          en: "Notifies eligible users with access to the related Order when its status changes to Completed.",
          id: "Memberi tahu pengguna yang memiliki akses ke Order terkait ketika statusnya berubah menjadi Completed.",
        },
        trigger: "Status changes to Completed",
        type: "configurable",
        recipient: "Eligible users with Orders access",
        permission: "Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: false },
        content: {
          inApp: {
            en: "Order [Number] has been completed\nThe Order status changed to Completed.\nCTA: See Detail",
            id: "Order [Number] telah selesai\nStatus Order berubah menjadi Completed.\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Order [Number] has been completed",
              id: "Order [Number] telah selesai",
            },
            body: {
              en: "The Order status changed to Completed.",
              id: "Status Order berubah menjadi Completed.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "order_changed_to_cancelled",
        name: "Changed to Cancelled",
        description: {
          en: "Notifies eligible users with access to the related Order when its status changes to Cancelled.",
          id: "Memberi tahu pengguna yang memiliki akses ke Order terkait ketika statusnya berubah menjadi Cancelled.",
        },
        trigger: "Status changes to Cancelled",
        type: "configurable",
        recipient: "Eligible users with Orders access",
        permission: "Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: false },
        content: {
          inApp: {
            en: "Order [Number] was cancelled\nThe Order status changed to Cancelled by [Updated By].\nCTA: See Detail",
            id: "Order [Number] dibatalkan\nStatus Order berubah menjadi Cancelled oleh [Updated By].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Order [Number] was cancelled",
              id: "Order [Number] dibatalkan",
            },
            body: {
              en: "The Order status changed to Cancelled by [Updated By].",
              id: "Status Order berubah menjadi Cancelled oleh [Updated By].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "order_new_order",
        name: "New Order",
        description: {
          en: "Notifies eligible users with Orders access when a new Order is created in Not Started status.",
          id: "Memberi tahu pengguna yang memiliki Izin Akses Orders ketika Order baru dibuat dengan status Not Started.",
        },
        trigger: "Order is created with status Not Started",
        type: "configurable",
        recipient: "Eligible users with Orders access",
        permission: "Orders",
        todo: null,
        groupId: null,
        // Off by default (PRD System Rules).
        defaults: { enabled: false, inApp: true, email: false },
        content: {
          inApp: {
            en: "New Order [Order Number]\nA new Order was created for [Customer Name] and is currently Not Started.\nCTA: See Detail",
            id: "Order baru [Order Number]\nOrder baru dibuat untuk [Customer Name] dan saat ini berstatus Not Started.\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "New Order [Order Number]",
              id: "Order baru [Order Number]",
            },
            body: {
              en: "A new Order was created for [Customer Name] and is currently Not Started.",
              id: "Order baru dibuat untuk [Customer Name] dan saat ini berstatus Not Started.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "order_invoice_paid",
        name: "Order Invoice Paid",
        description: {
          en: "Notifies eligible users with access to the related Order when a linked Invoice is fully paid. Partial payments do not trigger this notification.",
          id: "Memberi tahu pengguna yang memiliki akses ke Order terkait ketika Invoice yang terkait telah dibayar lunas. Pembayaran sebagian tidak memicu notifikasi ini.",
        },
        trigger: "An Invoice linked to an Order changes to Paid",
        type: "configurable",
        recipient: "Eligible users with access to the related Order",
        permission: "Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Invoice [Invoice Number] for Order [Order Number] has been paid\nThe invoice payment has been completed. Paid amount: [Paid Amount].\nCTA: See Detail",
            id: "Invoice [Invoice Number] untuk Order [Order Number] telah dibayar\nPembayaran invoice telah selesai. Jumlah dibayar: [Paid Amount].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Invoice [Invoice Number] for Order [Order Number] has been paid",
              id: "Invoice [Invoice Number] untuk Order [Order Number] telah dibayar",
            },
            body: {
              en: "Invoice [Invoice Number] linked to Order [Order Number] has been paid. Paid amount: [Paid Amount].",
              id: "Invoice [Invoice Number] yang terkait dengan Order [Order Number] telah dibayar. Jumlah dibayar: [Paid Amount].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
    ],
  },
  {
    id: "invoice",
    title: { en: "Invoice", id: "Faktur" },
    description: {
      en: "Invoice due-date reminders, overdue alerts, Customer Portal outcomes, and payment proof review. Invoice has no internal approval/revision flow.",
      id: "Pengingat tanggal jatuh tempo Faktur, notifikasi keterlambatan, aktivitas Portal Pelanggan, dan peninjauan bukti pembayaran. Faktur tidak memiliki alur persetujuan atau revisi internal.",
    },
    items: [
      {
        id: "invoice_due_date_approaching",
        name: "Due Date Approaching",
        description: {
          en: "Reminds eligible users with Invoices access before an unpaid Invoice reaches its due date, based on the configured reminder timing.",
          id: "Mengingatkan pengguna yang memiliki Izin Akses Invoices sebelum Invoice yang belum dibayar mencapai tanggal jatuh tempo, sesuai waktu pengingat yang telah dikonfigurasi.",
        },
        trigger: "Configured reminder date before due date",
        type: "configurable",
        recipient: "Subscribed users with Invoice access",
        permission: "Invoices",
        todo: null,
        groupId: null,
        remindBefore: DEFAULT_REMIND_BEFORE_DAYS,
        reminderTarget: "due date",
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Invoice [Number] is approaching its due date\nThe due date is [Due Date]. Outstanding amount: [Amount] [Currency].\nCTA: See Detail",
            id: "Invoice [Number] mendekati tanggal jatuh tempo\nTanggal jatuh tempo adalah [Due Date]. Sisa tagihan: [Amount] [Currency].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Invoice [Number] is approaching its due date",
              id: "Invoice [Number] mendekati tanggal jatuh tempo",
            },
            body: {
              en: "Invoice [Number] is approaching its due date on [Due Date]. Outstanding amount: [Amount] [Currency].",
              id: "Invoice [Number] mendekati tanggal jatuh tempo pada [Due Date]. Sisa tagihan: [Amount] [Currency].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "invoice_overdue",
        name: "Invoice Overdue",
        description: {
          en: "Notifies eligible users with Invoices access when an unpaid Invoice has passed its due date.",
          id: "Memberi tahu pengguna yang memiliki Izin Akses Invoices ketika Invoice yang belum dibayar telah melewati tanggal jatuh tempo.",
        },
        trigger: "Due date passed and unpaid",
        type: "configurable",
        recipient: "Subscribed users with Invoice access",
        permission: "Invoices",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Invoice [Number] is overdue\nThe invoice was due on [Due Date]. Outstanding amount: [Amount] [Currency].\nCTA: See Detail",
            id: "Invoice [Number] terlambat\nInvoice jatuh tempo pada [Due Date]. Sisa tagihan: [Amount] [Currency].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Invoice [Number] is overdue",
              id: "Invoice [Number] terlambat",
            },
            body: {
              en: "Invoice [Number] passed its due date on [Due Date]. Outstanding amount: [Amount] [Currency].",
              id: "Invoice [Number] melewati tanggal jatuh tempo pada [Due Date]. Sisa tagihan: [Amount] [Currency].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "invoice_approved_by_customer",
        name: "Invoice Approved by Customer",
        description: {
          en: "Notifies the Invoice owner or Customer Portal sender when the customer approves the Invoice.",
          id: "Memberi tahu pemilik Invoice atau pengirim Customer Portal ketika pelanggan menyetujui Invoice.",
        },
        trigger: "Customer approves Invoice through Customer Portal",
        type: "required",
        recipient: "Invoice owner or Customer Portal sender",
        permission: "Invoices",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Invoice [Number] was approved by the customer\n[Customer Name] approved Invoice [Number] through the Customer Portal.\nCTA: See Detail",
            id: "Invoice [Number] disetujui oleh pelanggan\n[Customer Name] menyetujui Invoice [Number] melalui Customer Portal.\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Invoice [Number] was approved by the customer",
              id: "Invoice [Number] disetujui oleh pelanggan",
            },
            body: {
              en: "[Customer Name] approved Invoice [Number] through the Customer Portal.",
              id: "[Customer Name] menyetujui Invoice [Number] melalui Customer Portal.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "invoice_rejected_by_customer",
        name: "Invoice Rejected by Customer",
        description: {
          en: "Notifies the Invoice owner or Customer Portal sender when the customer rejects the Invoice.",
          id: "Memberi tahu pemilik Invoice atau pengirim Customer Portal ketika pelanggan menolak Invoice.",
        },
        trigger: "Customer rejects Invoice through Customer Portal",
        type: "required",
        recipient: "Invoice owner or Customer Portal sender",
        permission: "Invoices",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Invoice [Number] was rejected by the customer\n[Customer Name] rejected Invoice [Number] through the Customer Portal.\nCTA: See Detail",
            id: "Invoice [Number] ditolak oleh pelanggan\n[Customer Name] menolak Invoice [Number] melalui Customer Portal.\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Invoice [Number] was rejected by the customer",
              id: "Invoice [Number] ditolak oleh pelanggan",
            },
            body: {
              en: "[Customer Name] rejected Invoice [Number] through the Customer Portal.",
              id: "[Customer Name] menolak Invoice [Number] melalui Customer Portal.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "invoice_revision_requested_by_customer",
        name: "Invoice Revision Requested by Customer",
        description: {
          en: "Notifies the Invoice owner or Customer Portal sender when the customer requests changes to the Invoice.",
          id: "Memberi tahu pemilik Invoice atau pengirim Customer Portal ketika pelanggan meminta perubahan pada Invoice.",
        },
        trigger: "Customer requests changes through Customer Portal",
        type: "required",
        recipient: "Invoice owner or Customer Portal sender",
        permission: "Invoices",
        todo: "Needs revision",
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Invoice [Number] revision requested by the customer\n[Customer Name] requested changes on Invoice [Number] through the Customer Portal.\nCTA: See Detail",
            id: "Revisi Invoice [Number] diminta oleh pelanggan\n[Customer Name] meminta perubahan pada Invoice [Number] melalui Customer Portal.\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Invoice [Number] revision requested by the customer",
              id: "Revisi Invoice [Number] diminta oleh pelanggan",
            },
            body: {
              en: "[Customer Name] requested changes on Invoice [Number] through the Customer Portal.",
              id: "[Customer Name] meminta perubahan pada Invoice [Number] melalui Customer Portal.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "invoice_payment_proof_submitted",
        name: "Payment Proof Submitted",
        description: {
          en: "Notifies the Invoice owner or responsible reviewer when a customer uploads payment proof through the Customer Portal.",
          id: "Memberi tahu pemilik Invoice atau peninjau yang bertanggung jawab ketika pelanggan mengunggah bukti pembayaran melalui Customer Portal.",
        },
        trigger: "Payment proof submitted through portal",
        type: "required",
        recipient: "Invoice owner or portal sender",
        permission: "Invoices",
        todo: "Review proof",
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Payment proof submitted for Invoice [Number]\n[Customer Name] submitted payment proof for Invoice [Number]. Please review.\nCTA: See Detail",
            id: "Bukti pembayaran dikirim untuk Invoice [Number]\n[Customer Name] mengirim bukti pembayaran untuk Invoice [Number]. Silakan tinjau.\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Payment proof submitted for Invoice [Number]",
              id: "Bukti pembayaran dikirim untuk Invoice [Number]",
            },
            body: {
              en: "[Customer Name] submitted payment proof for Invoice [Number]. Please review.",
              id: "[Customer Name] mengirim bukti pembayaran untuk Invoice [Number]. Silakan tinjau.",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "invoice_payment_proof_rejected",
        name: "Payment Proof Rejected",
        description: {
          en: "Notifies the customer when their payment proof is rejected and must be uploaded again.",
          id: "Memberi tahu pelanggan ketika bukti pembayarannya ditolak dan harus diunggah ulang.",
        },
        trigger: "Internal reviewer rejects customer payment proof",
        type: "required",
        recipient: "Customer",
        permission: "Invoices",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Payment proof for Invoice [Number] was rejected\nYour payment proof for Invoice [Number] was rejected. Reason: [Reason]. Please re-upload.\nCTA: See Detail",
            id: "Bukti pembayaran untuk Invoice [Number] ditolak\nBukti pembayaran Anda untuk Invoice [Number] ditolak. Alasan: [Reason]. Silakan unggah ulang.\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Payment proof for Invoice [Number] was rejected",
              id: "Bukti pembayaran untuk Invoice [Number] ditolak",
            },
            body: {
              en: "Your payment proof for Invoice [Number] was rejected. Reason: [Reason]. Please re-upload the payment proof.",
              id: "Bukti pembayaran Anda untuk Invoice [Number] ditolak. Alasan: [Reason]. Silakan unggah ulang bukti pembayaran.",
            },
            cta: { en: "Re-upload payment proof", id: "Unggah ulang bukti pembayaran" },
          },
        },
      },
    ],
  },
  {
    id: "purchase_order",
    title: { en: "Purchase Order", id: "Purchase Order" },
    description: {
      en: "Purchase Order payment and expected-end-date tracking. Sent to subscribed users with Purchase Order access.",
      id: "Pemantauan pembayaran dan estimasi tanggal selesai Purchase Order. Dikirim kepada pengguna yang berlangganan dan memiliki Izin Akses Purchase Order.",
    },
    items: [
      {
        id: "po_payment_overdue",
        name: "Payment Overdue",
        description: {
          en: "Notifies eligible users with Purchase Orders access when a Purchase Order remains unpaid after its payment due date.",
          id: "Memberi tahu pengguna yang memiliki Izin Akses Purchase Orders ketika Purchase Order masih belum dibayar setelah melewati tanggal jatuh tempo pembayaran.",
        },
        trigger: "Payment due date passed",
        type: "configurable",
        recipient: "Subscribed users with Purchase Order access",
        permission: "Purchase Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Payment for Purchase Order [Number] is overdue\nThe payment due date was [Due Date]. Outstanding amount: [Amount] [Currency].\nCTA: See Detail",
            id: "Pembayaran Purchase Order [Number] terlambat\nTanggal jatuh tempo pembayaran adalah [Due Date]. Sisa pembayaran: [Amount] [Currency].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Payment for Purchase Order [Number] is overdue",
              id: "Pembayaran Purchase Order [Number] terlambat",
            },
            body: {
              en: "Payment for Purchase Order [Number] passed its due date on [Due Date]. Outstanding amount: [Amount] [Currency].",
              id: "Pembayaran Purchase Order [Number] melewati tanggal jatuh tempo pada [Due Date]. Sisa pembayaran: [Amount] [Currency].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "po_expected_end_date_approaching",
        name: "Expected End Date Approaching",
        description: {
          en: "Reminds eligible users with Purchase Orders access before a Purchase Order reaches its expected end date, based on the configured reminder timing.",
          id: "Mengingatkan pengguna yang memiliki Izin Akses Purchase Orders sebelum Purchase Order mencapai tanggal selesai yang diperkirakan, sesuai waktu pengingat yang telah dikonfigurasi.",
        },
        trigger: "Configured reminder date before expected end date",
        type: "configurable",
        recipient: "Subscribed users with Purchase Order access",
        permission: "Purchase Orders",
        todo: null,
        groupId: null,
        remindBefore: DEFAULT_REMIND_BEFORE_DAYS,
        reminderTarget: "expected end date",
        defaults: { inApp: true, email: false },
        content: {
          inApp: {
            en: "Purchase Order [Number] is approaching its expected end date\nThe expected end date is [Expected End Date]. Current status: [Status].\nCTA: See Detail",
            id: "Purchase Order [Number] mendekati tanggal selesai yang diperkirakan\nTanggal selesai yang diharapkan adalah [Expected End Date]. Status saat ini: [Status].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Purchase Order [Number] is approaching its expected end date",
              id: "Purchase Order [Number] mendekati tanggal selesai yang diperkirakan",
            },
            body: {
              en: "Purchase Order [Number] is approaching its expected end date on [Expected End Date]. Current status: [Status].",
              id: "Purchase Order [Number] mendekati tanggal selesai yang diperkirakan pada [Expected End Date]. Status saat ini: [Status].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
      {
        id: "po_expected_end_date_overdue",
        name: "Expected End Date Overdue",
        description: {
          en: "Notifies eligible users with Purchase Orders access when a Purchase Order remains incomplete after its expected end date.",
          id: "Memberi tahu pengguna yang memiliki Izin Akses Purchase Orders ketika Purchase Order masih belum selesai setelah melewati tanggal selesai yang diperkirakan.",
        },
        trigger: "Expected end date passed",
        type: "configurable",
        recipient: "Subscribed users with Purchase Order access",
        permission: "Purchase Orders",
        todo: null,
        groupId: null,
        defaults: { inApp: true, email: true },
        content: {
          inApp: {
            en: "Purchase Order [Number] is overdue against its expected end date\nThe expected end date was [Expected End Date]. Current status: [Status].\nCTA: See Detail",
            id: "Purchase Order [Number] melewati tanggal selesai yang diharapkan\nTanggal selesai yang diharapkan adalah [Expected End Date]. Status saat ini: [Status].\nCTA: Lihat Detail",
          },
          email: {
            subject: {
              en: "Purchase Order [Number] is overdue",
              id: "Purchase Order [Number] terlambat",
            },
            body: {
              en: "Purchase Order [Number] passed its expected end date on [Expected End Date] and remains [Status].",
              id: "Purchase Order [Number] melewati tanggal selesai yang diperkirakan pada [Expected End Date] dan tetap berstatus [Status].",
            },
            cta: SEE_DETAIL,
          },
        },
      },
    ],
  },
];

// Grouped admin toggles: one control writes to several rule ids at once.
export const NOTIFICATION_GROUPS = {
  wo_receipt_status: {
    id: "wo_receipt_status",
    label: { en: "Receipt Status Updates", id: "Pembaruan Status Penerimaan" },
    description: {
      en: "Outsourced receipt recorded and fully received updates.",
      id: "Pembaruan saat penerimaan outsource dicatat dan telah diterima sepenuhnya.",
    },
    memberIds: [
      "wo_outsource_po_receipt_recorded",
      "wo_outsource_po_fully_received",
    ],
  },
};

// Rules that support a company-configured "approaching" reminder (Remind Before).
export const REMINDER_SUPPORTED_RULE_IDS = new Set([
  "material_expiring_soon",
  "wo_deadline_approaching",
  "quote_valid_until_reminder",
  "order_deadline_approaching",
  "invoice_due_date_approaching",
  "po_expected_end_date_approaching",
]);

// Flat list of every rule with its owning module id attached.
export const ALL_NOTIFICATION_RULES = DEFAULT_NOTIFICATION_SETTINGS.flatMap(
  (section) => section.items.map((item) => ({ ...item, moduleId: section.id }))
);

// Build the default company-settings state: per rule id →
// { inApp, email, [remindBefore] }. A notification's on/off status is derived
// from its channels — it is "on" when at least one channel is enabled, and at
// least one channel must always stay on. remindBefore (days) is present only
// for reminder-supported rules. Required rules are always fully on.
export const buildDefaultCompanySettings = () =>
  ALL_NOTIFICATION_RULES.reduce((acc, rule) => {
    const base =
      rule.type === "required"
        ? { inApp: true, email: true }
        : { inApp: rule.defaults.inApp, email: rule.defaults.email };
    if (REMINDER_SUPPORTED_RULE_IDS.has(rule.id)) {
      base.remindBefore = rule.remindBefore ?? DEFAULT_REMIND_BEFORE_DAYS;
    }
    acc[rule.id] = base;
    return acc;
  }, {});

export const cloneCompanySettings = (settings) =>
  Object.entries(settings || buildDefaultCompanySettings()).reduce(
    (acc, [id, channels]) => {
      acc[id] = { ...channels };
      return acc;
    },
    {}
  );

// Personal preference options (PRD Personal Notification Preferences AC #2).
export const PERSONAL_PREFERENCE_OPTIONS = {
  useCompanyDefault: "use_company_default",
  on: "on",
  off: "off",
};

export const buildDefaultPersonalPreferences = () =>
  ALL_NOTIFICATION_RULES.reduce((acc, rule) => {
    acc[rule.id] = {
      preference: PERSONAL_PREFERENCE_OPTIONS.useCompanyDefault,
      inApp: rule.defaults.inApp,
      email: rule.defaults.email,
    };
    return acc;
  }, {});

export const clonePersonalPreferences = (prefs) =>
  Object.entries(prefs || buildDefaultPersonalPreferences()).reduce(
    (acc, [id, value]) => {
      acc[id] = { ...value };
      return acc;
    },
    {}
  );
