import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/Icons.jsx";
import { DropdownSelect } from "./DropdownSelect.jsx";

const TABLE_ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const TablePaginationFooter = ({
  totalRows,
  rowsPerPage,
  onRowsPerPageChange,
  currentPage,
  totalPages,
  onPageChange,
  renderLeftActions,
  style = {},
}) => {
  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  return (
    <div 
      className="ds-table-pagination ds-flex-center" 
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        ...style
      }}
    >
      <div 
        className="ds-table-pagination__rows"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}
      >
        {renderLeftActions && (
          <>
            {renderLeftActions()}
            <div style={{ width: "1px", height: "24px", background: "var(--neutral-line-separator-2)", margin: "0 4px" }} />
          </>
        )}
        <div style={{ width: "112px" }}>
          <DropdownSelect
            value={rowsPerPage}
            onChange={(nextValue) => onRowsPerPageChange(Number(nextValue))}
            options={TABLE_ROWS_PER_PAGE_OPTIONS.map((option) => ({
              value: option,
              label: String(option),
            }))}
            fieldHeight="36px"
            borderRadius="8px" // Aligned with sm size buttons
            fontSize="14px"
            optionFontSize="14px"
            showSelectedCheck={false}
            style={{ height: "36px" }}
          />
        </div>
        <span
          style={{
            fontSize: "14px",
            color: "var(--neutral-on-surface-secondary)",
          }}
        >{`from ${totalRows} rows`}</span>
      </div>

      <div 
        className="ds-table-pagination__pages"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >
        <button
          type="button"
          onClick={() => !isPrevDisabled && onPageChange(currentPage - 1)}
          disabled={isPrevDisabled}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: isPrevDisabled
              ? "var(--neutral-surface-grey-lighter)"
              : "var(--neutral-surface-primary)",
            cursor: isPrevDisabled ? "not-allowed" : "pointer",
            border: `1px solid ${isPrevDisabled ? "transparent" : "var(--neutral-line-separator-2)"}`,
            color: isPrevDisabled ? "var(--neutral-on-surface-tertiary)" : "var(--neutral-on-surface-secondary)",
            transition: "all 0.15s ease"
          }}
          onMouseEnter={(e) => {
            if (!isPrevDisabled) {
              e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)";
              e.currentTarget.style.borderColor = "var(--neutral-line-separator-1)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isPrevDisabled) {
              e.currentTarget.style.background = "var(--neutral-surface-primary)";
              e.currentTarget.style.borderColor = "var(--neutral-line-separator-2)";
            }
          }}
        >
          <ChevronLeftIcon size={16} color="currentColor" />
        </button>
        
        <div 
          className="ds-table-pagination__page-number"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "var(--feature-brand-container-lighter)",
            color: "var(--feature-brand-primary)",
            fontSize: "14px",
            fontWeight: "bold"
          }}
        >
          {currentPage}
        </div>
        
        <button
          type="button"
          onClick={() => !isNextDisabled && onPageChange(currentPage + 1)}
          disabled={isNextDisabled}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: isNextDisabled
              ? "var(--neutral-surface-grey-lighter)"
              : "var(--neutral-surface-primary)",
            cursor: isNextDisabled ? "not-allowed" : "pointer",
            border: `1px solid ${isNextDisabled ? "transparent" : "var(--neutral-line-separator-2)"}`,
            color: isNextDisabled ? "var(--neutral-on-surface-tertiary)" : "var(--neutral-on-surface-secondary)",
            transition: "all 0.15s ease"
          }}
          onMouseEnter={(e) => {
            if (!isNextDisabled) {
              e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)";
              e.currentTarget.style.borderColor = "var(--neutral-line-separator-1)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isNextDisabled) {
              e.currentTarget.style.background = "var(--neutral-surface-primary)";
              e.currentTarget.style.borderColor = "var(--neutral-line-separator-2)";
            }
          }}
        >
          <ChevronRightIcon size={16} color="currentColor" />
        </button>
      </div>
    </div>
  );
};

export { TablePaginationFooter };
