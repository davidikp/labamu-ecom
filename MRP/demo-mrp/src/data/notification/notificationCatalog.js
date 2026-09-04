// Notification Catalog — encodes PRD section 6 ("Notification Catalog").
//
// Each entry is keyed `${moduleKey}.${triggerKey}` and describes:
//   recipientRule : who receives it (resolved to users/emails by the engine)
//   channels      : { inApp, email } — which surfaces fire
//   todo          : action-required Todo descriptor (or null)
//   inApp(ctx)    : { title:{en,id}, body:{en,id}, cta:{en,id} }
//   email(ctx)    : { subject:{en,id}, body:{en,id} }
//
// `ctx` carries the dynamic [bracket] variables injected at send time:
//   number, submitterName, approverName, approverNames, reason, note,
//   customerPicName, customerCompany, workOrderNo, requesterName,
//   preparerName, requestId, approvedStatus

const quote = (s) => `"${s ?? ""}"`;
const quoteId = (s) => `“${s ?? ""}”`;

// Build the full internal-approval lifecycle (submitted → one approved →
// all approved → rejected → need revision) for a module that follows the
// standard "all approvers must approve" pattern.
const makeApprovalLifecycle = (noun, approvedStatus) => ({
  submitted: {
    recipientRule: "all_approvers",
    channels: { inApp: true, email: true },
    todo: {
      type: "approval",
      tag: { en: "Needs your approval", id: "Perlu persetujuan Anda" },
      action: { en: "Review", id: "Tinjau" },
    },
    inApp: (c) => ({
      title: {
        en: `${noun.en} ${c.number} needs your approval`,
        id: `${noun.id} ${c.number} memerlukan persetujuan Anda`,
      },
      body: {
        en: `Submitted by ${c.submitterName} is waiting for your review.`,
        id: `Diajukan oleh ${c.submitterName} dan sedang menunggu peninjauan Anda.`,
      },
      cta: { en: "Review", id: "Tinjau" },
    }),
    email: (c) => {
      const names = c.approverNames || [];
      const multi = names.length > 1;
      const listLine = multi ? " All listed approvers must approve." : "";
      const listLineId = multi ? " Semua approver berikut harus menyetujui." : "";
      // One group email addressed to every approver in the To field — greeting
      // stays a consistent "Hi Approvers" regardless of approver count.
      return {
        subject: {
          en: `${noun.en} ${c.number} needs your approval`,
          id: `${noun.id} ${c.number} memerlukan persetujuan Anda`,
        },
        body: {
          en: `Hi Approvers, ${c.submitterName} submitted ${c.number} for approval.${listLine}`,
          id: `Halo Approvers, ${c.submitterName} mengajukan ${c.number} untuk disetujui.${listLineId}`,
        },
        cta: { en: `Review ${noun.en}`, id: `Tinjau ${noun.id}` },
      };
    },
  },

  one_approved: {
    recipientRule: "submitter_cc_approvers",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `${noun.en} ${c.number} — approved by ${c.approverName}`,
        id: `${noun.id} ${c.number} — disetujui oleh ${c.approverName}`,
      },
      body: {
        en: `${c.approverName} has approved your ${noun.en}.`,
        id: `${c.approverName} telah menyetujui ${noun.id} Anda.`,
      },
      cta: { en: "View", id: "Lihat" },
    }),
    email: (c) => ({
      subject: {
        en: `${noun.en} ${c.number} — approved by ${c.approverName}`,
        id: `${noun.id} ${c.number} — disetujui oleh ${c.approverName}`,
      },
      body: {
        en: `Hi ${c.submitterName}, ${c.approverName} has approved ${noun.en} ${c.number}.`,
        id: `Halo ${c.submitterName}, ${c.approverName} telah menyetujui ${noun.id} ${c.number}.`,
      },
      cta: { en: `View ${noun.en}`, id: `Lihat ${noun.id}` },
    }),
  },

  all_approved: {
    recipientRule: "submitter_cc_approvers",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `${noun.en} ${c.number} has been approved`,
        id: `${noun.id} ${c.number} telah disetujui`,
      },
      body: {
        en: `All reviewers have approved. Status is now ${approvedStatus.en}.`,
        id: `Semua peninjau telah menyetujui. Status sekarang menjadi ${approvedStatus.id}.`,
      },
      cta: { en: "View", id: "Lihat" },
    }),
    email: (c) => ({
      subject: {
        en: `${noun.en} ${c.number} has been approved`,
        id: `${noun.id} ${c.number} telah disetujui`,
      },
      body: {
        en: `Hi ${c.submitterName}, ${noun.en} ${c.number} has been approved by all reviewers. It is now ${approvedStatus.en}.`,
        id: `Halo ${c.submitterName}, ${noun.id} ${c.number} telah disetujui oleh semua peninjau. Status sekarang ${approvedStatus.id}.`,
      },
      cta: { en: `View ${noun.en}`, id: `Lihat ${noun.id}` },
    }),
  },

  rejected: {
    recipientRule: "submitter_cc_approvers",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `${noun.en} ${c.number} was rejected`,
        id: `${noun.id} ${c.number} ditolak`,
      },
      body: {
        en: `${c.approverName} rejected your ${noun.en}. Reason: ${quote(c.reason)}`,
        id: `${c.approverName} menolak ${noun.id} Anda. Alasan: ${quoteId(c.reason)}`,
      },
      cta: { en: "View", id: "Lihat" },
    }),
    email: (c) => ({
      subject: {
        en: `${noun.en} ${c.number} was rejected`,
        id: `${noun.id} ${c.number} ditolak`,
      },
      body: {
        en: `Hi ${c.submitterName}, ${c.approverName} rejected ${noun.en} ${c.number}. Reason: ${quote(c.reason)}`,
        id: `Halo ${c.submitterName}, ${c.approverName} menolak ${noun.id} ${c.number}. Alasan: ${quoteId(c.reason)}`,
      },
      cta: { en: `View ${noun.en}`, id: `Lihat ${noun.id}` },
    }),
  },

  need_revision: {
    recipientRule: "submitter_cc_approvers",
    channels: { inApp: true, email: true },
    todo: {
      type: "revision",
      tag: { en: "Needs revision", id: "Perlu revisi" },
      action: { en: "Edit", id: "Edit" },
    },
    inApp: (c) => ({
      title: {
        en: `${noun.en} ${c.number} needs revision`,
        id: `${noun.id} ${c.number} memerlukan revisi`,
      },
      body: {
        en: `${c.approverName} requested changes. Note: ${quote(c.note)}`,
        id: `${c.approverName} meminta perubahan. Catatan: ${quoteId(c.note)}`,
      },
      cta: { en: "Edit & Resubmit", id: "Edit & Kirim Ulang" },
    }),
    email: (c) => ({
      subject: {
        en: `${noun.en} ${c.number} needs revision`,
        id: `${noun.id} ${c.number} memerlukan revisi`,
      },
      body: {
        en: `Hi ${c.submitterName}, ${c.approverName} requested changes to ${c.number}. Revision note: ${quote(c.note)}. Please revise and resubmit.`,
        id: `Halo ${c.submitterName}, ${c.approverName} meminta perubahan pada ${c.number}. Catatan revisi: ${quoteId(c.note)}. Mohon revisi dan kirim ulang.`,
      },
      cta: { en: "Edit & Resubmit", id: "Edit & Kirim Ulang" },
    }),
  },
});

