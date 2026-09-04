import {
  NOTIFICATION_CATEGORY_OPTIONS,
  NOTIFICATION_DELIVERY_OPTIONS,
} from "./notificationOptions.js";

export { NOTIFICATION_CATEGORY_OPTIONS, NOTIFICATION_DELIVERY_OPTIONS };

export const DEFAULT_NOTIFICATION_SETTINGS = [
  {
    id: "email",
    title: "Email Notifications",
    description:
      "Send structured updates for approvals, task progress, and cross-team handoffs directly to the user's email inbox.",
    items: [
      {
        id: "po_approval_request",
        title: "Purchase Order approval request",
        description:
          "Notify approvers when a new purchase order is waiting for approval.",
        module: "Purchase Order",
        enabled: true,
        delivery: "Instant",
      },
      {
        id: "po_revision_cancel",
        title: "Purchase Order revision and cancellation",
        description:
          "Alert requesters when a purchase order needs revision or is canceled.",
        module: "Purchase Order",
        enabled: true,
        delivery: "Instant",
      },
      {
        id: "receipt_confirmation",
        title: "Receipt confirmation and discrepancy",
        description:
          "Send updates when receipt is confirmed, partially received, or mismatched.",
        module: "Receipt",
        enabled: true,
        delivery: "Suggested",
      },
      {
        id: "wo_ready_process",
        title: "Work Order ready to process",
        description:
          "Notify planners and assignees when planned dates are set and work is ready to begin.",
        module: "Work Order",
        enabled: false,
        delivery: "Suggested",
      },
      {
        id: "rfq_quote_update",
        title: "RFQ and quote status update",
        description:
          "Inform commercial and procurement teams when RFQ, quote, or approval status changes.",
        module: "Sales",
        enabled: true,
        delivery: "Daily Digest",
      },
      {
        id: "daily_digest",
        title: "Daily operational digest",
        description:
          "Summarize approvals, receipts, routing exceptions, and pending work in one digest.",
        module: "Cross Module",
        enabled: true,
        delivery: "Daily Digest",
      },
    ],
  },
  {
    id: "push",
    title: "Push Notifications",
    description:
      "Send actionable alerts to mobile or desktop push so users can respond quickly to approval and execution events.",
    items: [
      {
        id: "pending_approval_task",
        title: "Pending approval task",
        description:
          "Push approvers immediately when a purchase order, material request, or role change needs action.",
        module: "Approvals",
        enabled: true,
        delivery: "Instant",
      },
      {
        id: "routing_delay_blocked",
        title: "Routing delay or blocked stage",
        description:
          "Alert the responsible team when a routing stage is overdue or progress is blocked.",
        module: "Routing Stages",
        enabled: true,
        delivery: "Only High Priority",
      },
      {
        id: "outsource_assignment_update",
        title: "Outsource assignment and vendor update",
        description:
          "Notify owners when vendor assignment, PO linkage, or outsource details change.",
        module: "Outsource Detail",
        enabled: true,
        delivery: "Suggested",
      },
      {
        id: "material_shortage_alert",
        title: "Material shortage and request escalation",
        description:
          "Push urgent stock shortage alerts and approved material request escalations.",
        module: "Material Request",
        enabled: true,
        delivery: "Only Critical",
      },
      {
        id: "quote_response_received",
        title: "Quote response received",
        description:
          "Alert the commercial team when a new quote response or customer feedback arrives.",
        module: "Quotes",
        enabled: false,
        delivery: "Suggested",
      },
    ],
  },
  {
    id: "in_app",
    title: "In-App Notifications",
    description:
      "Show contextual notifications inside the platform so users can follow task status without leaving the workflow.",
    items: [
      {
        id: "status_transition",
        title: "Status transition updates",
        description:
          "Notify when purchase orders, work orders, receipts, and RFQs change status.",
        module: "Cross Module",
        enabled: true,
        delivery: "Suggested",
      },
      {
        id: "comments_mentions",
        title: "Comments and mentions",
        description:
          "Show notifications when a user is mentioned in approval notes, receipt notes, or request discussions.",
        module: "Collaboration",
        enabled: true,
        delivery: "Instant",
      },
      {
        id: "document_uploaded",
        title: "Document upload and replacement",
        description:
          "Notify users when invoices, packing lists, delivery notes, or proof documents are added or replaced.",
        module: "Documents",
        enabled: true,
        delivery: "Suggested",
      },
      {
        id: "assignment_changes",
        title: "Assignment and responsibility changes",
        description:
          "Show updates when a user is assigned to a group, role, purchase order, or work order responsibility.",
        module: "Administration",
        enabled: true,
        delivery: "Instant",
      },
      {
        id: "system_announcements",
        title: "System announcements and release notes",
        description:
          "Highlight platform maintenance, new features, and important admin notices.",
        module: "System",
        enabled: true,
        delivery: "Only High Priority",
      },
    ],
  },
  {
    id: "realtime",
    title: "Real-Time Notifications",
    description:
      "Control live notification behavior for browser toasts, sounds, task badges, and urgent alerts while users are online.",
    items: [
      {
        id: "browser_toast",
        title: "Desktop toast notifications",
        description:
          "Show browser toast alerts for approvals, receipt confirmations, and urgent exceptions.",
        module: "Real-Time",
        enabled: true,
        delivery: "Suggested",
      },
      {
        id: "sound_alert",
        title: "Notification sound",
        description:
          "Play a sound for new tasks, urgent delays, and critical approval requests.",
        module: "Real-Time",
        enabled: true,
        delivery: "Only High Priority",
      },
      {
        id: "header_badge",
        title: "Unread badge counter",
        description:
          "Keep the top-header notification badge synced with unread items across the system.",
        module: "Real-Time",
        enabled: true,
        delivery: "Suggested",
      },
      {
        id: "focus_mode",
        title: "Focus mode filtering",
        description:
          "Reduce interruptions by limiting live popups to critical approvals and blocked operations.",
        module: "Real-Time",
        enabled: false,
        delivery: "Only Critical",
      },
    ],
  },
];

export const DEFAULT_NOTIFICATION_CENTER_PREFERENCES = {
  hideRead: false,
  pushNotifications: true,
  selectedCategories: NOTIFICATION_CATEGORY_OPTIONS.map((category) => category.id),
};

export const cloneNotificationSettings = (settings = DEFAULT_NOTIFICATION_SETTINGS) =>
  settings.map((section) => ({
    ...section,
    items: section.items.map((item) => ({ ...item })),
  }));
