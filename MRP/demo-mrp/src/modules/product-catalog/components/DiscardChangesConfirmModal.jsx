import React from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";

export const DiscardChangesConfirmModal = ({ isOpen, onClose, onConfirm }) => (
  <GeneralModal
    isOpen={isOpen}
    onClose={onClose}
    title="Discard changes?"
    description="Any changes you made on this page will be lost."
    width="560px"
    hideFooterDivider
    footerPaddingTop={24}
    footer={
      <>
        <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>
          Keep Editing
        </Button>
        <Button
          variant="filled"
          size="large"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          style={{ flex: 1 }}
        >
          Yes, Discard
        </Button>
      </>
    }
  />
);
