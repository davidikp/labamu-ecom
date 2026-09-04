export const MOCK_TRACEABILITY_DATA = [
  {
    id: 1,
    batchNo: "BN-20240426-001",
    material: {
      name: "Aluminium Sheet 2mm",
      sku: "ALU-SH-2MM",
      image: "https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=100&h=100"
    },
    workOrderNos: ["WO-202604-001", "WO-202604-002"],
    products: [
      { name: "Aluminum Frame X1", sku: "ALU-FR-X1" },
      { name: "Aluminum Frame X2", sku: "ALU-FR-X2" }
    ],
    received: "30 SHT",
    documents: [
      { id: "doc1", description: "Material Certificate", file: { name: "cert-alu-001.pdf" } },
      { id: "doc2", description: "Quality Inspection", file: { name: "qa-report-202404.pdf" } },
      { id: "doc_extra_1", description: "Packing List", file: { name: "packing-list-alu.pdf" } }
    ]
  },
  {
    id: 2,
    batchNo: "BN-20240426-002",
    material: {
      name: "Aluminium Sheet 2mm",
      sku: "ALU-SH-2MM",
      image: "https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=100&h=100"
    },
    workOrderNos: ["WO-202604-005"],
    products: [
      { name: "Aluminum Case B2", sku: "ALU-CS-B2" }
    ],
    received: "30 SHT",
    documents: [
      { id: "doc3", description: "Batch Receipt", file: { name: "receipt-bn-002.pdf" } }
    ]
  },
  {
    id: 3,
    batchNo: "BN-20240427-005",
    material: {
      name: "Steel Pipe 1/2 inch",
      sku: "STL-PIPE-05",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=100&h=100"
    },
    workOrderNos: ["WO-202604-002", "WO-202604-003", "WO-202604-004"],
    products: [
      { name: "Steel Structure S1", sku: "STL-STR-S1" },
      { name: "Steel Base Plate", sku: "STL-BP-01" }
    ],
    received: "120 M",
    documents: []
  },
  {
    id: 4,
    batchNo: "BN-20240428-010",
    material: {
      name: "Copper Wire 1.5mm",
      sku: "COP-W-15",
      image: "https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=100&h=100"
    },
    workOrderNos: ["WO-202604-004"],
    products: [
      { name: "Motor Winding M2", sku: "MOT-WND-M2" }
    ],
    received: "10 ROL",
    documents: [
      { id: "doc4", description: "Import Document", file: { name: "import-permit-1.pdf" } }
    ]
  },
  {
    id: 5,
    batchNo: "BN-20240429-015",
    material: {
      name: "Plastic Resin HDPE",
      sku: "PLS-HDPE",
      image: "https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=100&h=100"
    },
    workOrderNos: ["WO-202604-009"],
    products: [
      { name: "Plastic Case V1", sku: "PLS-CS-V1" }
    ],
    received: "500 KG",
    documents: [
      { id: "doc5", description: "MSDS Report", file: { name: "msds-hdpe-001.pdf" } },
      { id: "doc6", description: "COA Document", file: { name: "coa-hdpe-2024.pdf" } },
      { id: "doc7", description: "Safety Protocol", file: { name: "safety-hdpe.pdf" } },
      { id: "doc8", description: "Technical Spec", file: { name: "tech-spec-hdpe.pdf" } }
    ]
  }
];
