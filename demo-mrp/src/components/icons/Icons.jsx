import React from "react";
import {
  Bell,
  Box,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  CreditCard,
  File,
  FileImage,
  FileText,
  HelpCircle,
  Info,
  LayoutGrid,
  List,
  Minus,
  MoreVertical,
  Pencil,
  Pickaxe,
  Plus,
  Route,
  Search,
  Settings,
  Trash2,
  Upload,
  Download,
  Wrench,
  X,
  User,
  Users,
  ShieldCheck,
  CheckCircle,
  XCircle,
  ShoppingCart,
  TrendingUp,
  CircleDollarSign,
} from "lucide-react";

import labamuMarkSrc from "../../labamu-mark.svg";
import labamuWordmarkSrc from "../../labamu-wordmark.svg";

const BrandLogoIcon = ({ size = 56, style = {}, title = "Labamu", ...props }) => (
  <img
    src={labamuMarkSrc}
    alt={title}
    style={{
      width: size,
      height: size,
      display: "block",
      flexShrink: 0,
      objectFit: "contain",
      ...style,
    }}
    {...props}
  />
);

const BrandLogoLockup = ({
  width = 172,
  style = {},
  title = "Labamu Manufacturing",
  ...props
}) => (
  <img
    src={labamuWordmarkSrc}
    alt={title}
    style={{
      width,
      height: "auto",
      display: "block",
      flexShrink: 0,
      objectFit: "contain",
      ...style,
    }}
    {...props}
  />
);

const SvgIconBase = ({
  size = 24,
  color = "currentColor",
  style = {},
  viewBox = "0 0 24 24",
  children,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "block", flexShrink: 0, ...style }}
    {...props}
  >
    {typeof children === "function" ? children({ color }) : children}
  </svg>
);

const DashboardIcon = ({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.8,
  style = {},
  ...props
}) => (
  <SvgIconBase size={size} color={color} style={style} {...props}>
    <rect
      x="4.25"
      y="9.1"
      width="3.15"
      height="9.15"
      rx="1.1"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <rect
      x="10.4"
      y="4.7"
      width="3.15"
      height="13.55"
      rx="1.1"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <rect
      x="16.55"
      y="11.75"
      width="3.15"
      height="6.5"
      rx="1.1"
      stroke={color}
      strokeWidth={strokeWidth}
    />
  </SvgIconBase>
);

const ProductIcon = ({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.8,
  style = {},
  ...props
}) => (
  <SvgIconBase size={size} color={color} style={style} {...props}>
    <path
      d="M18.3 3.69995H5.69995C4.59538 3.69995 3.69995 4.59538 3.69995 5.69995V18.3C3.69995 19.4045 4.59538 20.2999 5.69995 20.2999H18.3C19.4045 20.2999 20.2999 19.4045 20.2999 18.3V5.69995C20.2999 4.59538 19.4045 3.69995 18.3 3.69995Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
    <path
      d="M5.76001 16.03H7.85001"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.76001 18H7.85001"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.26 9.96995L12 8.53995L9.73999 9.96995V3.69995H14.26V9.96995Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIconBase>
);

const SalesIcon = ({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.8,
  style = {},
  ...props
}) => (
  <SvgIconBase size={size} color={color} style={style} {...props}>
    <path
      d="M12 15V18.75"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 13.5V18.75"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 10.5V18.75"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.5 5.25L13.0155 11.7345C12.9807 11.7694 12.9393 11.7971 12.8937 11.816C12.8482 11.8349 12.7993 11.8447 12.75 11.8447C12.7007 11.8447 12.6518 11.8349 12.6063 11.816C12.5607 11.7971 12.5193 11.7694 12.4845 11.7345L10.0155 9.2655C9.94518 9.1952 9.84981 9.1557 9.75037 9.1557C9.65094 9.1557 9.55557 9.1952 9.48525 9.2655L4.5 14.25"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 16.5V18.75"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 13.5V18.75"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIconBase>
);

const ResourcesIcon = ({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.8,
  style = {},
  ...props
}) => (
  <SvgIconBase size={size} color={color} style={style} {...props}>
    <path
      d="M7.65955 8.55288V3.85453C7.65955 3.34983 8.07249 2.93689 8.57719 2.93689H20.167C20.6718 2.93689 21.0847 3.34983 21.0847 3.85453V15.4444C21.0847 15.9491 20.6718 16.362 20.167 16.362H11.8165"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.7074 2.93689H12.0366V5.82747H16.7074V2.93689Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.7794 9.77612H11.1653V21.0632H2.91565V9.77612H5.29235"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.42139 8.81982H5.66846V10.7322H8.42139V8.81982Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.14099 13.208H8.94002"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.14099 15.8691H8.94002"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.14099 18.5396H8.94002"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIconBase>
);

const AnalyticsIcon = ({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.8,
  style = {},
  ...props
}) => (
  <SvgIconBase size={size} color={color} style={style} {...props}>
    <path
      d="M18.9171 12.0048C19.3417 12.0048 19.6901 11.6594 19.6478 11.2371C19.4705 9.47124 18.6879 7.821 17.4328 6.56618C16.1777 5.31136 14.5273 4.52918 12.7614 4.35224C12.3383 4.30994 11.9937 4.65837 11.9937 5.08296V11.2364C11.9937 11.4404 12.0748 11.636 12.219 11.7803C12.3632 11.9245 12.5589 12.0055 12.7629 12.0055L18.9171 12.0048Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.0787 14.9969C18.5894 16.1541 17.8241 17.1738 16.8496 17.9669C15.8751 18.76 14.7212 19.3023 13.4887 19.5464C12.2562 19.7905 10.9827 19.7289 9.77951 19.3672C8.57631 19.0054 7.48004 18.3544 6.58656 17.471C5.69308 16.5877 5.02959 15.4989 4.65409 14.3C4.2786 13.101 4.20253 11.8282 4.43254 10.593C4.66255 9.35786 5.19164 8.19782 5.97355 7.21436C6.75546 6.23089 7.76637 5.45393 8.91792 4.95142"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIconBase>
);