// Customer-portal approval lifecycle (any-one-wins). Recipient = entity PIC
// (the person who sent the Customer Portal). No CC.
const makeCustomerLifecycle = (noun) => ({
  customer_approved: {
    recipientRule: "entity_pic",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Customer approved ${noun.en} ${c.number}`,
        id: `Customer menyetujui ${noun.id} ${c.number}`,
      },
      body: {
        en: `${c.customerPicName} from ${c.customerCompany} has approved ${noun.en} ${c.number}. It is now Approved.`,
        id: `${c.customerPicName} dari ${c.customerCompany} telah menyetujui ${noun.id} ${c.number}. Status sekarang menjadi Approved.`,
      },
      cta: { en: `View ${noun.en}`, id: `Lihat ${noun.id}` },
    }),
    email: (c) => ({
      subject: {
        en: `Customer approved ${noun.en} ${c.number}`,
        id: `Customer menyetujui ${noun.id} ${c.number}`,
      },
      body: {
        en: `Hi ${c.picName}, ${c.customerPicName} from ${c.customerCompany} has approved ${noun.en} ${c.number}. It is now Approved.`,
        id: `Halo ${c.picName}, ${c.customerPicName} dari ${c.customerCompany} telah menyetujui ${noun.id} ${c.number}. Status sekarang Approved.`,
      },
      cta: { en: `View ${noun.en}`, id: `Lihat ${noun.id}` },
    }),
  },
  customer_rejected: {
    recipientRule: "entity_pic",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Customer rejected ${noun.en} ${c.number}`,
        id: `Customer menolak ${noun.id} ${c.number}`,
      },
      body: {
        en: `${c.customerPicName} from ${c.customerCompany} rejected ${noun.en} ${c.number}. Reason: ${quote(c.reason)}`,
        id: `${c.customerPicName} dari ${c.customerCompany} menolak ${noun.id} ${c.number}. Alasan: ${quoteId(c.reason)}`,
      },
      cta: { en: `View ${noun.en}`, id: `Lihat ${noun.id}` },
    }),
    email: (c) => ({
      subject: {
        en: `Customer rejected ${noun.en} ${c.number}`,
        id: `Customer menolak ${noun.id} ${c.number}`,
      },
      body: {
        en: `Hi ${c.picName}, ${c.customerPicName} from ${c.customerCompany} rejected ${noun.en} ${c.number}. Reason: ${quote(c.reason)}`,
        id: `Halo ${c.picName}, ${c.customerPicName} dari ${c.customerCompany} menolak ${noun.id} ${c.number}. Alasan: ${quoteId(c.reason)}`,
      },
      cta: { en: `View ${noun.en}`, id: `Lihat ${noun.id}` },
    }),
  },
  customer_revision: {
    recipientRule: "entity_pic",
    channels: { inApp: true, email: true },
    todo: {
      type: "revision",
      tag: { en: "Needs revision", id: "Perlu revisi" },
      action: { en: "Edit", id: "Edit" },
    },
    inApp: (c) => ({
      title: {
        en: `Customer requested changes on ${noun.en} ${c.number}`,
        id: `Customer meminta perubahan pada ${noun.id} ${c.number}`,
      },
      body: {
        en: `${c.customerPicName} from ${c.customerCompany} requested changes. Note: ${quote(c.note)}`,
        id: `${c.customerPicName} dari ${c.customerCompany} meminta perubahan. Catatan: ${quoteId(c.note)}`,
      },
      cta: { en: "Edit & Resubmit", id: "Edit & Kirim Ulang" },
    }),
    email: (c) => ({
      subject: {
        en: `${noun.en} ${c.number} — customer requested changes`,
        id: `${noun.id} ${c.number} — customer meminta perubahan`,
      },
      body: {
        en: `Hi ${c.picName}, ${c.customerPicName} from ${c.customerCompany} requested changes to ${noun.en} ${c.number}. Note: ${quote(c.note)}. Please revise and resubmit.`,
        id: `Halo ${c.picName}, ${c.customerPicName} dari ${c.customerCompany} meminta perubahan pada ${noun.id} ${c.number}. Catatan: ${quoteId(c.note)}. Mohon revisi dan kirim ulang.`,
      },
      cta: { en: "Edit & Resubmit", id: "Edit & Kirim Ulang" },
    }),
  },
});

const NOUNS = {
  rfq: { en: "RFQ", id: "RFQ" },
  quote: { en: "Quote", id: "Quote" },
  order: { en: "Order", id: "Order" },
  purchase_order: { en: "Purchase Order", id: "Purchase Order" },
  custom_product_request: { en: "Custom Product Request", id: "Custom Product Request" },
  invoice: { en: "Invoice", id: "Invoice" },
};

