# AI Design System Rules

**ATTENTION ALL AI / VIBECODE AGENTS:**  
When generating, modifying, or refactoring UI code in this repository, you **MUST** adhere to the following strict guidelines:

1. **Always Check First**: Before building a new UI primitive (button, input, dropdown, badge, dropzone, modal, etc.), you must search `src/components` to see if a reusable version already exists.
2. **Never Duplicate**: Do NOT define generic local UI components (e.g., `const InputField = ...`, `const UploadDropzone = ...`) inline within `src/modules` or `src/pages` if a global equivalent exists in the design system.
3. **Atomic Placement**: When extracting new reusable components to the design system, place them in the correct Atomic Design folder (`atoms/`, `molecules/`, `organisms/`, or `templates/`) based on their structural complexity. See `DESIGN_SYSTEM_ARCHITECTURE.md` for definitions.
4. **Use Barrel Exports**: Always import design system components using the global barrel exports (e.g., `import { ComponentName } from "../../../components"`), avoiding deep file path imports where possible.
5. **Protect Feature Logic**: Keep all domain-specific and feature-specific components (e.g., highly specialized tables, custom business-logic inputs, feature tabs) inside `src/modules`. Do not pollute the generic design system with business logic.
6. **Ask Before High-Risk Migrations**: If extracting or migrating a complex, deeply coupled, or high-risk component (like a core page template or complex organism), present a plan and ask the human user for explicit approval before proceeding.
7. **No Direct FE-UI Imports**: Do not directly import components from external reference libraries (like `fe-ui-reference`, Material UI, etc.) unless explicitly instructed. This repository uses its own custom Atomic Design system as the primary baseline.
8. **No Broad Scripted Refactors**: Do not run broad regex, `sed`, or scripted `multi_replace_file_content` sweeps across the entire codebase to swap UI implementations unless you have explicit user approval for that exact phase. Migrate files iteratively, safely, and one-by-one.
