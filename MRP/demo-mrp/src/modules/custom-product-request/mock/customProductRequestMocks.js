import { resolveMaterialOption } from "../../bill-of-materials/mock/bomMocks.js";

// CPR record patches are kept in-memory only (module-level, not persisted to
// localStorage) so a full page reload always resets every CPR back to its
// seeded state — unlike bomMocks.js / materialRequestMocks.js.
let runtimePatches = {};

export const CPR_STATUS_META = {
  New: { badge: "blue", badgeVariant: "blue-light" },
  Draft: { badge: "grey", badgeVariant: "grey-light" },
  "Need Revision": { badge: "yellow", badgeVariant: "yellow-light" },
  Submitted: { badge: "orange", badgeVariant: "orange-light" },
  Completed: { badge: "green", badgeVariant: "green-light" },
  Rejected: { badge: "red", badgeVariant: "red-light" },
  "Need Re-Evaluation": { badge: "yellow", badgeVariant: "yellow-light" },
};

const material = (materialId, quantity) => {
  const option = resolveMaterialOption(materialId);
  return {
    materialId,
    name: option?.name || "Unknown Material",
    sku: option?.sku || "-",
    category: option?.category || "-",
    abcClassification: option?.abcClassification || "-",
    type: option?.type || "-",
    unit: option?.unit || "-",
    quantity,
  };
};

