with open("src/modules/purchase-order/pages/PurchaseOrderCreatePage.jsx", "r") as f:
    lines = f.readlines()

phone_lines = lines[169:419] # 170 to 419

phone_imports = """import React, { useState } from "react";
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

"""

with open("src/components/molecules/PhoneInputField.jsx", "w") as f:
    f.write(phone_imports + "".join(phone_lines))

date_lines = lines[420:868] # 421 to 868

date_imports = """import React, { useState, useEffect, useRef } from "react";
import { DATE_PICKER_MONTHS, DATE_PICKER_POPOVER_WIDTH, DATE_PICKER_WEEKDAYS } from "../../../constants/appConstants.js";
import {
  buildCalendarDays,
  formatIsoDateString,
  parseIsoDateString,
} from "../../../utils/date/dateUtils.js";
import { createSyntheticInputEvent } from "../../../utils/upload/uploadUtils.js";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "../../icons/Icons.jsx";
import { baseInputBorderColor } from "../../../modules/purchase-order/styles/purchaseOrderInputStyles.js";

"""

with open("src/components/molecules/DateInputControl.jsx", "w") as f:
    f.write(date_imports + "".join(date_lines))