export const NOTIFICATION_CATALOG = {
  rfq: makeApprovalLifecycle(NOUNS.rfq, { en: "Approved", id: "Approved" }),
  quote: {
    ...makeApprovalLifecycle(NOUNS.quote, { en: "Issued", id: "Issued" }),
    ...makeCustomerLifecycle(NOUNS.quote),
  },
  order: makeApprovalLifecycle(NOUNS.order, { en: "Confirmed", id: "Confirmed" }),
  purchase_order: {
    ...makeApprovalLifecycle(NOUNS.purchase_order, { en: "Issued", id: "Issued" }),
    // Cross-module: on PO issued, also notify the linked Work Order creator.
    // Wording follows the Work Order "Outsource Purchase Order Issued" catalog
    // entry (PRD §6.4) since this is the same notification fired from the PO
    // approval flow for the linked Work Order's creator.
    wo_cross_module: {
      recipientRule: "wo_creator",
      channels: { inApp: true, email: true },
      todo: null,
      inApp: (c) => ({
        title: {
          en: `Purchase Order ${c.number} for Work Order ${c.workOrderNo} has been issued`,
          id: `Purchase Order ${c.number} untuk Work Order ${c.workOrderNo} telah diterbitkan`,
        },
        body: {
          en: `The Purchase Order for outsourced Work Order ${c.workOrderNo} has been issued to ${c.vendorName || "the vendor"}.`,
          id: `Purchase Order untuk Work Order outsource ${c.workOrderNo} telah diterbitkan kepada ${c.vendorName || "vendor"}.`,
        },
        cta: { en: "See Detail", id: "Lihat Detail" },
      }),
      email: (c) => ({
        subject: {
          en: `Purchase Order ${c.number} for Work Order ${c.workOrderNo} has been issued`,
          id: `Purchase Order ${c.number} untuk Work Order ${c.workOrderNo} telah diterbitkan`,
        },
        body: {
          en: `The Purchase Order for outsourced Work Order ${c.workOrderNo} has been issued to ${c.vendorName || "the vendor"}.`,
          id: `Purchase Order untuk Work Order outsource ${c.workOrderNo} telah diterbitkan kepada ${c.vendorName || "vendor"}.`,
        },
        cta: { en: "See Detail", id: "Lihat Detail" },
      }),
    },
  },
  custom_product_request: makeApprovalLifecycle(NOUNS.custom_product_request, {
    en: "Completed",
    id: "Completed",
  }),

  invoice: {
    ...makeCustomerLifecycle(NOUNS.invoice),
    // Payment proof — portal upload notifies the invoice owner (PIC).
    proof_uploaded: {
      recipientRule: "entity_pic",
      channels: { inApp: true, email: true },
      todo: {
        type: "proof",
        tag: { en: "Review proof", id: "Tinjau bukti" },
        action: { en: "Review", id: "Tinjau" },
      },
      inApp: (c) => ({
        title: {
          en: `Payment proof uploaded — Invoice ${c.number}`,
          id: `Bukti pembayaran telah diunggah — Invoice ${c.number}`,
        },
        body: {
          en: `${c.customerPicName} from ${c.customerCompany} uploaded a payment proof. Please review and confirm.`,
          id: `${c.customerPicName} dari ${c.customerCompany} telah mengunggah bukti pembayaran. Mohon tinjau dan konfirmasi.`,
        },
        cta: { en: "Review Proof", id: "Tinjau Bukti" },
      }),
      email: (c) => ({
        subject: {
          en: `Payment proof uploaded — Invoice ${c.number}`,
          id: `Bukti pembayaran telah diunggah — Invoice ${c.number}`,
        },
        body: {
          en: `Hi ${c.picName}, ${c.customerPicName} from ${c.customerCompany} uploaded a payment proof for Invoice ${c.number}. Please review.`,
          id: `Halo ${c.picName}, ${c.customerPicName} dari ${c.customerCompany} mengunggah bukti pembayaran untuk Invoice ${c.number}. Mohon tinjau.`,
        },
        cta: { en: "Review Proof", id: "Tinjau Bukti" },
      }),
    },
    // Admin rejects proof — email only to the customer, reason mandatory.
    proof_rejected: {
      recipientRule: "customer_email",
      channels: { inApp: false, email: true },
      todo: null,
      inApp: null,
      email: (c) => ({
        subject: {
          en: `Action required — re-upload payment proof for Invoice ${c.number}`,
          id: `Perlu tindakan — unggah ulang bukti pembayaran untuk Invoice ${c.number}`,
        },
        body: {
          en: `Hi ${c.customerPicName || "Customer"}, your payment proof for Invoice ${c.number} could not be verified. Reason: ${quote(c.reason)}. Please log in to the portal and re-upload.`,
          id: `Halo ${c.customerPicName || "Customer"}, bukti pembayaran Anda untuk Invoice ${c.number} tidak dapat diverifikasi. Alasan: ${quoteId(c.reason)}. Mohon masuk ke portal dan unggah ulang.`,
        },
        cta: { en: "Re-upload Payment Proof", id: "Unggah Ulang Bukti Pembayaran" },
      }),
    },
  },

  material_request: {
    transfer_started: {
      recipientRule: "requester",
      channels: { inApp: true, email: true },
      todo: {
        type: "receipt",
        tag: { en: "Confirm receipt", id: "Konfirmasi penerimaan" },
        action: { en: "Confirm", id: "Konfirmasi" },
      },
      inApp: (c) => ({
        title: {
          en: `Materials transferred — confirm receipt for ${c.requestId}`,
          id: `Material telah ditransfer — konfirmasi penerimaan untuk ${c.requestId}`,
        },
        body: {
          en: `${c.preparerName} has transferred materials for your request from ${c.workOrderNo}. Please confirm you have received the items.`,
          id: `${c.preparerName} telah mentransfer material untuk permintaan Anda dari ${c.workOrderNo}. Mohon konfirmasi bahwa Anda telah menerima barang tersebut.`,
        },
        cta: { en: "Confirm Receipt", id: "Konfirmasi Penerimaan" },
      }),
      email: (c) => ({
        subject: {
          en: `Materials transferred — confirm receipt for ${c.requestId}`,
          id: `Material telah ditransfer — konfirmasi penerimaan untuk ${c.requestId}`,
        },
        body: {
          en: `Hi ${c.requesterName}, ${c.preparerName} has transferred materials for ${c.requestId} from ${c.workOrderNo}. Please confirm receipt in Labamu.`,
          id: `Halo ${c.requesterName}, ${c.preparerName} telah mentransfer material untuk ${c.requestId} dari ${c.workOrderNo}. Mohon konfirmasi penerimaan di Labamu.`,
        },
        cta: { en: "Confirm Receipt", id: "Konfirmasi Penerimaan" },
      }),
    },
    receipt_confirmed: {
      recipientRule: "preparer",
      channels: { inApp: true, email: true },
      todo: null,
      inApp: (c) => ({
        title: {
          en: `Receipt confirmed — ${c.requestId} completed`,
          id: `Penerimaan dikonfirmasi — ${c.requestId} selesai`,
        },
        body: {
          en: `${c.requesterName} has confirmed receipt of materials. Request is now Completed.`,
          id: `${c.requesterName} telah mengonfirmasi penerimaan material. Permintaan sekarang berstatus Completed.`,
        },
        cta: { en: "View Request", id: "Lihat Permintaan" },
      }),
      email: (c) => ({
        subject: {
          en: `Material Request ${c.requestId} receipt confirmed`,
          id: `Penerimaan Material Request ${c.requestId} dikonfirmasi`,
        },
        body: {
          en: `Hi ${c.preparerName}, ${c.requesterName} confirmed receipt of materials for ${c.requestId}. The request is now Completed.`,
          id: `Halo ${c.preparerName}, ${c.requesterName} mengonfirmasi penerimaan material untuk ${c.requestId}. Permintaan sekarang berstatus Completed.`,
        },
        cta: { en: "View Request", id: "Lihat Permintaan" },
      }),
    },
    receipt_rejected: {
      recipientRule: "preparer",
      channels: { inApp: true, email: true },
      todo: null,
      inApp: (c) => ({
        title: {
          en: `Receipt rejected — ${c.requestId}`,
          id: `Penerimaan ditolak — ${c.requestId}`,
        },
        body: {
          en: `${c.requesterName} rejected the transferred materials. Reason: ${quote(c.reason)}`,
          id: `${c.requesterName} menolak material yang telah ditransfer. Alasan: ${quoteId(c.reason)}`,
        },
        cta: { en: "View Request", id: "Lihat Permintaan" },
      }),
      email: (c) => ({
        subject: {
          en: `Receipt rejected — ${c.requestId}`,
          id: `Penerimaan ditolak — ${c.requestId}`,
        },
        body: {
          en: `Hi ${c.preparerName}, ${c.requesterName} rejected the transferred materials for ${c.requestId}. Reason: ${quote(c.reason)}. The request has been closed.`,
          id: `Halo ${c.preparerName}, ${c.requesterName} menolak material yang ditransfer untuk ${c.requestId}. Alasan: ${quoteId(c.reason)}. Permintaan telah ditutup.`,
        },
        cta: { en: "View Request", id: "Lihat Permintaan" },
      }),
    },
    cancelled_by_preparer: {
      recipientRule: "requester",
      channels: { inApp: true, email: true },
      todo: null,
      inApp: (c) => ({
        title: {
          en: `Material request ${c.requestId} cancelled`,
          id: `Permintaan material ${c.requestId} dibatalkan`,
        },
        body: {
          en: `${c.preparerName} has cancelled your material request.`,
          id: `${c.preparerName} telah membatalkan permintaan material Anda.`,
        },
        cta: { en: "View Request", id: "Lihat Permintaan" },
      }),
      email: (c) => ({
        subject: {
          en: `Material Request ${c.requestId} has been cancelled`,
          id: `Material Request ${c.requestId} telah dibatalkan`,
        },
        body: {
          en: `Hi ${c.requesterName}, ${c.preparerName} has cancelled your material request ${c.requestId}. The request has been closed.`,
          id: `Halo ${c.requesterName}, ${c.preparerName} telah membatalkan permintaan material Anda ${c.requestId}. Permintaan telah ditutup.`,
        },
        cta: { en: "View Request", id: "Lihat Permintaan" },
      }),
    },
  },
};