const INITIAL_REQUESTS = [
  {
    cprNumber: "CPR-2026-001",
    rfqNumber: "RFQ-2026-001",
    customerName: "PT Indah Karya",
    requestedProductName: "Custom Steel Bracket Type A",
    requestedQuantity: 500,
    createdDate: "2026-02-20",
    createdBy: "John Doe",
    status: "New",
    productNotes: "Need delivery by end of month. Custom specifications required for high-end retail market.",
    attachments: [
      { name: "Detailed technical specifications from customer", filename: "technical-specifications.pdf", type: "pdf" },
      { name: "CAD drawings showing required dimensions", filename: "reference-drawings.dwg", type: "file" },
      { name: "Material specifications and requirements", filename: "material-requirements.xlsx", type: "xls" },
    ],
    productDetail: null,
    logs: {
      requestedBy: "John Doe",
      requestedAt: null,
      approvers: [{ name: "John Doe", role: "Product Manager", status: "Pending", comments: "" }],
      activity: [
        { name: "John Doe", email: "user@company.com", activity: "Created", timestamp: "2026-02-20 at 09:30" },
      ],
      engineeringNotes: [],
    },
  },
  {
    cprNumber: "CPR-2026-002",
    rfqNumber: "RFQ-2026-003",
    customerName: "CV Maju Jaya",
    requestedProductName: "Modified Aluminum Frame",
    requestedQuantity: 250,
    createdDate: "2026-02-21",
    createdBy: "Jane Smith",
    status: "Draft",
    productNotes: "Frame must be lightweight and corrosion resistant.",
    attachments: [
      { name: "Customer sketch of frame layout", filename: "frame-sketch.pdf", type: "pdf" },
    ],
    productDetail: null,
    logs: {
      requestedBy: "Jane Smith",
      requestedAt: null,
      approvers: [{ name: "John Doe", role: "Product Manager", status: "Pending", comments: "" }],
      activity: [
        { name: "Jane Smith", email: "user@company.com", activity: "Created", timestamp: "2026-02-21 at 09:30" },
        { name: "Jane Smith", email: "user@company.com", activity: "Product Details Filled", timestamp: "2026-02-21 at 10:15" },
      ],
      engineeringNotes: [
        {
          author: "Engineering Team",
          note: "Initial feasibility assessment completed. Product design is viable with current manufacturing capabilities.",
          timestamp: "2026-02-21 at 10:06",
        },
      ],
    },
  },
  {
    cprNumber: "CPR-2026-003",
    rfqNumber: "RFQ-2026-005",
    customerName: "UD Sejahtera",
    requestedProductName: "Custom Welding Assembly",
    requestedQuantity: 100,
    createdDate: "2026-02-22",
    createdBy: "Michael Chen",
    status: "Need Revision",
    productNotes: "Welding tolerance must meet ISO 9001 standard.",
    attachments: [],
    productDetail: {
      productName: "Custom Welding Assembly",
      sku: "WLD-ASM-001",
      category: "Custom Metal Parts",
      status: "Active",
      description: "Welded frame assembly per customer ISO 9001 tolerance spec.",
      images: [],
      specification: { primaryMaterial: "Steel", finishing: "Raw", weight: "2.4" },
      finishedDimensions: { height: "30", width: "20", length: "40" },
      packedDimensions: { height: "32", width: "22", length: "42" },
      containerCapacity: { "20ft": "600", "40ft": "1300", "40ftHc": "1450" },
      bom: {
        name: "Welding Assembly BOM",
        description: "",
        materials: [material("mat-011", 2)],
        routing: [{ step: 1, name: "Welding", operation: "-", hours: 3 }],
      },
      basePrice: 0,
      leadTime: { value: "10", unit: "Day" },
      sellingPrice: 0,
      salesPriceList: [],
    },
    logs: {
      requestedBy: "Michael Chen",
      requestedAt: "2026-02-22 at 09:30",
      approvers: [{ name: "John Doe", role: "Product Manager", status: "Pending", comments: "" }],
      activity: [
        { name: "Michael Chen", email: "user@company.com", activity: "Created", timestamp: "2026-02-22 at 09:30" },
        { name: "Michael Chen", email: "user@company.com", activity: "Product Details Filled", timestamp: "2026-02-22 at 10:15" },
        { name: "Michael Chen", email: "user@company.com", activity: "Submitted", timestamp: "2026-02-22 at 11:00" },
        {
          name: "Manager",
          email: "manager@company.com",
          activity: "Ask for Revision",
          description:
            "The material specifications need to be updated. Please provide more detailed welding requirements and verify the material thickness meets industry standards. Also, include heat treatment specifications.",
          timestamp: "2026-02-22 at 14:30",
        },
      ],
      engineeringNotes: [
        {
          author: "Engineering Team",
          note: "Initial review completed. Product is manufacturable but requires specification clarification.",
          timestamp: "2026-02-22 at 10:03",
        },
      ],
    },
  },
  {
    cprNumber: "CPR-2026-004",
    rfqNumber: "RFQ-2026-007",
    customerName: "PT Global Tech",
    requestedProductName: "Special Metal Component X-200",
    requestedQuantity: 1000,
    createdDate: "2026-02-22",
    createdBy: "Sarah Johnson",
    status: "Submitted",
    productNotes: "High volume order — prioritize lead time.",
    attachments: [
      { name: "RFQ technical annex", filename: "x200-technical-annex.pdf", type: "pdf" },
    ],
    productDetail: {
      productName: "Special Metal Component X-200",
      sku: "MTL-X200-001",
      category: "Custom Metal Parts",
      status: "Active",
      description: "High-volume custom metal component machined to customer spec.",
      images: [],
      specification: { primaryMaterial: "Aluminum 6061", finishing: "Anodized", weight: "1.2" },
      finishedDimensions: { height: "12", width: "8", length: "20" },
      packedDimensions: { height: "15", width: "10", length: "22" },
      containerCapacity: { "20ft": "2400", "40ft": "5000", "40ftHc": "5600" },
      bom: {
        name: "Special Metal Component X-200 BOM",
        description: "",
        materials: [material("mat-011", 2)],
        routing: [{ step: 1, name: "CNC Machining", operation: "-", hours: 3 }],
      },
      basePrice: 0,
      leadTime: { value: "14", unit: "Day" },
      sellingPrice: 0,
      salesPriceList: [],
    },
    logs: {
      requestedBy: "Sarah Johnson",
      requestedAt: "2026-02-22 at 10:00",
      approvers: [{ name: "John Doe", role: "Product Manager", status: "Pending", comments: "" }],
      activity: [
        { name: "Sarah Johnson", email: "user@company.com", activity: "Created", timestamp: "2026-02-22 at 10:00" },
        { name: "Sarah Johnson", email: "user@company.com", activity: "Product Details Filled", timestamp: "2026-02-22 at 10:15" },
        { name: "Sarah Johnson", email: "user@company.com", activity: "Submitted", timestamp: "2026-02-22 at 11:00" },
      ],
      engineeringNotes: [
        {
          author: "Engineering Team",
          note: "Technical specifications reviewed and validated. All manufacturing requirements are clear.",
          timestamp: "2026-02-22 at 10:21",
        },
      ],
    },
  },
  {
    cprNumber: "CPR-2026-005",
    rfqNumber: "RFQ-2026-008",
    customerName: "CV Berkah Abadi",
    requestedProductName: "Custom Machined Part Series B",
    requestedQuantity: 750,
    createdDate: "2026-02-23",
    createdBy: "Ahmad Rizki",
    status: "Completed",
    productNotes: "Approved for production.",
    attachments: [],
    productDetail: {
      productName: "Custom Machined Part Series B",
      sku: "MCH-SB-002",
      category: "Custom Metal Parts",
      status: "Active",
      description: "Precision-machined part series B.",
      images: [],
      specification: { primaryMaterial: "Steel", finishing: "Powder Coated", weight: "0.8" },
      finishedDimensions: { height: "10", width: "6", length: "15" },
      packedDimensions: { height: "12", width: "8", length: "17" },
      containerCapacity: { "20ft": "3000", "40ft": "6200", "40ftHc": "6900" },
      bom: {
        name: "Series B BOM",
        description: "",
        materials: [material("mat-011", 1)],
        routing: [{ step: 1, name: "Machining", operation: "-", hours: 2 }],
      },
      basePrice: 85000,
      leadTime: { value: "10", unit: "Day" },
      sellingPrice: 120000,
      salesPriceList: [{ currency: "IDR", sellingPrice: 120000 }],
    },
    logs: {
      requestedBy: "Ahmad Rizki",
      requestedAt: "2026-02-23 at 10:00",
      approvers: [
        { name: "John Doe", role: "Product Manager", status: "Approved", comments: "CPR approved and product created in catalog" },
      ],
      activity: [
        { name: "Ahmad Rizki", email: "user@company.com", activity: "Created", timestamp: "2026-02-23 at 09:30" },
        { name: "Ahmad Rizki", email: "user@company.com", activity: "Product Details Filled", timestamp: "2026-02-23 at 10:15" },
        { name: "Ahmad Rizki", email: "user@company.com", activity: "Submitted", timestamp: "2026-02-23 at 11:00" },
        {
          name: "Manager",
          email: "manager@company.com",
          activity: "Approved",
          description: "CPR approved and product created in catalog",
          timestamp: "2026-02-23 at 14:30",
        },
      ],
      engineeringNotes: [
        {
          author: "Engineering Team",
          note: "Product design finalized. All manufacturing parameters confirmed and documented.",
          timestamp: "2026-02-23 at 10:14",
        },
      ],
    },
  },
  {
    cprNumber: "CPR-2026-006",
    rfqNumber: "RFQ-2026-009",
    customerName: "PT Mitra Sejahtera",
    requestedProductName: "Special Coating Application",
    requestedQuantity: 300,
    createdDate: "2026-02-23",
    createdBy: "Lisa Anderson",
    status: "Rejected",
    productNotes: "Coating spec not feasible with current vendor.",
    attachments: [],
    productDetail: {
      productName: "Special Coating Application",
      sku: "CTG-APP-001",
      category: "Finishing",
      status: "Active",
      description: "Special coating application for customer parts.",
      images: [],
      specification: { primaryMaterial: "Steel", finishing: "Special Coating", weight: "1.0" },
      finishedDimensions: { height: "20", width: "20", length: "20" },
      packedDimensions: { height: "22", width: "22", length: "22" },
      containerCapacity: { "20ft": "1000", "40ft": "2100", "40ftHc": "2300" },
      bom: {
        name: "Coating Application BOM",
        description: "",
        materials: [material("mat-011", 1)],
        routing: [{ step: 1, name: "Coating", operation: "-", hours: 1 }],
      },
      basePrice: 0,
      leadTime: { value: "7", unit: "Day" },
      sellingPrice: 0,
      salesPriceList: [],
    },
    logs: {
      requestedBy: "Lisa Anderson",
      requestedAt: "2026-02-23 at 10:00",
      approvers: [
        {
          name: "John Doe",
          role: "Product Manager",
          status: "Rejected",
          comments: "The coating material is not suitable for the specified application. Please provide an alternative material that meets the required specifications.",
        },
      ],
      activity: [
        { name: "Lisa Anderson", email: "user@company.com", activity: "Created", timestamp: "2026-02-23 at 09:30" },
        { name: "Lisa Anderson", email: "user@company.com", activity: "Product Details Filled", timestamp: "2026-02-23 at 10:15" },
        { name: "Lisa Anderson", email: "user@company.com", activity: "Submitted", timestamp: "2026-02-23 at 11:00" },
        {
          name: "Manager",
          email: "manager@company.com",
          activity: "Rejected",
          description:
            "The coating material is not suitable for the specified application. Please provide an alternative material that meets the required specifications.",
          timestamp: "2026-02-23 at 14:30",
        },
      ],
      engineeringNotes: [],
    },
  },
  {
    cprNumber: "CPR-2026-007",
    rfqNumber: "RFQ-2026-011",
    customerName: "CV Karya Mandiri",
    requestedProductName: "Custom Powder Coat Frame",
    requestedQuantity: 150,
    createdDate: "2026-02-25",
    createdBy: "David Kim",
    status: "Need Re-Evaluation",
    productNotes: "Customer requested a re-quote after price change.",
    attachments: [],
    productDetail: {
      productName: "Custom Powder Coat Frame",
      sku: "FRM-PC-003",
      category: "Custom Metal Parts",
      status: "Active",
      description: "Powder-coated frame assembly.",
      images: [],
      specification: { primaryMaterial: "Steel", finishing: "Powder Coated", weight: "3.5" },
      finishedDimensions: { height: "40", width: "40", length: "80" },
      packedDimensions: { height: "42", width: "42", length: "82" },
      containerCapacity: { "20ft": "400", "40ft": "850", "40ftHc": "950" },
      bom: {
        name: "Powder Coat Frame BOM",
        description: "",
        materials: [material("mat-011", 4)],
        routing: [{ step: 1, name: "Welding", operation: "-", hours: 4 }, { step: 2, name: "Powder Coating", operation: "-", hours: 2 }],
      },
      basePrice: 210000,
      leadTime: { value: "12", unit: "Day" },
      sellingPrice: 0,
      salesPriceList: [],
    },
    logs: {
      requestedBy: "David Kim",
      requestedAt: "2026-02-25 at 10:00",
      approvers: [{ name: "John Doe", role: "Product Manager", status: "Pending", comments: "" }],
      activity: [
        { name: "David Kim", email: "user@company.com", activity: "Created", timestamp: "2026-02-25 at 09:30" },
        { name: "David Kim", email: "user@company.com", activity: "Product Details Filled", timestamp: "2026-02-25 at 10:15" },
        { name: "David Kim", email: "user@company.com", activity: "Submitted", timestamp: "2026-02-25 at 11:00" },
        {
          name: "Manager",
          email: "manager@company.com",
          activity: "Rejected",
          description:
            "The proposed pricing and lead time do not align with current market conditions. The CPR has been rejected pending a full re-evaluation of material costs and production timeline.",
          timestamp: "2026-02-25 at 13:15",
        },
        {
          name: "Sales Team",
          email: "sales@company.com",
          activity: "Re-Evaluation Requested",
          description:
            "After reviewing the customer's final requirements, the price and lead time need to be re-evaluated. Please re-assess the material cost and production timeline for this custom frame order.",
          timestamp: "2026-02-25 at 14:30",
        },
      ],
      engineeringNotes: [
        {
          author: "Engineering Team",
          note: "Initial CPR filled with full BOM and routing details. Ready for approval.",
          timestamp: "2026-02-25 at 14:49",
        },
      ],
    },
  },
];

