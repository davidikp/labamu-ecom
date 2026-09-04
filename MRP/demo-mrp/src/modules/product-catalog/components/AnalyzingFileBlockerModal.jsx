import React from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";

// Shown when the user tries to navigate to another module (via the sidebar)
// while a file is still being analyzed — see the navigation guard registered
// in BulkUploadNewPage. There's no "leave anyway" option: analysis is a quick
// simulated background step, not something worth abandoning mid-way.
export const AnalyzingFileBlockerModal = ({ isOpen, onClose }) => (
  <GeneralModal
    isOpen={isOpen}
    onClose={onClose}
    title="Your file is still being analyzed"
    description="This usually takes a few seconds. Stay on this page until your file is ready for mapping."
    width="560px"
    hideFooterDivider
    footerPaddingTop={24}
    footer={
      <Button variant="filled" size="large" onClick={onClose} style={{ flex: 1 }}>
        Stay on This Page
      </Button>
    }
  />
);
