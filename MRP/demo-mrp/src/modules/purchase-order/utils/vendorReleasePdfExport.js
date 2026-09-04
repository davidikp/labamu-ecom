// PDF Export Version: 1.0.0 — Vendor Release Document
const GENERIC_LOGO_SRC = "https://placehold.co/400x120/f3f4f6/1f2937?text=LOGO";
const CSS_DPI = 96;
const PDF_DPI = 180;
const SCALE = PDF_DPI / CSS_DPI;

const px = (v) => Math.round(v * SCALE);

const A4_CSS_WIDTH = 794;
const A4_CSS_HEIGHT = 1123;
const PAGE_W = px(A4_CSS_WIDTH);
const PAGE_H = px(A4_CSS_HEIGHT);
const MARGIN_X = px(44);
const MARGIN_TOP = px(30);
const CONTENT_W = PAGE_W - MARGIN_X * 2;

// Colors and fonts mirrored from purchaseOrderPdfCanvasExport.js (COLORS / FONTS)
// to keep header/footer styling visually consistent across PO and Release-to-Vendor PDFs.
const C = {
  text: "#1F1F1F",
  muted: "#676767",
  light: "#888888",
  line: "#2A2A2A",
  softLine: "#B6B6B6",
  blackBar: "#1F1F1F",
  white: "#FFFFFF",
  headerFill: "#F2F2F2",
  totalFill: "#F5F5F5",
};

const F = {
  badge: { size: px(12), weight: 700 },
  companyName: { size: px(14), weight: 700 },
  meta: { size: px(11), weight: 400 },
  metaVal: { size: px(11), weight: 400 },
  metaLabel: { size: px(10), weight: 700 },
  section: { size: px(12), weight: 700 },
  vendorName: { size: px(11), weight: 700 },
  vendorSub: { size: px(11), weight: 400 },
  tableHead: { size: px(10), weight: 700 },
  tableBody: { size: px(11), weight: 400 },
  tableBodyBold: { size: px(11), weight: 700 },
  footer: { size: px(10), weight: 400 },
  disclaimer: { size: px(8), weight: 400 },
  sigLabel: { size: px(11), weight: 700 },
  sigName: { size: px(11), weight: 400 },
  tiny: { size: px(10), weight: 400 },
};

const font = ({ size, weight }) =>
  `${weight} ${size}px Arial, Helvetica, sans-serif`;

const setFont = (ctx, f) => { ctx.font = font(f); };

const fillText = (ctx, text, x, y) => ctx.fillText(String(text ?? ""), x, y);

const line = (ctx, x1, y1, x2, y2, color = C.line, width = px(0.5)) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
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

const wrapText = (ctx, text, maxWidth) => {
  const words = String(text || "").split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
};

const createCanvas = () => {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_W;
  canvas.height = PAGE_H;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = C.white;
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);
  return { canvas, ctx };
};

const encodeText = (v) => new TextEncoder().encode(String(v));
const concatBytes = (chunks) => {
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
};
const bytesFromDataUrl = (dataUrl) => {
  const b64 = String(dataUrl || "").split(",")[1] || "";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
};

