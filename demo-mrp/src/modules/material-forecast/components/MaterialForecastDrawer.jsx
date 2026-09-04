import React, { useState, useEffect, useRef } from "react";
import { CloseIcon, ChevronDownIcon, ChevronRightIcon, Info, AddIcon, DocumentIcon } from "../../../components/icons/Icons.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { MOCK_PROCUREMENT_STATUS } from "../mock/materialForecastMocks.js";
import { formatNumberWithCommas } from "../../../utils/format/formatUtils.js";

// ── Date helpers ───────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const getMondayOfCurrentWeek = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const getISOWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
};

const fmtShort = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
const fmtHeader = (d) => `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;

const getWeekDates = (weekOffset) => {
  const monday = getMondayOfCurrentWeek();
  monday.setDate(monday.getDate() + (weekOffset || 0) * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const getMonthDates = (monthIndex, year) => {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => new Date(year, monthIndex, i + 1));
};

const computeDailyData = (demand, endStock, workOrders, purchaseOrders) => {
  const dailyDemand = Array(7).fill(0);
  if (workOrders && workOrders.length > 0) {
    workOrders.forEach(wo => {
      const d = wo.estimatedStartDayOffset;
      if (d >= 0 && d < 7) dailyDemand[d] += (wo.qty || 0);
    });
  } else {
    const total = parseInt(demand, 10) || 0;
    const daily = Math.floor(total / 7);
    const rem = total % 7;
    for (let i = 0; i < 7; i++) dailyDemand[i] = daily + (i === 0 ? rem : 0);
  }

  const dailyIncoming = Array(7).fill(0);
  if (purchaseOrders && purchaseOrders.length > 0) {
    purchaseOrders.forEach(po => {
      const arrDay = po.estimatedArrivalDayOffset;
      if (arrDay != null && arrDay >= 0 && arrDay < 6) {
        dailyIncoming[arrDay + 1] += (po.qty || 0);
      }
    });
  }

  const woTotal = dailyDemand.reduce((s, d) => s + d, 0);
  let stock = (parseInt(endStock, 10) || 0) + woTotal;
  return Array.from({ length: 7 }, (_, i) => {
    stock += dailyIncoming[i];
    stock -= dailyDemand[i];
    return { demand: dailyDemand[i], stock };
  });
};

const computeMonthDailyData = (demand, endStock, workOrders, daysInMonth) => {
  const dailyDemand = Array(daysInMonth).fill(0);
  if (workOrders && workOrders.length > 0) {
    workOrders.forEach(wo => {
      const d = (wo._dayOfMonth || 1) - 1; // 0-indexed
      if (d >= 0 && d < daysInMonth) dailyDemand[d] += (wo.qty || 0);
    });
  } else {
    const total = parseInt(demand, 10) || 0;
    const daily = Math.floor(total / daysInMonth);
    const rem = total % daysInMonth;
    for (let i = 0; i < daysInMonth; i++) dailyDemand[i] = daily + (i === 0 ? rem : 0);
  }
  const woTotal = dailyDemand.reduce((s, d) => s + d, 0);
  let stock = (parseInt(endStock, 10) || 0) + woTotal;
  return Array.from({ length: daysInMonth }, (_, i) => {
    stock -= dailyDemand[i];
    return { demand: dailyDemand[i], stock };
  });
};

// ── Layout constants ───────────────────────────────────────────────────────────

const LABEL_W = 230;
const DATE_W = 108;
const MONTH_DATE_W = 90;

// ── Design-system link style (matches WorkOrderDetailPage PO value links) ─────

const LinkText = ({ children, href }) => (
  <span
    onClick={() => window.open(href, "_blank")}
    style={{
      color: "var(--feature-brand-primary)",
      cursor: "pointer",
      textDecoration: "underline",
      fontSize: "var(--text-title-3)",
    }}
  >
    {children}
  </span>
);

// ── Sub-components ─────────────────────────────────────────────────────────────

const LabelValue = ({ label, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>{label}</span>
    <div style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{value}</div>
  </div>
);

const Tag = ({ children, bg, color }) => (
  <div style={{
    padding: "3px 6px",
    borderRadius: "4px",
    background: bg,
    color: color,
    fontSize: "11px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    lineHeight: "1.5",
    textAlign: "center",
  }}>
    {children}
  </div>
);

const ChevronBtn = ({ expanded, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "2px",
      color: "var(--neutral-on-surface-secondary)",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
    }}
  >
    {expanded ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
  </button>
);

// ── Table cell styles (aligned with poReferenceTable* design system) ───────────

const ROW_BORDER = "1px solid var(--neutral-line-separator-1)";

const labelCellStyle = (paddingLeft = "12px") => ({
  width: LABEL_W,
  flexShrink: 0,
  borderRight: ROW_BORDER,
  padding: `0 12px 0 ${paddingLeft}`,
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  minHeight: "49px",
});

const dateCellStyle = (extra = {}, isLast = false) => ({
  width: DATE_W,
  flexShrink: 0,
  borderRight: isLast ? "none" : ROW_BORDER,
  padding: "8px 4px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "3px",
  boxSizing: "border-box",
  ...extra,
});

// ── Rows ───────────────────────────────────────────────────────────────────────

const HeaderRow = ({ dates }) => (
  <div style={{ display: "flex", background: "var(--neutral-surface-primary)", borderBottom: ROW_BORDER, position: "sticky", top: 0, zIndex: 2 }}>
    <div style={{ width: LABEL_W, flexShrink: 0, borderRight: ROW_BORDER, minHeight: "49px", boxSizing: "border-box" }} />
    {dates.map((d, i) => (
      <div
        key={i}
        style={{
          ...dateCellStyle({
            minHeight: "49px",
            fontSize: "var(--text-title-3)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--neutral-on-surface-primary)",
            textAlign: "center",
          }, i === 6),
        }}
      >
        {fmtHeader(d)}
      </div>
    ))}
  </div>
);

const DemandRow = ({ dailyData, weeklyDemand, expanded, onToggle }) => (
  <div style={{ display: "flex", borderBottom: ROW_BORDER, background: "var(--neutral-surface-primary)", minHeight: "64px" }}>
    <div style={{ ...labelCellStyle(), minHeight: "64px" }}>
      <ChevronBtn expanded={expanded} onClick={onToggle} />
      <div>
        <div style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Demand</div>
        <div style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", marginTop: "2px" }}>Total: {formatNumberWithCommas(weeklyDemand)}</div>
      </div>
    </div>
    {dailyData.map((row, i) => (
      <div key={i} style={dateCellStyle({ minHeight: "64px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }, i === 6)}>
        {formatNumberWithCommas(row.demand)}
      </div>
    ))}
  </div>
);

const WoSubRow = ({ wo, hasBatch, shortfall }) => (
  <div style={{ display: "flex", borderBottom: ROW_BORDER, background: "var(--neutral-surface-primary)", minHeight: "64px" }}>
    <div style={{ ...labelCellStyle("44px"), minHeight: "64px", alignItems: "flex-start", paddingTop: "12px", paddingBottom: "12px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-semi-bold)", color: "var(--neutral-on-surface-primary)" }}>
          {wo.productName}
        </span>
        <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>{wo.customerName}</span>
        <LinkText href={`/work-order/${wo.id}`}>{wo.id}</LinkText>
        {wo.isSlipped && wo.originalEstimatedStartDate && (
          <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>
            Delayed {wo.slippedDays}d, Originally: {wo.originalEstimatedStartDate}
          </span>
        )}
      </div>
    </div>
    {Array.from({ length: 7 }, (_, i) => (
      <div key={i} style={dateCellStyle({ minHeight: "64px" }, i === 6)}>
        {wo.estimatedStartDayOffset === i && (
          <>
            <Tag
              bg={wo.isSlipped ? "var(--status-red-container)" : "var(--status-green-container)"}
              color={wo.isSlipped ? "var(--status-red-primary)" : "var(--status-green-primary)"}
            >
              <div>{wo.isSlipped ? "Carried Over" : wo.isStarted ? "Started" : "Est. Start"}</div>
              <div>{wo.qty} pcs</div>
            </Tag>
            {!hasBatch && (
              <span style={{ fontSize: "10px", color: "var(--neutral-on-surface-tertiary)", fontStyle: "italic", textAlign: "center" }}>
                No batch assigned
              </span>
            )}
            {hasBatch && shortfall > 0 && (
              <span style={{ fontSize: "10px", color: "var(--status-red-primary)", textAlign: "center" }}>
                {shortfall} pcs not covered
              </span>
            )}
          </>
        )}
      </div>
    ))}
  </div>
);

const StockRow = ({ dailyData, initialStock, expanded, onToggle }) => (
  <div style={{ display: "flex", borderBottom: ROW_BORDER, background: "var(--neutral-surface-primary)", minHeight: "64px" }}>
    <div style={{ ...labelCellStyle(), minHeight: "64px" }}>
      <ChevronBtn expanded={expanded} onClick={onToggle} />
      <div>
        <div style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Stock</div>
        <div style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", marginTop: "2px" }}>Initial: {formatNumberWithCommas(initialStock)}</div>
      </div>
    </div>
    {dailyData.map((row, i) => (
      <div key={i} style={dateCellStyle({ minHeight: "64px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: row.stock < 0 ? "var(--status-red-primary)" : "var(--status-green-primary)" }, i === 6)}>
        {formatNumberWithCommas(row.stock)}
      </div>
    ))}
  </div>
);

const BatchSubRow = ({ batch }) => (
  <div style={{ display: "flex", borderBottom: ROW_BORDER, background: "var(--neutral-surface-primary)", minHeight: "64px" }}>
    <div style={{ ...labelCellStyle("44px"), minHeight: "64px", alignItems: "flex-start", paddingTop: "12px", paddingBottom: "12px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <LinkText href={`/batch/${batch.batchId}`}>{batch.batchId}</LinkText>
        {batch.totalStock != null && (
          <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
            Initial: {batch.totalStock} pcs
            {(!batch.consumptions || batch.consumptions.length === 0) && !batch.poId && (
              <span style={{ color: "var(--neutral-on-surface-tertiary)", fontStyle: "italic" }}> · No WO assigned</span>
            )}
          </span>
        )}
        {batch.poId && (
          <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
            +{batch.poQty} from{" "}
            <LinkText href={`/purchase-order/${batch.poId}`}>{batch.poId}</LinkText>
          </span>
        )}
      </div>
    </div>
    {Array.from({ length: 7 }, (_, i) => {
      const consumed = (batch.consumptions || []).filter(c => c.dayOffset === i);
      const isArrival = batch.poEstimatedArrivalDayOffset === i;
      return (
        <div key={i} style={dateCellStyle({ minHeight: "64px" }, i === 6)}>
          {isArrival && (
            <Tag bg="var(--status-green-container)" color="var(--status-green-primary)">
              <div>Est. Arrival</div>
              {batch.poQty != null && <div>{batch.poQty} pcs</div>}
            </Tag>
          )}
          {consumed.map((c, ci) => (
            <Tag key={ci} bg="#FFF3E0" color="var(--status-orange-primary)">
              <div>{c.qty} pcs</div>
              <div>{c.woId}</div>
            </Tag>
          ))}
        </div>
      );
    })}
  </div>
);

// ── Month-view rows ────────────────────────────────────────────────────────────

// Right-side scroll shadow to indicate horizontal scrollability.
const monthLabelShadow = (scrolled) => scrolled
  ? "4px 0 8px -4px rgba(0,0,0,0.12)"
  : "none";

const MONTH_LABEL_STICKY = { position: "sticky", left: 0, zIndex: 3, background: "var(--neutral-surface-primary)" };

const MonthHeaderRow = ({ dates, leftShadow }) => {
  // Group consecutive dates by ISO week number
  const weekGroups = [];
  dates.forEach((d) => {
    const wn = getISOWeekNumber(d);
    const last = weekGroups[weekGroups.length - 1];
    if (last && last.weekNum === wn) {
      last.count += 1;
    } else {
      weekGroups.push({ weekNum: wn, count: 1 });
    }
  });

  return (
    <div style={{ background: "var(--neutral-surface-primary)", position: "sticky", top: 0, zIndex: 4 }}>
      {/* Week group row */}
      <div style={{ display: "flex", borderBottom: ROW_BORDER }}>
        <div style={{ width: LABEL_W, flexShrink: 0, borderRight: ROW_BORDER, minHeight: "30px", boxSizing: "border-box", ...MONTH_LABEL_STICKY, zIndex: 5, boxShadow: leftShadow, transition: "box-shadow 0.2s ease" }} />
        {weekGroups.map((wg, wi) => (
          <div key={wg.weekNum} style={{
            width: wg.count * MONTH_DATE_W, flexShrink: 0,
            borderRight: wi === weekGroups.length - 1 ? "none" : ROW_BORDER,
            minHeight: "30px", display: "flex", alignItems: "center", justifyContent: "center",
            boxSizing: "border-box",
            background: "var(--neutral-surface-primary)",
          }}>
            <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-semi-bold)", color: "var(--neutral-on-surface-secondary)", whiteSpace: "nowrap" }}>
              Week {wg.weekNum}
            </span>
          </div>
        ))}
      </div>
      {/* Day header row */}
      <div style={{ display: "flex", borderBottom: ROW_BORDER }}>
        <div style={{ width: LABEL_W, flexShrink: 0, borderRight: ROW_BORDER, minHeight: "49px", boxSizing: "border-box", ...MONTH_LABEL_STICKY, zIndex: 5, boxShadow: leftShadow, transition: "box-shadow 0.2s ease" }} />
        {dates.map((d, i) => (
          <div key={i} style={{ width: MONTH_DATE_W, flexShrink: 0, borderRight: i === dates.length - 1 ? "none" : ROW_BORDER, minHeight: "49px", padding: "0 4px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
            <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", whiteSpace: "nowrap" }}>
              {DAYS[d.getDay()]}, {MONTHS[d.getMonth()]} {d.getDate()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MonthDemandRow = ({ dailyData, totalDemand, expanded, onToggle, leftShadow }) => (
  <div style={{ display: "flex", borderBottom: ROW_BORDER, background: "var(--neutral-surface-primary)", minHeight: "64px" }}>
    <div style={{ ...labelCellStyle(), minHeight: "64px", alignSelf: "stretch", ...MONTH_LABEL_STICKY, boxShadow: leftShadow, transition: "box-shadow 0.2s ease" }}>
      <ChevronBtn expanded={expanded} onClick={onToggle} />
      <div>
        <div style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Demand</div>
        <div style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", marginTop: "2px" }}>Total: {formatNumberWithCommas(totalDemand)}</div>
      </div>
    </div>
    {dailyData.map((row, i) => (
      <div key={i} style={{ width: MONTH_DATE_W, flexShrink: 0, borderRight: i === dailyData.length - 1 ? "none" : ROW_BORDER, minHeight: "64px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", boxSizing: "border-box" }}>
        {row.demand > 0 ? formatNumberWithCommas(row.demand) : <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>0</span>}
      </div>
    ))}
  </div>
);

const MonthWoSubRow = ({ wo, daysInMonth, leftShadow }) => (
  <div style={{ display: "flex", borderBottom: ROW_BORDER, background: "var(--neutral-surface-primary)", minHeight: "64px" }}>
    <div style={{ ...labelCellStyle("44px"), minHeight: "64px", alignSelf: "stretch", alignItems: "flex-start", paddingTop: "12px", paddingBottom: "12px", ...MONTH_LABEL_STICKY, boxShadow: leftShadow, transition: "box-shadow 0.2s ease" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-semi-bold)", color: "var(--neutral-on-surface-primary)" }}>{wo.productName}</span>
        <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>{wo.customerName}</span>
        <LinkText href={`/work-order/${wo.id}`}>{wo.id}</LinkText>
      </div>
    </div>
    {Array.from({ length: daysInMonth }, (_, i) => (
      <div key={i} style={{ width: MONTH_DATE_W, flexShrink: 0, borderRight: i === daysInMonth - 1 ? "none" : ROW_BORDER, minHeight: "64px", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
        {wo._dayOfMonth === i + 1 && (
          <Tag bg={wo.isSlipped ? "var(--status-red-container)" : "var(--status-green-container)"} color={wo.isSlipped ? "var(--status-red-primary)" : "var(--status-green-primary)"}>
            <div>{wo.isSlipped ? "Carried Over" : wo.isStarted ? "Started" : "Est. Start"}</div>
            <div>{wo.qty} pcs</div>
          </Tag>
        )}
      </div>
    ))}
  </div>
);

const MonthStockRow = ({ dailyData, initialStock, expanded, onToggle, leftShadow }) => (
  <div style={{ display: "flex", borderBottom: ROW_BORDER, background: "var(--neutral-surface-primary)", minHeight: "64px" }}>
    <div style={{ ...labelCellStyle(), minHeight: "64px", alignSelf: "stretch", ...MONTH_LABEL_STICKY, boxShadow: leftShadow, transition: "box-shadow 0.2s ease" }}>
      <ChevronBtn expanded={expanded} onClick={onToggle} />
      <div>
        <div style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Stock</div>
        <div style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", marginTop: "2px" }}>Initial: {formatNumberWithCommas(initialStock)}</div>
      </div>
    </div>
    {dailyData.map((row, i) => (
      <div key={i} style={{ width: MONTH_DATE_W, flexShrink: 0, borderRight: i === dailyData.length - 1 ? "none" : ROW_BORDER, minHeight: "64px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: row.stock < 0 ? "var(--status-red-primary)" : "var(--status-green-primary)", boxSizing: "border-box" }}>
        {formatNumberWithCommas(row.stock)}
      </div>
    ))}
  </div>
);

const MonthBatchSubRow = ({ batch, daysInMonth, leftShadow }) => (
  <div style={{ display: "flex", borderBottom: ROW_BORDER, background: "var(--neutral-surface-primary)", minHeight: "64px" }}>
    <div style={{ ...labelCellStyle("44px"), minHeight: "64px", alignSelf: "stretch", alignItems: "flex-start", paddingTop: "12px", paddingBottom: "12px", ...MONTH_LABEL_STICKY, boxShadow: leftShadow, transition: "box-shadow 0.2s ease" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <LinkText href={`/batch/${batch.batchId}`}>{batch.batchId}</LinkText>
        {batch.totalStock != null && (
          <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
            Initial: {batch.totalStock} pcs
            {(!batch.consumptions || batch.consumptions.length === 0) && !batch.poId && (
              <span style={{ color: "var(--neutral-on-surface-tertiary)", fontStyle: "italic" }}> · No WO assigned</span>
            )}
          </span>
        )}
        {batch.poId && (
          <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
            +{batch.poQty} from <LinkText href={`/purchase-order/${batch.poId}`}>{batch.poId}</LinkText>
          </span>
        )}
      </div>
    </div>
    {Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const consumed = (batch.consumptions || []).filter(c => c._dayOfMonth === dayNum);
      const isArrival = batch._arrivalDayOfMonth === dayNum;
      return (
        <div key={i} style={{ width: MONTH_DATE_W, flexShrink: 0, borderRight: i === daysInMonth - 1 ? "none" : ROW_BORDER, minHeight: "64px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", boxSizing: "border-box" }}>
          {isArrival && (
            <Tag bg="var(--status-green-container)" color="var(--status-green-primary)">
              <div>Est. Arrival</div>
              {batch.poQty != null && <div>{batch.poQty} pcs</div>}
            </Tag>
          )}
          {consumed.map((c, ci) => (
            <Tag key={ci} bg="#FFF3E0" color="var(--status-orange-primary)">
              <div>{c.qty} pcs</div>
              <div>{c.woId}</div>
            </Tag>
          ))}
        </div>
      );
    })}
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────

export const MaterialForecastDrawer = ({ isOpen, onClose, onCreatePo, onSelectExistingPo, selectedCell, urgencyDaysInAdvance = 5, timelineView = "week", pageFilters = {} }) => {
  const [demandExpanded, setDemandExpanded] = useState(false);
  const [stockExpanded, setStockExpanded] = useState(false);
  const [poMenuOpen, setPoMenuOpen] = useState(false);
  const [poMenuPos, setPoMenuPos] = useState({ bottom: null, top: null, left: 0 });
  const monthScrollRef = useRef(null);
  const [monthScrolled, setMonthScrolled] = useState(false);

  const handleMonthScroll = () => {
    if (monthScrollRef.current) {
      setMonthScrolled(monthScrollRef.current.scrollLeft > 0);
    }
  };

  useEffect(() => {
    setDemandExpanded(false);
    setStockExpanded(false);
    setMonthScrolled(false);
  }, [selectedCell?.sku, selectedCell?.weekOffset]);

  if (!isOpen || !selectedCell) return null;

  const isMonthView = timelineView === "month";
  const isMaterialDetail = selectedCell.week === "Material Detail";

  // Month view variables
  const monthIndex = selectedCell._monthIndex ?? 0;
  const monthYear = selectedCell._year ?? new Date().getFullYear();
  const monthDates = isMonthView ? getMonthDates(monthIndex, monthYear) : null;
  const daysInMonth = monthDates ? monthDates.length : 0;
  const monthLastDay = daysInMonth;
  const fmtIso = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const monthRangeLabel = isMonthView
    ? `${monthYear}-${String(monthIndex + 1).padStart(2, "0")}-01 – ${monthYear}-${String(monthIndex + 1).padStart(2, "0")}-${String(monthLastDay).padStart(2, "0")}`
    : null;

  // Week view variables
  const dates = getWeekDates(selectedCell.weekOffset);
  const weekNumber = getISOWeekNumber(dates[0]);
  const year = dates[0].getFullYear();
  const rangeLabel = `${fmtIso(dates[0])} – ${fmtIso(dates[6])}`;

  const allWorkOrders = selectedCell.workOrders || [];
  const workOrders = allWorkOrders.filter(wo => {
    const pgOrderIds  = pageFilters.orderIds  || [];
    const pgCustomers = pageFilters.customers || [];
    const pgProducts  = pageFilters.products  || [];
    const pgWoIds     = pageFilters.woIds     || [];
    if (pgOrderIds.length  > 0 && !pgOrderIds.includes(wo.orderId))      return false;
    if (pgCustomers.length > 0 && !pgCustomers.includes(wo.customerName)) return false;
    if (pgProducts.length  > 0 && !pgProducts.includes(wo.productName))   return false;
    if (pgWoIds.length     > 0 && !pgWoIds.includes(wo.id))               return false;
    return true;
  });
  const batches = selectedCell.batches || [];
  const purchaseOrders = selectedCell.purchaseOrders || [];

  const totalDemand = workOrders.length > 0
    ? workOrders.reduce((s, wo) => s + (wo.qty || 0), 0)
    : (parseInt(selectedCell.demand, 10) || 0);
  const endStock = parseInt(selectedCell.endStock, 10) || 0;
  const initialStock = endStock + totalDemand;

  const dailyData = isMonthView
    ? computeMonthDailyData(selectedCell.demand, selectedCell.endStock, workOrders, daysInMonth)
    : computeDailyData(selectedCell.demand, selectedCell.endStock, workOrders, purchaseOrders);

  const woIdsWithBatch = new Set(batches.flatMap(b => (b.consumptions || []).map(c => c.woId)));
  const woCoveredQty = {};
  batches.forEach(b => (b.consumptions || []).forEach(c => {
    woCoveredQty[c.woId] = (woCoveredQty[c.woId] || 0) + c.qty;
  }));
  const stockSubRows = batches;

  const hasNegativeStock = endStock < 0 || dailyData.some(r => r.stock < 0);
  const tableMinWidth = isMonthView ? LABEL_W + daysInMonth * MONTH_DATE_W : LABEL_W + 7 * DATE_W;

  const procStatus = MOCK_PROCUREMENT_STATUS[selectedCell.sku];
  const isFirstNegWeek = procStatus && selectedCell.weekOffset === procStatus.firstNegativeWeekOffset;
  const isUrgentToBuy = isFirstNegWeek && procStatus.status !== "ok" && procStatus.daysUntilDemand <= urgencyDaysInAdvance;
  const showOverdueAlert  = isUrgentToBuy && procStatus.status === "overdue" && procStatus.affectedWoIds.length > 0;
  const showUrgentAlert   = isUrgentToBuy && procStatus.status === "urgent";
  const showThisWeekAlert = isUrgentToBuy && procStatus.status === "this_week";
  const showConsequenceAlert = showOverdueAlert || showUrgentAlert || showThisWeekAlert;

  const leftShadow = isMonthView ? monthLabelShadow(monthScrolled) : "none";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.28)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 20000,
        opacity: isOpen ? 1 : 0,
        transition: "opacity 0.2s ease-in-out",
        pointerEvents: isOpen ? "auto" : "none",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "1040px",
          background: "var(--neutral-surface-primary)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "24px", borderBottom: ROW_BORDER, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
            Planning Breakdown
          </span>
          <IconButton icon={CloseIcon} onClick={onClose} size="small" color="var(--neutral-on-surface-primary)" />
        </div>

        {/* Info row — outside scroll container so it's always visible */}
        <div style={{ padding: "16px 24px", flexShrink: 0 }}>
          <div style={{ padding: "16px", borderRadius: "var(--radius-card)", border: ROW_BORDER, display: "flex", gap: "24px" }}>
            <LabelValue label="Material Name" value={selectedCell.materialName} />
            <LabelValue
              label="Material SKU"
              value={<LinkText href={`/materials/${selectedCell.sku}`}>{selectedCell.sku}</LinkText>}
            />
            {isMonthView
              ? <LabelValue label="Month" value={selectedCell.week} />
              : <LabelValue label="Week" value={`W${weekNumber}`} />
            }
            <LabelValue label="Date Range" value={isMonthView ? monthRangeLabel : rangeLabel} />
          </div>
        </div>

        {/* Procurement alert — shown on first negative stock week within urgency threshold */}
        {showConsequenceAlert && (() => {
          const woIds = procStatus.affectedWoIds?.length > 0
            ? procStatus.affectedWoIds.join(", ")
            : (selectedCell.workOrders?.map(wo => wo.id).join(", ") || "related work orders");

          return (
            <div style={{ padding: "0 24px 12px", flexShrink: 0 }}>
              <div style={{
                width: "100%", background: "var(--status-red-container)", borderRadius: "12px",
                padding: "16px 20px", display: "flex", gap: "16px",
                alignItems: "flex-start", boxSizing: "border-box",
              }}>
                <div style={{ marginTop: "2px", flexShrink: 0 }}>
                  <Info size={20} color="var(--status-red-primary)" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-semi-bold)", color: "var(--status-red-primary)" }}>
                    Urgent to Buy
                  </span>
                  <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)", lineHeight: "1.6" }}>
                    Current stock cannot fulfill demand for <strong>{woIds}</strong>. Purchase these materials soon to keep production on schedule.
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Scrollable table area — week view */}
        {!isMaterialDetail && !isMonthView && (
          <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "0 24px 24px" }}>
            <div style={{ minWidth: `${tableMinWidth}px` }}>
              <HeaderRow dates={dates} />

              <DemandRow
                dailyData={dailyData}
                weeklyDemand={totalDemand}
                expanded={demandExpanded}
                onToggle={() => setDemandExpanded(v => !v)}
              />
              {demandExpanded && workOrders.map((wo) => {
                const covered = woCoveredQty[wo.id] || 0;
                const shortfall = woIdsWithBatch.has(wo.id) ? Math.max(0, wo.qty - covered) : 0;
                return <WoSubRow key={wo.id} wo={wo} hasBatch={woIdsWithBatch.has(wo.id)} shortfall={shortfall} />;
              })}

              <StockRow
                dailyData={dailyData}
                initialStock={initialStock}
                expanded={stockExpanded}
                onToggle={() => setStockExpanded(v => !v)}
              />
              {stockExpanded && stockSubRows.map((batch) => (
                <BatchSubRow key={batch.batchId} batch={batch} />
              ))}
            </div>
          </div>
        )}

        {/* Scrollable table area — month view
            Outer div clips at 24px from drawer edge; inner div owns overflow-x so the
            sticky label column's left:0 coincides with that clip boundary, preventing
            date-column borders from bleeding into the left padding gap. */}
        {!isMaterialDetail && isMonthView && (
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden", paddingLeft: "24px", display: "flex", flexDirection: "column" }}>
            <div
              ref={monthScrollRef}
              onScroll={handleMonthScroll}
              style={{ flex: 1, minHeight: 0, overflow: "auto", paddingRight: "24px", paddingBottom: "24px" }}
            >
              <div style={{ minWidth: `${tableMinWidth}px` }}>
                <MonthHeaderRow dates={monthDates} leftShadow={leftShadow} />

                <MonthDemandRow
                  dailyData={dailyData}
                  totalDemand={totalDemand}
                  expanded={demandExpanded}
                  onToggle={() => setDemandExpanded(v => !v)}
                  leftShadow={leftShadow}
                />
                {demandExpanded && workOrders.map((wo) => (
                  <MonthWoSubRow key={wo.id} wo={wo} daysInMonth={daysInMonth} leftShadow={leftShadow} />
                ))}

                <MonthStockRow
                  dailyData={dailyData}
                  initialStock={initialStock}
                  expanded={stockExpanded}
                  onToggle={() => setStockExpanded(v => !v)}
                  leftShadow={leftShadow}
                />
                {stockExpanded && stockSubRows.map((batch) => (
                  <MonthBatchSubRow key={batch.batchId} batch={batch} daysInMonth={daysInMonth} leftShadow={leftShadow} />
                ))}
              </div>
            </div>
          </div>
        )}

        {isMaterialDetail && (
          <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--neutral-on-surface-secondary)" }}>
            Detail view for specific material will be defined later.
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: ROW_BORDER, flexShrink: 0, position: "relative" }}>
          <Button
            variant="filled"
            size="large"
            disabled={!hasNegativeStock}
            rightIcon={ChevronDownIcon}
            style={{ width: "100%" }}
            onClick={(e) => {
              if (!hasNegativeStock) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const menuHeight = 96;
              if (rect.top > menuHeight + 8) {
                setPoMenuPos({ bottom: window.innerHeight - rect.top + 4, top: null, left: rect.left });
              } else {
                setPoMenuPos({ top: rect.bottom + 4, bottom: null, left: rect.left });
              }
              setPoMenuOpen(p => !p);
            }}
          >
            Create PO
          </Button>
          {poMenuOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 29999 }} onClick={() => setPoMenuOpen(false)} />
              <div style={{ position: "fixed", top: poMenuPos.top ?? "auto", bottom: poMenuPos.bottom ?? "auto", left: poMenuPos.left, width: "220px", background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "var(--radius-card)", boxShadow: "var(--elevation-sm)", overflow: "hidden", zIndex: 30000 }}>
                <div
                  onClick={() => { setPoMenuOpen(false); onCreatePo && onCreatePo({ materialName: selectedCell.materialName, sku: selectedCell.sku, needToBuy: selectedCell.endStock < 0 ? Math.abs(selectedCell.endStock) : 0, urgencyStatus: procStatus?.status || null }); }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}
                >
                  <AddIcon size={16} /> Create New PO
                </div>
                <div
                  onClick={() => { setPoMenuOpen(false); onSelectExistingPo && onSelectExistingPo({ materialName: selectedCell.materialName, sku: selectedCell.sku }); }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", borderTop: ROW_BORDER }}
                >
                  <DocumentIcon size={16} /> Select Existing PO
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
