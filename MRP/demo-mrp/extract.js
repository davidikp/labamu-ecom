const fs = require('fs');

const content = fs.readFileSync('src/modules/purchase-order/pages/PurchaseOrderCreatePage.jsx', 'utf8');
const lines = content.split('\n');

// PhoneInputField is lines 170 to 419 (0-indexed 169 to 419)
const phoneLines = lines.slice(169, 419);
const phoneImports = `import React, { useState } from "react";
import { COUNTRY_CODE_OPTIONS } from "../../../constants/appConstants.js";
import { ChevronDownIcon } from "../../icons/Icons.jsx";
import { TableSearchField } from "../../table/TableSearchField.jsx";
import { FormField } from "./FormField.jsx";
import { UnifiedInputShell } from "../atoms/UnifiedInputShell.jsx";
import {
  baseInputBorderColor,
  blurInputFrame,
  focusInputFrame,
} from "../../../modules/purchase-order/styles/purchaseOrderInputStyles.js";

`;
fs.writeFileSync('src/components/molecules/PhoneInputField.jsx', phoneImports + phoneLines.join('\n') + '\n');

// DateInputControl is lines 421 to 867 (0-indexed 420 to 867)
const dateLines = lines.slice(420, 867);
const dateImports = `import React, { useState, useEffect, useRef } from "react";
import { DATE_PICKER_MONTHS, DATE_PICKER_POPOVER_WIDTH, DATE_PICKER_WEEKDAYS } from "../../../constants/appConstants.js";
import {
  buildCalendarDays,
  formatIsoDateString,
  parseIsoDateString,
} from "../../../utils/date/dateUtils.js";
import { createSyntheticInputEvent } from "../../../utils/upload/uploadUtils.js";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "../../icons/Icons.jsx";
import { baseInputBorderColor } from "../../../modules/purchase-order/styles/purchaseOrderInputStyles.js";

`;
fs.writeFileSync('src/components/molecules/DateInputControl.jsx', dateImports + dateLines.join('\n') + '\n');

// Now remove the extracted lines from PurchaseOrderCreatePage.jsx
const newLines = [...lines.slice(0, 169), ...lines.slice(867)];
fs.writeFileSync('src/modules/purchase-order/pages/PurchaseOrderCreatePage.jsx', newLines.join('\n'));
