import { resolveMaterialOption } from "../mock/bomMocks.js";

export const formatIDR = (amount) => `IDR ${Number(amount || 0).toLocaleString("en-US")}`;

export const bomStatusBadgeVariant = (status) =>
  status === "Active" ? "green" : "grey";

// Material Cost is auto-derived: sum of (BOM qty × material's average stock cost).
export const computeMaterialCost = (materials = []) =>
  materials.reduce((sum, line) => {
    const option = resolveMaterialOption(line.materialId);
    const unitPrice = option?.averageCost || 0;
    return sum + unitPrice * Number(line.quantity || 0);
  }, 0);

// A cost field is either a flat amount ("single") or a set of named lines
// ("breakdown") — see mock/bomMocks.js DEFAULT_COGS for the shape.
export const fieldTotal = (field) => {
  if (!field) return 0;
  if (field.mode === "breakdown") {
    return (field.lines || []).reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
  }
  return Number(field.amount) || 0;
};

export const computeTotalCogs = (bom) => {
  if (!bom) return 0;
  const materialCost = computeMaterialCost(bom.materials);
  const { labour, packing, shipping, overhead, other } = bom.cogs || {};
  return (
    materialCost +
    fieldTotal(labour) +
    fieldTotal(packing) +
    fieldTotal(shipping) +
    fieldTotal(overhead) +
    fieldTotal(other)
  );
};

// The Materials mock has no "latest batch cost" fallback data modeled anywhere
// in this codebase, so Material Cost always uses the average stock cost.
export const materialCostMethod = () => "Avg stock cost";