// ---------------------------------------------------------------------------
// Operational notifications (PRD "Expansion & Preferences") — deadlines,
// stock/expiry thresholds, status transitions, new-record pings, and payment
// events. None of these create a Todo item (per PRD §4.5): they are bell
// and/or email only. Recipients broadcast to "eligible_users" (defaults to
// the current user in this demo).
// ---------------------------------------------------------------------------

NOTIFICATION_CATALOG.inventory = {
  material_running_low: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Material ${c.materialName} is running low`,
        id: `Stok Material ${c.materialName} menipis`,
      },
      body: {
        en: `Available stock is ${c.qty} ${c.uom}, at or below the minimum level.`,
        id: `Stok tersedia adalah ${c.qty} ${c.uom}, sama dengan atau di bawah batas minimum.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Material ${c.materialName} is running low`,
        id: `Stok Material ${c.materialName} menipis`,
      },
      body: {
        en: `Available stock is ${c.qty} ${c.uom}, at or below the minimum level.`,
        id: `Stok tersedia adalah ${c.qty} ${c.uom}, sama dengan atau di bawah batas minimum.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
  material_out_of_stock: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Material ${c.materialName} is out of stock`,
        id: `Material ${c.materialName} habis`,
      },
      body: {
        en: `Available stock has reached 0 ${c.uom}.`,
        id: `Stok tersedia telah mencapai 0 ${c.uom}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Material ${c.materialName} is out of stock`,
        id: `Material ${c.materialName} habis`,
      },
      body: {
        en: `Material ${c.materialName} has reached zero available stock. Please review the material and replenishment plan.`,
        id: `Material ${c.materialName} telah mencapai stok 0. Mohon tinjau material dan rencana pengisian ulang.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
  material_expiring_soon: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Batch ${c.batchNumber} is expiring soon`,
        id: `Batch ${c.batchNumber} akan segera kedaluwarsa`,
      },
      body: {
        en: `Batch ${c.batchNumber} for ${c.materialName} will expire on ${c.expiryDate}.`,
        id: `Batch ${c.batchNumber} untuk ${c.materialName} akan kedaluwarsa pada ${c.expiryDate}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Batch ${c.batchNumber} is expiring soon`,
        id: `Batch ${c.batchNumber} akan segera kedaluwarsa`,
      },
      body: {
        en: `Batch ${c.batchNumber} for ${c.materialName} will expire on ${c.expiryDate}.`,
        id: `Batch ${c.batchNumber} untuk ${c.materialName} akan kedaluwarsa pada ${c.expiryDate}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
  material_expired: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Batch ${c.batchNumber} has expired`,
        id: `Batch ${c.batchNumber} telah kedaluwarsa`,
      },
      body: {
        en: `Batch ${c.batchNumber} for ${c.materialName} expired on ${c.expiryDate}.`,
        id: `Batch ${c.batchNumber} untuk ${c.materialName} kedaluwarsa pada ${c.expiryDate}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Batch ${c.batchNumber} has expired`,
        id: `Batch ${c.batchNumber} telah kedaluwarsa`,
      },
      body: {
        en: `Batch ${c.batchNumber} for ${c.materialName} expired on ${c.expiryDate}. Please review the remaining quantity and take the required action.`,
        id: `Batch ${c.batchNumber} untuk ${c.materialName} kedaluwarsa pada ${c.expiryDate}. Mohon tinjau sisa jumlah dan ambil tindakan yang diperlukan.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
};

