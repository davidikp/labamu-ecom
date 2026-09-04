import React from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { DownloadIcon } from "../../../components/icons/Icons.jsx";

// Shown right after an analyze failure redirects the user back to the upload
// field. Two variants depending on what actually went wrong — both share the
// same "Download Template" (secondary) / "Back to Upload" (primary, just
// closes the modal) footer:
// - "error": analyzeFile() itself failed (unreadable file structure, timeout,
//   or the demo's "Simulate Timeout" control).
// - "empty": the file was read fine but contained no rows.
export const UseTemplateSuggestionModal = ({ isOpen, onClose, onDownloadTemplate, variant = "empty" }) => {
  const isError = variant === "error";
  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title={isError ? "Unable to analyze file" : "No data found"}
      description={
        isError
          ? "We couldn’t process your file. Try again, or use our template to prepare your data in the recommended format."
          : "We couldn’t find any data to process in your file. Add your data and try again, or use our template to get started."
      }
      width="560px"
      hideFooterDivider
      footerPaddingTop={24}
      footer={
        <>
          <Button
            variant="outlined"
            size="large"
            leftIcon={DownloadIcon}
            onClick={() => {
              onDownloadTemplate();
              onClose();
            }}
            style={{ flex: 1 }}
          >
            Download Template
          </Button>
          <Button variant="filled" size="large" onClick={onClose} style={{ flex: 1 }}>
            Back to Upload
          </Button>
        </>
      }
    />
  );
};
