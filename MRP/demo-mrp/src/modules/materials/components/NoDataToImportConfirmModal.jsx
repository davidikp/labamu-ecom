import React from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";

// Blocks the "Import Data" action entirely when the Review step has zero
// rows left (e.g. every row was deleted) — there's nothing to confirm
// importing, so this is a dead-end notice rather than a Cancel/Confirm pair.
export const NoDataToImportConfirmModal = ({ isOpen, onClose }) => (
  <GeneralModal
    isOpen={isOpen}
    onClose={onClose}
    title="No materials to import"
    description="There are no materials ready to import. Add or update your material data before continuing."
    width="560px"
    hideFooterDivider
    footerPaddingTop={24}
    footer={
      <Button variant="filled" size="large" onClick={onClose} style={{ flex: 1 }}>
        Back to Review
      </Button>
    }
  />
);
