import React from "react";
import { ChevronRightIcon, CloseIcon } from "../icons/Icons.jsx";
import { StatusBadge } from "../atoms/StatusBadge.jsx";

const ListStatusCounterCard = ({
  label,
  count,
  badgeVariant,
  active = false,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="ds-list-status-card"
    style={{
      "--ds-list-status-card-border": active
        ? "var(--feature-brand-primary)"
        : "var(--neutral-line-separator-1)",
      "--ds-list-status-card-bg": active
        ? "var(--feature-brand-container-lighter)"
        : "var(--neutral-surface-primary)",
    }}
  >
    <span
      className="ds-list-status-card__label"
      style={{
        "--ds-list-status-card-label-color": active
          ? "var(--feature-brand-primary)"
          : "var(--neutral-on-surface-primary)",
        "--ds-list-status-card-label-weight": active
          ? "var(--font-weight-bold)"
          : "var(--font-weight-regular)",
      }}
    >
      {label}
    </span>
    <div className="ds-list-status-card__meta">
      <StatusBadge variant={badgeVariant}>{count}</StatusBadge>
      {active ? (
        <CloseIcon size={16} color="var(--feature-brand-primary)" />
      ) : (
        <ChevronRightIcon size={16} color="var(--neutral-on-surface-tertiary)" />
      )}
    </div>
  </button>
);

export { ListStatusCounterCard };
