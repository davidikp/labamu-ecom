import { formatCurrency, formatNumberWithCommas, parseNumberFromCommas } from "../../../utils/format/formatUtils.js";
const GENERIC_LOGO_SRC = "https://placehold.co/400x120/f3f4f6/1f2937?text=LOGO";
// PDF Export Version: 1.0.2

const CSS_DPI = 96;
const PDF_DPI = 180;
const SCALE = PDF_DPI / CSS_DPI;

const cssToPx = (value) => value * SCALE;
const px = (value) => Math.round(cssToPx(value));

const A4_CSS_WIDTH = 794;
const A4_CSS_HEIGHT = 1123;
const PAGE_WIDTH = px(A4_CSS_WIDTH);
const PAGE_HEIGHT = px(A4_CSS_HEIGHT);

const numberToWords = (n) => {
  if (n === 0) return "Zero";
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const scales = ["", "Thousand", "Million", "Billion", "Trillion"];

  const convertThreeDigit = (num) => {
    let str = "";
    if (num >= 100) {
      str += units[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }
    if (num >= 10 && num <= 19) {
      str += teens[num - 10] + " ";
    } else {
      if (num >= 20) {
        str += tens[Math.floor(num / 10)] + " ";
        num %= 10;
      }
      if (num > 0) {
        str += units[num] + " ";
      }
    }
    return str;
  };

  let word = "";
  let i = 0;
  let tempN = Math.round(n);
  while (tempN > 0) {
    if (tempN % 1000 !== 0) {
      word = convertThreeDigit(tempN % 1000) + scales[i] + " " + word;
    }
    tempN = Math.floor(tempN / 1000);
    i++;
  }
  return word.trim();
};

const COLORS = {
  text: "#1F1F1F",
  muted: "#676767",
  light: "#888888",
  line: "#2A2A2A",
  softLine: "#B6B6B6",
  headerFill: "#F2F2F2",
  footerLine: "#4A4A4A",
  white: "#FFFFFF",
  totalFill: "#F5F5F5",
  black: "#000000",
  blackBar: "#1F1F1F",
};

const DIMENSIONS = {
  marginX: px(44),
  marginTop: px(30),
  marginBottom: px(34),
  footerHeight: px(20), // Reduced since footer is removed
  sectionGap: px(14),
  pageGap: px(12),
  headerLogoWidth: px(184),
  continuationLogoWidth: px(156),
  topMetaWidth: px(260),
  tableHeaderHeight: px(24),
  footerGap: px(14),
};

const TABLE = {
  colNo: px(28),
  colImage: px(62),
  colPrice: px(118),
  colQty: px(82),
  colAmount: px(124),
  cellPaddingX: px(7),
  cellPaddingY: px(6),
  imageBox: px(44),
  rowGap: px(4),
};

const FONTS = {
  title: { size: px(18), weight: 700 },
  section: { size: px(12), weight: 700 },
  body: { size: px(11), weight: 400 },
  bodyBold: { size: px(11), weight: 700 },
  tiny: { size: px(10), weight: 400 },
  tinyBold: { size: px(10), weight: 700 },
  tableHead: { size: px(10), weight: 700 },
  tableBody: { size: px(11), weight: 400 },
  tableBodyBold: { size: px(11), weight: 700 },
  footerHeading: { size: px(11), weight: 700 },
  footerBody: { size: px(10), weight: 400 },
  disclaimer: { size: px(8), weight: 400 },
};

const HEADER_META_LABEL_WIDTH = px(108);
const HEADER_META_ROW_GAP = px(5);
const HEADER_META_LINE_HEIGHT = Math.round(FONTS.body.size * 1.42);
const ASSIGNMENT_LINE_HEIGHT = Math.round(FONTS.body.size * 1.42);
const ASSIGNMENT_BLOCK_WIDTH = px(174);
const ASSIGNMENT_BLOCK_HEIGHT = px(78);
const ASSIGNMENT_BLOCK_GAP = px(30);

const encodeText = (value) => new TextEncoder().encode(String(value));

const concatBytes = (chunks) => {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });
  return result;
};

const bytesFromDataUrl = (dataUrl) => {
  const base64 = String(dataUrl || "").split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const createCanvas = () => {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to initialize PDF canvas.");
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { canvas, ctx };
};

const loadImage = (src) =>
  new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });

const isRenderablePdfImageSource = (value) =>
  typeof value === "string" &&
  /^(https?:|data:|blob:|\/)/i.test(value.trim());

const resolveImageSource = (image) => {
  if (!image) return "";

  if (typeof image === "string") {
    return isRenderablePdfImageSource(image) ? image : "";
  }

  if (typeof image === "object") {
    return image.previewUrl || image.url || image.src || "";
  }

  return "";
};

