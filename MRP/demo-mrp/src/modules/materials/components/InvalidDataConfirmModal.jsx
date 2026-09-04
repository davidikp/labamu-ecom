import React from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";

export const InvalidDataConfirmModal = ({ isOpen, onClose, onContinue, invalidCount }) => (
  <GeneralModal
    isOpen={isOpen}
    onClose={onClose}
    title={`${invalidCount} material${invalidCount > 1 ? "s" : ""} need${invalidCount > 1 ? "" : "s"} attention`}
    description="Some required information is missing. You can update these materials now or continue importing the materials that are ready."
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
            onContinue();
            onClose();
          }}
          style={{ flex: 1 }}
        >
          Import Ready Materials
        </Button>
      </>
    }
  />
);