const applyPatch = (record) => {
  const patch = runtimePatches[record.cprNumber];
  return patch ? { ...record, ...patch } : record;
};

export const getCprs = () => INITIAL_REQUESTS.map(applyPatch);

export const getCpr = (cprNumber) => getCprs().find((r) => r.cprNumber === cprNumber) || null;

export const updateCpr = (cprNumber, patch) => {
  const current = getCpr(cprNumber);
  if (!current) return null;
  const next = { ...current, ...patch };
  runtimePatches = { ...runtimePatches, [cprNumber]: next };
  return next;
};

export const addEngineeringNote = (cprNumber, note) => {
  const current = getCpr(cprNumber);
  if (!current) return null;
  return updateCpr(cprNumber, {
    logs: { ...current.logs, engineeringNotes: [...(current.logs?.engineeringNotes || []), note] },
  });
};

// Mirrors the Purchase Order module's approval decision flow: a submitted
// record's single approver can Approve / Reject / Ask for Revision, each
// logged as an activity entry with the approver's comment.
export const decideCprApproval = (cprNumber, { decision, comment }) => {
  const current = getCpr(cprNumber);
  if (!current) return null;

  const statusByDecision = {
    approve: "Completed",
    reject: "Rejected",
    revision: "Need Revision",
  };
  const activityLabelByDecision = {
    approve: "Approved",
    reject: "Rejected",
    revision: "Ask for Revision",
  };
  const approverStatusByDecision = {
    approve: "Approved",
    reject: "Rejected",
    revision: "Pending",
  };

  const finalComment = comment || (decision === "approve" ? "CPR approved and product created in catalog" : "");
  const approvers = (current.logs?.approvers || []).map((a, idx) =>
    idx === 0 ? { ...a, status: approverStatusByDecision[decision], comments: decision === "revision" ? "" : finalComment } : a
  );
  const activityEntry = {
    name: "Manager",
    email: "manager@company.com",
    activity: activityLabelByDecision[decision],
    description: finalComment,
    timestamp: "just now",
  };

  return updateCpr(cprNumber, {
    status: statusByDecision[decision],
    logs: {
      ...current.logs,
      approvers,
      activity: [...(current.logs?.activity || []), activityEntry],
    },
  });
};