const splitParagraphs = (value) => {
  if (value === null || value === undefined) return [];
  return String(value)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const fontString = ({ size, weight }) => `${weight} ${size}px Arial, Helvetica, sans-serif`;

const setFont = (ctx, font) => {
  ctx.font = fontString(font);
};

const measureLines = (ctx, text, maxWidth, font) => {
  setFont(ctx, font);
  const words = String(text || "")
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return [""];
  }

  const lines = [];
  let current = "";

  words.forEach((word) => {
    const testLine = current ? `${current} ${word}` : word;
    if (ctx.measureText(testLine).width <= maxWidth || !current) {
      current = testLine;
    } else {
      lines.push(current);
      current = word;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [""];
};

const measureParagraphsHeight = (ctx, paragraphs, maxWidth, font, lineHeight) => {
  const rows = paragraphs.length ? paragraphs : ["-"];
  let height = 0;

  rows.forEach((paragraph, index) => {
    const lines = measureLines(ctx, paragraph, maxWidth, font);
    height += lines.length * lineHeight;
    if (index < rows.length - 1) {
      height += lineHeight * 0.3;
    }
  });

  return height;
};

const drawRoundedRect = (ctx, x, y, width, height, radius, fillStyle, strokeStyle, lineWidth = 1) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
  }
};

const drawLine = (ctx, x1, y1, x2, y2, color = COLORS.line, width = 1) => {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

const drawText = (ctx, text, x, y, font, color = COLORS.text, options = {}) => {
  setFont(ctx, font);
  ctx.fillStyle = color;
  ctx.textAlign = options.align || "left";
  ctx.textBaseline = options.baseline || "alphabetic";
  ctx.fillText(String(text), x, y);
};

const drawWrappedText = (ctx, text, x, y, maxWidth, font, color, options = {}) => {
  const paragraphs = Array.isArray(text) ? text : splitParagraphs(text);
  const lineHeight = options.lineHeight || Math.round(font.size * 1.42);
  const gap = options.paragraphGap || Math.round(lineHeight * 0.35);
  let cursorY = y;

  if (!paragraphs.length) {
    drawText(ctx, "-", x, cursorY, font, color);
    return lineHeight;
  }

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const lines = measureLines(ctx, paragraph, maxWidth, font);
    const totalBlockHeight = lines.length * lineHeight;
    let currentY = cursorY;
    
    if (options.baseline === "middle") {
      currentY = cursorY - (totalBlockHeight / 2) + (lineHeight / 2);
    }
    
    lines.forEach((line) => {
      drawText(ctx, line, x, currentY, font, color, options);
      currentY += lineHeight;
    });
    
    if (paragraphIndex < paragraphs.length - 1) {
      cursorY += (lines.length * lineHeight) + gap;
    } else {
      cursorY += (lines.length * lineHeight);
    }
  });

  return cursorY - y;
};

const drawImageCover = (ctx, image, x, y, width, height, align = "center", fit = "cover") => {
  if (!image) return false;
  const sourceWidth = image.naturalWidth || image.width || 0;
  const sourceHeight = image.naturalHeight || image.height || 0;
  if (!sourceWidth || !sourceHeight) return false;

  const ratio = fit === "contain" 
    ? Math.min(width / sourceWidth, height / sourceHeight)
    : Math.max(width / sourceWidth, height / sourceHeight);
  
  const drawWidth = sourceWidth * ratio;
  const drawHeight = sourceHeight * ratio;
  
  let offsetX = x;
  if (align === "center") {
    offsetX = x + (width - drawWidth) / 2;
  } else if (align === "right") {
    offsetX = x + (width - drawWidth);
  }
  
  const offsetY = y + (height - drawHeight) / 2;
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  return true;
};

const formatPdfQuantity = (line) => {
  const qty = Number(line?.quantity || 0);
  const uom = line?.uom ? String(line.uom).trim() : "";
  const qtyLabel = formatNumberWithCommas(qty);
  if (!uom) return qtyLabel || "0";
  return `${qtyLabel || "0"} ${uom}`;
};

const buildPdfImageDescriptor = (image) => {
  const src = resolveImageSource(image);
  return {
    src,
    label:
      typeof image === "object"
        ? image.label || image.name || image.fileName || ""
        : typeof image === "string" && !isRenderablePdfImageSource(image)
          ? image
          : "",
  };
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
    blocks.push({ label: "SKU / Code", value: line.code });
  }

  if (line?.desc) {
    blocks.push({ label: "Description", value: line.desc });
  }

  if (line?.woRef && line.woRef !== "-") {
    blocks.push({ label: "WO Ref", value: line.woRef });
  }

  return blocks;
};

const getHeaderMetaRows = (data) => [
  ["PO Number", `: ${data.poNumber || "-"}`],
  ["PO Date", `: ${data.createdDate || "-"}`],
  ["Currency", `: ${data.currency || "-"}`],
];

const measureMetaBlockHeight = (ctx, data, width) => {
  let height = 0;
  const labelWidth = Math.min(HEADER_META_LABEL_WIDTH, Math.max(width * 0.54, px(88)));
  const valueWidth = Math.max(width - labelWidth, px(64));

  getHeaderMetaRows(data).forEach(([label, value], index, rows) => {
    const labelLines = measureLines(ctx, label, labelWidth, FONTS.tinyBold);
    const valueLines = measureLines(ctx, value || "-", valueWidth, FONTS.body);
    height += Math.max(labelLines.length, valueLines.length) * HEADER_META_LINE_HEIGHT;
    if (index < rows.length - 1) {
      height += HEADER_META_ROW_GAP;
    }
  });

  return height;
};

const COMPANY_INFO_LINE_HEIGHT = Math.round(FONTS.body.size * 1.3);

const measureCompanyInfoHeaderHeight = (ctx, data, width) => {
  let height = px(22); // Start with name height
  height += measureLines(ctx, data.company?.address || "-", width, FONTS.tiny).length * COMPANY_INFO_LINE_HEIGHT;
  height += COMPANY_INFO_LINE_HEIGHT; // Contact line
  return height + px(10);
};