NOTIFICATION_CATALOG.material_request.new_material_request = {
  recipientRule: "eligible_users",
  channels: { inApp: true, email: true },
  todo: null,
  inApp: (c) => ({
    title: {
      en: `New Material Request ${c.number}`,
      id: `Material Request baru ${c.number}`,
    },
    body: {
      en: `${c.requesterName} created a new Material Request for ${c.workOrderNo}.`,
      id: `${c.requesterName} membuat Material Request baru untuk ${c.workOrderNo}.`,
    },
    cta: { en: "See Detail", id: "Lihat Detail" },
  }),
  email: (c) => ({
    subject: {
      en: `New Material Request ${c.number}`,
      id: `Material Request baru ${c.number}`,
    },
    body: {
      en: `${c.requesterName} created a new Material Request for ${c.workOrderNo}.`,
      id: `${c.requesterName} membuat Material Request baru untuk ${c.workOrderNo}.`,
    },
    cta: { en: "See Detail", id: "Lihat Detail" },
  }),
};

NOTIFICATION_CATALOG.custom_product_request.new_request = {
  recipientRule: "eligible_users",
  channels: { inApp: true, email: true },
  todo: null,
  inApp: (c) => ({
    title: {
      en: `New Custom Product Request ${c.number}`,
      id: `Custom Product Request baru ${c.number}`,
    },
    body: {
      en: `Created by ${c.requesterName} for ${c.customerCompany}.`,
      id: `Dibuat oleh ${c.requesterName} untuk ${c.customerCompany}.`,
    },
    cta: { en: "See Detail", id: "Lihat Detail" },
  }),
  email: (c) => ({
    subject: {
      en: `New Custom Product Request ${c.number}`,
      id: `Custom Product Request baru ${c.number}`,
    },
    body: {
      en: `Created by ${c.requesterName} for ${c.customerCompany}.`,
      id: `Dibuat oleh ${c.requesterName} untuk ${c.customerCompany}.`,
    },
    cta: { en: "See Detail", id: "Lihat Detail" },
  }),
};

NOTIFICATION_CATALOG.quote.valid_until_reminder = {
  recipientRule: "eligible_users",
  channels: { inApp: true, email: true },
  todo: null,
  inApp: (c) => ({
    title: {
      en: `Quote ${c.number} is approaching its validity date`,
      id: `Quote ${c.number} mendekati tanggal berakhir`,
    },
    body: {
      en: `The Quote is valid until ${c.validUntilDate}.`,
      id: `Quote berlaku sampai ${c.validUntilDate}.`,
    },
    cta: { en: "See Detail", id: "Lihat Detail" },
  }),
  email: (c) => ({
    subject: {
      en: `Quote ${c.number} is approaching its validity date`,
      id: `Quote ${c.number} mendekati tanggal berakhir`,
    },
    body: {
      en: `Quote ${c.number} is valid until ${c.validUntilDate}. Please review and follow up before it expires.`,
      id: `Quote ${c.number} berlaku sampai ${c.validUntilDate}. Mohon tinjau dan tindak lanjuti sebelum berakhir.`,
    },
    cta: { en: "See Detail", id: "Lihat Detail" },
  }),
};