// Only reachable from "Rejected" — a separate Sales Team action that reopens
// the CPR for another pricing/lead-time pass without going through Draft.
export const requestCprReEvaluation = (cprNumber, comment) => {
  const current = getCpr(cprNumber);
  if (!current) return null;
  const approvers = (current.logs?.approvers || []).map((a, idx) => (idx === 0 ? { ...a, status: "Pending", comments: "" } : a));
  const activityEntry = {
    name: "Sales Team",
    email: "sales@company.com",
    activity: "Re-Evaluation Requested",
    description: comment,
    timestamp: "just now",
  };
  return updateCpr(cprNumber, {
    status: "Need Re-Evaluation",
    logs: {
      ...current.logs,
      approvers,
      activity: [...(current.logs?.activity || []), activityEntry],
    },
  });
};

export const saveCprProductDetail = (cprNumber, { productDetail, submit, actorName = "Natasha Smith" }) => {
  const current = getCpr(cprNumber);
  if (!current) return null;
  const nextStatus = submit ? "Submitted" : "Draft";
  const filledEntry = {
    name: actorName,
    email: `${actorName.toLowerCase().replace(/\s+/g, ".")}@company.com`,
    activity: "Product Details Filled",
    timestamp: "just now",
  };
  const activity = [...(current.logs?.activity || []), filledEntry];
  if (submit) {
    activity.push({ ...filledEntry, activity: "Submitted", timestamp: "just now" });
  }
  const approvers = submit
    ? (current.logs?.approvers?.length
        ? current.logs.approvers.map((a) => ({ ...a, status: "Pending", comments: "" }))
        : [{ name: "John Doe", role: "Product Manager", status: "Pending", comments: "" }])
    : current.logs?.approvers || [];
  return updateCpr(cprNumber, {
    status: nextStatus,
    productDetail,
    logs: { ...current.logs, approvers, activity },
  });
};