const measureAssignmentFieldHeight = () => ASSIGNMENT_BLOCK_HEIGHT;

const measureHeaderHeight = (ctx, data, pageType) => {
  const isFirst = pageType === "first";
  const logoY = DIMENSIONS.marginTop;
  const logoHeight = Math.round((isFirst ? DIMENSIONS.headerLogoWidth : DIMENSIONS.continuationLogoWidth) * 0.35);
  
  let headerContentHeight = logoHeight;
  if (isFirst) {
    headerContentHeight += measureCompanyInfoHeaderHeight(ctx, data, DIMENSIONS.headerLogoWidth * 1.8);
  }

  const metaY = logoY + px(4); // Align top with logo or slightly below title
  const metaHeight = measureMetaBlockHeight(ctx, data, DIMENSIONS.topMetaWidth);
  
  const totalHeaderHeight = Math.max(logoY + headerContentHeight, metaY + metaHeight + px(12));
  return totalHeaderHeight + px(20);
};

export const buildPurchaseOrderPdfExportData = ({
  poNumber,
  createdDate,
  currency,
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
    vendorInfo: vendorInfo || {},
    shipToInfo: shipToInfo || {},
    currentStatus: currentStatus || "",
    lineItems: (lines || []).map((line, index) => {
      const quantity = Number(parseNumberFromCommas(line?.qty || line?.quantity || 0)) || 0;
      const unitPrice = Number(parseNumberFromCommas(line?.price || 0)) || 0;
      const amount = quantity * unitPrice;
      return {
        id: line?.id || `po-line-${index}`,
        no: index + 1,
        quantity,
        quantityLabel: formatPdfQuantity({ ...line, quantity }),
        unitPrice,
        amount,
        image: buildPdfImageDescriptor(line?.image),
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

const measureDescriptionBlockHeight = (ctx, blocks, width) => {
  const titleFont = FONTS.tableBodyBold;
  const metaLabelFont = FONTS.tinyBold;
  const metaValueFont = FONTS.tiny;
  const titleLineHeight = Math.round(titleFont.size * 1.3);
  const metaLineHeight = Math.round(metaValueFont.size * 1.38);
  const metaLabelWidth = px(58);
  const innerWidth = width;

  let height = 0;
  const titleBlock = blocks[0];
  const titleLines = measureLines(ctx, titleBlock?.value || "-", innerWidth, titleFont);
  height += titleLines.length * titleLineHeight;
  height += px(2);

  blocks.slice(1).forEach((block, index) => {
    const label = block.label || "";
    const valueLines = measureLines(
      ctx,
      block.value || "-",
      Math.max(innerWidth - metaLabelWidth - px(8), px(12)),
      metaValueFont
    );
    const labelLines = measureLines(ctx, label, metaLabelWidth, metaLabelFont);
    const rowHeight = Math.max(
      labelLines.length * metaLineHeight,
      valueLines.length * metaLineHeight
    );
    height += rowHeight;
    if (index < blocks.slice(1).length - 1) {
      height += px(1.5);
    }
  });

  return height;
};

const measureLineHeight = (ctx, line, descriptionWidth) => {
  const descHeight = measureDescriptionBlockHeight(
    ctx,
    line.descriptionBlocks || [],
    descriptionWidth
  );
  const numericHeight = Math.max(FONTS.tableBody.size * 1.5, descHeight);
  return (
    numericHeight +
    TABLE.cellPaddingY * 2 +
    px(3)
  );
};

const measureSummaryHeight = (ctx, summary, currency, maxWidth) => {
  const rows = [
    { label: "Subtotal", value: formatCurrency(summary?.subtotal || 0, currency) },
    { label: `PPN ${Number(summary?.taxRate || 0)}%`, value: formatCurrency(summary?.taxAmount || 0, currency) },
    ...(summary?.feeRows || []).map((fee) => ({
      label: fee.name,
      value: formatCurrency(fee.amount || 0, currency),
    })),
    { label: "Total", value: formatCurrency(summary?.total || 0, currency), isTotal: true },
  ];

  const labelFont = FONTS.body;
  const valueFont = FONTS.bodyBold;
  const rowLineHeight = Math.round(FONTS.body.size * 1.55);
  let height = 0;

  rows.forEach((row, index) => {
    const labelLines = measureLines(ctx, row.label, maxWidth - px(120), labelFont);
    const valueLines = measureLines(ctx, row.value, px(110), valueFont);
    const rowHeight = Math.max(labelLines.length, valueLines.length) * rowLineHeight + px(2);
    height += rowHeight;
    if (index < rows.length - 1) {
      height += px(2);
    }
  });

  height += px(10);
  return height;
};

const measureTextBlockHeight = (ctx, paragraphs, width) => {
  const bodyFont = FONTS.body;
  const lineHeight = Math.round(bodyFont.size * 1.48);
  let height = 0;

  const rows = paragraphs.length ? paragraphs : ["-"];
  rows.forEach((paragraph, index) => {
    const lines = measureLines(ctx, paragraph, width, bodyFont);
    height += lines.length * lineHeight;
    if (index < rows.length - 1) {
      height += px(4);
    }
  });

  return height;
};

const drawSectionHeading = (ctx, title, x, y, width) => {
  drawText(ctx, title, x, y, FONTS.section, COLORS.text);
  drawLine(ctx, x, y + px(5), x + width, y + px(5), COLORS.softLine, px(0.8));
  return y + px(16);
};

const drawMetaBlock = (ctx, data, x, y, width) => {
  const labelFont = FONTS.tinyBold;
  const valueFont = FONTS.body;
  const rowGap = HEADER_META_ROW_GAP;
  const labelWidth = Math.min(HEADER_META_LABEL_WIDTH, Math.max(width * 0.54, px(88)));
  const valueWidth = Math.max(width - labelWidth, px(64));
  const rows = getHeaderMetaRows(data);

  let cursorY = y;
  rows.forEach(([label, value], index) => {
    const labelLines = measureLines(ctx, label, labelWidth, labelFont);
    const valueLines = measureLines(ctx, value || "-", valueWidth, valueFont);
    const rowHeight = Math.max(labelLines.length, valueLines.length) * HEADER_META_LINE_HEIGHT;
    drawWrappedText(
      ctx,
      label,
      x,
      cursorY,
      labelWidth,
      labelFont,
      COLORS.muted,
      { lineHeight: HEADER_META_LINE_HEIGHT, baseline: "top" }
    );
    drawWrappedText(
      ctx,
      value || "-",
      x + labelWidth,
      cursorY,
      valueWidth,
      valueFont,
      COLORS.text,
      { lineHeight: HEADER_META_LINE_HEIGHT, baseline: "top" }
    );

    cursorY += rowHeight;
    if (index < rows.length - 1) {
      cursorY += rowGap;
    }
  });

  return cursorY - y;
};

const drawHeader = async (ctx, pageType, data, assets) => {
  const isFirst = pageType === "first";
  const logoWidth = isFirst ? px(48) : px(38); 
  const logoHeight = logoWidth;
  const logoX = DIMENSIONS.marginX;
  const logoY = isFirst ? DIMENSIONS.marginTop + px(44) : DIMENSIONS.marginTop;

  // 1. Draw "PURCHASE ORDER" label bar on first page
  if (isFirst) {
    const labelWidth = px(154);
    const labelHeight = px(24);
    ctx.fillStyle = COLORS.blackBar;
    ctx.fillRect(logoX, DIMENSIONS.marginTop, labelWidth, labelHeight);
    drawText(
      ctx,
      "PURCHASE ORDER",
      logoX + labelWidth / 2,
      DIMENSIONS.marginTop + labelHeight / 2 + px(3),
      { size: px(12), weight: 700 },
      COLORS.white,
      { align: "center", baseline: "middle" }
    );
  }

  // 2. Draw Logo and Company Name
  if (assets.logo) {
    drawImageCover(ctx, assets.logo, logoX, logoY, logoWidth, logoHeight, "left", "contain");
  }
  
  if (isFirst) {
    drawText(
      ctx,
      data.company?.name || "Labamu Manufacturing",
      logoX + logoWidth + px(16),
      logoY + logoHeight / 2 + px(4),
      { size: px(14), weight: 700 },
      COLORS.text,
      { baseline: "middle" }
    );
  }

  let cursorY = logoY + logoHeight + px(12);

  if (isFirst) {
    // Draw company info below logo
    const addressWidth = px(360);
    const lineGap = px(13);
    const textOptions = { baseline: "top" };
    drawText(ctx, data.company?.phone || "-", logoX, cursorY, FONTS.tiny, COLORS.muted, textOptions);
    cursorY += lineGap;
    drawText(ctx, data.company?.email || "-", logoX, cursorY, FONTS.tiny, COLORS.muted, textOptions);
    cursorY += lineGap;
    cursorY += drawWrappedText(
      ctx,
      data.company?.address || "-",
      logoX,
      cursorY,
      addressWidth,
      FONTS.tiny,
      COLORS.muted,
      { ...textOptions, lineHeight: lineGap }
    );
  }

  // 3. Meta information on the right
  const titleX = PAGE_WIDTH - DIMENSIONS.marginX - DIMENSIONS.topMetaWidth;
  const metaY = isFirst ? DIMENSIONS.marginTop : logoY + px(4);
  const metaHeight = drawMetaBlock(ctx, data, titleX, metaY, DIMENSIONS.topMetaWidth);
  
  const headerBottom = Math.max(cursorY + px(10), metaY + metaHeight + px(14));
  // Removed separator line as requested
  
  return headerBottom + px(14);
};

const drawInfoColumns = (ctx, data, y) => {
  const contentWidth = PAGE_WIDTH - DIMENSIONS.marginX * 2;
  const colWidth = contentWidth / 2;
  const xLeft = DIMENSIONS.marginX;
  const xRight = DIMENSIONS.marginX + colWidth;
  const blockTop = y;
  const lineSpacing = px(14);

  const drawStackedInfo = (ctx, title, name, phone, email, address, x) => {
    let cursorY = blockTop;
    drawText(ctx, title, x, cursorY, FONTS.body, COLORS.muted);
    cursorY += px(22);
    drawText(ctx, name, x, cursorY, FONTS.section, COLORS.text, { weight: 700 });
    cursorY += px(18);
    
    const details = [phone, email, address].filter(Boolean);
    details.forEach(line => {
      drawText(ctx, line, x, cursorY, FONTS.body, COLORS.text);
      cursorY += lineSpacing;
    });
  };

  drawStackedInfo(
    ctx, 
    "Vendor Information", 
    data.vendorInfo?.name || "-", 
    data.vendorInfo?.phone,
    data.vendorInfo?.email,
    data.vendorInfo?.address,
    xLeft
  );

  drawStackedInfo(
    ctx, 
    "Recipient Information", 
    data.shipToInfo?.name || "-", 
    data.shipToInfo?.phone,
    data.shipToInfo?.email,
    data.shipToInfo?.address,
    xRight
  );

  const approxHeight = px(112);
  const infoBottom = blockTop + approxHeight;
  
  return infoBottom;
};

const drawTableHeader = (ctx, x, y, widths) => {
  const headerHeight = DIMENSIONS.tableHeaderHeight;
  // No fill for header as requested
  
  const labels = ["No", "Image", "Item", "Description", "Price", "Quantity", "Amount"];
  let cursorX = x;
  labels.forEach((label, index) => {
    const width = widths[index];
    const isLeftAlign = index === 2 || index === 3; // Item and Description
    drawText(
      ctx,
      label,
      isLeftAlign ? cursorX + TABLE.cellPaddingX : cursorX + width / 2,
      y + headerHeight / 2 + px(3),
      FONTS.tableHead,
      COLORS.text,
      { align: isLeftAlign ? "left" : "center", baseline: "middle" }
    );
    cursorX += width;
  });

  const tableWidth = widths.reduce((sum, width) => sum + width, 0);
  drawLine(ctx, x, y, x + tableWidth, y, COLORS.softLine, px(0.8));
  drawLine(ctx, x, y + headerHeight, x + tableWidth, y + headerHeight, COLORS.softLine, px(0.8));
};

const drawTableRow = async (ctx, row, x, y, widths, assets, currency) => {
  const rowHeight = measureLineHeight(ctx, row, widths[3]);
  const imageX = x + widths[0];
  const itemX = imageX + widths[1];
  const descX = itemX + widths[2];
  const priceX = descX + widths[3];
  const qtyX = priceX + widths[4];
  const amountX = qtyX + widths[5];
  const contentTop = y + TABLE.cellPaddingY;
  const contentLineHeight = Math.round(FONTS.tableBody.size * 1.34);

  drawText(
    ctx,
    row.no,
    x + widths[0] / 2,
    y + TABLE.cellPaddingY + contentLineHeight,
    FONTS.tableBody,
    COLORS.text,
    { align: "center" }
  );

  const imageBox = TABLE.imageBox;
  const imageCenterX = imageX + widths[1] / 2;
  const imageLeft = imageCenterX - imageBox / 2;
  const imageTop = y + TABLE.cellPaddingY + px(2); // Top aligned with small offset

  if (row.image?.src && assets.images[row.id]) {
    drawImageCover(ctx, assets.images[row.id], imageLeft, imageTop, imageBox, imageBox, "center", "contain");
  } else {
    drawText(ctx, "-", imageCenterX, imageTop + px(8), FONTS.tableBody, COLORS.text, { align: "center", baseline: "top" });
  }

  // Item Column (Item Name + SKU)
  const itemWidth = widths[2] - TABLE.cellPaddingX * 2;
  let cursorY = contentTop + contentLineHeight;
  const itemName = row.descriptionBlocks?.[0]?.value || "-";
  const itemNameLines = measureLines(ctx, itemName, itemWidth, FONTS.tableBody);
  itemNameLines.forEach(line => {
    drawText(ctx, line, itemX + TABLE.cellPaddingX, cursorY, FONTS.tableBody, COLORS.text);
    cursorY += contentLineHeight;
  });
  
  const sku = row.descriptionBlocks?.find(b => b.label === "SKU / Code")?.value;
  if (sku) {
    drawText(ctx, sku, itemX + TABLE.cellPaddingX, cursorY, FONTS.tiny, COLORS.muted);
  }

  // Description Column
  const descWidth = widths[3] - TABLE.cellPaddingX * 2;
  const desc = row.descriptionBlocks?.find(b => b.label === "Description")?.value || "-";
  drawWrappedText(ctx, desc, descX + TABLE.cellPaddingX, contentTop + contentLineHeight, descWidth, FONTS.tableBody, COLORS.text, { lineHeight: contentLineHeight });

  const numericY = contentTop + contentLineHeight;
  drawText(
    ctx,
    formatCurrency(row.unitPrice, currency),
    priceX + widths[4] - TABLE.cellPaddingX,
    numericY,
    FONTS.tableBody,
    COLORS.text,
    { align: "right" }
  );
  drawText(
    ctx,
    row.quantityLabel,
    qtyX + widths[5] - TABLE.cellPaddingX,
    numericY,
    FONTS.tableBody,
    COLORS.text,
    { align: "right" }
  );
  drawText(
    ctx,
    formatCurrency(row.amount, currency),
    amountX + widths[6] - TABLE.cellPaddingX,
    numericY,
    FONTS.tableBodyBold,
    COLORS.text,
    { align: "right" }
  );

  return rowHeight;
};

const drawSummary = (ctx, summary, currency, x, y, width) => {
  const rows = [
    { label: "Subtotal", value: formatCurrency(summary?.subtotal || 0, currency) },
    { label: `PPN ${Number(summary?.taxRate || 0)}%`, value: formatCurrency(summary?.taxAmount || 0, currency) },
    ...(summary?.feeRows || []).map((fee) => ({
      label: fee.name,
      value: formatCurrency(fee.amount || 0, currency),
    })),
    { label: "Total", value: formatCurrency(summary?.total || 0, currency), isTotal: true },
  ];

  let cursorY = y;
  const rowLineHeight = Math.round(FONTS.body.size * 1.55);
  const labelWidth = width - px(100);
  rows.forEach((row) => {
    const isTotal = row.isTotal;
    const labelLines = measureLines(ctx, row.label, labelWidth, isTotal ? FONTS.section : FONTS.body);
    const valueLines = measureLines(ctx, row.value, px(100), isTotal ? FONTS.section : FONTS.bodyBold);
    const rowHeight = Math.max(labelLines.length, valueLines.length) * rowLineHeight;
    
    if (isTotal) {
      drawLine(ctx, x, cursorY + px(4), x + width, cursorY + px(4), COLORS.line, px(0.8));
      cursorY += px(8);
    }

    drawText(ctx, row.label, x, cursorY + rowLineHeight, isTotal ? FONTS.section : FONTS.body, COLORS.muted);
    drawText(
      ctx,
      row.value,
      x + width,
      cursorY + rowLineHeight,
      isTotal ? FONTS.section : FONTS.bodyBold,
      COLORS.text,
      { align: "right" }
    );
    cursorY += rowHeight + px(2);
  });

  // Add Currency Explanation (In Words)
  const amountInWords = `${numberToWords(summary?.total || 0)} ${currency === "IDR" ? "Rupiah" : currency}`;
  const explanationY = cursorY + px(18);
  const explanationWidth = width;
  
  const wrappedExplanationHeight = measureLines(
    ctx,
    amountInWords,
    explanationWidth - px(24),
    { size: px(11), weight: 400, italic: true }
  ).length * px(14);
  
  const containerHeight = Math.max(px(32), wrappedExplanationHeight + px(16));

  drawRoundedRect(
    ctx,
    x,
    explanationY,
    explanationWidth,
    containerHeight,
    px(6),
    "#F5F5F5"
  );
  
  drawWrappedText(
    ctx,
    amountInWords,
    x + explanationWidth / 2,
    explanationY + containerHeight / 2,
    explanationWidth - px(24),
    { size: px(11), weight: 400, italic: true },
    COLORS.muted,
    { align: "center", baseline: "middle", lineHeight: px(14) }
  );

  return explanationY + containerHeight + px(8) - y;
};

const drawTextBlock = (ctx, title, paragraphs, x, y, width) => {
  drawText(ctx, title, x, y, FONTS.section, COLORS.text);
  let cursorY = y + px(16);
  const rows = paragraphs.length ? paragraphs : ["-"];
  rows.forEach((paragraph, index) => {
    cursorY += drawWrappedText(
      ctx,
      paragraph,
      x,
      cursorY,
      width,
      FONTS.body,
      COLORS.text,
      { lineHeight: Math.round(FONTS.body.size * 1.42), paragraphGap: px(2) }
    );
    if (index < rows.length - 1) {
      cursorY += px(5);
    }
  });
  return cursorY - y;
};

const drawAssignmentField = (ctx, value, x, y, width) => {
  const label = "Best Regards";
  const name = value || "-";
  const rightX = x + width;
  const labelY = y;
  const nameY = y + ASSIGNMENT_BLOCK_HEIGHT - FONTS.body.size;

  drawText(ctx, label, rightX, labelY, FONTS.bodyBold, COLORS.text, {
    align: "right",
    baseline: "top",
  });
  drawText(ctx, name, rightX, nameY, FONTS.body, COLORS.text, {
    align: "right",
    baseline: "top",
  });

  return ASSIGNMENT_BLOCK_HEIGHT;
};

const drawDisclaimer = (ctx, y, pageIndex, pageCount) => {
  const disclaimerText = "This document is issued by the merchant via Labamu. Labamu is not responsible for its content.";
  const paginationText = `Page ${pageIndex + 1} of ${pageCount}`;
  
  const marginX = DIMENSIONS.marginX;
  const footerBarHeight = px(28);
  const barY = PAGE_HEIGHT - footerBarHeight;

  // Draw black bar
  ctx.fillStyle = COLORS.blackBar;
  ctx.fillRect(0, barY, PAGE_WIDTH, footerBarHeight);

  // Draw "Powered by"
  drawText(ctx, "Powered by", marginX, barY + footerBarHeight / 2 + px(3), { size: px(8), weight: 400 }, "#FFFFFF", {
    baseline: "middle",
  });

  // Draw disclaimer centered
  drawText(ctx, disclaimerText, PAGE_WIDTH / 2, barY + footerBarHeight / 2 + px(3), { size: px(8), weight: 400 }, "#FFFFFF", {
    align: "center",
    baseline: "middle",
  });

  // Draw pagination on the right
  drawText(ctx, paginationText, PAGE_WIDTH - marginX, barY + footerBarHeight / 2 + px(3), { size: px(8), weight: 400 }, "#FFFFFF", {
    align: "right",
    baseline: "middle",
  });
};

const drawWatermark = (ctx, status) => {
  if (!status) return;

  let watermarkText = "";
  const statusLower = String(status).toLowerCase();

  if (statusLower === "rejected" || statusLower === "canceled") {
    watermarkText = "Canceled";
  } else if (statusLower === "completed") {
    watermarkText = "Completed";
  } else if (statusLower === "ready_to_send" || statusLower === "waiting for approval") {
    watermarkText = "Waiting for Approval";
  }

  if (!watermarkText) return;

  ctx.save();
  ctx.translate(PAGE_WIDTH / 2, PAGE_HEIGHT / 2);
  ctx.rotate(-Math.PI / 4);
  
  // Responsive font size based on text length
  const fontSize = watermarkText.length > 15 ? px(70) : px(100);
  ctx.font = `bold ${fontSize}px Arial, Helvetica, sans-serif`;
  ctx.fillStyle = "rgba(180, 180, 180, 0.22)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(watermarkText, 0, 0);
  ctx.restore();
};

const drawFooter = (ctx, data, footerY, pageIndex, pageCount) => {
  // Empty since company info moved to header and pagination moved to disclaimer
};

const buildPdfBlobFromCanvases = async (pages) => {
  const pageWidthPt = 595.28;
  const pageHeightPt = 841.89;
  const pageCount = pages.length;
  const totalObjects = 2 + pageCount * 3;
  const bodies = new Array(totalObjects + 1);
  bodies[1] = encodeText(`<< /Type /Catalog /Pages 2 0 R >>`);

  const kids = [];
  for (let index = 0; index < pageCount; index += 1) {
    const pageObjNum = 3 + index * 3;
    const contentObjNum = pageObjNum + 1;
    const imageObjNum = pageObjNum + 2;
    const { canvas } = pages[index];
    kids.push(`${pageObjNum} 0 R`);

    const jpegData = canvas.toDataURL("image/jpeg", 0.95);
    const jpegBytes = bytesFromDataUrl(jpegData);
    const imageBody = concatBytes([
      encodeText(
        `<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
      ),
      jpegBytes,
      encodeText(`\nendstream`),
    ]);
    bodies[imageObjNum] = imageBody;

    const contentStream = encodeText(
      `q\n${pageWidthPt} 0 0 ${pageHeightPt} 0 0 cm\n/Im${index} Do\nQ\n`
    );
    bodies[contentObjNum] = concatBytes([
      encodeText(`<< /Length ${contentStream.length} >>\nstream\n`),
      contentStream,
      encodeText(`endstream`),
    ]);

    bodies[pageObjNum] = encodeText(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidthPt} ${pageHeightPt}] /Resources << /XObject << /Im${index} ${imageObjNum} 0 R >> >> /Contents ${contentObjNum} 0 R >>`
    );
  }

  bodies[2] = encodeText(
    `<< /Type /Pages /Count ${pageCount} /Kids [${kids.join(" ")}] >>`
  );

  const chunks = [];
  const header = encodeText("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");
  chunks.push(header);
  let byteOffset = header.length;
  const offsets = new Array(totalObjects + 1).fill(0);

  for (let objNum = 1; objNum <= totalObjects; objNum += 1) {
    offsets[objNum] = byteOffset;
    const objectBytes = bodies[objNum];
    const objectStart = encodeText(`${objNum} 0 obj\n`);
    const objectEnd = encodeText(`\nendobj\n`);
    chunks.push(objectStart, objectBytes, objectEnd);
    byteOffset += objectStart.length + objectBytes.length + objectEnd.length;
  }

  const xrefOffset = byteOffset;
  let xref = `xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`;
  for (let objNum = 1; objNum <= totalObjects; objNum += 1) {
    xref += `${String(offsets[objNum]).padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  chunks.push(encodeText(xref));

  return new Blob(chunks, { type: "application/pdf" });
};

const renderPurchaseOrderPage = async ({
  data,
  assets,
  pageType,
  rows,
  isLastPage,
  pageIndex,
  pageCount,
}) => {
  const { canvas, ctx } = createCanvas();
  ctx.fillStyle = COLORS.white;
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  const contentWidth = PAGE_WIDTH - DIMENSIONS.marginX * 2;
  const tableWidth = PAGE_WIDTH - DIMENSIONS.marginX * 2;
  const widths = [
    px(32),
    px(64),
    px(180),
    contentWidth - px(576),
    px(110),
    px(80),
    px(110),
  ];

  let cursorY = await drawHeader(ctx, pageType, data, assets);

  if (pageType === "first") {
    cursorY = drawInfoColumns(ctx, data, cursorY);
    cursorY += px(8);
  }

  const tableTop = cursorY;
  drawTableHeader(ctx, DIMENSIONS.marginX, tableTop, widths);
  cursorY = tableTop + DIMENSIONS.tableHeaderHeight;

  let currentY = cursorY;
  for (const row of rows) {
    const rowHeight = await drawTableRow(
      ctx,
      row,
      DIMENSIONS.marginX,
      currentY,
      widths,
      assets,
      data.currency
    );
    currentY += rowHeight;
    drawLine(ctx, DIMENSIONS.marginX, currentY, DIMENSIONS.marginX + tableWidth, currentY, COLORS.line, px(0.8));
  }

  const tableBottom = currentY;
  // No vertical grid lines as per Image 2
  // Bottom line is already drawn by the loop for the last row, or we can ensure it here
  drawLine(ctx, DIMENSIONS.marginX, tableBottom, DIMENSIONS.marginX + tableWidth, tableBottom, COLORS.softLine, px(0.8));

  // "Showing 1-X of X products" text below table
  drawText(ctx, `Showing 1-${rows.length} of ${data.lineItems.length} products`, DIMENSIONS.marginX, tableBottom + px(24), FONTS.bodyBold, COLORS.text);

  if (isLastPage) {
    const summaryWidth = px(250);
    const summaryX = PAGE_WIDTH - DIMENSIONS.marginX - summaryWidth;
    let summaryY = tableBottom + px(16);
    summaryY += drawSummary(ctx, data.summary, data.currency, summaryX, summaryY, summaryWidth);
    summaryY += px(16);
    summaryY += drawTextBlock(ctx, "Notes", data.notesParagraphs, DIMENSIONS.marginX, summaryY, contentWidth);
    summaryY += px(10);
    summaryY += drawTextBlock(ctx, "Terms", data.termsParagraphs, DIMENSIONS.marginX, summaryY, contentWidth);
    const footerTop = PAGE_HEIGHT - DIMENSIONS.marginBottom - DIMENSIONS.footerHeight;
    const assignmentX = PAGE_WIDTH - DIMENSIONS.marginX - ASSIGNMENT_BLOCK_WIDTH;
    const assignmentY = Math.max(
      summaryY + px(14),
      footerTop - ASSIGNMENT_BLOCK_HEIGHT - ASSIGNMENT_BLOCK_GAP
    );
    drawAssignmentField(
      ctx,
      data.approvedBy,
      assignmentX,
      assignmentY,
      ASSIGNMENT_BLOCK_WIDTH
    );
  }

  drawFooter(
    ctx,
    data,
    PAGE_HEIGHT - DIMENSIONS.marginBottom - DIMENSIONS.footerHeight,
    pageIndex,
    pageCount
  );
  drawDisclaimer(ctx, PAGE_HEIGHT - px(18), pageIndex, pageCount);

  // Draw watermark last so it appears on top with transparency
  drawWatermark(ctx, data.currentStatus);

  return { canvas, ctx };
};

const planPages = (data) => {
  const measureCanvas = document.createElement("canvas");
  measureCanvas.width = PAGE_WIDTH;
  measureCanvas.height = PAGE_HEIGHT;
  const ctx = measureCanvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to measure PDF content.");
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const contentWidth = PAGE_WIDTH - DIMENSIONS.marginX * 2;
  const widths = [
    px(32),
    px(64),
    px(180),
    contentWidth - px(576),
    px(110),
    px(80),
    px(110),
  ];

  const firstHeaderHeight = measureHeaderHeight(ctx, data, "first");
  const firstInfoHeight = px(106);
  const continuationHeaderHeight = measureHeaderHeight(ctx, data, "continuation");
  const continuationTableStart = continuationHeaderHeight;
  const contentBottom = PAGE_HEIGHT - DIMENSIONS.marginBottom - DIMENSIONS.footerHeight - px(4);
  const assignmentHeight = measureAssignmentFieldHeight(
    ctx,
    data.approvedBy || "-",
    contentWidth
  );
  const reservedTrailingHeight =
    px(18) +
    measureSummaryHeight(ctx, data.summary, data.currency, px(250)) +
    px(20) +
    measureTextBlockHeight(ctx, data.notesParagraphs, contentWidth) +
    px(20) +
    measureTextBlockHeight(ctx, data.termsParagraphs, contentWidth) +
    px(18) +
    assignmentHeight +
    px(16);

  const pages = [];
  let currentPage = {
    type: "first",
    rows: [],
  };
  let currentY =
    firstHeaderHeight +
    px(8) +
    firstInfoHeight +
    DIMENSIONS.sectionGap +
    DIMENSIONS.tableHeaderHeight;
  const rowMeasure = (row) => measureLineHeight(ctx, row, widths[3]);

  data.lineItems.forEach((row, index) => {
    const rowHeight = rowMeasure(row);
    const isLastRow = index === data.lineItems.length - 1;
    const shouldBreak =
      currentY + rowHeight + (isLastRow ? reservedTrailingHeight : px(0)) > contentBottom &&
      currentPage.rows.length > 0;

    if (shouldBreak) {
      pages.push(currentPage);
      currentPage = { type: "continuation", rows: [] };
      currentY = continuationTableStart + DIMENSIONS.tableHeaderHeight;
    }

    currentPage.rows.push(row);
    currentY += rowHeight;
  });

  pages.push(currentPage);

  // ensure only the final page renders the trailing sections
  return pages.map((page, index) => ({
    ...page,
    isLastPage: index === pages.length - 1,
  }));
};

export const generatePurchaseOrderPdfBlob = async (data) => {
  if (typeof document === "undefined") {
    throw new Error("PDF export is unavailable in this environment.");
  }

  const assets = {
    logo: await loadImage(GENERIC_LOGO_SRC),
    images: {},
  };

  const pagesPlan = planPages(data);

  for (const page of pagesPlan) {
    for (const row of page.rows) {
      const src = row.image?.src;
      if (!src || assets.images[row.id]) continue;
      assets.images[row.id] = await loadImage(src);
    }
  }

  const renderedPages = [];
  for (const page of pagesPlan) {
    const rendered = await renderPurchaseOrderPage({
      data,
      assets,
      pageType: page.type,
      rows: page.rows,
      isLastPage: page.isLastPage,
      pageIndex: renderedPages.length,
      pageCount: pagesPlan.length,
    });
    renderedPages.push(rendered);
  }

  return buildPdfBlobFromCanvases(renderedPages);
};
