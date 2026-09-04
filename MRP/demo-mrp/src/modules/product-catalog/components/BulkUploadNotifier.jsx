import { useEffect, useRef } from "react";
import { useNotifications } from "../../../context/NotificationContext.jsx";
import { getBulkUploads, subscribeBulkUploads } from "../mock/bulkUploadsStore.js";
import { CURRENT_USER } from "../../../data/notification/notificationConfig.js";

// Always-mounted watcher (sibling to NotificationSeeder) that fires a real
// notification when a bulk upload batch's simulated background processing
// finishes — regardless of which page is on screen when the store's
// setTimeout resolves, since the store itself is a plain module-level
// pub/sub and has no access to the notification hook.
export const BulkUploadNotifier = () => {
  const { notify } = useNotifications();
  const prevStatusRef = useRef(null);

  useEffect(() => {
    if (!prevStatusRef.current) {
      prevStatusRef.current = new Map(getBulkUploads().map((b) => [b.id, b.status]));
    }

    const unsubscribe = subscribeBulkUploads((batches) => {
      batches.forEach((batch) => {
        const prevStatus = prevStatusRef.current.get(batch.id);
        if (prevStatus !== batch.status) {
          if (batch.status === "Completed" && prevStatus === "Processing") {
            notify("product_catalog", "bulk_upload_completed", {
              entityId: batch.id,
              fileName: batch.fileName,
              productCount: batch.successCount,
              eligibleUsers: [CURRENT_USER],
            });
          } else if (batch.status === "Cancelled" && prevStatus === "Processing") {
            notify("product_catalog", "bulk_upload_cancelled", {
              entityId: batch.id,
              fileName: batch.fileName,
              eligibleUsers: [CURRENT_USER],
            });
          } else if (batch.status === "Review" && prevStatus === "Normalizing Data") {
            notify("product_catalog", "bulk_upload_mapping_ready", {
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
