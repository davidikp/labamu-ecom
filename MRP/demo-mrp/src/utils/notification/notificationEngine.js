// Notification engine — turns a (module, trigger, context) event into the
// in-app notification records and the simulated email that the catalog defines.
// Pure functions; no React, no side effects.

import { getCatalogEntry } from "../../data/notification/notificationCatalog.js";
import {
  NOTIFICATION_MODULES,
  CURRENT_USER,
  buildEntityRoute,
} from "../../data/notification/notificationConfig.js";

let seq = 0;
const nextId = (prefix) => {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
};

const asUser = (u) =>
  u ? { id: u.id, name: u.name, email: u.email, role: u.role } : null;

// Resolve who an event goes to, based on the catalog recipientRule.
// Returns { inApp: [user], emailTo: [{name,email}], emailCc: [{name,email}] }.
const resolveRecipients = (rule, ctx, approvers, currentUser) => {
  const me = currentUser || CURRENT_USER;
  const toContacts = (users) =>
    users.filter(Boolean).map((u) => ({ name: u.name, email: u.email }));

  switch (rule) {
    case "all_approvers": {
      const list = approvers.length ? approvers : [me];
      return { inApp: list, emailTo: toContacts(list), emailCc: [] };
    }
    case "submitter_cc_approvers": {
      const submitter = asUser(ctx.submitterUser) || me;
      const cc = approvers.filter((a) => a.id !== submitter.id);
      return {
        inApp: [submitter],
        emailTo: toContacts([submitter]),
        emailCc: cc.length > 0 ? toContacts(cc) : [],
      };
    }
    case "entity_pic": {
      const pic = asUser(ctx.picUser) || me;
      return { inApp: [pic], emailTo: toContacts([pic]), emailCc: [] };
    }
    case "requester": {
      const r = asUser(ctx.requesterUser) || me;
      return { inApp: [r], emailTo: toContacts([r]), emailCc: [] };
    }
    case "preparer": {
      const p = asUser(ctx.preparerUser) || me;
      return { inApp: [p], emailTo: toContacts([p]), emailCc: [] };
    }
    case "wo_creator": {
      const w = asUser(ctx.woCreatorUser) || me;
      return { inApp: [w], emailTo: toContacts([w]), emailCc: [] };
    }
    case "eligible_users": {
      // Broadcast operational alert to whichever users hold access to the
      // related module; the demo defaults to the current user so every
      // seeded event is visible without extra wiring.
      const list = Array.isArray(ctx.eligibleUsers) && ctx.eligibleUsers.length
        ? ctx.eligibleUsers
        : [me];
      return { inApp: list, emailTo: toContacts(list), emailCc: [] };
    }
    case "customer_email": {
      const email = ctx.customerEmail || "customer@example.com";
      const name = ctx.customerPicName || "Customer";
      return { inApp: [], emailTo: [{ name, email }], emailCc: [] };
    }
    default:
      return { inApp: [], emailTo: [], emailCc: [] };
  }
};

// Enrich the context with sensible default display names so templates never
// render "undefined".
const enrichContext = (ctx, approvers, currentUser) => {
  const me = currentUser || CURRENT_USER;
  const enriched = { ...ctx };
  // The catalog templates reference [Number]/[Request ID]; default both to the
  // entity id so callers only need to pass `entityId`.
  if (enriched.number === undefined) enriched.number = ctx.entityId;
  if (enriched.requestId === undefined) enriched.requestId = ctx.entityId;
  if (!enriched.submitterName)
    enriched.submitterName = asUser(ctx.submitterUser)?.name || me.name;
  if (!enriched.requesterName)
    enriched.requesterName = asUser(ctx.requesterUser)?.name || me.name;
  if (!enriched.preparerName)
    enriched.preparerName = asUser(ctx.preparerUser)?.name || "Preparer";
  if (!enriched.picName) enriched.picName = asUser(ctx.picUser)?.name || me.name;
  if (!enriched.approverNames)
    enriched.approverNames = approvers.map((a) => a.name);
  return enriched;
};

// Build the notification + email records for one event.
// `approvers` is the resolved approver list for the module.
export const buildEvent = ({
  moduleKey,
  triggerKey,
  ctx = {},
  approvers = [],
  currentUser = CURRENT_USER,
}) => {
  const entry = getCatalogEntry(moduleKey, triggerKey);
  const mod = NOTIFICATION_MODULES[moduleKey];
  if (!entry || !mod) {
    return { notifications: [], email: null };
  }

  const fullCtx = enrichContext(ctx, approvers, currentUser);
  const recipients = resolveRecipients(
    entry.recipientRule,
    fullCtx,
    approvers,
    currentUser
  );
  const entityRoute = buildEntityRoute(moduleKey, ctx.entityId);
  const createdAt = ctx.createdAt || new Date().toISOString();

  const notifications = [];
  if (entry.channels.inApp && entry.inApp) {
    const content = entry.inApp(fullCtx);
    recipients.inApp.forEach((user) => {
      notifications.push({
        id: nextId("ntf"),
        createdAt,
        module: moduleKey,
        moduleLabel: mod.label,
        color: mod.color,
        triggerKey,
        entityId: ctx.entityId || null,
        entityRoute,
        recipientId: user.id,
        recipientName: user.name,
        title: content.title,
        body: content.body,
        cta: content.cta,
        todo: entry.todo || null,
        unread: true,
        deleted: false,
      });
    });
  }

  let email = null;
  if (entry.channels.email && entry.email && recipients.emailTo.length > 0) {
    const content = entry.email(fullCtx);
    email = {
      id: nextId("eml"),
      createdAt,
      module: moduleKey,
      moduleLabel: mod.label,
      color: mod.color,
      triggerKey,
      entityId: ctx.entityId || null,
      entityRoute,
      subject: content.subject,
      body: content.body,
      cta: content.cta || null,
      to: recipients.emailTo,
      cc: recipients.emailCc,
      // Carried through structurally (rather than only baked into the body
      // string) so the Email Outbox preview can render a dedicated Approval
      // Details block for approval-request emails.
      submitterName: fullCtx.submitterName || null,
      approverNames: fullCtx.approverNames || [],
    };
  }

  return { notifications, email };
};

// Key used to suppress duplicate notifications within a short window.
export const dedupeKey = (moduleKey, triggerKey, ctx = {}) =>
  `${moduleKey}:${triggerKey}:${ctx.entityId || ""}`;