NOTIFICATION_CATALOG.work_order = {
  deadline_approaching: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Work Order ${c.number} is approaching its deadline`,
        id: `Work Order ${c.number} mendekati batas waktu`,
      },
      body: {
        en: `The deadline is ${c.deadlineDate}. Current status: ${c.status}.`,
        id: `Batas waktunya adalah ${c.deadlineDate}. Status saat ini: ${c.status}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Work Order ${c.number} is approaching its deadline`,
        id: `Work Order ${c.number} mendekati batas waktu`,
      },
      body: {
        en: `Work Order ${c.number} is approaching its deadline on ${c.deadlineDate}. Current status: ${c.status}.`,
        id: `Work Order ${c.number} mendekati batas waktu pada ${c.deadlineDate}. Status saat ini: ${c.status}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
  changed_to_completed: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Work Order ${c.number} has been completed`,
        id: `Work Order ${c.number} telah selesai`,
      },
      body: {
        en: `The Work Order status changed to Completed.`,
        id: `Status Work Order berubah menjadi Completed.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Work Order ${c.number} has been completed`,
        id: `Work Order ${c.number} telah selesai`,
      },
      body: {
        en: `The Work Order status changed to Completed.`,
        id: `Status Work Order berubah menjadi Completed.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
  changed_to_cancelled: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Work Order ${c.number} was cancelled`,
        id: `Work Order ${c.number} dibatalkan`,
      },
      body: {
        en: `The Work Order status changed to Cancelled by ${c.updatedBy}.`,
        id: `Status Work Order berubah menjadi Cancelled oleh ${c.updatedBy}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Work Order ${c.number} was cancelled`,
        id: `Work Order ${c.number} dibatalkan`,
      },
      body: {
        en: `The Work Order status changed to Cancelled by ${c.updatedBy}.`,
        id: `Status Work Order berubah menjadi Cancelled oleh ${c.updatedBy}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
  new_work_order: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `New Work Order ${c.number}`,
        id: `Work Order baru ${c.number}`,
      },
      body: {
        en: `A new Work Order was created for ${c.productOrOrder} and is currently Not Started.`,
        id: `Work Order baru dibuat untuk ${c.productOrOrder} dan saat ini berstatus Not Started.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `New Work Order ${c.number}`,
        id: `Work Order baru ${c.number}`,
      },
      body: {
        en: `A new Work Order was created for ${c.productOrOrder} and is currently Not Started.`,
        id: `Work Order baru dibuat untuk ${c.productOrOrder} dan saat ini berstatus Not Started.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
  outsource_po_issued: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Purchase Order ${c.poNumber} for Work Order ${c.number} has been issued`,
        id: `Purchase Order ${c.poNumber} untuk Work Order ${c.number} telah diterbitkan`,
      },
      body: {
        en: `The Purchase Order for outsourced Work Order ${c.number} has been issued to ${c.vendorName}.`,
        id: `Purchase Order untuk Work Order outsource ${c.number} telah diterbitkan kepada ${c.vendorName}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Purchase Order ${c.poNumber} for Work Order ${c.number} has been issued`,
        id: `Purchase Order ${c.poNumber} untuk Work Order ${c.number} telah diterbitkan`,
      },
      body: {
        en: `The Purchase Order for outsourced Work Order ${c.number} has been issued to ${c.vendorName}.`,
        id: `Purchase Order untuk Work Order outsource ${c.number} telah diterbitkan kepada ${c.vendorName}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
  outsource_po_receipt_recorded: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Receipt recorded for Work Order ${c.number}`,
        id: `Penerimaan dicatat untuk Work Order ${c.number}`,
      },
      body: {
        en: `${c.receivedQty} was received under Purchase Order ${c.poNumber}. Total received for this Work Order: ${c.cumulativeQty} of ${c.orderedQty}.`,
        id: `${c.receivedQty} diterima melalui Purchase Order ${c.poNumber}. Total diterima untuk Work Order ini: ${c.cumulativeQty} dari ${c.orderedQty}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Receipt recorded for Work Order ${c.number}`,
        id: `Penerimaan dicatat untuk Work Order ${c.number}`,
      },
      body: {
        en: `${c.receivedQty} was received under Purchase Order ${c.poNumber}. Total received: ${c.cumulativeQty} of ${c.orderedQty}.`,
        id: `${c.receivedQty} diterima melalui Purchase Order ${c.poNumber}. Total diterima: ${c.cumulativeQty} dari ${c.orderedQty}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
  outsource_po_fully_received: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Work Order ${c.number} has been fully received`,
        id: `Work Order ${c.number} telah diterima seluruhnya`,
      },
      body: {
        en: `All outsourced items for Work Order ${c.number} under Purchase Order ${c.poNumber} have been received.`,
        id: `Seluruh item outsource untuk Work Order ${c.number} melalui Purchase Order ${c.poNumber} telah diterima.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Work Order ${c.number} has been fully received`,
        id: `Work Order ${c.number} telah diterima seluruhnya`,
      },
      body: {
        en: `All outsourced items for Work Order ${c.number} under Purchase Order ${c.poNumber} have been received.`,
        id: `Seluruh item outsource untuk Work Order ${c.number} melalui Purchase Order ${c.poNumber} telah diterima.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
};

Object.assign(NOTIFICATION_CATALOG.order, {
  deadline_approaching: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Order ${c.number} is approaching its deadline`,
        id: `Order ${c.number} mendekati batas waktu`,
      },
      body: {
        en: `The deadline is ${c.deadlineDate}. Current status: ${c.status}.`,
        id: `Batas waktunya adalah ${c.deadlineDate}. Status saat ini: ${c.status}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Order ${c.number} is approaching its deadline`,
        id: `Order ${c.number} mendekati batas waktu`,
      },
      body: {
        en: `Order ${c.number} is approaching its deadline on ${c.deadlineDate}. Current status: ${c.status}.`,
        id: `Order ${c.number} mendekati batas waktu pada ${c.deadlineDate}. Status saat ini: ${c.status}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
  deadline_overdue: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Order ${c.number} is overdue`,
        id: `Order ${c.number} terlambat`,
      },
      body: {
        en: `The deadline was ${c.deadlineDate}. Current status: ${c.status}.`,
        id: `Batas waktunya adalah ${c.deadlineDate}. Status saat ini: ${c.status}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Order ${c.number} is overdue`,
        id: `Order ${c.number} terlambat`,
      },
      body: {
        en: `Order ${c.number} passed its deadline on ${c.deadlineDate} and remains ${c.status}.`,
        id: `Order ${c.number} melewati batas waktu pada ${c.deadlineDate} dan tetap berstatus ${c.status}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
  changed_to_completed: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Order ${c.number} has been completed`,
        id: `Order ${c.number} telah selesai`,
      },
      body: {
        en: `The Order status changed to Completed.`,
        id: `Status Order berubah menjadi Completed.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Order ${c.number} has been completed`,
        id: `Order ${c.number} telah selesai`,
      },
      body: {
        en: `The Order status changed to Completed.`,
        id: `Status Order berubah menjadi Completed.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
  changed_to_cancelled: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Order ${c.number} was cancelled`,
        id: `Order ${c.number} dibatalkan`,
      },
      body: {
        en: `The Order status changed to Cancelled by ${c.updatedBy}.`,
        id: `Status Order berubah menjadi Cancelled oleh ${c.updatedBy}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Order ${c.number} was cancelled`,
        id: `Order ${c.number} dibatalkan`,
      },
      body: {
        en: `The Order status changed to Cancelled by ${c.updatedBy}.`,
        id: `Status Order berubah menjadi Cancelled oleh ${c.updatedBy}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
  new_order: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `New Order ${c.number}`,
        id: `Order baru ${c.number}`,
      },
      body: {
        en: `A new Order was created for ${c.customerCompany} and is currently Not Started.`,
        id: `Order baru dibuat untuk ${c.customerCompany} dan saat ini berstatus Not Started.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `New Order ${c.number}`,
        id: `Order baru ${c.number}`,
      },
      body: {
        en: `A new Order was created for ${c.customerCompany} and is currently Not Started.`,
        id: `Order baru dibuat untuk ${c.customerCompany} dan saat ini berstatus Not Started.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
  invoice_paid: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Invoice ${c.invoiceNumber} for Order ${c.number} has been paid`,
        id: `Invoice ${c.invoiceNumber} untuk Order ${c.number} telah dibayar`,
      },
      body: {
        en: `The invoice payment has been completed. Paid amount: ${c.paidAmount}.`,
        id: `Pembayaran invoice telah selesai. Jumlah dibayar: ${c.paidAmount}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Invoice ${c.invoiceNumber} for Order ${c.number} has been paid`,
        id: `Invoice ${c.invoiceNumber} untuk Order ${c.number} telah dibayar`,
      },
      body: {
        en: `Invoice ${c.invoiceNumber} linked to Order ${c.number} has been paid. Paid amount: ${c.paidAmount}.`,
        id: `Invoice ${c.invoiceNumber} yang terkait dengan Order ${c.number} telah dibayar. Jumlah dibayar: ${c.paidAmount}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
});

