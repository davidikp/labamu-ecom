// Dummy routing catalog for the BOM Routing picker — each routing maps to a
// fixed set of valid operations, following the { route, op } naming
// convention already used in modules/work-order/mock/workOrderMocks.js
// (routingStages[].route / .op).
export const ROUTING_CATALOG = [
  {
    name: "Inbound Handling",
    operations: ["Material Receiving", "Quality Inspection", "Warehouse Putaway"],
  },
  {
    name: "Cutting & Preparation",
    operations: ["Cutting", "Sanding", "Edge Banding"],
  },
  {
    name: "Assembly",
    operations: ["Frame Assembly", "Advanced Assembly", "Hardware Fitting"],
  },
  {
    name: "Finishing",
    operations: ["Premium Painting", "High Gloss Polishing", "Varnishing"],
  },
  {
    name: "Packaging",
    operations: ["Final Packing", "Labeling", "Carton Sealing"],
  },
  {
    name: "Shipping",
    operations: ["Outbound Loading", "Dispatch"],
  },
];

export const getRoutingOperations = (routingName) =>
  ROUTING_CATALOG.find((r) => r.name === routingName)?.operations || [];
