import React, { useState } from "react";
import { AddIcon, ChevronDownIcon, ChevronRightIcon, DeleteIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { InputField } from "../../../components/molecules/InputField.jsx";
import { fieldTotal, formatIDR } from "../utils/bomUtils.js";

let nextLineId = 1;
const newLine = () => ({ id: `new-line-${nextLineId++}`, label: "", amount: 0 });

// One COGS row, shared by the read-only detail view and the editable
// create/edit form. Styled after the Orders module's Material Breakdown
// drawer rows (bold title + grey description + value) — see
// modules/orders/pages/OrderDetailPage.jsx "Demand" row group.
//
// Editable mode keeps a chevron that collapses/expands the whole row body
// (the Cost Breakdown checkbox + line editor). Read-only mode has no such
// chevron — the header is always shown, and only the breakdown line list
// (when the field actually has a breakdown) gets its own "See/Hide Cost
// Breakdown" toggle, defaulting to expanded.
const MAX_BREAKDOWN_ITEMS = 10;

const breakdownEmptyStateStyle = {
  padding: "24px",
  textAlign: "center",
  color: "var(--neutral-on-surface-tertiary)",
  fontSize: "var(--text-title-3)",
  background: "var(--neutral-surface-primary)",
  border: "1.5px dashed var(--neutral-line-separator-1)",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "80px",
};

export const CostFieldAccordion = ({ icon: Icon, title, description, isNew, field, onChange, readOnly = false, disabled = false, onAddItem, invalidLineIds }) => {
  const [expanded, setExpanded] = useState(true);
  const [breakdownVisible, setBreakdownVisible] = useState(false);
  const total = fieldTotal(field);
  const isBreakdown = field.mode === "breakdown";
  const atMax = (field.lines?.length || 0) >= MAX_BREAKDOWN_ITEMS;

  const setAmount = (amount) => onChange({ ...field, amount: Number(amount) || 0 });
  const updateLine = (idx, patch) =>
    onChange({ ...field, lines: field.lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)) });
  const addLine = () => {
    if (atMax) return;
    onChange({ ...field, lines: [...field.lines, newLine()] });
  };
  const removeLine = (idx) => onChange({ ...field, lines: field.lines.filter((_, i) => i !== idx) });

  const header = (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "flex-start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {!readOnly ? (
          <div
            style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px" }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDownIcon size={16} color="var(--neutral-on-surface-secondary)" />
            ) : (
              <ChevronRightIcon size={16} color="var(--neutral-on-surface-secondary)" />
            )}
          </div>
        ) : null}
        {Icon ? <Icon size={16} color="var(--neutral-on-surface-secondary)" style={{ marginTop: "2px" }} /> : null}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>
            {title}
            {isNew ? <StatusBadge variant="blue-light">New</StatusBadge> : null}
          </span>
          {description ? (
            <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)" }}>{description}</span>
          ) : null}
        </div>
      </div>

      {readOnly ? (
        <span style={{ fontWeight: "bold", fontSize: "16px", color: "var(--neutral-on-surface-primary)" }}>
          {formatIDR(total)}
        </span>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          {isBreakdown ? (
            <span style={{ fontWeight: "bold", fontSize: "16px", color: "var(--neutral-on-surface-primary)" }}>
              {formatIDR(total)}
            </span>
          ) : (
            <div style={{ width: "200px" }}>
              <InputField type="number" prefix="IDR" value={field.amount} onChange={(e) => setAmount(e.target.value)} disabled={disabled} />
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (readOnly) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {header}
        {isBreakdown ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "24px" }}>
            <Button
              variant="tertiary"
              size="small"
              rightIcon={breakdownVisible ? ChevronDownIcon : ChevronRightIcon}
              onClick={() => setBreakdownVisible((v) => !v)}
              style={{ alignSelf: "flex-start", padding: 0 }}
            >
              {breakdownVisible ? "Hide Cost Breakdown" : "See Cost Breakdown"}
            </Button>
            {breakdownVisible ? (
              field.lines.length ? (
                field.lines.map((l, idx) => (
                  <div
                    key={l.id || idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "14px",
                      alignItems: "center",
                      paddingBottom: "8px",
                      borderBottom: idx === field.lines.length - 1 ? "none" : "1px solid var(--neutral-line-separator-1)",
                    }}
                  >
                    <span style={{ color: "var(--neutral-on-surface-primary)" }}>{l.label || "-"}</span>
                    <span style={{ fontWeight: "bold", color: "var(--neutral-on-surface-secondary)" }}>
                      {formatIDR(l.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <div style={breakdownEmptyStateStyle}>No cost items added yet.</div>
              )
            ) : null}
            {breakdownVisible && onAddItem ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                <Button variant="outlined" size="small" leftIcon={AddIcon} onClick={onAddItem} disabled={atMax} style={{ alignSelf: "flex-start" }}>
                  Add Cost Item
                </Button>
                {atMax ? (
                  <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Maximum 10 items</span>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {header}

      {expanded ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "32px" }}>
          {isBreakdown ? (
            <>
              {!field.lines.length ? <div style={breakdownEmptyStateStyle}>No cost items added yet.</div> : null}
              {field.lines.map((l, idx) => {
                // Frozen at the last Save click (invalidLineIds), not recomputed on
                // every keystroke — so a freshly added row never shows an error until
                // Save is pressed again, while fixing a flagged row still clears it live.
                const lineError = invalidLineIds?.has(l.id) && !l.label?.trim() ? "Field cannot be empty" : null;
                const isLast = idx === field.lines.length - 1;
                return (
                  <div
                    key={l.id || idx}
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                      paddingBottom: "12px",
                      marginBottom: lineError ? "20px" : 0,
                      borderBottom: isLast ? "none" : "1px solid var(--neutral-line-separator-1)",
                    }}
                  >
                    <div style={{ flex: 2, position: "relative" }}>
                      <InputField
                        placeholder="Breakdown item name"
                        value={l.label}
                        onChange={(e) => updateLine(idx, { label: e.target.value })}
                        errorState={!!lineError}
                        disabled={disabled}
                      />
                      {lineError ? (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            color: "var(--status-red-primary)",
                            fontSize: "var(--text-body)",
                            marginTop: "4px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {lineError}
                        </div>
                      ) : null}
                    </div>
                    <div style={{ width: "180px" }}>
                      <InputField
                        type="number"
                        prefix="IDR"
                        value={l.amount}
                        onChange={(e) => updateLine(idx, { amount: Number(e.target.value) || 0 })}
                        disabled={disabled}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => removeLine(idx)}
                        disabled={disabled}
                        style={disabled ? undefined : { borderColor: "var(--status-red-primary)" }}
                      >
                        <DeleteIcon size={16} color={disabled ? undefined : "var(--status-red-primary)"} />
                      </Button>
                    </div>
                  </div>
                );
              })}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                <Button variant="outlined" size="small" leftIcon={AddIcon} onClick={addLine} disabled={disabled || atMax} style={{ alignSelf: "flex-start" }}>
                  Add Cost Item
                </Button>
                {atMax ? (
                  <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Maximum 10 items</span>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
