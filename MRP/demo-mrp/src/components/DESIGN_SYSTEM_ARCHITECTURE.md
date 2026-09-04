# Design System Architecture

## 1. Purpose
This design system serves as the single source of truth for all reusable UI components within the codebase. Its primary goal is to ensure visual and interactive consistency, drastically speed up feature development, and eliminate UI code duplication. By strictly separating presentational UI components from feature-specific business logic, we create a more maintainable and scalable frontend architecture.

## 2. Folder Structure
The design system follows a strict Atomic Design methodology, located exclusively within `src/components`:
```text
src/components/
├── atoms/       # UI primitives
├── molecules/   # Simple composite components
├── organisms/   # Complex UI sections
├── templates/   # Page layout structures
└── index.js     # Global barrel export
```

## 3. Atomic Classification Rules
Components must be classified based on their complexity and structural role:
- **Atoms**: The core primitive building blocks. These are the smallest units of the UI, such as a standalone button, an input shell, or a status badge. They should have minimal to no internal state.
- **Molecules**: Groups of atoms bonded together to form the smallest functional units. Examples include a `FormField` (Label + Input atom), a `DropdownSelect`, or an `UploadDropzone`.
- **Organisms**: Complex UI sections composed of multiple molecules and atoms. These form distinct areas of an interface, such as a `Sidebar`, a `TopHeader`, or a fully interactive `GeneralModal`.
- **Templates**: Page-level objects that articulate the design's underlying content structure without injecting specific content. They dictate the layout grid, such as a standard page template with a sidebar and scrollable main area.
- **Feature-Only**: Highly specialized components bound strictly to business logic, domain models, or distinct application features. **These belong in `src/modules`, NOT in the design system.**

## 4. Current Migrated Components
The following components are fully migrated and act as the global standard:
- **Atoms**: `Button`, `IconButton`, `Checkbox`, `ToggleSwitch`, `StatusBadge`, `Tooltip`, `UnifiedInputShell`.
- **Molecules**: `InputField`, `PhoneInputField`, `DropdownSelect`, `MultiSelectDropdown`, `UploadDropzone`, `ImageUpload`, `FilterPill`, `LabelValue`, `FormField`, `TableSearchField`.
- **Organisms**: `Sidebar`, `TopHeader`, `ListStatusCounterCard`.

## 5. Partially Migrated Components
These components exist in the design system but require further consolidation or reclassification:
- **`TextAreaField`**: Being actively consolidated into `InputField` using the `multiline={true}` prop.
- **`DateInputControl`**: Global version exists, but local duplicate implementations remain in older feature modules.
- **`GeneralModal`**: Currently misclassified in `/molecules`. Needs to be moved to `/organisms` as it orchestrates multiple complex pieces.
- **`TablePaginationFooter`**: Currently misclassified in `/molecules`. Needs to be moved to `/organisms`.

## 6. Not-Yet-Migrated Components
These reusable patterns have been identified across the codebase and need to be extracted into the design system:
- **`DateRangeInputControl`**: Heavily duplicated across feature modules; must be extracted to a global molecule.
- **`SectionCard`**: A generic wrapper used for form/detail sections.
- **`DrawerLayout` / `SplitPaneLayout`**: Standard side-drawer overlay layouts used for creation workflows.
- **`PageLayout`**: The standard Sidebar + TopHeader + Main Content layout.
- **`TableLayout`**: The standard page header + filters + table + pagination wrapper.

## 7. Components That Should Stay Feature-Only
Do **not** move these into the design system. They are tied to specific business domains:
- `DateRangePicker` (Custom double-month calendar deeply tied to Analytics presets in `POReportPage.jsx`).
- `DocumentTypeBadge` (Tied strictly to Purchase Order document type enums).
- `TraceabilityTab` (Renders custom SVGs for manufacturing traceability).
- `StockBatchesTab` (Material stock tracking logic).
- `CurrencyInputField` (Implements highly strict local masking for currency logic tied to PO requirements).

## 8. Import Rules
- **Preferred Import**: Always import reusable UI components directly from the global design system barrel file (`import { Button, InputField } from "@/components" ` or `../../../components`).
- **Legacy Shims**: Any legacy local shims or duplicated UI files remaining in `src/modules` are temporary technical debt and must be refactored out over time.

## 9. Rules for Future Vibecode Work
When generating or modifying UI code, adhere strictly to these rules:
- **Reusable UI MUST go to `src/components`**.
- **Business/domain logic STAYS in `src/modules`**.
- **Do NOT create duplicate generic components**. If you need an input field, dropzone, dropdown, button, or badge, you must use the existing ones in `src/components`. Never redefine `const InputField = ...` inline within a feature page.

## 10. Future Migration Roadmap
The immediate technical roadmap for the design system includes:
1. **Extract `DateRangeInputControl`** into `src/components/molecules`.
2. **Reclassify `GeneralModal` and `TablePaginationFooter`** by moving them from `molecules` to `organisms`.
3. **Extract `DrawerLayout`, `PageLayout`, and `TableLayout`** into `src/components/templates`.

## 11. FE UI Library Alignment Note
- **Do NOT migrate to an external FE UI library (like Material UI, Ant Design, Tailwind UI, etc.) yet.**
- Use this `DESIGN_SYSTEM_ARCHITECTURE.md` as the absolute local source of truth first.
- External UI library alignment (visual updates and API mapping) will occur in a later, dedicated phase once this internal structure is thoroughly consolidated and stable.
