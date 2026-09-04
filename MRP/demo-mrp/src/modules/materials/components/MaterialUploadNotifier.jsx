import { useEffect, useRef } from "react";
import { useNotifications } from "../../../context/NotificationContext.jsx";
import { getMaterialUploads, subscribeMaterialUploads } from "../mock/materialUploadsStore.js";
import { CURRENT_USER } from "../../../data/notification/notificationConfig.js";

// Always-mounted watcher (sibling to NotificationSeeder / BulkUploadNotifier)
// that fires a real notification when a material bulk upload batch's
// simulated background processing finishes — regardless of which page is on
// screen when the store's setTimeout resolves, since the store itself is a
// plain module-level pub/sub and has no access to the notification hook.
export const MaterialUploadNotifier = () => {
  const { notify } = useNotifications();
  const prevStatusRef = useRef(null);

  useEffect(() => {
    if (!prevStatusRef.current) {
      prevStatusRef.current = new Map(getMaterialUploads().map((b) => [b.id, b.status]));
    }

    const unsubscribe = subscribeMaterialUploads((batches) => {
      batches.forEach((batch) => {
        const prevStatus = prevStatusRef.current.get(batch.id);
        if (prevStatus !== batch.status) {
          if (batch.status === "Completed" && prevStatus === "Processing") {
            notify("material_bulk_upload", "bulk_upload_completed", {
              entityId: batch.id,
              fileName: batch.fileName,
              materialCount: batch.successCount,
              eligibleUsers: [CURRENT_USER],
            });
          } else if (batch.status === "Cancelled" && prevStatus === "Processing") {
            notify("material_bulk_upload", "bulk_upload_cancelled", {
              entityId: batch.id,
              fileName: batch.fileName,
              eligibleUsers: [CURRENT_USER],
            });
          } else if (batch.status === "Review" && prevStatus === "Normalizing Data") {
            notify("material_bulk_upload", "bulk_upload_mapping_ready", {
              entityId: batch.id,
              fileName: batch.fileName,
              eligibleUsers: [CURRENT_USER],
            });
          }
        }
        prevStatusRef.current.set(batch.id, batch.status);
      });
    });

    return unsubscribe;
  }, [notify]);

  return null;
};
