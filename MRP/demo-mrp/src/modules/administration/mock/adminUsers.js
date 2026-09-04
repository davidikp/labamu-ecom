export const MOCK_ADMIN_USERS = [
  {
    id: "user-1",
    name: "Natasha Smith",
    email: "natasha.smith@labamu.com",
    role: "Owner",
    group: "Executive",
    status: "Active",
  },
  {
    id: "user-2",
    name: "Joko",
    email: "joko@labamu.com",
    role: "Procurement Admin",
    group: "Procurement",
    status: "Active",
  },
  {
    id: "user-3",
    name: "Naomi",
    email: "naomi@labamu.com",
    role: "Finance Manager",
    group: "Finance",
    status: "Active",
  },
  {
    id: "user-4",
    name: "Budi Santoso",
    email: "budi.santoso@labamu.com",
    role: "Production Planner",
    group: "Operations",
    status: "Active",
  },
  {
    id: "user-5",
    name: "Sarah Johnson",
    email: "sarah.johnson@labamu.com",
    role: "Sales Coordinator",
    group: "Commercial",
    status: "Inactive",
  },
];

export const MOCK_ADMIN_ROLES = [
  {
    id: "role-1",
    name: "Owner",
    description: "Full access to all modules and configurations.",
    scope: "Full Access",
    status: "Active",
  },
  {
    id: "role-2",
    name: "Procurement Admin",
    description: "Manage purchase orders, receipts, and vendor documents.",
    scope: "Procurement",
    status: "Active",
  },
  {
    id: "role-3",
    name: "Finance Manager",
    description: "Review values, tax, and approval-related settings.",
    scope: "Finance",
    status: "Active",
  },
  {
    id: "role-4",
    name: "Production Planner",
    description: "Manage work orders, routing stages, and outsource requests.",
    scope: "Manufacturing",
    status: "Active",
  },
  {
    id: "role-5",
    name: "Sales Coordinator",
    description: "Handle RFQ, quotes, and customer-facing processes.",
    scope: "Sales",
    status: "Inactive",
  },
];

export const MOCK_ADMIN_GROUPS = [
  {
    id: "group-1",
    name: "Executive",
    description: "Leadership team for business-wide oversight.",
    members: ["Natasha Smith"],
    allowedRoles: ["Owner"],
  },
  {
    id: "group-2",
    name: "Procurement",
    description: "Purchasing, vendor, and receipt operations.",
    members: ["Joko"],
    allowedRoles: ["Procurement Admin", "Finance Manager"],
  },
  {
    id: "group-3",
    name: "Operations",
    description: "Work order planning and production execution.",
    members: ["Budi Santoso"],
    allowedRoles: ["Production Planner"],
  },
  {
    id: "group-4",
    name: "Commercial",
    description: "Customer quotation and sales follow-up workflows.",
    members: ["Sarah Johnson"],
    allowedRoles: ["Sales Coordinator"],
  },
];
