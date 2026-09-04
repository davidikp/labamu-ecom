import { formatNumberWithCommas, parseNumberFromCommas } from "../../../utils/format/formatUtils.js";
import { generatePurchaseOrderPdfBlob } from "./purchaseOrderPdfCanvasExport.js";

const isRenderablePdfImageSource = (value) =>
  typeof value === "string" &&
  /^(https?:|data:|blob:|\/)/i.test(value.trim());

const resolvePdfImage = (image) => {
  if (!image) return { src: "", label: "" };

  if (typeof image === "string") {
    if (isRenderablePdfImageSource(image)) {
      return { src: image, label: "" };
    }
    return { src: "", label: image };
  }

  if (typeof image === "object") {
    const src = image.previewUrl || image.url || image.src || "";
    const label = image.name || image.fileName || image.label || "";
    return { src, label };
  }

  return { src: "", label: "" };
};

const splitParagraphs = (value) => {
  if (value === null || value === undefined) return [];
  const lines = String(value)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : [];
};

const formatPdfQuantity = (line) => {
  const qty = parseNumberFromCommas(line?.qty);
  const uom = line?.uom ? String(line.uom).trim() : "";
  const qtyLabel = formatNumberWithCommas(qty);
  if (!uom) return qtyLabel || "0";
  return `${qtyLabel || "0"} ${uom}`;
};

const buildDescriptionBlocks = (line) => {
  const blocks = [
    {
      label: null,
      value: line?.item || "-",
      isTitle: true,
    },
  ];

  if (line?.code) {
    blocks.push({
      label: "SKU / Code",
      value: line.code,
    });
  }

  if (line?.desc) {
    blocks.push({
      label: "Description",
      value: line.desc,
    });
  }

  if (line?.woRef && line.woRef !== "-") {
    blocks.push({
      label: "WO Ref",
      value: line.woRef,
    });
  }

  return blocks;
};

export const buildPurchaseOrderPdfExportData = ({
  poNumber,
  createdDate,
  expectedDeliveryDate,
  currency,
  currencyLabel,
  createdBy,
  vendorInfo,
  shipToInfo,
  lines = [],
  subtotal = 0,
  taxRate = 0,
  summaryFeeRows = [],
  total = 0,
  notes = "",
  terms = "",
  requestedBy = "",
  approvedBy = "",
  approvalEnabled = false,
  currentStatus = "",
  company = null,
}) => {
  const normalizedTaxRate = Number(parseNumberFromCommas(taxRate)) || 0;
  const normalizedSubtotal = Number(parseNumberFromCommas(subtotal)) || 0;
  const normalizedTotal = Number(parseNumberFromCommas(total)) || 0;
  const normalizedFeeRows = (summaryFeeRows || []).map((fee, index) => ({
    id: fee?.id || `fee-${index}`,
    name: fee?.name || `Fee ${index + 1}`,
    amount: Number(parseNumberFromCommas(fee?.amount)) || 0,
  }));

  return {
    poNumber: poNumber || "-",
    createdDate: createdDate || "-",
    currency: currency || "IDR",
    currencyLabel: currencyLabel || currency || "IDR",
    expectedDeliveryDate: expectedDeliveryDate || "-",
    createdBy: createdBy || "-",
    vendorInfo: vendorInfo || {},
    shipToInfo: shipToInfo || {},
    currentStatus: currentStatus || "",
    lineItems: (lines || []).map((line, index) => {
      const quantity = Number(parseNumberFromCommas(line?.qty)) || 0;
      const unitPrice = Number(parseNumberFromCommas(line?.price)) || 0;
      const amount = quantity * unitPrice;
      return {
        id: line?.id || `po-line-${index}`,
        no: index + 1,
        quantity,
        quantityLabel: formatPdfQuantity(line),
        unitPrice,
        amount,
        image: resolvePdfImage(line?.image),
        descriptionBlocks: buildDescriptionBlocks(line),
      };
    }),
    summary: {
      subtotal: normalizedSubtotal,
      taxRate: normalizedTaxRate,
      taxAmount:
        normalizedSubtotal * (normalizedTaxRate > 0 ? normalizedTaxRate / 100 : 0),
      feeRows: normalizedFeeRows,
      total: normalizedTotal,
    },
    notesParagraphs: splitParagraphs(notes),
    termsParagraphs: splitParagraphs(terms),
    requestedBy: requestedBy || "-",
    approvedBy: approvedBy || "-",
    approvalEnabled: !!approvalEnabled,
    company:
      company || {
        name: "Labamu Manufacturing",
        phone: "+62 21 555 1234",
        email: "procurement@labamu.com",
        address:
          "Jl. Industri Utama Kav 9, South Tangerang, Banten, Indonesia 15320",
      },
  };
};

const sanitizeFileName = (value = "purchase-order") =>
  String(value)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "purchase-order";

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

export const exportPurchaseOrderPdf = async ({ data }) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("PDF export is unavailable in this environment.");
  }

  const blob = await generatePurchaseOrderPdfBlob(data);
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `${sanitizeFileName(`${data?.poNumber || "PO"}_${dateStr}`)}.pdf`;
  downloadBlob(blob, fileName);
};
