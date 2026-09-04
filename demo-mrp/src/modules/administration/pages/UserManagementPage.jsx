import React, { useEffect, useState } from "react";
import {
  AddIcon,
  ChevronDownIcon,
  CloseIcon,
  DeleteIcon,
  EditIcon,
  Info,
  MoreVerticalIcon,
  RoleIcon,
  TeamIcon,
  UserIcon,
} from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { Checkbox } from "../../../components/common/Checkbox.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { FormField, InputField, UnifiedInputShell } from "../../../components/index.js";
import {
  MOCK_ADMIN_GROUPS,
  MOCK_ADMIN_ROLES,
  MOCK_ADMIN_USERS,
} from "../mock/adminUsers.js";

const Tooltip = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
      }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible ? (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: "8px",
            maxWidth: "1600px",
            width: "max-content",
            padding: "8px 12px",
            borderRadius: "8px",
            background: "var(--neutral-on-surface-primary)",
            color: "var(--neutral-surface-primary)",
            fontSize: "var(--text-desc)",
            lineHeight: "1.6",
            boxShadow: "var(--elevation-sm)",
            zIndex: 1000,
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          {content}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              borderWidth: "6px",
              borderStyle: "solid",
              borderColor:
                "var(--neutral-on-surface-primary) transparent transparent transparent",
            }}
          />
        </div>
      ) : null}
    </div>
  );
};



const poReferenceTableFrameStyle = {
  overflow: "hidden",
  width: "100%",
};

const poReferenceTableScrollerStyle = {
  overflowX: "auto",
  width: "100%",
};

const poReferenceTableInnerStyle = (minWidth = "100%") => ({
  minWidth,
  width: "100%",
  display: "flex",
  flexDirection: "column",
});

const poReferenceTableHeaderRowStyle = (gridTemplateColumns) => ({
  display: "grid",
  gridTemplateColumns,
  gap: "0",
  padding: "0 16px",
  height: "49px",
  alignItems: "center",
  background: "var(--neutral-surface-primary)",
  borderBottom: "1px solid var(--neutral-line-separator-1)",
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
});

const poReferenceTableRowStyle = (
  gridTemplateColumns,
  isLast = false,
  overrides = {}
) => ({
  display: "grid",
  gridTemplateColumns,
  gap: "0",
  padding: "0 16px",
  minHeight: "64px",
  alignItems: "center",
  borderBottom: isLast ? "none" : "1px solid var(--neutral-line-separator-1)",
  background: "var(--neutral-surface-primary)",
  ...overrides,
});

const poReferenceTableHeaderCellStyle = (overrides = {}) => ({
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  ...overrides,
});

