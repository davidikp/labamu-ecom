// FilterMenu — adapter exposing the ce-ui self-contained FilterPill (trigger + dropdown
// panel + search + single/multi select + custom date range).
//
// Named FilterMenu to distinguish it, during the migration, from the legacy trigger-only
// molecules/FilterPill.jsx (which callers pair with their own external popover). New/migrated
// call sites should use <FilterMenu>; once every site has moved over, the legacy FilterPill
// and this alias can be reconciled.
//
// API (see src/ce-ui/ui/filter-pill.tsx): label, options=[{value,label}],
//   multiple + values + onChangeMultiple  |  value + onChange (single),
//   searchable, customDateEnabled + customDate* (preset + range date filters).
export { FilterPill as FilterMenu } from "../../ce-ui";
