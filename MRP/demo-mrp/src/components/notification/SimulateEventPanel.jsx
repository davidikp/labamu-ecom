import React, { useState } from "react";
import { X } from "../icons/Icons.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";

// Preset events grouped by module. Each fires notify(module, trigger, ctx).
// ctx routes "personal" recipients to the current user so they are visible in
// the demo bell/todo. Customer name/company/reason/note are sample values.
const SAMPLE = {
  customerPicName: "Andi Wijaya",
  customerCompany: "PT Global Tech",
  approverName: "Joko",
  reason: "Price exceeds approved budget",
  note: "Please update delivery date and resend",
  workOrderNo: "WO-202606-0001",
  customerEmail: "andi.wijaya@globaltech.com",
};

const GROUPS = [
  {
    title: "RFQ",
    module: "rfq",
    events: [
      { trigger: "submitted", label: "Submitted for approval", entityId: "RFQ-202606-001" },
      { trigger: "one_approved", label: "One approver approved", entityId: "RFQ-202606-001" },
      { trigger: "all_approved", label: "All approved", entityId: "RFQ-202606-001" },
      { trigger: "rejected", label: "Rejected", entityId: "RFQ-202606-001" },
      { trigger: "need_revision", label: "Needs revision", entityId: "RFQ-202606-001" },
    ],
  },
  {
    title: "Quote (internal)",
    module: "quote",
    events: [
      { trigger: "submitted", label: "Submitted for approval", entityId: "QUO-202606-001" },
      { trigger: "all_approved", label: "All approved → Issued", entityId: "QUO-202606-001" },
      { trigger: "need_revision", label: "Needs revision", entityId: "QUO-202606-001" },
    ],
  },
  {
    title: "Quote (customer)",
    module: "quote",
    events: [
      { trigger: "customer_approved", label: "Customer approved", entityId: "QUO-202606-001" },
      { trigger: "customer_rejected", label: "Customer rejected", entityId: "QUO-202606-001" },
      { trigger: "customer_revision", label: "Customer requested changes", entityId: "QUO-202606-001" },
    ],
  },
  {
    title: "Custom Product Request",
    module: "custom_product_request",
    events: [
      { trigger: "submitted", label: "Submitted for approval", entityId: "CPR-202606-001" },
      { trigger: "all_approved", label: "All approved → Completed", entityId: "CPR-202606-001" },
      { trigger: "rejected", label: "Rejected", entityId: "CPR-202606-001" },
    ],
  },
  {
    title: "Invoice (customer)",
    module: "invoice",
    events: [
      { trigger: "customer_approved", label: "Customer approved", entityId: "INV-202606-001" },
      { trigger: "customer_rejected", label: "Customer rejected", entityId: "INV-202606-001" },
      { trigger: "proof_uploaded", label: "Payment proof uploaded", entityId: "INV-202606-001" },
      { trigger: "proof_rejected", label: "Admin rejected proof (email only)", entityId: "INV-202606-001" },
    ],
  },
  {
    title: "Material Request",
    module: "material_request",
    events: [
      { trigger: "transfer_started", label: "Transfer started", entityId: "MR-202606-001" },
      { trigger: "receipt_confirmed", label: "Receipt confirmed", entityId: "MR-202606-001" },
      { trigger: "receipt_rejected", label: "Receipt rejected", entityId: "MR-202606-001" },
      { trigger: "cancelled_by_preparer", label: "Cancelled by preparer", entityId: "MR-202606-001" },
    ],
  },
];

export const SimulateEventPanel = () => {
  const { notify, currentUser, language } = useNotifications();
  const [open, setOpen] = useState(false);
  const [lastFired, setLastFired] = useState("");

  const fire = (module, trigger, entityId) => {
    const ctx = {
      entityId,
      approverName: SAMPLE.approverName,
      reason: SAMPLE.reason,
      note: SAMPLE.note,
      customerPicName: SAMPLE.customerPicName,
      customerCompany: SAMPLE.customerCompany,
      customerEmail: SAMPLE.customerEmail,
      workOrderNo: SAMPLE.workOrderNo,
      // Personal recipients → current user so the demo shows them.
      submitterUser: currentUser,
      picUser: currentUser,
      requesterUser: currentUser,
      preparerUser: currentUser,
      preparerName: "Joko",
      requesterName: currentUser.name,
    };
    const res = notify(module, trigger, ctx);
    const made = res.notifications.length;
    setLastFired(
      made > 0
        ? `Fired ${module}.${trigger} → ${made} in-app${res.email ? " + 1 email" : ""}`
        : `Fired ${module}.${trigger} → email only${res.email ? "" : " (deduped within 60s)"}`
    );
  };

  const L = {
    en: { title: "Simulate Event", hint: "Fire any notification trigger to demo the system.", btn: "Simulate" },
    id: { title: "Simulasi Event", hint: "Picu trigger notifikasi apa pun untuk demo.", btn: "Simulasi" },
  }[language === "id" ? "id" : "en"];

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-no-localize
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9000,
            background: "var(--neutral-on-surface-primary, #1A1D23)",
            color: "#fff",
            border: "none",
            borderRadius: "999px",
            padding: "12px 18px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0px 8px 24px rgba(0,0,0,0.25)",
          }}
        >
          ⚡ {L.btn}
        </button>
      ) : null}

      {open ? (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9001,
            width: "340px",
            maxHeight: "70vh",
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            boxShadow: "0px 16px 40px rgba(0,0,0,0.22)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 18px", borderBottom: "1px solid #F0F1F4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#1A1D23" }}>{L.title}</div>
              <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{L.hint}</div>
            </div>
            <button type="button" onClick={() => setOpen(false)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#6B7280" }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ overflowY: "auto", padding: "8px 0" }}>
            {GROUPS.map((group, gi) => (
              <div key={`${group.title}-${gi}`} style={{ padding: "8px 18px" }}>
                <div data-no-localize style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#9CA3AF", marginBottom: "6px" }}>{group.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {group.events.map((ev) => (
                    <button
                      key={`${group.title}-${ev.trigger}`}
                      type="button"
                      data-no-localize
                      onClick={() => fire(group.module, ev.trigger, ev.entityId)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                      style={{ textAlign: "left", border: "1px solid #E5E7EB", background: "#fff", borderRadius: "8px", padding: "8px 10px", fontSize: "12px", color: "#374151", cursor: "pointer" }}
                    >
                      {ev.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {lastFired ? (
            <div data-no-localize style={{ padding: "10px 18px", borderTop: "1px solid #F0F1F4", fontSize: "11px", color: "#16A34A", background: "#F0FDF4" }}>
              {lastFired}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
};
