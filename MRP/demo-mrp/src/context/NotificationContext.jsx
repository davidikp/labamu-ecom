import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { buildEvent, dedupeKey } from "../utils/notification/notificationEngine.js";
import {
  CURRENT_USER,
  resolveApprovers,
} from "../data/notification/notificationConfig.js";

const NotificationContext = createContext(null);

const DEDUPE_WINDOW_MS = 60 * 1000; // "No duplicate notifications within 60 seconds"

// Triggers that conclude an approval cycle and should clear approvers' pending
// Todo for that entity.
const APPROVAL_OUTCOME_TRIGGERS = new Set([
  "all_approved",
  "rejected",
  "need_revision",
  "customer_approved",
  "customer_rejected",
  "customer_revision",
]);

const text = (obj, language) =>
  !obj ? "" : obj[language] !== undefined ? obj[language] : obj.en || "";

export const NotificationProvider = ({
  children,
  language = "en",
  currentUser = CURRENT_USER,
  approverSettings = {},
}) => {
  const [notifications, setNotifications] = useState([]);
  const [emails, setEmails] = useState([]);
  // Resolved Todo keys: `${module}:${entityId}:${type}`
  const [resolvedTodoKeys, setResolvedTodoKeys] = useState(() => new Set());
  const recentRef = useRef(new Map()); // dedupeKey -> timestamp

  // Resolve the effective approver list for a module (configured or default).
  const approversFor = useCallback(
    (moduleKey) => resolveApprovers(moduleKey, approverSettings[moduleKey]),
    [approverSettings]
  );

  const mutateResolved = useCallback((fn) => {
    setResolvedTodoKeys((prev) => {
      const next = new Set(prev);
      fn(next);
      return next;
    });
  }, []);

  // Core entry point: fire an event through the catalog/engine.
  const notify = useCallback(
    (moduleKey, triggerKey, ctx = {}) => {
      const key = dedupeKey(moduleKey, triggerKey, ctx);
      const now = Date.now();
      const last = recentRef.current.get(key);
      if (last && now - last < DEDUPE_WINDOW_MS) {
        return { notifications: [], email: null };
      }
      recentRef.current.set(key, now);

      const approvers = approversFor(moduleKey);
      const result = buildEvent({
        moduleKey,
        triggerKey,
        ctx,
        approvers,
        currentUser,
      });

      if (result.notifications.length > 0) {
        setNotifications((prev) => [...result.notifications, ...prev]);
      }
      if (result.email) {
        setEmails((prev) => [result.email, ...prev]);
      }

      // Keep the Todo panel in sync with entity lifecycle.
      const entityId = ctx.entityId;
      if (entityId) {
        if (triggerKey === "submitted") {
          // Fresh request — re-open approval Todo, clear revision Todo.
          mutateResolved((set) => {
            set.delete(`${moduleKey}:${entityId}:approval`);
            set.add(`${moduleKey}:${entityId}:revision`);
          });
        } else if (APPROVAL_OUTCOME_TRIGGERS.has(triggerKey)) {
          // Outcome/veto — remaining approvers no longer need to act.
          mutateResolved((set) => set.add(`${moduleKey}:${entityId}:approval`));
        }
      }

      return result;
    },
    [approversFor, currentUser, mutateResolved]
  );

  // Mark a Todo (by entity) resolved — call when the current user completes the
  // action (confirm receipt, review proof, edit & resubmit, etc.).
  const resolveTodo = useCallback(
    (moduleKey, entityId, type) => {
      if (!entityId) return;
      mutateResolved((set) => {
        if (type) set.add(`${moduleKey}:${entityId}:${type}`);
        else
          ["approval", "revision", "proof", "receipt"].forEach((t) =>
            set.add(`${moduleKey}:${entityId}:${t}`)
          );
      });
    },
    [mutateResolved]
  );

  const markRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.recipientId === currentUser.id ? { ...n, unread: false } : n
      )
    );
  }, [currentUser.id]);

  const deleteNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, deleted: true } : n))
    );
  }, []);

  // Seeding helpers for demo/stub-module data. Idempotent: records whose id is
  // already present are skipped, so re-running the seeder (StrictMode, HMR,
  // remounts) never creates duplicates.
  const seedNotifications = useCallback((records) => {
    setNotifications((prev) => {
      const existing = new Set(prev.map((n) => n.id));
      const fresh = records.filter((r) => !existing.has(r.id));
      return fresh.length ? [...fresh, ...prev] : prev;
    });
  }, []);
  const seedEmails = useCallback((records) => {
    setEmails((prev) => {
      const existing = new Set(prev.map((e) => e.id));
      const fresh = records.filter((r) => !existing.has(r.id));
      return fresh.length ? [...fresh, ...prev] : prev;
    });
  }, []);

  // Notifications addressed to the current user, sorted newest-first, not deleted.
  const myNotifications = useMemo(
    () =>
      notifications
        .filter((n) => n.recipientId === currentUser.id && !n.deleted)
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")),
    [notifications, currentUser.id]
  );

  const unreadCount = useMemo(
    () => myNotifications.filter((n) => n.unread).length,
    [myNotifications]
  );

  // Emails sorted newest-first for the outbox.
  const sortedEmails = useMemo(
    () =>
      [...emails].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")),
    [emails]
  );

  // Derive the Todo panel: action-required notifications for the current user,
  // deduped by (module, entity, type), excluding resolved ones.
  const todoItems = useMemo(() => {
    const byKey = new Map();
    myNotifications.forEach((n) => {
      if (!n.todo || !n.entityId) return;
      const key = `${n.module}:${n.entityId}:${n.todo.type}`;
      if (resolvedTodoKeys.has(key)) return;
      if (!byKey.has(key)) byKey.set(key, n); // newest wins (list is newest-first)
    });
    return Array.from(byKey.values());
  }, [myNotifications, resolvedTodoKeys]);

  const value = useMemo(
    () => ({
      language,
      currentUser,
      notifications: myNotifications,
      allNotifications: notifications,
      emails: sortedEmails,
      unreadCount,
      todoItems,
      notify,
      resolveTodo,
      markRead,
      markAllRead,
      deleteNotification,
      seedNotifications,
      seedEmails,
      t: (obj) => text(obj, language),
    }),
    [
      language,
      currentUser,
      myNotifications,
      notifications,
      sortedEmails,
      unreadCount,
      todoItems,
      notify,
      resolveTodo,
      markRead,
      markAllRead,
      deleteNotification,
      seedNotifications,
      seedEmails,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    // Safe no-op fallback so components don't crash outside the provider.
    return {
      language: "en",
      currentUser: CURRENT_USER,
      notifications: [],
      allNotifications: [],
      emails: [],
      unreadCount: 0,
      todoItems: [],
      notify: () => ({ notifications: [], email: null }),
      resolveTodo: () => {},
      markRead: () => {},
      markAllRead: () => {},
      deleteNotification: () => {},
      seedNotifications: () => {},
      seedEmails: () => {},
      t: (obj) => (obj ? obj.en || "" : ""),
    };
  }
  return ctx;
};
