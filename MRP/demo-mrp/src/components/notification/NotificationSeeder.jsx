import { useEffect } from "react";
import { useNotifications } from "../../context/NotificationContext.jsx";
import { buildEvent } from "../../utils/notification/notificationEngine.js";
import { resolveApprovers } from "../../data/notification/notificationConfig.js";
import { SEED_NOTIFICATION_EVENTS } from "../../data/notification/notificationSeeds.js";

// Module-level guard: seeding must happen exactly once per page load, even
// across React StrictMode double-mounts or provider remounts. A per-instance
// ref would reset on remount and seed duplicates.
let hasSeeded = false;

// On first load, materialise every notification in the catalog (one per trigger)
// so the bell, Todo panel and Email Outbox contain the full review set. Builds
// records directly via the engine and seeds them in a single batch — this
// bypasses the 60s duplicate guard so nothing is dropped.
// Spread seeded items across several days so the day buckets (Today / Yesterday
// / This Week / Earlier) in the notification panel are all represented.
const STEP_MS = 150 * 60 * 1000; // 2.5 hours between seeded items (~4 days total)

export const NotificationSeeder = () => {
  const { seedNotifications, seedEmails, currentUser } = useNotifications();

  useEffect(() => {
    if (hasSeeded) return;
    hasSeeded = true;

    const now = Date.now();
    const notifications = [];
    const emails = [];

    SEED_NOTIFICATION_EVENTS.forEach((event, i) => {
      const createdAt = new Date(now - i * STEP_MS).toISOString();
      const result = buildEvent({
        moduleKey: event.module,
        triggerKey: event.trigger,
        ctx: {
          ...event.ctx,
          createdAt,
          // Route personal recipients to the current user so all are visible.
          submitterUser: currentUser,
          picUser: currentUser,
          requesterUser: currentUser,
          preparerUser: currentUser,
          woCreatorUser: currentUser,
        },
        approvers: resolveApprovers(event.module),
        currentUser,
      });
      // Deterministic ids → seeding is idempotent (no duplicates on re-run).
      result.notifications.forEach((n, k) => {
        n.id = `seed-${event.module}-${event.trigger}-${n.recipientId}-${k}`;
      });
      if (result.email) result.email.id = `seedmail-${event.module}-${event.trigger}`;
      notifications.push(...result.notifications);
      if (result.email) emails.push(result.email);
    });

    seedNotifications(notifications);
    seedEmails(emails);
  }, [seedNotifications, seedEmails, currentUser]);

  return null;
};