const ManufacturingIcon = Wrench;
const FinancingIcon = CreditCard;
const ProcurementIcon = ShoppingCart;
const WorkOrderIcon = Pickaxe;
const BillOfMaterialsIcon = FileText;
const RoutingIcon = Route;
const SearchIcon = Search;
const MoreVerticalIcon = MoreVertical;
const NotificationIcon = Bell;
const ChevronDownIcon = ChevronDown;
const ChevronLeftIcon = ChevronLeft;
const ChevronRightIcon = ChevronRight;
const ChevronUpIcon = ChevronUp;
const AddIcon = Plus;
const EditIcon = Pencil;
const DeleteIcon = Trash2;
const UserIcon = User;
const TeamIcon = Users;
const RoleIcon = ShieldCheck;
const UploadIcon = Upload;
const DownloadIcon = Download;
const DocumentIcon = FileText;
const FileIcon = File;
const ImageAssetIcon = FileImage;
const GridViewIcon = LayoutGrid;
const ListViewIcon = List;
const CalendarIcon = Calendar;
const UserGuideIcon = HelpCircle;
const CheckIcon = Check;
const CloseIcon = X;
const CopyIcon = Copy;

const NotificationCenterIcon = ({ kind = "system_updates", unread = false }) => {
  const iconMap = {
    approvals: CheckIcon,
    operations: RoutingIcon,
    documents: DocumentIcon,
    collaboration: NotificationIcon,
    system_updates: Settings,
  };
  const paletteMap = {
    approvals: {
      background: "rgba(0, 107, 255, 0.08)",
      color: "var(--feature-brand-primary)",
    },
    operations: {
      background: "rgba(255, 145, 0, 0.12)",
      color: "var(--status-orange-primary)",
    },
    documents: {
      background: "rgba(84, 167, 63, 0.12)",
      color: "var(--status-green-primary)",
    },
    collaboration: {
      background: "rgba(120, 42, 174, 0.12)",
      color: "var(--feature-product-primary)",
    },
    system_updates: {
      background: "rgba(126, 126, 126, 0.12)",
      color: "var(--neutral-on-surface-secondary)",
    },
  };

  const Icon = iconMap[kind] || Settings;
  const palette = paletteMap[kind] || paletteMap.system_updates;

  return (
    <div
      style={{
        width: "44px",
        height: "44px",
        borderRadius: "12px",
        border: "1px solid var(--neutral-line-separator-1)",
        background: "var(--neutral-surface-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "8px",
          background: palette.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={14} color={palette.color} />
      </div>
      {unread ? (
        <div
          style={{
            position: "absolute",
            top: "-2px",
            right: "-2px",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: "#FF5B5B",
            border: "2px solid var(--neutral-surface-primary)",
          }}
        />
      ) : null}
    </div>
  );
};

const CloudUploadIcon = ({
  size = 40,
  color = "currentColor",
  strokeWidth = 1.8,
  style = {},
  ...props
}) => (
  <SvgIconBase
    size={size}
    color={color}
    style={style}
    viewBox="0 0 40 40"
    {...props}
  >
    <path
      d="M8.2 30.5H28.8C33.2 30.5 36.8 26.9 36.8 22.5C36.8 18.2 33.4 14.7 29.2 14.5C28.2 9.8 24 6.3 19 6.3C13.6 6.3 9.1 10.4 8.6 15.7C4.8 16.3 2 19.6 2 23.5C2 27.4 5 30.5 8.2 30.5Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 23V13.6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path
      d="M14.8 17.8L19 13.6L23.2 17.8"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIconBase>
);

const CheckCircleIcon = CheckCircle;
const CanceledCircleIcon = XCircle;

export {
  Bell,
  Box,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  File,
  FileImage,
  FileText,
  HelpCircle,
  Info,
  LayoutGrid,
  List,
  Minus,
  MoreVertical,
  Pencil,
  Pickaxe,
  Plus,
  Route,
  Search,
  Settings,
  Trash2,
  Upload,
  Download,
  Wrench,
  X,
  User,
  Users,
  ShieldCheck,
  BrandLogoIcon,
  BrandLogoLockup,
  DashboardIcon,
  ProductIcon,
  SalesIcon,
  ResourcesIcon,
  AnalyticsIcon,
  ManufacturingIcon,
  ProcurementIcon,
  FinancingIcon,
  WorkOrderIcon,
  BillOfMaterialsIcon,
  RoutingIcon,
  SearchIcon,
  MoreVerticalIcon,
  NotificationIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  UserIcon,
  TeamIcon,
  RoleIcon,
  UploadIcon,
  DownloadIcon,
  DocumentIcon,
  FileIcon,
  ImageAssetIcon,
  GridViewIcon,
  ListViewIcon,
  CalendarIcon,
  UserGuideIcon,
  CheckIcon,
  CloseIcon,
  NotificationCenterIcon,
  CloudUploadIcon,
  CheckCircleIcon,
  CanceledCircleIcon,
  CopyIcon,
  ShoppingCart,
  TrendingUp,
  CircleDollarSign,
};