const buildPdfFromCanvas = async (canvas) => {
  const pageWidthPt = 595.28;
  const pageHeightPt = 841.89;

  const jpegData = canvas.toDataURL("image/jpeg", 0.95);
  const jpegBytes = bytesFromDataUrl(jpegData);

  const imageBody = concatBytes([
    encodeText(
      `<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
    ),
    jpegBytes,
    encodeText(`\nendstream`),
  ]);

  const contentStream = encodeText(`q\n${pageWidthPt} 0 0 ${pageHeightPt} 0 0 cm\n/Im0 Do\nQ\n`);
  const contentBody = concatBytes([
    encodeText(`<< /Length ${contentStream.length} >>\nstream\n`),
    contentStream,
    encodeText(`endstream`),
  ]);

  const pageBody = encodeText(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidthPt} ${pageHeightPt}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 3 0 R >>`
  );

  const bodies = {
    1: encodeText(`<< /Type /Catalog /Pages 2 0 R >>`),
    2: encodeText(`<< /Type /Pages /Count 1 /Kids [3 0 R] >>`),
    3: contentBody,
    4: imageBody,
    5: pageBody,
  };

  // Wait — the page must reference content and image correctly
  // Re-assign: obj 3=page, obj 4=content, obj 5=image
  const bodies2 = {
    1: encodeText(`<< /Type /Catalog /Pages 2 0 R >>`),
    2: encodeText(`<< /Type /Pages /Count 1 /Kids [3 0 R] >>`),
    3: encodeText(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidthPt} ${pageHeightPt}] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>`
    ),
    4: concatBytes([
      encodeText(`<< /Length ${contentStream.length} >>\nstream\n`),
      contentStream,
      encodeText(`endstream`),
    ]),
    5: imageBody,
  };

  const totalObjects = 5;
  const chunks = [];
  const header = encodeText("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");
  chunks.push(header);
  let byteOffset = header.length;
  const offsets = new Array(totalObjects + 1).fill(0);

  for (let objNum = 1; objNum <= totalObjects; objNum++) {
    offsets[objNum] = byteOffset;
    const objectBytes = bodies2[objNum];
    const objectStart = encodeText(`${objNum} 0 obj\n`);
    const objectEnd = encodeText(`\nendobj\n`);
    chunks.push(objectStart, objectBytes, objectEnd);
    byteOffset += objectStart.length + objectBytes.length + objectEnd.length;
  }

  const xrefOffset = byteOffset;
  let xref = `xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`;
  for (let objNum = 1; objNum <= totalObjects; objNum++) {
    xref += `${String(offsets[objNum]).padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  chunks.push(encodeText(xref));

  return new Blob(chunks, { type: "application/pdf" });
};

export const generateVendorReleasePdf = async ({
  log,
  poNumber,
  vendorInfo,
  company,
  woRoutingStages,
}) => {
  const { canvas, ctx } = createCanvas();
  const logo = await loadImage(GENERIC_LOGO_SRC);

  let y = MARGIN_TOP;
  const lineH = px(16);
  const metaLabelW = px(100);
  const metaColX = PAGE_W - MARGIN_X - px(200);

  // ── Badge "RELEASE TO VENDOR" ───────────────────────────────────────────────
  // Styled after the PO's black title bar in drawHeader (labelWidth/labelHeight, blackBar fill).
  const badgeText = "RELEASE TO VENDOR";
  setFont(ctx, F.badge);
  const badgeW = ctx.measureText(badgeText).width + px(20);
  const badgeH = px(24);
  ctx.fillStyle = C.blackBar;
  ctx.fillRect(MARGIN_X, y, badgeW, badgeH);
  ctx.fillStyle = C.white;
  setFont(ctx, F.badge);
  fillText(ctx, badgeText, MARGIN_X + px(10), y + badgeH / 2 + px(4));

  // ── Logo, company name & info ──────────────────────────────────────────────
  const logoY = y + badgeH + px(20);
  const logoWidth = px(48);
  const logoHeight = px(48);
  if (logo) {
    drawImageCover(ctx, logo, MARGIN_X, logoY, logoWidth, logoHeight, "left", "contain");
  }
  ctx.fillStyle = C.text;
  setFont(ctx, F.companyName);
  fillText(ctx, company.name, MARGIN_X + logoWidth + px(16), logoY + logoHeight / 2 + px(4));

  const companyY = logoY + logoHeight + px(12);
  setFont(ctx, F.tiny);
  ctx.fillStyle = C.muted;
  fillText(ctx, company.phone, MARGIN_X, companyY);
  fillText(ctx, company.email, MARGIN_X, companyY + lineH);
  fillText(ctx, company.address, MARGIN_X, companyY + lineH * 2);

  // ── Meta block (right side) ────────────────────────────────────────────────
  // Label/value styling mirrors drawMetaBlock in the PO exporter (muted label, text value).
  const metaRows = [
    ["Release ID", log.releaseId || "-"],
    ["Released By", company?.name || "-"],
    ["Release Date", `${log.date || "-"} · ${log.time || "-"}`],
    ["Assignment ID", log.assignmentId || "-"],
    ["Purchase Order", poNumber || "-"],
    ["Work Order Ref", log.woRef || "-"],
  ];

  let metaY = y + px(4);
  for (const [label, value] of metaRows) {
    ctx.fillStyle = C.muted;
    setFont(ctx, F.metaLabel);
    fillText(ctx, label, metaColX, metaY + px(11));
    fillText(ctx, ":", metaColX + metaLabelW, metaY + px(11));
    ctx.fillStyle = C.text;
    setFont(ctx, F.metaVal);
    fillText(ctx, value, metaColX + metaLabelW + px(8), metaY + px(11));
    metaY += lineH;
  }

  y = companyY + lineH * 2 + px(20);
  y += px(14);

  // ── Vendor Information ──────────────────────────────────────────────────────
  // Stacked layout mirrored from drawInfoColumns in the PO exporter:
  // muted title, then bold name, then each contact detail on its own line.
  ctx.fillStyle = C.muted;
  setFont(ctx, F.meta);
  fillText(ctx, "Vendor Information", MARGIN_X, y + px(9));
  y += px(22);

  ctx.fillStyle = C.text;
  setFont(ctx, F.vendorName);
  fillText(ctx, vendorInfo?.name || "-", MARGIN_X, y + px(11));
  y += px(18);

  const vendorDetails = [vendorInfo?.phone, vendorInfo?.email, vendorInfo?.address].filter(Boolean);
  ctx.fillStyle = C.text;
  setFont(ctx, F.vendorSub);
  for (const detail of vendorDetails) {
    fillText(ctx, detail, MARGIN_X, y + px(11));
    y += px(14);
  }
  y += px(12);

  // ── Line Items Table ───────────────────────────────────────────────────────
  const COL_NO_W = px(28);
  const COL_QTY_W = px(80);
  const COL_ITEM_W = px(160);
  const COL_DESC_W = CONTENT_W - COL_NO_W - COL_QTY_W - COL_ITEM_W;

  // Table header styled after drawTableHeader in the PO exporter: no fill, softLine top/bottom rules.
  const tableHeaderY = y;
  const tableHeaderH = px(24);
  line(ctx, MARGIN_X, tableHeaderY, PAGE_W - MARGIN_X, tableHeaderY, C.softLine, px(0.8));

  setFont(ctx, F.tableHead);
  ctx.fillStyle = C.text;
  const colXNo = MARGIN_X + px(8);
  const colXItem = MARGIN_X + COL_NO_W + px(4);
  const colXDesc = colXItem + COL_ITEM_W + px(4);
  const colXQty = PAGE_W - MARGIN_X - COL_QTY_W;
  const headerTextY = tableHeaderY + tableHeaderH / 2 + px(4);
  fillText(ctx, "No", colXNo, headerTextY);
  fillText(ctx, "Item", colXItem, headerTextY);
  fillText(ctx, "Description", colXDesc, headerTextY);
  fillText(ctx, "Qty Released", colXQty, headerTextY);
  line(ctx, MARGIN_X, tableHeaderY + tableHeaderH, PAGE_W - MARGIN_X, tableHeaderY + tableHeaderH, C.softLine, px(0.8));
  y += tableHeaderH;

  // Build routing stage names
  const stageNames = (log.outsourceSteps || []).map((step) => {
    const stage = (woRoutingStages || []).find((s) => s.step === step);
    return stage
      ? `- Step ${step}: ${stage.route}${stage.op ? ` - ${stage.op}` : ""}`
      : `- Step ${step}`;
  });

  const descLines = [
    `Released from ${log.woRef || "-"} with assignment ${log.assignmentId || "-"}. Items handed over to vendor for the following routing stages:`,
    ...stageNames,
  ];

  // measure desc text height
  setFont(ctx, F.tableBody);
  let descHeight = 0;
  const descMaxW = COL_DESC_W - px(8);
  const wrappedDescLines = [];
  for (const dl of descLines) {
    const wrapped = wrapText(ctx, dl, descMaxW);
    wrappedDescLines.push(...wrapped);
  }
  descHeight = wrappedDescLines.length * px(14) + px(16);

  // item name + code block height
  setFont(ctx, F.tableBodyBold);
  const itemWrapped = wrapText(ctx, log.item || "-", COL_ITEM_W - px(8));
  const itemH = itemWrapped.length * px(14) + px(14);

  const rowH = Math.max(descHeight, itemH, px(40));

  // row background
  ctx.fillStyle = C.white;
  ctx.fillRect(MARGIN_X, y, CONTENT_W, rowH);
  line(ctx, MARGIN_X, y + rowH, PAGE_W - MARGIN_X, y + rowH);

  const rowTextY = y + px(12);

  // No
  ctx.fillStyle = C.text;
  setFont(ctx, F.tableBody);
  fillText(ctx, "1", colXNo, rowTextY);

  // Item name + code
  setFont(ctx, F.tableBodyBold);
  ctx.fillStyle = C.text;
  let itemY = rowTextY;
  for (const il of itemWrapped) {
    fillText(ctx, il, colXItem, itemY);
    itemY += px(14);
  }

  // code in brand color
  const itemCode = log.itemCode || "";
  if (itemCode) {
    ctx.fillStyle = "#1A73E8";
    setFont(ctx, F.tableBody);
    fillText(ctx, itemCode, colXItem, itemY);
  }

  // Description
  setFont(ctx, F.tableBody);
  ctx.fillStyle = C.text;
  let dY = rowTextY;
  for (const dl of wrappedDescLines) {
    fillText(ctx, dl, colXDesc, dY);
    dY += px(14);
  }

  // Qty
  ctx.fillStyle = C.text;
  setFont(ctx, F.tableBodyBold);
  fillText(ctx, `${log.amount || 0} pcs`, colXQty, rowTextY);

  y += rowH + px(12);
  y += px(16);

  // ── Notes ─────────────────────────────────────────────────────────────────
  ctx.fillStyle = C.muted;
  setFont(ctx, F.section);
  fillText(ctx, "Notes", MARGIN_X, y + px(9));
  y += px(18);

  ctx.fillStyle = C.text;
  setFont(ctx, F.tableBody);
  const noteLines = wrapText(ctx, log.note || "-", CONTENT_W - px(8));
  for (const nl of noteLines) {
    fillText(ctx, nl, MARGIN_X, y + px(10));
    y += px(14);
  }
  y += px(6);
  y += px(40);

  // ── Spacer then signature block (right-aligned) ────────────────────────────
  const sigY = Math.max(y, PAGE_H - px(160));
  const sigBlockY = sigY + px(24);

  const sigLineW = px(180);
  const sigGap = px(40);
  const rightSigX = PAGE_W - MARGIN_X - sigLineW;
  const leftSigX = rightSigX - sigGap - sigLineW;

  // Left: Released By
  ctx.fillStyle = C.text;
  setFont(ctx, F.sigLabel);
  fillText(ctx, "Released By", leftSigX, sigBlockY);
  line(ctx, leftSigX, sigBlockY + px(40), leftSigX + sigLineW, sigBlockY + px(40));
  ctx.fillStyle = C.text;
  setFont(ctx, F.sigName);
  fillText(ctx, company?.name || "-", leftSigX, sigBlockY + px(54));

  // Right: Received By
  ctx.fillStyle = C.text;
  setFont(ctx, F.sigLabel);
  fillText(ctx, "Received By", rightSigX, sigBlockY);
  line(ctx, rightSigX, sigBlockY + px(40), rightSigX + sigLineW, sigBlockY + px(40));
  ctx.fillStyle = C.text;
  setFont(ctx, F.sigName);
  fillText(ctx, vendorInfo?.name || "-", rightSigX, sigBlockY + px(54));

  // ── Bottom footer bar ──────────────────────────────────────────────────────
  // Styled after drawDisclaimer in the PO exporter: solid black bar with
  // "Powered by" (left), disclaimer (centered), pagination (right).
  const footerBarHeight = px(28);
  const barY = PAGE_H - footerBarHeight;
  const footerTextY = barY + footerBarHeight / 2 + px(3);
  ctx.fillStyle = C.blackBar;
  ctx.fillRect(0, barY, PAGE_W, footerBarHeight);

  setFont(ctx, F.disclaimer);
  ctx.fillStyle = C.white;
  ctx.textAlign = "left";
  fillText(ctx, "Powered by", MARGIN_X, footerTextY);

  ctx.textAlign = "center";
  fillText(
    ctx,
    "This document is issued by the merchant via Labamu. Labamu is not responsible for its content.",
    PAGE_W / 2,
    footerTextY
  );

  ctx.textAlign = "right";
  fillText(ctx, "Page 1 of 1", PAGE_W - MARGIN_X, footerTextY);
  ctx.textAlign = "left";

  return buildPdfFromCanvas(canvas);
};

export const downloadVendorReleasePdf = async (params) => {
  const blob = await generateVendorReleasePdf(params);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${params.log?.releaseId || "release"}_Release_to_Vendor.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
