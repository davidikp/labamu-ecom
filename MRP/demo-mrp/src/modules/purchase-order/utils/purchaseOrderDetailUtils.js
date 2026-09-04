import { normalizeProofDocuments } from "../../../utils/upload/uploadUtils.js";

export const buildPoLinkSnapshot = (poData = {}) => {
  const formData = poData?.formData || {};

  return {
    poNumber: poData?.poNumber || "",
    vendorName: poData?.vendorName || formData?.vendorName || "",
    amount: poData?.amount || "",
    createdDate: poData?.createdDate || formData?.poDate || "",
    status: poData?.status || "Draft",
    statusKey: poData?.statusKey || "draft",
    sBadge: poData?.sBadge || "grey-light",
    formData: {
      ...formData,
      vendorDetails: formData?.vendorDetails
        ? { ...formData.vendorDetails }
        : undefined,
      shipTo: formData?.shipTo ? { ...formData.shipTo } : undefined,
      lines: (formData?.lines || []).map((line) => ({ ...line })),
      feeLines: (formData?.feeLines || []).map((fee) => ({ ...fee })),
      receiptLogs: (formData?.receiptLogs || []).map((log) => ({
        ...log,
        items: (log.items || []).map((item) => ({ ...item })),
        proofDocuments: (log.proofDocuments || []).map((doc) => ({ ...doc })),
        attachments: (log.attachments || []).map((doc) => ({ ...doc })),
      })),
      documents: (formData?.documents || []).map((doc) => ({ ...doc })),
    },
  };
};

export const buildReceiptStateFromLines = (
  lines = [],
  currentStatus = "Draft",
  seededLogs = []
) => {
  const shouldBeCompleted = currentStatus === "Completed";
  const sourceLineMap = Object.fromEntries(
    (lines || []).map((line) => [line.id, line])
  );
  const normalizedSeededLogs = (seededLogs || []).map((log, index) => ({
    ...log,
    id: log.id || `receipt-log-seed-${index}`,
    receiptNumber: log.title
      ? log.receiptNumber
      : log.receiptNumber || `RCPT-${String(index + 1).padStart(4, "0")}`,
    date: log.date || "-",
    time: log.time || "-",
    receivedBy: log.receivedBy || "-",
    proofDocuments: normalizeProofDocuments(
      log.proofDocuments || log.attachments,
      log.proof
    ),
    notes: log.notes || "-",
    items: (log.items || []).map((item, itemIndex) => ({
      id:
        item.id || `${log.id || `receipt-log-seed-${index}`}-item-${itemIndex}`,
      item: item.item || sourceLineMap[item.id]?.item || "-",
      code: item.code || sourceLineMap[item.id]?.code || "-",
      receivedNow: Number(item.receivedNow) || 0,
      })),
  }));

  const seededReceivedQtyByKey = new Map();
  normalizedSeededLogs.forEach((log) => {
    (log.items || []).forEach((item) => {
      const receivedNow = Number(item.receivedNow) || 0;
      if (receivedNow <= 0 || !item.id) return;
      
      const keyString = String(item.id);
      seededReceivedQtyByKey.set(
        keyString,
        (seededReceivedQtyByKey.get(keyString) || 0) + receivedNow
      );
    });
  });

  const baseLines = (lines || []).map((line) => {
    const orderedQty = Number(line.qty || line.orderedQty || 0);
    const initialReceivedQty = Number(line.receivedQty || 0);
    const seededReceivedQty = Number(seededReceivedQtyByKey.get(String(line.id)) || 0);
    return {
      id: line.id,
      type: line.type || "manual",
      item: line.item,
      image: line.image,
      code: line.code || line.sku || "-",
      desc: line.desc || "-",
      woRef: line.woRef || "-",
      assignmentId: line.assignmentId || "-",
      outsourceSteps: line.outsourceSteps || [],
      orderedQty,
      receivedQty: shouldBeCompleted
        ? orderedQty
        : Math.min(Math.max(initialReceivedQty, seededReceivedQty), orderedQty),
      receiveNow: "",
    };
  });

  const hasAnyLine = baseLines.length > 0;
  const isCompleted = currentStatus === "Completed";
  const receiptLogs =
    normalizedSeededLogs.length > 0
      ? normalizedSeededLogs
      : isCompleted && hasAnyLine
        ? [
          {
            id: "receipt-log-completed-seed",
            receiptNumber: "RCPT-0001",
            date: "2026-03-30",
            time: "10:24",
            receivedBy: "Natasha Smith",
            proofDocuments: normalizeProofDocuments(
              [],
              "receipt-proof-completed.pdf"
            ),
            notes: "-",
            items: baseLines.map((line) => ({
              id: line.id,
              item: line.item,
              code: line.code || "-",
              receivedNow: line.orderedQty,
            })),
          },
        ]
        : [];

  return { receiptLines: baseLines, receiptLogs };
};

export const buildReceiptActivityLogs = (logs = []) => {
  return (logs || []).map((log) => {
    if (log.title && log.title !== "Receipt Confirmed") {
      return {
        name: log.name || "System",
        email: log.email || "-",
        title: log.title,
        desc: log.desc || "-",
        timestamp: log.timestamp || "-",
      };
    }

    return {
      name: log.receivedBy || "Natasha Smith",
      email: "-",
      title: "Receipt Confirmed",
      desc: [
        (log.items || [])
          .map((item) => `${item.item}: Received ${item.receivedNow || 0} pcs`)
          .join(", "),
        log.notes && log.notes !== "-" ? `Notes: ${log.notes}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
      timestamp:
        log.date && log.time
          ? `${log.date} at ${log.time}`
          : log.timestamp || "-",
    };
  });
};

export const parseActivityTimestamp = (value) => {
  if (!value) return 0;
  const normalized = String(value).replace(" at ", "T").replace(/\./g, "-");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

export const formatActivityTimestamp = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} at ${hh}:${min}`;
};

export const sortLogsLatest = (logs = []) => {
  return [...logs].sort(
    (a, b) =>
      parseActivityTimestamp(b.timestamp) - parseActivityTimestamp(a.timestamp)
  );
};

export const ensureCompletedLogIsLatest = (logs = [], currentStatus) => {
  const sortedLogs = sortLogsLatest(logs);
  if (currentStatus !== "Completed") return sortedLogs;

  const completedLogIndex = sortedLogs.findIndex(
    (log) => log.title === "Completed"
  );
  if (completedLogIndex === -1) return sortedLogs;

  const nextLogs = [...sortedLogs];
  const completedLog = { ...nextLogs[completedLogIndex] };
  nextLogs.splice(completedLogIndex, 1);

  const nonInvoiceLogs = nextLogs.filter(
    (log) =>
      ![
        "Invoice Added",
        "Invoice Updated",
        "Invoice Deleted",
        "Payment Added",
        "Payment Voided",
        "Marked Invoice as the Final Invoice",
        "Unmarked Invoice as the Final Invoice",
      ].includes(log.title)
  );

  const latestExistingTimestamp =
    nonInvoiceLogs.length > 0
      ? Math.max(
          ...nonInvoiceLogs.map((log) => parseActivityTimestamp(log.timestamp))
        )
      : parseActivityTimestamp(completedLog.timestamp);

  const safeBaseTimestamp =
    Number.isFinite(latestExistingTimestamp) && latestExistingTimestamp > 0
      ? latestExistingTimestamp
      : Date.now();

  completedLog.timestamp = formatActivityTimestamp(
    new Date(safeBaseTimestamp + 60 * 1000)
  );

  return sortLogsLatest([completedLog, ...nextLogs]);
};
