# Design System Checkpoint

This document serves as a milestone marker for the design system extraction and deduplication effort. It outlines the current state of the architecture, what has been successfully centralized, what remains decentralized intentionally, and the roadmap for the future.

## 1. What is Now Centralized
The following systems have been fully extracted, deduplicated, and centralized into `src/components`:

*   **Atoms & Molecules**: Core primitives like `Button`, `IconButton`, `Checkbox`, `StatusBadge`, `FilterPill`, and `Tooltip`.
*   **Organisms**: More complex reusable structures like `TablePaginationFooter` and `GeneralModal` (which sit in their atomic classification).
*   **Input/Form System**: The entire base input stack is global. `FormField`, `InputField`, `PhoneInputField`, `UnifiedInputShell`, and their style variants (`inputFrameStyle`, `inputControlStyle`) are uniquely defined in `src/components` and exported globally. There are zero feature-module duplicates.
*   **Text Area Field**: Fully deprecated and replaced natively by `InputField` with the `multiline={true}` prop.
*   **Upload System**: `UploadDropzone`, `ImageUploadField`, `UploadDescriptionCard`, and `DocumentTypeBadge` are entirely centralized.
*   **Dropdown / Table Controls**: `DropdownSelect`, `MultiSelectDropdown`, and `TableSearchField` have been globally aligned.

## 2. What is Intentionally NOT Migrated (Yet)
The following elements remain localized within `src/modules` or `src/pages` due to high implementation risk or tight feature coupling:

*   **Date Range System**: `DateRangeInputControl` and complex popover calendar states.
*   **Analytics Date Picker**: Highly specific to dashboard and report analytics workflows.
*   **Drawer/Layout Templates**: `DrawerLayout`, `PageLayout`, and `TableLayout` are heavily entrenched in application state and will require dedicated layout-level extraction.
*   **Business-Specific Modals/Tabs**: Modals containing complex domain state (e.g., `GroupModalState` in User Management) remain feature-only components inside `src/modules`.

## 3. Remaining Roadmap
Future phases of the architectural cleanup should target the following:

*   **DateRangeInputControl Extraction (Later)**: Safely decouple date-range logic and extract to `src/components/organisms`.
*   **Layout Extraction (Later)**: Migrate `DrawerLayout`, `PageLayout`, and `TableLayout` to `src/components/templates`.
*   **FE UI Library Alignment (Later)**: Once all reusable UI is centralized, swap the internal implementations of the atoms/molecules with the chosen external FE UI library (e.g., MUI, AntD, ShadCN) without having to rewrite any feature modules.

## 4. Current Architecture Rules
To maintain the purity of the design system, future development must adhere to the following:

1.  **New Reusable UI goes to `src/components`**: Do not build new shared UI components inside `src/modules`. Use the atomic folders.
2.  **Feature Logic stays in `src/modules`**: Business domain rules, API calls, and complex feature states should never leak into `src/components`.
3.  **No Duplicates**: **Never** redefine `InputField`, `FormField`, `UploadDropzone`, `Button`, or `Badge` inside a module. Always import from `src/components/index.js`.
4.  **Surgical Refactoring**: Avoid broad, automated regex refactor scripts. Use precise, surgical edits to prevent silent runtime breakages or `EPERM` issues.

## 5. Recommended Next Step
The foundational UI layer is now stable and clean. 

**Next Step**: Resume feature iteration and domain logic development using the newly centralized design system to ensure speed and consistency.
