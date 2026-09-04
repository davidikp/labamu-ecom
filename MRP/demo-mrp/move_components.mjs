import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcComponents = path.join(__dirname, "src", "components");

const moves = [
  { from: "common/StatusBadge.jsx", to: "atoms/StatusBadge.jsx" },
  { from: "common/FilterPill.jsx", to: "molecules/FilterPill.jsx" },
  { from: "common/DropdownSelect.jsx", to: "molecules/DropdownSelect.jsx" },
  { from: "common/MultiSelectDropdown.jsx", to: "molecules/MultiSelectDropdown.jsx" },
  { from: "table/TableSearchField.jsx", to: "molecules/TableSearchField.jsx" },
  { from: "table/TablePaginationFooter.jsx", to: "molecules/TablePaginationFooter.jsx" },
  { from: "modal/GeneralModal.jsx", to: "molecules/GeneralModal.jsx" },
  { from: "layout/Sidebar.jsx", to: "organisms/Sidebar.jsx" },
  { from: "layout/TopHeader.jsx", to: "organisms/TopHeader.jsx" },
  { from: "common/ListStatusCounterCard.jsx", to: "organisms/ListStatusCounterCard.jsx" },
];

for (const { from, to } of moves) {
  const fromPath = path.join(srcComponents, from);
  const toPath = path.join(srcComponents, to);
  
  if (fs.existsSync(fromPath)) {
    // Make sure destination directory exists
    fs.mkdirSync(path.dirname(toPath), { recursive: true });
    
    // Read the file and write to the new location (handles rename safely)
    const data = fs.readFileSync(fromPath, 'utf8');
    fs.writeFileSync(toPath, data);
    
    // Calculate relative path for the shim
    const relPath = path.relative(path.dirname(fromPath), toPath).replace(/\\/g, "/");
    
    // Create shim in original location to maintain import compatibility
    const shimContent = `export * from "${relPath.startsWith('.') ? relPath : './' + relPath}";\n`;
    fs.writeFileSync(fromPath, shimContent);
    
    console.log(`Moved ${from} to ${to} and created shim.`);
  } else {
    console.log(`Skipped ${from} - not found.`);
  }
}

// Update Barrel Exports
const atomsIndex = path.join(srcComponents, "atoms", "index.js");
let atomsExport = fs.existsSync(atomsIndex) ? fs.readFileSync(atomsIndex, 'utf8') : "";
if (!atomsExport.includes("StatusBadge")) {
  fs.appendFileSync(atomsIndex, `\nexport * from "./StatusBadge.jsx";\n`);
}

const moleculesIndex = path.join(srcComponents, "molecules", "index.js");
let moleculesExport = fs.existsSync(moleculesIndex) ? fs.readFileSync(moleculesIndex, 'utf8') : "";
const newMolecules = ["FilterPill", "DropdownSelect", "MultiSelectDropdown", "TableSearchField", "TablePaginationFooter", "GeneralModal"];
for (const m of newMolecules) {
  if (!moleculesExport.includes(m)) {
    fs.appendFileSync(moleculesIndex, `export * from "./${m}.jsx";\n`);
  }
}

const organismsIndex = path.join(srcComponents, "organisms", "index.js");
let organismsExport = fs.existsSync(organismsIndex) ? fs.readFileSync(organismsIndex, 'utf8') : "";
const newOrganisms = ["Sidebar", "TopHeader", "ListStatusCounterCard"];
for (const o of newOrganisms) {
  if (!organismsExport.includes(o)) {
    fs.appendFileSync(organismsIndex, `export * from "./${o}.jsx";\n`);
  }
}

console.log("Updated barrel exports.");