Object.assign(NOTIFICATION_CATALOG.invoice, {
  due_date_approaching: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Invoice ${c.number} is approaching its due date`,
        id: `Invoice ${c.number} mendekati tanggal jatuh tempo`,
      },
      body: {
        en: `The due date is ${c.dueDate}. Outstanding amount: ${c.amount} ${c.currency}.`,
        id: `Tanggal jatuh tempo adalah ${c.dueDate}. Sisa tagihan: ${c.amount} ${c.currency}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Invoice ${c.number} is approaching its due date`,
        id: `Invoice ${c.number} mendekati tanggal jatuh tempo`,
      },
      body: {
        en: `Invoice ${c.number} is approaching its due date on ${c.dueDate}. Outstanding amount: ${c.amount} ${c.currency}.`,
        id: `Invoice ${c.number} mendekati tanggal jatuh tempo pada ${c.dueDate}. Sisa tagihan: ${c.amount} ${c.currency}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
  overdue: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Invoice ${c.number} is overdue`,
        id: `Invoice ${c.number} terlambat`,
      },
      body: {
        en: `The invoice was due on ${c.dueDate}. Outstanding amount: ${c.amount} ${c.currency}.`,
        id: `Invoice jatuh tempo pada ${c.dueDate}. Sisa tagihan: ${c.amount} ${c.currency}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Invoice ${c.number} is overdue`,
        id: `Invoice ${c.number} terlambat`,
      },
      body: {
        en: `Invoice ${c.number} passed its due date on ${c.dueDate}. Outstanding amount: ${c.amount} ${c.currency}.`,
        id: `Invoice ${c.number} melewati tanggal jatuh tempo pada ${c.dueDate}. Sisa tagihan: ${c.amount} ${c.currency}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
});

Object.assign(NOTIFICATION_CATALOG.purchase_order, {
  payment_overdue: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Payment for Purchase Order ${c.number} is overdue`,
        id: `Pembayaran Purchase Order ${c.number} terlambat`,
      },
      body: {
        en: `The payment due date was ${c.dueDate}. Outstanding amount: ${c.amount} ${c.currency}.`,
        id: `Tanggal jatuh tempo pembayaran adalah ${c.dueDate}. Sisa pembayaran: ${c.amount} ${c.currency}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Payment for Purchase Order ${c.number} is overdue`,
        id: `Pembayaran Purchase Order ${c.number} terlambat`,
      },
      body: {
        en: `Payment for Purchase Order ${c.number} passed its due date on ${c.dueDate}. Outstanding amount: ${c.amount} ${c.currency}.`,
        id: `Pembayaran Purchase Order ${c.number} melewati tanggal jatuh tempo pada ${c.dueDate}. Sisa pembayaran: ${c.amount} ${c.currency}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
  expected_end_date_approaching: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Purchase Order ${c.number} is approaching its expected end date`,
        id: `Purchase Order ${c.number} mendekati tanggal selesai yang diperkirakan`,
      },
      body: {
        en: `The expected end date is ${c.expectedEndDate}. Current status: ${c.status}.`,
        id: `Tanggal selesai yang diperkirakan adalah ${c.expectedEndDate}. Status saat ini: ${c.status}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Purchase Order ${c.number} is approaching its expected end date`,
        id: `Purchase Order ${c.number} mendekati tanggal selesai yang diperkirakan`,
      },
      body: {
        en: `Purchase Order ${c.number} is approaching its expected end date on ${c.expectedEndDate}. Current status: ${c.status}.`,
        id: `Purchase Order ${c.number} mendekati tanggal selesai yang diperkirakan pada ${c.expectedEndDate}. Status saat ini: ${c.status}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
  expected_end_date_overdue: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Purchase Order ${c.number} is overdue against its expected end date`,
        id: `Purchase Order ${c.number} melewati tanggal selesai yang diharapkan`,
      },
      body: {
        en: `The expected end date was ${c.expectedEndDate}. Current status: ${c.status}.`,
        id: `Tanggal selesai yang diharapkan adalah ${c.expectedEndDate}. Status saat ini: ${c.status}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
    email: (c) => ({
      subject: {
        en: `Purchase Order ${c.number} is overdue`,
        id: `Purchase Order ${c.number} terlambat`,
      },
      body: {
        en: `Purchase Order ${c.number} passed its expected end date on ${c.expectedEndDate} and remains ${c.status}.`,
        id: `Purchase Order ${c.number} melewati tanggal selesai yang diharapkan pada ${c.expectedEndDate} dan tetap berstatus ${c.status}.`,
      },
      cta: { en: "See Detail", id: "Lihat Detail" },
    }),
  },
});

