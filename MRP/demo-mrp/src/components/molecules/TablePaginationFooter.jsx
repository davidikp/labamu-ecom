import React from "react";
import { Pagination, Dropdown } from "../../ce-ui";

/**
 * TablePaginationFooter — rebuilt on the ce-ui Pagination + Dropdown.
 * Legacy API preserved: totalRows / rowsPerPage / onRowsPerPageChange /
 * currentPage / totalPages / onPageChange / renderLeftActions.
 */
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const TablePaginationFooter = ({
  totalRows = 0,
  rowsPerPage = 25,
  onRowsPerPageChange,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  renderLeftActions,
  rowsPerPageOptions = ROWS_PER_PAGE_OPTIONS,
  style = {},
}) => (
  <div
    className="ds-table-pagination"
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
      padding: "16px 24px",
      ...style,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {renderLeftActions && (
        <>
          {renderLeftActions()}
          <div style={{ width: "1px", height: "24px", background: "var(--neutral-line-separator-2)", margin: "0 4px" }} />
        </>
      )}
      {onRowsPerPageChange && (
        <div className="rows-per-page-dropdown" style={{ width: "84px" }}>
          <style>{`.rows-per-page-dropdown [aria-label="Clear"] { display: none; }`}</style>
          <Dropdown
            size="sm"
            options={rowsPerPageOptions.map((n) => ({ value: String(n), label: String(n) }))}
            value={String(rowsPerPage)}
            onChange={(v) => onRowsPerPageChange(Number(v))}
          />
        </div>
      )}
      <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)" }}>
        {`from ${totalRows} rows`}
      </span>
    </div>

    <Pagination
      page={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
  </div>
);

export { TablePaginationFooter };