const poReferenceTableCellStyle = (overrides = {}) => ({
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

const poReferenceTableEmptyStateStyle = {
  padding: "32px",
  textAlign: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-tertiary)",
  background: "var(--neutral-surface-primary)",
};

const administrationTabRowStyle = (isActive) => ({
  height: "46px",
  padding: "0 20px",
  border: "none",
  borderBottom: isActive
    ? "2px solid var(--feature-brand-primary)"
    : "2px solid var(--neutral-line-separator-2)",
  background: "transparent",
  color: isActive
    ? "var(--feature-brand-primary)"
    : "var(--neutral-on-surface-secondary)",
  fontSize: "var(--text-title-2)",
  fontWeight: isActive
    ? "var(--font-weight-bold)"
    : "var(--font-weight-regular)",
  cursor: "pointer",
});

const ADMIN_PERMISSION_ACCESS_OPTIONS = [
  { value: "no_access", label: "No Access" },
  { value: "view_only", label: "View Only" },
  { value: "edit", label: "Edit (Create + Edit)" },
  {
    value: "full_access",
    label: "Full Access (Create + Update + Delete)",
  },
];

const ADMIN_PERMISSION_ACCESS_LABELS = {
  no_access: "No Access",
  view_only: "View Only",
  edit: "Edit",
  full_access: "Full Access",
};

const ADMIN_PERMISSION_TREE = [
  { key: "dashboard", label: "Dashboard" },
  {
    key: "products",
    label: "Products",
    children: [
      { key: "product_catalog", label: "Product Catalog" },
      { key: "product_category", label: "Product Category" },
      {
        key: "custom_product_request",
        label: "Custom Product Request",
        approvable: true,
      },
    ],
  },
  {
    key: "sales",
    label: "Sales",
    children: [
      {
        key: "request_for_quotes",
        label: "Request for Quotes",
        approvable: true,
      },
      { key: "quotes", label: "Quotes" },
      { key: "orders", label: "Orders" },
      { key: "invoices", label: "Invoices" },
      { key: "customers", label: "Customers" },
      { key: "shipment", label: "Shipment" },
      { key: "approval_setting", label: "Approval Setting" },
    ],
  },
  {
    key: "inventory",
    label: "Inventory",
    children: [
      { key: "materials", label: "Materials" },
      { key: "material_category", label: "Material Category" },
      { key: "material_uom", label: "Material UOM" },
      { key: "batches", label: "Batches" },
      { key: "stock_transaction", label: "Stock Transaction" },
      { key: "vendors", label: "Vendors" },
      { key: "material_preparation", label: "Material Preparation" },
      { key: "material_receipt", label: "Material Receipt" },
    ],
  },
  {
    key: "manufacturing",
    label: "Manufacturing",
    children: [
      { key: "bill_of_materials", label: "Bill of Materials" },
      { key: "routings", label: "Routings" },
      { key: "work_orders", label: "Work Orders", approvable: true },
      { key: "material_requests", label: "Material Requests" },
      { key: "purchase_order", label: "Purchase Order", approvable: true },
    ],
  },
  {
    key: "analytics_reports",
    label: "Analytics & Reports",
    children: [
      { key: "sales_report", label: "Sales Report" },
      { key: "finance_report", label: "Finance Report" },
      { key: "order_report", label: "Order Report" },
      { key: "inventory_report", label: "Inventory Report" },
      { key: "work_order_monitoring", label: "Work Order Monitoring" },
    ],
  },
  {
    key: "administration",
    label: "Administration",
    children: [
      { key: "user_management", label: "User Management" },
      { key: "fx_management", label: "FX Management" },
      { key: "company_settings", label: "Company Settings" },
    ],
  },
  {
    key: "help",
    label: "Help",
    children: [{ key: "user_guide", label: "User Guide" }],
  },
];

function flattenAdminPermissionNodes(nodes, parentKey = null) {
  return nodes.flatMap((node) => [
    { ...node, parentKey },
    ...(node.children
      ? flattenAdminPermissionNodes(node.children, node.key)
      : []),
  ]);
}

const ADMIN_PERMISSION_NODES = flattenAdminPermissionNodes(ADMIN_PERMISSION_TREE);
const ADMIN_PERMISSION_NODE_MAP = ADMIN_PERMISSION_NODES.reduce(
  (accumulator, node) => {
    accumulator[node.key] = node;
    return accumulator;
  },
  {}
);
const ADMIN_PERMISSION_LEAF_NODES = ADMIN_PERMISSION_NODES.filter(
  (node) => !node.children?.length
);
const ADMIN_PERMISSION_EXPANDABLE_KEYS = ADMIN_PERMISSION_TREE.filter(
  (node) => node.children?.length
).map((node) => node.key);
const ADMIN_PERMISSION_DESCENDANT_KEYS = ADMIN_PERMISSION_TREE.reduce(
  (accumulator, node) => {
    accumulator[node.key] = node.children
      ? flattenAdminPermissionNodes(node.children).map((child) => child.key)
      : [];
    return accumulator;
  },
  {}
);

const createAdminPermissionState = (defaultLevel = "no_access") =>
  ADMIN_PERMISSION_NODES.reduce((accumulator, node) => {
    accumulator[node.key] = {
      level: defaultLevel,
      canApprove: false,
    };
    return accumulator;
  }, {});

const cloneAdminPermissionState = (permissions = {}) => {
  const nextState = createAdminPermissionState();

  ADMIN_PERMISSION_NODES.forEach((node) => {
    const nextLevel = permissions?.[node.key]?.level || "no_access";
    nextState[node.key] = {
      level: nextLevel,
      canApprove:
        !!node.approvable &&
        nextLevel !== "no_access" &&
        Boolean(permissions?.[node.key]?.canApprove),
    };
  });

  return nextState;
};

const assignAdminPermissionLevel = (state, keys, level, canApprove = false) => {
  keys.forEach((key) => {
    if (!state[key]) return;
    state[key].level = level;
    if (ADMIN_PERMISSION_NODE_MAP[key]?.approvable) {
      state[key].canApprove = level !== "no_access" && canApprove;
    }
  });
};

const ADMIN_PERMISSION_GROUP_KEYS = {
  products: ["products", "product_catalog", "product_category", "custom_product_request"],
  sales: [
    "sales",
    "request_for_quotes",
    "quotes",
    "orders",
    "invoices",
    "customers",
    "shipment",
    "approval_setting",
  ],
  inventory: [
    "inventory",
    "materials",
    "material_category",
    "material_uom",
    "batches",
    "stock_transaction",
    "vendors",
    "material_preparation",
    "material_receipt",
  ],
  manufacturing: [
    "manufacturing",
    "bill_of_materials",
    "routings",
    "work_orders",
    "material_requests",
    "purchase_order",
  ],
  analytics_reports: [
    "analytics_reports",
    "sales_report",
    "finance_report",
    "order_report",
    "inventory_report",
    "work_order_monitoring",
  ],
  administration: [
    "administration",
    "user_management",
    "fx_management",
    "company_settings",
  ],
  help: ["help", "user_guide"],
};

const buildAdminRolePermissions = (role) => {
  const permissions = createAdminPermissionState();
  const roleName = role?.name;

  if (role?.permissions) {
    return cloneAdminPermissionState(role.permissions);
  }

  if (roleName === "Owner" || role?.scope === "Full Access") {
    assignAdminPermissionLevel(
      permissions,
      ADMIN_PERMISSION_NODES.map((node) => node.key),
      "full_access",
      true
    );
    return permissions;
  }

  if (roleName === "Procurement Admin") {
    assignAdminPermissionLevel(permissions, ["dashboard"], "view_only");
    assignAdminPermissionLevel(
      permissions,
      ADMIN_PERMISSION_GROUP_KEYS.inventory,
      "edit"
    );
    assignAdminPermissionLevel(
      permissions,
      ADMIN_PERMISSION_GROUP_KEYS.manufacturing,
      "edit"
    );
    assignAdminPermissionLevel(permissions, ["work_orders"], "view_only", false);
    assignAdminPermissionLevel(permissions, ["purchase_order"], "full_access");
    assignAdminPermissionLevel(permissions, ["material_requests"], "edit");
    assignAdminPermissionLevel(permissions, ["vendors"], "edit");
    assignAdminPermissionLevel(permissions, ["material_receipt"], "edit");
    assignAdminPermissionLevel(permissions, ADMIN_PERMISSION_GROUP_KEYS.help, "view_only");
    return permissions;
  }

  if (roleName === "Finance Manager") {
    assignAdminPermissionLevel(permissions, ["dashboard"], "view_only");
    assignAdminPermissionLevel(
      permissions,
      ["purchase_order", "finance_report", "order_report", "company_settings"],
      "full_access",
      true
    );
    assignAdminPermissionLevel(
      permissions,
      ["manufacturing", "analytics_reports", "administration", "notification_settings"],
      "view_only"
    );
    assignAdminPermissionLevel(
      permissions,
      ["sales_report", "inventory_report", "work_order_monitoring"],
      "view_only"
    );
    assignAdminPermissionLevel(permissions, ADMIN_PERMISSION_GROUP_KEYS.help, "view_only");
    return permissions;
  }

  if (roleName === "Production Planner") {
    assignAdminPermissionLevel(permissions, ["dashboard"], "view_only");
    assignAdminPermissionLevel(
      permissions,
      ADMIN_PERMISSION_GROUP_KEYS.manufacturing,
      "full_access"
    );
    assignAdminPermissionLevel(permissions, ["work_orders"], "full_access", true);
    assignAdminPermissionLevel(
      permissions,
      ["inventory", "materials", "material_preparation", "material_receipt", "vendors"],
      "view_only"
    );
    assignAdminPermissionLevel(
      permissions,
      ["analytics_reports", "work_order_monitoring", "inventory_report"],
      "view_only"
    );
    assignAdminPermissionLevel(permissions, ADMIN_PERMISSION_GROUP_KEYS.help, "view_only");
    return permissions;
  }

  if (roleName === "Sales Coordinator") {
    assignAdminPermissionLevel(permissions, ["dashboard"], "view_only");
    assignAdminPermissionLevel(
      permissions,
      ADMIN_PERMISSION_GROUP_KEYS.products,
      "view_only"
    );
    assignAdminPermissionLevel(
      permissions,
      ADMIN_PERMISSION_GROUP_KEYS.sales,
      "edit"
    );
    assignAdminPermissionLevel(
      permissions,
      ["request_for_quotes", "quotes", "orders", "customers", "shipment"],
      "full_access",
      true
    );
    assignAdminPermissionLevel(permissions, ["invoices", "approval_setting"], "view_only");
    assignAdminPermissionLevel(permissions, ["sales_report"], "view_only");
    assignAdminPermissionLevel(permissions, ADMIN_PERMISSION_GROUP_KEYS.help, "view_only");
    return permissions;
  }

  return permissions;
};

const seedAdminRoles = (roles = []) =>
  roles.map((role) => ({
    ...role,
    permissions: buildAdminRolePermissions(role),
  }));

const adminManagementTableHeaderRowStyle = (gridTemplateColumns) => ({
  display: "grid",
  gridTemplateColumns,
  columnGap: "16px",
  padding: "12px 20px",
  minHeight: "unset",
  alignItems: "center",
  background: "var(--neutral-surface-primary)",
  borderBottom: "1px solid var(--neutral-line-separator-1)",
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
  boxSizing: "border-box",
});

const adminManagementTableRowStyle = (
  gridTemplateColumns,
  isLast = false,
  overrides = {}
) => ({
  display: "grid",
  gridTemplateColumns,
  columnGap: "16px",
  padding: "12px 20px",
  minHeight: "unset",
  alignItems: "center",
  background: "var(--neutral-surface-primary)",
  borderBottom: isLast ? "none" : "1px solid var(--neutral-line-separator-1)",
  boxSizing: "border-box",
  ...overrides,
});

const adminManagementTableCellStyle = (overrides = {}) => ({
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

const resolveAdminRoleAccess = (roleName, roles = []) => {
  const matchedRole = roles.find((role) => role.name === roleName);
  if (!matchedRole?.permissions) return [];

  return ADMIN_PERMISSION_LEAF_NODES.reduce((entries, node) => {
    const permission = matchedRole.permissions[node.key];
    if (!permission || permission.level === "no_access") return entries;
    entries.push(
      `${node.label} -> ${ADMIN_PERMISSION_ACCESS_LABELS[permission.level]}${
        node.approvable && permission.canApprove ? " (Can Approve)" : ""
      }`
    );
    return entries;
  }, []);
};

const buildRolePermissionDiff = (currentRole, nextRole, roles = []) => {
  const currentAccess = resolveAdminRoleAccess(currentRole, roles);
  const nextAccess = resolveAdminRoleAccess(nextRole, roles);

  return {
    losing: currentAccess.filter((item) => !nextAccess.includes(item)),
    gaining: nextAccess.filter((item) => !currentAccess.includes(item)),
  };
};

const AdministrationUserManagement = ({ isSidebarCollapsed }) => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState(MOCK_ADMIN_USERS);
  const [roles, setRoles] = useState(() => seedAdminRoles(MOCK_ADMIN_ROLES));
  const [groups, setGroups] = useState(MOCK_ADMIN_GROUPS);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPageByTab, setCurrentPageByTab] = useState({
    users: 1,
    roles: 1,
    groups: 1,
  });
  const [tableSearchByTab, setTableSearchByTab] = useState({
    users: "",
    roles: "",
    groups: "",
  });
  const [tableFiltersByTab, setTableFiltersByTab] = useState({
    users: {
      role: "all",
      group: "all",
      status: "all",
    },
    roles: {
      status: "all",
    },
    groups: {
      role: "all",
    },
  });
  const [openToolbarFilterKey, setOpenToolbarFilterKey] = useState(null);
  const [toolbarFilterTriggerRect, setToolbarFilterTriggerRect] = useState(null);
  const [pendingUserEdits, setPendingUserEdits] = useState({});
  const [userChangesModal, setUserChangesModal] = useState(null);
  const [roleChangesExpanded, setRoleChangesExpanded] = useState(false);
  const [teamChangesExpanded, setTeamChangesExpanded] = useState(false);
  const [roleDrawerState, setRoleDrawerState] = useState({
    open: false,
    mode: "create",
    id: null,
    originalName: "",
    name: "",
    description: "",
    permissions: createAdminPermissionState(),
  });
  const [roleDrawerErrors, setRoleDrawerErrors] = useState({});
  const [expandedRolePermissionKeys, setExpandedRolePermissionKeys] = useState(
    ADMIN_PERMISSION_EXPANDABLE_KEYS
  );
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, type: null, data: null });
  const [adminSnackbar, setAdminSnackbar] = useState({ open: false, message: "" });
  const [hoveredRoleMenuItem, setHoveredRoleMenuItem] = useState(null);
  const [hoveredGroupMenuItem, setHoveredGroupMenuItem] = useState(null);
  const [isHoveredConfirmDelete, setIsHoveredConfirmDelete] = useState(false);

  const [openRoleActionMenuId, setOpenRoleActionMenuId] = useState(null);
  const [roleActionMenuPosition, setRoleActionMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const [groupModalState, setGroupModalState] = useState({
    open: false,
    mode: "create",
    id: null,
    name: "",
    description: "",
    members: [],
    allowedRoles: [],
  });
  const [groupModalErrors, setGroupModalErrors] = useState({});
  const [openGroupActionMenuId, setOpenGroupActionMenuId] = useState(null);
  const [groupActionMenuPosition, setGroupActionMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    setOpenToolbarFilterKey(null);
    setToolbarFilterTriggerRect(null);
  }, [activeTab]);

  const showAdminSnackbar = (message) => {
    setAdminSnackbar({ open: true, message });
    setTimeout(() => setAdminSnackbar({ open: false, message: "" }), 3000);
  };

  const rolePermissionTableColumns = "minmax(0, 1.2fr) 248px 132px";

  const displayedUsers = users.map((user) => {
    const combined = { ...user, ...(pendingUserEdits[user.id] || {}) };
    const roleExists = roles.some((r) => r.name === combined.role);
    const groupExists = groups.some((g) => g.name === combined.group);
    
    return {
      ...combined,
      role: roleExists ? combined.role : "Unassigned",
      group: groupExists ? combined.group : "Unassigned",
    };
  });
  const roleOptions = roles.map((role) => ({ value: role.name, label: role.name }));
  const assignableRoleOptions = [
    { value: "Unassigned", label: "Unassigned" },
    ...roleOptions,
  ];
  const groupOptions = [
    { value: "Unassigned", label: "Unassigned" },
    ...groups.map((group) => ({ value: group.name, label: group.name })),
  ];
  const userOptions = users.map((user) => ({ 
    value: user.name, 
    label: user.name,
    email: user.email 
  }));

  const syncUsersFromGroups = (nextGroups, baseUsers) =>
    baseUsers.map((user) => {
      const matchedGroup = nextGroups.find((group) =>
        group.members.includes(user.name)
      );
      return {
        ...user,
        group: matchedGroup ? matchedGroup.name : "Unassigned",
      };
    });

  const applyRowsPerPage = (nextRowsPerPage) => {
    setRowsPerPage(nextRowsPerPage);
    setCurrentPageByTab({
      users: 1,
      roles: 1,
      groups: 1,
    });
  };

  const updateTabPage = (tabId, nextPage) => {
    setCurrentPageByTab((prev) => ({ ...prev, [tabId]: nextPage }));
  };

  const paginateRows = (rows, tabId) => {
    const totalRows = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
    const currentPage = Math.min(currentPageByTab[tabId] || 1, totalPages);
    const startIndex = (currentPage - 1) * rowsPerPage;

    return {
      rows: rows.slice(startIndex, startIndex + rowsPerPage),
      totalRows,
      totalPages,
      currentPage,
    };
  };



  const showRoleToast = (message) => {
    showAdminSnackbar(message);
  };

  const updateTableSearch = (tabId, nextValue) => {
    setTableSearchByTab((prev) => ({ ...prev, [tabId]: nextValue }));
  };

  const updateTableFilter = (tabId, filterKey, nextValue) => {
    setTableFiltersByTab((prev) => ({
      ...prev,
      [tabId]: {
        ...prev[tabId],
        [filterKey]: nextValue,
      },
    }));
    setCurrentPageByTab((prev) => ({ ...prev, [tabId]: 1 }));
  };

  const createEmptyRoleDrawerState = () => ({
    open: false,
    mode: "create",
    id: null,
    originalName: "",
    name: "",
    description: "",
    permissions: createAdminPermissionState(),
  });

  const closeRoleDrawer = () => {
    setRoleDrawerErrors({});
    setOpenRoleActionMenuId(null);
    setRoleDrawerState(createEmptyRoleDrawerState());
  };

  const openCreateRoleDrawer = () => {
    setRoleDrawerErrors({});
    setRoleDrawerState({
      open: true,
      mode: "create",
      id: null,
      originalName: "",
      name: "",
      description: "",
      permissions: createAdminPermissionState(),
    });
    setExpandedRolePermissionKeys(ADMIN_PERMISSION_EXPANDABLE_KEYS);
  };

  const openEditRoleDrawer = (role) => {
    setRoleDrawerErrors({});
    setOpenRoleActionMenuId(null);
    setRoleDrawerState({
      open: true,
      mode: "edit",
      id: role.id,
      originalName: role.name,
      name: role.name,
      description: role.description,
      permissions: cloneAdminPermissionState(role.permissions),
    });
    setExpandedRolePermissionKeys(ADMIN_PERMISSION_EXPANDABLE_KEYS);
  };

  const updateRolePermissionLevel = (key, nextLevel) => {
    setRoleDrawerState((prev) => {
      const nextPermissions = cloneAdminPermissionState(prev.permissions);
      const targetKeys = [key, ...(ADMIN_PERMISSION_DESCENDANT_KEYS[key] || [])];

      targetKeys.forEach((targetKey) => {
        nextPermissions[targetKey].level = nextLevel;
        if (
          ADMIN_PERMISSION_NODE_MAP[targetKey]?.approvable &&
          nextLevel === "no_access"
        ) {
          nextPermissions[targetKey].canApprove = false;
        }
      });

      let ancestorKey = ADMIN_PERMISSION_NODE_MAP[key]?.parentKey;
      while (ancestorKey) {
        const directChildLevels = (
          ADMIN_PERMISSION_NODE_MAP[ancestorKey]?.children || []
        ).map((childNode) => nextPermissions[childNode.key]?.level || "no_access");
        const hasUniformLevel = directChildLevels.every(
          (level) => level === directChildLevels[0]
        );
        const sortedLevels = ["no_access", "view_only", "edit", "full_access"];
        const aggregateLevel = hasUniformLevel
          ? directChildLevels[0]
          : [...directChildLevels].sort(
              (left, right) =>
                sortedLevels.indexOf(right) - sortedLevels.indexOf(left)
            )[0];

        nextPermissions[ancestorKey].level = aggregateLevel;
        ancestorKey = ADMIN_PERMISSION_NODE_MAP[ancestorKey]?.parentKey;
      }

      return {
        ...prev,
        permissions: nextPermissions,
      };
    });
  };

  const updateRolePermissionApprove = (key, checked) => {
    setRoleDrawerState((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: {
          ...prev.permissions[key],
          canApprove:
            prev.permissions[key]?.level !== "no_access" && Boolean(checked),
        },
      },
    }));
  };

  const toggleRolePermissionGroup = (key) => {
    setExpandedRolePermissionKeys((prev) =>
      prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key]
    );
  };

  const getRolePermissionSummary = (permissions) => {
    const counts = ADMIN_PERMISSION_LEAF_NODES.reduce(
      (accumulator, node) => {
        const level = permissions?.[node.key]?.level || "no_access";
        accumulator[level] += 1;
        return accumulator;
      },
      {
        full_access: 0,
        edit: 0,
        view_only: 0,
        no_access: 0,
      }
    );

    if (counts.full_access === ADMIN_PERMISSION_LEAF_NODES.length) {
      return [{ key: "all-full", text: "All Features (Full Access)" }];
    }

    if (counts.view_only === ADMIN_PERMISSION_LEAF_NODES.length) {
      return [{ key: "all-view", text: "All Features (View Only)" }];
    }

    return ["full_access", "edit", "view_only", "no_access"]
      .filter((level) => counts[level] > 0)
      .map((level) => ({
        key: level,
        text: `${counts[level]} Features (${ADMIN_PERMISSION_ACCESS_LABELS[level]})`,
      }));
  };

  const saveRoleDrawer = () => {
    const trimmedName = roleDrawerState.name.trim();
    const trimmedDescription = roleDrawerState.description.trim();
    const nextErrors = {};

    if (!trimmedName) nextErrors.name = "Role name is required";
    if (
      roles.some(
        (role) =>
          role.id !== roleDrawerState.id &&
          role.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      nextErrors.name = "Role name already exists";
    }

    if (Object.keys(nextErrors).length > 0) {
      setRoleDrawerErrors(nextErrors);
      return;
    }

    if (roleDrawerState.mode === "edit") {
      setRoles((prev) =>
        prev.map((role) =>
          role.id === roleDrawerState.id
            ? {
                ...role,
                name: trimmedName,
                description:
                  trimmedDescription || "Updated role for access configuration.",
                permissions: cloneAdminPermissionState(roleDrawerState.permissions),
              }
            : role
        )
      );

      if (trimmedName !== roleDrawerState.originalName) {
        setUsers((prev) =>
          prev.map((user) =>
            user.role === roleDrawerState.originalName
              ? { ...user, role: trimmedName }
              : user
          )
        );
        setGroups((prev) =>
          prev.map((group) => ({
            ...group,
            allowedRoles: group.allowedRoles.map((roleName) =>
              roleName === roleDrawerState.originalName ? trimmedName : roleName
            ),
          }))
        );
      }
    } else {
      setRoles((prev) => [
        ...prev,
        {
          id: `role-${Date.now()}`,
          name: trimmedName,
          description:
            trimmedDescription || "New role for access configuration.",
          status: "Active",
          permissions: cloneAdminPermissionState(roleDrawerState.permissions),
        },
      ]);
    }

    showRoleToast(
      roleDrawerState.mode === "edit"
        ? "Role updated successfully"
        : "Role created successfully"
    );
    closeRoleDrawer();
  };

  const updatePendingUserEdit = (userId, patch) => {
    const baseUser = users.find((user) => user.id === userId);
    if (!baseUser) return;

    setPendingUserEdits((prev) => {
      const currentDraft = prev[userId] || {
        role: baseUser.role,
        group: baseUser.group,
      };
      const nextDraft = { ...currentDraft, ...patch };

      if (
        nextDraft.role === baseUser.role &&
        nextDraft.group === baseUser.group
      ) {
        const { [userId]: _removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [userId]: nextDraft,
      };
    });
  };

  const buildGroupsFromUsers = (nextUsers, baseGroups) =>
    baseGroups.map((group) => ({
      ...group,
      members: nextUsers
        .filter((user) => user.group === group.name)
        .map((user) => user.name),
    }));

  const openUserChangesModal = () => {
    const changes = users
      .filter((user) => pendingUserEdits[user.id])
      .map((user) => {
        const draft = pendingUserEdits[user.id];
        const nextRole = draft.role !== undefined ? draft.role : user.role;
        const nextGroup = draft.group !== undefined ? draft.group : user.group;
        const roleChanged = nextRole !== user.role;
        const groupChanged = nextGroup !== user.group;
        const roleDiff =
          roleChanged
            ? buildRolePermissionDiff(user.role, nextRole, roles)
            : { losing: [], gaining: [] };

        // Determine risk note: flag when gaining critical permissions (new role is not unassigned/dash)
        let riskNote = null;
        if (roleChanged && nextRole && nextRole !== "-") {
          if (roleDiff.gaining.length > 0) {
            riskNote = `Grants ${roleDiff.gaining.slice(0, 2).join(", ")}${roleDiff.gaining.length > 2 ? " and more" : ""} access`;
          } else if (roleDiff.losing.length > 0) {
            riskNote = `Removes ${roleDiff.losing.slice(0, 2).join(", ")}${roleDiff.losing.length > 2 ? " and more" : ""} permissions`;
          }
        }

        return {
          userId: user.id,
          userName: user.name,
          currentRole: user.role,
          nextRole,
          currentGroup: user.group,
          nextGroup,
          roleChanged,
          groupChanged,
          losing: roleDiff.losing,
          gaining: roleDiff.gaining,
          riskNote,
        };
      });

    if (changes.length === 0) return;
    setRoleChangesExpanded(false);
    setTeamChangesExpanded(false);
    setUserChangesModal({ changes });
  };

  const confirmUserChanges = () => {
    if (!userChangesModal) return;

    const nextUsers = users.map((user) =>
      pendingUserEdits[user.id]
        ? { ...user, ...pendingUserEdits[user.id] }
        : user
    );
    const nextGroups = buildGroupsFromUsers(nextUsers, groups);

    setUsers(nextUsers);
    setGroups(nextGroups);
    setPendingUserEdits({});
    setUserChangesModal(null);
    showRoleToast("User access updated successfully");
  };



  const confirmDeleteRole = (role) => {
    setRoles((prev) => prev.filter((item) => item.id !== role.id));
    setUsers((prev) =>
      prev.map((user) =>
        user.role === role.name ? { ...user, role: "-" } : user
      )
    );
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        allowedRoles: group.allowedRoles.filter(
          (roleName) => roleName !== role.name
        ),
      }))
    );
    setDeleteConfirmation({ open: false, type: null, data: null });
    showAdminSnackbar(`${role.name} role successfully deleted`);
  };

  const handleDeleteRole = (role) => {
    setDeleteConfirmation({ open: true, type: "role", data: role });
  };

  const openCreateGroupModal = () => {
    setGroupModalErrors({});
    setGroupModalState({
      open: true,
      mode: "create",
      id: null,
      name: "",
      description: "",
      members: [],
      allowedRoles: [],
    });
  };

  const openEditGroupModal = (group) => {
    setGroupModalErrors({});
    setGroupModalState({
      open: true,
      mode: "edit",
      id: group.id,
      name: group.name,
      description: group.description,
      members: [...group.members],
      allowedRoles: [...group.allowedRoles],
    });
  };

  const closeGroupModal = () => {
    setGroupModalErrors({});
    setGroupModalState({
      open: false,
      mode: "create",
      id: null,
      name: "",
      description: "",
      members: [],
      allowedRoles: [],
    });
  };

  const saveGroupModal = () => {
    const trimmedName = groupModalState.name.trim();
    const trimmedDescription = groupModalState.description.trim();
    const nextErrors = {};

    if (!trimmedName) nextErrors.name = "Group name is required";
    if (
      groups.some(
        (group) =>
          group.id !== groupModalState.id &&
          group.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      nextErrors.name = "Group name already exists";
    }

    if (Object.keys(nextErrors).length > 0) {
      setGroupModalErrors(nextErrors);
      return;
    }

    let nextGroups;
    if (groupModalState.mode === "edit") {
      nextGroups = groups.map((group) =>
        group.id === groupModalState.id
          ? {
              ...group,
              name: trimmedName,
              description:
                trimmedDescription ||
                "Updated group for shared role assignment.",
              members: [...groupModalState.members],
              allowedRoles: [...groupModalState.allowedRoles],
            }
          : group
      );
    } else {
      nextGroups = [
        ...groups,
        {
          id: `group-${Date.now()}`,
          name: trimmedName,
          description:
            trimmedDescription || "New group for shared role assignment.",
          members: [...groupModalState.members],
          allowedRoles: [...groupModalState.allowedRoles],
        },
      ];
    }

    setGroups(nextGroups);
    setUsers(syncUsersFromGroups(nextGroups, users));
    closeGroupModal();
  };

  const confirmDeleteGroup = (group) => {
    const nextGroups = groups.filter((item) => item.id !== group.id);
    setGroups(nextGroups);
    setUsers(syncUsersFromGroups(nextGroups, users));
    setDeleteConfirmation({ open: false, type: null, data: null });
    showAdminSnackbar(`${group.name} team successfully deleted`);
  };

  const handleDeleteGroup = (group) => {
    setDeleteConfirmation({ open: true, type: "team", data: group });
    setOpenGroupActionMenuId(null);
  };

  const hasPendingUserChanges = Object.keys(pendingUserEdits).length > 0;
  const userSearch = tableSearchByTab.users.trim().toLowerCase();
  const roleSearch = tableSearchByTab.roles.trim().toLowerCase();
  const groupSearch = tableSearchByTab.groups.trim().toLowerCase();

  const filteredUsers = displayedUsers.filter((user) => {
    const matchesSearch =
      !userSearch ||
      `${user.name} ${user.email} ${user.role} ${user.group} ${user.status}`
        .toLowerCase()
        .includes(userSearch);
    const matchesRole =
      tableFiltersByTab.users.role === "all" ||
      user.role === tableFiltersByTab.users.role;
    const matchesGroup =
      tableFiltersByTab.users.group === "all" ||
      user.group === tableFiltersByTab.users.group;
    const matchesStatus =
      tableFiltersByTab.users.status === "all" ||
      user.status === tableFiltersByTab.users.status;

    return matchesSearch && matchesRole && matchesGroup && matchesStatus;
  });

  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      !roleSearch ||
      `${role.name} ${role.description} ${role.status}`
        .toLowerCase()
        .includes(roleSearch);
    const matchesStatus =
      tableFiltersByTab.roles.status === "all" ||
      role.status === tableFiltersByTab.roles.status;
    return matchesSearch && matchesStatus;
  });

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      !groupSearch ||
      `${group.name} ${group.description} ${group.members.join(" ")} ${group.allowedRoles.join(" ")}`
        .toLowerCase()
        .includes(groupSearch);
    const matchesRole =
      tableFiltersByTab.groups.role === "all" ||
      group.allowedRoles.includes(tableFiltersByTab.groups.role);
    return matchesSearch && matchesRole;
  });

  const usersPagination = paginateRows(filteredUsers, "users");
  const rolesPagination = paginateRows(filteredRoles, "roles");
  const groupsPagination = paginateRows(filteredGroups, "groups");

  const currentPagination =
    activeTab === "users"
      ? usersPagination
      : activeTab === "roles"
        ? rolesPagination
        : groupsPagination;

  const activeHeaderAction = (
    <div style={{ display: "flex", gap: "12px" }}>
      <Button
        size="small"
        variant="outlined"
        leftIcon={AddIcon}
        onClick={openCreateRoleDrawer}
      >
        New Role
      </Button>
      <Button
        size="small"
        variant="outlined"
        leftIcon={AddIcon}
        onClick={openCreateGroupModal}
      >
        New Team
      </Button>
    </div>
  );
  const renderTableToolbar = () => {
    const toolbarRowStyle = {
      padding: "12px 20px",
      borderBottom: "1px solid var(--neutral-line-separator-1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
      flexWrap: "wrap",
      flexShrink: 0,
      background: "var(--neutral-surface-primary)",
    };

    const toolbarFilterConfig = (() => {
      if (!openToolbarFilterKey) return null;

      if (openToolbarFilterKey === "users-role") {
        return {
          title: "Role",
          value: tableFiltersByTab.users.role,
          options: [{ value: "all", label: "All Roles" }, ...roleOptions],
          onChange: (nextValue) => updateTableFilter("users", "role", nextValue),
        };
      }
      if (openToolbarFilterKey === "users-team") {
        return {
          title: "Team",
          value: tableFiltersByTab.users.group,
          options: [
            { value: "all", label: "All Teams" },
            ...groupOptions.filter((option) => option.value !== "-"),
          ],
          onChange: (nextValue) => updateTableFilter("users", "group", nextValue),
        };
      }
      if (openToolbarFilterKey === "users-status") {
        return {
          title: "Status",
          value: tableFiltersByTab.users.status,
          options: [
            { value: "all", label: "All Status" },
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
          ],
          onChange: (nextValue) => updateTableFilter("users", "status", nextValue),
        };
      }
      if (openToolbarFilterKey === "roles-status") {
        return {
          title: "Status",
          value: tableFiltersByTab.roles.status,
          options: [
            { value: "all", label: "All Status" },
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
          ],
          onChange: (nextValue) => updateTableFilter("roles", "status", nextValue),
        };
      }
      if (openToolbarFilterKey === "groups-role") {
        return {
          title: "Role",
          value: tableFiltersByTab.groups.role,
          options: [{ value: "all", label: "All Roles" }, ...roleOptions],
          onChange: (nextValue) => updateTableFilter("groups", "role", nextValue),
        };
      }
      return null;
    })();

    if (activeTab === "users") {
      return (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={toolbarRowStyle}>
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                position: "relative",
              }}
            >
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setToolbarFilterTriggerRect(rect);
                  setOpenToolbarFilterKey((prev) =>
                    prev === "users-role" ? null : "users-role"
                  );
                }}
              >
                <FilterPill
                  label="Role"
                  active={tableFiltersByTab.users.role !== "all"}
                  isOpen={openToolbarFilterKey === "users-role"}
                  count={tableFiltersByTab.users.role !== "all" ? 1 : 0}
                />
              </div>
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setToolbarFilterTriggerRect(rect);
                  setOpenToolbarFilterKey((prev) =>
                    prev === "users-team" ? null : "users-team"
                  );
                }}
              >
                <FilterPill
                  label="Team"
                  active={tableFiltersByTab.users.group !== "all"}
                  isOpen={openToolbarFilterKey === "users-team"}
                  count={tableFiltersByTab.users.group !== "all" ? 1 : 0}
                />
              </div>
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setToolbarFilterTriggerRect(rect);
                  setOpenToolbarFilterKey((prev) =>
                    prev === "users-status" ? null : "users-status"
                  );
                }}
              >
                <FilterPill
                  label="Status"
                  active={tableFiltersByTab.users.status !== "all"}
                  isOpen={openToolbarFilterKey === "users-status"}
                  count={tableFiltersByTab.users.status !== "all" ? 1 : 0}
                />
              </div>

              {openToolbarFilterKey && toolbarFilterConfig ? (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 80 }}
                    onClick={() => setOpenToolbarFilterKey(null)}
                  />
                  <div
                    style={{
                      position: "fixed",
                      top: toolbarFilterTriggerRect
                        ? `${toolbarFilterTriggerRect.bottom + 8}px`
                        : "160px",
                      left: toolbarFilterTriggerRect
                        ? `${toolbarFilterTriggerRect.left}px`
                        : "0",
                      width: "360px",
                      background: "var(--neutral-surface-primary)",
                      border: "1px solid var(--neutral-line-separator-1)",
                      borderRadius: "var(--radius-card)",
                      boxShadow: "var(--elevation-sm)",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      zIndex: 1000,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "var(--text-title-2)",
                          fontWeight: "var(--font-weight-bold)",
                        }}
                      >
                        {toolbarFilterConfig.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          toolbarFilterConfig.onChange("all");
                          setOpenToolbarFilterKey(null);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          color: "var(--status-red-primary)",
                          cursor: "pointer",
                          fontSize: "var(--text-body)",
                          fontWeight: "var(--font-weight-bold)",
                        }}
                      >
                        Remove Filter
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        maxHeight: "260px",
                        overflowY: "auto",
                        paddingRight: "4px",
                      }}
                    >
                      {toolbarFilterConfig.options.map((option) => (
                        <label
                          key={String(option.value)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            cursor: "pointer",
                            fontSize: "var(--text-title-3)",
                          }}
                        >
                          <input
                            type="radio"
                            name={`admin-toolbar-filter-${openToolbarFilterKey}`}
                            checked={
                              String(toolbarFilterConfig.value) ===
                              String(option.value)
                            }
                            onChange={() => {
                              toolbarFilterConfig.onChange(option.value);
                              setOpenToolbarFilterKey(null);
                            }}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <TableSearchField
              value={tableSearchByTab.users}
              onChange={(event) => updateTableSearch("users", event.target.value)}
              placeholder="Search user, email, role"
              width="320px"
            />
          </div>

          {hasPendingUserChanges ? (
            <div
              style={{
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-small)",
                  background: "var(--feature-brand-container-darker)",
                  border: "1px solid var(--feature-brand-container-darker)",
                }}
              >
                <Info
                  size={16}
                  strokeWidth={2.1}
                  color="var(--feature-brand-primary)"
                  style={{ flexShrink: 0, marginTop: "2px" }}
                />
                <span
                  style={{
                    fontSize: "var(--text-title-3)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                    lineHeight: "20px",
                    letterSpacing: "0.0962px",
                  }}
                >
                  You have unsaved changes ({Object.keys(pendingUserEdits).length} user{Object.keys(pendingUserEdits).length > 1 ? "s" : ""})
                </span>
              </div>
              <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setPendingUserEdits({})}
                >
                  Discard
                </Button>
                <Button size="small" variant="filled" onClick={openUserChangesModal}>
                  Save Changes
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      );
    }

    if (activeTab === "roles") {
      return (
        <div style={toolbarRowStyle}>
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              position: "relative",
            }}
          >
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setToolbarFilterTriggerRect(rect);
                setOpenToolbarFilterKey((prev) =>
                  prev === "roles-status" ? null : "roles-status"
                );
              }}
            >
              <FilterPill
                label="Status"
                active={tableFiltersByTab.roles.status !== "all"}
                isOpen={openToolbarFilterKey === "roles-status"}
                count={tableFiltersByTab.roles.status !== "all" ? 1 : 0}
              />
            </div>

            {openToolbarFilterKey === "roles-status" && toolbarFilterConfig ? (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 80 }}
                  onClick={() => setOpenToolbarFilterKey(null)}
                />
                <div
                  style={{
                    position: "fixed",
                    top: toolbarFilterTriggerRect
                      ? `${toolbarFilterTriggerRect.bottom + 8}px`
                      : "160px",
                    left: toolbarFilterTriggerRect
                      ? `${toolbarFilterTriggerRect.left}px`
                      : "0",
                    width: "360px",
                    background: "var(--neutral-surface-primary)",
                    border: "1px solid var(--neutral-line-separator-1)",
                    borderRadius: "var(--radius-card)",
                    boxShadow: "var(--elevation-sm)",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-title-2)",
                        fontWeight: "var(--font-weight-bold)",
                      }}
                    >
                      {toolbarFilterConfig.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        toolbarFilterConfig.onChange("all");
                        setOpenToolbarFilterKey(null);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "var(--status-red-primary)",
                        cursor: "pointer",
                        fontSize: "var(--text-body)",
                        fontWeight: "var(--font-weight-bold)",
                      }}
                    >
                      Remove Filter
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {toolbarFilterConfig.options.map((option) => (
                      <label
                        key={String(option.value)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          cursor: "pointer",
                          fontSize: "var(--text-title-3)",
                        }}
                      >
                        <input
                          type="radio"
                          name="admin-toolbar-filter-roles-status"
                          checked={
                            String(toolbarFilterConfig.value) ===
                            String(option.value)
                          }
                          onChange={() => {
                            toolbarFilterConfig.onChange(option.value);
                            setOpenToolbarFilterKey(null);
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
          <TableSearchField
            value={tableSearchByTab.roles}
            onChange={(event) => updateTableSearch("roles", event.target.value)}
            placeholder="Search role, description"
            width="320px"
          />
        </div>
      );
    }

    return (
      <div style={toolbarRowStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            position: "relative",
          }}
        >
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setToolbarFilterTriggerRect(rect);
              setOpenToolbarFilterKey((prev) =>
                prev === "groups-role" ? null : "groups-role"
              );
            }}
          >
            <FilterPill
              label="Role"
              active={tableFiltersByTab.groups.role !== "all"}
              isOpen={openToolbarFilterKey === "groups-role"}
              count={tableFiltersByTab.groups.role !== "all" ? 1 : 0}
            />
          </div>

          {openToolbarFilterKey === "groups-role" && toolbarFilterConfig ? (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 80 }}
                onClick={() => setOpenToolbarFilterKey(null)}
              />
              <div
                style={{
                  position: "fixed",
                  top: toolbarFilterTriggerRect
                    ? `${toolbarFilterTriggerRect.bottom + 8}px`
                    : "160px",
                  left: toolbarFilterTriggerRect
                    ? `${toolbarFilterTriggerRect.left}px`
                    : "0",
                  width: "360px",
                  background: "var(--neutral-surface-primary)",
                  border: "1px solid var(--neutral-line-separator-1)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "var(--elevation-sm)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-title-2)",
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    {toolbarFilterConfig.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      toolbarFilterConfig.onChange("all");
                      setOpenToolbarFilterKey(null);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      color: "var(--status-red-primary)",
                      cursor: "pointer",
                      fontSize: "var(--text-body)",
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    Remove Filter
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    maxHeight: "260px",
                    overflowY: "auto",
                    paddingRight: "4px",
                  }}
                >
                  {toolbarFilterConfig.options.map((option) => (
                    <label
                      key={String(option.value)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer",
                        fontSize: "var(--text-title-3)",
                      }}
                    >
                      <input
                        type="radio"
                        name="admin-toolbar-filter-groups-role"
                        checked={
                          String(toolbarFilterConfig.value) ===
                          String(option.value)
                        }
                        onChange={() => {
                          toolbarFilterConfig.onChange(option.value);
                          setOpenToolbarFilterKey(null);
                        }}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
        <TableSearchField
          value={tableSearchByTab.groups}
          onChange={(event) => updateTableSearch("groups", event.target.value)}
          placeholder="Search team, member, role"
          width="320px"
        />
      </div>
    );
  };

  const renderUsersTab = () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={adminManagementTableHeaderRowStyle(
          "1.1fr 1.3fr 1.1fr 1.4fr 0.9fr 0.8fr"
        )}
      >
        <div style={adminManagementTableCellStyle({ fontWeight: "var(--font-weight-bold)" })}>
          User
        </div>
        <div style={adminManagementTableCellStyle({ fontWeight: "var(--font-weight-bold)" })}>
          Email
        </div>
        <div style={adminManagementTableCellStyle({ fontWeight: "var(--font-weight-bold)" })}>
          Assign Role
        </div>
        <div style={adminManagementTableCellStyle({ fontWeight: "var(--font-weight-bold)" })}>
          Permissions
        </div>
        <div style={adminManagementTableCellStyle({ fontWeight: "var(--font-weight-bold)" })}>
          Team
        </div>
        <div style={adminManagementTableCellStyle({ fontWeight: "var(--font-weight-bold)" })}>
          Status
        </div>
      </div>
      {usersPagination.rows.map((user, index) => {
        const baseUser = users.find((item) => item.id === user.id) || user;
        const roleChanged = user.role !== baseUser.role;
        const groupChanged = user.group !== baseUser.group;
        return (
          <div
            key={user.id}
            style={adminManagementTableRowStyle(
              "1.1fr 1.3fr 1.1fr 1.4fr 0.9fr 0.8fr",
              index === usersPagination.rows.length - 1,
              roleChanged || groupChanged
                ? {
                    minHeight: "82px",
                    paddingTop: "10px",
                    paddingBottom: "10px",
                    alignItems: "stretch",
                  }
                : {}
            )}
          >
            <div
              style={adminManagementTableCellStyle({
                fontWeight: "var(--font-weight-regular)",
              })}
            >
              {user.name}
            </div>
            <div style={adminManagementTableCellStyle()}>{user.email}</div>
            <div
              style={adminManagementTableCellStyle({
                alignItems: "stretch",
              })}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  justifyContent: "center",
                }}
              >
                <DropdownSelect
                  value={user.role || "Unassigned"}
                  onChange={(nextValue) =>
                    updatePendingUserEdit(user.id, { role: nextValue })
                  }
                  options={assignableRoleOptions}
                  fieldHeight="40px"
                  placeholder="Select Role"
                  borderRadius="8px"
                  fontSize="var(--text-title-3)"
                  optionFontSize="var(--text-title-3)"
                />
                {roleChanged ? (
                  <span
                    style={{
                      fontSize: "12px",
                      lineHeight: "16px",
                      color: "var(--status-orange-primary)",
                    }}
                  >
                    ⚠ This change will update access permissions
                  </span>
                ) : null}
              </div>
            </div>
            <div
              style={adminManagementTableCellStyle({
                flexWrap: "wrap",
                gap: "6px",
                alignContent: "center",
              })}
            >
              {(() => {
                const userRoleName = user.role || "Unassigned";
                const userRole = roles.find((r) => r.name === userRoleName);
                if (!userRole) {
                  return <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>-</span>;
                }
                const summary = getRolePermissionSummary(userRole.permissions);
                if (summary.length === 0) {
                   return <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>No access</span>;
                }
                return summary.slice(0, 3).map((summaryChip) => (
                  <span
                    key={summaryChip.key}
                    style={{
                      height: "28px",
                      padding: "0 10px",
                      borderRadius: "8px",
                      background: "var(--feature-brand-container-lighter)",
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: "12px",
                      color: "var(--neutral-on-surface-primary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {summaryChip.text}
                  </span>
                ));
              })()}
            </div>
            <div
              style={adminManagementTableCellStyle({
                alignItems: "stretch",
              })}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <DropdownSelect
                  value={user.group || "Unassigned"}
                  onChange={(nextValue) =>
                    updatePendingUserEdit(user.id, { group: nextValue })
                  }
                  options={groupOptions}
                  fieldHeight="40px"
                  placeholder="Select Team"
                  borderRadius="8px"
                  fontSize="var(--text-title-3)"
                  optionFontSize="var(--text-title-3)"
                />
              </div>
            </div>
            <div style={adminManagementTableCellStyle()}>
              <StatusBadge
                variant={user.status === "Active" ? "green-light" : "grey-light"}
              >
                {user.status}
              </StatusBadge>
            </div>
          </div>
        );
      })}
      {usersPagination.totalRows === 0 ? (
        <div style={poReferenceTableEmptyStateStyle}>No users found.</div>
      ) : null}
    </div>
  );

  const renderRolesTab = () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={adminManagementTableHeaderRowStyle(
          "1.05fr 1.5fr 1.7fr 0.85fr 72px"
        )}
      >
        <div style={adminManagementTableCellStyle({ fontWeight: "var(--font-weight-bold)" })}>
          Role
        </div>
        <div style={adminManagementTableCellStyle({ fontWeight: "var(--font-weight-bold)" })}>
          Description
        </div>
        <div style={adminManagementTableCellStyle({ fontWeight: "var(--font-weight-bold)" })}>
          Permissions
        </div>
        <div style={adminManagementTableCellStyle({ fontWeight: "var(--font-weight-bold)" })}>
          Status
        </div>
        <div
          style={adminManagementTableCellStyle({
            fontWeight: "var(--font-weight-bold)",
            justifyContent: "center",
          })}
        >
          Action
        </div>
      </div>
      {rolesPagination.rows.map((role, index) => {
        const memberCount = users.filter((user) => user.role === role.name).length;

        return (
          <div
            key={role.id}
            style={adminManagementTableRowStyle(
              "1.05fr 1.5fr 1.7fr 0.85fr 72px",
              index === rolesPagination.rows.length - 1
            )}
          >
            <div
              style={adminManagementTableCellStyle({
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "2px",
              })}
            >
              <span style={{ fontWeight: "var(--font-weight-bold)" }}>
                {role.name}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--neutral-on-surface-secondary)",
                }}
              >
                {memberCount} members
              </span>
            </div>
            <div style={adminManagementTableCellStyle()}>{role.description}</div>
            <div
              style={adminManagementTableCellStyle({
                flexWrap: "wrap",
                gap: "8px",
                alignContent: "center",
              })}
            >
              {getRolePermissionSummary(role.permissions).map((summaryChip) => (
                <span
                  key={summaryChip.key}
                  style={{
                    height: "28px",
                    padding: "0 8px",
                    borderRadius: "8px",
                    background: "var(--feature-brand-container-lighter)",
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: "12px",
                    color: "var(--neutral-on-surface-primary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {summaryChip.text}
                </span>
              ))}
            </div>
            <div style={adminManagementTableCellStyle()}>
              <StatusBadge
                variant={role.status === "Active" ? "green-light" : "grey-light"}
              >
                {role.status}
              </StatusBadge>
            </div>
            <div
              style={adminManagementTableCellStyle({
                justifyContent: "center",
                position: "relative",
              })}
            >
              <button
                type="button"
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  setRoleActionMenuPosition({
                    top: rect.bottom + 8,
                    left: rect.right - 176,
                  });
                  setOpenRoleActionMenuId((prev) =>
                    prev === role.id ? null : role.id
                  );
                }}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid var(--neutral-line-separator-1)",
                  background: "var(--neutral-surface-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <MoreVerticalIcon
                  size={16}
                  color="var(--neutral-on-surface-secondary)"
                />
              </button>

              {openRoleActionMenuId === role.id ? (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 90 }}
                    onClick={() => setOpenRoleActionMenuId(null)}
                  />
                  <div
                    style={{
                      position: "fixed",
                      top: roleActionMenuPosition.top,
                      left: roleActionMenuPosition.left,
                      minWidth: "180px",
                      padding: "4px 0",
                      background: "var(--neutral-surface-primary)",
                      border: "1px solid var(--neutral-line-separator-1)",
                      borderRadius: "var(--radius-small)",
                      boxShadow: "var(--elevation-sm)",
                      zIndex: 9999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      onMouseEnter={() =>
                        setHoveredRoleMenuItem(`edit-${role.id}`)
                      }
                      onMouseLeave={() => setHoveredRoleMenuItem(null)}
                      onClick={() => {
                        setOpenRoleActionMenuId(null);
                        openEditRoleDrawer(role);
                      }}
                      style={{
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        fontSize: "var(--text-title-3)",
                        color: "var(--neutral-on-surface-primary)",
                        background:
                          hoveredRoleMenuItem === `edit-${role.id}`
                            ? "var(--neutral-surface-grey-lighter)"
                            : "transparent",
                      }}
                    >
                      <EditIcon size={16} /> Edit
                    </div>
                    <div
                      onMouseEnter={() =>
                        setHoveredRoleMenuItem(`delete-${role.id}`)
                      }
                      onMouseLeave={() => setHoveredRoleMenuItem(null)}
                      onClick={() => {
                        setOpenRoleActionMenuId(null);
                        handleDeleteRole(role);
                      }}
                      style={{
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        fontSize: "var(--text-title-3)",
                        color: "var(--status-red-primary)",
                        background:
                          hoveredRoleMenuItem === `delete-${role.id}`
                            ? "#FAE6E8"
                            : "transparent",
                      }}
                    >
                      <DeleteIcon
                        size={16}
                        color="var(--status-red-primary)"
                      />
                      Delete
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        );
      })}
      {rolesPagination.totalRows === 0 ? (
        <div style={poReferenceTableEmptyStateStyle}>No roles found.</div>
      ) : null}
    </div>
  );

  const renderGroupsTab = () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={adminManagementTableHeaderRowStyle(
          "1fr 1.5fr 1fr 72px"
        )}
      >
        <div style={adminManagementTableCellStyle({ fontWeight: "var(--font-weight-bold)" })}>
          Team
        </div>
        <div style={adminManagementTableCellStyle({ fontWeight: "var(--font-weight-bold)" })}>
          Description
        </div>
        <div style={adminManagementTableCellStyle({ fontWeight: "var(--font-weight-bold)" })}>
          Members
        </div>
        <div
          style={adminManagementTableCellStyle({
            fontWeight: "var(--font-weight-bold)",
            justifyContent: "center",
          })}
        >
          Action
        </div>
      </div>
      {groupsPagination.rows.map((group, index) => (
        <div
          key={group.id}
          style={adminManagementTableRowStyle(
            "1fr 1.5fr 1fr 72px",
            index === groupsPagination.rows.length - 1
          )}
        >
          <div
            style={adminManagementTableCellStyle({
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "4px",
            })}
          >
            <span style={{ fontWeight: "var(--font-weight-bold)" }}>
              {group.name}
            </span>
            <span
              style={{
                fontSize: "12px",
                color: "var(--neutral-on-surface-secondary)",
              }}
            >
              {group.members.length} members
            </span>
          </div>
          <div
            style={adminManagementTableCellStyle({
              color: "var(--neutral-on-surface-secondary)",
            })}
          >
            {group.description}
          </div>
          <div
            style={adminManagementTableCellStyle({
              flexWrap: "wrap",
              gap: "6px",
              alignContent: "center",
            })}
          >
            {group.members.length > 0 ? (
              group.members.map((member) => (
                <StatusBadge key={member} variant="grey-light">
                  {member}
                </StatusBadge>
              ))
            ) : (
              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>
                -
              </span>
            )}
          </div>
            <div
              style={adminManagementTableCellStyle({
                justifyContent: "center",
                position: "relative",
              })}
            >
              <button
                type="button"
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  setGroupActionMenuPosition({
                    top: rect.bottom + 8,
                    left: rect.right - 176,
                  });
                  setOpenGroupActionMenuId((prev) =>
                    prev === group.id ? null : group.id
                  );
                }}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid var(--neutral-line-separator-1)",
                  background: "var(--neutral-surface-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <MoreVerticalIcon
                  size={16}
                  color="var(--neutral-on-surface-secondary)"
                />
              </button>

              {openGroupActionMenuId === group.id ? (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 90 }}
                    onClick={() => setOpenGroupActionMenuId(null)}
                  />
                  <div
                    style={{
                      position: "fixed",
                      top: groupActionMenuPosition.top,
                      left: groupActionMenuPosition.left,
                      minWidth: "180px",
                      padding: "4px 0",
                      background: "var(--neutral-surface-primary)",
                      border: "1px solid var(--neutral-line-separator-1)",
                      borderRadius: "var(--radius-small)",
                      boxShadow: "var(--elevation-sm)",
                      zIndex: 9999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      onMouseEnter={() =>
                        setHoveredGroupMenuItem(`edit-${group.id}`)
                      }
                      onMouseLeave={() => setHoveredGroupMenuItem(null)}
                      onClick={() => {
                        setOpenGroupActionMenuId(null);
                        openEditGroupModal(group);
                      }}
                      style={{
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        fontSize: "var(--text-title-3)",
                        color: "var(--neutral-on-surface-primary)",
                        background:
                          hoveredGroupMenuItem === `edit-${group.id}`
                            ? "var(--neutral-surface-grey-lighter)"
                            : "transparent",
                      }}
                    >
                      <EditIcon size={16} /> Edit
                    </div>
                    <div
                      onMouseEnter={() =>
                        setHoveredGroupMenuItem(`delete-${group.id}`)
                      }
                      onMouseLeave={() => setHoveredGroupMenuItem(null)}
                      onClick={() => {
                        setOpenGroupActionMenuId(null);
                        handleDeleteGroup(group);
                      }}
                      style={{
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        fontSize: "var(--text-title-3)",
                        color: "var(--status-red-primary)",
                        background:
                          hoveredGroupMenuItem === `delete-${group.id}`
                            ? "#FAE6E8"
                            : "transparent",
                      }}
                    >
                      <DeleteIcon
                        size={16}
                        color="var(--status-red-primary)"
                      />
                      Delete
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        ))}
      {groupsPagination.totalRows === 0 ? (
        <div style={poReferenceTableEmptyStateStyle}>No teams found.</div>
      ) : null}
    </div>
  );

  const renderChipEditor = (items, onRemove, variant = "grey") => (
    <React.Fragment>
      {items.length > 0 ? (
        items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onRemove(item)}
            style={{
              border: "none",
              background:
                variant === "blue"
                  ? "var(--feature-brand-container-lighter)"
                  : "var(--neutral-surface-grey-lighter)",
              color:
                variant === "blue"
                  ? "var(--feature-brand-primary)"
                  : "var(--neutral-on-surface-primary)",
              height: "32px",
              padding: "0 12px",
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontSize: "var(--text-title-3)",
            }}
          >
            <span>{item}</span>
            <CloseIcon size={12} />
          </button>
        ))
      ) : null}
    </React.Fragment>
  );

  const renderRolePermissionRows = (nodes, depth = 0) =>
    nodes.map((node) => {
      const currentPermission = roleDrawerState.permissions[node.key] || {
        level: "no_access",
        canApprove: false,
      };
      const isExpandable = !!node.children?.length;
      const isExpanded = expandedRolePermissionKeys.includes(node.key);

      return (
        <React.Fragment key={node.key}>
          <div
            style={poReferenceTableRowStyle(rolePermissionTableColumns, false, {
              minHeight: "56px",
              paddingTop: "8px",
              paddingBottom: "8px",
            })}
          >
            <div
              style={poReferenceTableCellStyle({
                gap: "10px",
                paddingLeft: `${depth * 18}px`,
              })}
            >
              {isExpandable ? (
                <button
                  type="button"
                  onClick={() => toggleRolePermissionGroup(node.key)}
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    border: "1px solid var(--neutral-line-separator-1)",
                    background: "var(--neutral-surface-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <ChevronDownIcon
                    size={16}
                    color="var(--neutral-on-surface-secondary)"
                    style={{
                      transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                      transition: "transform 0.15s ease",
                    }}
                  />
                </button>
              ) : (
                <div style={{ width: "24px", flexShrink: 0 }} />
              )}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-3)",
                    fontWeight: isExpandable
                      ? "var(--font-weight-bold)"
                      : "var(--font-weight-regular)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  {node.label}
                </span>
                {node.approvable ? (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    Optional approval permission
                  </span>
                ) : null}
              </div>
            </div>

            <div style={poReferenceTableCellStyle()}>
              <DropdownSelect
                value={currentPermission.level}
                onChange={(nextValue) =>
                  updateRolePermissionLevel(node.key, nextValue)
                }
                options={ADMIN_PERMISSION_ACCESS_OPTIONS}
                fieldHeight="36px"
                borderRadius="10px"
                fontSize="var(--text-title-3)"
                optionFontSize="var(--text-title-3)"
                menuWidth={260}
              />
            </div>

            <div
              style={poReferenceTableCellStyle({ justifyContent: "center" })}
            >
              {node.approvable ? (
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor:
                      currentPermission.level === "no_access"
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  <Checkbox
                    checked={currentPermission.canApprove}
                    disabled={currentPermission.level === "no_access"}
                    onChange={(checked) =>
                      updateRolePermissionApprove(node.key, checked)
                    }
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--neutral-on-surface-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Can Approve
                  </span>
                </label>
              ) : null}
            </div>
          </div>

          {isExpandable && isExpanded
            ? renderRolePermissionRows(node.children, depth + 1)
            : null}
        </React.Fragment>
      );
    });

  return (
    <>
      <div
        style={{
          height: "calc(100vh - 64px)",
          padding: "24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          overflow: "hidden",
          minHeight: 0,
        }}
      >


        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "var(--text-large-title)",
              fontWeight: "var(--font-weight-bold)",
            }}
          >
            User Management
          </h1>
          {activeHeaderAction}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[
            {
              title: "Total Users",
              count: users.length,
              description: "Registered users with system access",
              icon: <UserIcon size={20} color="var(--feature-brand-primary)" />,
            },
            {
              title: "Total Roles",
              count: roles.length,
              description: "Defined permission sets and access levels",
              icon: <RoleIcon size={20} color="var(--feature-brand-primary)" />,
            },
            {
              title: "Total Teams",
              count: groups.length,
              description: "Functional groups and departments",
              icon: <TeamIcon size={20} color="var(--feature-brand-primary)" />,
            },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                background: "var(--neutral-surface-primary)",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid var(--neutral-line-separator-1)",
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "var(--feature-brand-container-lighter)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "13px", color: "var(--neutral-on-surface-secondary)" }}>
                  {card.title}
                </span>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                    lineHeight: "1",
                  }}
                >
                  {card.count}
                </span>
                <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>
                  {card.description}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "var(--neutral-surface-primary)",
            borderRadius: "12px",
            border: "1px solid var(--neutral-line-separator-1)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 0,
              padding: "0 20px 0 0",
              borderBottom: "1px solid var(--neutral-surface-grey-lighter)",
              background: "var(--neutral-surface-primary)",
              flexShrink: 0,
            }}
          >
            {[
              { id: "users", label: "User", count: users.length },
              { id: "roles", label: "Role", count: roles.length },
              { id: "groups", label: "Team", count: groups.length },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setOpenRoleActionMenuId(null);
                    setOpenGroupActionMenuId(null);
                  }}
                  style={{
                    ...administrationTabRowStyle(isActive),
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {renderTableToolbar()}

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
            }}
          >
            {activeTab === "users"
              ? renderUsersTab()
              : activeTab === "roles"
                ? renderRolesTab()
                : renderGroupsTab()}
          </div>

          <TablePaginationFooter
            totalRows={currentPagination.totalRows}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={applyRowsPerPage}
            currentPage={currentPagination.currentPage}
            totalPages={currentPagination.totalPages}
            onPageChange={(nextPage) => updateTabPage(activeTab, nextPage)}
          />
        </div>
      </div>
      {userChangesModal ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
          }}
        >
          <div
            style={{
              width: "680px",
              maxWidth: "calc(100vw - 32px)",
              background: "var(--neutral-surface-primary)",
              borderRadius: "24px",
              padding: "0",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              boxShadow: "var(--elevation-sm)",
              maxHeight: "90vh",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "64px 24px 20px",
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                textAlign: "center",
                position: "relative",
                flexShrink: 0,
              }}
            >
            <IconButton
              icon={CloseIcon}
              size="small"
              onClick={() => setUserChangesModal(null)}
              style={{ position: "absolute", top: "20px", right: "20px" }}
              color="var(--neutral-on-surface-primary)"
            />
              <h2
                style={{
                  margin: 0,
                  fontSize: "var(--text-headline)",
                  fontWeight: "var(--font-weight-bold)",
                }}
              >
                Confirm User Changes
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--text-title-2)",
                  color: "var(--neutral-on-surface-secondary)",
                  lineHeight: "22px",
                }}
              >
                Review the updates below before saving them to the system.
              </p>
            </div>

            <div
              style={{
                flex: "1 1 auto",
                minHeight: 0,
                overflowY: "auto",
                padding: "20px 24px 48px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {(() => {
                const roleChangeCount = userChangesModal.changes.filter((c) => c.roleChanged).length;
                const teamChangeCount = userChangesModal.changes.filter((c) => c.groupChanged).length;
                const totalCount = userChangesModal.changes.length;

                return (
                  <div
                    style={{
                      background: "var(--neutral-surface-secondary)",
                      borderRadius: "12px",
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-title-2)",
                        fontWeight: "var(--font-weight-bold)",
                      }}
                    >
                      You are updating {totalCount} user{totalCount !== 1 ? "s" : ""}:
                    </span>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      {roleChangeCount > 0 && (
                        <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)" }}>
                          • Role changes: {roleChangeCount} user{roleChangeCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      {teamChangeCount > 0 && (
                        <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)" }}>
                          • Team changes: {teamChangeCount} user{teamChangeCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {userChangesModal.changes.length < 4 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {userChangesModal.changes.map((change) => (
                    <div
                      key={change.userId}
                      style={{
                        border: "1px solid var(--neutral-line-separator-1)",
                        borderRadius: "12px",
                        padding: "12px 16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)" }}>
                        {change.userName}
                      </span>
                      {change.roleChanged && (
                        <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)" }}>
                          Role: {change.currentRole || "Unassigned"} → {change.nextRole || "Unassigned"}
                        </span>
                      )}
                      {change.groupChanged && (
                        <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)" }}>
                          Team: {change.currentGroup === "-" || !change.currentGroup ? "No team" : change.currentGroup} → {change.nextGroup === "-" || !change.nextGroup ? "No team" : change.nextGroup}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {userChangesModal.changes.some((c) => c.roleChanged) && (() => {
                    const roleGroups = {};
                    userChangesModal.changes
                      .filter((c) => c.roleChanged)
                      .forEach((c) => {
                        const key = c.nextRole || "Unassigned";
                        if (!roleGroups[key]) roleGroups[key] = [];
                        roleGroups[key].push(c);
                      });

                    return (
                      <div
                        style={{
                          border: "1px solid var(--neutral-line-separator-1)",
                          borderRadius: "12px",
                          overflow: "hidden",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setRoleChangesExpanded((prev) => !prev)}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            background: "var(--neutral-surface-primary)",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                            fontSize: "var(--text-title-3)",
                            fontWeight: "var(--font-weight-bold)",
                            textAlign: "left",
                          }}
                        >
                          <span>View Role Changes Detail</span>
                          <ChevronDownIcon
                            size={16}
                            style={{
                              transition: "transform 0.2s",
                              transform: roleChangesExpanded ? "rotate(-180deg)" : "rotate(0deg)",
                              flexShrink: 0,
                            }}
                          />
                        </button>

                        {roleChangesExpanded && (
                          <div
                            style={{
                              borderTop: "1px solid var(--neutral-line-separator-1)",
                              padding: "16px 16px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "16px",
                              maxHeight: "200px",
                              overflowY: "auto",
                              boxSizing: "border-box",
                            }}
                          >
                            {Object.entries(roleGroups).map(([roleName, members]) => (
                              <div key={roleName} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <span
                                  style={{
                                    fontSize: "var(--text-title-3)",
                                    fontWeight: "var(--font-weight-bold)",
                                  }}
                                >
                                  {roleName} ({members.length})
                                </span>
                                <ul
                                  style={{
                                    margin: 0,
                                    paddingLeft: "18px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "4px",
                                  }}
                                >
                                  {members.map((m) => (
                                    <li
                                      key={m.userId}
                                      style={{
                                        fontSize: "var(--text-title-3)",
                                        color: "var(--neutral-on-surface-secondary)",
                                      }}
                                    >
                                      {m.userName} — {m.currentRole || "Unassigned"} → {m.nextRole || "Unassigned"}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {userChangesModal.changes.some((c) => c.groupChanged) && (() => {
                    const teamGroups = {};
                    userChangesModal.changes
                      .filter((c) => c.groupChanged)
                      .forEach((c) => {
                        const key = c.nextGroup && c.nextGroup !== "-" ? `${c.nextGroup} Team` : "No Team";
                        if (!teamGroups[key]) teamGroups[key] = [];
                        teamGroups[key].push(c);
                      });

                    return (
                      <div
                        style={{
                          border: "1px solid var(--neutral-line-separator-1)",
                          borderRadius: "12px",
                          overflow: "hidden",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setTeamChangesExpanded((prev) => !prev)}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            background: "var(--neutral-surface-primary)",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                            fontSize: "var(--text-title-3)",
                            fontWeight: "var(--font-weight-bold)",
                            textAlign: "left",
                          }}
                        >
                          <span>View Team Changes Detail</span>
                          <ChevronDownIcon
                            size={16}
                            style={{
                              transition: "transform 0.2s",
                              transform: teamChangesExpanded ? "rotate(-180deg)" : "rotate(0deg)",
                              flexShrink: 0,
                            }}
                          />
                        </button>

                        {teamChangesExpanded && (
                          <div
                            style={{
                              borderTop: "1px solid var(--neutral-line-separator-1)",
                              padding: "16px 16px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "16px",
                              maxHeight: "200px",
                              overflowY: "auto",
                              boxSizing: "border-box",
                            }}
                          >
                            {Object.entries(teamGroups).map(([teamName, members]) => (
                               <div key={teamName} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <span
                                  style={{
                                    fontSize: "var(--text-title-3)",
                                    fontWeight: "var(--font-weight-bold)",
                                  }}
                                >
                                  {teamName} ({members.length})
                                </span>
                                <ul
                                  style={{
                                    margin: 0,
                                    paddingLeft: "18px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "4px",
                                  }}
                                >
                                  {members.map((m) => (
                                    <li
                                      key={m.userId}
                                      style={{
                                        fontSize: "var(--text-title-3)",
                                        color: "var(--neutral-on-surface-secondary)",
                                      }}
                                    >
                                      {m.userName} — {m.currentGroup === "-" || !m.currentGroup ? "No group" : m.currentGroup} → {m.nextGroup === "-" || !m.nextGroup ? "No group" : m.nextGroup}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>

            <div
              style={{
                padding: "16px 24px 24px",
                borderTop: "1px solid var(--neutral-line-separator-1)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                flexShrink: 0,
              }}
            >
              <Button
                variant="filled"
                size="large"
                style={{ width: "100%" }}
                onClick={confirmUserChanges}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                size="large"
                style={{ width: "100%" }}
                onClick={() => setUserChangesModal(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteConfirmation.open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 4000,
          }}
        >
          <div
            style={{
              width: "400px",
              background: "var(--neutral-surface-primary)",
              borderRadius: "24px",
              padding: "28px 22px 22px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              position: "relative",
              boxShadow: "var(--elevation-sm)",
            }}
          >
            <IconButton
              icon={CloseIcon}
              size="large"
              onClick={() => setDeleteConfirmation({ open: false, type: null, data: null })}
              style={{ position: "absolute", top: "16px", right: "16px" }}
              color="var(--neutral-on-surface-primary)"
            />
            <h2
              style={{
                margin: "20px 0 0 0",
                textAlign: "center",
                fontSize: "var(--text-headline)",
                fontWeight: "var(--font-weight-bold)",
              }}
            >
              Delete {deleteConfirmation.type === "role" ? "Role?" : "Team?"}
            </h2>
            <p
              style={{
                margin: 0,
                textAlign: "center",
                fontSize: "var(--text-title-3)",
                color: "var(--neutral-on-surface-secondary)",
                lineHeight: "1.6",
              }}
            >
              Are you sure you want to delete <b>{deleteConfirmation.data?.name}</b>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Button
                variant="filled"
                size="large"
                onMouseEnter={() => setIsHoveredConfirmDelete(true)}
                onMouseLeave={() => setIsHoveredConfirmDelete(false)}
                style={{
                  width: "100%",
                  backgroundColor: isHoveredConfirmDelete ? "#D32F2F" : "var(--status-red-primary)",
                  color: "white",
                  border: "none",
                  transition: "background-color 0.2s"
                }}
                onClick={() => {
                  if (deleteConfirmation.type === "role") {
                    confirmDeleteRole(deleteConfirmation.data);
                  } else {
                    confirmDeleteGroup(deleteConfirmation.data);
                  }
                }}
              >
                Yes, Delete
              </Button>
              <Button
                variant="outlined"
                size="large"
                style={{ width: "100%" }}
                onClick={() => setDeleteConfirmation({ open: false, type: null, data: null })}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {adminSnackbar.open && (
        <div
          style={{
            position: "fixed",
            top: "84px",
            right: "24px",
            width: "335px",
            minHeight: "51px",
            background: "var(--status-green-primary)",
            color: "var(--status-green-on-primary)",
            padding: "0 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            zIndex: 5000,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "16px", fontWeight: "400" }}>
              {adminSnackbar.message}
            </span>
          </div>
          <span
            style={{
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              color: "var(--status-green-on-primary)",
            }}
            onClick={() => setAdminSnackbar({ open: false, message: "" })}
          >
            Oke
          </span>
        </div>
      )}

      {roleDrawerState.open ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.28)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 13000,
          }}
        >
          <div
            style={{ position: "absolute", inset: 0 }}
            onClick={closeRoleDrawer}
          />
          <div
            style={{
              position: "relative",
              width: "820px",
              maxWidth: "calc(100vw - 24px)",
              height: "100vh",
              background: "var(--neutral-surface-primary)",
              boxShadow: "-12px 0 32px rgba(0, 0, 0, 0.08)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "24px 24px 20px",
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "var(--text-headline)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  {roleDrawerState.mode === "edit" ? "Edit Role" : "New Role"}
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: "var(--text-title-3)",
                    color: "var(--neutral-on-surface-secondary)",
                    lineHeight: "20px",
                  }}
                >
                  Configure what access this role gets across the system.
                </p>
              </div>
              <IconButton
                icon={CloseIcon}
                size="large"
                onClick={closeRoleDrawer}
                color="var(--neutral-on-surface-primary)"
              />
            </div>

            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gap: "16px",
                  paddingBottom: "24px",
                  borderBottom: "1px solid var(--neutral-line-separator-1)",
                }}
              >
                <InputField
                  label="Role Name"
                  value={roleDrawerState.name}
                  onChange={(event) => {
                    setRoleDrawerState((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }));
                    if (roleDrawerErrors.name) {
                      setRoleDrawerErrors((prev) => ({ ...prev, name: "" }));
                    }
                  }}
                  placeholder="Enter role name"
                  error={roleDrawerErrors.name}
                />
                <InputField
                  label="Description"
                  value={roleDrawerState.description}
                  onChange={(event) =>
                    setRoleDrawerState((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe the role responsibilities"
                  multiline
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "var(--text-subtitle-1)",
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    Permission Configurations
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "var(--text-title-3)",
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    Set the access level for each module and enable approval only
                    where it is required.
                  </p>
                </div>

                <div
                  style={{
                    border: "none",
                    borderRadius: "0",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={poReferenceTableHeaderRowStyle(
                      rolePermissionTableColumns
                    )}
                  >
                    <span
                      style={poReferenceTableHeaderCellStyle()}
                    >
                      Menu
                    </span>
                    <span
                      style={poReferenceTableHeaderCellStyle()}
                    >
                      Access Level
                    </span>
                    <span
                      style={poReferenceTableHeaderCellStyle({
                        justifyContent: "center",
                      })}
                    >
                      Approval
                    </span>
                  </div>

                  <div
                    style={{
                      background: "var(--neutral-surface-primary)",
                      maxHeight: "calc(100vh - 360px)",
                      overflow: "auto",
                    }}
                  >
                    {renderRolePermissionRows(ADMIN_PERMISSION_TREE)}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "16px 24px 24px",
                borderTop: "1px solid var(--neutral-line-separator-1)",
                background: "var(--neutral-surface-primary)",
                display: "flex",
                gap: "12px",
              }}
            >
              <Button
                variant="outlined"
                size="large"
                onClick={closeRoleDrawer}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                size="large"
                onClick={saveRoleDrawer}
                style={{ flex: 1 }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {groupModalState.open ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 13000,
          }}
        >
          <div
            style={{
              width: "760px",
              maxWidth: "calc(100vw - 32px)",
              maxHeight: "calc(100vh - 48px)",
              background: "var(--neutral-surface-primary)",
              borderRadius: "24px",
              padding: "24px 22px 22px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              boxShadow: "var(--elevation-sm)",
              position: "relative",
            }}
          >
            <IconButton
              icon={CloseIcon}
              size="large"
              onClick={closeGroupModal}
              style={{ position: "absolute", top: "16px", right: "16px" }}
              color="var(--neutral-on-surface-primary)"
            />
            <h2
              style={{
                margin: "8px 0 0 0",
                textAlign: "center",
                fontSize: "var(--text-headline)",
                fontWeight: "var(--font-weight-bold)",
              }}
            >
              {groupModalState.mode === "edit" ? "Edit Team" : "New Team"}
            </h2>
            <div
              style={{
                display: "grid",
                gap: "16px",
                overflow: "auto",
                paddingRight: "4px",
              }}
            >
              <InputField
                label="Team Name"
                value={groupModalState.name}
                onChange={(event) => {
                  setGroupModalState((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }));
                  if (groupModalErrors.name) {
                    setGroupModalErrors((prev) => ({ ...prev, name: "" }));
                  }
                }}
                placeholder="Enter team name"
                error={groupModalErrors.name}
              />
              <InputField
                label="Description"
                value={groupModalState.description}
                onChange={(event) =>
                  setGroupModalState((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Describe the team responsibility"
                multiline
              />

              <div style={{ display: "grid", gap: "12px" }}>
                <span
                  style={{
                    fontSize: "var(--text-title-3)",
                    color: "var(--neutral-on-surface-secondary)",
                  }}
                >
                  User Members
                </span>
                <UnifiedInputShell
                  style={{
                    height: "auto",
                    minHeight: 0,
                    display: "flex",
                    flexWrap: "wrap",
                    padding: "10px 12px",
                    gap: "8px",
                    alignItems: "flex-start",
                  }}
                >
                  {renderChipEditor(
                    groupModalState.members,
                    (member) =>
                      setGroupModalState((prev) => ({
                        ...prev,
                        members: prev.members.filter((item) => item !== member),
                      }))
                  )}
                  <DropdownSelect
                    value=""
                    onChange={(nextValue) =>
                      setGroupModalState((prev) => ({
                        ...prev,
                        members: Array.from(
                          new Set([...prev.members, nextValue])
                        ),
                      }))
                    }
                    options={userOptions.filter(
                      (option) => !groupModalState.members.includes(option.value)
                    )}
                    placeholder="Add user member"
                    disabled={
                      userOptions.filter(
                        (option) => !groupModalState.members.includes(option.value)
                      ).length === 0
                    }
                    borderless
                    fieldHeight="30px"
                    fontSize="var(--text-title-3)"
                    optionFontSize="var(--text-title-3)"
                    style={{ flex: 1, minWidth: "140px" }}
                    renderOption={(option) => (
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-start", textAlign: "left" }}>
                        <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                          {option.label}
                        </span>
                        {option.email && (
                          <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)" }}>
                            {option.email}
                          </span>
                        )}
                      </div>
                    )}
                  />
                </UnifiedInputShell>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                paddingTop: "20px",
                borderTop: "1px solid var(--neutral-line-separator-1)",
                marginTop: "4px",
                flexShrink: 0,
              }}
            >
              <Button
                variant="outlined"
                size="large"
                style={{ flex: 1 }}
                onClick={closeGroupModal}
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                size="large"
                style={{ flex: 1 }}
                onClick={saveGroupModal}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

const notificationChannelTabStyle = (isActive) => ({
  height: "40px",
  padding: "0 18px",
  borderRadius: "999px",
  border: `1px solid ${
    isActive
      ? "var(--feature-brand-primary)"
      : "var(--neutral-line-separator-1)"
  }`,
  background: isActive
    ? "var(--feature-brand-container-lighter)"
    : "var(--neutral-surface-primary)",
  color: isActive
    ? "var(--feature-brand-primary)"
    : "var(--neutral-on-surface-secondary)",
  fontSize: "var(--text-title-3)",
  fontWeight: isActive
    ? "var(--font-weight-bold)"
    : "var(--font-weight-regular)",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
});

const notificationSummaryCardStyle = {
  minHeight: "96px",
  padding: "18px 20px",
  borderRadius: "16px",
  border: "1px solid var(--neutral-line-separator-1)",
  background: "var(--neutral-surface-primary)",
  display: "flex",
  alignItems: "flex-start",
  gap: "14px",
  boxSizing: "border-box",
};

export { AdministrationUserManagement as UserManagementPage };