NOTIFICATION_CATALOG.product_catalog = {
  bulk_upload_completed: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Bulk upload finished — ${c.fileName}`,
        id: `Bulk upload selesai — ${c.fileName}`,
      },
      body: {
        en: `${c.fileName} finished processing — ${c.productCount} product${c.productCount === 1 ? "" : "s"} added to your catalog.`,
        id: `${c.fileName} selesai diproses — ${c.productCount} produk ditambahkan ke katalog Anda.`,
      },
      cta: { en: "View Upload", id: "Lihat Upload" },
    }),
    email: (c) => ({
      subject: {
        en: `Bulk upload finished — ${c.fileName}`,
        id: `Bulk upload selesai — ${c.fileName}`,
      },
      body: {
        en: `Hi ${c.requesterName}, ${c.fileName} finished processing — ${c.productCount} product${c.productCount === 1 ? "" : "s"} added to your catalog.`,
        id: `Halo ${c.requesterName}, ${c.fileName} selesai diproses — ${c.productCount} produk ditambahkan ke katalog Anda.`,
      },
      cta: { en: "View Upload", id: "Lihat Upload" },
    }),
  },
  bulk_upload_mapping_ready: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Mapping finished — ${c.fileName}`,
        id: `Mapping selesai — ${c.fileName}`,
      },
      body: {
        en: `${c.fileName} finished mapping and is ready for review.`,
        id: `${c.fileName} selesai dipetakan dan siap untuk ditinjau.`,
      },
      cta: { en: "Review", id: "Tinjau" },
    }),
    email: (c) => ({
      subject: {
        en: `Mapping finished — ${c.fileName}`,
        id: `Mapping selesai — ${c.fileName}`,
      },
      body: {
        en: `Hi ${c.requesterName}, ${c.fileName} finished mapping and is ready for review.`,
        id: `Halo ${c.requesterName}, ${c.fileName} selesai dipetakan dan siap untuk ditinjau.`,
      },
      cta: { en: "Review", id: "Tinjau" },
    }),
  },
  bulk_upload_cancelled: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Bulk upload cancelled — ${c.fileName}`,
        id: `Bulk upload dibatalkan — ${c.fileName}`,
      },
      body: {
        en: `${c.fileName} was cancelled before it finished processing.`,
        id: `${c.fileName} dibatalkan sebelum selesai diproses.`,
      },
      cta: { en: "View Upload", id: "Lihat Upload" },
    }),
    email: (c) => ({
      subject: {
        en: `Bulk upload cancelled — ${c.fileName}`,
        id: `Bulk upload dibatalkan — ${c.fileName}`,
      },
      body: {
        en: `Hi ${c.requesterName}, ${c.fileName} was cancelled before it finished processing.`,
        id: `Halo ${c.requesterName}, ${c.fileName} dibatalkan sebelum selesai diproses.`,
      },
      cta: { en: "View Upload", id: "Lihat Upload" },
    }),
  },
};

// Materials' Bulk Upload notifications mirror product_catalog's exactly
// (same trigger keys, consumed by MaterialUploadNotifier.jsx), just scoped
// to "material(s)" instead of "product(s)" and materialCount instead of
// productCount.
NOTIFICATION_CATALOG.material_bulk_upload = {
  bulk_upload_completed: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Bulk upload finished — ${c.fileName}`,
        id: `Bulk upload selesai — ${c.fileName}`,
      },
      body: {
        en: `${c.fileName} finished processing — ${c.materialCount} material${c.materialCount === 1 ? "" : "s"} added to your catalog.`,
        id: `${c.fileName} selesai diproses — ${c.materialCount} material ditambahkan ke katalog Anda.`,
      },
      cta: { en: "View Upload", id: "Lihat Upload" },
    }),
    email: (c) => ({
      subject: {
        en: `Bulk upload finished — ${c.fileName}`,
        id: `Bulk upload selesai — ${c.fileName}`,
      },
      body: {
        en: `Hi ${c.requesterName}, ${c.fileName} finished processing — ${c.materialCount} material${c.materialCount === 1 ? "" : "s"} added to your catalog.`,
        id: `Halo ${c.requesterName}, ${c.fileName} selesai diproses — ${c.materialCount} material ditambahkan ke katalog Anda.`,
      },
      cta: { en: "View Upload", id: "Lihat Upload" },
    }),
  },
  bulk_upload_mapping_ready: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Mapping finished — ${c.fileName}`,
        id: `Mapping selesai — ${c.fileName}`,
      },
      body: {
        en: `${c.fileName} finished mapping and is ready for review.`,
        id: `${c.fileName} selesai dipetakan dan siap untuk ditinjau.`,
      },
      cta: { en: "Review", id: "Tinjau" },
    }),
    email: (c) => ({
      subject: {
        en: `Mapping finished — ${c.fileName}`,
        id: `Mapping selesai — ${c.fileName}`,
      },
      body: {
        en: `Hi ${c.requesterName}, ${c.fileName} finished mapping and is ready for review.`,
        id: `Halo ${c.requesterName}, ${c.fileName} selesai dipetakan dan siap untuk ditinjau.`,
      },
      cta: { en: "Review", id: "Tinjau" },
    }),
  },
  bulk_upload_cancelled: {
    recipientRule: "eligible_users",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Bulk upload cancelled — ${c.fileName}`,
        id: `Bulk upload dibatalkan — ${c.fileName}`,
      },
      body: {
        en: `${c.fileName} was cancelled before it finished processing.`,
        id: `${c.fileName} dibatalkan sebelum selesai diproses.`,
      },
      cta: { en: "View Upload", id: "Lihat Upload" },
    }),
    email: (c) => ({
      subject: {
        en: `Bulk upload cancelled — ${c.fileName}`,
        id: `Bulk upload dibatalkan — ${c.fileName}`,
      },
      body: {
        en: `Hi ${c.requesterName}, ${c.fileName} was cancelled before it finished processing.`,
        id: `Halo ${c.requesterName}, ${c.fileName} dibatalkan sebelum selesai diproses.`,
      },
      cta: { en: "View Upload", id: "Lihat Upload" },
    }),
  },
};

export const getCatalogEntry = (moduleKey, triggerKey) =>
  NOTIFICATION_CATALOG[moduleKey]?.[triggerKey] || null;
